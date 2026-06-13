  'use client';

import React, { useState } from 'react';

const MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];
const WEEKDAYS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'];

interface CalendarProps {
  bookedDates?: string[];
  bookedDetails?: Record<string, string>;
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
  onClickBooked?: (date: string) => void;
}

export default function Calendar({ bookedDates = [], bookedDetails = {}, selectedDate, onSelectDate, onClickBooked }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const formatDate = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isBooked = (day: number) => bookedDates.includes(formatDate(day));
  const isPast = (day: number) => new Date(currentYear, currentMonth, day) < today;
  const isToday = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    return d.getTime() === today.getTime();
  };
  const isSelected = (day: number) => selectedDate === formatDate(day);

  const handleDayClick = (day: number) => {
    const dateStr = formatDate(day);
    if (isBooked(day)) {
      onClickBooked?.(dateStr);
      return;
    }
    if (isPast(day)) return;
    onSelectDate?.(dateStr);
  };

  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const getDayClass = (day: number) => {
    const classes = ['calendar-day'];
    if (isToday(day)) classes.push('today');
    if (isSelected(day)) classes.push('selected');
    else if (isBooked(day)) classes.push('booked');
    else if (isPast(day)) classes.push('disabled');
    else classes.push('available');
    return classes.join(' ');
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h4 className="calendar-title">{MONTHS[currentMonth]} {currentYear}</h4>
        <div className="calendar-nav">
          <button onClick={prevMonth}>‹</button>
          <button onClick={nextMonth}>›</button>
        </div>
      </div>
      <div className="calendar-weekdays">
        {WEEKDAYS.map((d) => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
      </div>
      <div className="calendar-days">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDate(day);
          const bookedInfo = bookedDetails[dateStr];

          return (
            <button
              key={day}
              className={getDayClass(day)}
              style={{ position: 'relative' }}
              onClick={() => handleDayClick(day)}
              disabled={isPast(day) && !isBooked(day)}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {day}
              
              {/* Custom Tooltip */}
              {isBooked(day) && hoveredDay === day && bookedInfo && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 12px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, var(--burgundy) 0%, var(--gold) 100%)',
                  color: 'var(--white)',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap',
                  zIndex: 50,
                  boxShadow: '0 8px 24px rgba(114, 47, 55, 0.4)',
                  pointerEvents: 'none',
                  animation: 'bookOpen 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
                  transformOrigin: 'bottom center',
                  fontWeight: '600',
                  lineHeight: '1.4',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {bookedInfo}
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: '6px',
                    borderStyle: 'solid',
                    borderColor: 'var(--gold) transparent transparent transparent',
                    opacity: 0.9
                  }} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          ✅ Bo&apos;sh
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          🔴 Band qilingan
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          ⚪ O&apos;tgan
        </span>
      </div>
    </div>
  );
}
