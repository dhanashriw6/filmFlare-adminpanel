'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearTokens, getStoredToken } from '@/api/client';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push('/login');
    } else {
      setChecking(false);
    }
  }, [router]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!profileDropdownOpen) return;
    const handleClose = () => setProfileDropdownOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [profileDropdownOpen]);

  const handleLogout = () => {
    clearTokens();
    router.push('/login');
  };

  if (checking) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--color-ivory, #fffef5)' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid rgba(255,174,0,0.2)',
          borderTopColor: 'var(--color-orange)',
          borderRadius: '50%',
          animation: 'dash-spin 0.75s linear infinite'
        }} />
        <style>{`
          @keyframes dash-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`dash-shell${sidebarCollapsed ? ' dash-shell--collapsed' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />
      <div className="dash-main">
        <header className="dash-topbar">
          <div className="dash-topbar-left">
          
          </div>
          <div className="dash-topbar-right" style={{ position: 'relative' }}>
            <button
              className="dash-avatar-btn"
              onClick={(e) => {
                e.stopPropagation();
                setProfileDropdownOpen((prev) => !prev);
              }}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              aria-label="Toggle profile menu"
            >
              <div className="dash-avatar">SA</div>
            </button>

            {profileDropdownOpen && (
              <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="profile-dropdown-header">
                  <span className="profile-name">Super Admin</span>
                  <span className="profile-email">admin@filmflare.com</span>
                </div>
                <div className="profile-dropdown-divider" />
                <button
                  className="profile-dropdown-item"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    router.push('/profile');
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </button>
                <button
                  className="profile-dropdown-item profile-dropdown-item--logout"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    handleLogout();
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="dash-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;