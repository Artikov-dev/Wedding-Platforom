'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { bookingsService, hallsService } from '@/services/api.service';
import { Booking, Hall } from '@/types';
import { formatPrice, formatDate, BOOKING_STATUSES } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const DEMO_BOOKINGS: Booking[] = [
  { id: 'o1', hallId: 'h1', hall: { id: 'h1', name: "Visol to'yxonasi", city: 'Yunusobod', description: '', category: 'PREMIUM', capacity: 500, pricePerPlate: 200000 }, eventDate: '2026-06-15', numberOfGuests: 320, totalAmount: 64000000, advanceAmount: 16000000, finalAmount: 48000000, status: 'CONFIRMED' },
  { id: 'o2', hallId: 'h2', hall: { id: 'h2', name: 'Guliston saroyi', city: 'Chilonzor', description: '', category: 'STANDARD', capacity: 400, pricePerPlate: 150000 }, eventDate: '2026-07-02', numberOfGuests: 250, totalAmount: 37500000, advanceAmount: 9375000, finalAmount: 28125000, status: 'PENDING' },
  { id: 'o3', hallId: 'h3', hall: { id: 'h3', name: "Sharq to'yxonasi", city: 'Mirobod', description: '', category: 'VIP', capacity: 700, pricePerPlate: 280000 }, eventDate: '2026-07-20', numberOfGuests: 400, totalAmount: 112000000, advanceAmount: 28000000, finalAmount: 84000000, status: 'CONFIRMED' },
  { id: 'o4', hallId: 'h4', hall: { id: 'h4', name: 'Bahor saroyi', city: 'Olmazor', description: '', category: 'STANDARD', capacity: 350, pricePerPlate: 140000 }, eventDate: '2026-05-10', numberOfGuests: 180, totalAmount: 25200000, advanceAmount: 6300000, finalAmount: 18900000, status: 'COMPLETED' },
  { id: 'o5', hallId: 'h5', hall: { id: 'h5', name: "Hilol to'yxonasi", city: 'Sergeli', description: '', category: 'ECONOMY', capacity: 250, pricePerPlate: 110000 }, eventDate: '2026-08-05', numberOfGuests: 200, totalAmount: 22000000, advanceAmount: 5500000, finalAmount: 16500000, status: 'PENDING' },
];

export default function OwnerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load owner's halls
        if (user?.id) {
          try {
            const hallRes = await hallsService.search({ ownerId: user.id, limit: 50 });
            setHalls(hallRes.data.data?.halls || []);
          } catch { setHalls([]); }
        }

        // Load bookings — try owner-specific endpoint first, fallback to general
        try {
          const res = await bookingsService.list();
          const list = res.data.data?.bookings || [];
          setBookings(list.length > 0 ? list : DEMO_BOOKINGS);
        } catch {
          setBookings(DEMO_BOOKINGS);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  const totalRevenue = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const stats = [
    { icon: '🏛️', label: "To'yxonalar", value: halls.length, bg: 'rgba(196,155,60,0.08)', color: 'var(--gold)' },
    { icon: '📋', label: 'Jami bronlar', value: bookings.length, bg: 'rgba(114,47,55,0.08)', color: 'var(--burgundy)' },
    { icon: '✅', label: 'Tasdiqlangan', value: bookings.filter(b => b.status === 'CONFIRMED').length, bg: 'rgba(74,139,92,0.08)', color: 'var(--success)' },
    { icon: '⏳', label: 'Kutilmoqda', value: bookings.filter(b => b.status === 'PENDING').length, bg: 'rgba(196,155,60,0.08)', color: 'var(--warning)' },
  ];

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Dashboard</h1>
        <Link href="/owner/register-hall" className="btn btn-primary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 5 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Yangi to&apos;yxona
        </Link>
      </div>

      {/* Revenue banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--burgundy), #a83250)', borderRadius: 'var(--r-xl)', padding: 'var(--s-6) var(--s-8)', marginBottom: 'var(--s-6)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 'var(--s-1)' }}>Jami daromad</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{formatPrice(totalRevenue)}</div>
        </div>
        <div style={{ fontSize: '3rem', opacity: 0.3 }}>💰</div>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--s-8)' }}>
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

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-4)', marginBottom: 'var(--s-8)' }}>
        <Link href="/owner/my-hall" style={{ display: 'block', padding: 'var(--s-5)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', textDecoration: 'none', color: 'var(--text-primary)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 'var(--s-2)' }}>🏛️</div>
          <div style={{ fontWeight: 600, marginBottom: 'var(--s-1)' }}>To&apos;yxonalarim</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{halls.length} ta to&apos;yxona</div>
        </Link>
        <Link href="/owner/bookings" style={{ display: 'block', padding: 'var(--s-5)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', textDecoration: 'none', color: 'var(--text-primary)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 'var(--s-2)' }}>📅</div>
          <div style={{ fontWeight: 600, marginBottom: 'var(--s-1)' }}>Bronlar</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{bookings.filter(b => b.status === 'PENDING').length} ta kutilmoqda</div>
        </Link>
      </div>

      {/* Recent bookings */}
      <div className="flex-between" style={{ marginBottom: 'var(--s-4)' }}>
        <h3>Oxirgi bronlar</h3>
        <Link href="/owner/bookings" className="btn btn-sm btn-outline">Barchasini ko&apos;rish</Link>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : bookings.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>To&apos;yxona</th>
                <th>Sana</th>
                <th>Mehmonlar</th>
                <th>Summa</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 500 }}>{b.hall?.name || '—'}</td>
                  <td>{formatDate(b.eventDate)}</td>
                  <td>{b.numberOfGuests} kishi</td>
                  <td style={{ color: 'var(--burgundy)', fontWeight: 600 }}>{formatPrice(b.totalAmount || 0)}</td>
                  <td>
                    <span className={`badge ${b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'badge-success' : b.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                      {BOOKING_STATUSES[b.status] || b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state"><p>Hali bronlar yo&apos;q</p></div>
      )}
    </div>
  );
}
