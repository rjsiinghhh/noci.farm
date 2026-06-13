#!/usr/bin/env node
/**
 * Reconcile succeeded Stripe PaymentIntents against the `orders` table and
 * backfill any that are missing — recovers orders lost while the webhook was
 * failing (307 redirect) AND the client-side POST /api/orders never ran
 * (e.g. the customer closed the tab right after paying).
 *
 * Safe by default: DRY RUN, and does NOT email customers.
 *
 * Usage (Node 24+, loads secrets from .env):
 *   node --env-file=.env scripts/reconcile-stripe-orders.mjs            # dry run, last 90 days
 *   node --env-file=.env scripts/reconcile-stripe-orders.mjs --since=2026-05-01
 *   node --env-file=.env scripts/reconcile-stripe-orders.mjs --apply    # actually insert missing orders
 *   node --env-file=.env scripts/reconcile-stripe-orders.mjs --apply --send-email   # also email customers (use with care)
 */
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const SEND_EMAIL = args.includes('--send-email');
// --historical: backfill old orders that predate the orders table. Preserves the
// original Stripe date, marks them 'delivered' (terminal), and sets
// feedback_sent_at so the auto-deliver cron never emails these customers.
const HISTORICAL = args.includes('--historical');
const sinceArg = args.find(a => a.startsWith('--since='));
const statusArg = args.find(a => a.startsWith('--status='));
const STATUS = statusArg ? statusArg.split('=')[1] : HISTORICAL ? 'delivered' : 'paid';
const DATE_FROM_STRIPE = HISTORICAL || args.includes('--date-from-stripe');
const SUPPRESS_FEEDBACK = HISTORICAL || args.includes('--suppress-feedback');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const since = sinceArg
  ? Math.floor(new Date(sinceArg.split('=')[1]).getTime() / 1000)
  : Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);

const generateOrderId = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const r = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `ORD-${y}-${m}${day}-${r}`;
};

const parseJson = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const buildOrderData = pi => {
  const md = pi.metadata || {};
  const parsedItems = parseJson(md.items, []);
  const shippingAddress = parseJson(md.shippingAddress, {});
  const createdIso = new Date(pi.created * 1000).toISOString();
  const orderDate = DATE_FROM_STRIPE ? new Date(pi.created * 1000) : new Date();

  const data = {
    order_number: generateOrderId(orderDate),
    stripe_payment_intent_id: pi.id,
    customer_name: md.customerName || 'Customer',
    customer_email: md.customerEmail || '',
    customer_address: {
      address: shippingAddress?.line1 || '',
      city: shippingAddress?.city || '',
      state: shippingAddress?.state || '',
      zipCode: shippingAddress?.postal_code || '',
    },
    items: Array.isArray(parsedItems) ? parsedItems : [],
    subtotal: parseFloat(md.subtotal || '0'),
    shipping: parseFloat(md.shipping || '0'),
    total_amount: parseFloat(md.total || '0'),
    status: STATUS,
  };

  // Historical backfill: preserve the real order date and neutralise automation.
  if (DATE_FROM_STRIPE) {
    data.created_at = createdIso;
    data.updated_at = createdIso;
  }
  if (SUPPRESS_FEEDBACK) {
    data.feedback_sent_at = createdIso;
  }
  if (STATUS === 'delivered' || STATUS === 'received') {
    data.delivered_at = createdIso;
  }
  return data;
};

const stats = {
  scanned: 0,
  succeeded: 0,
  alreadyHadOrder: 0,
  missing: 0,
  backfilled: 0,
  skippedNoMetadata: 0,
  errors: 0,
};
const missingList = [];

console.log(
  `Reconciling succeeded PaymentIntents since ${new Date(since * 1000).toISOString()} ` +
    `— mode: ${APPLY ? 'APPLY' : 'DRY RUN'}` +
    `${HISTORICAL ? ' [historical]' : ''} status=${STATUS}` +
    `${DATE_FROM_STRIPE ? ' date=stripe' : ''}` +
    `${SUPPRESS_FEEDBACK ? ' feedback=suppressed' : ''}` +
    `${SEND_EMAIL ? ' +email' : ''}\n`,
);

let sendOrderConfirmationEmail = null;
if (SEND_EMAIL) {
  ({ sendOrderConfirmationEmail } = await import('../lib/email-service.js'));
}

for await (const pi of stripe.paymentIntents.list({
  created: { gte: since },
  limit: 100,
})) {
  stats.scanned += 1;
  if (pi.status !== 'succeeded') continue;
  stats.succeeded += 1;

  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', pi.id)
    .maybeSingle();

  if (existing) {
    stats.alreadyHadOrder += 1;
    continue;
  }

  stats.missing += 1;
  const orderData = buildOrderData(pi);
  missingList.push({
    pi: pi.id,
    email: orderData.customer_email,
    total: orderData.total_amount,
    created: new Date(pi.created * 1000).toISOString(),
  });

  if (!orderData.customer_email && (!orderData.items || orderData.items.length === 0)) {
    stats.skippedNoMetadata += 1;
    console.warn(`  ! ${pi.id} has no usable metadata — skipping backfill`);
    continue;
  }

  if (!APPLY) continue;

  const { data: saved, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      stats.alreadyHadOrder += 1; // created concurrently — fine
      stats.missing -= 1;
      continue;
    }
    stats.errors += 1;
    console.error(`  ✗ ${pi.id} insert failed: ${error.message}`);
    continue;
  }

  stats.backfilled += 1;
  console.log(`  ✓ backfilled ${pi.id} -> ${saved.order_number}`);

  if (SEND_EMAIL && sendOrderConfirmationEmail) {
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
    } catch (e) {
      console.error(`  ! email failed for ${saved.order_number}: ${e.message}`);
    }
  }
}

console.log('\n--- Summary ---');
console.table(stats);
if (missingList.length) {
  console.log('\nMissing PaymentIntents:');
  console.table(missingList);
}
if (!APPLY && stats.missing > 0) {
  console.log('\nRe-run with --apply to backfill the missing orders.');
}
