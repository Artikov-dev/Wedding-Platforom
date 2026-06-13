'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { bookingsService } from '@/services/api.service';
import { Booking } from '@/types';
import { formatPrice, formatDate, BOOKING_STATUSES } from '@/lib/utils';
import { 
  FormatListBulletedOutlined, 
  PictureAsPdfOutlined,
  BusinessOutlined,
  AccessTimeOutlined
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BookingTicket } from '@/components/pdf/BookingTicket';
import { useToast } from '@/components/ui/Toast';

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const ticketRef = React.useRef<HTMLDivElement>(null);
  const [ticketBooking, setTicketBooking] = useState<Booking | null>(null);
  const { showToast } = useToast();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookingsService.list({ limit: 100 });
      setBookings(res.data.data?.bookings || []);
    } catch (err) {
      console.error(err);
      showToast('Bronlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleDownloadTicket = async (booking: Booking) => {
    setTicketBooking(booking);
    setDownloadingId(booking.id);
    
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <span className="badge badge-success">Tasdiqlangan</span>;
      case 'PENDING': return <span className="badge badge-warning">Kutilmoqda</span>;
      case 'CANCELLED': return <span className="badge badge-error">Bekor qilingan</span>;
      case 'COMPLETED': return <span className="badge" style={{ background: '#4A7B9B', color: 'white' }}>Yakunlangan</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 'var(--s-6)' }}>
        <h1 className="page-title">Mening Bronlarim</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Siz band qilgan barcha to&apos;yxonalar va ularning holati</p>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : bookings.length > 0 ? (
        <div className="grid grid-2">
          {bookings.map((b) => (
            <div key={b.id} className="card hover-scale" style={{ padding: 'var(--s-6)', display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--s-1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BusinessOutlined sx={{ fontSize: 20, color: 'var(--burgundy)' }} />
                    {b.hall?.name || 'To\'yxona'}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Bron ID: <strong>{b.bookingNumber || b.id.slice(0, 8).toUpperCase()}</strong>
                  </p>
                </div>
                {getStatusBadge(b.status)}
              </div>

              <div style={{ background: 'var(--bg-light)', padding: 'var(--s-4)', borderRadius: 'var(--r-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-3)' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tadbir sanasi</p>
                  <p style={{ fontWeight: 600 }}>{formatDate(b.eventDate)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mehmonlar</p>
                  <p style={{ fontWeight: 600 }}>{b.numberOfGuests} kishi</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Umumiy To&apos;lov</p>
                  <p style={{ fontWeight: 700, color: 'var(--burgundy)' }}>{formatPrice(b.totalAmount)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>To&apos;lov holati</p>
                  <p style={{ fontWeight: 600 }}>{b.paymentStatus === 'PAID' ? 'To\'langan' : b.paymentStatus === 'ADVANCE_PAID' ? 'Bo\'nak to\'langan' : 'Kutilmoqda'}</p>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 'var(--s-4)', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-outline" 
                  onClick={() => handleDownloadTicket(b)}
                  disabled={downloadingId === b.id || b.status !== 'CONFIRMED'}
                  title={b.status !== 'CONFIRMED' ? 'Bilet yuklash uchun tasdiqlanishi kerak' : 'PDF Bilet yuklash'}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {downloadingId === b.id ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <PictureAsPdfOutlined sx={{ fontSize: 18 }} />}
                  Biletni Yuklash
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
            <FormatListBulletedOutlined sx={{ fontSize: 64 }} />
          </div>
          <h3>Sizda hozircha bronlar yo&apos;q</h3>
          <p>Yangi to&apos;yxonani bron qilish uchun asosiy sahifaga o&apos;ting.</p>
          <a href="/" className="btn btn-primary" style={{ marginTop: 'var(--s-4)' }}>Zallarni ko&apos;rish</a>
        </div>
      )}

      {/* Hidden container for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
        {ticketBooking && <BookingTicket booking={ticketBooking} ref={ticketRef} />}
      </div>
    </div>
  );
}
