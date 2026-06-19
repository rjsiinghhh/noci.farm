import { DEFAULT_SIZE, SIZE_2_5_OZ, SIZE_4_OZ } from '@/data/products';

// Client-side Stripe instance
export const getStripe = async () => {
  const { loadStripe } = await import('@stripe/stripe-js');
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

// Product IDs from your Stripe dashboard
export const STRIPE_PRODUCTS = {
  CANDIED_WALNUTS: 'prod_SwmgQqZ1Zd4IvO',
  // HONEY_WALNUT_BUTTER: 'prod_TAabynbem9VI1Z',
  ROASTED_WALNUTS: 'prod_TKM3lnCOmqZ4DC',
  HONEY_ROASTED_WALNUTS: 'prod_TknhKuKKmCUdiZ',
  RAW_WALNUTS: 'prod_TKJ9ZpnX3Ljsep',
  RAW_ALMONDS: 'prod_Tvq0En1xIM8j4A',
  CHOCOLATE_COVERED_ALMONDS: 'prod_Tvq1Uyw7tZpJ6L',
  CHOCOLATE_COVERED_WALNUTS: 'prod_Tvpzu2HiOMalPa',
  TRAIL_MIX: 'prod_TNgJrnpMnrGfGo',
  GIFT_BASKET: 'prod_TmoXvLBZLx3Gi7',
  VARIETY_PACK: 'prod_TmoXdIjHb94sW9',
};

// id
// - choclate almonds
//  - raw almonds
// prod_Tvpzu2HiOMalPa - choclate covered walnuts

// Price IDs mapping (4 OZ = $6; 2.5 OZ = $3 — add second price in Stripe and paste IDs below)
export const STRIPE_PRICES = {
  // 4 OZ ($6)
  CANDIED_WALNUTS_PRICE_ID: 'price_1SMyhbBfJTZXPBInduTDNZdW',
  ROASTED_WALNUTS_PRICE_ID: 'price_1SNhLqBfJTZXPBIniiYnwA1a',
  RAW_WALNUTS_PRICE_ID: 'price_1SNeWlBfJTZXPBInNKXX0Lg1',
  HONEY_ROASTED_WALNUTS_PRICE_ID: 'price_1SnI6VBfJTZXPBInMPWDhtnO',
  CHOCOLATE_COVERED_ALMONDS_PRICE_ID: 'price_1SxyLoBfJTZXPBIngREbKt6w',
  CHOCOLATE_COVERED_WALNUTS_PRICE_ID: 'price_1SxyJtBfJTZXPBInByDzqLhT',
  RAW_ALMONDS_PRICE_ID: 'price_1SxyKZBfJTZXPBInchCdKwum',
  TRAIL_MIX_PRICE_ID: 'price_1SQuwuBfJTZXPBIns9BXlrXp',
  // 2.5 OZ ($3) — replace with your Stripe price IDs after creating them
  CANDIED_WALNUTS_2_5OZ_PRICE_ID: 'price_1T1T0lBfJTZXPBIn4w8y4nBh',
  ROASTED_WALNUTS_2_5OZ_PRICE_ID: 'price_1T1T2OBfJTZXPBIn9B0vsxdX',
  RAW_WALNUTS_2_5OZ_PRICE_ID: 'price_1T1Sn4BfJTZXPBInvb5Tt2Wm',
  HONEY_ROASTED_WALNUTS_2_5OZ_PRICE_ID: 'price_1T1TK6BfJTZXPBIn9TWsD7op',
  CHOCOLATE_COVERED_ALMONDS_2_5OZ_PRICE_ID: 'price_1T1TNBBfJTZXPBInLQm7UxaS',
  CHOCOLATE_COVERED_WALNUTS_2_5OZ_PRICE_ID: 'price_1T1TLGBfJTZXPBIn3aCCvkuS',
  RAW_ALMONDS_2_5OZ_PRICE_ID: 'price_1T1TMIBfJTZXPBInjIqiRKuR',
  TRAIL_MIX_2_5OZ_PRICE_ID: 'price_1T1TDWBfJTZXPBInX9NJqmYl',
  // Single-price products (no size variants)
  VARIETY_PACK_PRICE_ID: 'price_1SpEuPBfJTZXPBInxqzuxYYz',
  GIFT_BASKET_PRICE_ID: 'price_1SpEutBfJTZXPBIndSerR0S8',
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

// Mapping from product ID (from products.js) to Stripe configuration
// Size products: use pricesBySize (2.5 OZ / 4 OZ). Variety Pack & Gift Pack: single priceId.
export const PRODUCT_TO_STRIPE_MAP = {
  1: {
    productId: STRIPE_PRODUCTS.RAW_WALNUTS,
    pricesBySize: {
      [SIZE_4_OZ]: STRIPE_PRICES.RAW_WALNUTS_PRICE_ID,
      [SIZE_2_5_OZ]: STRIPE_PRICES.RAW_WALNUTS_2_5OZ_PRICE_ID,
    },
    name: 'Raw Walnuts',
  },
  2: {
    productId: STRIPE_PRODUCTS.RAW_ALMONDS,
    pricesBySize: {
      [SIZE_4_OZ]: STRIPE_PRICES.RAW_ALMONDS_PRICE_ID,
      [SIZE_2_5_OZ]: STRIPE_PRICES.RAW_ALMONDS_2_5OZ_PRICE_ID,
    },
    name: 'Raw Almonds',
  },
  3: {
    productId: STRIPE_PRODUCTS.CANDIED_WALNUTS,
    pricesBySize: {
      [SIZE_4_OZ]: STRIPE_PRICES.CANDIED_WALNUTS_PRICE_ID,
      [SIZE_2_5_OZ]: STRIPE_PRICES.CANDIED_WALNUTS_2_5OZ_PRICE_ID,
    },
    name: 'Candied Walnuts',
  },
  4: {
    productId: STRIPE_PRODUCTS.HONEY_ROASTED_WALNUTS,
    pricesBySize: {
      [SIZE_4_OZ]: STRIPE_PRICES.HONEY_ROASTED_WALNUTS_PRICE_ID,
      [SIZE_2_5_OZ]: STRIPE_PRICES.HONEY_ROASTED_WALNUTS_2_5OZ_PRICE_ID,
    },
    name: 'Honey Roasted Walnuts',
  },
  5: {
    productId: STRIPE_PRODUCTS.ROASTED_WALNUTS,
    pricesBySize: {
      [SIZE_4_OZ]: STRIPE_PRICES.ROASTED_WALNUTS_PRICE_ID,
      [SIZE_2_5_OZ]: STRIPE_PRICES.ROASTED_WALNUTS_2_5OZ_PRICE_ID,
    },
    name: 'Roasted Walnuts',
  },
  6: {
    productId: STRIPE_PRODUCTS.CHOCOLATE_COVERED_ALMONDS,
    pricesBySize: {
      [SIZE_4_OZ]: STRIPE_PRICES.CHOCOLATE_COVERED_ALMONDS_PRICE_ID,
      [SIZE_2_5_OZ]: STRIPE_PRICES.CHOCOLATE_COVERED_ALMONDS_2_5OZ_PRICE_ID,
    },
    name: 'Chocolate Covered Almonds',
  },
  7: {
    productId: STRIPE_PRODUCTS.CHOCOLATE_COVERED_WALNUTS,
    pricesBySize: {
      [SIZE_4_OZ]: STRIPE_PRICES.CHOCOLATE_COVERED_WALNUTS_PRICE_ID,
      [SIZE_2_5_OZ]: STRIPE_PRICES.CHOCOLATE_COVERED_WALNUTS_2_5OZ_PRICE_ID,
    },
    name: 'Chocolate Covered Walnuts',
  },
  8: {
    productId: STRIPE_PRODUCTS.TRAIL_MIX,
    pricesBySize: {
      [SIZE_4_OZ]: STRIPE_PRICES.TRAIL_MIX_PRICE_ID,
      [SIZE_2_5_OZ]: STRIPE_PRICES.TRAIL_MIX_2_5OZ_PRICE_ID,
    },
    name: 'Trail Mix',
  },
  9: {
    productId: STRIPE_PRODUCTS.VARIETY_PACK,
    priceId: STRIPE_PRICES.VARIETY_PACK_PRICE_ID,
    name: 'Variety Pack',
  },
  10: {
    productId: STRIPE_PRODUCTS.GIFT_BASKET,
    priceId: STRIPE_PRICES.GIFT_BASKET_PRICE_ID,
    name: 'Gift Pack',
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
