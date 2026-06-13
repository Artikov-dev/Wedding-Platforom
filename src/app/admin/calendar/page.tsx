'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { uz } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { bookingsService } from '@/services/api.service';
import { Booking } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

const locales = {
  'uz': uz,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function AdminCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    bookingsService.list({ limit: 500 })
      .then(res => {
        setBookings(res.data.data?.bookings || []);
      })
      .catch(() => showToast('Bronlarni yuklashda xatolik', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const events = bookings.map(b => ({
    id: b.id,
    title: `${b.hall?.name || 'Zal'} - ${b.user ? b.user.firstName : 'Mijoz'}`,
    start: new Date(b.eventDate),
    end: new Date(b.eventDate), // Events are all day usually
    allDay: true,
    resource: b,
  }));

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#c49b3c'; // PENDING
    if (event.resource.status === 'CONFIRMED') backgroundColor = '#2e7d32';
    if (event.resource.status === 'CANCELLED') backgroundColor = '#c62828';
    
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 'var(--s-6)' }}>
        <h1 className="page-title">Bronlar Taqvimi</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Barcha to&apos;yxonalar bandligini yagona vizual taqvimda kuzatish</p>
      </div>

      <div className="card" style={{ padding: 'var(--s-6)', height: '75vh', background: 'var(--white)' }}>
        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', fontFamily: 'var(--font-body)' }}
            eventPropGetter={eventStyleGetter}
            messages={{
              next: "Keyingi",
              previous: "Oldingi",
              today: "Bugun",
              month: "Oy",
              week: "Hafta",
              day: "Kun",
            }}
            onSelectEvent={(event) => {
              // Custom modal or redirect
              window.location.href = `/admin/bookings`;
            }}
          />
        )}
      </div>

      <style>{`
        .rbc-toolbar button {
          font-family: var(--font-body);
          border-radius: var(--r-md);
        }
        .rbc-toolbar button.rbc-active {
          background-color: var(--burgundy);
          color: white;
          border-color: var(--burgundy);
        }
        .rbc-event {
          padding: 2px 5px;
        }
      `}</style>
    </div>
  );
}
