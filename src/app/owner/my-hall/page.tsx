'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Calendar from '@/components/shared/Calendar';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Hall, Booking } from '@/types';
import { formatPrice, formatDate, BOOKING_STATUSES } from '@/lib/utils';

export default function MyHallPage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([
      api.get('/api/halls/search').then(r => { const d = r.data.data; setHalls(Array.isArray(d) ? d : d?.halls || []); }).catch(() => {}),
      api.get('/api/bookings').then(r => setBookings(Array.isArray(r.data.data) ? r.data.data : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const hall = halls[0];
  const bookedDates = bookings.map(b => b.eventDate?.split('T')[0]).filter(Boolean);

  const handleClickBooked = (date: string) => {
    const booking = bookings.find(b => b.eventDate?.startsWith(date));
    if (booking) setSelectedBooking(booking);
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  if (!hall) return (
    <div className="empty-state">
      <div className="empty-state-icon">🏛️</div>
      <h3>Hali to&apos;yxona qo&apos;shilmagan</h3>
      <p style={{ marginBottom: 'var(--space-lg)' }}>Yangi to&apos;yxona ro&apos;yxatdan o&apos;tkazing</p>
      <Link href="/owner/register-hall" className="btn btn-primary">➕ To&apos;yxona qo&apos;shish</Link>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{hall.name}</h1>
        <Link href="/owner/my-hall/edit" className="btn btn-outline">✏️ Tahrirlash</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
        <div className="image-placeholder" style={{ minHeight: 300 }}>
          {hall.imageUrl ? <img src={hall.imageUrl} alt={hall.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} /> : "🏛️ To'yxona rasmi"}
        </div>
        <div className="card card-body">
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Ma&apos;lumotlar</h3>
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            <div><strong>Kategoriya:</strong> {hall.category || '—'}</div>
            <div><strong>Sig&apos;im:</strong> {hall.capacity} kishi</div>
            <div><strong>Narx:</strong> {formatPrice(hall.pricePerPlate)} / kishi</div>
            <div><strong>Rayon:</strong> {hall.city || '—'}</div>
            <div><strong>Manzil:</strong> {hall.address || '—'}</div>
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
            <div><strong>Umumiy narx:</strong> {formatPrice(selectedBooking.totalAmount)}</div>
            <div><strong>Status:</strong> {BOOKING_STATUSES[selectedBooking.status] || selectedBooking.status}</div>
            {selectedBooking.user && <div><strong>Mijoz:</strong> {selectedBooking.user.firstName} {selectedBooking.user.lastName}</div>}
            {selectedBooking.notes && <div><strong>Izoh:</strong> {selectedBooking.notes}</div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
