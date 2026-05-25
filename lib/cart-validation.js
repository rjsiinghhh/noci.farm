import {
  getProductPrice,
  normalizeProductSize,
  productMap,
  STANDARD_SIZE,
} from '../data/products';

const VARIETY_PACK = 'variety-pack';
const GIFT_PACK = 'gift-pack';

const isPack = product =>
  Boolean(product?.type) &&
  (product.type === VARIETY_PACK || product.type === GIFT_PACK);

const isBOGOEligibleProduct = product =>
  !product?.type || (product.type !== VARIETY_PACK && product.type !== GIFT_PACK);

const getCartItemKey = (id, size = STANDARD_SIZE) => `${id}::${size}`;

export class CartValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CartValidationError';
    this.statusCode = 400;
  }
}

export const sanitizeCustomSelection = customSelection => {
  if (!customSelection || typeof customSelection !== 'object') return undefined;

  const cleanedEntries = Object.entries(customSelection).filter(
    ([selectionKey, quantity]) => {
      const [productId, size] = String(selectionKey).split('::');
      const product = productMap[productId];
      if (!product) return false;
      const normalizedSize = normalizeProductSize(product, size);
      if (normalizedSize !== size) return false;
      return Number.isInteger(quantity) && quantity > 0;
    },
  );

  if (cleanedEntries.length === 0) return undefined;
  return Object.fromEntries(cleanedEntries);
};

const normalizeRawItem = rawItem => {
  const product = productMap[String(rawItem?.id)];
  if (!product) {
    throw new CartValidationError('Invalid product in cart');
  }

  const quantity = Number(rawItem?.quantity);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new CartValidationError('Invalid quantity in cart');
  }

  const normalizedSize = normalizeProductSize(product, rawItem?.size);
  const normalizedPrice = getProductPrice(product, normalizedSize);
  const isFreeItem = Boolean(rawItem?.isFreeItem);

  return {
    id: product.id,
    name: product.name,
    image: rawItem?.image || product.image || '/images/fallback-placeholder.png',
    size: isPack(product) ? STANDARD_SIZE : normalizedSize,
    quantity,
    price: normalizedPrice,
    type: rawItem?.type || product.type || 'regular',
    contents: Array.isArray(rawItem?.contents) ? rawItem.contents : undefined,
    customSelection: sanitizeCustomSelection(rawItem?.customSelection),
    selectionDetails:
      typeof rawItem?.selectionDetails === 'string'
        ? rawItem.selectionDetails
        : undefined,
    isFreeItem,
    linkedToProduct:
      typeof rawItem?.linkedToProduct === 'string'
        ? rawItem.linkedToProduct
        : undefined,
    linkedToCartItemKey:
      typeof rawItem?.linkedToCartItemKey === 'string'
        ? rawItem.linkedToCartItemKey
        : undefined,
  };
};

const validateFreeItemEntitlements = normalizedItems => {
  const paidEntitlements = new Map();
  const consumedFreeUnits = new Map();

  for (const item of normalizedItems) {
    if (item.isFreeItem) continue;

    const key = getCartItemKey(item.id, item.size);
    const existing = paidEntitlements.get(key);
    const product = productMap[String(item.id)];

    if (!existing) {
      paidEntitlements.set(key, {
        key,
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        isBOGOEligible: isBOGOEligibleProduct(product),
      });
      continue;
    }

    existing.quantity += item.quantity;
  }

  for (const item of normalizedItems) {
    if (!item.isFreeItem) continue;

    if (!item.linkedToCartItemKey) {
      throw new CartValidationError('Free item must be linked to a paid item');
    }

    const entitlement = paidEntitlements.get(item.linkedToCartItemKey);
    if (!entitlement) {
      throw new CartValidationError('Free item link is invalid');
    }

    if (!entitlement.isBOGOEligible) {
      throw new CartValidationError('Free items are not allowed for this product');
    }

    if (item.size !== entitlement.size) {
      throw new CartValidationError(
        'Free item size must match linked paid item size',
      );
    }

    const freeProduct = productMap[String(item.id)];
    if (!isBOGOEligibleProduct(freeProduct)) {
      throw new CartValidationError('Invalid free item in cart');
    }

    const consumedUnits = consumedFreeUnits.get(item.linkedToCartItemKey) || 0;
    const nextConsumed = consumedUnits + item.quantity;

    if (nextConsumed > entitlement.quantity) {
      throw new CartValidationError('Free item quantity exceeds paid entitlement');
    }

    consumedFreeUnits.set(item.linkedToCartItemKey, nextConsumed);
    item.linkedToProduct = entitlement.name;
  }
};

export const normalizeIncomingItems = items => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CartValidationError('At least one item is required');
  }

  const normalizedItems = items.map(normalizeRawItem);
  validateFreeItemEntitlements(normalizedItems);
  return normalizedItems;
};

export const calculateCartTotals = (normalizedItems, shippingConfig) => {
  const subtotal = normalizedItems.reduce(
    (sum, item) => sum + (item.isFreeItem ? 0 : item.price * item.quantity),
    0,
  );

  const shipping =
    subtotal >= shippingConfig.FREE_THRESHOLD ? 0 : shippingConfig.FLAT_RATE;

  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
};

export const validatePaymentIntentForOrder = ({
  paymentIntent,
  expectedTotal,
  customerEmail,
}) => {
  if (!paymentIntent) {
    throw new CartValidationError('Payment intent not found');
  }

  if (paymentIntent.status !== 'succeeded') {
    throw new CartValidationError('Payment is not completed');
  }

  const expectedTotalCents = Math.round(expectedTotal * 100);
  const paidTotalCents = paymentIntent.amount_received || paymentIntent.amount;

  if (paidTotalCents !== expectedTotalCents) {
    throw new CartValidationError('Payment amount does not match order total');
  }

  const paymentEmail = paymentIntent.metadata?.customerEmail;
  if (
    paymentEmail &&
    customerEmail &&
    paymentEmail.toLowerCase() !== customerEmail.toLowerCase()
  ) {
    throw new CartValidationError('Payment email does not match order email');
  }
};
