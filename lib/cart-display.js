export const getCheckoutButtonLabel = totalItems => {
  const count = Number.isFinite(totalItems) ? totalItems : 0;
  const itemLabel = count === 1 ? 'item' : 'items';
  return `Checkout (${count} ${itemLabel})`;
};
