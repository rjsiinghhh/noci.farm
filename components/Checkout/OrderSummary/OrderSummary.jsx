import React from 'react';
import Image from 'next/image';
import { SHIPPING_CONFIG } from '@/lib/stripe';
import { STANDARD_SIZE } from '@/data/products';
import './OrderSummary.css';

const OrderSummary = ({ items }) => {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.isFreeItem ? 0 : item.price * item.quantity),
    0,
  );
  const shipping =
    subtotal >= SHIPPING_CONFIG.FREE_THRESHOLD ? 0 : SHIPPING_CONFIG.FLAT_RATE;
  const total = subtotal + shipping;

  const formatPrice = price => {
    return `$${price.toFixed(2)}`;
  };

  const formatItemSize = size => {
    if (!size || size === STANDARD_SIZE) return STANDARD_SIZE;
    return size;
  };

  return (
    <div className="order-summary">
      <div className="order-summary-header">
        <h2 className="order-summary-title">Order Summary</h2>
        <span className="order-summary-count">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="order-summary-items">
        {items.map((item, index) => (
          <div
            key={`${item.id}-${item.size}-${index}`}
            className={`order-summary-item ${item.isFreeItem ? 'order-summary-item-free' : ''}`}
          >
            <div className="order-summary-item-image">
              <Image
                src={item.image || '/images/fallback-placeholder.png'}
                alt={item.name}
                width={60}
                height={60}
                className="order-summary-item-img"
              />
              {item.isFreeItem && (
                <div className="order-summary-free-badge">FREE</div>
              )}
            </div>

            <div className="order-summary-item-info">
              <h4 className="order-summary-item-name">{item.name}</h4>
              <p className="order-summary-item-size">
                Size: {formatItemSize(item.size)}
              </p>
              {item.isFreeItem ? (
                <p className="order-summary-item-price order-summary-free-price">
                  <span className="order-summary-original-price">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="order-summary-free-label">FREE</span> ×{' '}
                  {item.quantity}
                </p>
              ) : (
                <p className="order-summary-item-price">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              )}
            </div>

            <div className="order-summary-item-total">
              {item.isFreeItem ? (
                <span className="order-summary-free-total">$0.00</span>
              ) : (
                formatPrice(item.price * item.quantity)
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="order-summary-totals">
        <div className="order-summary-row">
          <span className="order-summary-label">Subtotal</span>
          <span className="order-summary-value">{formatPrice(subtotal)}</span>
        </div>

        <div className="order-summary-row">
          <span className="order-summary-label">Shipping</span>
          <span className="order-summary-value">
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>

        {shipping === 0 && (
          <div className="order-summary-free-shipping">
            <span className="order-summary-free-shipping-text">
              {SHIPPING_CONFIG.FREE_SHIPPING_TEXT}
            </span>
          </div>
        )}

        <div className="order-summary-row order-summary-total">
          <span className="order-summary-label">Total</span>
          <span className="order-summary-value">{formatPrice(total)}</span>
        </div>
      </div>

      <div className="order-summary-shipping-info">
        <div className="order-summary-shipping-icon">🚚</div>
        <div className="order-summary-shipping-details">
          <p className="order-summary-shipping-text">
            Estimated delivery: {SHIPPING_CONFIG.ESTIMATED_DELIVERY}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
