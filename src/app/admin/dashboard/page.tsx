'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Hall, Booking } from '@/types';
import { formatDate, BOOKING_STATUSES } from '@/lib/utils';

export default function AdminDashboard() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/halls/search', { params: { limit: 100 } }).then(r => { const d = r.data.data; setHalls(Array.isArray(d) ? d : d?.halls || []); }).catch(() => {}),
      api.get('/api/bookings', { params: { limit: 100 } }).then(r => setBookings(Array.isArray(r.data.data) ? r.data.data : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.eventDate?.startsWith(todayStr));

  const stats = [
    { icon: '🏛️', label: "Jami to'yxonalar", value: halls.length, bg: 'rgba(114,47,55,0.08)', color: 'var(--color-burgundy)' },
    { icon: '📋', label: 'Bugungi bronlar', value: todayBookings.length, bg: 'rgba(74,139,92,0.08)', color: 'var(--color-success)' },
    { icon: '✅', label: 'Tasdiqlangan', value: halls.filter(h => h.status === 'APPROVED').length, bg: 'rgba(74,123,155,0.08)', color: 'var(--color-info)' },
    { icon: '⏳', label: 'Tasdiqlanmagan', value: halls.filter(h => h.status !== 'APPROVED').length, bg: 'rgba(196,155,60,0.08)', color: 'var(--color-warning)' },
  ];

  return (
    <div className="fade-in">
      <h1 className="page-title">Dashboard</h1>
      {loading ? <div className="loading-page"><div className="spinner" /></div> : (
        <>
          <div className="grid grid-4" style={{ marginBottom: 'var(--space-2xl)' }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
            <div>
              <div className="flex-between" style={{ marginBottom: 'var(--space-md)' }}>
                <h3>Oxirgi bronlar</h3>
                <Link href="/admin/bookings" className="btn btn-sm btn-ghost">Barchasi →</Link>
              </div>
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Sana</th><th>Mehmonlar</th><th>Status</th></tr></thead>
                  <tbody>
                    {bookings.slice(0, 5).map(b => (
                      <tr key={b.id}>
                        <td>{formatDate(b.eventDate)}</td>
                        <td>{b.numberOfGuests}</td>
                        <td><span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'}`}>{BOOKING_STATUSES[b.status] || b.status}</span></td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Ma&apos;lumot yo&apos;q</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div className="flex-between" style={{ marginBottom: 'var(--space-md)' }}>
                <h3>Yangi to&apos;yxonalar</h3>
                <Link href="/admin/halls" className="btn btn-sm btn-ghost">Barchasi →</Link>
              </div>
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Nomi</th><th>Sig&apos;im</th><th>Status</th></tr></thead>
                  <tbody>
                    {halls.slice(0, 5).map(h => (
                      <tr key={h.id}>
                        <td style={{ fontWeight: 600 }}>{h.name}</td>
                        <td>{h.capacity}</td>
                        <td><span className={`badge ${h.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>{h.status === 'APPROVED' ? 'Tasdiqlangan' : 'Yangi'}</span></td>
                      </tr>
                    ))}
                    {halls.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Ma&apos;lumot yo&apos;q</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
