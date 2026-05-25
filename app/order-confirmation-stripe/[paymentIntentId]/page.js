'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { FaCircleCheck } from 'react-icons/fa6';
import { productMap, STANDARD_SIZE } from '@/data/products';
import OrderConfirmationSkeleton from '@/components/OrderConfirmation/OrderConfirmationSkeleton';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function OrderConfirmationStripePage() {
  const params = useParams();
  const paymentIntentId = params.paymentIntentId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate runs (React StrictMode guard)
    if (hasFetchedRef.current || !paymentIntentId) {
      return;
    }
    hasFetchedRef.current = true;

    const fetchOrderFromStripe = async () => {
      try {
        console.log(
          'Fetching order from Stripe with Payment Intent ID:',
          paymentIntentId,
        );

        // Fetch order details from Stripe via our API
        const response = await fetch(
          `/api/stripe-order?paymentIntentId=${paymentIntentId}`,
        );

        if (response.ok) {
          const orderData = await response.json();
          console.log('Order fetched from Stripe:', orderData);
          setOrder(orderData);

          // Email is already sent from /api/orders when order is created
          // No need to send another email here

          setLoading(false);
          return;
        }

        // If API fails, show specific error message
        const errorData = await response.json().catch(() => ({}));
        console.error(
          'API call failed:',
          response.status,
          response.statusText,
          errorData,
        );

        if (response.status === 404) {
          setError(
            'Order not found. Please check your payment confirmation or contact support.',
          );
        } else {
          setError('Failed to load order details. Please try again later.');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
        setLoading(false);
      }
    };

    fetchOrderFromStripe();
  }, [paymentIntentId]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="order-confirmation-page">
          <div className="container">
            <OrderConfirmationSkeleton />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <main className="order-confirmation-page">
          <div className="container">
            <div className="order-confirmation-error">
              <div className="order-confirmation-error-icon">
                <FaExclamationTriangle />
              </div>
              <h1>Order Not Found</h1>
              <p>We couldn&apos;t find the order you&apos;re looking for.</p>
              <Link href="/" className="order-confirmation-home-btn">
                Return to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const formatPrice = price => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = timestamp => {
    const date = new Date(timestamp * 1000);
    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    // Remove comma after weekday (e.g., "Sun, Jan 4, 2026" -> "Sun Jan 4, 2026")
    return formatted.replace(/^(\w+),/, '$1');
  };

  const formatItemSize = size => {
    if (!size || size === STANDARD_SIZE) return STANDARD_SIZE;
    return size;
  };

  return (
    <>
      <Header />
      <main className="order-confirmation-page">
        <div className="container">
          <div className="order-confirmation-header">
            <div className="order-confirmation-success">
              <div className="order-confirmation-success-icon">
                <FaCircleCheck />
              </div>
              <div className="order-confirmation-success-content">
                <h1 className="order-confirmation-title">Order Confirmed</h1>
                <p className="order-confirmation-subtitle">
                  Thank you for your order. We&apos;ve received your payment and
                  will begin processing your order shortly.
                </p>
              </div>
            </div>
          </div>

          <div className="order-confirmation-content">
            <div className="order-confirmation-left">
              <div className="order-confirmation-details">
                <h2 className="order-confirmation-section-title">
                  Order Details
                </h2>

                <div className="order-confirmation-info">
                  <div className="order-confirmation-info-row">
                    <span className="order-confirmation-info-label">
                      Order Number:
                    </span>
                    <span className="order-confirmation-info-value">
                      {order.orderNumber || order.paymentIntentId}
                    </span>
                  </div>
                  <div className="order-confirmation-info-row">
                    <span className="order-confirmation-info-label">
                      Order Date:
                    </span>
                    <span className="order-confirmation-info-value">
                      {formatDate(order.created)}
                    </span>
                  </div>
                  <div className="order-confirmation-info-row">
                    <span className="order-confirmation-info-label">
                      Status:
                    </span>
                    <span className="order-confirmation-info-value order-confirmation-status">
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="order-confirmation-shipping">
                  <h3 className="order-confirmation-shipping-title">
                    Shipping Address
                  </h3>
                  <div className="order-confirmation-shipping-address">
                    <p>{order.customerName}</p>
                    <p>{order.customerEmail}</p>
                    {order.shippingAddress && order.shippingAddress.line1 && (
                      <>
                        <p>{order.shippingAddress.line1}</p>
                        <p>
                          {order.shippingAddress.city},{' '}
                          {order.shippingAddress.state}{' '}
                          {order.shippingAddress.postal_code}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="order-confirmation-items">
                  <h3 className="order-confirmation-items-title">
                    Items Ordered
                  </h3>
                  {order.items.map((item, index) => {
                    // Get image from productItems if not available in order item
                    const productImage =
                      item.image ||
                      productMap[item.id]?.image ||
                      '/images/fallback-placeholder.png';
                    return (
                      <div
                        key={index}
                        className={`order-confirmation-item ${item.isFreeItem ? 'order-confirmation-item-free' : ''}`}
                      >
                        <div className="order-confirmation-item-image">
                          <Image
                            src={productImage}
                            alt={item.name}
                            width={60}
                            height={60}
                            className="order-confirmation-item-img"
                          />
                          {item.isFreeItem && (
                            <div className="order-confirmation-free-badge">
                              FREE
                            </div>
                          )}
                        </div>
                        <div className="order-confirmation-item-info">
                          <h4 className="order-confirmation-item-name">
                            {item.name}
                          </h4>
                          <p className="order-confirmation-item-size">
                            Size: {formatItemSize(item.size)}
                          </p>
                          {item.isFreeItem ? (
                            <p className="order-confirmation-item-price order-confirmation-free-price">
                              <span className="order-confirmation-original-price">
                                ${item.price.toFixed(2)}
                              </span>
                              <span className="order-confirmation-free-label">
                                FREE
                              </span>{' '}
                              × {item.quantity}
                            </p>
                          ) : (
                            <p className="order-confirmation-item-price">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          )}
                        </div>
                        <div className="order-confirmation-item-total">
                          {item.isFreeItem ? (
                            <span className="order-confirmation-free-total">
                              $0.00
                            </span>
                          ) : (
                            formatPrice(item.price * item.quantity)
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="order-confirmation-total">
                  <div className="order-confirmation-total-row">
                    <span className="order-confirmation-total-label">
                      Subtotal:
                    </span>
                    <span className="order-confirmation-total-value">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>
                  <div className="order-confirmation-total-row">
                    <span className="order-confirmation-total-label">
                      Shipping:
                    </span>
                    <span className="order-confirmation-total-value">
                      {formatPrice(order.shipping)}
                    </span>
                  </div>
                  <div className="order-confirmation-total-row order-confirmation-total-final">
                    <span className="order-confirmation-total-label">
                      Total:
                    </span>
                    <span className="order-confirmation-total-value">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-confirmation-right">
              <div className="order-confirmation-next-steps">
                <h3 className="order-confirmation-next-steps-title">
                  What is next?
                </h3>

                <div className="order-confirmation-next-steps-list">
                  <div className="order-confirmation-next-step">
                    <div className="order-confirmation-next-step-icon">📧</div>
                    <div className="order-confirmation-next-step-content">
                      <h4>Order Confirmation</h4>
                      <p>You&apos;ll receive an email confirmation shortly.</p>
                    </div>
                  </div>

                  <div className="order-confirmation-next-step">
                    <div className="order-confirmation-next-step-icon">📦</div>
                    <div className="order-confirmation-next-step-content">
                      <h4>Processing</h4>
                      <p>
                        We&apos;ll begin processing your order within 24 hours.
                      </p>
                    </div>
                  </div>

                  <div className="order-confirmation-next-step">
                    <div className="order-confirmation-next-step-icon">🚚</div>
                    <div className="order-confirmation-next-step-content">
                      <h4>Shipping</h4>
                      <p>Your order will ship within 7-10 business days.</p>
                    </div>
                  </div>
                </div>

                <div className="order-confirmation-contact">
                  <h4>Questions?</h4>
                  <p>
                    If you have any questions about your order, please contact
                    us:
                  </p>
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:rj@noci.farm">rj@noci.farm</a>
                  </p>
                  <p>
                    <strong>Phone:</strong>{' '}
                    <a href="tel:+19167995611">916 799 5611</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-confirmation-actions">
            <Link href="/" className="order-confirmation-home-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
