'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { IoSearch, IoChevronDown } from 'react-icons/io5';
import { FaEye } from 'react-icons/fa6';
import './orders.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const searchTimeoutRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const fetchOrders = useCallback(
    async (page = 1, append = false) => {
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
        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }

        const response = await fetch(`/api/admin/orders?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          if (append) {
            setOrders(prevOrders => [...prevOrders, ...(data.orders || [])]);
          } else {
            setOrders(data.orders || []);
          }
          setCurrentPage(page);
          setHasMore(data.pagination?.hasMore || false);
          isInitialLoadRef.current = false;
        } else {
          setError(data.error || 'Failed to load orders');
        }
      } catch (err) {
        setError('Failed to load orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [statusFilter, searchQuery]
  );

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchOrders(currentPage + 1, true);
    }
  };

  // Fetch orders when status filter changes
  useEffect(() => {
    setCurrentPage(1);
    fetchOrders(1, false);
  }, [statusFilter, fetchOrders]);

  // Debounced search on keypress
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders(1, false);
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
      fetchOrders(1, false);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-orders">
      <div className="admin-orders-header">
        <h1 className="admin-orders-title">Orders</h1>
        <p className="admin-orders-subtitle">
          Search, filter, and manage all customer orders. View order details,
          track status updates, and monitor order history with advanced
          filtering options
        </p>
      </div>

      <div className="admin-orders-filters">
        <div className="admin-orders-search">
          <IoSearch className="admin-orders-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search by order number, customer name, or email..."
            className="admin-orders-search-input"
          />
        </div>

        <div className="admin-orders-status-filter">
          <div className="admin-orders-filter-wrapper">
            <select
              id="status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="admin-orders-filter-select"
            >
              <option value="all">All Orders</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="received">Received</option>
            </select>
            <IoChevronDown className="admin-orders-filter-icon" />
          </div>
        </div>
      </div>

      {error && (
        <div className="admin-orders-error">
          <p>{error}</p>
          <button
            onClick={() => fetchOrders(1, false)}
            className="admin-dashboard-retry"
          >
            Retry
          </button>
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="admin-orders-loading">
          <div className="admin-loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : (
        <div className="admin-dashboard-recent">
          {orders.length === 0 ? (
            <div className="admin-orders-empty">
              <p>No orders found</p>
            </div>
          ) : (
            <>
              <div
                className={`admin-dashboard-orders-table ${
                  loadingMore && !loading ? 'admin-orders-table-loading' : ''
                }`}
              >
                {loadingMore && !loading && (
                  <div className="admin-orders-loading-overlay">
                    <div className="admin-loading-spinner"></div>
                  </div>
                )}
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th className="admin-orders-table-no">Order Number</th>
                      <th className="admin-orders-table-customer">Customer</th>
                      <th className="admin-orders-table-email">Email</th>
                      <th className="admin-orders-table-amount">Amount</th>
                      <th className="admin-orders-table-status">Status</th>
                      <th className="admin-orders-table-order-date">
                        Order Date
                      </th>
                      <th className="admin-orders-table-action">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <code className="admin-order-number">
                            {order.order_number}
                          </code>
                        </td>
                        <td>{order.customer_name}</td>
                        <td>{order.customer_email}</td>
                        <td>{formatCurrency(order.total_amount)}</td>
                        <td>
                          <span
                            className={`admin-status-badge admin-status-${order.status}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="admin-order-link"
                          >
                            <FaEye />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hasMore && (
                <div className="admin-orders-load-more">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="admin-orders-load-more-button"
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
