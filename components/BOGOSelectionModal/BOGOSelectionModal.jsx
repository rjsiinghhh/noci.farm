'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { IoGift, IoClose } from 'react-icons/io5';
import {
  getProductPrice,
  normalizeProductSize,
  productItems,
  STANDARD_SIZE,
} from '@/data/products';
import './BOGOSelectionModal.css';

const BOGOSelectionModal = ({
  isOpen,
  onClose,
  onSelectFreeItem,
  triggerItemName,
  requiredSize,
  pendingSelectionsCount = 1,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Get only eligible products (not packs)
  const eligibleProducts = productItems.filter(
    product =>
      !product.type ||
      (product.type !== 'variety-pack' && product.type !== 'gift-pack'),
  );

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const handleEscape = event => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Reset selection when opening
      setSelectedProductId(null);
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = previousBodyOverflow;
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    onClose();
  };

  const handleSelectProduct = productId => {
    setSelectedProductId(productId);
  };

  const handleAddFreeItem = () => {
    if (!selectedProductId) return;

    const selectedProduct = eligibleProducts.find(
      p => p.id === selectedProductId,
    );
    if (selectedProduct) {
      const matchedSize = normalizeProductSize(selectedProduct, requiredSize);
      onSelectFreeItem({ ...selectedProduct, size: matchedSize });
      handleClose();
    }
  };

  if (!isOpen) return null;

  const canAddFreeItem = selectedProductId !== null;

  return (
    <div className="bogo-modal-overlay" onClick={handleClose}>
      <div
        className="bogo-modal"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bogo-title"
      >
        {/* Header */}
        <div className="bogo-modal-header">
          <div className="bogo-modal-header-content">
            <IoGift className="bogo-modal-header-icon" />
            <div>
              <h2 id="bogo-title" className="bogo-modal-title">
                Choose Your Free Item!
              </h2>
              <p className="bogo-modal-subtitle">
                You're getting a free item with your {triggerItemName}. Pick any
                one below!
              </p>
              <p className="bogo-modal-subtitle">
                Free item size matches your paid item size:{' '}
                {requiredSize || STANDARD_SIZE}.
              </p>
              {pendingSelectionsCount > 1 && (
                <p className="bogo-modal-subtitle">
                  {pendingSelectionsCount} free selections pending.
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            className="bogo-modal-close"
            onClick={handleClose}
            aria-label="Close free item selection"
          >
            <IoClose />
          </button>
        </div>

        {/* Selection Notice */}
        <div className="bogo-selection-notice">
          <span className="bogo-selection-text">
            {selectedProductId
              ? `✓ ${eligibleProducts.find(p => p.id === selectedProductId)?.name} selected`
              : 'Select one item below'}
          </span>
        </div>

        {/* Product Grid */}
        <div className="bogo-products-grid">
          {eligibleProducts.map(product => {
            const isSelected = selectedProductId === product.id;

            return (
              <div
                key={product.id}
                className={`bogo-product-card ${isSelected ? 'bogo-product-card-selected' : ''}`}
                onClick={() => handleSelectProduct(product.id)}
              >
                <div className="bogo-product-image-wrapper">
                  <Image
                    src={product.image || '/images/fallback-placeholder.png'}
                    alt={product.name}
                    fill
                    className="bogo-product-image"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {isSelected && <div className="bogo-product-check">✓</div>}
                </div>
                <div className="bogo-product-info">
                  <h3 className="bogo-product-name">{product.name}</h3>
                  <p className="bogo-product-price">
                    <span className="bogo-original-price">
                      ${getProductPrice(product, requiredSize).toFixed(2)}
                    </span>
                    <span className="bogo-free-label">FREE</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bogo-modal-footer">
          <button
            className="bogo-skip-btn"
            onClick={handleClose}
          >
            Skip Free Item
          </button>
          <button
            className="bogo-add-btn"
            onClick={handleAddFreeItem}
            disabled={!canAddFreeItem}
          >
            {canAddFreeItem ? 'Add Free Item to Cart' : 'Select an item above'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BOGOSelectionModal;
