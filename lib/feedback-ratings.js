import { STANDARD_SIZE } from '../data/products';

const FEEDBACK_LINE_PREFIX = 'line';

export const buildFeedbackRatingKey = (item, index) => {
  const size = item?.size || STANDARD_SIZE;
  const itemType = item?.isFreeItem ? 'free' : 'paid';
  return `${FEEDBACK_LINE_PREFIX}::${index}::${item?.id}::${size}::${itemType}`;
};

export const buildInitialRatings = items => {
  if (!Array.isArray(items)) return {};

  return items.reduce((acc, item, index) => {
    acc[buildFeedbackRatingKey(item, index)] = 0;
    return acc;
  }, {});
};

export const parseFeedbackRatingKey = key => {
  const normalizedKey = String(key || '');
  const parts = normalizedKey.split('::');

  if (parts[0] === FEEDBACK_LINE_PREFIX && parts.length >= 5) {
    const lineIndex = Number(parts[1]);
    const productId = parts[2];
    const size = parts[3] || STANDARD_SIZE;
    const itemType = parts[4] || 'paid';

    if (!Number.isInteger(lineIndex) || !productId) {
      return null;
    }

    return {
      mode: 'line',
      lineIndex,
      productId,
      size,
      itemType,
    };
  }

  if (normalizedKey) {
    return {
      mode: 'legacy',
      productId: normalizedKey,
    };
  }

  return null;
};
