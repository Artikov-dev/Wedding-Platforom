'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Booking } from '@/types';
import { formatDate, BOOKING_STATUSES } from '@/lib/utils';

export default function OwnerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/bookings', { params: { limit: 5 } })
      .then(res => setBookings(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: '📋', label: 'Jami bronlar', value: bookings.length, bg: 'rgba(114,47,55,0.08)', color: 'var(--color-burgundy)' },
    { icon: '✅', label: 'Tasdiqlangan', value: bookings.filter(b => b.status === 'CONFIRMED').length, bg: 'rgba(74,139,92,0.08)', color: 'var(--color-success)' },
    { icon: '⏳', label: 'Kutilmoqda', value: bookings.filter(b => b.status === 'PENDING').length, bg: 'rgba(196,155,60,0.08)', color: 'var(--color-warning)' },
  ];

  return (
    <div className="fade-in">
      <h1 className="page-title">Dashboard</h1>
      <div className="grid grid-3" style={{ marginBottom: 'var(--space-2xl)' }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3>Oxirgi bronlar</h3>
        <Link href="/owner/bookings" className="btn btn-sm btn-outline">Barchasini ko&apos;rish</Link>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : bookings.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Sana</th><th>Mehmonlar</th><th>Status</th></tr></thead>
            <tbody>
              {bookings.slice(0, 5).map(b => (
                <tr key={b.id}>
                  <td>{formatDate(b.eventDate)}</td>
                  <td>{b.numberOfGuests} kishi</td>
                  <td><span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : b.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>{BOOKING_STATUSES[b.status] || b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state"><p>Hali bronlar yo&apos;q</p></div>
      )}

      <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)' }}>
        <Link href="/owner/my-hall" className="btn btn-primary">🏛️ To&apos;yxonamni ko&apos;rish</Link>
        <Link href="/owner/register-hall" className="btn btn-outline">➕ Yangi to&apos;yxona qo&apos;shish</Link>
      </div>
    </div>
  );
}
