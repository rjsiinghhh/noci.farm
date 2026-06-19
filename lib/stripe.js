import { DEFAULT_SIZE, SIZE_2_5_OZ, SIZE_4_OZ } from '@/data/products';

// Client-side Stripe instance
export const getStripe = async () => {
  const { loadStripe } = await import('@stripe/stripe-js');
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

// ⚠️  STRIPE SETUP REQUIRED FOR FRUIT PIVOT
// For each fruit product below, go to your Stripe Dashboard → Products, create a new
// product, then paste the resulting product ID and price ID here.
// Until these are filled in, checkout will not process correctly for new products.

export const STRIPE_PRODUCTS = {
  STRAWBERRIES: '',          // TODO: create in Stripe dashboard → paste prod_xxx here
  BLUEBERRIES: '',           // TODO
  AVOCADOS: '',              // TODO
  APPLES: '',                // TODO
  TOMATOES: '',              // TODO
  ORANGES: '',               // TODO
  SEASONAL_PRODUCE_BOX: '',  // TODO
  CUSTOM_PRODUCE_BOX: '',    // TODO
};

// Price IDs — create one price per product in the Stripe dashboard (single price, no size variants)
export const STRIPE_PRICES = {
  STRAWBERRIES_PRICE_ID: '',         // TODO: $8 — paste price_xxx here
  BLUEBERRIES_PRICE_ID: '',          // TODO: $8
  AVOCADOS_PRICE_ID: '',             // TODO: $9
  APPLES_PRICE_ID: '',               // TODO: $7
  TOMATOES_PRICE_ID: '',             // TODO: $7
  ORANGES_PRICE_ID: '',              // TODO: $7
  SEASONAL_PRODUCE_BOX_PRICE_ID: '', // TODO: $28
  CUSTOM_PRODUCE_BOX_PRICE_ID: '',   // TODO: $32
};

/** Whether this Stripe map entry has multiple prices by size (vs single priceId for packs). */
export function hasSizeVariants(productId) {
  const entry = PRODUCT_TO_STRIPE_MAP[String(productId)];
  return entry ? 'pricesBySize' in entry : false;
}

/** Get Stripe price ID for a product and optional size. Packs ignore size. */
export function getStripePriceId(productId, size = DEFAULT_SIZE) {
  const entry = PRODUCT_TO_STRIPE_MAP[String(productId)];
  if (!entry) return null;
  if (entry.pricesBySize) {
    return entry.pricesBySize[size] ?? entry.pricesBySize[DEFAULT_SIZE] ?? null;
  }
  return entry.priceId ?? null;
}

// Mapping from product ID (from products.js) to Stripe configuration.
// All fruit products use a single priceId (no size variants).
// TODO: fill in product and price IDs after creating them in the Stripe dashboard.
export const PRODUCT_TO_STRIPE_MAP = {
  1: {
    productId: STRIPE_PRODUCTS.STRAWBERRIES,
    priceId: STRIPE_PRICES.STRAWBERRIES_PRICE_ID,
    name: 'Strawberries',
  },
  3: {
    productId: STRIPE_PRODUCTS.BLUEBERRIES,
    priceId: STRIPE_PRICES.BLUEBERRIES_PRICE_ID,
    name: 'Blueberries',
  },
  4: {
    productId: STRIPE_PRODUCTS.AVOCADOS,
    priceId: STRIPE_PRICES.AVOCADOS_PRICE_ID,
    name: 'Avocados',
  },
  6: {
    productId: STRIPE_PRODUCTS.APPLES,
    priceId: STRIPE_PRICES.APPLES_PRICE_ID,
    name: 'Apples',
  },
  7: {
    productId: STRIPE_PRODUCTS.TOMATOES,
    priceId: STRIPE_PRICES.TOMATOES_PRICE_ID,
    name: 'Tomatoes',
  },
  8: {
    productId: STRIPE_PRODUCTS.ORANGES,
    priceId: STRIPE_PRICES.ORANGES_PRICE_ID,
    name: 'Oranges',
  },
  9: {
    productId: STRIPE_PRODUCTS.SEASONAL_PRODUCE_BOX,
    priceId: STRIPE_PRICES.SEASONAL_PRODUCE_BOX_PRICE_ID,
    name: 'Seasonal Produce Box',
  },
  10: {
    productId: STRIPE_PRODUCTS.CUSTOM_PRODUCE_BOX,
    priceId: STRIPE_PRICES.CUSTOM_PRODUCE_BOX_PRICE_ID,
    name: 'Custom Produce Box',
  },
};

// Shipping configuration
export const SHIPPING_CONFIG = {
  FLAT_RATE: parseFloat(process.env.NEXT_PUBLIC_SHIPPING_COST || '6.00'),
  FREE_THRESHOLD: parseFloat(
    process.env.NEXT_PUBLIC_SHIPPING_FREE_THRESHOLD || '50.00',
  ),
  FREE_SHIPPING_TEXT: 'Free shipping on orders over $50',
  ESTIMATED_DELIVERY: '7-10 business days',
};
