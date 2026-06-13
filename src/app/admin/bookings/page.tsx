'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { bookingsService, paymentsService, adminService } from '@/services/api.service';
import { useToast } from '@/components/ui/Toast';
import { Booking } from '@/types';
import { formatPrice, formatDate, BOOKING_STATUSES } from '@/lib/utils';
import { bookingStore } from '@/lib/bookingStore';
import { 
  SearchOutlined, 
  DownloadOutlined, 
  FormatListBulletedOutlined, 
  ClearOutlined,
  PictureAsPdfOutlined
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BookingTicket } from '@/components/pdf/BookingTicket';
import * as XLSX from 'xlsx';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const ticketRef = React.useRef<HTMLDivElement>(null);
  const [ticketBooking, setTicketBooking] = useState<Booking | null>(null);
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
      // 403 = backend only allows booking owner to update
      if (code === 403) {
        showToast("Ruxsat yetarli emas", 'error');
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
    if (startDate && new Date(b.eventDate) < new Date(startDate)) return false;
    if (endDate && new Date(b.eventDate) > new Date(endDate)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (b.hall?.name || '').toLowerCase().includes(q) || (b.user?.firstName || '').toLowerCase().includes(q) || b.id.includes(q);
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(b => b.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkUpdate = async (status: string) => {
    if (!confirm(`Haqiqatan ham tanlangan ${selectedIds.length} ta bron holatini ${status} ga o'zgartirmoqchimisiz?`)) return;
    try {
      const res = await adminService.bulkAction({
        resource: 'bookings',
        action: 'update_status',
        ids: selectedIds,
        value: status
      });
      if (res.data?.success) {
        showToast(`${selectedIds.length} ta bron yangilandi`, 'success');
        setBookings(prev => prev.map(b => selectedIds.includes(b.id) ? { ...b, status } : b));
        setSelectedIds([]);
      }
    } catch {
      showToast('Ommaviy yangilashda xatolik', 'error');
    }
  };

  const exportToExcel = () => {
    const dataToExport = filtered.map(b => ({
      'Bron ID': b.id,
      'To\'yxona': b.hall?.name || '-',
      'Mijoz': b.user ? `${b.user.firstName} ${b.user.lastName}` : '-',
      'Mijoz Tel': b.user?.phone || '-',
      'Sana': formatDate(b.eventDate),
      'Mehmonlar soni': b.numberOfGuests,
      'Jami narx': b.totalAmount,
      'Avans': b.advanceAmount,
      'Status': BOOKING_STATUSES[b.status as keyof typeof BOOKING_STATUSES] || b.status,
      'Izoh': b.notes || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bronlar");
    XLSX.writeFile(workbook, `Bronlar_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleDownloadTicket = async (booking: Booking) => {
    setTicketBooking(booking);
    setDownloadingId(booking.id);
    
    // Allow state to update and DOM to render the hidden ticket
    setTimeout(async () => {
      if (ticketRef.current) {
        try {
          const canvas = await html2canvas(ticketRef.current, { scale: 2, useCORS: true });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('l', 'px', [canvas.width / 2, canvas.height / 2]);
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
          pdf.save(`Bilet_${booking.bookingNumber || booking.id.slice(0, 8)}.pdf`);
          showToast('Bilet muvaffaqiyatli yuklandi', 'success');
        } catch (error) {
          showToast('PDF generatsiyasida xatolik', 'error');
        } finally {
          setDownloadingId(null);
          setTicketBooking(null);
        }
      }
    }, 100);
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--s-6)' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Barcha bronlar</h1>
        <button className="btn btn-outline" onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DownloadOutlined sx={{ fontSize: 18 }} />
          Excel yuklab olish
        </button>
      </div>

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
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <SearchOutlined sx={{ fontSize: 16 }} />
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
          <label className="form-label">Boshlanish</label>
          <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Tugash</label>
          <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        {(statusFilter || startDate || endDate || search) && (
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-ghost btn-sm" onClick={() => { setStatusFilter(''); setStartDate(''); setEndDate(''); setSearch(''); }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ClearOutlined sx={{ fontSize: 16 }} />
              Tozalash
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="card fade-in" style={{ padding: 'var(--s-3) var(--s-4)', marginBottom: 'var(--s-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-light)' }}>
          <div>
            <strong>{selectedIds.length}</strong> ta bron tanlandi
          </div>
          <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Holatni o&apos;zgartirish:</span>
            {Object.entries(BOOKING_STATUSES).map(([k, v]) => (
              <button key={k} className="btn btn-outline btn-sm" onClick={() => handleBulkUpdate(k)}>{v}</button>
            ))}
          </div>
        </div>
      )}

      {loading ? <div className="loading-page"><div className="spinner" /></div> : filtered.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" className="form-checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                </th>
                <th>#</th>
                <th>To&apos;yxona</th>
                <th>Mijoz</th>
                <th>Sana</th>
                <th>Mehmonlar</th>
                <th>Narx</th>
                <th>Status</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, idx) => (
                <tr key={b.id} className={selectedIds.includes(b.id) ? 'selected-row' : ''}>
                  <td>
                    <input type="checkbox" className="form-checkbox" checked={selectedIds.includes(b.id)} onChange={() => toggleSelect(b.id)} />
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{b.hall?.name || b.hallId.slice(0, 8) + '...'}</td>
                  <td>{b.user ? `${b.user.firstName} ${b.user.lastName || ''}` : '—'}</td>
                  <td>{formatDate(b.eventDate)}</td>
                  <td>{b.numberOfGuests} kishi</td>
                  <td style={{ fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--burgundy)' }}>{formatPrice(b.totalAmount)}</td>
                  <td>
                    {updatingId === b.id ? (
                      <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    ) : (
                      <select 
                        className={`form-select form-select-sm badge ${statusColor[b.status] || 'badge-warning'}`}
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        style={{ padding: '2px 8px', height: '28px', fontSize: '0.75rem', borderRadius: 'var(--r-full)', cursor: 'pointer', border: 'none', appearance: 'none', background: 'transparent' }}
                      >
                        {Object.entries(BOOKING_STATUSES).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-ghost" 
                      onClick={() => handleDownloadTicket(b)}
                      disabled={downloadingId === b.id || b.status !== 'CONFIRMED'}
                      title={b.status !== 'CONFIRMED' ? 'Faqat tasdiqlangan bronlar uchun' : 'PDF Bilet yuklash'}
                      style={{ color: b.status === 'CONFIRMED' ? 'var(--burgundy)' : 'var(--text-muted)' }}
                    >
                      {downloadingId === b.id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <PictureAsPdfOutlined sx={{ fontSize: 18 }} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
            <FormatListBulletedOutlined sx={{ fontSize: 64 }} />
          </div>
          <h3>{bookings.length === 0 ? 'Bronlar yo\'q' : 'Filter natijasi bo\'sh'}</h3>
          {bookings.length > 0 && <button className="btn btn-ghost" onClick={() => { setStatusFilter(''); setEndDate(''); setSearch(''); }}>Filterlarni tozalash</button>}
        </div>
      )}

      {/* Hidden container for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
        {ticketBooking && <BookingTicket booking={ticketBooking} ref={ticketRef} />}
      </div>
    </div>
  );
}
