'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { hallsService, bookingsService } from '@/services/api.service';
import { Hall, Booking } from '@/types';
import { formatDate, BOOKING_STATUSES } from '@/lib/utils';
import { 
  BusinessOutlined, 
  CalendarMonthOutlined, 
  HourglassEmptyOutlined, 
  MonetizationOnOutlined,
  TrendingUpOutlined,
  LabelOutlined,
  InboxOutlined,
  CheckCircleOutlineOutlined,
  CancelOutlined,
  PersonAddOutlined,
  BarChartOutlined
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#722F37', '#C49B3C', '#2E7D32', '#4A7B9B', '#8C5A6D'];

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

/* ── Demo data — API ishlamayotganda dashboard bo'sh qolmasligi uchun ── */
const DEMO_HALLS: Hall[] = [
  { id: 'd1', name: 'Visol to\'yxonasi', category: 'PREMIUM', capacity: 500, pricePerPlate: 200000, city: 'Yunusobod', status: 'APPROVED', description: '' },
  { id: 'd2', name: 'Guliston saroyi', category: 'STANDARD', capacity: 400, pricePerPlate: 150000, city: 'Chilonzor', status: 'APPROVED', description: '' },
  { id: 'd3', name: 'Sharq to\'yxonasi', category: 'VIP', capacity: 700, pricePerPlate: 280000, city: 'Mirobod', status: 'APPROVED', description: '' },
  { id: 'd4', name: 'Bahor saroyi', category: 'STANDARD', capacity: 350, pricePerPlate: 140000, city: 'Olmazor', status: 'PENDING', description: '' },
  { id: 'd5', name: 'Hilol to\'yxonasi', category: 'ECONOMY', capacity: 250, pricePerPlate: 110000, city: 'Sergeli', status: 'APPROVED', description: '' },
  { id: 'd6', name: 'Nargiza saroyi', category: 'STANDARD', capacity: 300, pricePerPlate: 130000, city: 'Uchtepa', status: 'PENDING', description: '' },
];
const DEMO_BOOKINGS: Booking[] = [
  { id: 'db1', hallId: 'd1', hall: DEMO_HALLS[0], eventDate: '2026-06-15', numberOfGuests: 320, totalAmount: 64000000, advanceAmount: 16000000, finalAmount: 48000000, status: 'CONFIRMED' },
  { id: 'db2', hallId: 'd2', hall: DEMO_HALLS[1], eventDate: '2026-06-07', numberOfGuests: 200, totalAmount: 30000000, advanceAmount: 7500000, finalAmount: 22500000, status: 'PENDING' },
  { id: 'db3', hallId: 'd3', hall: DEMO_HALLS[2], eventDate: '2026-06-22', numberOfGuests: 450, totalAmount: 126000000, advanceAmount: 31500000, finalAmount: 94500000, status: 'CONFIRMED' },
  { id: 'db4', hallId: 'd4', hall: DEMO_HALLS[3], eventDate: '2026-05-18', numberOfGuests: 280, totalAmount: 39200000, advanceAmount: 9800000, finalAmount: 29400000, status: 'COMPLETED' },
  { id: 'db5', hallId: 'd5', hall: DEMO_HALLS[4], eventDate: '2026-07-10', numberOfGuests: 180, totalAmount: 19800000, advanceAmount: 4950000, finalAmount: 14850000, status: 'CONFIRMED' },
  { id: 'db6', hallId: 'd6', hall: DEMO_HALLS[5], eventDate: '2026-06-07', numberOfGuests: 250, totalAmount: 32500000, advanceAmount: 8125000, finalAmount: 24375000, status: 'CANCELLED' },
];

export default function AdminDashboard() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      hallsService.search({ limit: 100 })
        .then(r => { const d = r.data.data; setHalls(d?.halls || []); })
        .catch(() => { setHalls(DEMO_HALLS); }),
      bookingsService.list({ limit: 100 })
        .then(r => { const d = r.data.data; setBookings(d?.bookings || []); })
        .catch(() => { setBookings(DEMO_BOOKINGS); }),
    ]).finally(() => setLoading(false));
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.eventDate?.startsWith(todayStr));
  const pendingHalls = halls.filter(h => h.status !== 'APPROVED' && h.status !== 'REJECTED');
  const approvedHalls = halls.filter(h => h.status === 'APPROVED');
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const revenue = bookings.reduce((s, b) => s + Number(b.totalAmount || 0), 0);

  /* ── Revenue by month (computed from actual bookings) ── */
  const currentMonth = new Date().getMonth();
  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const month = (currentMonth - 6 + i + 12) % 12;
    // Calculate total revenue from actual bookings for this month
    const monthRevenue = bookings
      .filter(b => b.eventDate && new Date(b.eventDate).getMonth() === month && (b.status === 'CONFIRMED' || b.status === 'COMPLETED'))
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
    
    return {
      name: MONTHS[month],
      revenue: monthRevenue > 0 ? monthRevenue : 0
    };
  });

  /* ── Category distribution ── */
  const categoryCounts = halls.reduce<Record<string, number>>((acc, h) => {
    const cat = h.category || 'STANDARD';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  /* ── Top Booked Halls ── */
  const hallBookingCounts = bookings.reduce<Record<string, number>>((acc, b) => {
    if (b.hallId) {
      acc[b.hallId] = (acc[b.hallId] || 0) + 1;
    }
    return acc;
  }, {});
  
  const topHalls = halls
    .map(h => ({ ...h, bookingCount: hallBookingCounts[h.id] || 0 }))
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, 5);

  const stats = [
    {
      icon: <BusinessOutlined sx={{ fontSize: 24 }} />, label: "Jami to'yxonalar", value: halls.length,
      sub: `${approvedHalls.length} tasdiqlangan`, bg: 'rgba(114,47,55,0.07)', color: 'var(--burgundy)',
      trend: '+12%', trendUp: true,
    },
    {
      icon: <CalendarMonthOutlined sx={{ fontSize: 24 }} />, label: 'Bugungi bronlar', value: todayBookings.length,
      sub: `${confirmedBookings.length} tasdiqlangan`, bg: 'rgba(74,139,92,0.07)', color: 'var(--success)',
      trend: '+5%', trendUp: true,
    },
    {
      icon: <HourglassEmptyOutlined sx={{ fontSize: 24 }} />, label: "Tasdiqlanmagan zallar", value: pendingHalls.length,
      sub: 'Ko\'rib chiqilishi kerak', bg: 'rgba(196,155,60,0.07)', color: 'var(--warning)',
      trend: pendingHalls.length > 0 ? '⚠️ Diqqat' : '✅ Barchasi OK', trendUp: false,
    },
    {
      icon: <MonetizationOnOutlined sx={{ fontSize: 24 }} />, label: "Jami daromad", value: `${(revenue / 1_000_000).toFixed(1)}M`,
      sub: "so'm", bg: 'rgba(74,123,155,0.07)', color: 'var(--info)',
      trend: '+18%', trendUp: true,
    },
  ];

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-8)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--s-1)' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            📅 {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-3)' }}>
          <Link href="/admin/halls" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BusinessOutlined sx={{ fontSize: 18 }} /> Zallar</Link>
          <Link href="/admin/bookings" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CalendarMonthOutlined sx={{ fontSize: 18 }} /> Bronlar</Link>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--s-8)' }}>
        {stats.map((s, i) => (
          <div
            key={i}
            className="stat-card"
            style={{ cursor: 'pointer', outline: activeCard === i ? '2px solid var(--burgundy)' : 'none' }}
            onClick={() => setActiveCard(activeCard === i ? null : i)}
          >
            <div className="stat-icon" style={{ background: s.bg, color: s.color, fontSize: '1.5rem' }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--s-1)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.sub}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: s.trendUp ? 'var(--success)' : 'var(--warning)' }}>{s.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-6)', marginBottom: 'var(--s-8)' }}>

        {/* Revenue chart */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', padding: 'var(--s-8)', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-4)' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--s-1)', display: 'flex', alignItems: 'center', gap: 6 }}><TrendingUpOutlined sx={{ fontSize: 18 }} /> Daromad dinamikasi</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>So&apos;nggi 7 oy</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--burgundy)' }}>
                {(revenue / 1_000_000).toFixed(1)}M
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>↑ +18% o&apos;sish</div>
            </div>
          </div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--burgundy)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--burgundy)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis hide domain={['dataMin - 10000000', 'dataMax + 10000000']} />
                <Tooltip 
                  formatter={(value: number) => [new Intl.NumberFormat('uz-UZ').format(value) + " so'm", "Daromad"]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--burgundy)" strokeWidth={3} dot={{ r: 4, fill: 'var(--burgundy)' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', padding: 'var(--s-8)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--s-2)', display: 'flex', alignItems: 'center', gap: 6 }}><LabelOutlined sx={{ fontSize: 18 }} /> Kategoriyalar</h3>
          {categoryData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Ma&apos;lumot yo&apos;q
            </div>
          ) : (
            <div style={{ width: '100%', height: 180, position: 'relative' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value + " ta to'yxona", "Soni"]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: 'auto' }}>
            {categoryData.map((entry, index) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        {/* Top Booked Halls */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', padding: 'var(--s-8)', border: '1px solid var(--border-light)' }}>
          <div className="flex-between" style={{ marginBottom: 'var(--s-4)' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 6 }}><BusinessOutlined sx={{ fontSize: 18 }} /> Eng ko&apos;p bron qilingan to&apos;yxonalar</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            {topHalls.map((h, i) => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--s-2)', borderBottom: i !== topHalls.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: i < 3 ? 'var(--burgundy)' : 'var(--text-muted)', width: 24, textAlign: 'center' }}>
                    #{i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{h.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{h.city || 'Toshkent'} · {h.capacity} kishi</div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--burgundy)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {h.bookingCount} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>marta</span>
                </div>
              </div>
            ))}
            {topHalls.length === 0 && (
               <div style={{ textAlign: 'center', padding: 'var(--s-4)', color: 'var(--text-muted)' }}>Ma&apos;lumot yo&apos;q</div>
            )}
          </div>
        </div>
      </div>

      {/* ── PENDING APPROVALS ── */}
      {pendingHalls.length > 0 && (
        <div style={{ background: 'rgba(196,155,60,0.06)', borderRadius: 'var(--r-xl)', padding: 'var(--s-6)', border: '1px solid rgba(196,155,60,0.2)', marginBottom: 'var(--s-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-4)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 6 }}><HourglassEmptyOutlined sx={{ fontSize: 18 }} /> Tasdiqlanishi kutilayotgan zallar ({pendingHalls.length})</h3>
            <Link href="/admin/halls" className="btn btn-sm btn-ghost">Barchasi →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            {pendingHalls.slice(0, 3).map(h => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--white)', padding: 'var(--s-4) var(--s-5)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(196,155,60,0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BusinessOutlined />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{h.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{h.city || 'Toshkent'} · {h.capacity} kishi</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
                  <Link href={`/admin/halls/${h.id}`} className="btn btn-sm btn-primary">Ko&apos;rish</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TABLES ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-6)' }}>

        {/* Recent bookings */}
        <div>
          <div className="flex-between" style={{ marginBottom: 'var(--s-4)' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 6 }}><CalendarMonthOutlined sx={{ fontSize: 18 }} /> So&apos;nggi bronlar</h3>
            <Link href="/admin/bookings" className="btn btn-sm btn-ghost">Barchasi →</Link>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>To&apos;yxona</th>
                  <th>Sana</th>
                  <th>Mehmon</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 6).map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.hall?.name || '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{formatDate(b.eventDate)}</td>
                    <td>{b.numberOfGuests}</td>
                    <td>
                      <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : b.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                        {BOOKING_STATUSES[b.status] || b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--s-8)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><InboxOutlined sx={{ fontSize: 18 }} /> Bronlar yo&apos;q</div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Halls list */}
        <div>
          <div className="flex-between" style={{ marginBottom: 'var(--s-4)' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 6 }}><BusinessOutlined sx={{ fontSize: 18 }} /> To&apos;yxonalar holati</h3>
            <Link href="/admin/halls" className="btn btn-sm btn-ghost">Barchasi →</Link>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nomi</th>
                  <th>Sig&apos;im</th>
                  <th>Narx</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {halls.slice(0, 6).map(h => (
                  <tr key={h.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/admin/halls/${h.id}`}>
                    <td style={{ fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</td>
                    <td>{h.capacity}</td>
                    <td style={{ fontSize: '0.82rem' }}>{h.pricePerPlate?.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${h.status === 'APPROVED' ? 'badge-success' : h.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                        {h.status === 'APPROVED' ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircleOutlineOutlined sx={{ fontSize: 14 }} /> Tasdiqlangan</span> : h.status === 'REJECTED' ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CancelOutlined sx={{ fontSize: 14 }} /> Rad</span> : <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HourglassEmptyOutlined sx={{ fontSize: 14 }} /> Kutish</span>}
                      </span>
                    </td>
                  </tr>
                ))}
                {halls.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--s-8)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><InboxOutlined sx={{ fontSize: 18 }} /> Zallar yo&apos;q</div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ marginTop: 'var(--s-8)', background: 'linear-gradient(135deg, var(--burgundy) 0%, var(--burgundy-deep) 100%)', borderRadius: 'var(--r-xl)', padding: 'var(--s-8)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-4)' }}>
        {[
          { icon: <BusinessOutlined sx={{ fontSize: 28 }} />, label: "To'yxona qo'shish", href: '/admin/halls/create' },
          { icon: <PersonAddOutlined sx={{ fontSize: 28 }} />, label: "Egasi qo'shish", href: '/admin/owners' },
          { icon: <CalendarMonthOutlined sx={{ fontSize: 28 }} />, label: "Bronlarni ko'rish", href: '/admin/bookings' },
          { icon: <BarChartOutlined sx={{ fontSize: 28 }} />, label: "Barcha zallar", href: '/admin/halls' },
        ].map((a, i) => (
          <Link key={i} href={a.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-2)', padding: 'var(--s-5)', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--r-lg)', border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none', transition: 'background 0.2s', color: 'white' }}
            className="quick-action">
            <span style={{ display: 'flex' }}>{a.icon}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 500, textAlign: 'center', color: 'rgba(255,255,255,0.85)' }}>{a.label}</span>
          </Link>
        ))}
      </div>

      <style>{`.quick-action:hover { background: rgba(255,255,255,0.18) !important; transform: translateY(-2px); }`}</style>
    </div>
  );
}
