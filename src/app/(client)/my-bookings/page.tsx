'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Booking } from '@/types';
import { formatPrice, formatDate, BOOKING_STATUSES } from '@/lib/utils';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => { fetchBookings(); }, []);
  const fetchBookings = async () => {
    try { const res = await api.get('/api/bookings'); setBookings(Array.isArray(res.data.data) ? res.data.data : []); }
    catch { setBookings([]); } finally { setLoading(false); }
  };

  const cancelBooking = async (id: string) => {
    if (!confirm('Bronni bekor qilmoqchimisiz?')) return;
    try { await api.delete(`/api/bookings/${id}`); showToast('Bron bekor qilindi'); fetchBookings(); }
    catch { showToast('Xatolik yuz berdi', 'error'); }
  };

  return (
    <>
      <Header />
      <div style={{ paddingTop: 'var(--header-h)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--cream) 0%, var(--cream-deep) 100%)', padding: 'var(--s-12) 0', textAlign: 'center' }}>
          <div className="container">
            <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--gold)', fontSize: '1.1rem' }}>✦ Sizning bronlaringiz</span>
            <h1 style={{ marginTop: 'var(--s-2)' }}>Mening bronlarim</h1>
          </div>
        </div>
        <div className="container" style={{ padding: 'var(--s-10) var(--s-8) var(--s-16)' }}>
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : bookings.length > 0 ? (
            <div className="table-wrapper" style={{ boxShadow: 'var(--shadow-soft)' }}>
              <table className="table">
                <thead><tr><th>To&apos;yxona</th><th>Sana</th><th>Mehmonlar</th><th>Umumiy narx</th><th>Status</th><th>Amal</th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{b.hall?.name || b.hallId}</td>
                      <td>{formatDate(b.eventDate)}</td>
                      <td>{b.numberOfGuests} kishi</td>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--burgundy)' }}>{formatPrice(b.totalAmount)}</td>
                      <td><span className={`badge ${b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'badge-success' : b.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>{BOOKING_STATUSES[b.status] || b.status}</span></td>
                      <td>{b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && <button className="btn btn-sm btn-danger" onClick={() => cancelBooking(b.id)}>Bekor qilish</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>Hali bronlar yo&apos;q</h3>
              <p style={{ marginBottom: 'var(--s-6)' }}>To&apos;yxona tanlang va bron qiling</p>
              <a href="/halls" className="btn btn-primary">To&apos;yxonalarni ko&apos;rish</a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
