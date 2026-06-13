'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Calendar from '@/components/shared/Calendar';
import { hallsService, bookingsService, favoritesService, servicesService, paymentsService } from '@/services/api.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Hall, ServiceProvider } from '@/types';
import { formatPrice } from '@/lib/utils';
import { bookingStore } from '@/lib/bookingStore';
import PaymentModal from '@/components/payment/PaymentModal';
import { Building2, Heart, Camera, MapPin, Users, Coins, Star, CalendarDays, ClipboardList, AlertCircle, CheckCircle2, ParkingCircle, Wind, Mic2, Lightbulb, Utensils, Accessibility, ShieldCheck, XCircle, Car, Train, Phone, Sparkles, MessageSquare, PartyPopper, Lock, Smartphone } from 'lucide-react';
import dynamic from 'next/dynamic';

const Pannellum = dynamic(() => import('pannellum-react').then(mod => mod.Pannellum), { ssr: false });
const PannellumViewer = Pannellum as any;

/* ── Fallback gallery images (Unsplash) when a hall has none ── */
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80',
  'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=1200&q=80',
  'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1200&q=80',
  'https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=1200&q=80',
];

/* ── Static mock amenities when API returns none ── */
const DEFAULT_AMENITIES = [
  { icon: <ParkingCircle size={20} className="text-muted" />, name: 'Bepul avtoturargoh' },
  { icon: <Wind size={20} className="text-muted" />, name: 'Konditsioner' },
  { icon: <Mic2 size={20} className="text-muted" />, name: 'Professional sound' },
  { icon: <Lightbulb size={20} className="text-muted" />, name: 'Yorug\'lik tizimi' },
  { icon: <Camera size={20} className="text-muted" />, name: 'Foto zona' },
  { icon: <Utensils size={20} className="text-muted" />, name: 'Oshxona' },
  { icon: <Accessibility size={20} className="text-muted" />, name: 'Nogironlar uchun' },
  { icon: <ShieldCheck size={20} className="text-muted" />, name: 'Xavfsizlik' },
];

/* ── Mock reviews ── */
const MOCK_REVIEWS = [
  { initials: 'DK', name: 'Dilnoza Karimova', date: '2026-04-15', stars: 5, text: "Ajoyib to'yxona! Xizmat sifati va dizayn yuqori darajada. Barcha mehmonlar juda mamnun bo'ldi." },
  { initials: 'JA', name: 'Jasur Aliyev', date: '2026-03-28', stars: 5, text: "300 kishilik to'yimizni shu yerda o'tkazdik. Hamma narsa mukammal edi. Tavsiya qilaman!" },
  { initials: 'MN', name: 'Mohira Nazarova', date: '2026-02-12', stars: 4, text: "Juda qulay va keng zal. Ovqatlar ham mazali. Faqat parking bir oz tor edi." },
  { initials: 'SH', name: 'Sherzod Hasanov', date: '2026-01-20', stars: 5, text: "To'y marosimimiz juda chiroyli o'tdi. Xodimlar juda mehribon va professional. 10/10 tavsiya!" },
  { initials: 'NR', name: 'Nodira Rahimova', date: '2025-12-05', stars: 5, text: "Bezaklar va yoritish tizimi zo'r edi. Mehmonlarimiz hayron qoldi. Narxi ham adolatli." },
  { initials: 'BT', name: "Bobur To'ychiyev", date: '2025-11-18', stars: 4, text: "Zalning kengligiga hayron qoldim. 400 kishi sig'adi ammo tor bo'lmaydi. Ovqatlar juda mazali edi." },
  { initials: 'FU', name: 'Feruza Umarova', date: '2025-10-30', stars: 5, text: "Online bron qilish juda oson edi. Xizmat darajasi yuqori. Yana bir bor kelishimizga shubha yo'q!" },
];

export default function HallDetailPage({ params }: { params: Promise<{ hallId: string }> }) {
  const { hallId } = use(params);
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [hall, setHall] = useState<Hall | null>(null);
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [bookedDetails, setBookedDetails] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();
  const [similarHalls, setSimilarHalls] = useState<Hall[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'location'>('info');

  const [guests, setGuests] = useState('');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [show360, setShow360] = useState(false);
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => { fetchHall(); fetchServices(); fetchSimilar(); }, [hallId]);
  useEffect(() => { if (isAuthenticated) checkFavorite(); }, [isAuthenticated, hallId]);

  const checkFavorite = async () => {
    try {
      const res = await favoritesService.list();
      const d = res.data.data;
      const list = Array.isArray(d) ? d : ((d as any)?.favorites || []);
      const favIds = new Set(list.map((f: { hallId?: string; id: string }) => f.hallId || f.id));
      setIsFavorite(favIds.has(hallId));
    } catch {}
  };

  const fetchSimilar = async () => {
    try {
      const res = await hallsService.search({ limit: 12 });
      const list = res.data.data?.halls || [];
      // Exclude current hall, shuffle, take 3
      const others = list.filter(h => h.id !== hallId);
      for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
      }
      setSimilarHalls(others.slice(0, 3));
    } catch {}
  };

  const fetchHall = async () => {
    try {
      const res = await hallsService.getById(hallId);
      setHall(res.data.data);
      try {
        const datesRes = await hallsService.getBookedDates(hallId);
        setBookedDates(datesRes.data.data?.bookedDates || []);
        setBookedDetails(datesRes.data.data?.bookedDetails || {});
      } catch {
        // Fallback: random dates if endpoint not available
        const today = new Date();
        const booked: string[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() + Math.floor(Math.random() * 45) + 3);
          booked.push(d.toISOString().split('T')[0]);
        }
        setBookedDates(booked);
      }
    } catch { showToast("To'yxona topilmadi", 'error'); }
    finally { setLoading(false); }
  };

  const fetchServices = async () => {
    try {
      const res = await servicesService.list();
      setServices(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {}
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) { showToast('Avval tizimga kiring', 'error'); return; }
    try {
      if (isFavorite) await favoritesService.remove(hallId);
      else await favoritesService.add(hallId);
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
    
    // Instead of booking right away, show the payment modal
    setShowPayment(true);
  };

  const processActualBooking = async () => {
    setBookingLoading(true);
    try {
      const eventDateISO = new Date(selectedDate! + 'T18:00:00.000Z').toISOString();
      const totalRounded = Math.round(totalPrice * 100) / 100;
      const advanceRounded = Math.round(advancePrice * 100) / 100;
      const finalRounded = Math.round((totalPrice - advancePrice) * 100) / 100;
      const bookingRes = await bookingsService.create({
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
      const bookingId = bookingRes.data?.data?.id || (bookingRes.data?.data as any)?.booking?.id;
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
          await paymentsService.create({
            bookingId,
            amount: advanceRounded,
            paymentType: 'ADVANCE',
            paymentMethod: 'CASH',
          });
        } catch {
          showToast("Bron qabul qilindi, to'lovni keyinroq amalga oshiring");
          setShowBookingForm(false);
          setSelectedDate(null);
          setBookedDates(p => selectedDate ? [...p, selectedDate] : p);
          setGuests(''); setNotes(''); setSelectedServices([]);
          return;
        }
      }
      // Send Confirmation Email
      if (user?.email) {
        try {
          await fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: user.email,
              subject: `Wedding Platform - To'yxona bron qilindi: ${hall?.name}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: #722F37;">Tabriklaymiz, ${user.firstName}! 🎉</h2>
                  <p style="font-size: 16px; color: #333;">Siz muvaffaqiyatli ravishda to'yxona bron qildingiz.</p>
                  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><b>To'yxona:</b> ${hall?.name}</p>
                    <p><b>Sana:</b> ${selectedDate}</p>
                    <p><b>Mehmonlar soni:</b> ${guestCount}</p>
                    <p><b>Jami narx:</b> ${formatPrice(totalPrice)} so'm</p>
                  </div>
                  <p style="font-size: 14px; color: #777;">Sizning broningiz To'yxona egasi tomonidan tasdiqlanishi kutilmoqda. Holatni profilingiz orqali kuzatib boring.</p>
                  <br/>
                  <p style="font-size: 14px; color: #777;">Hurmat bilan,<br/>Wedding Platform Jamoasi</p>
                </div>
              `
            })
          });
        } catch (err) {
          console.error('Email sending failed', err);
        }
      }
      setShowSuccessModal(true);
      setShowBookingForm(false);
      setShowPayment(false);
      // We do not clear selectedDate and guests here so they remain visible in the success modal.
      setSelectedServices([]);
      setNotes('');
      fetchHall(); // refresh dates
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Bron qilishda xatolik', 'error');
      setShowPayment(false);
    } finally {
      setBookingLoading(false);
    }
  };

  // Build the gallery from real DB images, falling back to imageUrl, then stock photos
  const galleryImages: string[] = (() => {
    const fromDb = (hall?.images || [])
      .slice()
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map(img => img.imageUrl)
      .filter(Boolean);
    if (fromDb.length > 0) return fromDb;
    if (hall?.imageUrl) return [hall.imageUrl, ...FALLBACK_IMAGES.slice(1)];
    return FALLBACK_IMAGES;
  })();

  // Ensure at least 4 slots for the hero grid
  const heroImages = galleryImages.length >= 4
    ? galleryImages
    : [...galleryImages, ...FALLBACK_IMAGES].slice(0, 4);

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
        <div className="empty-state-icon"><Building2 size={48} className="text-muted" /></div>
        <h3>To&apos;yxona topilmadi</h3>
        <p style={{ marginBottom: 'var(--s-6)' }}>Bu to&apos;yxona mavjud emas yoki o&apos;chirilgan</p>
        <Link href="/halls" className="btn btn-primary">Barchasi →</Link>
      </div>
    </>
  );

  return (
    <>
      <Header />

      {/* ═══ LIGHTBOX (barcha rasmlar) ═══ */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 'var(--s-6)' }}
        >
          <button
            onClick={() => setLightbox(false)}
            style={{ position: 'absolute', top: 'var(--s-6)', right: 'var(--s-6)', width: 48, height: 48, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '1.4rem', cursor: 'pointer' }}
          >✕</button>

          <img
            src={galleryImages[activeImg]}
            alt={`${hall.name} ${activeImg + 1}`}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '78vh', objectFit: 'contain', borderRadius: 'var(--r-lg)' }}
            onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES[activeImg % FALLBACK_IMAGES.length]; }}
          />

          {/* Prev / Next */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setActiveImg(p => (p - 1 + galleryImages.length) % galleryImages.length); }}
                style={{ position: 'absolute', left: 'var(--s-6)', top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '1.6rem', cursor: 'pointer' }}
              >‹</button>
              <button
                onClick={e => { e.stopPropagation(); setActiveImg(p => (p + 1) % galleryImages.length); }}
                style={{ position: 'absolute', right: 'var(--s-6)', top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '1.6rem', cursor: 'pointer' }}
              >›</button>
            </>
          )}

          {/* Thumbnails */}
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 'var(--s-2)', marginTop: 'var(--s-5)', maxWidth: '90vw', overflowX: 'auto', padding: 'var(--s-2)' }}>
            {galleryImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`thumb ${i + 1}`}
                onClick={() => setActiveImg(i)}
                style={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 'var(--r-sm)', cursor: 'pointer', flexShrink: 0, border: activeImg === i ? '2px solid white' : '2px solid transparent', opacity: activeImg === i ? 1 : 0.55 }}
                onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]; }}
              />
            ))}
          </div>
          <div onClick={e => e.stopPropagation()} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: 'var(--s-3)' }}>
            {activeImg + 1} / {galleryImages.length}
          </div>
        </div>
      )}

      <div style={{ paddingTop: 'var(--header-h)' }}>

        {/* ═══ HERO GALLERY ═══ */}
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: 'var(--s-4) var(--s-8) 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'var(--s-2)', height: 480, borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            {/* Main image */}
            <div style={{ position: 'relative', overflow: 'hidden', cursor: show360 ? 'default' : 'pointer' }} onClick={() => { if (!show360) { setActiveImg(0); setLightbox(true); }}}>
              {show360 ? (
                <div style={{ width: '100%', height: '100%', cursor: 'grab' }} onClick={e => e.stopPropagation()}>
                  <PannellumViewer
                    width="100%"
                    height="100%"
                    image="/360-demo.jpg"
                    pitch={10}
                    yaw={180}
                    hfov={110}
                    autoLoad
                    showZoomCtrl={false}
                  />
                </div>
              ) : (
                <img
                  src={heroImages[0]}
                  alt={hall.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
                  onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES[0]; }}
                />
              )}
              
              <div style={{ position: 'absolute', top: 'var(--s-4)', left: 'var(--s-4)', display: 'flex', gap: 'var(--s-2)' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShow360(!show360); }}
                  style={{ background: show360 ? 'var(--burgundy)' : 'rgba(255,255,255,0.92)', color: show360 ? '#fff' : 'var(--text)', border: 'none', padding: '0.4rem 1rem', borderRadius: 'var(--r-full)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 10 }}
                >
                  🥽 {show360 ? 'Oddiy rasmlar' : '360° Virtual Tur'}
                </button>
              </div>

              <div style={{ position: 'absolute', bottom: 'var(--s-4)', left: 'var(--s-4)', display: 'flex', gap: 'var(--s-2)', zIndex: 10, pointerEvents: 'none' }}>
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
                style={{ position: 'absolute', top: 'var(--s-4)', right: 'var(--s-4)', width: 44, height: 44, borderRadius: '50%', background: isFavorite ? 'rgba(186,35,67,0.9)' : 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'transform 0.2s', zIndex: 10 }}
              >
                <Heart size={20} fill={isFavorite ? '#fff' : 'none'} color={isFavorite ? '#fff' : 'var(--text)'} />
              </button>
            </div>

            {/* Side images Column 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
              {heroImages.slice(1, 3).map((src, i) => (
                <div key={i} style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => { setActiveImg(i + 1); setLightbox(true); }}>
                  <img
                    src={src}
                    alt={`${hall.name} ${i + 2}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES[(i + 1) % FALLBACK_IMAGES.length]; }}
                  />
                </div>
              ))}
            </div>

            {/* Side images Column 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
              {heroImages.slice(3, 5).map((src, i) => (
                <div key={i} style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => { setActiveImg(i + 3); setLightbox(true); }}>
                  <img
                    src={src}
                    alt={`${hall.name} ${i + 4}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES[(i + 3) % FALLBACK_IMAGES.length]; }}
                  />
                  {i === 1 && galleryImages.length > 5 && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,18,18,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Camera size={16} /> Barcha {galleryImages.length} rasmni ko'rish</span>
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
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={16} /> {hall.city || hall.address || 'Toshkent'}
                  </span>
                  {hall.ratings && Number(hall.ratings) > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#C49B3C', fontWeight: 600, fontSize: '0.9rem' }}>
                      <Star size={14} fill="currentColor" /> {Number(hall.ratings).toFixed(1)}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({MOCK_REVIEWS.length} sharh)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-3)', marginBottom: 'var(--s-8)', padding: 'var(--s-6)', background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-light)' }}>
                {[
                  { icon: <Coins size={24} className="text-muted" />, val: formatPrice(hall.pricePerPlate), label: '1 kishi' },
                  { icon: <Users size={24} className="text-muted" />, val: `${hall.capacity}`, label: "Sig'im" },
                  { icon: <CalendarDays size={24} className="text-muted" />, val: `${advancePerc}%`, label: 'Avans' },
                  { icon: <Star size={24} className="text-gold" fill="currentColor" />, val: hall.ratings ? Number(hall.ratings).toFixed(1) : '5.0', label: 'Reyting' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: 'var(--s-2) 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--s-1)' }}>{s.icon}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--burgundy)', fontWeight: 700 }}>{s.val}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border-light)', marginBottom: 'var(--s-8)' }}>
                {(['info', 'reviews'] as const).map(tab => (
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {tab === 'info' ? <><ClipboardList size={16} /> Ma'lumot</> : <><Star size={16} fill="currentColor" /> Sharhlar</>}
                    </span>
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
                  <div style={{ marginBottom: 'var(--s-8)' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: 'var(--s-2)' }}>Bo&apos;sh kunlarni tanlang</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 'var(--s-5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <XCircle size={14} className="text-danger" fill="currentColor" /> Band &nbsp;|&nbsp; <CheckCircle2 size={14} className="text-success" /> Bo&apos;sh &nbsp;|&nbsp; Bugundan keyin bron qilish mumkin
                    </div>
                    <Calendar bookedDates={bookedDates} bookedDetails={bookedDetails} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
                  </div>
                </div>
              )}

              {/* Tab: REVIEWS */}
              {activeTab === 'reviews' && (
                <div style={{ marginBottom: 'var(--s-8)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--s-8)', padding: 'var(--s-6)', background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-light)', marginBottom: 'var(--s-6)', alignItems: 'center' }}>
                    {/* Left: Overall */}
                    <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-light)', paddingRight: 'var(--s-4)' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--burgundy)', lineHeight: 1 }}>4.8</div>
                      <div style={{ color: '#C49B3C', fontSize: '1.2rem', margin: 'var(--s-2) 0' }}>★★★★★</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{MOCK_REVIEWS.length} sharh</div>
                    </div>
                    
                    {/* Right: Detailed Bars */}
                    <div>
                      {[
                        { label: 'Tozalik (Cleanliness)', score: 4.9, percent: 98 },
                        { label: 'Ovqat mazzasi (Food Quality)', score: 4.8, percent: 96 },
                        { label: 'Xizmat ko\'rsatish (Service)', score: 4.7, percent: 94 }
                      ].map((item, idx) => (
                        <div key={idx} style={{ marginBottom: 'var(--s-3)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 'var(--s-1)', fontWeight: 600 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                            <span style={{ color: 'var(--text-main)' }}>{item.score}</span>
                          </div>
                          <div style={{ height: 8, background: 'var(--border-light)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--burgundy)', borderRadius: 4, width: `${item.percent}%` }} />
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

              {/* ALWAYS VISIBLE LOCATION SECTION */}
              <div style={{ borderTop: '2px solid var(--border-light)', paddingTop: 'var(--s-8)', marginTop: 'var(--s-8)' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: 'var(--s-5)' }}>Joylashuv</h3>
                <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-light)', overflow: 'hidden', marginBottom: 'var(--s-6)' }}>
                  {/* Real Google Map (embed, kalitsiz q= rejimi) */}
                  <iframe
                    title={`${hall.name} xaritada`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent((hall.address || hall.city || 'Toshkent') + ', ' + hall.name)}&output=embed&z=15`}
                    style={{ width: '100%', height: 360, border: 0, display: 'block' }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                  <div style={{ padding: 'var(--s-6)' }}>
                    <h4 style={{ marginBottom: 'var(--s-3)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={18} /> Manzil</h4>
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
                    { icon: <Car size={24} className="text-muted" />, title: 'Avto', desc: 'Bepul avtoturargoh mavjud' },
                    { icon: <Train size={24} className="text-muted" />, title: 'Metro', desc: "Eng yaqin metro 5 daqiqa" },
                  ].map((t, i) => (
                    <div key={i} style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 'var(--s-5)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
                      <span style={{ display: 'flex' }}>{t.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CalendarDays size={16} /> Sana</label>
                      <input className="form-input" value={selectedDate} readOnly style={{ background: 'var(--cream)', fontWeight: 600 }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16} /> Mehmonlar soni *</label>
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
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={16} /> Telefon</label>
                      <input className="form-input" placeholder="+998 90 123 45 67" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>

                    {services.length > 0 && (
                      <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={16} /> Qo&apos;shimcha xizmatlar</label>
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
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MessageSquare size={16} /> Izoh</label>
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

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={bookingLoading || !guestCount}>
                      {bookingLoading ? '⏳ Yuklanmoqda...' : guestCount ? <><PartyPopper size={20} /> Bron qilish · {formatPrice(advancePrice)}</> : 'Mehmonlar sonini kiriting'}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 'var(--s-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Lock size={14} /> Xavfsiz to&apos;lov · Bekor qilish mumkin
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
                        { icon: <Users size={18} className="text-muted" />, text: `Sig'im: ${hall.capacity} kishi` },
                        { icon: <CalendarDays size={18} className="text-muted" />, text: `Avans: ${advancePerc}% to'lov` },
                        { icon: <CheckCircle2 size={18} className="text-success" />, text: "Bekor qilish mumkin" },
                        { icon: <ShieldCheck size={18} className="text-muted" />, text: "Xavfsiz bron tizimi" },
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex' }}>{item.icon}</span>
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ textAlign: 'center', padding: 'var(--s-6)', background: 'var(--cream)', borderRadius: 'var(--r-lg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--s-2)', opacity: 0.4 }}><CalendarDays size={32} /></div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                        Kalendardan bo&apos;sh kunni tanlang va bron qilishni boshlang
                      </p>
                    </div>
                  </div>

                  {/* Contact card */}
                  <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', padding: 'var(--s-6)', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: 'var(--s-4)', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={18} /> Bog&apos;lanish</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
                      <a href="tel:+998901234567" className="btn btn-outline" style={{ borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Smartphone size={18} /> Qo&apos;ng&apos;iroq qilish
                      </a>
                      <button onClick={toggleFavorite} className={`btn ${isFavorite ? 'btn-danger' : 'btn-ghost'}`} style={{ borderRadius: 'var(--r-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} /> {isFavorite ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo\'shish'}
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
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> {h.cap} kishi</span>
                      <span style={{ color: '#C49B3C', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={14} fill="currentColor" /> {h.rating}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--burgundy)', marginTop: 'var(--s-2)' }}>{h.price} so&apos;m</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={advancePrice} // Only charging advance
        onSuccess={processActualBooking}
        isProcessingOverride={bookingLoading}
      />

      {/* Modern Success Ticket Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 380, borderRadius: '24px', overflow: 'hidden', animation: 'dropIn 0.5s cubic-bezier(0.2, 1.2, 0.3, 1)', position: 'relative', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--burgundy), var(--burgundy-deep))', padding: '40px 20px 24px', textAlign: 'center', color: 'white', position: 'relative' }}>
              <div style={{ width: 72, height: 72, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--success)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
                <CheckCircle2 size={40} />
              </div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: 8, color: 'white', fontWeight: 800 }}>To'lov tasdiqlandi!</h2>
              <p style={{ opacity: 0.9, fontSize: '0.9rem', lineHeight: 1.5 }}>Sizning broningiz muvaffaqiyatli qabul qilindi. Elektron chek pochtangizga yuborildi.</p>
            </div>
            <div style={{ padding: '24px', position: 'relative', background: 'var(--white)' }}>
              {/* Ticket perforation effect */}
              <div style={{ position: 'absolute', top: -12, left: -12, width: 24, height: 24, background: 'rgba(0,0,0,0.8)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', top: -12, right: -12, width: 24, height: 24, background: 'rgba(0,0,0,0.8)', borderRadius: '50%' }} />
              <div style={{ borderTop: '2px dashed rgba(0,0,0,0.1)', position: 'absolute', top: 0, left: 15, right: 15 }} />
              
              <div style={{ display: 'grid', gap: '16px', marginBottom: '24px', marginTop: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>To'yxona</div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)' }}>{hall?.name}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--cream)', padding: '12px', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Sana</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selectedDate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Mehmonlar</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{guestCount} kishi</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>To'langan avans (25%)</div>
                  <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--success)' }}>{formatPrice(advancePrice)}</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ height: 44, width: '100%', background: 'repeating-linear-gradient(90deg, #0f172a, #0f172a 3px, transparent 3px, transparent 6px, #0f172a 6px, #0f172a 8px, transparent 8px, transparent 12px, #0f172a 12px, #0f172a 16px, transparent 16px, transparent 18px)', opacity: 0.85, marginBottom: 12, borderRadius: 4 }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.25em', fontFamily: 'monospace', fontWeight: 700 }}>WDDNG-{(Math.random()*100000000).toFixed(0)}</div>
              </div>

              <button onClick={() => { setShowSuccessModal(false); setSelectedDate(null); setGuests(''); router.push('/my-bookings'); }} className="btn btn-primary btn-lg" style={{ width: '100%', borderRadius: '12px', fontSize: '1rem' }}>
                Mening bronlarimga o'tish
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
