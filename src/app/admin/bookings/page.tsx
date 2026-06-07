'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
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
      const res = await api.get('/api/bookings');
      const d = res.data.data;
      const list: Booking[] = Array.isArray(d) ? d : d?.bookings || [];
      // Sync cache
      list.forEach(b => bookingStore.add(b));
      setBookings(list);
    } catch {
      // /api/bookings returns 500 for ADMIN — build list from payments + local cache
      try {
        const payRes = await api.get('/api/payments');
        const payments = payRes.data.data?.payments || [];
        // Extract unique bookings from payments
        const seen = new Set<string>();
        const fromPayments: Booking[] = payments
          .filter((p: { booking?: { id?: string } }) => p.booking?.id && !seen.has(p.booking.id) && seen.add(p.booking.id))
          .map((p: { booking: Booking }) => p.booking);
        // Merge with local cache
        const cached = bookingStore.getAll();
        const merged = [...fromPayments];
        cached.forEach(b => { if (!seen.has(b.id)) { merged.push(b); seen.add(b.id); } });
        setBookings(merged);
      } catch {
        setBookings(bookingStore.getAll());
      }
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/api/bookings/${id}`, { status });
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
