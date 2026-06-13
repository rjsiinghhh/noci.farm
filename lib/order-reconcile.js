import { stripe } from '@/lib/stripe-server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/email-service';

// Safety net for the dual-path order flow: if a charge succeeds but neither the
// webhook nor the client POST /api/orders manages to persist the order, it would
// otherwise be silently lost (recoverable only via the manual reconcile script).
// This module backfills any succeeded PaymentIntent that has no matching order,
// and is invoked on a schedule by /api/cron/reconcile-orders.

const generateOrderId = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `ORD-${year}-${month}${day}-${random}`;
};

const parseJson = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const buildOrderData = paymentIntent => {
  const metadata = paymentIntent.metadata || {};
  const parsedItems = parseJson(metadata.items, []);
  const shippingAddress = parseJson(metadata.shippingAddress, {});

  return {
    order_number: generateOrderId(),
    stripe_payment_intent_id: paymentIntent.id,
    customer_name: metadata.customerName || 'Customer',
    customer_email: metadata.customerEmail || '',
    customer_address: {
      address: shippingAddress?.line1 || '',
      city: shippingAddress?.city || '',
      state: shippingAddress?.state || '',
      zipCode: shippingAddress?.postal_code || '',
    },
    items: Array.isArray(parsedItems) ? parsedItems : [],
    subtotal: parseFloat(metadata.subtotal || '0'),
    shipping: parseFloat(metadata.shipping || '0'),
    total_amount: parseFloat(metadata.total || '0'),
    status: 'paid',
  };
};

export const reconcileRecentOrders = async ({
  sinceMs = 7 * 24 * 60 * 60 * 1000,
  sendEmail = true,
} = {}) => {
  const supabase = createSupabaseServerClient();
  const since = Math.floor((Date.now() - sinceMs) / 1000);
  const stats = {
    scanned: 0,
    succeeded: 0,
    alreadyHadOrder: 0,
    backfilled: 0,
    skippedNoMetadata: 0,
    errors: 0,
  };
  const backfilled = [];

  for await (const paymentIntent of stripe.paymentIntents.list({
    created: { gte: since },
    limit: 100,
  })) {
    stats.scanned += 1;
    if (paymentIntent.status !== 'succeeded') continue;
    stats.succeeded += 1;

    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .maybeSingle();

    if (existing) {
      stats.alreadyHadOrder += 1;
      continue;
    }

    const orderData = buildOrderData(paymentIntent);
    if (!orderData.customer_email && orderData.items.length === 0) {
      stats.skippedNoMetadata += 1;
      continue;
    }

    const { data: saved, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      // 23505 = created concurrently by the webhook/client path — not a loss.
      if (error.code === '23505') {
        stats.alreadyHadOrder += 1;
        continue;
      }
      stats.errors += 1;
      console.error(
        `[ORDER_RECONCILE] insert failed for ${paymentIntent.id}: ${error.message}`,
      );
      continue;
    }

    stats.backfilled += 1;
    backfilled.push({ paymentIntentId: paymentIntent.id, orderNumber: saved.order_number });

    if (sendEmail && orderData.customer_email) {
      try {
        await sendOrderConfirmationEmail({
          orderNumber: saved.order_number,
          orderDate: saved.created_at,
          customerInfo: {
            name: orderData.customer_name,
            email: orderData.customer_email,
            address: orderData.customer_address.address,
            city: orderData.customer_address.city,
            state: orderData.customer_address.state,
            zipCode: orderData.customer_address.zipCode,
          },
          items: orderData.items,
          totalAmount: saved.total_amount,
          shippingAddress: {
            name: orderData.customer_name,
            line1: orderData.customer_address.address,
            city: orderData.customer_address.city,
            state: orderData.customer_address.state,
            postal_code: orderData.customer_address.zipCode,
            country: 'US',
          },
        });
      } catch (emailError) {
        console.error(
          `[ORDER_RECONCILE] email failed for ${saved.order_number}: ${emailError.message}`,
        );
      }
    }
  }

  if (stats.backfilled > 0) {
    console.error(
      `[ORDER_RECONCILE] recovered ${stats.backfilled} charged-but-missing order(s):`,
      backfilled,
    );
  }

  return { ...stats, backfilled };
};
