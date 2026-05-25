import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function GET(request, { params }) {
  try {
    const { orderId } = await params;

    const supabase = createSupabaseServerClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error in admin order detail API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { orderId } = await params;
    const { status, tracking_number } = await request.json();

    const supabase = createSupabaseServerClient();

    // Get current order to check previous status and if feedback was already sent
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !currentOrder) {
      console.error('Error fetching order:', fetchError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
    }
    if (tracking_number !== undefined) {
      updateData.tracking_number = tracking_number || null;
    }

    // If status is being changed to 'delivered' or 'received', set delivered_at
    if (status === 'delivered' || status === 'received') {
      if (!currentOrder.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
      }
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // Note: Feedback emails are now sent automatically on the 11th day after shipping
    // Admin marking as delivered no longer triggers immediate email sending

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error in admin order update API:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}



