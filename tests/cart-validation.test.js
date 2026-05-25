import { describe, expect, it } from 'vitest';

import {
  CartValidationError,
  calculateCartTotals,
  normalizeIncomingItems,
  validatePaymentIntentForOrder,
} from '../lib/cart-validation.js';
import {
  SIZE_2_5_OZ,
  SIZE_4_OZ,
} from '../data/products.js';

const SHIPPING_CONFIG = {
  FLAT_RATE: 6,
  FREE_THRESHOLD: 50,
};

describe('normalizeIncomingItems', () => {
  it('normalizes paid item price from server catalog values', () => {
    const normalized = normalizeIncomingItems([
      {
        id: '1',
        size: SIZE_2_5_OZ,
        quantity: 2,
        price: 999,
        isFreeItem: false,
      },
    ]);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].price).toBe(3);
    expect(normalized[0].size).toBe(SIZE_2_5_OZ);
    expect(normalized[0].isFreeItem).toBe(false);
  });

  it('rejects free items that are not linked to a paid cart line key', () => {
    expect(() =>
      normalizeIncomingItems([
        {
          id: '1',
          size: SIZE_4_OZ,
          quantity: 1,
          isFreeItem: false,
        },
        {
          id: '3',
          size: SIZE_4_OZ,
          quantity: 1,
          isFreeItem: true,
        },
      ]),
    ).toThrow(CartValidationError);
  });

  it('rejects free items when free quantity exceeds paid quantity entitlement', () => {
    expect(() =>
      normalizeIncomingItems([
        {
          id: '1',
          size: SIZE_4_OZ,
          quantity: 1,
          isFreeItem: false,
        },
        {
          id: '3',
          size: SIZE_4_OZ,
          quantity: 2,
          isFreeItem: true,
          linkedToCartItemKey: `1::${SIZE_4_OZ}`,
        },
      ]),
    ).toThrow(CartValidationError);
  });

  it('rejects free items when size does not match linked paid item size', () => {
    expect(() =>
      normalizeIncomingItems([
        {
          id: '1',
          size: SIZE_4_OZ,
          quantity: 1,
          isFreeItem: false,
        },
        {
          id: '3',
          size: SIZE_2_5_OZ,
          quantity: 1,
          isFreeItem: true,
          linkedToCartItemKey: `1::${SIZE_4_OZ}`,
        },
      ]),
    ).toThrow(CartValidationError);
  });

  it('accepts valid paid plus linked free selection and preserves free item metadata', () => {
    const normalized = normalizeIncomingItems([
      {
        id: '1',
        size: SIZE_4_OZ,
        quantity: 2,
        isFreeItem: false,
      },
      {
        id: '3',
        size: SIZE_4_OZ,
        quantity: 2,
        isFreeItem: true,
        linkedToCartItemKey: `1::${SIZE_4_OZ}`,
      },
    ]);

    expect(normalized).toHaveLength(2);
    expect(normalized[1].isFreeItem).toBe(true);
    expect(normalized[1].linkedToCartItemKey).toBe(`1::${SIZE_4_OZ}`);
  });
});

describe('calculateCartTotals', () => {
  it('excludes free items from subtotal and applies shipping rules', () => {
    const normalized = normalizeIncomingItems([
      {
        id: '1',
        size: SIZE_4_OZ,
        quantity: 2,
        isFreeItem: false,
      },
      {
        id: '3',
        size: SIZE_4_OZ,
        quantity: 1,
        isFreeItem: true,
        linkedToCartItemKey: `1::${SIZE_4_OZ}`,
      },
    ]);

    const totals = calculateCartTotals(normalized, SHIPPING_CONFIG);
    expect(totals.subtotal).toBe(12);
    expect(totals.shipping).toBe(SHIPPING_CONFIG.FLAT_RATE);
    expect(totals.total).toBe(12 + SHIPPING_CONFIG.FLAT_RATE);
  });
});

describe('validatePaymentIntentForOrder', () => {
  it('rejects non-succeeded payment intents', () => {
    expect(() =>
      validatePaymentIntentForOrder({
        paymentIntent: { status: 'processing', amount: 1800, metadata: {} },
        expectedTotal: 18,
      }),
    ).toThrow(CartValidationError);
  });

  it('rejects amount mismatches', () => {
    expect(() =>
      validatePaymentIntentForOrder({
        paymentIntent: { status: 'succeeded', amount: 1700, metadata: {} },
        expectedTotal: 18,
      }),
    ).toThrow(CartValidationError);
  });

  it('rejects customer email mismatches', () => {
    expect(() =>
      validatePaymentIntentForOrder({
        paymentIntent: {
          status: 'succeeded',
          amount: 1800,
          metadata: { customerEmail: 'someone@example.com' },
        },
        expectedTotal: 18,
        customerEmail: 'different@example.com',
      }),
    ).toThrow(CartValidationError);
  });

  it('accepts valid succeeded payment intents', () => {
    expect(() =>
      validatePaymentIntentForOrder({
        paymentIntent: {
          status: 'succeeded',
          amount: 1800,
          metadata: { customerEmail: 'buyer@example.com' },
        },
        expectedTotal: 18,
        customerEmail: 'buyer@example.com',
      }),
    ).not.toThrow();
  });
});
