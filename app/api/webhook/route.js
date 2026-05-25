import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/email-service';

const generateOrderId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `ORD-${year}-${month}${day}-${random}`;
};

const parseJsonMetadata = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const ensureOrderFromPaymentIntent = async paymentIntent => {
  const supabase = createSupabaseServerClient();

  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .maybeSingle();

  if (existingOrder) {
    return;
  }

  const metadata = paymentIntent.metadata || {};
  const parsedItems = parseJsonMetadata(metadata.items, []);
  const shippingAddress = parseJsonMetadata(metadata.shippingAddress, {});

  const customerInfo = {
    name: metadata.customerName || 'Customer',
    email: metadata.customerEmail || '',
    address: shippingAddress?.line1 || '',
    city: shippingAddress?.city || '',
    state: shippingAddress?.state || '',
    zipCode: shippingAddress?.postal_code || '',
  };

  const orderData = {
    order_number: generateOrderId(),
    stripe_payment_intent_id: paymentIntent.id,
    customer_name: customerInfo.name,
    customer_email: customerInfo.email,
    customer_address: {
      address: customerInfo.address,
      city: customerInfo.city,
      state: customerInfo.state,
      zipCode: customerInfo.zipCode,
    },
    items: Array.isArray(parsedItems) ? parsedItems : [],
    subtotal: parseFloat(metadata.subtotal || '0'),
    shipping: parseFloat(metadata.shipping || '0'),
    total_amount: parseFloat(metadata.total || '0'),
    status: 'paid',
  };

  const { data: savedOrder, error: insertError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to persist webhook order: ${insertError.message}`);
  }

  try {
    await sendOrderConfirmationEmail({
      orderNumber: savedOrder.order_number,
      orderDate: savedOrder.created_at,
      customerInfo,
      items: orderData.items,
      totalAmount: savedOrder.total_amount,
      shippingAddress: {
        name: customerInfo.name,
        line1: customerInfo.address,
        city: customerInfo.city,
        state: customerInfo.state,
        postal_code: customerInfo.zipCode,
        country: 'US',
      },
    });
  } catch (emailError) {
    console.error('Webhook order email failed:', emailError);
  }
};

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        {
          const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
          await ensureOrderFromPaymentIntent(paymentIntent);
        break;
        }

      case 'payment_intent.payment_failed':
        {
          const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        break;
        }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
