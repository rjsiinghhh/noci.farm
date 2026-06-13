import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';

// Strip characters that have meaning in a PostgREST `.or()`/ilike filter so a
// search term can't break out of the intended filter (filter injection).
const sanitizeSearchTerm = value =>
  String(value).replace(/[,()*\\%]/g, ' ').trim();

export async function GET(request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = sanitizeSearchTerm(searchParams.get('search') || '');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = createSupabaseServerClient();
    let query = supabase.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false });

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply search filter
    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`
      );
    }

    // Apply pagination
    query = query.range(from, to);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    const totalPages = count ? Math.ceil(count / limit) : 1;
    const hasMore = page < totalPages;

    return NextResponse.json({ 
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore
      }
    });
  } catch (error) {
    console.error('Error in admin orders API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}



