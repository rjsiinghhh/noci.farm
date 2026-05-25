'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import './feedback.css';
import { FaExclamationCircle } from 'react-icons/fa';
import { FaCircleCheck } from 'react-icons/fa6';
import { STANDARD_SIZE } from '@/data/products';
import {
  buildFeedbackRatingKey,
  buildInitialRatings,
} from '@/lib/feedback-ratings';

export default function FeedbackForm() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params.orderNumber;
  const token = searchParams.get('token');

  const [order, setOrder] = useState(null);
  const [ratings, setRatings] = useState({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/feedback/verify?orderNumber=${encodeURIComponent(
          orderNumber,
        )}&token=${encodeURIComponent(token)}`,
      );
      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
        setRatings(buildInitialRatings(data.order.items));
      } else {
        // Check if error is about existing feedback
        if (data.error && data.error.includes('already been submitted')) {
          setError(
            'Your feedback for this order has already been recorded. Thank you!',
          );
          setSuccess(true); // Show success state for better UX
        } else {
          setError(data.error || 'Invalid or expired feedback link.');
        }
      }
    } catch (err) {
      setError('Failed to load order. Please try again.');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  }, [orderNumber, token]);

  useEffect(() => {
    if (orderNumber && token) {
      fetchOrder();
    } else {
      setError('Invalid feedback link. Please use the link from your email.');
      setLoading(false);
    }
  }, [orderNumber, token, fetchOrder]);

  const handleRatingChange = (ratingKey, rating) => {
    setRatings(prev => ({
      ...prev,
      [ratingKey]: rating,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate that all order lines have ratings
    const ratingValues = Object.values(ratings);
    const allRated =
      ratingValues.length === order.items.length &&
      ratingValues.every(rating => rating > 0);
    if (!allRated) {
      setError('Please rate all products before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber,
          token,
          productRatings: ratings,
          overallFeedback,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        // Check if error is about duplicate feedback
        if (data.error && data.error.includes('already been submitted')) {
          setError(
            'Your feedback for this order has already been recorded. Thank you!',
          );
          setSuccess(true); // Show success state even if duplicate
        } else {
          setError(
            data.error || 'Failed to submit feedback. Please try again.',
          );
        }
      }
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      console.error('Error submitting feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatItemSize = size => {
    if (!size || size === STANDARD_SIZE) return STANDARD_SIZE;
    return size;
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="feedback-page">
          <div className="container">
            <div className="feedback-loading">
              <div className="feedback-loading-spinner"></div>
              <p>Loading feedback form...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // if (error && !order) {
  //   return (
  //     <>
  //       <Header />
  //       <main className="feedback-page">
  //         <div className="container">
  //           <div className="feedback-error">
  //             <div className="feedback-error-icon">
  //               <FaExclamationCircle />
  //             </div>
  //             <h2 className="feedback-error-title">Error Occurred!</h2>
  //             <p className="feedback-error-message">{error}</p>
  //           </div>
  //         </div>
  //       </main>
  //       <Footer />
  //     </>
  //   );
  // }

  if (error && !order) {
    return (
      <>
        <Header />
        <main className="feedback-page">
          <div className="container">
            <div className="feedback-success">
              <div className="feedback-success-icon">
                <FaCircleCheck />
              </div>
              <h2 className="feedback-success-title">Thank You!</h2>
              <p className="feedback-success-message">
                Your feedback has been submitted successfully.
              </p>
              <p className="feedback-success-message">
                We appreciate you taking the time to share your experience with
                us.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (success) {
    return (
      <>
        <Header />
        <main className="feedback-page">
          <div className="container">
            <div className="feedback-success">
              <div className="feedback-success-icon">
                <FaCircleCheck />
              </div>
              <h2 className="feedback-success-title">Thank You!</h2>
              <p className="feedback-success-message">
                Your feedback has been submitted successfully.
              </p>
              <p className="feedback-success-message">
                We appreciate you taking the time to share your experience with
                us.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="feedback-page">
        <div className="container">
          <div className="feedback-header">
            <h1 className="feedback-title">Share Your Feedback</h1>
            <p className="feedback-subtitle">
              Help us improve by rating your products and sharing your
              experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="feedback-form">
            {error && (
              <div className="feedback-form-error">
                <span>{error}</span>
              </div>
            )}

            <div className="feedback-products">
              <h2 className="feedback-section-title">Rate Your Products</h2>
              <p className="feedback-section-subtitle">
                Please rate each product you purchased (1-5 stars)
              </p>

              {order.items.map((item, index) => {
                const ratingKey = buildFeedbackRatingKey(item, index);

                return (
                  <div
                    key={ratingKey}
                    className={`feedback-product ${item.isFreeItem ? 'feedback-product-free' : ''}`}
                  >
                    <div className="feedback-product-info">
                      <h3 className="feedback-product-name">
                        {item.name}
                        {item.isFreeItem && (
                          <span className="feedback-free-badge">FREE</span>
                        )}
                      </h3>
                      <p className="feedback-product-details">
                        Size: {formatItemSize(item.size)} | Quantity:{' '}
                        {item.quantity} | Price:{' '}
                        {item.isFreeItem
                          ? '$0.00'
                          : formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="feedback-product-rating">
                      <div className="feedback-stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(ratingKey, star)}
                            className={`feedback-star ${
                              ratings[ratingKey] >= star ? 'active' : ''
                            }`}
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      {ratings[ratingKey] > 0 && (
                        <span className="feedback-rating-value">
                          {ratings[ratingKey]} star
                          {ratings[ratingKey] > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="feedback-overall">
              <h2 className="feedback-section-title">Overall Feedback</h2>
              <p className="feedback-section-subtitle">
                Share your overall experience with your order (optional)
              </p>
              <textarea
                value={overallFeedback}
                onChange={e => setOverallFeedback(e.target.value)}
                className="feedback-textarea"
                placeholder="Tell us about your experience..."
                rows={6}
              />
            </div>

            <div className="feedback-submit">
              <button
                type="submit"
                className="feedback-submit-button"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
