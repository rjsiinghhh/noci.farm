'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { IoClose, IoGift } from 'react-icons/io5';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { getProductPrice, productItems, productMap, SIZE_OPTIONS } from '@/data/products';
import './GiftPackModal.css';

const getSelectionKey = (productId, size) => `${productId}::${size}`;
const BASE_GIFT_ITEM_VALUE = 6;
const MIN_GIFT_ITEM_VALUE = 3;

const GiftPackModal = ({ isOpen, onClose, onAddToCart, maxItems = 5 }) => {
  const [selections, setSelections] = useState({});
  const totalBudget = maxItems * BASE_GIFT_ITEM_VALUE;

  // Get only the base products (not the packs themselves)
  const baseProducts = productItems.filter(
    product =>
      !product.type ||
      (product.type !== 'variety-pack' && product.type !== 'gift-pack'),
  );

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Reset selections when opening
      setSelections({});
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const { totalSelectedItems, totalSelectedValue } = useMemo(() => {
    return Object.entries(selections).reduce(
      (totals, [selectionKey, quantity]) => {
        if (quantity <= 0) return totals;

        const [productId, size] = selectionKey.split('::');
        const product = productMap[productId];
        if (!product) return totals;

        const linePrice = getProductPrice(product, size) * quantity;
        return {
          totalSelectedItems: totals.totalSelectedItems + quantity,
          totalSelectedValue: totals.totalSelectedValue + linePrice,
        };
      },
      { totalSelectedItems: 0, totalSelectedValue: 0 },
    );
  }, [selections]);

  const handleClose = () => {
    onClose();
  };

  const handleIncrement = (productId, size) => {
    const product = productMap[productId];
    if (!product) return;

    const selectedPrice = getProductPrice(product, size);
    if (totalSelectedValue + selectedPrice > totalBudget) return;

    const selectionKey = getSelectionKey(productId, size);
    setSelections(prev => ({
      ...prev,
      [selectionKey]: (prev[selectionKey] || 0) + 1,
    }));
  };

  const handleDecrement = (productId, size) => {
    const selectionKey = getSelectionKey(productId, size);
    setSelections(prev => {
      const currentValue = prev[selectionKey] || 0;
      if (currentValue <= 0) return prev;

      const newValue = currentValue - 1;
      if (newValue === 0) {
        const { [selectionKey]: removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [selectionKey]: newValue,
      };
    });
  };

  const handleClearSelection = () => {
    setSelections({});
  };

  const handleAddToCart = () => {
    if (totalSelectedValue !== totalBudget) return;
    onAddToCart(selections);
    handleClose();
  };

  if (!isOpen) return null;

  const remainingValue = Math.max(0, totalBudget - totalSelectedValue);
  const canAddToCart = totalSelectedValue === totalBudget;
  const maxAdditionalItems = Math.floor(remainingValue / MIN_GIFT_ITEM_VALUE);

  return (
    <div className="gift-pack-modal-overlay" onClick={handleClose}>
      <div
        className="gift-pack-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-pack-title"
      >
        {/* Header */}
        <div className="gift-pack-modal-header">
          <div className="gift-pack-modal-header-content">
            <IoGift className="gift-pack-modal-header-icon" />
            <div>
              <h2 id="gift-pack-title" className="gift-pack-modal-title">
                Create Your Gift Pack
              </h2>
              <p className="gift-pack-modal-subtitle">
                Build up to ${totalBudget.toFixed(2)} value ({maxItems} full-size
                items or {maxItems * 2} snack-size items, or any mix)
              </p>
            </div>
          </div>
          <button
            className="gift-pack-modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <IoClose />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="gift-pack-progress-section">
          <div className="gift-pack-progress-info">
            <span className="gift-pack-progress-text">
              {totalSelectedItems} items selected - $
              {totalSelectedValue.toFixed(2)} / ${totalBudget.toFixed(2)}
            </span>
            {remainingValue > 0 && (
              <span className="gift-pack-progress-remaining">
                ${remainingValue.toFixed(2)} value remaining ({maxAdditionalItems}{' '}
                more at $3.00 each)
              </span>
            )}
            {canAddToCart && (
              <span className="gift-pack-progress-complete">
                ✓ Ready to add!
              </span>
            )}
          </div>
          <div className="gift-pack-progress-bar">
            <div
              className="gift-pack-progress-fill"
              style={{ width: `${(totalSelectedValue / totalBudget) * 100}%` }}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="gift-pack-products-grid">
          {baseProducts.map(product => {
            const quantitiesBySize = SIZE_OPTIONS.reduce((acc, size) => {
              const key = getSelectionKey(product.id, size);
              acc[size] = selections[key] || 0;
              return acc;
            }, {});
            const quantity = Object.values(quantitiesBySize).reduce(
              (sum, sizeQty) => sum + sizeQty,
              0,
            );
            const isSelected = quantity > 0;

            return (
              <div
                key={product.id}
                className={`gift-pack-product-card ${isSelected ? 'gift-pack-product-card-selected' : ''}`}
              >
                <div className="gift-pack-product-image-wrapper">
                  <Image
                    src={product.image || '/images/fallback-placeholder.png'}
                    alt={product.name}
                    fill
                    className="gift-pack-product-image"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {isSelected && (
                    <div className="gift-pack-product-badge">{quantity}</div>
                  )}
                </div>
                <div className="gift-pack-product-info">
                  <h3 className="gift-pack-product-name">{product.name}</h3>
                </div>
                <div className="gift-pack-size-cards">
                  {SIZE_OPTIONS.map(size => {
                    const sizeQuantity = quantitiesBySize[size];
                    const sizePrice = getProductPrice(product, size);
                    const isSizeSelected = sizeQuantity > 0;
                    return (
                      <div
                        key={size}
                        className={`gift-pack-size-card ${isSizeSelected ? 'gift-pack-size-card-selected' : ''}`}
                      >
                        <div className="gift-pack-size-card-header">
                          <span className="gift-pack-size-card-label">
                            {size}
                          </span>
                          <span className="gift-pack-size-card-price">
                            ${sizePrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="gift-pack-size-stepper">
                          <button
                            type="button"
                            className="gift-pack-stepper-btn"
                            onClick={() => handleDecrement(product.id, size)}
                            disabled={sizeQuantity === 0}
                            aria-label={`Decrease ${product.name} ${size} quantity`}
                          >
                            <FaMinus />
                          </button>
                          <span
                            className="gift-pack-stepper-value"
                            aria-live="polite"
                          >
                            {sizeQuantity}
                          </span>
                          <button
                            type="button"
                            className="gift-pack-stepper-btn"
                            onClick={() => handleIncrement(product.id, size)}
                            disabled={totalSelectedValue + sizePrice > totalBudget}
                            aria-label={`Increase ${product.name} ${size} quantity`}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="gift-pack-modal-footer">
          <button
            className="gift-pack-clear-btn"
            onClick={handleClearSelection}
            disabled={totalSelectedItems === 0}
          >
            Clear Selection
          </button>
          <button
            className="gift-pack-add-btn"
            onClick={handleAddToCart}
            disabled={!canAddToCart}
          >
            {canAddToCart
              ? 'Add to Cart'
              : `Use $${remainingValue.toFixed(2)} more value`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiftPackModal;
