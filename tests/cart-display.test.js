import { describe, expect, it } from 'vitest';

import { getCheckoutButtonLabel } from '../lib/cart-display.js';

describe('getCheckoutButtonLabel', () => {
  it('uses quantity count instead of line-item count', () => {
    expect(getCheckoutButtonLabel(2)).toBe('Checkout (2 items)');
  });

  it('uses singular grammar for one item', () => {
    expect(getCheckoutButtonLabel(1)).toBe('Checkout (1 item)');
  });

  it('handles empty carts safely', () => {
    expect(getCheckoutButtonLabel(0)).toBe('Checkout (0 items)');
  });
});
