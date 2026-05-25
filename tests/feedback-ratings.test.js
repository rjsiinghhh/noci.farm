import { describe, expect, it } from 'vitest';

import {
  buildFeedbackRatingKey,
  buildInitialRatings,
  parseFeedbackRatingKey,
} from '../lib/feedback-ratings.js';

describe('buildFeedbackRatingKey', () => {
  it('builds unique keys for duplicate product IDs with different sizes', () => {
    const lineA = buildFeedbackRatingKey(
      { id: '1', size: '4 OZ', isFreeItem: false },
      0,
    );
    const lineB = buildFeedbackRatingKey(
      { id: '1', size: '2.5 OZ', isFreeItem: false },
      1,
    );

    expect(lineA).not.toBe(lineB);
  });
});

describe('buildInitialRatings', () => {
  it('creates one rating entry per order line', () => {
    const ratings = buildInitialRatings([
      { id: '1', size: '4 OZ', isFreeItem: false },
      { id: '1', size: '2.5 OZ', isFreeItem: false },
      { id: '3', size: '4 OZ', isFreeItem: true },
    ]);

    expect(Object.keys(ratings)).toHaveLength(3);
    expect(Object.values(ratings)).toEqual([0, 0, 0]);
  });
});

describe('parseFeedbackRatingKey', () => {
  it('parses line-based keys', () => {
    expect(parseFeedbackRatingKey('line::2::1::4 OZ::paid')).toEqual({
      mode: 'line',
      lineIndex: 2,
      productId: '1',
      size: '4 OZ',
      itemType: 'paid',
    });
  });

  it('parses legacy product-only keys', () => {
    expect(parseFeedbackRatingKey('1')).toEqual({
      mode: 'legacy',
      productId: '1',
    });
  });
});
