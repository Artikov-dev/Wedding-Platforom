'use client';

import React, { useState, useEffect, use } from 'react';
import Calendar from '@/components/shared/Calendar';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Hall, Booking } from '@/types';
import { formatPrice, formatDate, BOOKING_STATUSES } from '@/lib/utils';

export default function AdminHallDetailPage({ params }: { params: Promise<{ hallId: string }> }) {
  const { hallId } = use(params);
  const [hall, setHall] = useState<Hall | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([
      api.get(`/api/halls/${hallId}`).then(r => setHall(r.data.data)).catch(() => {}),
      api.get('/api/bookings').then(r => setBookings(Array.isArray(r.data.data) ? r.data.data : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [hallId]);

  const approveHall = async () => {
    try { await api.put(`/api/halls/${hallId}`, { status: 'APPROVED' }); showToast('Tasdiqlandi!'); setHall(prev => prev ? { ...prev, status: 'APPROVED' } : prev); }
    catch { showToast('Xatolik', 'error'); }
  };

  const bookedDates = bookings.filter(b => b.hallId === hallId).map(b => b.eventDate?.split('T')[0]).filter(Boolean);

  const handleClickBooked = (date: string) => {
    const b = bookings.find(b => b.eventDate?.startsWith(date));
    if (b) setSelectedBooking(b);
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!hall) return <div className="empty-state"><h3>To&apos;yxona topilmadi</h3></div>;

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{hall.name}</h1>
        <div className="flex">
          {hall.status !== 'APPROVED' && <button className="btn btn-secondary" onClick={approveHall}>✓ Tasdiqlash</button>}
          <button className="btn btn-ghost" onClick={() => window.history.back()}>← Orqaga</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
        <div className="image-placeholder" style={{ minHeight: 300 }}>
          {hall.imageUrl ? <img src={hall.imageUrl} alt={hall.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} /> : "🏛️ To'yxona rasmi"}
        </div>
        <div className="card card-body">
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Ma&apos;lumotlar</h3>
          <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
            <div><strong>Kategoriya:</strong> {hall.category || '—'}</div>
            <div><strong>Sig&apos;im:</strong> {hall.capacity} kishi</div>
            <div><strong>Narx:</strong> {formatPrice(hall.pricePerPlate)}/kishi</div>
            <div><strong>Rayon:</strong> {hall.city || '—'}</div>
            <div><strong>Status:</strong> <span className={`badge ${hall.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>{hall.status === 'APPROVED' ? 'Tasdiqlangan' : 'Tasdiqlanmagan'}</span></div>
            {hall.description && <div><strong>Tavsif:</strong> {hall.description}</div>}
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: 'var(--space-md)' }}>Bron kalendari</h3>
      <Calendar bookedDates={bookedDates} onClickBooked={handleClickBooked} />

      <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Bron ma'lumotlari">
        {selectedBooking && (
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            <div><strong>Sana:</strong> {formatDate(selectedBooking.eventDate)}</div>
            <div><strong>Mehmonlar:</strong> {selectedBooking.numberOfGuests} kishi</div>
            <div><strong>Narx:</strong> {formatPrice(selectedBooking.totalAmount)}</div>
            <div><strong>Status:</strong> {BOOKING_STATUSES[selectedBooking.status] || selectedBooking.status}</div>
            {selectedBooking.user && <div><strong>Foydalanuvchi:</strong> {selectedBooking.user.firstName} {selectedBooking.user.lastName} ({selectedBooking.user.phone})</div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
