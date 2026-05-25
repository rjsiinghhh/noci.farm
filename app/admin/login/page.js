'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './login.css';

export default function AdminLogin() {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secret }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store admin session in localStorage
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_session_time', Date.now().toString());
        // Redirect to admin dashboard
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid admin secret');
      }
    } catch (err) {
      setError('Failed to authenticate. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1 className="admin-login-title">Noci Farm Admin</h1>
          <p className="admin-login-subtitle">Enter admin secret to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="admin-login-error">
              <span>{error}</span>
            </div>
          )}

          <div className="admin-login-field">
            <label htmlFor="secret" className="admin-login-label">
              Admin Secret *
            </label>
            <input
              type="password"
              id="secret"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              className="admin-login-input"
              placeholder="Enter admin secret"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
