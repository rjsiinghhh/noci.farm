'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './admin.css';
import Link from 'next/link';
import {
  IoHome,
  IoList,
  IoLogOut,
  IoStar,
  IoMenu,
  IoClose,
} from 'react-icons/io5';

export default function AdminLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if user is on login page
    if (pathname === '/admin/login') {
      setIsLoading(false);
      return;
    }

    // Check authentication
    const checkAuth = () => {
      const authenticated = localStorage.getItem('admin_authenticated');
      const sessionTime = localStorage.getItem('admin_session_time');

      if (authenticated === 'true' && sessionTime) {
        // Check if session is still valid (24 hours)
        const sessionAge = Date.now() - parseInt(sessionTime, 10);
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (sessionAge < twentyFourHours) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        } else {
          // Session expired
          localStorage.removeItem('admin_authenticated');
          localStorage.removeItem('admin_session_time');
        }
      }

      // Not authenticated, redirect to login
      setIsAuthenticated(false);
      setIsLoading(false);
      router.push('/admin/login');
    };

    checkAuth();
  }, [pathname, router]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If on login page, just render children
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If not authenticated, don't render (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Render admin layout with navigation
  return (
    <div className="admin-layout">
      {/* Backdrop overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${isSidebarOpen ? 'admin-sidebar-open' : ''}`}
      >
        <div className="admin-sidebar-header">
          <h2 className="admin-sidebar-title">Noci Admin</h2>
          <button
            className="admin-sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <IoClose />
          </button>
        </div>
        <nav className="admin-sidebar-nav">
          <Link
            href="/admin"
            className={`admin-sidebar-link ${
              pathname === '/admin' ? 'active' : ''
            }`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <IoHome />
            Dashboard
          </Link>
          <Link
            href="/admin/orders"
            className={`admin-sidebar-link ${
              pathname?.startsWith('/admin/orders') ? 'active' : ''
            }`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <IoList />
            Orders
          </Link>
          <Link
            href="/admin/reviews"
            className={`admin-sidebar-link ${
              pathname?.startsWith('/admin/reviews') ? 'active' : ''
            }`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <IoStar />
            Reviews
          </Link>
        </nav>
        <div className="admin-sidebar-footer">
          <button
            onClick={async () => {
              try {
                await fetch('/api/admin/auth', { method: 'DELETE' });
              } catch (err) {
                console.error('Logout error:', err);
              }
              localStorage.removeItem('admin_authenticated');
              localStorage.removeItem('admin_session_time');
              router.push('/admin/login');
            }}
            className="admin-sidebar-logout"
          >
            <IoLogOut />
            Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-header">
          <button
            className="admin-sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <IoMenu />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
