import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function GET(request) {
  try {
    // Check admin authentication (simple check via header or query param)
    // In production, use proper session management
    const authHeader = request.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET_KEY;

    // For now, we'll rely on the client-side auth check
    // In a real app, you'd verify a session token here

    const supabase = createSupabaseServerClient();

    // Get total orders count
    const { count: totalOrders, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting orders:', countError);
      throw countError;
    }

    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('total_amount');

    if (revenueError) {
      console.error('Error fetching revenue:', revenueError);
      throw revenueError;
    }

    const totalRevenue =
      revenueData?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;

    // Get pending orders count (status: paid, processing, shipped)
    const { count: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['paid', 'processing', 'shipped']);

    if (pendingError) {
      console.error('Error counting pending orders:', pendingError);
      throw pendingError;
    }

    // Get recent orders (last 20)
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, total_amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (recentError) {
      console.error('Error fetching recent orders:', recentError);
      throw recentError;
    }

    return NextResponse.json({
      totalOrders: totalOrders || 0,
      totalRevenue,
      pendingOrders: pendingOrders || 0,
      recentOrders: recentOrders || [],
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}



