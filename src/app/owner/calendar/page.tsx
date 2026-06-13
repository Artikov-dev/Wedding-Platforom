'use client';

import React, { useState, useEffect } from 'react';
import { bookingsService } from '@/services/api.service';
import { Booking } from '@/types';
import { formatDate, formatPrice, BOOKING_STATUSES } from '@/lib/utils';
import { 
  ChevronLeftOutlined, 
  ChevronRightOutlined, 
  CalendarMonthOutlined, 
  PeopleOutlined, 
  PhoneOutlined, 
  CreditCardOutlined, 
  PersonOutlineOutlined 
} from '@mui/icons-material';

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
const WEEKDAYS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'];

export default function OwnerCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await bookingsService.list({ limit: 500 });
        setBookings(res.data.data?.bookings || []);
      } catch (error) {
        console.error('Failed to load bookings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const getDateStr = (day: number) => `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getBookingsForDate = (dateStr: string) => bookings.filter(b => b.eventDate.startsWith(dateStr));

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: selectedDate ? '1fr 400px' : '1fr', gap: 'var(--s-6)', transition: 'all 0.3s ease', alignItems: 'start' }}>
      
      {/* Calendar Section */}
      <div style={{ background: 'var(--white)', padding: 'var(--s-6)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-8)' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: 'var(--s-1)' }}>Taqvim</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Barcha to'yxonalaringiz bo'yicha bronlar ro'yxati</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center', background: 'var(--surface)', padding: 'var(--s-2) var(--s-4)', borderRadius: 'var(--r-full)' }}>
            <button onClick={prevMonth} style={{ border: 'none', background: 'var(--white)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeftOutlined sx={{ fontSize: 18 }} /></button>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, minWidth: '130px', textAlign: 'center', color: 'var(--burgundy)' }}>
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <button onClick={nextMonth} style={{ border: 'none', background: 'var(--white)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRightOutlined sx={{ fontSize: 18 }} /></button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--s-20) 0', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--s-2)', marginBottom: 'var(--s-4)' }}>
              {WEEKDAYS.map(day => (
                <div key={day} style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{day}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--s-2)' }}>
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} style={{ minHeight: '100px', background: 'transparent' }} />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = getDateStr(day);
                const dayBookings = getBookingsForDate(dateStr);
                const isSelected = selectedDate === dateStr;
                const isToday = todayStr === dateStr;

                return (
                  <div 
                    key={day} 
                    onClick={() => setSelectedDate(dateStr)}
                    style={{ 
                      minHeight: '110px', 
                      background: isSelected ? 'rgba(114, 47, 55, 0.05)' : 'var(--surface)', 
                      border: `1px solid ${isSelected ? 'var(--burgundy)' : isToday ? 'var(--gold)' : 'var(--border-light)'}`,
                      borderRadius: 'var(--r-lg)', 
                      padding: 'var(--s-2)', 
                      cursor: 'pointer',
                      transition: 'all var(--t-fast)',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ 
                        fontWeight: isToday ? 700 : 600, 
                        fontSize: '1rem', 
                        color: isToday ? 'white' : isSelected ? 'var(--burgundy)' : 'var(--text)',
                        background: isToday ? 'var(--burgundy)' : 'transparent',
                        width: '28px', height: '28px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%'
                      }}>{day}</span>
                      
                      {dayBookings.length > 0 && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--gold)', color: 'white', padding: '2px 6px', borderRadius: 'var(--r-full)' }}>
                          {dayBookings.length}
                        </span>
                      )}
                    </div>

                    <div style={{ marginTop: 'var(--s-2)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {dayBookings.slice(0, 3).map((b, idx) => {
                        const statusColor = b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'var(--success)' : b.status === 'CANCELLED' ? 'var(--danger)' : 'var(--warning)';
                        return (
                          <div key={idx} style={{ 
                            fontSize: '0.7rem', 
                            padding: '4px 6px', 
                            background: 'var(--white)', 
                            borderLeft: `3px solid ${statusColor}`,
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}>
                            <span style={{ fontWeight: 600 }}>{b.hall?.name || 'To`yxona'}</span>
                          </div>
                        );
                      })}
                      {dayBookings.length > 3 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2px' }}>+{dayBookings.length - 3} yana</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Details Panel */}
      {selectedDate && (
        <div className="slide-up" style={{ background: 'var(--white)', padding: 'var(--s-6)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'sticky', top: 'var(--s-8)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-6)', paddingBottom: 'var(--s-4)', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--burgundy)', marginBottom: '4px' }}>{formatDate(selectedDate)}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tanlangan sanadagi bronlar</p>
            </div>
            <button onClick={() => setSelectedDate(null)} style={{ border: 'none', background: 'var(--surface)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>✕</button>
          </div>

          {selectedBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--s-10) 0', color: 'var(--text-muted)' }}>
              <CalendarMonthOutlined sx={{ fontSize: 48 }} style={{ opacity: 0.2, margin: '0 auto var(--s-4)' }} />
              <p>Bu sanada bronlar yo'q</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
              {selectedBookings.map((booking) => (
                <div key={booking.id} style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 'var(--s-5)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-4)' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--burgundy)' }}>{booking.hall?.name || 'To`yxona'}</h4>
                    <span className={`badge ${booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? 'badge-success' : booking.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                      {BOOKING_STATUSES[booking.status] || booking.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--s-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', fontSize: '0.9rem' }}>
                      <div style={{ padding: '6px', background: 'rgba(196,155,60,0.1)', borderRadius: '50%', color: 'var(--gold)', display: 'flex' }}><PersonOutlineOutlined sx={{ fontSize: 16 }} /></div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Buyurtmachi</div>
                        <div style={{ fontWeight: 500 }}>{booking.user?.firstName} {booking.user?.lastName}</div>
                      </div>
                    </div>
                    {booking.user?.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', fontSize: '0.9rem' }}>
                        <div style={{ padding: '6px', background: 'rgba(196,155,60,0.1)', borderRadius: '50%', color: 'var(--gold)', display: 'flex' }}><PhoneOutlined sx={{ fontSize: 16 }} /></div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Telefon</div>
                          <a href={`tel:${booking.user.phone}`} style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>{booking.user.phone}</a>
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', fontSize: '0.9rem' }}>
                      <div style={{ padding: '6px', background: 'rgba(196,155,60,0.1)', borderRadius: '50%', color: 'var(--gold)', display: 'flex' }}><PeopleOutlined sx={{ fontSize: 16 }} /></div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Mehmonlar soni</div>
                        <div style={{ fontWeight: 500 }}>{booking.numberOfGuests} kishi</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', fontSize: '0.9rem' }}>
                      <div style={{ padding: '6px', background: 'rgba(114,47,55,0.1)', borderRadius: '50%', color: 'var(--burgundy)', display: 'flex' }}><CreditCardOutlined sx={{ fontSize: 16 }} /></div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>To'lov holati</div>
                        <div style={{ display: 'flex', gap: 'var(--s-4)' }}>
                          <div><span style={{ color: 'var(--text-muted)' }}>Jami:</span> <span style={{ fontWeight: 600, color: 'var(--burgundy)' }}>{formatPrice(booking.totalAmount)}</span></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Avans:</span> <span style={{ fontWeight: 600 }}>{formatPrice(booking.advanceAmount)}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div style={{ marginTop: 'var(--s-4)', paddingTop: 'var(--s-4)', borderTop: '1px dashed var(--border)', fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Izoh:</div>
                      <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: '1.4' }}>"{booking.notes}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
