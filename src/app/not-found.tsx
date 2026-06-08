'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="auth-page">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '6rem', fontFamily: 'var(--font-display)', color: 'var(--burgundy)', lineHeight: 1 }}>
          404
        </div>
        <h2 style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          Sahifa topilmadi
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-xl)' }}>
          Kechirasiz, siz qidirayotgan sahifa mavjud emas
        </p>
        <Link href="/" className="btn btn-primary btn-lg">
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
