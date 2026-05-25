import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { generateFeedbackToken } from '@/lib/feedback-token';
import { sendFeedbackRequestEmail } from '@/lib/email-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const email = searchParams.get('email');

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Order number and email are required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .eq('customer_email', email)
      .single();

    if (error || !orders) {
      return NextResponse.json(
        { error: 'Order not found. Please check your order number and email.' },
        { status: 404 }
      );
    }

    // Format order for response
    const order = {
      id: orders.id,
      order_number: orders.order_number,
      customer_email: orders.customer_email,
      customer_name: orders.customer_name,
      items: orders.items,
      subtotal: parseFloat(orders.subtotal),
      shipping: parseFloat(orders.shipping),
      total_amount: parseFloat(orders.total_amount),
      status: orders.status,
      tracking_number: orders.tracking_number,
      created_at: orders.created_at,
    };

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error in track order API:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve order' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { orderNumber, email } = await request.json();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Order number and email are required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .eq('customer_email', email)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is shipped or delivered
    if (order.status !== 'shipped' && order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Order must be shipped or delivered before marking as received' },
        { status: 400 }
      );
    }

    // Check if feedback already exists for this order
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id, created_at')
      .eq('order_number', orderNumber)
      .single();

    // Update order status to received
    const updateData = {
      status: 'received',
      delivered_at: order.delivered_at || new Date().toISOString(),
    };

    // Set feedback_sent_at if not already set and feedback doesn't exist
    if (!order.feedback_sent_at && !existingReview) {
      updateData.feedback_sent_at = new Date().toISOString();
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // If feedback already exists, return early with feedbackExists flag
    if (existingReview) {
      return NextResponse.json({
        success: true,
        feedbackExists: true,
        feedbackSubmittedAt: existingReview.created_at,
        order: updatedOrder,
      });
    }

    // Generate feedback token only if feedback doesn't exist
    const token = generateFeedbackToken(order.id, order.order_number);

    // Send feedback email only if feedback doesn't exist
    try {
      await sendFeedbackRequestEmail({
        orderNumber: order.order_number,
        customerEmail: order.customer_email,
        customerName: order.customer_name,
        token,
      });
    } catch (emailError) {
      console.error('Error sending feedback email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      feedbackExists: false,
      token,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error in mark received API:', error);
    return NextResponse.json(
      { error: 'Failed to mark order as received' },
      { status: 500 }
    );
  }
}

