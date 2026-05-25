import { createSupabaseServerClient } from './supabase';
import { generateFeedbackToken } from './feedback-token';
import { sendFeedbackRequestEmail } from './email-service';

/**
 * Automatically send feedback emails for shipped orders that are 11+ days old.
 * Only sends if feedback hasn't been sent yet and user hasn't already submitted feedback.
 * @returns {Promise<{processed: number, errors: number, feedbackSent: number}>}
 */
export async function autoDeliverOrders() {
  const supabase = createSupabaseServerClient();
  const elevenDaysAgo = new Date();
  elevenDaysAgo.setDate(elevenDaysAgo.getDate() - 11);

  try {
    let processed = 0;
    let errors = 0;
    let feedbackSent = 0;

    // Find orders with status 'shipped' that are 11+ days old
    // Use updated_at to determine when order was shipped (when status changed to 'shipped')
    const { data: shippedOrders, error: shippedFetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'shipped')
      .lt('updated_at', elevenDaysAgo.toISOString())
      .is('feedback_sent_at', null);

    if (shippedFetchError) {
      console.error('Error fetching shipped orders for auto-feedback:', shippedFetchError);
      throw shippedFetchError;
    }

    if (shippedOrders && shippedOrders.length > 0) {
      for (const order of shippedOrders) {
        try {
          // Check if feedback already exists for this order
          const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('order_number', order.order_number)
            .single();

          // Skip if feedback already exists (user already submitted feedback)
          if (existingReview) {
            console.log(`Skipping order ${order.order_number} - feedback already exists`);
            continue;
          }

          // Generate feedback token
          const token = generateFeedbackToken(order.id, order.order_number);

          // Send feedback email
          try {
            await sendFeedbackRequestEmail({
              orderNumber: order.order_number,
              customerEmail: order.customer_email,
              customerName: order.customer_name,
              token,
            });

            // Mark feedback as sent
            await supabase
              .from('orders')
              .update({ feedback_sent_at: new Date().toISOString() })
              .eq('id', order.id);

            feedbackSent++;
            processed++;
            console.log(`Feedback email sent for order ${order.order_number} (11 days after shipping)`);
          } catch (emailError) {
            console.error(`Error sending feedback email for order ${order.order_number}:`, emailError);
            // Don't count email errors as failures, but mark as processed
            processed++;
          }
        } catch (error) {
          console.error(`Error processing order ${order.order_number}:`, error);
          errors++;
        }
      }
    }

    return { processed, errors, feedbackSent };
  } catch (error) {
    console.error('Error in autoDeliverOrders:', error);
    throw error;
  }
}

