import { NextResponse } from 'next/server';
import { autoDeliverOrders } from '@/lib/auto-deliver';

export async function GET(request) {
  try {
    // Optional: Add authentication/authorization check here
    // For example, check for a secret header or API key
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await autoDeliverOrders();

    return NextResponse.json({
      success: true,
      ...result,
      message: `Processed ${result.processed} orders, sent ${result.feedbackSent} feedback emails, ${result.errors} errors`,
    });
  } catch (error) {
    console.error('Error in auto-deliver cron:', error);
    return NextResponse.json(
      { error: 'Failed to process auto-delivery' },
      { status: 500 }
    );
  }
}



