'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import {
  DEFAULT_SIZE,
  getProductPrice,
  normalizeProductSize,
  productMap,
  STANDARD_SIZE,
} from '@/data/products';
import { getCheckoutButtonLabel } from '@/lib/cart-display';
import { freeEntitlementForQuantity } from '@/lib/bogo';
import { FiX, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import BOGOSelectionModal from '@/components/BOGOSelectionModal';
import './CartSidebar.css';

const getCartItemKey = (id, size = STANDARD_SIZE) => `${id}::${size}`;

const isBOGOEligible = item =>
  !item.type || (item.type !== 'variety-pack' && item.type !== 'gift-pack');

const CartSidebar = () => {
  const { state, closeCart, addItem, updateQuantity, clearCart } = useCart();
  const router = useRouter();
  const [bogoQueue, setBogoQueue] = useState([]);

  const activeBOGOSelection = useMemo(() => bogoQueue[0] || null, [bogoQueue]);
  const pendingSelectionsCount = bogoQueue.length;

  const handleQuantityChange = (id, size, isFreeItem, newQuantity) => {
    if (newQuantity < 0) return;
    updateQuantity(id, size, newQuantity, isFreeItem);
  };

  const enqueueBOGOSelection = item => {
    setBogoQueue(prev => [
      ...prev,
      {
        id: item.id,
        size: item.size || STANDARD_SIZE,
        name: item.name,
      },
    ]);
  };

  const handlePaidItemIncrement = item => {
    const nextQuantity = item.quantity + 1;
    handleQuantityChange(item.id, item.size, false, nextQuantity);

    // Buy 2, get 1: only offer a free pick when crossing a new threshold.
    if (
      isBOGOEligible(item) &&
      freeEntitlementForQuantity(nextQuantity) >
        freeEntitlementForQuantity(item.quantity)
    ) {
      enqueueBOGOSelection(item);
    }
  };

  const closeActiveBOGOSelection = () => {
    setBogoQueue(prev => prev.slice(1));
  };

  const handleBOGOFreeItemSelection = selectedProduct => {
    if (!activeBOGOSelection) return;

    // Guard against a stale queued pick: if the paid line's quantity was reduced
    // after this selection was enqueued, its free entitlement may already be
    // fully used. Drop the pick rather than create an un-checkoutable cart.
    const paidKey = getCartItemKey(
      activeBOGOSelection.id,
      activeBOGOSelection.size,
    );
    const paidLine = state.items.find(
      cartItem =>
        !cartItem.isFreeItem && getCartItemKey(cartItem.id, cartItem.size) === paidKey,
    );
    const entitlement = paidLine
      ? freeEntitlementForQuantity(paidLine.quantity)
      : 0;
    const consumedFreeUnits = state.items
      .filter(
        cartItem =>
          cartItem.isFreeItem && cartItem.linkedToCartItemKey === paidKey,
      )
      .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

    if (consumedFreeUnits >= entitlement) {
      closeActiveBOGOSelection();
      return;
    }

    const freeSize = normalizeProductSize(
      selectedProduct,
      activeBOGOSelection.size || DEFAULT_SIZE,
    );
    const price = getProductPrice(selectedProduct, freeSize);

    addItem({
      id: selectedProduct.id,
      name: selectedProduct.name,
      image: selectedProduct.image,
      size: freeSize,
      price,
      quantity: 1,
      isFreeItem: true,
      linkedToProduct: activeBOGOSelection.name,
      linkedToCartItemKey: getCartItemKey(
        activeBOGOSelection.id,
        activeBOGOSelection.size,
      ),
      cartItemId: `free-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    });

    closeActiveBOGOSelection();
  };

  const formatPrice = price => {
    return `$${price.toFixed(2)}`;
  };

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (state.isOpen) {
      // Prevent scrolling on the body
      document.body.style.overflow = 'hidden';

      // Prevent scrolling on html element as well (for mobile browsers)
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Restore scrolling
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [state.isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-sidebar-backdrop ${state.isOpen ? 'open' : ''}`}
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div
        className={`cart-sidebar ${state.isOpen ? 'cart-sidebar-open' : ''}`}
      >
        <div className="cart-sidebar-header">
          <div className="cart-sidebar-title">
            <FiShoppingBag size={20} />
            <span>Your Cart</span>
            {state.totalItems > 0 && (
              <span className="cart-sidebar-count">{state.totalItems}</span>
            )}
          </div>
          <button className="cart-sidebar-close-btn" onClick={closeCart}>
            <FiX size={20} />
          </button>
        </div>

        <div className="cart-sidebar-content">
          {state.items.length === 0 ? (
            <div className="cart-sidebar-empty">
              <FiShoppingBag size={48} className="cart-sidebar-empty-icon" />
              <p className="cart-sidebar-empty-text">
                What do you call a nut on the wall?
                <br /> a walnut{' '}
              </p>
              <p className="cart-sidebar-empty-subtext">
                your cart is empty
                <br />
              </p>
            </div>
          ) : (
            <>
              <div className="cart-sidebar-items">
                {state.items.map((item, index) => {
                  const isVarietyPack = item.type === 'variety-pack';
                  const isGiftPack = item.type === 'gift-pack';
                  const isPack = isVarietyPack || isGiftPack;

                  return (
                    <div
                      key={
                        item.cartItemId ||
                        `${item.id}-${item.size}-${Boolean(item.isFreeItem)}-${index}`
                      }
                      className={`cart-sidebar-item ${
                        isPack ? 'cart-sidebar-item-pack' : ''
                      }`}
                    >
                      {isPack ? (
                        <div className="cart-sidebar-item-content">
                          <div className="cart-sidebar-item-image">
                            <Image
                              src={
                                item.image || '/images/fallback-placeholder.png'
                              }
                              alt={item.name}
                              width={60}
                              height={60}
                              className="cart-sidebar-item-img"
                            />
                          </div>
                          <div className="cart-sidebar-item-info">
                            <h4 className="cart-sidebar-item-name">
                              {item.name}
                            </h4>

                            {/* Pack contents details */}
                            {isVarietyPack && item.contents && (
                              <p className="cart-sidebar-pack-details">
                                Contains:{' '}
                                {item.contents
                                  .map(id => productMap[id]?.name)
                                  .join(', ')}
                              </p>
                            )}

                            {isGiftPack && item.selectionDetails && (
                              <p className="cart-sidebar-pack-details">
                                Your selection: {item.selectionDetails}
                              </p>
                            )}

                            <p className="cart-sidebar-item-price">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="cart-sidebar-item-image">
                            <Image
                              src={
                                item.image || '/images/fallback-placeholder.png'
                              }
                              alt={item.name}
                              width={60}
                              height={60}
                              className="cart-sidebar-item-img"
                            />
                            {item.isFreeItem && (
                              <div className="cart-sidebar-free-badge">
                                FREE
                              </div>
                            )}
                          </div>
                          <div className="cart-sidebar-item-info">
                            <h4 className="cart-sidebar-item-name">
                              {item.name}
                              {item.size && item.size !== STANDARD_SIZE && (
                                <span className="cart-sidebar-item-size">
                                  {' '}
                                  ({item.size})
                                </span>
                              )}
                            </h4>

                            {item.isFreeItem && item.linkedToProduct && (
                              <p className="cart-sidebar-free-with">
                                Free with {item.linkedToProduct}
                              </p>
                            )}

                            <p className="cart-sidebar-item-price">
                              {item.isFreeItem ? (
                                <>
                                  <span className="cart-sidebar-original-price">
                                    {formatPrice(item.price)}
                                  </span>
                                  <span className="cart-sidebar-free-label">
                                    FREE
                                  </span>
                                </>
                              ) : (
                                formatPrice(item.price)
                              )}
                            </p>
                          </div>
                        </>
                      )}
                      <div className="cart-sidebar-item-actions">
                        {item.isFreeItem ? (
                          // Free items: show locked quantity, no controls
                          <div className="cart-sidebar-free-locked">
                            <span className="cart-sidebar-quantity-locked">
                              {item.quantity}
                            </span>
                            <span className="cart-sidebar-locked-label">
                              Linked to {item.linkedToProduct}
                            </span>
                          </div>
                        ) : (
                          // Regular items: show quantity controls
                          <>
                            <div className="cart-sidebar-quantity-controls">
                              <button
                                className="cart-sidebar-quantity-btn"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.size,
                                    false,
                                    item.quantity - 1,
                                  )
                                }
                              >
                                <FiMinus size={12} />
                              </button>
                              <span className="cart-sidebar-quantity">
                                {item.quantity}
                              </span>
                              <button
                                className="cart-sidebar-quantity-btn"
                                onClick={() => handlePaidItemIncrement(item)}
                              >
                                <FiPlus size={12} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="cart-sidebar-summary">
          <div className="cart-sidebar-total">
            <span className="cart-sidebar-total-label">Total:</span>
            <span className="cart-sidebar-total-price">
              {formatPrice(state.totalPrice)}
            </span>
          </div>
          <div className="cart-sidebar-buttons">
            <button
              className="cart-sidebar-checkout-btn"
              onClick={() => {
                closeCart();
                router.push('/checkout');
              }}
            >
              {getCheckoutButtonLabel(state.totalItems)}
            </button>
            <button className="cart-sidebar-clear-btn" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      <BOGOSelectionModal
        isOpen={Boolean(activeBOGOSelection)}
        onClose={closeActiveBOGOSelection}
        onSelectFreeItem={handleBOGOFreeItemSelection}
        triggerItemName={activeBOGOSelection?.name}
        requiredSize={activeBOGOSelection?.size}
        pendingSelectionsCount={pendingSelectionsCount}
      />
    </>
  );
};

export default CartSidebar;
