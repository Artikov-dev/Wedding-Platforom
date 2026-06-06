'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/* ── Mock Venue Data ── */
const VENUES = [
  {
    id: '1', name: "Navro'z Palace", district: 'Yunusobod', address: "Yunusobod tumani, Amir Temur ko'chasi 45",
    capacity: 500, priceRange: "180 000 - 250 000", rating: 4.9,
    description: "Toshkentdagi eng hashamatli to'y marosimlarini o'tkazish uchun mo'ljallangan zamonaviy saroy",
    image: '🏛️', imageLabel: 'Luxury Wedding Hall Interior', phone: '+998 90 111 22 33', badge: 'Premium',
  },
  {
    id: '2', name: 'Grand Tashkent', district: 'Mirobod', address: "Mirobod tumani, Bunyodkor ko'chasi 12",
    capacity: 400, priceRange: "150 000 - 200 000", rating: 4.8,
    description: "Klassik uslubdagi keng va yorug' zal, 400 kishilik sig'im bilan",
    image: '✨', imageLabel: 'Grand Ballroom for 400 Guests', phone: '+998 90 222 33 44', badge: 'Mashhur',
  },
  {
    id: '3', name: 'Royal Wedding Hall', district: 'Chilonzor', address: "Chilonzor tumani, Qatortol ko'chasi 78",
    capacity: 350, priceRange: "120 000 - 180 000", rating: 4.7,
    description: "Shohona bezatilgan zal, zamonaviy yorug'lik tizimi va professional xizmat",
    image: '👑', imageLabel: 'Elegant Wedding Stage Design', phone: '+998 90 333 44 55',
  },
  {
    id: '4', name: 'Diamond Hall', district: 'Yakkasaroy', address: "Yakkasaroy tumani, Shota Rustaveli 100",
    capacity: 600, priceRange: "200 000 - 300 000", rating: 4.9,
    description: "Toshkentning eng katta va zamonaviy to'yxonasi — olmos darajasidagi xizmat",
    image: '💎', imageLabel: 'Premium Banquet Hall', phone: '+998 90 444 55 66', badge: 'VIP',
  },
  {
    id: '5', name: 'Oqshom Plaza', district: 'Sergeli', address: "Sergeli tumani, Yangi Sergeli 5",
    capacity: 250, priceRange: "100 000 - 150 000", rating: 4.6,
    description: "Oilaviy muhitda qulay va sifatli xizmat, ochiq hovli va bog' bilan",
    image: '🌙', imageLabel: 'Outdoor Wedding Garden', phone: '+998 90 555 66 77',
  },
  {
    id: '6', name: 'Samarqand Hall', district: 'Olmazor', address: "Olmazor tumani, Beruniy ko'chasi 30",
    capacity: 300, priceRange: "130 000 - 170 000", rating: 4.7,
    description: "O'zbek milliy uslubida bezatilgan zal, an'anaviy va zamonaviy uyg'unlik",
    image: '🕌', imageLabel: 'Luxury Reception Area', phone: '+998 90 666 77 88', badge: 'Yangi',
  },
];

const FEATURES = [
  { icon: '🔍', title: "Oson qidiruv", desc: "Rayon, narx va sig'im bo'yicha filtrlang. Real-time qidiruv bilan eng mos to'yxonani toping." },
  { icon: '📅', title: "Online bron", desc: "Kalendardan bo'sh kunni tanlang, qo'shimcha xizmatlarni belgilang va bir zumda bron qiling." },
  { icon: '💳', title: "Xavfsiz to'lov", desc: "20% avans to'lab joyingizni band qiling. Stripe orqali xavfsiz va tez to'lov tizimi." },
  { icon: '⭐', title: "Ishonchli sharhlar", desc: "Haqiqiy mijozlar sharhlarini o'qing va eng yaxshi to'yxonani ishonch bilan tanlang." },
];

const GALLERY = [
  { label: 'Hashamatli to\'y zali interyeri', icon: '🏛️' },
  { label: 'Zamonaviy sahna bezatish', icon: '🎭' },
  { label: 'Premium banket stollari', icon: '🍽️' },
  { label: 'Ochiq havo marosimi', icon: '🌿' },
  { label: 'Romantik yoritish dizayni', icon: '✨' },
  { label: 'Gul bezaklari va dekor', icon: '💐' },
];

const TESTIMONIALS = [
  {
    text: "To'yxona.uz orqali biz orzuimizdagi to'yxonani topdik. Bron qilish juda oson va qulay bo'ldi. Xizmat darajasi a'lo!",
    name: 'Dilnoza Karimova', role: "Kelin, 2024-yil to'yi", initials: 'DK', stars: 5,
  },
  {
    text: "300 kishilik to'yimiz uchun eng mos variantni 10 daqiqada topdik. Kalendardan bo'sh kunni ko'rib, darhol bron qildik.",
    name: 'Jasur Aliyev', role: "Kuyov, 2024-yil mart", initials: 'JA', stars: 5,
  },
  {
    text: "To'yxona egasi sifatida aytaman — bu platforma mijozlarni topishda juda yordam berdi. Professional va zamonaviy tizim.",
    name: "Bobur To'ychiyev", role: "To'yxona egasi", initials: 'BT', stars: 5,
  },
];

function formatPrice(p: string) { return p + " so'm"; }

export default function HomePage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <>
      <Header />

      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-ornament hero-ornament-1">♥</div>
          <div className="hero-ornament hero-ornament-2">✦</div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-accent reveal reveal-delay-1">✦ Hayotingizdagi eng muhim kun uchun</span>
            <h1 className="reveal reveal-delay-2">Orzuingizdagi to&apos;yni biz bilan rejalashtiring</h1>
            <p className="reveal reveal-delay-3">
              O&apos;zbekistondagi eng sara to&apos;yxonalarni kashf eting, taqqoslang va bir necha
              daqiqada online bron qiling. Har bir tafsilot sizning maxsus kuningiz uchun.
            </p>
            <div className="hero-actions reveal reveal-delay-4">
              <Link href="/halls" className="btn btn-primary btn-xl">
                To&apos;yxonalarni ko&apos;rish
              </Link>
              <Link href="/register" className="btn btn-outline btn-xl">
                Bepul ro&apos;yxatdan o&apos;tish
              </Link>
            </div>
            <div className="hero-stats reveal reveal-delay-5">
              <div>
                <div className="hero-stat-value">200+</div>
                <div className="hero-stat-label">To&apos;yxonalar</div>
              </div>
              <div>
                <div className="hero-stat-value">5,000+</div>
                <div className="hero-stat-label">Muvaffaqiyatli to&apos;ylar</div>
              </div>
              <div>
                <div className="hero-stat-value">4.8</div>
                <div className="hero-stat-label">O&apos;rtacha reyting</div>
              </div>
            </div>
          </div>

          <div className="hero-visual reveal-scale reveal-delay-3">
            <div className="hero-img-main">
              <div className="img-placeholder" style={{ height: '100%' }}>
                <span className="img-placeholder-icon">🏛️</span>
                <span>Luxury Wedding Hall Interior</span>
              </div>
            </div>
            <div className="hero-img-sm">
              <div className="img-placeholder" style={{ height: '100%' }}>
                <span className="img-placeholder-icon">💐</span>
                <span>Elegant Decor</span>
              </div>
            </div>
            <div className="hero-img-sm">
              <div className="img-placeholder" style={{ height: '100%' }}>
                <span className="img-placeholder-icon">🎂</span>
                <span>Wedding Cake</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED VENUES ═══ */}
      <section className="section-lg" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div className="section-header reveal">
            <span className="accent-text">✦ Eng sara to&apos;yxonalar</span>
            <h2>Mashhur to&apos;yxonalar</h2>
            <p>Toshkentdagi eng yaxshi va ishonchli to&apos;yxonalarni kashf eting</p>
          </div>

          <div className="grid grid-3">
            {VENUES.map((v, i) => (
              <div key={v.id} className={`venue-card reveal reveal-delay-${(i % 3) + 1}`}>
                <div className="venue-card-img">
                  <div className="img-placeholder">
                    <span className="img-placeholder-icon">{v.image}</span>
                    <span>{v.imageLabel}</span>
                  </div>
                  {v.badge && <div className="venue-card-badge">{v.badge}</div>}
                  <button className="venue-card-fav" aria-label="Sevimli">🤍</button>
                </div>
                <div className="venue-card-content">
                  <h3 className="venue-card-name">{v.name}</h3>
                  <div className="venue-card-location">📍 {v.district} tumani</div>
                  <div className="venue-card-meta">
                    <span className="venue-card-meta-item">👥 {v.capacity} kishi</span>
                    <span className="venue-card-meta-item">⭐ {v.rating}</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 'var(--s-4)' }}>
                    {v.description}
                  </p>
                  <div className="venue-card-divider" />
                  <div className="venue-card-footer">
                    <div className="venue-card-price">
                      <span className="venue-card-price-value">{formatPrice(v.priceRange)}</span>
                      <span className="venue-card-price-label">1 kishi uchun</span>
                    </div>
                    <Link href={`/halls/${v.id}`} className="btn btn-sm btn-primary">
                      Batafsil →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--s-12)' }} className="reveal">
            <Link href="/halls" className="btn btn-outline btn-lg">
              Barcha to&apos;yxonalarni ko&apos;rish →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ WHY CHOOSE US ═══ */}
      <section className="section-lg">
        <div className="container">
          <div className="section-header reveal">
            <span className="accent-text">✦ Nima uchun biz?</span>
            <h2>Sizning qulayligingiz uchun</h2>
            <p>Eng qulay va ishonchli bron qilish tajribasini taqdim etamiz</p>
          </div>
          <div className="grid grid-4">
            {FEATURES.map((f, i) => (
              <div key={i} className={`feature-card reveal reveal-delay-${i + 1}`}>
                <div className="feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GALLERY ═══ */}
      <section className="section-lg" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div className="section-header reveal">
            <span className="accent-text">✦ Galereya</span>
            <h2>Ajoyib lahzalar</h2>
            <p>To&apos;yxonalarimiz interyer va bezaklari bilan tanishing</p>
          </div>
          <div className="gallery-grid">
            {GALLERY.map((g, i) => (
              <div key={i} className={`gallery-item reveal-scale reveal-delay-${(i % 3) + 1}`}>
                <div className="img-placeholder" style={{ height: '100%' }}>
                  <span className="img-placeholder-icon">{g.icon}</span>
                  <span>{g.label}</span>
                </div>
                <div className="gallery-overlay">
                  <span>{g.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="section-lg">
        <div className="container">
          <div className="section-header reveal">
            <span className="accent-text">✦ Mijozlar fikri</span>
            <h2>Ishonch va mamnuniyat</h2>
            <p>Bizning xizmatimizdan foydalangan mijozlarning fikrlari</p>
          </div>
          <div className="grid grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`testimonial-card reveal reveal-delay-${i + 1}`}>
                <span className="testimonial-quote">&ldquo;</span>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-stars">{'★'.repeat(t.stars)}</div>
                <div style={{ marginTop: 'var(--s-4)' }}>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{t.initials}</div>
                    <div>
                      <div className="testimonial-name">{t.name}</div>
                      <div className="testimonial-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner reveal">
            <span className="accent-text">✦ Tayyor misiz?</span>
            <h2>O&apos;zingizga mos to&apos;yxonani hoziroq toping</h2>
            <p>
              200 dan ortiq to&apos;yxonalar orasidan o&apos;zingizga mosini tanlang.
              Bepul ro&apos;yxatdan o&apos;ting va bir necha daqiqada bron qiling.
            </p>
            <div style={{ display: 'flex', gap: 'var(--s-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/halls" className="btn btn-gold btn-xl">
                To&apos;yxonalarni ko&apos;rish
              </Link>
              <Link href="/register" className="btn btn-xl" style={{ background: 'rgba(255,255,255,0.12)', color: 'var(--gold-light)', border: '1px solid rgba(255,255,255,0.2)' }}>
                Bepul boshlash
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
