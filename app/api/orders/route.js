import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/email-service';
import { SHIPPING_CONFIG } from '@/lib/stripe';
import {
  CartValidationError,
  calculateCartTotals,
  normalizeIncomingItems,
  validatePaymentIntentForOrder,
} from '@/lib/cart-validation';
import { STANDARD_SIZE } from '@/data/products';
import { stripe } from '@/lib/stripe-server';

// Generate order ID
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

export async function POST(request) {
  try {
    console.log('Creating new order...');

    const { customerInfo, items, stripePaymentIntentId } = await request.json();

    if (!stripePaymentIntentId) {
      throw new CartValidationError('Stripe payment intent is required');
    }

    const normalizedItems = normalizeIncomingItems(items);

    console.log('Order data received:', {
      customerInfo,
      itemsCount: normalizedItems.length,
      stripePaymentIntentId,
    });

    const { subtotal, shipping, total: computedTotal } = calculateCartTotals(
      normalizedItems,
      SHIPPING_CONFIG,
    );

    const paymentIntent = await stripe.paymentIntents.retrieve(
      stripePaymentIntentId,
    );

    validatePaymentIntentForOrder({
      paymentIntent,
      expectedTotal: computedTotal,
      customerEmail: customerInfo?.email,
    });

    const supabase = createSupabaseServerClient();
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent_id', stripePaymentIntentId)
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        order: {
          id: existingOrder.id,
          orderNumber: existingOrder.order_number,
          customerInfo: {
            name: existingOrder.customer_name,
            email: existingOrder.customer_email,
            address: existingOrder.customer_address?.address,
            city: existingOrder.customer_address?.city,
            state: existingOrder.customer_address?.state,
            zipCode: existingOrder.customer_address?.zipCode,
          },
          items: existingOrder.items,
          totalAmount: existingOrder.total_amount,
          status: existingOrder.status,
          stripePaymentIntentId: existingOrder.stripe_payment_intent_id,
          createdAt: existingOrder.created_at,
          trackingNumber: existingOrder.tracking_number || null,
        },
      });
    }

    const orderNumber = generateOrderId();

    // Prepare order data for Supabase
    const orderData = {
      order_number: orderNumber,
      stripe_payment_intent_id: stripePaymentIntentId,
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_address: {
        address: customerInfo.address,
        city: customerInfo.city,
        state: customerInfo.state,
        zipCode: customerInfo.zipCode,
      },
      items: normalizedItems.map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        size: item.size || STANDARD_SIZE,
        quantity: item.quantity,
        price: item.price,
        type: item.type || 'regular',
        contents: item.contents || undefined,
        customSelection: item.customSelection || undefined,
        selectionDetails: item.selectionDetails || undefined,
        isFreeItem: item.isFreeItem || false,
        linkedToProduct: item.linkedToProduct || undefined,
      })),
      subtotal: subtotal,
      shipping: shipping,
      total_amount: computedTotal,
      status: 'paid',
    };

    console.log('Saving order to Supabase:', orderData);

    // Save to Supabase
    const { data: savedOrder, error: dbError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (dbError) {
      console.error('Error saving order to Supabase:', dbError);
      throw new Error(`Failed to save order: ${dbError.message}`);
    }

    console.log('Order saved successfully to Supabase:', savedOrder);

    // Format order for response (matching old format for compatibility)
    const newOrder = {
      id: savedOrder.id,
      orderNumber: savedOrder.order_number,
      customerInfo,
      items: normalizedItems,
      totalAmount: savedOrder.total_amount,
      status: savedOrder.status,
      stripePaymentIntentId: savedOrder.stripe_payment_intent_id,
      createdAt: savedOrder.created_at,
      trackingNumber: savedOrder.tracking_number || null,
    };

    // Send order confirmation email
    try {
      console.log('Sending order confirmation email...');
      await sendOrderConfirmationEmail({
        orderNumber: newOrder.orderNumber,
        orderDate: newOrder.createdAt,
        customerInfo: newOrder.customerInfo,
        items: newOrder.items,
        totalAmount: newOrder.totalAmount,
        shippingAddress: {
          name: newOrder.customerInfo.name,
          line1: newOrder.customerInfo.address,
          city: newOrder.customerInfo.city,
          state: newOrder.customerInfo.state,
          postal_code: newOrder.customerInfo.zipCode,
          country: 'US',
        },
      });
      console.log('Order confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
      // The order is still valid, just email delivery failed
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof CartValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const orderNumber = searchParams.get('orderNumber');
    const email = searchParams.get('email');

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { error: 'Order ID or Order Number is required' },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();
    let query = supabase.from('orders').select('*');

    if (orderNumber) {
      query = query.eq('order_number', orderNumber);
    } else {
      query = query.eq('id', orderId);
    }

    const { data: orders, error: dbError } = await query;

    if (dbError) {
      console.error('Error retrieving order from Supabase:', dbError);
      return NextResponse.json(
        { error: 'Failed to retrieve order' },
        { status: 500 },
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // If email is provided, verify it matches
    if (email && order.customer_email !== email) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Format order for response (matching old format for compatibility)
    const formattedOrder = {
      id: order.id,
      orderNumber: order.order_number,
      customerInfo: {
        name: order.customer_name,
        email: order.customer_email,
        address: order.customer_address.address,
        city: order.customer_address.city,
        state: order.customer_address.state,
        zipCode: order.customer_address.zipCode,
      },
      items: order.items,
      totalAmount: parseFloat(order.total_amount),
      status: order.status,
      stripePaymentIntentId: order.stripe_payment_intent_id,
      createdAt: order.created_at,
      trackingNumber: order.tracking_number,
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error('Error retrieving order:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve order' },
      { status: 500 },
    );
  }
}
