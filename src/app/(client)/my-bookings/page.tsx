'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { bookingsService } from '@/services/api.service';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { Booking } from '@/types';
import { formatPrice, formatDate, BOOKING_STATUSES } from '@/lib/utils';
import { bookingStore } from '@/lib/bookingStore';

const statusColor: Record<string, string> = {
  CONFIRMED: 'badge-success',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
  PENDING: 'badge-warning',
};

const DEMO_BOOKINGS: Booking[] = [
  {
    id: 'demo-1',
    hallId: 'hall-1',
    hall: { id: 'hall-1', name: "Visol to'yxonasi", city: 'Yunusobod', description: '', category: 'PREMIUM', capacity: 500, pricePerPlate: 200000 },
    eventDate: '2026-08-15',
    numberOfGuests: 320,
    totalAmount: 64000000,
    advanceAmount: 16000000,
    finalAmount: 48000000,
    status: 'CONFIRMED',
  },
  {
    id: 'demo-2',
    hallId: 'hall-2',
    hall: { id: 'hall-2', name: 'Guliston saroyi', city: 'Chilonzor', description: '', category: 'STANDARD', capacity: 400, pricePerPlate: 150000 },
    eventDate: '2026-07-20',
    numberOfGuests: 200,
    totalAmount: 30000000,
    advanceAmount: 7500000,
    finalAmount: 22500000,
    status: 'PENDING',
  },
  {
    id: 'demo-3',
    hallId: 'hall-3',
    hall: { id: 'hall-3', name: "Sharq to'yxonasi", city: 'Mirobod', description: '', category: 'VIP', capacity: 700, pricePerPlate: 280000 },
    eventDate: '2026-03-10',
    numberOfGuests: 450,
    totalAmount: 126000000,
    advanceAmount: 31500000,
    finalAmount: 94500000,
    status: 'COMPLETED',
  },
];

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => { if (isAuthenticated) fetchBookings(); else setLoading(false); }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const res = await bookingsService.myBookings();
      const list: Booking[] = res.data.data?.bookings || [];
      setBookings(list);
      list.forEach(b => bookingStore.add(b));
    } catch {
      const cached = user?.id ? bookingStore.getByUser(user.id) : bookingStore.getAll();
      setBookings(cached.length > 0 ? cached : DEMO_BOOKINGS);
    } finally { setLoading(false); }
  };

  const cancelBooking = async (id: string) => {
    if (!confirm('Bronni bekor qilmoqchimisiz?')) return;
    try {
      await bookingsService.cancel(id);
      bookingStore.remove(id);
      showToast('Bron bekor qilindi');
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err: unknown) {
      const code = (err as { response?: { status?: number } })?.response?.status;
      if (code === 404) {
        // Already deleted — just remove from cache
        bookingStore.remove(id);
        setBookings(prev => prev.filter(b => b.id !== id));
        showToast('Bron bekor qilindi');
      } else {
        showToast('Xatolik yuz berdi', 'error');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div style={{ paddingTop: 'var(--header-h)' }}>
          <div className="empty-state" style={{ minHeight: '60vh' }}>
            <div className="empty-state-icon">🔐</div>
            <h3>Tizimga kiring</h3>
            <p style={{ marginBottom: 'var(--s-6)' }}>Bronlarni ko&apos;rish uchun tizimga kiring</p>
            <a href="/login" className="btn btn-primary">Kirish</a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ paddingTop: 'var(--header-h)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--cream) 0%, var(--cream-deep) 100%)', padding: 'var(--s-12) 0', textAlign: 'center' }}>
          <div className="container">
            <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--gold)', fontSize: '1.1rem' }}>✦ Sizning bronlaringiz</span>
            <h1 style={{ marginTop: 'var(--s-2)' }}>Mening bronlarim</h1>
            {bookings.length > 0 && (
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--s-2)' }}>{bookings.length} ta bron</p>
            )}
          </div>
        </div>

        <div className="container" style={{ padding: 'var(--s-10) var(--s-8) var(--s-16)' }}>
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : bookings.length > 0 ? (
            <div className="table-wrapper" style={{ boxShadow: 'var(--shadow-soft)' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>To&apos;yxona</th>
                    <th>Sana</th>
                    <th>Mehmonlar</th>
                    <th>Umumiy narx</th>
                    <th>Avans</th>
                    <th>Status</th>
                    <th>Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.hall?.name || '—'}</div>
                        {b.hall?.city && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.hall.city}</div>}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(b.eventDate)}</td>
                      <td>{b.numberOfGuests} kishi</td>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--burgundy)', whiteSpace: 'nowrap' }}>
                        {formatPrice(b.totalAmount)}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatPrice(b.advanceAmount)}
                      </td>
                      <td>
                        <span className={`badge ${statusColor[b.status] || 'badge-warning'}`}>
                          {BOOKING_STATUSES[b.status] || b.status}
                        </span>
                      </td>
                      <td>
                        {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                          <button className="btn btn-sm btn-danger" onClick={() => cancelBooking(b.id)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            Bekor qilish
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ fontSize: '3rem' }}>📋</div>
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
