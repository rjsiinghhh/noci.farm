'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './dashboard.css';
import { FaEye } from 'react-icons/fa6';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      } else {
        setError(data.error || 'Failed to load stats');
      }
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
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
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-error">
        <p>{error}</p>
        <button onClick={fetchStats} className="admin-dashboard-retry">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-title">Dashboard</h1>
        <p className="admin-dashboard-subtitle">
          Monitor your business performance with real-time statistics, revenue
          tracking, and recent order activity
        </p>
      </div>

      <div className="admin-dashboard-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📦</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-label">Total Orders</h3>
            <p className="admin-stat-value">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">💰</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-label">Total Revenue</h3>
            <p className="admin-stat-value">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">⏳</div>
          <div className="admin-stat-content">
            <h3 className="admin-stat-label">Pending Orders</h3>
            <p className="admin-stat-value">{stats.pendingOrders}</p>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-recent">
        <div className="admin-dashboard-recent-header">
          <h2 className="admin-dashboard-recent-title">Recent Orders</h2>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="admin-dashboard-empty">
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="admin-dashboard-orders-table">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th className="admin-orders-table-no">Order Number</th>
                  <th className="admin-orders-table-customer">Customer</th>
                  <th className="admin-orders-table-amount">Amount</th>
                  <th className="admin-orders-table-status">Status</th>
                  <th className="admin-orders-table-order-date">Order Date</th>
                  <th className="admin-orders-table-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <code className="admin-order-number">
                        {order.order_number}
                      </code>
                    </td>
                    <td>{order.customer_name}</td>
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
        )}
      </div>
    </div>
  );
}
