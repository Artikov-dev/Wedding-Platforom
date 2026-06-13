'use client';

import React, { useState, useEffect } from 'react';
import { bookingsService } from '@/services/api.service';
import { Booking } from '@/types';
import { formatPrice } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUpOutlined, CreditCardOutlined, CalendarMonthOutlined, CheckCircleOutlineOutlined } from '@mui/icons-material';

export default function OwnerAnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await bookingsService.list({ limit: 1000 });
        setBookings(res.data.data?.bookings || []);
      } catch (error) {
        console.error('Failed to load bookings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Calculate Metrics
  const totalRevenue = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
    
  const totalAdvance = bookings
    .filter(b => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + Number(b.advanceAmount || 0), 0);

  // Status Distribution
  const statusCounts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(statusCounts).map(status => ({
    name: status === 'CONFIRMED' ? 'Tasdiqlangan' : status === 'PENDING' ? 'Kutilmoqda' : status === 'CANCELLED' ? 'Bekor qilingan' : 'Yakunlangan',
    value: statusCounts[status]
  }));

  // Revenue by Month
  const monthlyRevenueMap = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((acc, b) => {
      const month = new Date(b.eventDate).toLocaleString('uz-UZ', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + Number(b.totalAmount || 0);
      return acc;
    }, {} as Record<string, number>);

  const barData = Object.keys(monthlyRevenueMap).map(month => ({
    name: month,
    summa: monthlyRevenueMap[month]
  })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

  // Revenue by Hall
  const hallRevenueMap = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((acc, b) => {
      const hallName = b.hall?.name || 'Noma`lum';
      acc[hallName] = (acc[hallName] || 0) + Number(b.totalAmount || 0);
      return acc;
    }, {} as Record<string, number>);

  const hallBarData = Object.keys(hallRevenueMap).map(hall => ({
    name: hall,
    summa: hallRevenueMap[hall]
  })).sort((a, b) => b.summa - a.summa);

  const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000000) {
      return (tickItem / 1000000).toFixed(1) + 'M';
    }
    return tickItem.toString();
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="page-title" style={{ marginBottom: 'var(--s-1)' }}>Moliya va Analitika</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Biznesingizning moliyaviy holati va statistikasi</p>
      </div>

      {loading ? (
        <div style={{ padding: 'var(--s-20) 0', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <p>Hozircha ma'lumotlar yo'q</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-4" style={{ marginBottom: 'var(--s-8)' }}>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--burgundy), #902840)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
              <div style={{ opacity: 0.8, marginBottom: '8px', fontSize: '0.9rem' }}>Jami Daromad</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{formatPrice(totalRevenue)}</div>
              <TrendingUpOutlined style={{ position: 'absolute', right: '16px', bottom: '16px', opacity: 0.2, width: '48px', height: '48px' }} />
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(196,155,60,0.1)', color: 'var(--gold)' }}><CreditCardOutlined sx={{ fontSize: 24 }} /></div>
              <div>
                <div className="stat-value" style={{ fontSize: '1.2rem' }}>{formatPrice(totalAdvance)}</div>
                <div className="stat-label">Olingan Avanslar</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(74,139,92,0.1)', color: 'var(--success)' }}><CheckCircleOutlineOutlined sx={{ fontSize: 24 }} /></div>
              <div>
                <div className="stat-value">{bookings.filter(b => b.status === 'CONFIRMED').length}</div>
                <div className="stat-label">Tasdiqlangan bronlar</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(114,47,55,0.1)', color: 'var(--burgundy)' }}><CalendarMonthOutlined sx={{ fontSize: 24 }} /></div>
              <div>
                <div className="stat-value">{bookings.length}</div>
                <div className="stat-label">Jami bronlar</div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--s-6)', marginBottom: 'var(--s-6)' }}>
            
            {/* Monthly Revenue Chart */}
            <div style={{ background: 'var(--white)', padding: 'var(--s-6)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-light)' }}>
              <h3 style={{ marginBottom: 'var(--s-6)', color: 'var(--burgundy)' }}>Oylik Daromad</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                    <YAxis tickFormatter={formatYAxis} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                    <Tooltip 
                      formatter={(value: number) => formatPrice(value)}
                      cursor={{ fill: 'rgba(114,47,55,0.05)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 600 }}
                    />
                    <Bar dataKey="summa" fill="var(--burgundy)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Pie Chart */}
            <div style={{ background: 'var(--white)', padding: 'var(--s-6)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-light)' }}>
              <h3 style={{ marginBottom: 'var(--s-6)', color: 'var(--burgundy)' }}>Bronlar Holati</h3>
              <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.name === 'Tasdiqlangan' ? 'var(--success)' : 
                          entry.name === 'Kutilmoqda' ? 'var(--warning)' : 
                          entry.name === 'Bekor qilingan' ? 'var(--danger)' : 'var(--gold)'
                        } />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 600 }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Hall Revenue Row */}
          <div style={{ background: 'var(--white)', padding: 'var(--s-6)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-light)' }}>
            <h3 style={{ marginBottom: 'var(--s-6)', color: 'var(--burgundy)' }}>To'yxonalar bo'yicha Daromad</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hallBarData} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                  <XAxis type="number" tickFormatter={formatYAxis} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 500, fill: 'var(--text)' }} width={120} />
                  <Tooltip 
                    formatter={(value: number) => formatPrice(value)}
                    cursor={{ fill: 'rgba(196,155,60,0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 600 }}
                  />
                  <Bar dataKey="summa" fill="var(--gold)" radius={[0, 6, 6, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
