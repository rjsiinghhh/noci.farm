import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Fetch payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Try to fetch order number from Supabase
    let orderNumber = null;
    try {
      const supabase = createSupabaseServerClient();
      const { data: orderData, error: dbError } = await supabase
        .from('orders')
        .select('order_number')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (!dbError && orderData) {
        orderNumber = orderData.order_number;
      }
    } catch (error) {
      console.error('Error fetching order number from database:', error);
      // Continue without order number if database fetch fails
    }

    // Extract order data from Stripe metadata
    const metadata = paymentIntent.metadata;

    // Parse items from metadata
    let items = [];
    try {
      items = JSON.parse(metadata.items || '[]');
    } catch (error) {
      console.error('Error parsing items from metadata:', error);
      items = [];
    }

    // Get shipping address from metadata
    let shippingAddress = null;
    try {
      const parsedAddress = JSON.parse(metadata.shippingAddress || '{}');
      // Only use shipping address if it has actual data
      if (
        parsedAddress &&
        Object.keys(parsedAddress).length > 0 &&
        parsedAddress.line1
      ) {
        shippingAddress = parsedAddress;
      } else {
        shippingAddress = null;
      }
    } catch (error) {
      console.error('Error parsing shipping address from metadata:', error);
      shippingAddress = null;
    }

    // Construct order object from Stripe data
    const order = {
      paymentIntentId: paymentIntent.id,
      orderNumber: orderNumber,
      status: paymentIntent.status,
      created: paymentIntent.created,
      customerName: metadata.customerName || 'Customer',
      customerEmail: metadata.customerEmail || '',
      customerInfo: {
        name: metadata.customerName || 'Customer',
        email: metadata.customerEmail || '',
        address: shippingAddress?.line1 || '',
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || '',
        zipCode: shippingAddress?.postal_code || '',
      },
      shippingAddress: shippingAddress,
      items: items,
      subtotal: parseFloat(metadata.subtotal || '0'),
      shipping: parseFloat(metadata.shipping || '0'),
      total: parseFloat(metadata.total || '0'),
      amount: paymentIntent.amount / 100, // Convert from cents
    };

    console.log('Order data extracted from Stripe:', order);

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error retrieving order from Stripe:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve order from Stripe' },
      { status: 500 }
    );
  }
}
