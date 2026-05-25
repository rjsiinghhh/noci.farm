import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import './PaymentForm.css';

const PaymentForm = ({
  paymentIntent,
  onSuccess,
  onBack,
  customerInfo,
  isLoading,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe or elements not loaded');
      return;
    }

    setProcessing(true);
    setPaymentError('');

    try {
      console.log(
        'Confirming payment with client secret:',
        paymentIntent.clientSecret
      );

      const { error, paymentIntent: confirmedPaymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/order-confirmation-stripe/${paymentIntent.paymentIntentId}`,
            payment_method_data: {
              billing_details: {
                name: customerInfo.name,
                email: customerInfo.email,
                address: {
                  line1: customerInfo.address,
                  city: customerInfo.city,
                  state: customerInfo.state,
                  postal_code: customerInfo.zipCode,
                  country: 'US',
                },
              },
            },
          },
          redirect: 'if_required',
        });

      if (error) {
        console.error('Payment error:', error);
        setPaymentError(error.message);
      } else if (confirmedPaymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', confirmedPaymentIntent);
        setPaymentError(''); // Clear any previous errors
        onSuccess(confirmedPaymentIntent);
      } else {
        console.log('Payment status:', confirmedPaymentIntent.status);
        setPaymentError(
          'Payment was not completed successfully. Please try again.'
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('An unexpected error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const paymentElementOptions = {
    layout: 'tabs',
    fields: {
      billingDetails: {
        name: 'auto',
        email: 'auto',
        address: 'auto',
      },
    },
  };

  return (
    <div className="payment-form">
      <div className="payment-form-header">
        <h3 className="payment-form-title">Payment Information</h3>
        <p className="payment-form-subtitle">
          Complete your order with secure payment
        </p>
      </div>

      <div className="payment-form-summary">
        <div className="payment-form-summary-item">
          <span className="payment-form-summary-label">Shipping to:</span>
          <span className="payment-form-summary-value">
            {customerInfo.name}, {customerInfo.address}, {customerInfo.city},{' '}
            {customerInfo.state} {customerInfo.zipCode}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form-content">
        <div className="payment-form-field">
          <label className="payment-form-label">Payment Information *</label>
          <div className="payment-form-payment-element">
            <PaymentElement options={paymentElementOptions} />
          </div>
        </div>

        {paymentError && (
          <div className="payment-form-error">
            <span className="payment-form-error-text">{paymentError}</span>
          </div>
        )}

        <div className="payment-form-footer">
          <button
            type="button"
            onClick={onBack}
            className="payment-form-back-btn"
            disabled={processing}
          >
            Back to Shipping
          </button>

          <button
            type="submit"
            className="payment-form-submit-btn"
            disabled={processing || isLoading}
          >
            {processing ? 'Processing Payment...' : 'Complete Order'}
          </button>
        </div>
      </form>

      <div className="payment-form-security">
        <div className="payment-form-security-icon">🔒</div>
        <div className="payment-form-security-text">
          <p>Your payment information is secure and encrypted.</p>
          <p>We never store your card details on our servers.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
