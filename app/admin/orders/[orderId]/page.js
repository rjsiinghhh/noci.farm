'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoChevronDown } from 'react-icons/io5';
import AlertModal from '@/components/AlertModal';
import { STANDARD_SIZE } from '@/data/products';
import '../orders.css';
import './order-detail.css';

export default function AdminOrderDetail() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('');
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${params.orderId}`);
      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Failed to load order');
      }
    } catch (err) {
      setError('Failed to load order');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  }, [params.orderId]);

  useEffect(() => {
    if (params.orderId) {
      fetchOrder();
    }
  }, [params.orderId, fetchOrder]);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/orders/${params.orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
        setAlertModal({
          isOpen: true,
          message: 'Order updated successfully',
          type: 'success',
        });
      } else {
        setAlertModal({
          isOpen: true,
          message: data.error || 'Failed to update order',
          type: 'error',
        });
      }
    } catch (err) {
      setAlertModal({
        isOpen: true,
        message: 'Failed to update order',
        type: 'error',
      });
      console.error('Error updating order:', err);
    } finally {
      setUpdating(false);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatItemSize = size => {
    if (!size || size === STANDARD_SIZE) return STANDARD_SIZE;
    return size;
  };

  if (loading) {
    return (
      <div className="admin-order-detail-loading">
        <div className="admin-loading-spinner"></div>
        <p>Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="admin-order-detail-error">
        <p>{error || 'Order not found'}</p>
        <Link href="/admin/orders" className="admin-order-link">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-order-detail">
      <div className="admin-order-detail-header">
        <Link href="/admin/orders" className="admin-order-back-link">
          ← Back to Orders
        </Link>
        <h1 className="admin-order-detail-title">
          Order: {order.order_number}
        </h1>
      </div>

      <div className="admin-order-detail-content">
        <div className="admin-order-detail-main">
          <div className="admin-order-detail-section">
            <h2 className="admin-order-detail-section-title">
              Order Information
            </h2>
            <div className="admin-order-detail-info-grid">
              <div className="admin-order-detail-info-item">
                <span className="admin-order-detail-info-label">
                  Order Number:
                </span>
                <span className="admin-order-detail-info-value">
                  <code>{order.order_number}</code>
                </span>
              </div>
              <div className="admin-order-detail-info-item">
                <span className="admin-order-detail-info-label">Status:</span>
                <span className="admin-order-detail-info-value">
                  <span
                    className={`admin-status-badge admin-status-${order.status}`}
                  >
                    {order.status}
                  </span>
                </span>
              </div>
              <div className="admin-order-detail-info-item">
                <span className="admin-order-detail-info-label">Date:</span>
                <span className="admin-order-detail-info-value">
                  {formatDate(order.created_at)}
                </span>
              </div>
              <div className="admin-order-detail-info-item">
                <span className="admin-order-detail-info-label">
                  Payment Intent:
                </span>
                <span className="admin-order-detail-info-value">
                  <code>{order.stripe_payment_intent_id}</code>
                </span>
              </div>
            </div>
          </div>

          <div className="admin-order-detail-section">
            <h2 className="admin-order-detail-section-title">
              Customer Information
            </h2>
            <div className="admin-order-detail-info-grid">
              <div className="admin-order-detail-info-item">
                <span className="admin-order-detail-info-label">Name:</span>
                <span className="admin-order-detail-info-value">
                  {order.customer_name}
                </span>
              </div>
              <div className="admin-order-detail-info-item">
                <span className="admin-order-detail-info-label">Email:</span>
                <span className="admin-order-detail-info-value">
                  <a href={`mailto:${order.customer_email}`}>
                    {order.customer_email}
                  </a>
                </span>
              </div>
              <div className="admin-order-detail-info-item">
                <span className="admin-order-detail-info-label">Address:</span>
                <span className="admin-order-detail-info-value">
                  {order.customer_address.address}
                  <br />
                  {order.customer_address.city}, {order.customer_address.state}{' '}
                  {order.customer_address.zipCode}
                </span>
              </div>
            </div>
          </div>

          <div className="admin-order-detail-section">
            <h2 className="admin-order-detail-section-title">Order Items</h2>
            <div className="admin-order-detail-items">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className={`admin-order-detail-item ${item.isFreeItem ? 'admin-order-detail-item-free' : ''}`}
                >
                  <div className="admin-order-detail-item-info">
                    <h4 className="admin-order-detail-item-name">
                      {item.name}
                      {item.isFreeItem && (
                        <span className="admin-order-free-badge">FREE</span>
                      )}
                    </h4>
                    <p className="admin-order-detail-item-details">
                      Size: {formatItemSize(item.size)} | Quantity:{' '}
                      {item.quantity}
                    </p>
                  </div>
                  <div
                    className={`admin-order-detail-item-price ${item.isFreeItem ? 'admin-order-free-price' : ''}`}
                  >
                    {item.isFreeItem
                      ? '$0.00'
                      : formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-order-detail-section">
            <h2 className="admin-order-detail-section-title">Order Totals</h2>
            <div className="admin-order-detail-totals">
              <div className="admin-order-detail-total-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="admin-order-detail-total-row">
                <span>Shipping:</span>
                <span>{formatCurrency(order.shipping)}</span>
              </div>
              <div className="admin-order-detail-total-row admin-order-detail-total-final">
                <span>Total:</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-order-detail-sidebar">
          <div className="admin-order-detail-actions">
            <h3 className="admin-order-detail-actions-title">Update Order</h3>

            <div className="admin-order-detail-action-field">
              <label
                htmlFor="status"
                className="admin-order-detail-action-label"
              >
                Status
              </label>
              <div className="admin-order-detail-select-wrapper">
                <select
                  id="status"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="admin-order-detail-action-select"
                >
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="received">Received</option>
                </select>
                <IoChevronDown className="admin-order-detail-select-icon" />
              </div>
            </div>

            <button
              onClick={handleStatusUpdate}
              disabled={updating}
              className="admin-order-detail-update-button"
            >
              {updating ? 'Updating...' : 'Update Order'}
            </button>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() =>
          setAlertModal({ isOpen: false, message: '', type: 'info' })
        }
      />
    </div>
  );
}
