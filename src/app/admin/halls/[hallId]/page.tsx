'use client';

import React, { useState, useEffect, use } from 'react';
import Calendar from '@/components/shared/Calendar';
import Modal from '@/components/ui/Modal';
import { hallsService, bookingsService, adminService } from '@/services/api.service';
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
      hallsService.getById(hallId).then(r => setHall(r.data.data)).catch(() => {}),
      bookingsService.list().then(r => setBookings(r.data.data?.bookings || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [hallId]);

  const approveHall = async () => {
    try {
      await adminService.approveHall(hallId, 'APPROVED');
      showToast('Tasdiqlandi!');
      setHall(prev => prev ? { ...prev, approvalStatus: 'APPROVED', status: 'APPROVED' } : prev);
    } catch { showToast('Xatolik', 'error'); }
  };

  const isApproved = hall?.approvalStatus === 'APPROVED' || hall?.status === 'APPROVED';
  const bookedDates = bookings.filter(b => b.hallId === hallId).map(b => b.eventDate?.split('T')[0]).filter(Boolean) as string[];

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
          {!isApproved && <button className="btn btn-secondary" onClick={approveHall}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 5 }}><polyline points="20 6 9 17 4 12"/></svg>
            Tasdiqlash
          </button>}
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
            <div><strong>Status:</strong> <span className={`badge ${isApproved ? 'badge-success' : 'badge-warning'}`}>{isApproved ? 'Tasdiqlangan' : 'Tasdiqlanmagan'}</span></div>
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
