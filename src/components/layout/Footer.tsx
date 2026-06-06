import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>To&apos;yxona.uz</h3>
            <p>
              O&apos;zbekistondagi eng yaxshi to&apos;yxonalarni toping va online bron qiling.
              Sizning hayotingizdagi eng muhim kun uchun eng yaxshi joy.
            </p>
          </div>
          <div className="footer-col">
            <h4>Sahifalar</h4>
            <Link href="/">Bosh sahifa</Link>
            <Link href="/halls">To&apos;yxonalar</Link>
            <Link href="/login">Kirish</Link>
            <Link href="/register">Ro&apos;yxatdan o&apos;tish</Link>
          </div>
          <div className="footer-col">
            <h4>Xizmatlar</h4>
            <Link href="/halls">Bron qilish</Link>
            <Link href="/halls">To&apos;yxona qidirish</Link>
            <Link href="/register">Egasi sifatida</Link>
          </div>
          <div className="footer-col">
            <h4>Bog&apos;lanish</h4>
            <a href="tel:+998901234567">+998 90 123 45 67</a>
            <a href="mailto:artikovrozimuhammadxon@gmail.com">artikovrozimuhammadxon@gmail.com</a>
            <a>Toshkent, O&apos;zbekiston</a>
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} To&apos;yxona.uz</span>
          <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.95rem' }}>
            Sevgi bilan yaratilgan ♥
          </span>
        </div>
      </div>
    </footer>
  );
}
