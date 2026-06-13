import React, { forwardRef } from 'react';
import { Booking } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from '@/lib/utils';

interface InvitationCardProps {
  booking: Booking;
}

export const InvitationCard = forwardRef<HTMLDivElement, InvitationCardProps>(({ booking }, ref) => {
  const hallName = booking.hall?.name || "To'yxona";
  const hallCity = booking.hall?.city || '';
  const dateStr = formatDate(booking.eventDate);
  const timeStr = "18:00"; // Standart to'y vaqti
  
  // Fake link for QR - in reality it would point to a map link or the hall page
  const locationLink = `https://toyxona.uz/halls/${booking.hallId}`;

  return (
    <div 
      ref={ref}
      style={{
        width: '600px',
        height: '848px', // A5 Format ratio
        background: '#fffef9', // Creamy white
        padding: '40px',
        boxSizing: 'border-box',
        position: 'relative',
        fontFamily: '"Georgia", "Times New Roman", serif',
        color: '#2a2a2a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: '0 0 20px rgba(0,0,0,0.05)'
      }}
    >
      {/* Outer Golden Border */}
      <div style={{
        position: 'absolute',
        top: '20px', left: '20px', right: '20px', bottom: '20px',
        border: '2px solid #D4AF37',
        pointerEvents: 'none'
      }}></div>
      
      {/* Inner Thin Border */}
      <div style={{
        position: 'absolute',
        top: '28px', left: '28px', right: '28px', bottom: '28px',
        border: '1px solid #D4AF37',
        pointerEvents: 'none'
      }}></div>

      <div style={{ fontSize: '18px', color: '#D4AF37', marginBottom: '20px', letterSpacing: '2px' }}>
        T A K L I F N O M A
      </div>

      <div style={{ fontSize: '40px', marginBottom: '30px' }}>
        <svg width="60" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="12" r="5"></circle>
          <circle cx="15" cy="12" r="5"></circle>
        </svg>
      </div>

      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: 'normal',
        margin: '0 0 30px 0',
        lineHeight: '1.4',
        color: '#1a1a1a'
      }}>
        Hurmatli mehmon!
      </h1>

      <p style={{ 
        fontSize: '22px', 
        lineHeight: '1.8', 
        margin: '0 0 40px 0',
        padding: '0 20px',
        fontStyle: 'italic'
      }}>
        Sizni farzandlarimizning baxt to&apos;yiga bag&apos;ishlangan visol oqshomiga lutfan taklif etamiz.
      </p>

      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '26px', color: '#D4AF37', fontWeight: 'bold', marginBottom: '10px' }}>
          {dateStr}
        </div>
        <div style={{ fontSize: '20px', letterSpacing: '1px' }}>
          Soat: {timeStr}
        </div>
      </div>

      <div style={{ marginBottom: '40px', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '20px 0', width: '80%' }}>
        <div style={{ fontSize: '16px', textTransform: 'uppercase', color: '#888', marginBottom: '10px', letterSpacing: '2px' }}>
          Manzil
        </div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '5px' }}>
          {hallName}
        </div>
        <div style={{ fontSize: '18px', color: '#555' }}>
          {hallCity}
        </div>
      </div>

      <div>
        <QRCodeSVG value={locationLink} size={90} level="M" fgColor="#2a2a2a" />
        <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
          Kodni skanerlab xaritada oching
        </div>
      </div>
    </div>
  );
});

InvitationCard.displayName = 'InvitationCard';
