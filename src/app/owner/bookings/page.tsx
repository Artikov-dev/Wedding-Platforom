'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import { bookingsService } from '@/services/api.service';
import { useToast } from '@/components/ui/Toast';
import { Booking } from '@/types';
import { formatPrice, formatDate, BOOKING_STATUSES } from '@/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: 'badge-success',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
  PENDING: 'badge-warning',
};

const DEMO_BOOKINGS: Booking[] = [
  { id: 'ob1', hallId: 'h1', user: { id: 'u1', firstName: 'Dilnoza', lastName: 'Karimova', email: 'd@mail.com', phone: '+998901234567', role: 'CUSTOMER' }, eventDate: '2026-08-15', numberOfGuests: 320, totalAmount: 57600000, advanceAmount: 14400000, finalAmount: 43200000, status: 'CONFIRMED', notes: 'Kichik dekor kerak' },
  { id: 'ob2', hallId: 'h1', user: { id: 'u2', firstName: 'Jasur', lastName: 'Aliyev', email: 'j@mail.com', phone: '+998901112233', role: 'CUSTOMER' }, eventDate: '2026-07-02', numberOfGuests: 250, totalAmount: 45000000, advanceAmount: 11250000, finalAmount: 33750000, status: 'PENDING', notes: '' },
  { id: 'ob3', hallId: 'h1', user: { id: 'u3', firstName: 'Mohira', lastName: 'Nazarova', email: 'm@mail.com', phone: '+998907778899', role: 'CUSTOMER' }, eventDate: '2026-07-20', numberOfGuests: 400, totalAmount: 72000000, advanceAmount: 18000000, finalAmount: 54000000, status: 'CONFIRMED', notes: 'Milliy bezak' },
  { id: 'ob4', hallId: 'h1', user: { id: 'u4', firstName: 'Sherzod', lastName: 'Hasanov', email: 's@mail.com', phone: '+998990001122', role: 'CUSTOMER' }, eventDate: '2026-05-10', numberOfGuests: 180, totalAmount: 32400000, advanceAmount: 8100000, finalAmount: 24300000, status: 'COMPLETED', notes: '' },
  { id: 'ob5', hallId: 'h1', user: { id: 'u5', firstName: 'Nodira', lastName: 'Rahimova', email: 'n@mail.com', phone: '+998912345678', role: 'CUSTOMER' }, eventDate: '2026-08-05', numberOfGuests: 300, totalAmount: 54000000, advanceAmount: 13500000, finalAmount: 40500000, status: 'PENDING', notes: 'Bolalar uchun joy' },
  { id: 'ob6', hallId: 'h1', user: { id: 'u6', firstName: 'Feruza', lastName: 'Umarova', email: 'f@mail.com', phone: '+998946669900', role: 'CUSTOMER' }, eventDate: '2026-04-22', numberOfGuests: 220, totalAmount: 39600000, advanceAmount: 9900000, finalAmount: 29700000, status: 'CANCELLED', notes: '' },
];

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingsService.list();
      const list = res.data.data?.bookings || [];
      setBookings(list.length > 0 ? list : DEMO_BOOKINGS);
    } catch { setBookings(DEMO_BOOKINGS); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      // Try status update — backend may return 403 if owner can't update other's booking
      await bookingsService.updateStatus(id, status);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev);
      showToast(`Status: ${BOOKING_STATUSES[status] || status}`);
    } catch (err: unknown) {
      const code = (err as { response?: { status?: number } })?.response?.status;
      if (code === 403) {
        showToast("Faqat bron egasi statusni o'zgartira oladi", 'error');
      } else {
        showToast('Xatolik yuz berdi', 'error');
      }
    }
    finally { setUpdatingId(null); }
  };

  const filtered = bookings.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (dateFilter && !b.eventDate?.startsWith(dateFilter)) return false;
    return true;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
  };

  return (
    <div className="fade-in">
      <h1 className="page-title">Bronlar</h1>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-4)', marginBottom: 'var(--s-8)' }}>
        {[
          { label: 'Jami', value: stats.total, color: 'var(--burgundy)', bg: 'rgba(139,0,0,0.06)' },
          { label: 'Kutilmoqda', value: stats.pending, color: '#C49B3C', bg: 'rgba(196,155,60,0.08)' },
          { label: 'Tasdiqlangan', value: stats.confirmed, color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 'var(--r-lg)', padding: 'var(--s-4)' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
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
        {(statusFilter || dateFilter) && (
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-ghost btn-sm" onClick={() => { setStatusFilter(''); setDateFilter(''); }}>Tozalash</button>
          </div>
        )}
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : filtered.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Sana</th>
                <th>Mehmonlar</th>
                <th>Umumiy narx</th>
                <th>Status</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(b)}>
                  <td>{formatDate(b.eventDate)}</td>
                  <td>{b.numberOfGuests} kishi</td>
                  <td style={{ fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--burgundy)' }}>
                    {formatPrice(b.totalAmount)}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_COLOR[b.status] || 'badge-warning'}`}>
                      {BOOKING_STATUSES[b.status] || b.status}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {b.status === 'PENDING' && (
                        <button
                          className="btn btn-sm btn-secondary"
                          disabled={updatingId === b.id}
                          onClick={() => updateStatus(b.id, 'CONFIRMED')}
                          title="Tasdiqlash"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                      )}
                      {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                        <button
                          className="btn btn-sm btn-danger"
                          disabled={updatingId === b.id}
                          onClick={() => updateStatus(b.id, 'CANCELLED')}
                          title="Bekor qilish"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                      <button className="btn btn-sm btn-ghost" title="Batafsil">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>{bookings.length === 0 ? "Hali bronlar yo'q" : 'Filter natijasi bo\'sh'}</h3>
          {bookings.length > 0 && <button className="btn btn-ghost" onClick={() => { setStatusFilter(''); setDateFilter(''); }}>Tozalash</button>}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Bron ma'lumotlari">
        {selected && (
          <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-3)' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Sana</div>
                <div style={{ fontWeight: 600 }}>{formatDate(selected.eventDate)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Mehmonlar</div>
                <div style={{ fontWeight: 600 }}>{selected.numberOfGuests} kishi</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Umumiy summa</div>
                <div style={{ fontWeight: 700, color: 'var(--burgundy)', fontFamily: 'var(--font-display)' }}>{formatPrice(selected.totalAmount)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Avans</div>
                <div style={{ fontWeight: 600 }}>{formatPrice(selected.advanceAmount)}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Status</div>
              <span className={`badge ${STATUS_COLOR[selected.status] || 'badge-warning'}`}>
                {BOOKING_STATUSES[selected.status] || selected.status}
              </span>
            </div>

            {selected.user && (
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Mijoz</div>
                <div style={{ fontWeight: 600 }}>{selected.user.firstName} {selected.user.lastName}</div>
                {selected.user.phone && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selected.user.phone}</div>}
              </div>
            )}

            {selected.notes && (
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Izoh</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{selected.notes}</div>
              </div>
            )}

            {(selected.status === 'PENDING' || selected.status === 'CONFIRMED') && (
              <div style={{ display: 'flex', gap: 'var(--s-3)', marginTop: 'var(--s-4)', paddingTop: 'var(--s-4)', borderTop: '1px solid var(--border)' }}>
                {selected.status === 'PENDING' && (
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => updateStatus(selected.id, 'CONFIRMED')}
                    disabled={updatingId === selected.id}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}><polyline points="20 6 9 17 4 12"/></svg>
                    Tasdiqlash
                  </button>
                )}
                <button
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  onClick={() => updateStatus(selected.id, 'CANCELLED')}
                  disabled={updatingId === selected.id}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Bekor qilish
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
