'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import GiftPackModal from '@/components/GiftPackModal';
import BOGOSelectionModal from '@/components/BOGOSelectionModal';
import {
  DEFAULT_SIZE,
  getProductPrice,
  normalizeProductSize,
  productMap,
  SIZE_OPTIONS,
  STANDARD_SIZE,
} from '@/data/products';
import { freeEntitlementForQuantity } from '@/lib/bogo';
import './ProductGrid.css';

// Helper to check if product is eligible for BOGO
const isBOGOEligible = item => {
  return (
    !item.type || (item.type !== 'variety-pack' && item.type !== 'gift-pack')
  );
};

// Helper to check if product has Stripe configuration (can be purchased)
const hasStripeConfig = item => {
  if (!item) return false;
  if (item.type === 'variety-pack' || item.type === 'gift-pack') return true;
  return item.price != null || Boolean(item.pricesBySize);
};

const getCartItemKey = (id, size = STANDARD_SIZE) => `${id}::${size}`;

export default function ProductGrid({ items, onItemClick }) {
  const { state, addItem, buyNow, openCart } = useCart();
  const router = useRouter();
  const [isGiftPackModalOpen, setIsGiftPackModalOpen] = useState(false);
  const [currentGiftPackItem, setCurrentGiftPackItem] = useState(null);

  // BOGO modal state
  const [isBOGOModalOpen, setIsBOGOModalOpen] = useState(false);
  const [currentBOGOTriggerItem, setCurrentBOGOTriggerItem] = useState(null);

  // Size selection per product (2.5 OZ / 4 OZ) for non-pack products; key = item.id
  const [selectedSizes, setSelectedSizes] = useState({});
  const getSizeForItem = item =>
    normalizeProductSize(item, selectedSizes[item.id] ?? DEFAULT_SIZE);
  const setSizeForItem = (itemId, size) => {
    setSelectedSizes(prev => ({ ...prev, [itemId]: size }));
  };

  const handleItemClick = item => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleAddToCart = (e, item) => {
    e.stopPropagation();

    // Handle Gift Pack differently
    if (item.type === 'gift-pack') {
      setCurrentGiftPackItem(item);
      setIsGiftPackModalOpen(true);
      return;
    }

    // Handle Variety Pack with contents (no BOGO for packs)
    if (item.type === 'variety-pack') {
      addItem({
        id: item.id,
        name: item.name,
        image: item.image,
        size: item.size || STANDARD_SIZE,
        price: item.price,
        quantity: 1,
        type: 'variety-pack',
        contents: item.contents,
      });
      openCart();
      return;
    }

    // Regular product - add to cart with selected size
    const size = getSizeForItem(item);
    const price = getProductPrice(item, size);

    // Determine whether this add earns a new free pick (buy 2, get 1).
    const existingPaidLine = state.items.find(
      cartItem =>
        cartItem.id === item.id &&
        cartItem.size === size &&
        !cartItem.isFreeItem,
    );
    const prevQuantity = existingPaidLine ? existingPaidLine.quantity : 0;
    const nextQuantity = prevQuantity + 1;

    addItem({
      id: item.id,
      name: item.name,
      image: item.image,
      size,
      price,
      quantity: 1,
    });

    // Only offer a free item when crossing a new free-entitlement threshold.
    if (
      freeEntitlementForQuantity(nextQuantity) >
      freeEntitlementForQuantity(prevQuantity)
    ) {
      setCurrentBOGOTriggerItem({ ...item, size });
      setIsBOGOModalOpen(true);
    } else {
      openCart();
    }
  };

  // Handle free item selection from BOGO modal
  const handleBOGOFreeItemSelection = selectedProduct => {
    const paidSize = normalizeProductSize(
      selectedProduct,
      currentBOGOTriggerItem?.size || DEFAULT_SIZE,
    );
    const freeSize = paidSize;
    const price = getProductPrice(selectedProduct, freeSize);

    addItem({
      id: selectedProduct.id,
      name: selectedProduct.name,
      image: selectedProduct.image,
      size: freeSize,
      price,
      quantity: 1,
      isFreeItem: true,
      linkedToProduct: currentBOGOTriggerItem?.name,
      linkedToCartItemKey: getCartItemKey(currentBOGOTriggerItem?.id, paidSize),
      cartItemId: `free-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    });
    openCart();
  };

  const handleBOGOModalClose = () => {
    setIsBOGOModalOpen(false);
    setCurrentBOGOTriggerItem(null);
    openCart(); // Still open cart even if user skips free item
  };

  const handleBuyNow = (e, item) => {
    e.stopPropagation();

    // Gift Pack needs selection first
    if (item.type === 'gift-pack') {
      setCurrentGiftPackItem(item);
      setIsGiftPackModalOpen(true);
      return;
    }

    // Handle Variety Pack
    if (item.type === 'variety-pack') {
      buyNow(
        {
          id: item.id,
          name: item.name,
          image: item.image,
          size: item.size || STANDARD_SIZE,
          price: item.price,
          quantity: 1,
          type: 'variety-pack',
          contents: item.contents,
        },
        router,
      );
      return;
    }

    // Regular product
    const size = getSizeForItem(item);
    buyNow(
        {
          id: item.id,
          name: item.name,
          image: item.image,
          size,
          price: getProductPrice(item, size),
          quantity: 1,
        },
        router,
      );
  };

  const handleGiftPackSelection = selections => {
    if (!currentGiftPackItem) return;

    // Build readable description of selection
    const selectionDetails = Object.entries(selections)
      .map(([selectionKey, quantity]) => {
        const [productId, size] = selectionKey.split('::');
        const product = productMap[productId];
        if (!product) return null;
        return `${quantity}× ${product.name} (${size})`;
      })
      .filter(Boolean)
      .join(', ');

    addItem({
      id: currentGiftPackItem.id,
      name: currentGiftPackItem.name,
      image: currentGiftPackItem.image,
      size: currentGiftPackItem.size || STANDARD_SIZE,
      price: currentGiftPackItem.price,
      quantity: 1,
      type: 'gift-pack',
      customSelection: selections,
      selectionDetails,
    });

    setCurrentGiftPackItem(null);
  };

  return (
    <>
      <div className="product-grid container">
        {items.map((item, index) => {
          const isPack =
            item.type === 'variety-pack' || item.type === 'gift-pack';
          const isGiftPack = item.type === 'gift-pack';

          const hasDetailImage = !!item.detailImage;

          return (
            <div
              key={item.id || index}
              className={`product-grid-item ${isPack ? 'product-grid-item-pack' : ''} ${hasDetailImage ? 'product-grid-item-detail' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              {/* Badge for pack products */}
              {item.badge && (
                <div className="product-grid-badge">{item.badge}</div>
              )}

              {/* Flip container: front = product image, back = detail image + button OR text + button */}
              <div
                className={`product-grid-flip-container ${hasDetailImage ? 'product-grid-flip-container-detail' : ''}`}
              >
                {/* Front side - always product image */}
                <div className="product-grid-flip-front">
                  <div className="product-grid-image-container">
                    <Image
                      src={item.image || '/images/fallback-placeholder.png'}
                      alt={item.name || 'Product'}
                      fill
                      className="product-grid-image"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </div>
                {/* Back side - detail image + button, or text description + buttons */}
                <div className="product-grid-flip-back">
                  {hasDetailImage ? (
                    <div className="product-grid-back-content product-grid-back-content-detail">
                      <div className="product-grid-detail-image-wrapper">
                        <Image
                          src={item.detailImage}
                          alt={`${item.name || 'Product'} product details`}
                          width={800}
                          height={1000}
                          className="product-grid-detail-image"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          style={{ width: '100%', height: 'full' }}
                        />
                      </div>
                      <div className="product-grid-detail-buttons">
                        <div
                          className="product-grid-size-selector"
                          role="group"
                          aria-label="Select size"
                        >
                          {SIZE_OPTIONS.map(size => {
                            const isSelected = getSizeForItem(item) === size;
                            const price = getProductPrice(item, size);
                            return (
                              <button
                                key={size}
                                type="button"
                                className={`product-grid-size-btn ${isSelected ? 'product-grid-size-btn-selected' : ''}`}
                                onClick={e => {
                                  e.stopPropagation();
                                  setSizeForItem(item.id, size);
                                }}
                              >
                                {size} – ${price.toFixed(2)}
                              </button>
                            );
                          })}
                        </div>
                        {hasStripeConfig(item) ? (
                          <button
                            className="primary-button"
                            onClick={e => handleAddToCart(e, item)}
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <button
                            className="primary-button coming-soon-button"
                            disabled
                          >
                            Coming Soon
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="product-grid-back-content">
                      <h3 className="product-grid-name">
                        {item.name || 'Product Name'}
                      </h3>
                      <p className="product-grid-price">
                        $
                        {getProductPrice(item, getSizeForItem(item)).toFixed(
                          2,
                        ) || '0.00'}
                      </p>
                      <p className="product-grid-back-description">
                        {item.description || 'No description available.'}
                      </p>
                      <div className="product-grid-back-buttons">
                        {hasStripeConfig(item) ? (
                          <button
                            className="primary-button"
                            onClick={e => handleAddToCart(e, item)}
                          >
                            {isGiftPack ? 'Customize Pack' : 'Add to Cart'}
                          </button>
                        ) : (
                          <button
                            className="primary-button coming-soon-button"
                            disabled
                          >
                            Coming Soon
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gift Pack Modal */}
      <GiftPackModal
        isOpen={isGiftPackModalOpen}
        onClose={() => {
          setIsGiftPackModalOpen(false);
          setCurrentGiftPackItem(null);
        }}
        onAddToCart={handleGiftPackSelection}
        maxItems={currentGiftPackItem?.selectCount || 5}
      />

      {/* BOGO Selection Modal */}
      <BOGOSelectionModal
        isOpen={isBOGOModalOpen}
        onClose={handleBOGOModalClose}
        onSelectFreeItem={handleBOGOFreeItemSelection}
        triggerItemName={currentBOGOTriggerItem?.name}
        requiredSize={currentBOGOTriggerItem?.size}
      />
    </>
  );
}
