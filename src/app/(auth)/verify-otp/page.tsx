'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

function VerifyOTPContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const [email] = useState(emailParam);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { showToast } = useToast();

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...digits];
    text.split('').forEach((ch, i) => { newDigits[i] = ch; });
    setDigits(newDigits);
    const nextIndex = Math.min(text.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) { showToast("6 ta raqam kiriting", 'error'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/verify-otp', { email, code });
      setSuccess(true);
      showToast('Email tasdiqlandi!');
      setTimeout(() => { window.location.href = '/login'; }, 2000);
    } catch { showToast("Kod noto'g'ri yoki muddati o'tgan", 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {success ? (
          <div style={{ padding: 'var(--s-8) 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--s-6)' }}>✅</div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 'var(--s-3)' }}>Tasdiqlandi!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Kirish sahifasiga yo&apos;naltirilmoqda...</p>
          </div>
        ) : (
          <>
            <div className="auth-logo">
              <div style={{ fontSize: '3.5rem', marginBottom: 'var(--s-4)' }}>📧</div>
              <h1 style={{ fontSize: '1.8rem' }}>Email tasdiqlash</h1>
              <p style={{ marginTop: 'var(--s-3)' }}>
                <strong>{email}</strong> manziliga yuborilgan 6 raqamli kodni kiriting
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--s-3)', marginBottom: 'var(--s-8)' }}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    style={{
                      width: 52, height: 60, textAlign: 'center', fontSize: '1.5rem', fontWeight: 700,
                      borderRadius: 'var(--r-md)', border: `2px solid ${d ? 'var(--burgundy)' : 'var(--border)'}`,
                      background: d ? 'rgba(114,47,55,0.03)' : 'var(--white)',
                      outline: 'none', fontFamily: 'var(--font-body)',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', borderRadius: 'var(--r-lg)' }} disabled={loading}>
                {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
              </button>
            </form>
            <div className="auth-footer">
              <Link href="/login">← Kirishga qaytish</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return <Suspense fallback={<div className="loading-page"><div className="spinner" /></div>}><VerifyOTPContent /></Suspense>;
}
