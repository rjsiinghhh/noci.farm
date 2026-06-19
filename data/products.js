// Size keys — kept for cart/validation backwards compatibility.
// Fruit products use STANDARD_SIZE (single price, no size variants).
export const SIZE_4_OZ = '4 OZ';
export const SIZE_2_5_OZ = '2.5 OZ';
export const STANDARD_SIZE = 'Standard';
export const SIZE_OPTIONS = [SIZE_2_5_OZ, SIZE_4_OZ];
export const DEFAULT_SIZE = SIZE_4_OZ;

/** Whether a product has explicit size-based variants. */
export function hasSizeVariants(product) {
  return Boolean(product?.pricesBySize);
}

/** Returns true if the provided size is a valid purchasable size for this product. */
export function isValidProductSize(product, size) {
  if (!product) return false;
  if (!hasSizeVariants(product)) return size === STANDARD_SIZE;
  return product.pricesBySize[size] != null;
}

/** Normalize any incoming size to a safe valid value for a given product. */
export function normalizeProductSize(product, size) {
  if (!product) return STANDARD_SIZE;
  if (!hasSizeVariants(product)) return STANDARD_SIZE;
  if (isValidProductSize(product, size)) return size;
  return DEFAULT_SIZE;
}

/** Get price for a product; uses pricesBySize when present, else price. */
export function getProductPrice(product, size = DEFAULT_SIZE) {
  if (!product) return 0;
  const normalizedSize = normalizeProductSize(product, size);
  if (product.pricesBySize && product.pricesBySize[normalizedSize] != null) {
    return product.pricesBySize[normalizedSize];
  }
  return product.price ?? 0;
}

// TODO: Add product images to /public/images/ and /public/products-details/
// TODO: Create new Stripe products in your dashboard and update lib/stripe.js with the new IDs
export const productItems = [
  {
    id: '1',
    name: 'Strawberries',
    image: '/images/strawberries.jpg',
    detailImage: '/products-details/strawberries.jpg',
    description:
      'Sun-ripened California strawberries sourced fresh from local farmers stands. Picked at peak sweetness — perfect for snacking, smoothies, or dessert. Sold by the pint.',
    price: 8,
  },
  {
    id: '3',
    name: 'Blueberries',
    image: '/images/blueberries.jpg',
    detailImage: '/products-details/blueberries.jpg',
    description:
      'Plump, antioxidant-rich blueberries from local California farms. Naturally sweet with no additives — just pure, fresh fruit. Sold by the pint.',
    price: 8,
  },
  {
    id: '4',
    name: 'Avocados',
    image: '/images/avocados.jpg',
    detailImage: '/products-details/avocados.jpg',
    description:
      'Creamy California avocados sourced from local growers. Picked at the right moment so they arrive ready to eat. Sold in a bag of 3.',
    price: 9,
  },
  {
    id: '6',
    name: 'Apples',
    image: '/images/apples.jpg',
    detailImage: '/products-details/apples.jpg',
    description:
      'Crisp, fresh-picked California apples from local orchards. A variety of what\'s in season — sweet, tart, and everything in between. Sold by the pound.',
    price: 7,
  },
  {
    id: '7',
    name: 'Tomatoes',
    image: '/images/tomatoes.jpg',
    detailImage: '/products-details/tomatoes.jpg',
    description:
      'Vine-ripened California tomatoes with real flavor — nothing like the grocery store kind. Sourced direct from farmers stands at peak season. Sold by the pound.',
    price: 7,
  },
  {
    id: '8',
    name: 'Oranges',
    image: '/images/oranges.jpg',
    detailImage: '/products-details/oranges.jpg',
    description:
      'Sweet California oranges bursting with juice and vitamin C. Sourced from local citrus growers and delivered fresh to your door. Sold by the pound.',
    price: 7,
  },
  {
    id: '9',
    name: 'Seasonal Produce Box',
    image: '/images/seasonal-box.jpg',
    detailImage: '/products-details/seasonal-box.jpg',
    description:
      "A curated box of what's freshest this week at local farmers stands. A mix of fruit and produce, always picked at peak ripeness. Contents vary week to week.",
    price: 28,
    type: 'variety-pack',
    badge: 'Best of Season',
    contents: ['1', '3', '6', '8'],
  },
  {
    id: '10',
    name: 'Custom Produce Box',
    image: '/images/custom-box.jpg',
    detailImage: '/products-details/custom-box.jpg',
    description:
      "Build your own box. Pick any 5 items from what's available at the stand this week. Perfect for families or gifting.",
    price: 32,
    type: 'gift-pack',
    badge: 'Your Choice',
    selectCount: 5,
  },
];

// Create a lookup map for quick access by product ID
export const productMap = productItems.reduce((acc, product) => {
  acc[product.id] = product;
  return acc;
}, {});
