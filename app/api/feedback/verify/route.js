import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { verifyFeedbackToken } from '@/lib/feedback-token';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const token = searchParams.get('token');

    if (!orderNumber || !token) {
      return NextResponse.json(
        { error: 'Order number and token are required' },
        { status: 400 }
      );
    }

    // Verify token
    const tokenData = verifyFeedbackToken(token);
    if (!tokenData || tokenData.orderNumber !== orderNumber) {
      return NextResponse.json(
        { error: 'Invalid or expired feedback token' },
        { status: 401 }
      );
    }

    // Check if feedback already exists
    const supabase = createSupabaseServerClient();
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('order_number', orderNumber)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: 'Feedback has already been submitted for this order' },
        { status: 400 }
      );
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, items, order_number')
      .eq('order_number', orderNumber)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error in feedback verify API:', error);
    return NextResponse.json(
      { error: 'Failed to verify feedback link' },
      { status: 500 }
    );
  }
}



