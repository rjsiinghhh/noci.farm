'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import AlertModal from '@/components/AlertModal';
import { STANDARD_SIZE } from '@/data/products';
import './track-order.css';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [markingReceived, setMarkingReceived] = useState(false);
  const [feedbackExists, setFeedbackExists] = useState(false);
  const [feedbackSubmittedAt, setFeedbackSubmittedAt] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleAutoSearch = async (orderNum, emailAddr) => {
    setError('');
    setOrder(null);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(
          orderNum,
        )}&email=${encodeURIComponent(emailAddr)}`,
      );
      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
      } else {
        setError(
          data.error ||
            'Order not found. Please check your order number and email.',
        );
      }
    } catch (err) {
      setError('Failed to load order. Please try again.');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  // Read URL parameters on mount
  useEffect(() => {
    const urlOrderNumber = searchParams.get('orderNumber');
    const urlEmail = searchParams.get('email');
    if (urlOrderNumber && urlEmail) {
      setOrderNumber(urlOrderNumber);
      setEmail(urlEmail);
      // Auto-search if both params are present
      handleAutoSearch(urlOrderNumber, urlEmail);
    }
  }, [searchParams]);

  const handleSearch = async e => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(
          orderNumber,
        )}&email=${encodeURIComponent(email)}`,
      );
      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
      } else {
        setError(
          data.error ||
            'Order not found. Please check your order number and email.',
        );
      }
    } catch (err) {
      setError('Failed to load order. Please try again.');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReceived = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmMarkReceived = async () => {
    setShowConfirmModal(false);
    setMarkingReceived(true);
    setFeedbackExists(false);
    setFeedbackSubmittedAt(null);

    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: order.order_number,
          email: order.customer_email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if feedback already exists
        if (data.feedbackExists) {
          setFeedbackExists(true);
          setFeedbackSubmittedAt(data.feedbackSubmittedAt);
          // Update order status in local state
          setOrder(prev => (prev ? { ...prev, status: 'received' } : null));
        } else if (data.token) {
          // Redirect to feedback form only if feedback doesn't exist and token is provided
          router.push(`/feedback/${order.order_number}?token=${data.token}`);
        } else {
          setError('Failed to generate feedback link. Please try again.');
        }
      } else {
        setError(data.error || 'Failed to mark order as received');
      }
    } catch (err) {
      setError('Failed to mark order as received');
      console.error('Error marking order as received:', err);
    } finally {
      setMarkingReceived(false);
    }
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusMessage = status => {
    const statusMessages = {
      paid: 'Your payment has been received.',
      processing: 'Your order is being prepared.',
      shipped: 'Your order has been shipped.',
      delivered: 'Your order has been delivered.',
      received: 'You have confirmed receipt of your order.',
    };
    return statusMessages[status] || 'Your order is being processed.';
  };

  const formatItemSize = size => {
    if (!size || size === STANDARD_SIZE) return STANDARD_SIZE;
    return size;
  };

  return (
    <>
      <Header />
      <main className="track-order-page">
        <div className="container">
          <div className="track-order-header">
            <h1 className="track-order-title">Track Your Order</h1>
            <p className="track-order-subtitle">
              Enter your order number and email to view order details
            </p>
          </div>

          {!order ? (
            <div className="track-order-form-container">
              <form onSubmit={handleSearch} className="track-order-form">
                {error && (
                  <div className="track-order-error">
                    <span>{error}</span>
                  </div>
                )}

                <div className="track-order-field">
                  <label htmlFor="orderNumber" className="track-order-label">
                    Order Number
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    value={orderNumber}
                    onChange={e => setOrderNumber(e.target.value)}
                    className="track-order-input"
                    placeholder="e.g., ORD-2026-0104-123"
                    required
                  />
                </div>

                <div className="track-order-field">
                  <label htmlFor="email" className="track-order-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="track-order-input"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="track-order-button"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Track Order'}
                </button>
              </form>
            </div>
          ) : (
            <div className="track-order-result">
              <div className="track-order-status-card">
                <div className="track-order-status-header">
                  <h2 className="track-order-status-title">Order Status</h2>
                  <span
                    className={`track-order-status-badge track-order-status-${order.status}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
                <p className="track-order-status-message">
                  {getStatusMessage(order.status)}
                </p>
              </div>

              <div className="track-order-details">
                <div className="track-order-details-section">
                  <h3 className="track-order-details-title">
                    Order Information
                  </h3>
                  <div className="track-order-details-grid">
                    <div className="track-order-details-item">
                      <span className="track-order-details-label">
                        Order Number:
                      </span>
                      <span className="track-order-details-value">
                        <code>{order.order_number}</code>
                      </span>
                    </div>
                    <div className="track-order-details-item">
                      <span className="track-order-details-label">
                        Order Date:
                      </span>
                      <span className="track-order-details-value">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    {order.tracking_number && (
                      <div className="track-order-details-item">
                        <span className="track-order-details-label">
                          Tracking Number:
                        </span>
                        <span className="track-order-details-value">
                          <code>{order.tracking_number}</code>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="track-order-details-section">
                  <h3 className="track-order-details-title">Items Ordered</h3>
                  <div className="track-order-items">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className={`track-order-item ${item.isFreeItem ? 'track-order-item-free' : ''}`}
                      >
                        <div className="track-order-item-info">
                          <h4 className="track-order-item-name">
                            {item.name}
                            {item.isFreeItem && (
                              <span className="track-order-free-badge">
                                FREE
                              </span>
                            )}
                          </h4>
                          <p className="track-order-item-details">
                            Size: {formatItemSize(item.size)} | Quantity:{' '}
                            {item.quantity}
                          </p>
                        </div>
                        <div
                          className={`track-order-item-price ${item.isFreeItem ? 'track-order-free-price' : ''}`}
                        >
                          {item.isFreeItem
                            ? '$0.00'
                            : formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="track-order-details-section">
                  <h3 className="track-order-details-title">Order Total</h3>
                  <div className="track-order-totals">
                    <div className="track-order-total-row">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="track-order-total-row">
                      <span>Shipping:</span>
                      <span>{formatCurrency(order.shipping)}</span>
                    </div>
                    <div className="track-order-total-row track-order-total-final">
                      <span>Total:</span>
                      <span>{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {(order.status === 'shipped' || order.status === 'delivered') &&
                  !feedbackExists && (
                    <div className="track-order-actions">
                      <button
                        onClick={handleMarkReceived}
                        disabled={markingReceived}
                        className="track-order-received-button"
                      >
                        {markingReceived ? 'Processing...' : 'Mark as Received'}
                      </button>
                      <p className="track-order-received-note">
                        Once you mark your order as received, you&apos;ll be
                        able to leave feedback.
                      </p>
                    </div>
                  )}

                {feedbackExists && (
                  <div className="track-order-feedback-exists">
                    <div className="track-order-feedback-exists-icon">✓</div>
                    <h3 className="track-order-feedback-exists-title">
                      Feedback Already Submitted
                    </h3>
                    <p className="track-order-feedback-exists-message">
                      Thank you! Your feedback for this order has already been
                      recorded.
                      {feedbackSubmittedAt && (
                        <span className="track-order-feedback-exists-date">
                          {' '}
                          Submitted on {formatDate(feedbackSubmittedAt)}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {order.status === 'received' && !feedbackExists && (
                  <div className="track-order-actions">
                    <p className="track-order-received-note">
                      Your order has been marked as received. You can leave
                      feedback using the link sent to your email.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <AlertModal
        isOpen={showConfirmModal}
        message="Mark this order as received?"
        type="info"
        variant="confirm"
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmMarkReceived}
      />
    </>
  );
}

export default function TrackOrder() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <main className="track-order-page">
            <div className="container">
              <div className="track-order-header">
                <h1 className="track-order-title">Track Your Order</h1>
                <p className="track-order-subtitle">
                  Enter your order number and email to view order details
                </p>
              </div>
              <div className="track-order-form-container">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>Loading...</p>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
