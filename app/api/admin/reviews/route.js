import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-auth';

// Neutralize PostgREST `.or()`/ilike filter metacharacters (filter injection).
const sanitizeSearchTerm = value =>
  String(value).replace(/[,()*\\%]/g, ' ').trim();

export async function GET(request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const search = sanitizeSearchTerm(searchParams.get('search') || '');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = createSupabaseServerClient();
    
    // First, get order numbers that match the search if search is provided
    let orderNumbersToFilter = null;
    if (search) {
      // Search orders by customer name or order number
      const { data: matchingOrders, error: ordersSearchError } = await supabase
        .from('orders')
        .select('order_number')
        .or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`);

      if (ordersSearchError) {
        console.error('Error searching orders:', ordersSearchError);
      } else if (matchingOrders && matchingOrders.length > 0) {
        orderNumbersToFilter = matchingOrders.map(order => order.order_number);
      } else {
        // No matching orders found, return empty result
        return NextResponse.json({ 
          reviews: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 1,
            hasMore: false
          }
        });
      }
    }

    // Fetch reviews with pagination
    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter by order number if we have matching orders
    if (orderNumbersToFilter && orderNumbersToFilter.length > 0) {
      query = query.in('order_number', orderNumbersToFilter);
    } else if (search && !orderNumbersToFilter) {
      // If search exists but no matching orders, return empty
      return NextResponse.json({ 
        reviews: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 1,
          hasMore: false
        }
      });
    }

    // Apply pagination
    query = query.range(from, to);

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ 
        reviews: [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: count ? Math.ceil(count / limit) : 1,
          hasMore: false
        }
      });
    }

    // Fetch order details for all reviews by order_number
    const orderNumbers = reviews.map(review => review.order_number).filter(Boolean);
    
    // Fetch orders by order_number
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, total_amount, items')
      .in('order_number', orderNumbers);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      // Continue even if orders fetch fails
    }

    // Create a map of orders by order_number for quick lookup
    const ordersMap = new Map();
    (orders || []).forEach(order => {
      ordersMap.set(order.order_number, order);
    });

    // Merge review data with order data
    const reviewsWithOrderData = reviews.map(review => {
      const order = ordersMap.get(review.order_number);
      return {
        ...review,
        customer_name: order?.customer_name || null,
        total_amount: order?.total_amount || null,
        order_items: order?.items || [],
      };
    });

    const totalPages = count ? Math.ceil(count / limit) : 1;
    const hasMore = page < totalPages;

    return NextResponse.json({ 
      reviews: reviewsWithOrderData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore
      }
    });
  } catch (error) {
    console.error('Error in admin reviews API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}



