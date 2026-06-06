'use client';

import React, { useState } from 'react';

const MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];
const WEEKDAYS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'];

interface CalendarProps {
  bookedDates?: string[];
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
  onClickBooked?: (date: string) => void;
}

export default function Calendar({ bookedDates = [], selectedDate, onSelectDate, onClickBooked }: CalendarProps) {
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
          return (
            <button
              key={day}
              className={getDayClass(day)}
              onClick={() => handleDayClick(day)}
              disabled={isPast(day) && !isBooked(day)}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(74,139,92,0.2)', display: 'inline-block' }} /> Bo&apos;sh
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(184,58,58,0.15)', display: 'inline-block' }} /> Bron qilingan
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--color-border)', display: 'inline-block' }} /> O&apos;tgan
        </span>
      </div>
    </div>
  );
}
