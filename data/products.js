// Size keys — must match lib/stripe.js and ProductGrid SIZE_OPTIONS
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

export const productItems = [
  {
    id: '1',
    name: 'Raw Walnuts',
    image: '/images/raw-walnuts.png',
    detailImage: '/products-details/raw-walnuts.jpeg',
    description:
      'Fresh, Raw Chandler Walnuts harvested in mid October. Packed with omega-3 fatty acids and antioxidants, walnuts provide a range of health benefits while naturally helping to curb appetite. (4 oz)',
    price: 6,
    pricesBySize: { [SIZE_4_OZ]: 6, [SIZE_2_5_OZ]: 3 },
  },
  // {
  //   id: '2',
  //   name: 'Raw Almonds',
  //   image: '',
  //   description:
  //     'Almonds grown in Northern California. (4 oz)',
  //   price: 6,
  // },
  {
    id: '3',
    name: 'Candied Walnuts',
    image: '/images/candied-walnuts.png',
    detailImage: '/products-details/candied-walnuts.jpeg',
    description:
      'Walnuts grown in Northern California. Candied Walnuts baked in our kitchen. Ingredients: Granulated Sugar, Cinnamon, Egg Whites, Vanilla Extract, Himalayan Pink Salt, Walnuts. (4 oz)',
    price: 6,
    pricesBySize: { [SIZE_4_OZ]: 6, [SIZE_2_5_OZ]: 3 },
  },
  {
    id: '4',
    name: 'Honey Roasted Walnuts',
    image: '/images/honey-roasted-walnuts.png',
    detailImage: '/products-details/honey-roasted-walnuts.jpeg',
    description:
      'The perfect blend of sweetness and crunch. Ingredients: Walnuts, Locally Sourced Honey, Salted Butter, & Granulated Sugar. (4 oz)',
    price: 6,
    pricesBySize: { [SIZE_4_OZ]: 6, [SIZE_2_5_OZ]: 3 },
  },
  // {
  //   id: '5',
  //   name: 'Roasted Walnuts',
  //   image: '/images/roasted-walnuts.png',
  //   detailImage: '/products-details/roasted-walnuts.jpeg',
  //   description:
  //     'Walnuts roasted just right. Ingredients: Walnuts, Olive Oil, Himalayan Pink Salt. (4 oz)',
  //   price: 6,
  //   pricesBySize: { [SIZE_4_OZ]: 6, [SIZE_2_5_OZ]: 3 },
  // },
  {
    id: '6',
    name: 'Chocolate Covered Almonds',
    image: '/images/choc-covered-almonds.png',
    detailImage: '/products-details/chocolate-covered-almonds.jpeg',
    description:
      'Almonds fresh from Northern California covered in the best chocolate. Ingredients: Freshly Harvested Almonds & Chocolate. (4 oz)',
    price: 6,
    pricesBySize: { [SIZE_4_OZ]: 6, [SIZE_2_5_OZ]: 3 },
  },
  {
    id: '7',
    name: 'Chocolate Covered Walnuts',
    image: '/images/choc-covered-walnuts.png',
    detailImage: '/products-details/chocolate-covered-walnuts.jpeg',
    description:
      'Walnuts fresh from the family ranch covered in chocolate. Ingredients: Freshly Harvested Walnuts & Chocolate. (4 oz)',
    price: 6,
    pricesBySize: { [SIZE_4_OZ]: 6, [SIZE_2_5_OZ]: 3 },
  },
  {
    id: '8',
    name: 'Trail Mix',
    image: '/images/trail-mix.png',
    detailImage: '/products-details/trail-mix.jpeg',
    description:
      'When on the trail, mix it up! Ingredients: Raw Walnuts, Cranberries, Chocolate Chips, Granola && Pretzel Sticks.  (4 oz)',
    price: 6,
    pricesBySize: { [SIZE_4_OZ]: 6, [SIZE_2_5_OZ]: 3 },
  },
  {
    id: '9',
    name: 'Variety Pack',
    image: '/images/mix-items.jpg',
    detailImage: '/products-details/variety-pack.jpeg',
    description:
      'Raw Walnuts, Chocolate Covered Walnuts & Almonds & Trail Mix. Can be changed if requested. (16 oz)',
    price: 15,
    type: 'variety-pack',
    badge: 'Save 25%',
    contents: ['1', '3', '4', '8'], // IDs of included products
  },
  {
    id: '10',
    name: 'Gift Pack',
    image: '/images/gift-basket.jpg',
    detailImage: '/products-details/gift-pack.jpeg',
    description:
      "Choose any 5 items! (20 oz)",
    price: 20,
    type: 'gift-pack',
    badge: 'Best Value',
    selectCount: 5, // User must select 5 items
  },
];

// Create a lookup map for quick access by product ID
export const productMap = productItems.reduce((acc, product) => {
  acc[product.id] = product;
  return acc;
}, {});
