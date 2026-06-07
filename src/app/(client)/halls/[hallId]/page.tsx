'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Calendar from '@/components/shared/Calendar';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Hall, ServiceProvider } from '@/types';
import { formatPrice } from '@/lib/utils';
import { bookingStore } from '@/lib/bookingStore';

/* ── Static gallery images per hall (Unsplash) ── */
const HALL_IMAGES: Record<string, string[]> = {
  default: [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
    'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800&q=80',
    'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80',
  ],
};

/* ── Static mock amenities when API returns none ── */
const DEFAULT_AMENITIES = [
  { icon: '🅿️', name: 'Bepul avtoturargoh' },
  { icon: '❄️', name: 'Konditsioner' },
  { icon: '🎤', name: 'Professional sound' },
  { icon: '💡', name: 'Yorug\'lik tizimi' },
  { icon: '📷', name: 'Foto zona' },
  { icon: '🍽️', name: 'Oshxona' },
  { icon: '♿', name: 'Nogironlar uchun' },
  { icon: '🔒', name: 'Xavfsizlik' },
];

/* ── Mock reviews ── */
const MOCK_REVIEWS = [
  { initials: 'DK', name: 'Dilnoza Karimova', date: '2024-11-15', stars: 5, text: "Ajoyib to'yxona! Xizmat sifati va dizayn yuqori darajada. Barcha mehmonlar juda mamnun bo'ldi." },
  { initials: 'JA', name: 'Jasur Aliyev', date: '2024-10-28', stars: 5, text: "300 kishilik to'yimizni shu yerda o'tkazdik. Hamma narsa mukammal edi. Tavsiya qilaman!" },
  { initials: 'MN', name: 'Mohira Nazarova', date: '2024-09-12', stars: 4, text: "Juda qulay va keng zal. Ovqatlar ham mazali. Faqat parking bir oz tor edi." },
];

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
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'location'>('info');

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
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + Math.floor(Math.random() * 45) + 3);
        booked.push(d.toISOString().split('T')[0]);
      }
      setBookedDates(booked);
    } catch { showToast("To'yxona topilmadi", 'error'); }
    finally { setLoading(false); }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get('/api/services');
      setServices(Array.isArray(res.data.data) ? res.data.data : res.data.data?.services || []);
    } catch {}
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

  const toggleService = (id: string) =>
    setSelectedServices(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);

  const guestCount = parseInt(guests) || 0;
  const basePrice = guestCount * (hall?.pricePerPlate || 0);
  const servicesPrice = selectedServices.reduce((s, id) => {
    const svc = services.find(x => x.id === id);
    return s + (svc?.pricing || 0);
  }, 0);
  const totalPrice = basePrice + servicesPrice;
  const advancePerc = hall?.advancePercentage || 25;
  const advancePrice = totalPrice * (advancePerc / 100);

  const handleSelectDate = (date: string) => {
    if (!isAuthenticated) { showToast('Bron qilish uchun tizimga kiring', 'error'); return; }
    setSelectedDate(date);
    setShowBookingForm(true);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !guests) { showToast("Barcha maydonlarni to'ldiring", 'error'); return; }
    if (guestCount > (hall?.capacity || 0)) {
      showToast(`Sig'im ${hall?.capacity} kishidan oshmasligi kerak`, 'error'); return;
    }
    if (guestCount < 1) { showToast("Mehmonlar sonini kiriting", 'error'); return; }
    setBookingLoading(true);
    try {
      const eventDateISO = new Date(selectedDate + 'T18:00:00.000Z').toISOString();
      // Round to 2 decimal places — backend rejects float strings with excess precision
      const totalRounded = Math.round(totalPrice * 100) / 100;
      const advanceRounded = Math.round(advancePrice * 100) / 100;
      const finalRounded = Math.round((totalPrice - advancePrice) * 100) / 100;
      const bookingRes = await api.post('/api/bookings/create', {
        hallId,
        eventDate: eventDateISO,
        eventTime: '18:00',
        numberOfGuests: guestCount,
        notes: notes || undefined,
        totalAmount: totalRounded,
        advanceAmount: advanceRounded,
        finalAmount: finalRounded,
        serviceProviderIds: selectedServices.length > 0 ? selectedServices : undefined,
      });
      const bookingId = bookingRes.data?.data?.id || bookingRes.data?.data?.booking?.id;
      // Cache booking locally — /api/bookings returns 500 for ADMIN/CUSTOMER
      if (bookingId) {
        bookingStore.add({
          id: bookingId,
          hallId,
          hall: hall ?? undefined,
          userId: user?.id,
          eventDate: new Date(selectedDate + 'T18:00:00.000Z').toISOString(),
          eventTime: '18:00',
          numberOfGuests: guestCount,
          notes,
          totalAmount: totalRounded,
          advanceAmount: advanceRounded,
          finalAmount: finalRounded,
          status: 'PENDING',
          paymentStatus: 'PENDING',
        });
      }
      if (bookingId && advanceRounded > 0) {
        try {
          await api.post('/api/payments/create', {
            bookingId,
            amount: advanceRounded,
            paymentType: 'ADVANCE',
            paymentMethod: 'CASH',
          });
        } catch {
          showToast("Bron qabul qilindi, to'lovni keyinroq amalga oshiring");
          setShowBookingForm(false);
          setSelectedDate(null);
          setBookedDates(p => [...p, selectedDate]);
          setGuests(''); setNotes(''); setSelectedServices([]);
          return;
        }
      }
      showToast("Bron muvaffaqiyatli! To'lov qabul qilindi 🎉");
      setShowBookingForm(false);
      setSelectedDate(null);
      setBookedDates(p => [...p, selectedDate]);
      setGuests('');
      setNotes('');
      setSelectedServices([]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xatolik yuz berdi';
      showToast(msg, 'error');
    } finally { setBookingLoading(false); }
  };

  const images = hall?.imageUrl
    ? [hall.imageUrl, ...HALL_IMAGES.default.slice(1)]
    : HALL_IMAGES.default;

  const hallImages = [
    { src: images[0], alt: 'Main hall view', fallbackIcon: '🏛️', fallbackLabel: 'Luxury Hall Interior' },
    { src: images[1], alt: 'Banquet setup', fallbackIcon: '🍽️', fallbackLabel: 'Premium Banquet' },
    { src: images[2], alt: 'Decoration', fallbackIcon: '💐', fallbackLabel: 'Floral Decoration' },
    { src: images[3], alt: 'Stage', fallbackIcon: '✨', fallbackLabel: 'Wedding Stage' },
  ];

  if (loading) return (
    <>
      <Header />
      <div className="loading-page" style={{ paddingTop: 'var(--header-h)' }}>
        <div className="spinner" />
      </div>
    </>
  );

  if (!hall) return (
    <>
      <Header />
      <div className="empty-state" style={{ paddingTop: 'var(--header-h)' }}>
        <div className="empty-state-icon">🏛️</div>
        <h3>To&apos;yxona topilmadi</h3>
        <p style={{ marginBottom: 'var(--s-6)' }}>Bu to&apos;yxona mavjud emas yoki o&apos;chirilgan</p>
        <Link href="/halls" className="btn btn-primary">Barchasi →</Link>
      </div>
    </>
  );

  return (
    <>
      <Header />
      <div style={{ paddingTop: 'var(--header-h)' }}>

        {/* ═══ HERO GALLERY ═══ */}
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: 'var(--s-4) var(--s-8) 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--s-3)', height: 480, borderRadius: 'var(--r-2xl)', overflow: 'hidden' }}>
            {/* Main image */}
            <div style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setActiveImg(0)}>
              <img
                src={hallImages[0].src}
                alt={hallImages[0].alt}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div style={{ position: 'absolute', bottom: 'var(--s-4)', left: 'var(--s-4)', display: 'flex', gap: 'var(--s-2)' }}>
                <span style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', padding: '0.3rem 0.9rem', borderRadius: 'var(--r-full)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--burgundy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {hall.category || 'Premium'}
                </span>
                {hall.ratings && Number(hall.ratings) > 0 && (
                  <span style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', padding: '0.3rem 0.9rem', borderRadius: 'var(--r-full)', fontSize: '0.75rem', fontWeight: 700, color: '#C49B3C' }}>
                    ★ {Number(hall.ratings).toFixed(1)}
                  </span>
                )}
              </div>
              <button
                onClick={e => { e.stopPropagation(); toggleFavorite(); }}
                style={{ position: 'absolute', top: 'var(--s-4)', right: 'var(--s-4)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'transform 0.2s' }}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Side images */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
              {hallImages.slice(1, 3).map((img, i) => (
                <div key={i} style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setActiveImg(i + 1)}>
                  <img
                    src={img.src}
                    alt={img.alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {i === 1 && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,18,18,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>📷 Barcha rasmlar</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ BREADCRUMB ═══ */}
        <div className="container" style={{ paddingTop: 'var(--s-4)', paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--text-muted)' }}>Bosh sahifa</Link>
            <span>›</span>
            <Link href="/halls" style={{ color: 'var(--text-muted)' }}>To&apos;yxonalar</Link>
            <span>›</span>
            <span style={{ color: 'var(--text)' }}>{hall.name}</span>
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="container" style={{ padding: 'var(--s-8) var(--s-8) var(--s-20)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 'var(--s-12)', alignItems: 'start' }}>

            {/* ── LEFT ── */}
            <div>
              {/* Title row */}
              <div style={{ marginBottom: 'var(--s-6)' }}>
                <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--gold)', fontSize: '1.05rem' }}>
                  ✦ {hall.category || 'Premium'}
                </span>
                <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginTop: 'var(--s-1)', marginBottom: 'var(--s-2)' }}>
                  {hall.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-6)', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    📍 {hall.city || hall.address || 'Toshkent'}
                  </span>
                  {hall.ratings && Number(hall.ratings) > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#C49B3C', fontWeight: 600, fontSize: '0.9rem' }}>
                      {'★'.repeat(Math.round(Number(hall.ratings)))} {Number(hall.ratings).toFixed(1)}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({MOCK_REVIEWS.length} sharh)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-3)', marginBottom: 'var(--s-8)', padding: 'var(--s-6)', background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-light)' }}>
                {[
                  { icon: '💰', val: formatPrice(hall.pricePerPlate), label: '1 kishi' },
                  { icon: '👥', val: `${hall.capacity}`, label: "Sig'im" },
                  { icon: '📅', val: `${advancePerc}%`, label: 'Avans' },
                  { icon: '⭐', val: hall.ratings ? Number(hall.ratings).toFixed(1) : '5.0', label: 'Reyting' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: 'var(--s-2) 0' }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: 'var(--s-1)' }}>{s.icon}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--burgundy)', fontWeight: 700 }}>{s.val}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border-light)', marginBottom: 'var(--s-8)' }}>
                {(['info', 'reviews', 'location'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: 'var(--s-3) var(--s-6)',
                      border: 'none',
                      background: 'none',
                      fontFamily: 'var(--font-body)',
                      fontWeight: activeTab === tab ? 700 : 500,
                      fontSize: '0.9rem',
                      color: activeTab === tab ? 'var(--burgundy)' : 'var(--text-muted)',
                      borderBottom: activeTab === tab ? '2px solid var(--burgundy)' : '2px solid transparent',
                      marginBottom: -2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tab === 'info' ? '📋 Ma\'lumot' : tab === 'reviews' ? '⭐ Sharhlar' : '📍 Manzil'}
                  </button>
                ))}
              </div>

              {/* Tab: INFO */}
              {activeTab === 'info' && (
                <div>
                  {hall.description && (
                    <div style={{ marginBottom: 'var(--s-8)' }}>
                      <h3 style={{ fontSize: '1.3rem', marginBottom: 'var(--s-4)' }}>To&apos;yxona haqida</h3>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, fontSize: '0.97rem' }}>{hall.description}</p>
                    </div>
                  )}

                  {/* Amenities */}
                  <div style={{ marginBottom: 'var(--s-8)' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: 'var(--s-5)' }}>Xizmatlar va imkoniyatlar</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--s-3)' }}>
                      {DEFAULT_AMENITIES.map((a, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', padding: 'var(--s-3) var(--s-4)', background: 'var(--white)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-light)' }}>
                          <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{a.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calendar */}
                  <div>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: 'var(--s-2)' }}>Bo&apos;sh kunlarni tanlang</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 'var(--s-5)' }}>
                      🔴 Band &nbsp;|&nbsp; ✅ Bo&apos;sh &nbsp;|&nbsp; Bugundan keyin bron qilish mumkin
                    </p>
                    <Calendar bookedDates={bookedDates} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
                  </div>
                </div>
              )}

              {/* Tab: REVIEWS */}
              {activeTab === 'reviews' && (
                <div>
                  {/* Overall rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-8)', padding: 'var(--s-6)', background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-light)', marginBottom: 'var(--s-6)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: 'var(--burgundy)', lineHeight: 1 }}>4.8</div>
                      <div style={{ color: '#C49B3C', fontSize: '1.2rem', margin: 'var(--s-1) 0' }}>★★★★★</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{MOCK_REVIEWS.length} sharh</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginBottom: 'var(--s-2)' }}>
                          <span style={{ fontSize: '0.8rem', width: 8 }}>{star}</span>
                          <div style={{ flex: 1, height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: '#C49B3C', borderRadius: 3, width: star === 5 ? '80%' : star === 4 ? '15%' : '5%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews list */}
                  {MOCK_REVIEWS.map((r, i) => (
                    <div key={i} style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', padding: 'var(--s-6)', border: '1px solid var(--border-light)', marginBottom: 'var(--s-4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold-light), var(--rose-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--burgundy)' }}>
                            {r.initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{r.name}</div>
                            <div style={{ color: '#C49B3C', fontSize: '0.82rem' }}>{'★'.repeat(r.stars)}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.date}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: LOCATION */}
              {activeTab === 'location' && (
                <div>
                  <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-light)', overflow: 'hidden', marginBottom: 'var(--s-6)' }}>
                    {/* Map placeholder */}
                    <div style={{ height: 320, background: 'linear-gradient(145deg, #e8f4f8, #d4e8f0)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <div style={{ fontSize: '4rem', marginBottom: 'var(--s-4)' }}>🗺️</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--burgundy)', marginBottom: 'var(--s-2)' }}>{hall.city || 'Toshkent'}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{hall.address || "Aniq manzil uchun bog'laning"}</div>
                      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(114,47,55,0.05) 0%, transparent 50%)', pointerEvents: 'none' }} />
                    </div>
                    <div style={{ padding: 'var(--s-6)' }}>
                      <h4 style={{ marginBottom: 'var(--s-3)', fontSize: '1.1rem' }}>📍 Manzil</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 'var(--s-4)' }}>
                        {hall.address || hall.city || 'Toshkent shahri'}
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--s-3)' }}>
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent((hall.address || hall.city || 'Toshkent') + ' ' + hall.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          Google Maps →
                        </a>
                        <a
                          href={`https://yandex.com/maps/?text=${encodeURIComponent((hall.address || hall.city || 'Toshkent') + ' ' + hall.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                        >
                          Yandex Maps →
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Transport info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-4)' }}>
                    {[
                      { icon: '🚗', title: 'Avto', desc: 'Bepul avtoturargoh mavjud' },
                      { icon: '🚇', title: 'Metro', desc: "Eng yaqin metro 5 daqiqa" },
                    ].map((t, i) => (
                      <div key={i} style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 'var(--s-5)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
                        <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT — Booking Panel ── */}
            <div style={{ position: 'sticky', top: 'calc(var(--header-h) + var(--s-6))' }}>
              {showBookingForm && selectedDate ? (
                <div style={{ background: 'var(--white)', borderRadius: 'var(--r-2xl)', padding: 'var(--s-8)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-elevated)', animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-6)' }}>
                    <h3 style={{ fontSize: '1.4rem' }}>Bron qilish</h3>
                    <button onClick={() => { setShowBookingForm(false); setSelectedDate(null); }} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--cream-deep)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                  <form onSubmit={handleBooking}>
                    <div className="form-group">
                      <label className="form-label">📅 Sana</label>
                      <input className="form-input" value={selectedDate} readOnly style={{ background: 'var(--cream)', fontWeight: 600 }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">👥 Mehmonlar soni *</label>
                      <input type="number" className="form-input" placeholder={`1 – ${hall.capacity} kishi`} value={guests} onChange={e => setGuests(e.target.value)} min={1} max={hall.capacity} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Ism</label>
                        <input className="form-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ismingiz" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Familiya</label>
                        <input className="form-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Familiyangiz" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">📱 Telefon</label>
                      <input className="form-input" placeholder="+998 90 123 45 67" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>

                    {services.length > 0 && (
                      <div className="form-group">
                        <label className="form-label">🎀 Qo&apos;shimcha xizmatlar</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {services.slice(0, 5).map(svc => (
                            <label key={svc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.87rem', padding: '0.45rem 0.7rem', background: selectedServices.includes(svc.id) ? 'rgba(114,47,55,0.05)' : 'transparent', borderRadius: 'var(--r-md)', transition: 'background 0.2s', border: selectedServices.includes(svc.id) ? '1px solid rgba(114,47,55,0.15)' : '1px solid transparent' }}>
                              <input type="checkbox" checked={selectedServices.includes(svc.id)} onChange={() => toggleService(svc.id)} style={{ accentColor: 'var(--burgundy)', width: 16, height: 16 }} />
                              <span style={{ flex: 1 }}>{svc.name}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatPrice(svc.pricing)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">💬 Izoh</label>
                      <textarea className="form-textarea" placeholder="Qo'shimcha talablar..." value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight: 60 }} />
                    </div>

                    {/* Price summary */}
                    {guestCount > 0 && (
                      <div style={{ background: 'linear-gradient(135deg, var(--cream) 0%, var(--cream-deep) 100%)', borderRadius: 'var(--r-lg)', padding: 'var(--s-5)', marginBottom: 'var(--s-5)', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                          <span>{guestCount} × {formatPrice(hall.pricePerPlate)}</span>
                          <span>{formatPrice(basePrice)}</span>
                        </div>
                        {servicesPrice > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                            <span>Xizmatlar</span><span>{formatPrice(servicesPrice)}</span>
                          </div>
                        )}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                            <span>Jami</span>
                            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--burgundy)', fontSize: '1.2rem' }}>{formatPrice(totalPrice)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            <span>Avans ({advancePerc}%)</span>
                            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{formatPrice(advancePrice)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', borderRadius: 'var(--r-lg)' }} disabled={bookingLoading || !guestCount}>
                      {bookingLoading ? '⏳ Yuklanmoqda...' : guestCount ? `🎉 Bron qilish · ${formatPrice(advancePrice)}` : 'Mehmonlar sonini kiriting'}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 'var(--s-3)' }}>
                      🔒 Xavfsiz to&apos;lov · Bekor qilish mumkin
                    </p>
                  </form>
                </div>
              ) : (
                <div>
                  {/* Price card */}
                  <div style={{ background: 'var(--white)', borderRadius: 'var(--r-2xl)', padding: 'var(--s-8)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-soft)', marginBottom: 'var(--s-4)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 'var(--s-6)' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--burgundy)' }}>
                        {formatPrice(hall.pricePerPlate)}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>1 kishi uchun</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', marginBottom: 'var(--s-6)' }}>
                      {[
                        { icon: '👥', text: `Sig'im: ${hall.capacity} kishi` },
                        { icon: '📅', text: `Avans: ${advancePerc}% to'lov` },
                        { icon: '✅', text: "Bekor qilish mumkin" },
                        { icon: '🔒', text: "Xavfsiz bron tizimi" },
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          <span>{item.icon}</span>
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ textAlign: 'center', padding: 'var(--s-6)', background: 'var(--cream)', borderRadius: 'var(--r-lg)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: 'var(--s-2)', opacity: 0.4 }}>📅</div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                        Kalendardan bo&apos;sh kunni tanlang va bron qilishni boshlang
                      </p>
                    </div>
                  </div>

                  {/* Contact card */}
                  <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', padding: 'var(--s-6)', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: 'var(--s-4)' }}>📞 Bog&apos;lanish</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
                      <a href="tel:+998901234567" className="btn btn-outline" style={{ borderRadius: 'var(--r-md)' }}>
                        📱 Qo&apos;ng&apos;iroq qilish
                      </a>
                      <button onClick={toggleFavorite} className={`btn ${isFavorite ? 'btn-danger' : 'btn-ghost'}`} style={{ borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                        {isFavorite ? '❤️ Sevimlilardan olib tashlash' : '🤍 Sevimlilarga qo\'shish'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ SIMILAR HALLS ═══ */}
        <div style={{ background: 'var(--cream-deep)', padding: 'var(--s-16) 0' }}>
          <div className="container">
            <h3 style={{ fontSize: '1.6rem', marginBottom: 'var(--s-2)' }}>O&apos;xshash to&apos;yxonalar</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--s-8)' }}>Shunga o&apos;xshash boshqa variantlar</p>
            <div style={{ display: 'flex', gap: 'var(--s-4)', overflowX: 'auto', paddingBottom: 'var(--s-3)' }}>
              {[
                { name: "Navro'z Palace", price: "180 000", cap: 500, img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=70', rating: 4.9 },
                { name: 'Grand Tashkent', price: "150 000", cap: 400, img: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=400&q=70', rating: 4.8 },
                { name: 'Royal Hall', price: "120 000", cap: 350, img: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400&q=70', rating: 4.7 },
              ].map((h, i) => (
                <Link href="/halls" key={i} style={{ flexShrink: 0, width: 280, background: 'var(--white)', borderRadius: 'var(--r-xl)', overflow: 'hidden', border: '1px solid var(--border-light)', textDecoration: 'none', transition: 'transform 0.3s', display: 'block' }}
                  className="card">
                  <div style={{ height: 160, overflow: 'hidden' }}>
                    <img src={h.img} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div style={{ padding: 'var(--s-4)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: 'var(--s-1)' }}>{h.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>👥 {h.cap} kishi</span>
                      <span style={{ color: '#C49B3C' }}>★ {h.rating}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--burgundy)', marginTop: 'var(--s-2)' }}>{h.price} so&apos;m</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
