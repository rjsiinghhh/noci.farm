import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import './StripeProvider.css';

const StripeProvider = ({ children, clientSecret }) => {
  const [stripePromise, setStripePromise] = React.useState(null);

  React.useEffect(() => {
    const loadStripe = async () => {
      try {
        console.log('Loading Stripe...');
        const stripe = await getStripe();
        console.log('Stripe loaded successfully:', !!stripe);
        setStripePromise(stripe);
      } catch (error) {
        console.error('Error loading Stripe:', error);
      }
    };
    loadStripe();
  }, []);

  console.log('StripeProvider state:', {
    hasStripePromise: !!stripePromise,
    hasClientSecret: !!clientSecret,
  });

  if (!stripePromise) {
    return (
      <div className="stripe-provider-loading">
        <div className="stripe-provider-loading-spinner"></div>
        <p>Loading payment system...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
