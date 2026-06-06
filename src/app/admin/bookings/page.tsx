'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Booking } from '@/types';
import { formatPrice, formatDate, BOOKING_STATUSES } from '@/lib/utils';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const { showToast } = useToast();

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.startDate = dateFilter;
      const res = await api.get('/api/bookings', { params });
      setBookings(Array.isArray(res.data.data) ? res.data.data : []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  const cancelBooking = async (id: string) => {
    if (!confirm('Bekor qilmoqchimisiz?')) return;
    try { await api.delete(`/api/bookings/${id}`); showToast('Bekor qilindi'); fetchBookings(); }
    catch { showToast('Xatolik', 'error'); }
  };

  const filtered = bookings.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (dateFilter && !b.eventDate?.startsWith(dateFilter)) return false;
    return true;
  });

  return (
    <div className="fade-in">
      <h1 className="page-title">Barcha bronlar</h1>
      <div className="filters-bar">
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
        {(statusFilter || dateFilter) && <button className="btn btn-ghost btn-sm" onClick={() => { setStatusFilter(''); setDateFilter(''); }}>Tozalash</button>}
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : filtered.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>ID</th><th>To&apos;yxona</th><th>Sana</th><th>Mehmonlar</th><th>Narx</th><th>Status</th><th>Amal</th></tr></thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{b.id.slice(0, 8)}...</td>
                  <td style={{ fontWeight: 600 }}>{b.hall?.name || b.hallId.slice(0, 8)}</td>
                  <td>{formatDate(b.eventDate)}</td>
                  <td>{b.numberOfGuests}</td>
                  <td style={{ fontWeight: 600 }}>{formatPrice(b.totalAmount)}</td>
                  <td><span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : b.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>{BOOKING_STATUSES[b.status] || b.status}</span></td>
                  <td>{b.status !== 'CANCELLED' && <button className="btn btn-sm btn-danger" onClick={() => cancelBooking(b.id)}>Bekor qilish</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state"><div className="empty-state-icon">📋</div><h3>Bronlar topilmadi</h3></div>
      )}
    </div>
  );
}
