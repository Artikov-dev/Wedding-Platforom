'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'CUSTOMER')) {
      window.location.href = '/login';
    }
  }, [user, loading]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!user || user.role !== 'CUSTOMER') return null;

  return (
    <div className="dashboard-layout">
      <Sidebar type="customer" />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--burgundy)' }}>
            Mijoz Kabineti
          </h3>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {user.firstName} {user.lastName}
          </span>
        </div>
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
