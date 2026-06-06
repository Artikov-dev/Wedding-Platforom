'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Booking } from '@/types';
import { formatPrice, formatDate, BOOKING_STATUSES } from '@/lib/utils';

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const { showToast } = useToast();

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/bookings');
      setBookings(Array.isArray(res.data.data) ? res.data.data : []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  const cancelBooking = async (id: string) => {
    if (!confirm('Bronni bekor qilmoqchimisiz?')) return;
    try { await api.delete(`/api/bookings/${id}`); showToast('Bron bekor qilindi'); fetchBookings(); }
    catch { showToast('Xatolik', 'error'); }
  };

  const filtered = dateFilter
    ? bookings.filter(b => b.eventDate?.startsWith(dateFilter))
    : bookings;

  return (
    <div className="fade-in">
      <h1 className="page-title">Bronlar</h1>
      <div className="filters-bar">
        <div className="form-group">
          <label className="form-label">Sana bo&apos;yicha filter</label>
          <input type="date" className="form-input" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        </div>
        {dateFilter && <button className="btn btn-ghost btn-sm" onClick={() => setDateFilter('')}>Tozalash</button>}
      </div>
      {loading ? <div className="loading-page"><div className="spinner" /></div> : filtered.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Sana</th><th>Mehmonlar</th><th>Umumiy narx</th><th>Status</th><th>Amal</th></tr></thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td>{formatDate(b.eventDate)}</td>
                  <td>{b.numberOfGuests} kishi</td>
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
