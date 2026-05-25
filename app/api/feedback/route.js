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

export async function POST(request) {
  try {
    const { orderNumber, token, productRatings, overallFeedback } =
      await request.json();

    if (!orderNumber || !token || !productRatings) {
      return NextResponse.json(
        { error: 'Order number, token, and product ratings are required' },
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

    const supabase = createSupabaseServerClient();

    // Check if feedback already exists
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

    // Get order to get order_id
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Save feedback
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        order_id: order.id,
        order_number: orderNumber,
        product_ratings: productRatings,
        overall_feedback: overallFeedback || null,
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Error saving review:', reviewError);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('Error in feedback API:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}





