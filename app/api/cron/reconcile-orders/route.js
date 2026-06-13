import { NextResponse } from 'next/server';
import { reconcileRecentOrders } from '@/lib/order-reconcile';

export async function GET(request) {
  try {
    // Same auth pattern as the auto-deliver cron: require the CRON_SECRET bearer
    // token when configured (Vercel Cron sends it automatically).
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await reconcileRecentOrders();

    return NextResponse.json({
      success: true,
      ...result,
      message: `Scanned ${result.scanned} PaymentIntents, recovered ${result.backfilled} missing order(s), ${result.errors} errors`,
    });
  } catch (error) {
    console.error('Error in reconcile-orders cron:', error);
    return NextResponse.json(
      { error: 'Failed to reconcile orders' },
      { status: 500 },
    );
  }
}
