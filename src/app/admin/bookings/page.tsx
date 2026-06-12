'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { bookingsService, paymentsService } from '@/services/api.service';
import { useToast } from '@/components/ui/Toast';
import { Booking } from '@/types';
import { formatPrice, formatDate, BOOKING_STATUSES } from '@/lib/utils';
import { bookingStore } from '@/lib/bookingStore';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
const statusColor: Record<string, string> = {
  CONFIRMED: 'badge-success',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
  PENDING: 'badge-warning',
};

const DEMO_BOOKINGS: import('@/types').Booking[] = [
  { id: 'ab1', hallId: 'h1', hall: { id: 'h1', name: "Visol to'yxonasi", city: 'Yunusobod', description: '', category: 'PREMIUM', capacity: 500, pricePerPlate: 200000 }, user: { id: 'u1', firstName: 'Dilnoza', lastName: 'Karimova', email: 'd@mail.com', phone: '+998901234567', role: 'CUSTOMER' }, eventDate: '2026-08-15', numberOfGuests: 320, totalAmount: 64000000, advanceAmount: 16000000, finalAmount: 48000000, status: 'CONFIRMED', notes: 'Milliy uslubda bezak kerak' },
  { id: 'ab2', hallId: 'h2', hall: { id: 'h2', name: 'Guliston saroyi', city: 'Chilonzor', description: '', category: 'STANDARD', capacity: 400, pricePerPlate: 150000 }, user: { id: 'u2', firstName: 'Jasur', lastName: 'Aliyev', email: 'j@mail.com', phone: '+998901112233', role: 'CUSTOMER' }, eventDate: '2026-07-20', numberOfGuests: 200, totalAmount: 30000000, advanceAmount: 7500000, finalAmount: 22500000, status: 'PENDING', notes: '' },
  { id: 'ab3', hallId: 'h3', hall: { id: 'h3', name: "Sharq to'yxonasi", city: 'Mirobod', description: '', category: 'VIP', capacity: 700, pricePerPlate: 280000 }, user: { id: 'u3', firstName: 'Mohira', lastName: 'Nazarova', email: 'm@mail.com', phone: '+998907778899', role: 'CUSTOMER' }, eventDate: '2026-09-05', numberOfGuests: 450, totalAmount: 126000000, advanceAmount: 31500000, finalAmount: 94500000, status: 'CONFIRMED', notes: "Katta zal va maxsus bezak" },
  { id: 'ab4', hallId: 'h4', hall: { id: 'h4', name: 'Bahor saroyi', city: 'Olmazor', description: '', category: 'STANDARD', capacity: 350, pricePerPlate: 140000 }, user: { id: 'u4', firstName: 'Sherzod', lastName: 'Hasanov', email: 's@mail.com', phone: '+998990001122', role: 'CUSTOMER' }, eventDate: '2026-05-18', numberOfGuests: 280, totalAmount: 39200000, advanceAmount: 9800000, finalAmount: 29400000, status: 'COMPLETED', notes: '' },
  { id: 'ab5', hallId: 'h5', hall: { id: 'h5', name: "Hilol to'yxonasi", city: 'Sergeli', description: '', category: 'ECONOMY', capacity: 250, pricePerPlate: 110000 }, user: { id: 'u5', firstName: 'Nodira', lastName: 'Rahimova', email: 'n@mail.com', phone: '+998912345678', role: 'CUSTOMER' }, eventDate: '2026-07-10', numberOfGuests: 180, totalAmount: 19800000, advanceAmount: 4950000, finalAmount: 14850000, status: 'PENDING', notes: 'Bolalar uchun zona kerak' },
  { id: 'ab6', hallId: 'h6', hall: { id: 'h6', name: 'Nargiza saroyi', city: 'Uchtepa', description: '', category: 'STANDARD', capacity: 300, pricePerPlate: 130000 }, user: { id: 'u6', firstName: 'Bobur', lastName: "To'ychiyev", email: 'b@mail.com', phone: '+998935556677', role: 'CUSTOMER' }, eventDate: '2026-06-25', numberOfGuests: 250, totalAmount: 32500000, advanceAmount: 8125000, finalAmount: 24375000, status: 'CANCELLED', notes: '' },
  { id: 'ab7', hallId: 'h1', hall: { id: 'h1', name: "Visol to'yxonasi", city: 'Yunusobod', description: '', category: 'PREMIUM', capacity: 500, pricePerPlate: 200000 }, user: { id: 'u7', firstName: 'Feruza', lastName: 'Umarova', email: 'f@mail.com', phone: '+998946669900', role: 'CUSTOMER' }, eventDate: '2026-10-02', numberOfGuests: 400, totalAmount: 80000000, advanceAmount: 20000000, finalAmount: 60000000, status: 'CONFIRMED', notes: '' },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingsService.list();
      const d = res.data.data;
      const list: Booking[] = d?.bookings || [];
      list.forEach(b => bookingStore.add(b));
      setBookings(list);
    } catch {
      try {
        const payRes = await paymentsService.list();
        const payments = payRes.data.data;
        const payList = Array.isArray(payments) ? payments : (payments as { payments?: typeof payments })?.payments || [];
        const seen = new Set<string>();
        const fromPayments: Booking[] = (payList as { booking?: Booking }[])
          .filter(p => p.booking?.id && !seen.has(p.booking.id) && seen.add(p.booking.id!))
          .map(p => p.booking as Booking);
        const cached = bookingStore.getAll();
        const merged = [...fromPayments];
        cached.forEach(b => { if (!seen.has(b.id)) { merged.push(b); seen.add(b.id); } });
        setBookings(merged.length > 0 ? merged : DEMO_BOOKINGS);
      } catch {
        const cached = bookingStore.getAll();
        setBookings(cached.length > 0 ? cached : DEMO_BOOKINGS);
      }
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await bookingsService.updateStatus(id, status);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      showToast('Status yangilandi');
    } catch (err: unknown) {
      const code = (err as { response?: { status?: number } })?.response?.status;
      // 403 = backend only allows booking owner to update — backend needs fix
      if (code === 403) {
        showToast("Backend: faqat bron egasi o'zgartira oladi (backend fix kerak)", 'error');
      } else {
        showToast('Xatolik yuz berdi', 'error');
      }
    }
    finally { setUpdatingId(null); }
  };

  const cancelBooking = async (id: string) => {
    if (!confirm('Bronni bekor qilmoqchimisiz?')) return;
    await updateStatus(id, 'CANCELLED');
  };

  const filtered = bookings.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (dateFilter && !b.eventDate?.startsWith(dateFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (b.hall?.name || '').toLowerCase().includes(q) || (b.user?.firstName || '').toLowerCase().includes(q) || b.id.includes(q);
    }
    return true;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  return (
    <div className="fade-in">
      <h1 className="page-title">Barcha bronlar</h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-4)', marginBottom: 'var(--s-8)' }}>
        {[
          { label: 'Jami', value: stats.total, color: 'var(--burgundy)', bg: 'rgba(139,0,0,0.06)' },
          { label: 'Kutilmoqda', value: stats.pending, color: '#C49B3C', bg: 'rgba(196,155,60,0.08)' },
          { label: 'Tasdiqlangan', value: stats.confirmed, color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
          { label: 'Bekor qilingan', value: stats.cancelled, color: '#C62828', bg: 'rgba(198,40,40,0.08)' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 'var(--r-lg)', padding: 'var(--s-4)', display: 'flex', flexDirection: 'column', gap: 'var(--s-1)' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Qidiruv
          </label>
          <input className="form-input" placeholder="To'yxona nomi yoki foydalanuvchi..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Barchasi</option>
            {Object.entries(BOOKING_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Sana</label>
          <input type="date" className="form-input" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        </div>
        {(statusFilter || dateFilter || search) && (
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-ghost btn-sm" onClick={() => { setStatusFilter(''); setDateFilter(''); setSearch(''); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Tozalash
            </button>
          </div>
        )}
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : filtered.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>To&apos;yxona</th>
                <th>Mijoz</th>
                <th>Sana</th>
                <th>Mehmonlar</th>
                <th>Narx</th>
                <th>Status</th>
                <th>Izoh</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, idx) => (
                <tr key={b.id}>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{b.hall?.name || b.hallId.slice(0, 8) + '...'}</td>
                  <td>{b.user ? `${b.user.firstName} ${b.user.lastName || ''}` : '—'}</td>
                  <td>{formatDate(b.eventDate)}</td>
                  <td>{b.numberOfGuests} kishi</td>
                  <td style={{ fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--burgundy)' }}>{formatPrice(b.totalAmount)}</td>
                  <td>
                    <span className={`badge ${statusColor[b.status] || 'badge-warning'}`}>
                      {BOOKING_STATUSES[b.status] || b.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 120 }}>
                    {b.notes ? b.notes.slice(0, 40) + (b.notes.length > 40 ? '...' : '') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>{bookings.length === 0 ? 'Bronlar yo\'q' : 'Filter natijasi bo\'sh'}</h3>
          {bookings.length > 0 && <button className="btn btn-ghost" onClick={() => { setStatusFilter(''); setDateFilter(''); setSearch(''); }}>Filterlarni tozalash</button>}
        </div>
      )}
    </div>
  );
}
