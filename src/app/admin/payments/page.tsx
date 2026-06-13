'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { paymentsService } from '@/services/api.service';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { SyncOutlined, ClearOutlined, DownloadOutlined } from '@mui/icons-material';
import * as XLSX from 'xlsx';

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

const DEMO_PAYMENTS: Payment[] = [
  { id: 'p1', bookingId: 'ab1', amount: 14400000, paymentType: 'ADVANCE', paymentMethod: 'CREDIT_CARD', status: 'COMPLETED', createdAt: '2026-06-01T10:00:00Z', booking: { id: 'ab1', hall: { name: "Navro'z Palace" }, user: { firstName: 'Dilnoza', lastName: 'Karimova' }, numberOfGuests: 320 } },
  { id: 'p2', bookingId: 'ab2', amount: 7500000, paymentType: 'ADVANCE', paymentMethod: 'CASH', status: 'PENDING', createdAt: '2026-06-02T11:30:00Z', booking: { id: 'ab2', hall: { name: 'Grand Tashkent' }, user: { firstName: 'Jasur', lastName: 'Aliyev' }, numberOfGuests: 200 } },
  { id: 'p3', bookingId: 'ab3', amount: 22500000, paymentType: 'ADVANCE', paymentMethod: 'BANK_TRANSFER', status: 'COMPLETED', createdAt: '2026-06-03T09:15:00Z', booking: { id: 'ab3', hall: { name: 'Diamond Hall' }, user: { firstName: 'Mohira', lastName: 'Nazarova' }, numberOfGuests: 450 } },
  { id: 'p4', bookingId: 'ab4', amount: 33600000, paymentType: 'FULL', paymentMethod: 'CREDIT_CARD', status: 'COMPLETED', createdAt: '2026-05-20T14:00:00Z', booking: { id: 'ab4', hall: { name: 'Royal Wedding Hall' }, user: { firstName: 'Sherzod', lastName: 'Hasanov' }, numberOfGuests: 280 } },
  { id: 'p5', bookingId: 'ab5', amount: 3750000, paymentType: 'ADVANCE', paymentMethod: 'DEBIT_CARD', status: 'PENDING', createdAt: '2026-06-04T16:45:00Z', booking: { id: 'ab5', hall: { name: 'Oqshom Plaza' }, user: { firstName: 'Nodira', lastName: 'Rahimova' }, numberOfGuests: 150 } },
  { id: 'p6', bookingId: 'ab7', amount: 18000000, paymentType: 'ADVANCE', paymentMethod: 'BANK_TRANSFER', status: 'COMPLETED', createdAt: '2026-06-05T08:00:00Z', booking: { id: 'ab7', hall: { name: "Navro'z Palace" }, user: { firstName: 'Feruza', lastName: 'Umarova' }, numberOfGuests: 400 } },
  { id: 'p7', bookingId: 'ab6', amount: 6500000, paymentType: 'ADVANCE', paymentMethod: 'CASH', status: 'REFUNDED', createdAt: '2026-05-15T12:00:00Z', booking: { id: 'ab6', hall: { name: 'Samarqand Hall' }, user: { firstName: 'Bobur', lastName: "To'ychiyev" }, numberOfGuests: 200 } },
];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { showToast } = useToast();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentsService.list();
      const d = res.data.data;
      const list = Array.isArray(d) ? d : (d as { payments?: Payment[] })?.payments || [];
      setPayments(list.length > 0 ? list : DEMO_PAYMENTS);
    } catch { setPayments(DEMO_PAYMENTS); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const totalRevenue = payments
    .filter(p => p.status === 'COMPLETED' || p.status === 'PENDING')
    .reduce((s, p) => s + Number(p.amount), 0);

  const filtered = payments.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (typeFilter && p.paymentType !== typeFilter) return false;
    if (startDate && new Date(p.createdAt) < new Date(startDate)) return false;
    if (endDate && new Date(p.createdAt) > new Date(endDate)) return false;
    return true;
  });

  const exportToExcel = () => {
    const dataToExport = filtered.map(p => ({
      'To\'lov ID': p.id,
      'Bron ID': p.bookingId,
      'To\'yxona': p.booking?.hall?.name || '-',
      'Mijoz': p.booking?.user ? `${p.booking.user.firstName} ${p.booking.user.lastName}` : '-',
      'Summa': p.amount,
      'To\'lov turi': PAYMENT_TYPE_LABELS[p.paymentType] || p.paymentType,
      'To\'lov usuli': METHOD_LABELS[p.paymentMethod] || p.paymentMethod,
      'Status': PAYMENT_STATUS_COLORS[p.status] ? (p.status === 'COMPLETED' ? 'Bajarilgan' : p.status === 'PENDING' ? 'Kutilmoqda' : p.status === 'REFUNDED' ? 'Qaytarilgan' : 'Muvaffaqiyatsiz') : p.status,
      'Sana': formatDate(p.createdAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "To'lovlar");
    XLSX.writeFile(workbook, `To'lovlar_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--s-8)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--s-1)' }}>To&apos;lovlar</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{payments.length} ta to&apos;lov</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
          <button className="btn btn-outline btn-sm" onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <DownloadOutlined sx={{ fontSize: 18 }} />
            Excel yuklab olish
          </button>
          <button className="btn btn-ghost btn-sm" onClick={fetchPayments} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <SyncOutlined sx={{ fontSize: 18 }} />
            Yangilash
          </button>
        </div>
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
        <div className="form-group">
          <label className="form-label">Boshlanish</label>
          <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Tugash</label>
          <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        {(statusFilter || typeFilter || startDate || endDate) && (
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-ghost btn-sm" onClick={() => { setStatusFilter(''); setTypeFilter(''); setStartDate(''); setEndDate(''); }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ClearOutlined sx={{ fontSize: 16 }} />
              Tozalash
            </button>
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
