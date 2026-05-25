'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { STANDARD_SIZE } from '@/data/products';

// Initial cart state
const initialState = {
  items: [],
  isOpen: false,
  totalItems: 0,
  totalPrice: 0,
  isLoading: true, // Add loading state
};

// Cart actions
const cartActions = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  TOGGLE_CART: 'TOGGLE_CART',
  CLOSE_CART: 'CLOSE_CART',
  OPEN_CART: 'OPEN_CART',
  SET_CART: 'SET_CART',
  SET_LOADING: 'SET_LOADING',
};

const getCartItemKey = (id, size = STANDARD_SIZE) => `${id}::${size}`;

const calculateCartTotals = items => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => (item.isFreeItem ? sum : sum + item.price * item.quantity),
    0,
  );

  return { totalItems, totalPrice };
};

// Cart reducer
function cartReducer(state, action) {
  switch (action.type) {
    case cartActions.SET_CART:
      const newState = {
        ...state,
        ...action.payload,
      };

      return newState;

    case cartActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case cartActions.ADD_ITEM: {
      const payload = action.payload;
      const payloadIsFreeItem = Boolean(payload.isFreeItem);

      // Free picks should always be a separate line item so users can select per paid quantity.
      if (payloadIsFreeItem) {
        const newItems = [
          ...state.items,
          {
            ...payload,
            isFreeItem: true,
            quantity: 1,
            cartItemId:
              payload.cartItemId ||
              `free-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          },
        ];

        const { totalItems, totalPrice } = calculateCartTotals(newItems);
        return {
          ...state,
          items: newItems,
          totalItems,
          totalPrice,
        };
      }

      const existingItemIndex = state.items.findIndex(
        item =>
          item.id === payload.id &&
          item.size === payload.size &&
          !Boolean(item.isFreeItem),
      );

      let newItems;
      if (existingItemIndex > -1) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + payload.quantity }
            : item,
        );
      } else {
        // Add new item
        newItems = [...state.items, { ...payload, isFreeItem: false }];
      }

      const { totalItems, totalPrice } = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case cartActions.REMOVE_ITEM: {
      const { id, size, isFreeItem } = action.payload;
      const isTargetFreeItem = Boolean(isFreeItem);

      // Find the item being removed
      const itemToRemove = state.items.find(
        item =>
          item.id === id &&
          item.size === size &&
          Boolean(item.isFreeItem) === isTargetFreeItem,
      );

      let newItems;

      if (itemToRemove && !Boolean(itemToRemove.isFreeItem)) {
        const paidItemKey = getCartItemKey(itemToRemove.id, itemToRemove.size);

        // If removing a paid item, also remove any linked free items
        newItems = state.items.filter(item => {
          // Remove the paid item itself
          if (
            item.id === id &&
            item.size === size &&
            !Boolean(item.isFreeItem)
          ) {
            return false;
          }

          // Remove free picks linked to this paid line item.
          const isLinkedByKey =
            Boolean(item.isFreeItem) &&
            item.linkedToCartItemKey === paidItemKey;
          const isLinkedByLegacyName =
            Boolean(item.isFreeItem) &&
            !item.linkedToCartItemKey &&
            item.linkedToProduct === itemToRemove.name;

          if (isLinkedByKey || isLinkedByLegacyName) {
            return false;
          }

          return true;
        });
      } else {
        // If removing a free item directly, just remove it
        newItems = state.items.filter(
          item =>
            !(
              item.id === id &&
              item.size === size &&
              Boolean(item.isFreeItem) === isTargetFreeItem
            ),
        );
      }

      const { totalItems, totalPrice } = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case cartActions.UPDATE_QUANTITY: {
      const {
        id,
        size,
        quantity,
        isFreeItem: payloadIsFreeItem,
      } = action.payload;
      // When reducing to 0, resolve isFreeItem from state if not provided (e.g. from quantity controls on paid items)
      const resolvedIsFreeItem =
        payloadIsFreeItem !== undefined
          ? Boolean(payloadIsFreeItem)
          : (state.items.find(i => i.id === id && i.size === size)
              ?.isFreeItem ?? false);
      const isFreeItem = resolvedIsFreeItem;

      if (quantity <= 0) {
        return cartReducer(state, {
          type: cartActions.REMOVE_ITEM,
          payload: { id, size, isFreeItem },
        });
      }

      let newItems = state.items.map(item =>
        item.id === id &&
        item.size === size &&
        (item.isFreeItem ?? false) === (isFreeItem ?? false)
          ? { ...item, quantity }
          : item,
      );

      // Keep free item entitlement aligned when paid quantity decreases.
      if (!isFreeItem) {
        const paidItem = newItems.find(
          item =>
            item.id === id && item.size === size && !Boolean(item.isFreeItem),
        );

        if (paidItem) {
          const paidItemKey = getCartItemKey(paidItem.id, paidItem.size);
          const linkedFreeItems = newItems.filter(
            item =>
              Boolean(item.isFreeItem) &&
              (item.linkedToCartItemKey === paidItemKey ||
                (!item.linkedToCartItemKey &&
                  item.linkedToProduct === paidItem.name)),
          );

          const linkedFreeUnits = linkedFreeItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );

          if (linkedFreeUnits > paidItem.quantity) {
            let unitsToTrim = linkedFreeUnits - paidItem.quantity;
            const trimmedItems = [...newItems];

            for (
              let i = trimmedItems.length - 1;
              i >= 0 && unitsToTrim > 0;
              i--
            ) {
              const item = trimmedItems[i];
              const isLinkedFree =
                Boolean(item.isFreeItem) &&
                (item.linkedToCartItemKey === paidItemKey ||
                  (!item.linkedToCartItemKey &&
                    item.linkedToProduct === paidItem.name));

              if (!isLinkedFree) continue;

              if (item.quantity > unitsToTrim) {
                trimmedItems[i] = {
                  ...item,
                  quantity: item.quantity - unitsToTrim,
                };
                unitsToTrim = 0;
              } else {
                unitsToTrim -= item.quantity;
                trimmedItems.splice(i, 1);
              }
            }

            newItems = trimmedItems;
          }
        }
      }

      const { totalItems, totalPrice } = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case cartActions.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };

    case cartActions.TOGGLE_CART:
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case cartActions.CLOSE_CART:
      return {
        ...state,
        isOpen: false,
      };

    case cartActions.OPEN_CART:
      return {
        ...state,
        isOpen: true,
      };

    default:
      return state;
  }
}

// Create cart context
const CartContext = createContext();

// Cart provider component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Handle RESTORE_CART action
  const enhancedDispatch = action => {
    if (action.type === 'RESTORE_CART') {
      return dispatch({
        type: cartActions.SET_CART,
        payload: action.payload,
      });
    }
    dispatch(action);
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');

    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        // Restore cart items but reset UI state
        enhancedDispatch({
          type: 'RESTORE_CART',
          payload: {
            items: cartData.items || [],
            totalItems: cartData.totalItems || 0,
            totalPrice: cartData.totalPrice || 0,
          },
        });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    } else {
      console.log('Cart context: No saved cart data found');
    }
    // Set loading to false after attempting to load from localStorage

    dispatch({ type: cartActions.SET_LOADING, payload: false });
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      'cart',
      JSON.stringify({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    );
  }, [state.items, state.totalItems, state.totalPrice]);

  // Add SET_CART to reducer
  const value = {
    state,
    dispatch: enhancedDispatch,
    addItem: item =>
      enhancedDispatch({ type: cartActions.ADD_ITEM, payload: item }),
    removeItem: (id, size, isFreeItem = false) =>
      enhancedDispatch({
        type: cartActions.REMOVE_ITEM,
        payload: { id, size, isFreeItem },
      }),
    updateQuantity: (id, size, quantity, isFreeItem) =>
      enhancedDispatch({
        type: cartActions.UPDATE_QUANTITY,
        payload: { id, size, quantity, isFreeItem },
      }),
    clearCart: () => enhancedDispatch({ type: cartActions.CLEAR_CART }),
    toggleCart: () => enhancedDispatch({ type: cartActions.TOGGLE_CART }),
    closeCart: () => enhancedDispatch({ type: cartActions.CLOSE_CART }),
    openCart: () => enhancedDispatch({ type: cartActions.OPEN_CART }),
    buyNow: (item, router) => {
      // Add item to cart first
      enhancedDispatch({ type: cartActions.ADD_ITEM, payload: item });
      // Then redirect to checkout
      router.push('/checkout');
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
