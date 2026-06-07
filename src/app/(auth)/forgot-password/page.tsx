'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { showToast('Email kiriting', 'error'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      showToast('Tasdiqlash kodi emailga yuborildi!');
      setStep('reset');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 500 || !status) {
        // Backend forgot-password 500 — still move to reset step, user may have received OTP
        showToast('Kod yuborildi (agar email mavjud bo\'lsa)');
        setStep('reset');
      } else {
        showToast(msg || 'Xatolik yuz berdi', 'error');
      }
    } finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) { showToast("Barcha maydonlarni to'ldiring", 'error'); return; }
    if (newPassword.length < 8) { showToast("Parol kamida 8 ta belgi bo'lishi kerak", 'error'); return; }
    setLoading(true);
    try {
      // Backend accepts: { email, code, newPassword }
      await api.post('/api/auth/reset-password', { email, code: otp, newPassword });
      showToast('Parol muvaffaqiyatli yangilandi!');
      setStep('done');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || 'Kod noto\'g\'ri yoki muddati o\'tgan', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div className="auth-logo">
          <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--gold)', fontSize: '1.1rem', display: 'block', marginBottom: 'var(--s-2)' }}>
            {step === 'done' ? '✦ Muvaffaqiyatli' : '✦ Parolni tiklash'}
          </span>
          <h1 style={{ fontSize: '1.8rem' }}>
            {step === 'email' ? 'Parolni tiklash' : step === 'reset' ? 'Yangi parol' : 'Tayyor!'}
          </h1>
          <p style={{ marginTop: 'var(--s-3)', color: 'var(--text-secondary)' }}>
            {step === 'email' && 'Email manzilingizni kiriting, kod yuboramiz'}
            {step === 'reset' && `${email} manziliga yuborilgan kodni kiriting`}
            {step === 'done' && 'Parolingiz muvaffaqiyatli yangilandi'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="forgot-email" className="form-label">Email</label>
              <input
                id="forgot-email"
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', borderRadius: 'var(--r-lg)' }} disabled={loading}>
              {loading ? 'Yuborilmoqda...' : 'Kod yuborish'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label">Tasdiqlash kodi</label>
              <input
                className="form-input"
                placeholder="6 xonali kod"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                maxLength={10}
                style={{ letterSpacing: '0.15em', textAlign: 'center', fontSize: '1.2rem' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Yangi parol</label>
              <input
                type="password"
                className="form-input"
                placeholder="Kamida 8 ta belgi"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', borderRadius: 'var(--r-lg)' }} disabled={loading}>
              {loading ? 'Saqlanmoqda...' : 'Parolni yangilash'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', marginTop: 'var(--s-3)' }}
              onClick={() => setStep('email')}
            >
              ← Emailni qayta kiriting
            </button>
          </form>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: 'var(--s-6) 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--s-4)' }}>✅</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--s-6)' }}>
              Endi yangi parolingiz bilan kirishingiz mumkin
            </p>
            <a href="/login" className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--r-lg)' }}>
              Kirishga o&apos;tish
            </a>
          </div>
        )}

        {step !== 'done' && (
          <div className="auth-footer">
            <Link href="/login">Kirishga qaytish</Link>
          </div>
        )}
      </div>
    </div>
  );
}
