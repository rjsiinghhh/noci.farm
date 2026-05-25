import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { SHIPPING_CONFIG } from '@/lib/stripe';
import AlertModal from '@/components/AlertModal';
import CustomerInfoForm from '../CustomerInfoForm';
import PaymentForm from '../PaymentForm';
import PaymentSkeleton from '../PaymentSkeleton';
import StripeProvider from '../StripeProvider';
import './CheckoutForm.css';

const CheckoutForm = ({
  isLoading,
  setIsLoading,
  setShowProcessingModal,
  setIsNavigating,
}) => {
  const { state, clearCart } = useCart();
  const router = useRouter();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: 'California',
    zipCode: '',
  });
  const [currentStep, setCurrentStep] = useState('customer-info');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: '',
    type: 'error',
    onClose: null,
  });

  // Debug logging
  console.log('CheckoutForm rendered with state:', {
    currentStep,
    hasPaymentIntent: !!paymentIntent,
    cartItemsCount: state.items.length,
    customerInfo,
  });

  const subtotal = state.items.reduce(
    (sum, item) => sum + (item.isFreeItem ? 0 : item.price * item.quantity),
    0
  );
  const shipping =
    subtotal >= SHIPPING_CONFIG.FREE_THRESHOLD ? 0 : SHIPPING_CONFIG.FLAT_RATE;
  const total = subtotal + shipping;

  const handleCustomerInfoSubmit = async info => {
    setCustomerInfo(info);

    try {
      setIsLoading(true);
      console.log('Creating payment intent for items:', state.items);

      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: state.items,
          customerInfo: info,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to create payment intent: ${response.status} ${
            errorData.error || 'Unknown error'
          }`
        );
      }

      const data = await response.json();
      console.log('Payment intent created successfully:', data);
      setPaymentIntent(data);
      setCurrentStep('payment');

      // Scroll to top when transitioning to payment step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setAlertModal({
        isOpen: true,
        message: `Failed to initialize payment: ${error.message}`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async orderData => {
    try {
      setShowProcessingModal(true);
      console.log('Payment successful, creating order...', orderData);

      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerInfo,
          items: state.items,
          totalAmount: total,
          stripePaymentIntentId: paymentIntent.paymentIntentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to create order: ${errorData.error || 'Unknown error'}`
        );
      }

      const { order } = await response.json();
      console.log('Order created successfully:', order);

      // Set navigation flag to prevent redirect
      setIsNavigating(true);

      // Navigate to Stripe-based confirmation page using Payment Intent ID
      // The modal will naturally disappear when the page changes
      router.push(
        `/order-confirmation-stripe/${paymentIntent.paymentIntentId}`
      );

      // Clear cart after a small delay to ensure navigation has started
      setTimeout(() => {
        clearCart();
      }, 100);
    } catch (error) {
      console.error('Error creating order:', error);

      // Even if order creation fails, we should still redirect to a success page
      // or show a success message since payment was successful
      setAlertModal({
        isOpen: true,
        message:
          'Payment successful but failed to create order. Please contact support with your payment confirmation.',
        type: 'error',
        onClose: () => {
          setAlertModal({ isOpen: false, message: '', type: 'error' });
          clearCart();
          setShowProcessingModal(false);
          router.push('/');
        },
      });
    }
  };

  const handleBackToCustomerInfo = () => {
    setCurrentStep('customer-info');
    // Scroll to top when going back to customer info step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="checkout-form">
      <div className="checkout-form-header">
        <div className="checkout-form-steps">
          <div
            className={`checkout-form-step ${
              currentStep === 'customer-info' ? 'active' : ''
            }`}
          >
            <span className="checkout-form-step-number">1</span>
            <span className="checkout-form-step-text">
              Customer Information
            </span>
          </div>
          <div
            className={`checkout-form-step ${
              currentStep === 'payment' ? 'active' : ''
            }`}
          >
            <span className="checkout-form-step-number">2</span>
            <span className="checkout-form-step-text">Payment</span>
          </div>
        </div>
      </div>

      <div className="checkout-form-content">
        {currentStep === 'customer-info' && (
          <CustomerInfoForm
            customerInfo={customerInfo}
            onSubmit={handleCustomerInfoSubmit}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'payment' && !paymentIntent && <PaymentSkeleton />}

        {currentStep === 'payment' && paymentIntent && (
          <StripeProvider clientSecret={paymentIntent.clientSecret}>
            <PaymentForm
              paymentIntent={paymentIntent}
              onSuccess={handlePaymentSuccess}
              onBack={handleBackToCustomerInfo}
              customerInfo={customerInfo}
              isLoading={isLoading}
            />
          </StripeProvider>
        )}
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={
          alertModal.onClose ||
          (() => setAlertModal({ isOpen: false, message: '', type: 'error' }))
        }
      />
    </div>
  );
};

export default CheckoutForm;
