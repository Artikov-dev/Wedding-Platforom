'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { bookingsService } from '@/services/api.service';
import { Booking } from '@/types';
import { formatDate, BOOKING_STATUSES } from '@/lib/utils';

const DEMO_BOOKINGS: Booking[] = [
  { id: 'o1', hallId: 'h1', eventDate: '2026-06-15', numberOfGuests: 320, totalAmount: 57600000, advanceAmount: 14400000, finalAmount: 43200000, status: 'CONFIRMED' },
  { id: 'o2', hallId: 'h1', eventDate: '2026-07-02', numberOfGuests: 250, totalAmount: 45000000, advanceAmount: 11250000, finalAmount: 33750000, status: 'PENDING' },
  { id: 'o3', hallId: 'h1', eventDate: '2026-07-20', numberOfGuests: 400, totalAmount: 72000000, advanceAmount: 18000000, finalAmount: 54000000, status: 'CONFIRMED' },
  { id: 'o4', hallId: 'h1', eventDate: '2026-05-10', numberOfGuests: 180, totalAmount: 32400000, advanceAmount: 8100000, finalAmount: 24300000, status: 'COMPLETED' },
  { id: 'o5', hallId: 'h1', eventDate: '2026-08-05', numberOfGuests: 300, totalAmount: 54000000, advanceAmount: 13500000, finalAmount: 40500000, status: 'PENDING' },
];

export default function OwnerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsService.list()
      .then(res => { setBookings(res.data.data?.bookings || []); })
      .catch(() => { setBookings(DEMO_BOOKINGS); })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: '📋', label: 'Jami bronlar', value: bookings.length, bg: 'rgba(114,47,55,0.08)', color: 'var(--burgundy)' },
    { icon: '✅', label: 'Tasdiqlangan', value: bookings.filter(b => b.status === 'CONFIRMED').length, bg: 'rgba(74,139,92,0.08)', color: 'var(--success)' },
    { icon: '⏳', label: 'Kutilmoqda', value: bookings.filter(b => b.status === 'PENDING').length, bg: 'rgba(196,155,60,0.08)', color: 'var(--warning)' },
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
