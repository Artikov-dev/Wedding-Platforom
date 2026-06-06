'use client';

import React, { useState, useEffect, use } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Calendar from '@/components/shared/Calendar';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Hall, ServiceProvider } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function HallDetailPage({ params }: { params: Promise<{ hallId: string }> }) {
  const { hallId } = use(params);
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [hall, setHall] = useState<Hall | null>(null);
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [guests, setGuests] = useState('');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => { fetchHall(); fetchServices(); }, [hallId]);

  const fetchHall = async () => {
    try {
      const res = await api.get(`/api/halls/${hallId}`);
      setHall(res.data.data);
      const today = new Date();
      const booked: string[] = [];
      for (let i = 0; i < 5; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + Math.floor(Math.random() * 30) + 3);
        booked.push(d.toISOString().split('T')[0]);
      }
      setBookedDates(booked);
    } catch { showToast("To'yxona topilmadi", 'error'); }
    finally { setLoading(false); }
  };

  const fetchServices = async () => {
    try { const res = await api.get('/api/services'); setServices(Array.isArray(res.data.data) ? res.data.data : []); } catch {}
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) { showToast('Avval tizimga kiring', 'error'); return; }
    try {
      if (isFavorite) await api.delete(`/api/favorites/${hallId}`);
      else await api.post('/api/favorites', { hallId });
      setIsFavorite(!isFavorite);
      showToast(isFavorite ? "Sevimlilardan o'chirildi" : "Sevimlilarga qo'shildi");
    } catch { showToast('Xatolik yuz berdi', 'error'); }
  };

  const toggleService = (id: string) => setSelectedServices(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);

  const guestCount = parseInt(guests) || 0;
  const basePrice = guestCount * (hall?.pricePerPlate || 0);
  const servicesPrice = selectedServices.reduce((s, id) => { const svc = services.find(x => x.id === id); return s + (svc?.pricing || 0); }, 0);
  const totalPrice = basePrice + servicesPrice;
  const advancePrice = totalPrice * 0.2;

  const handleSelectDate = (date: string) => {
    if (!isAuthenticated) { showToast('Bron qilish uchun tizimga kiring', 'error'); return; }
    setSelectedDate(date);
    setShowBookingForm(true);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !guests) { showToast("Barcha maydonlarni to'ldiring", 'error'); return; }
    if (guestCount > (hall?.capacity || 0)) { showToast(`Sig'im ${hall?.capacity} kishidan oshmasligi kerak`, 'error'); return; }
    setBookingLoading(true);
    try {
      const bookingRes = await api.post('/api/bookings/create', {
        hallId, eventDate: selectedDate, eventTime: '18:00', numberOfGuests: guestCount, notes,
        totalAmount: totalPrice, advanceAmount: advancePrice, finalAmount: totalPrice - advancePrice, serviceProviderIds: selectedServices,
      });
      if (bookingRes.data?.data?.id) {
        await api.post('/api/payments/create', { bookingId: bookingRes.data.data.id, amount: advancePrice, paymentMethodId: 'default', paymentMethod: 'card' });
      }
      showToast("Muvaffaqiyatli to'landi! Bron tasdiqlandi.");
      setShowBookingForm(false); setSelectedDate(null); setBookedDates(p => [...p, selectedDate]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xatolik';
      showToast(msg, 'error');
    } finally { setBookingLoading(false); }
  };

  if (loading) return <><Header /><div className="loading-page" style={{ paddingTop: 'var(--header-h)' }}><div className="spinner" /></div></>;
  if (!hall) return <><Header /><div className="empty-state" style={{ paddingTop: 'var(--header-h)' }}><h3>To&apos;yxona topilmadi</h3></div></>;

  return (
    <>
      <Header />
      <div style={{ paddingTop: 'var(--header-h)' }}>
        {/* Gallery Hero */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--s-3)',
          maxWidth: 'var(--max-w)', margin: '0 auto', padding: 'var(--s-3) var(--s-8) 0', height: 440,
        }}>
          <div style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            {hall.imageUrl ? (
              <img src={hall.imageUrl} alt={hall.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div className="img-placeholder" style={{ height: '100%' }}>
                <span className="img-placeholder-icon">🏛️</span>
                <span>Luxury Wedding Hall Interior</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            <div style={{ flex: 1, borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
              <div className="img-placeholder" style={{ height: '100%' }}>
                <span className="img-placeholder-icon">🍽️</span>
                <span>Premium Banquet Setup</span>
              </div>
            </div>
            <div style={{ flex: 1, borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
              <div className="img-placeholder" style={{ height: '100%' }}>
                <span className="img-placeholder-icon">🌿</span>
                <span>Outdoor Garden Area</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: 'var(--s-10) var(--s-8) var(--s-16)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 'var(--s-12)', alignItems: 'start' }}>
            {/* Left */}
            <div>
              <div style={{ marginBottom: 'var(--s-8)' }}>
                <div className="flex-between">
                  <div>
                    <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--gold)', fontSize: '1.1rem' }}>
                      ✦ {hall.category || 'Premium'}
                    </span>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', marginTop: 'var(--s-1)' }}>{hall.name}</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--s-2)', fontSize: '0.95rem' }}>
                      📍 {hall.city || hall.address || 'Toshkent'}
                    </p>
                  </div>
                  <button className="btn btn-outline" onClick={toggleFavorite} style={{ borderRadius: 'var(--r-full)' }}>
                    {isFavorite ? '❤️' : '🤍'} Sevimli
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-4)',
                marginBottom: 'var(--s-10)', padding: 'var(--s-8)', background: 'var(--white)',
                borderRadius: 'var(--r-xl)', border: '1px solid var(--border-light)',
              }}>
                {[
                  { icon: '💰', val: formatPrice(hall.pricePerPlate), label: '1 kishi uchun' },
                  { icon: '👥', val: `${hall.capacity} kishi`, label: "Sig'im" },
                  { icon: '⭐', val: hall.rating?.toFixed(1) || '—', label: 'Reyting' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', marginBottom: 'var(--s-2)' }}>{s.icon}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--burgundy)' }}>{s.val}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {hall.description && (
                <div style={{ marginBottom: 'var(--s-10)' }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: 'var(--s-4)' }}>Tavsif</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, fontSize: '0.98rem' }}>{hall.description}</p>
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: 'var(--s-4)' }}>Kunni tanlang</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--s-6)' }}>
                  Kalendardan bo&apos;sh kunni tanlang va bron qilishni boshlang
                </p>
                <Calendar bookedDates={bookedDates} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
              </div>
            </div>

            {/* Right — Booking Panel */}
            <div style={{ position: 'sticky', top: 'calc(var(--header-h) + var(--s-6))' }}>
              {showBookingForm && selectedDate ? (
                <div style={{
                  background: 'var(--white)', borderRadius: 'var(--r-2xl)', padding: 'var(--s-8)',
                  border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-elevated)',
                  animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--s-6)' }}>Bron qilish</h3>
                  <form onSubmit={handleBooking}>
                    <div className="form-group">
                      <label className="form-label">Sana</label>
                      <input className="form-input" value={selectedDate} readOnly style={{ background: 'var(--cream)', fontWeight: 600 }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mehmonlar soni *</label>
                      <input type="number" className="form-input" placeholder={`Max: ${hall.capacity}`} value={guests} onChange={e => setGuests(e.target.value)} min={1} max={hall.capacity} />
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">Ism</label><input className="form-input" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
                      <div className="form-group"><label className="form-label">Familiya</label><input className="form-input" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Telefon</label>
                      <input className="form-input" placeholder="+998 90 123 45 67" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>

                    {services.length > 0 && (
                      <div className="form-group">
                        <label className="form-label">Qo&apos;shimcha xizmatlar</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {services.map(svc => (
                            <label key={svc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', padding: '0.5rem 0.75rem', background: selectedServices.includes(svc.id) ? 'rgba(114,47,55,0.04)' : 'transparent', borderRadius: 'var(--r-md)', transition: 'background 0.2s' }}>
                              <input type="checkbox" checked={selectedServices.includes(svc.id)} onChange={() => toggleService(svc.id)} style={{ accentColor: 'var(--burgundy)' }} />
                              <span style={{ flex: 1 }}>{svc.name}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatPrice(svc.pricing)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Izoh</label>
                      <textarea className="form-textarea" placeholder="Qo'shimcha izoh..." value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight: 70 }} />
                    </div>

                    {/* Price Summary */}
                    <div style={{ background: 'var(--cream)', borderRadius: 'var(--r-lg)', padding: 'var(--s-6)', marginBottom: 'var(--s-6)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        <span>{guestCount} × {formatPrice(hall.pricePerPlate)}</span>
                        <span>{formatPrice(basePrice)}</span>
                      </div>
                      {servicesPrice > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          <span>Xizmatlar</span><span>{formatPrice(servicesPrice)}</span>
                        </div>
                      )}
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem' }}>
                          <span>Umumiy</span>
                          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--burgundy)', fontSize: '1.25rem' }}>{formatPrice(totalPrice)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          <span>Avans (20%)</span><span>{formatPrice(advancePrice)}</span>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', borderRadius: 'var(--r-lg)' }} disabled={bookingLoading}>
                      {bookingLoading ? 'Yuklanmoqda...' : `Bron qilish · ${formatPrice(advancePrice)}`}
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{
                  background: 'var(--white)', borderRadius: 'var(--r-2xl)', padding: 'var(--s-12)',
                  border: '1px solid var(--border-light)', textAlign: 'center', boxShadow: 'var(--shadow-soft)',
                }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: 'var(--s-4)', opacity: 0.3 }}>📅</div>
                  <h4 style={{ fontSize: '1.3rem', marginBottom: 'var(--s-3)' }}>Kunni tanlang</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                    Kalendardan bo&apos;sh kunni tanlang va bron qilishni boshlang
                  </p>
                  <div style={{ marginTop: 'var(--s-8)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--burgundy)' }}>
                      {formatPrice(hall.pricePerPlate)}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>1 kishi uchun</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
