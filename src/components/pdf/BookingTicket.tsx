import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Booking } from '@/types';
import { formatDate, formatPrice } from '@/lib/utils';

interface BookingTicketProps {
  booking: Booking;
}

export const BookingTicket = forwardRef<HTMLDivElement, BookingTicketProps>(
  ({ booking }, ref) => {
    if (!booking || !booking.hall) return null;

    const qrValue = `https://toyxona.uz/verify/${booking.id}`;

    return (
      <div
        ref={ref}
        style={{
          width: '800px',
          background: '#ffffff',
          fontFamily: 'sans-serif',
          color: '#333',
          padding: '40px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div
          style={{
            border: '2px dashed #722F37',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          {/* Left side: Main Info */}
          <div style={{ flex: 1, padding: '30px', borderRight: '2px dashed #722F37' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h1 style={{ margin: 0, color: '#722F37', fontSize: '32px', fontWeight: 800 }}>To&apos;yxona.uz</h1>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Rasmiy elektron bilet va kvitansiya</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>Bron ID</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{booking.bookingNumber || booking.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>To&apos;yxona nomi</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{booking.hall.name}</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{booking.hall.city || 'Toshkent'}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>Mijoz</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                  {booking.user ? `${booking.user.firstName} ${booking.user.lastName || ''}` : 'Mijoz'}
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  {booking.user?.phone || '+998 ** *** ** **'}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', background: '#f8f4f4', padding: '20px', borderRadius: '12px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>Tadbir Sanasi</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#722F37' }}>{formatDate(booking.eventDate)}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>Mehmonlar</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#722F37' }}>{booking.numberOfGuests} kishi</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>Holati</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: booking.status === 'CONFIRMED' ? '#2e7d32' : '#c49b3c' }}>
                  {booking.status === 'CONFIRMED' ? 'TASDIQLANGAN' : booking.status === 'PENDING' ? 'KUTILMOQDA' : booking.status}
                </p>
              </div>
            </div>
          </div>

          {/* Right side: Price & QR */}
          <div style={{ width: '250px', padding: '30px', background: '#fff9f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>Jami to&apos;lov</p>
              <p style={{ margin: '5px 0 15px', fontSize: '24px', fontWeight: 800, color: '#722F37' }}>{formatPrice(booking.totalAmount)}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eaeaea', paddingTop: '10px', fontSize: '12px' }}>
                <span style={{ color: '#666' }}>To&apos;langan:</span>
                <span style={{ fontWeight: 600 }}>{formatPrice(booking.advanceAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '5px', fontSize: '12px' }}>
                <span style={{ color: '#666' }}>Qoldiq:</span>
                <span style={{ fontWeight: 600 }}>{formatPrice(booking.finalAmount)}</span>
              </div>
            </div>

            <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginTop: '20px' }}>
              <QRCodeSVG value={qrValue} size={140} level="H" fgColor="#333" />
            </div>
            <p style={{ margin: '10px 0 0', fontSize: '10px', color: '#999', textAlign: 'center' }}>Haqiqiyligini tekshirish uchun skanerlang</p>
          </div>
        </div>
      </div>
    );
  }
);

BookingTicket.displayName = 'BookingTicket';
