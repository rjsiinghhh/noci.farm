'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import CheckoutForm from '@/components/Checkout/CheckoutForm';
import OrderSummary from '@/components/Checkout/OrderSummary';
import PaymentProcessingModal from '@/components/Checkout/PaymentProcessingModal';
import CheckoutSkeleton from '@/components/Checkout/CheckoutSkeleton';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import './Checkout.css';

export default function CheckoutPage() {
  const { state } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('Checkout page state:', {
      isLoading: state.isLoading,
      itemsLength: state.items.length,
      items: state.items,
      isNavigating,
      showProcessingModal,
    });
  }, [
    state.isLoading,
    state.items.length,
    state.items,
    isNavigating,
    showProcessingModal,
  ]);

  // Redirect if cart is empty, but not when navigating to confirmation or while loading
  useEffect(() => {
    if (
      !state.isLoading &&
      state.items.length === 0 &&
      !isNavigating &&
      !showProcessingModal
    ) {
      console.log('Redirecting to home - cart is empty');
      router.push('/');
    }
  }, [
    state.isLoading,
    state.items.length,
    router,
    isNavigating,
    showProcessingModal,
  ]);

  // Show loading state while cart is being restored from localStorage
  if (state.isLoading) {
    return (
      <>
        <Header />
        <main className="checkout-page">
          <div className="container">
            <div className="checkout-header">
              <h1 className="checkout-title">Checkout</h1>
              <p className="checkout-subtitle">Loading your order...</p>
            </div>
            <CheckoutSkeleton />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (state.items.length === 0 && !isNavigating && !showProcessingModal) {
    return null; // Will redirect
  }

  return (
    <>
      <Header />
      <main className="checkout-page">
        <div className="container">
          <div className="checkout-header">
            <h1 className="checkout-title">Checkout</h1>
            <p className="checkout-subtitle">
              Enter your shipping and payment information to complete your
              purchase
            </p>
          </div>

          <div className="checkout-content">
            <div className="checkout-left">
              <CheckoutForm
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setShowProcessingModal={setShowProcessingModal}
                setIsNavigating={setIsNavigating}
              />
            </div>

            <div className="checkout-right">
              <OrderSummary items={state.items} />
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Payment Processing Modal */}
      <PaymentProcessingModal isOpen={showProcessingModal} />
    </>
  );
}
