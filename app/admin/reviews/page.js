'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { IoSearch } from 'react-icons/io5';
import { STANDARD_SIZE } from '@/data/products';
import { parseFeedbackRatingKey } from '@/lib/feedback-ratings';
import './reviews.css';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const searchTimeoutRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const fetchReviews = useCallback(async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        // Only show full loading on initial load, not during search/filter
        if (isInitialLoadRef.current) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
      }
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/reviews?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        if (append) {
          setReviews(prevReviews => [...prevReviews, ...(data.reviews || [])]);
        } else {
          setReviews(data.reviews || []);
        }
        setCurrentPage(page);
        setHasMore(data.pagination?.hasMore || false);
        isInitialLoadRef.current = false;
      } else {
        setError(data.error || 'Failed to load reviews');
      }
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchReviews(currentPage + 1, true);
    }
  };

  // Fetch reviews when component mounts
  useEffect(() => {
    fetchReviews(1, false);
  }, [fetchReviews]);

  // Debounced search on keypress
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchReviews(1, false);
    }, 500); // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      setCurrentPage(1);
      fetchReviews(1, false);
    }
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAverageRating = productRatings => {
    const ratings = Object.values(productRatings);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const formatItemSize = size => {
    if (!size || size === STANDARD_SIZE) return STANDARD_SIZE;
    return size;
  };

  // Resolve product details for both line-based and legacy rating keys.
  const getProductDetails = (ratingKey, orderItems) => {
    if (!orderItems || !Array.isArray(orderItems)) return null;

    const parsed = parseFeedbackRatingKey(ratingKey);
    if (!parsed) return null;

    if (parsed.mode === 'line') {
      return (
        orderItems[parsed.lineIndex] ||
        orderItems.find(
          item =>
            String(item.id) === String(parsed.productId) &&
            formatItemSize(item.size) === formatItemSize(parsed.size),
        ) ||
        null
      );
    }

    return (
      orderItems.find(item => String(item.id) === String(parsed.productId)) ||
      null
    );
  };

  return (
    <div className="admin-reviews">
      <div className="admin-reviews-header">
        <h1 className="admin-reviews-title">Reviews</h1>
        <p className="admin-reviews-subtitle">
          Search and manage all customer reviews. View review details, track
          product ratings, and monitor review history
        </p>
      </div>

      <div className="admin-reviews-filters">
        <div className="admin-reviews-search">
          <IoSearch className="admin-reviews-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search by order number or customer name..."
            className="admin-reviews-search-input"
          />
        </div>
      </div>

      {error && (
        <div className="admin-reviews-error">
          <p>{error}</p>
          <button onClick={() => fetchReviews(1, false)} className="admin-dashboard-retry">
            Retry
          </button>
        </div>
      )}

      {loading && reviews.length === 0 ? (
        <div className="admin-reviews-loading">
          <div className="admin-loading-spinner"></div>
          <p>Loading reviews...</p>
        </div>
      ) : (
        <div className="admin-reviews-list">
          {reviews.length === 0 ? (
            <div className="admin-reviews-empty">
              <p>No reviews found</p>
            </div>
          ) : (
            <div className={`admin-reviews-list-content ${loadingMore && !loading ? 'admin-reviews-list-loading' : ''}`}>
              {loadingMore && !loading && (
                <div className="admin-reviews-loading-overlay">
                  <div className="admin-loading-spinner"></div>
                </div>
              )}
              {reviews.map(review => (
                <div key={review.id} className="admin-review-card">
                  <div className="admin-review-header">
                    <div className="admin-review-header-left">
                      <h3 className="admin-review-order-number">
                        Order: <code>{review.order_number}</code>
                      </h3>
                      {review.customer_name && (
                        <p className="admin-review-customer">
                          Customer: <strong>{review.customer_name}</strong>
                        </p>
                      )}
                      {review.total_amount && (
                        <p className="admin-review-total">
                          Total: <strong>{formatCurrency(review.total_amount)}</strong>
                        </p>
                      )}
                      <p className="admin-review-date">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                    <div className="admin-review-header-right">
                      <div className="admin-review-average">
                        <span className="admin-review-average-label">
                          Average Rating:
                        </span>
                        <span className="admin-review-average-value">
                          {getAverageRating(review.product_ratings)} / 5
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-review-products">
                    <h4 className="admin-review-products-title">
                      Product Ratings:
                    </h4>
                    <div className="admin-review-products-list">
                      {Object.entries(review.product_ratings).map(
                        ([ratingKey, rating]) => {
                          const productDetails = getProductDetails(
                            ratingKey,
                            review.order_items,
                          );
                          const parsed = parseFeedbackRatingKey(ratingKey);
                          return (
                            <div key={ratingKey} className="admin-review-product">
                              <div className="admin-review-product-info">
                                <span className="admin-review-product-name">
                                  {productDetails?.name ||
                                    `Product ID: ${parsed?.productId || ratingKey}`}
                                </span>
                                {productDetails && (
                                  <div className="admin-review-product-details">
                                    <span className="admin-review-product-quantity">
                                      Quantity: {productDetails.quantity}
                                    </span>
                                    <span className="admin-review-product-size">
                                      Size: {formatItemSize(productDetails.size)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="admin-review-product-rating">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span
                                    key={star}
                                    className={`admin-review-star ${
                                      rating >= star ? 'active' : ''
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                                <span className="admin-review-product-rating-value">
                                  ({rating}/5)
                                </span>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {review.overall_feedback && (
                    <div className="admin-review-feedback">
                      <h4 className="admin-review-feedback-title">
                        Overall Feedback:
                      </h4>
                      <p className="admin-review-feedback-text">
                        {review.overall_feedback}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {hasMore && (
            <div className="admin-reviews-load-more">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="admin-reviews-load-more-button"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
