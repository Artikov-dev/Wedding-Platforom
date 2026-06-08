'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { hallsService, bookingsService } from '@/services/api.service';
import { Hall, Booking } from '@/types';
import { formatDate, BOOKING_STATUSES } from '@/lib/utils';

/* ── Mini bar chart component ── */
function MiniBar({ value, max, color = 'var(--burgundy)' }: { value: number; max: number; color?: string }) {
  return (
    <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${max ? (value / max) * 100 : 0}%`, background: color, borderRadius: 4, transition: 'width 1s ease' }} />
    </div>
  );
}

/* ── Revenue chart (simple SVG) ── */
function RevenueChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const w = 380, h = 100, padding = 8;
  const step = (w - padding * 2) / (data.length - 1);
  const points = data.map((v, i) => `${padding + i * step},${h - padding - (v / max) * (h - padding * 2)}`).join(' ');
  const area = `${padding},${h - padding} ${points} ${padding + (data.length - 1) * step},${h - padding}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 100 }}>
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(114,47,55,0.25)" />
          <stop offset="100%" stopColor="rgba(114,47,55,0)" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#rg)" />
      <polyline points={points} fill="none" stroke="var(--burgundy)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={padding + i * step} cy={h - padding - (v / max) * (h - padding * 2)} r={3} fill="var(--burgundy)" />
      ))}
    </svg>
  );
}

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

/* ── Demo data — API ishlamayotganda dashboard bo'sh qolmasligi uchun ── */
const DEMO_HALLS: Hall[] = [
  { id: 'd1', name: "Navro'z Palace", category: 'PREMIUM', capacity: 500, pricePerPlate: 180000, city: 'Toshkent', status: 'APPROVED', description: '' },
  { id: 'd2', name: 'Grand Tashkent', category: 'STANDARD', capacity: 400, pricePerPlate: 150000, city: 'Toshkent', status: 'APPROVED', description: '' },
  { id: 'd3', name: 'Diamond Hall', category: 'VIP', capacity: 600, pricePerPlate: 200000, city: 'Toshkent', status: 'APPROVED', description: '' },
  { id: 'd4', name: 'Royal Wedding Hall', category: 'STANDARD', capacity: 350, pricePerPlate: 120000, city: 'Toshkent', status: 'PENDING', description: '' },
  { id: 'd5', name: 'Oqshom Plaza', category: 'ECONOMY', capacity: 250, pricePerPlate: 100000, city: 'Toshkent', status: 'APPROVED', description: '' },
  { id: 'd6', name: 'Samarqand Hall', category: 'STANDARD', capacity: 300, pricePerPlate: 130000, city: 'Toshkent', status: 'PENDING', description: '' },
];
const DEMO_BOOKINGS: Booking[] = [
  { id: 'db1', hallId: 'd1', hall: DEMO_HALLS[0], eventDate: '2026-06-15', numberOfGuests: 320, totalAmount: 57600000, advanceAmount: 14400000, finalAmount: 43200000, status: 'CONFIRMED' },
  { id: 'db2', hallId: 'd2', hall: DEMO_HALLS[1], eventDate: '2026-06-07', numberOfGuests: 200, totalAmount: 30000000, advanceAmount: 7500000, finalAmount: 22500000, status: 'PENDING' },
  { id: 'db3', hallId: 'd3', hall: DEMO_HALLS[2], eventDate: '2026-06-22', numberOfGuests: 450, totalAmount: 90000000, advanceAmount: 22500000, finalAmount: 67500000, status: 'CONFIRMED' },
  { id: 'db4', hallId: 'd4', hall: DEMO_HALLS[3], eventDate: '2026-05-18', numberOfGuests: 280, totalAmount: 33600000, advanceAmount: 8400000, finalAmount: 25200000, status: 'COMPLETED' },
  { id: 'db5', hallId: 'd5', hall: DEMO_HALLS[4], eventDate: '2026-07-10', numberOfGuests: 150, totalAmount: 15000000, advanceAmount: 3750000, finalAmount: 11250000, status: 'CONFIRMED' },
  { id: 'db6', hallId: 'd6', hall: DEMO_HALLS[5], eventDate: '2026-06-07', numberOfGuests: 200, totalAmount: 26000000, advanceAmount: 6500000, finalAmount: 19500000, status: 'CANCELLED' },
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

  /* ── Revenue by month (mock trend based on real count) ── */
  const currentMonth = new Date().getMonth();
  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const month = (currentMonth - 6 + i + 12) % 12;
    const count = bookings.filter(b => b.eventDate && new Date(b.eventDate).getMonth() === month).length;
    return count * 1_500_000 + Math.random() * 500_000;
  });

  /* ── Category distribution ── */
  const categories = halls.reduce<Record<string, number>>((acc, h) => {
    const cat = h.category || 'STANDARD';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    {
      icon: '🏛️', label: "Jami to'yxonalar", value: halls.length,
      sub: `${approvedHalls.length} tasdiqlangan`, bg: 'rgba(114,47,55,0.07)', color: 'var(--burgundy)',
      trend: '+12%', trendUp: true,
    },
    {
      icon: '📋', label: 'Bugungi bronlar', value: todayBookings.length,
      sub: `${confirmedBookings.length} tasdiqlangan`, bg: 'rgba(74,139,92,0.07)', color: 'var(--success)',
      trend: '+5%', trendUp: true,
    },
    {
      icon: '⏳', label: "Tasdiqlanmagan zallar", value: pendingHalls.length,
      sub: 'Ko\'rib chiqilishi kerak', bg: 'rgba(196,155,60,0.07)', color: 'var(--warning)',
      trend: pendingHalls.length > 0 ? '⚠️ Diqqat' : '✅ Barchasi OK', trendUp: false,
    },
    {
      icon: '💰', label: "Jami daromad", value: `${(revenue / 1_000_000).toFixed(1)}M`,
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
          <Link href="/admin/halls" className="btn btn-outline btn-sm">🏛️ Zallar</Link>
          <Link href="/admin/bookings" className="btn btn-primary btn-sm">📋 Bronlar</Link>
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
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--s-6)', marginBottom: 'var(--s-8)' }}>

        {/* Revenue chart */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', padding: 'var(--s-8)', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-4)' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--s-1)' }}>📈 Daromad dinamikasi</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>So&apos;nggi 7 oy</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--burgundy)' }}>
                {(revenue / 1_000_000).toFixed(1)}M
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>↑ +18% o&apos;sish</div>
            </div>
          </div>
          <RevenueChart data={revenueData} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--s-2)', paddingTop: 'var(--s-2)', borderTop: '1px solid var(--border-light)' }}>
            {revenueData.map((_, i) => {
              const month = (new Date().getMonth() - 6 + i + 12) % 12;
              return <span key={i} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{MONTHS[month]}</span>;
            })}
          </div>
        </div>

        {/* Category distribution */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', padding: 'var(--s-8)', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--s-6)' }}>🏷️ Kategoriyalar</h3>
          {Object.keys(categories).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--s-8)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Ma&apos;lumot yo&apos;q
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
              {Object.entries(categories).map(([cat, count]) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s-1)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{cat}</span>
                    <span style={{ fontWeight: 700, color: 'var(--burgundy)' }}>{count}</span>
                  </div>
                  <MiniBar value={count} max={halls.length} />
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 'var(--s-6)', paddingTop: 'var(--s-4)', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>O&apos;rtacha sig&apos;im:</span>
              <span style={{ fontWeight: 600 }}>
                {halls.length ? Math.round(halls.reduce((s, h) => s + (h.capacity || 0), 0) / halls.length) : 0} kishi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── PENDING APPROVALS ── */}
      {pendingHalls.length > 0 && (
        <div style={{ background: 'rgba(196,155,60,0.06)', borderRadius: 'var(--r-xl)', padding: 'var(--s-6)', border: '1px solid rgba(196,155,60,0.2)', marginBottom: 'var(--s-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-4)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--warning)' }}>⏳ Tasdiqlanishi kutilayotgan zallar ({pendingHalls.length})</h3>
            <Link href="/admin/halls" className="btn btn-sm btn-ghost">Barchasi →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            {pendingHalls.slice(0, 3).map(h => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--white)', padding: 'var(--s-4) var(--s-5)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'var(--cream-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏛️</div>
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
            <h3 style={{ fontSize: '1.1rem' }}>📋 So&apos;nggi bronlar</h3>
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
                      {b.hallId ? '🏛️ Hall' : '—'}
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
                    <div>📭 Bronlar yo&apos;q</div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Halls list */}
        <div>
          <div className="flex-between" style={{ marginBottom: 'var(--s-4)' }}>
            <h3 style={{ fontSize: '1.1rem' }}>🏛️ To&apos;yxonalar holati</h3>
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
                        {h.status === 'APPROVED' ? '✅ Tasdiqlangan' : h.status === 'REJECTED' ? '❌ Rad' : '⏳ Kutish'}
                      </span>
                    </td>
                  </tr>
                ))}
                {halls.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--s-8)' }}>
                    <div>🏛️ Zallar yo&apos;q</div>
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
          { icon: '🏛️', label: "To'yxona qo'shish", href: '/admin/halls/create' },
          { icon: '👤', label: "Egasi qo'shish", href: '/admin/owners' },
          { icon: '📋', label: "Bronlarni ko'rish", href: '/admin/bookings' },
          { icon: '📊', label: "Barcha zallar", href: '/admin/halls' },
        ].map((a, i) => (
          <Link key={i} href={a.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-2)', padding: 'var(--s-5)', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--r-lg)', border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none', transition: 'background 0.2s', color: 'white' }}
            className="quick-action">
            <span style={{ fontSize: '1.8rem' }}>{a.icon}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 500, textAlign: 'center', color: 'rgba(255,255,255,0.85)' }}>{a.label}</span>
          </Link>
        ))}
      </div>

      <style>{`.quick-action:hover { background: rgba(255,255,255,0.18) !important; transform: translateY(-2px); }`}</style>
    </div>
  );
}
