'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      window.location.href = '/login';
    }
  }, [user, loading]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="dashboard-layout">
      <Sidebar type="admin" />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-burgundy)' }}>
            Admin Panel
          </h3>
          <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
            {user.firstName} {user.lastName}
          </span>
        </div>
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
