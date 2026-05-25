import React, { useState, useEffect } from 'react';

const PaymentProcessingModal = ({ isOpen }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRedirecting(false);
      // After 2 seconds, assume we're redirecting if still open
      const timer = setTimeout(() => {
        setIsRedirecting(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="payment-processing-modal-overlay">
      <div className="payment-processing-modal">
        <div className="payment-processing-modal-content">
          <div className="payment-processing-modal-spinner">
            <div className="spinner"></div>
          </div>
          <h3 className="payment-processing-modal-title">
            {isRedirecting ? 'Redirecting...' : 'Confirming Payment...'}
          </h3>
          <p className="payment-processing-modal-subtitle">
            {isRedirecting
              ? 'Taking you to your confirmation page...'
              : 'Please wait while we process your order and prepare your confirmation.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessingModal;
