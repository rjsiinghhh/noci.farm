// Promotional offer ratio: buy N paid units of a product line, get 1 free.
// Single source of truth so the trigger UI, cart state, and server validation
// all agree on how many free items a paid quantity earns.
export const PAID_UNITS_PER_FREE = 2;

// Free items earned for a given paid quantity on a single product line.
// e.g. with PAID_UNITS_PER_FREE = 2: qty 1 -> 0, qty 2 -> 1, qty 3 -> 1, qty 4 -> 2.
export const freeEntitlementForQuantity = paidQty =>
  Math.floor(Math.max(0, Number(paidQty) || 0) / PAID_UNITS_PER_FREE);
