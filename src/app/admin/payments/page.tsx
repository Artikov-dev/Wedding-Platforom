'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';

interface Payment {
  id: string;
  bookingId: string;
  userId?: string;
  amount: string | number;
  paymentType: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  booking?: {
    id: string;
    hall?: { name: string };
    user?: { firstName: string; lastName: string };
    numberOfGuests?: number;
  };
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'badge-success',
  PENDING: 'badge-warning',
  FAILED: 'badge-danger',
  REFUNDED: 'badge-danger',
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  ADVANCE: 'Avans',
  FULL: "To'liq",
  REFUND: 'Qaytarish',
};

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Naqd',
  CREDIT_CARD: 'Kredit karta',
  DEBIT_CARD: 'Debit karta',
  BANK_TRANSFER: 'Bank o\'tkazmasi',
  STRIPE: 'Stripe',
};

function formatMoney(val: string | number) {
  const n = Number(val);
  if (isNaN(n)) return '—';
  return n.toLocaleString('uz-UZ') + ' so\'m';
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const { showToast } = useToast();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/payments');
      const d = res.data.data;
      setPayments(Array.isArray(d) ? d : d?.payments || []);
    } catch { setPayments([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const totalRevenue = payments
    .filter(p => p.status === 'COMPLETED' || p.status === 'PENDING')
    .reduce((s, p) => s + Number(p.amount), 0);

  const filtered = payments.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (typeFilter && p.paymentType !== typeFilter) return false;
    return true;
  });

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--s-8)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--s-1)' }}>To&apos;lovlar</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{payments.length} ta to&apos;lov</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchPayments}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Yangilash
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-4)', marginBottom: 'var(--s-8)' }}>
        {[
          { label: "Jami to'lovlar", value: payments.length, color: 'var(--burgundy)', bg: 'rgba(139,0,0,0.06)' },
          { label: "Kutilmoqda", value: payments.filter(p => p.status === 'PENDING').length, color: '#C49B3C', bg: 'rgba(196,155,60,0.08)' },
          { label: "Bajarilgan", value: payments.filter(p => p.status === 'COMPLETED').length, color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
          { label: "Jami summa", value: formatMoney(Math.round(totalRevenue)), color: 'var(--burgundy)', bg: 'rgba(139,0,0,0.06)', isText: true },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 'var(--r-lg)', padding: 'var(--s-4)' }}>
            <div style={{ fontSize: (s as { isText?: boolean }).isText ? '1.1rem' : '1.8rem', fontWeight: 700, color: s.color, fontFamily: 'var(--font-display)', marginBottom: 'var(--s-1)' }}>{s.value}</div>
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
            <option value="PENDING">Kutilmoqda</option>
            <option value="COMPLETED">Bajarilgan</option>
            <option value="FAILED">Muvaffaqiyatsiz</option>
            <option value="REFUNDED">Qaytarilgan</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Tur</label>
          <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">Barchasi</option>
            <option value="ADVANCE">Avans</option>
            <option value="FULL">To&apos;liq</option>
          </select>
        </div>
        {(statusFilter || typeFilter) && (
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-ghost btn-sm" onClick={() => { setStatusFilter(''); setTypeFilter(''); }}>Tozalash</button>
          </div>
        )}
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>To&apos;yxona</th>
                <th>Mijoz</th>
                <th>Summa</th>
                <th>Tur</th>
                <th>Usul</th>
                <th>Status</th>
                <th>Sana</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{p.booking?.hall?.name || p.bookingId.slice(0, 8) + '...'}</td>
                  <td>
                    {p.booking?.user
                      ? `${p.booking.user.firstName} ${p.booking.user.lastName || ''}`
                      : '—'}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--burgundy)', fontFamily: 'var(--font-display)' }}>
                    {formatMoney(p.amount)}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {PAYMENT_TYPE_LABELS[p.paymentType] || p.paymentType}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{METHOD_LABELS[p.paymentMethod] || p.paymentMethod}</td>
                  <td>
                    <span className={`badge ${PAYMENT_STATUS_COLORS[p.status] || 'badge-warning'}`}>
                      {p.status === 'PENDING' ? 'Kutilmoqda' : p.status === 'COMPLETED' ? 'Bajarilgan' : p.status === 'FAILED' ? 'Xato' : p.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.83rem' }}>{formatDate(p.createdAt)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    {payments.length === 0 ? "Hali to'lovlar yo'q" : 'Filter natijasi bo\'sh'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
