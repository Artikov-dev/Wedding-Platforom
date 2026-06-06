'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'reset'>('email');
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
      showToast('Tasdiqlash kodi yuborildi!');
      setStep('reset');
    } catch { showToast('Xatolik yuz berdi', 'error'); }
    finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) { showToast('Barcha maydonlarni to\'ldiring', 'error'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { email, otp, newPassword });
      showToast('Parol yangilandi!');
      window.location.href = '/login';
    } catch { showToast('Xatolik yuz berdi', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div className="auth-logo">
          <h1>Parolni tiklash</h1>
          <p>{step === 'email' ? 'Email manzilingizni kiriting' : 'Yangi parol o\'rnating'}</p>
        </div>
        {step === 'email' ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Yuborilmoqda...' : 'Kod yuborish'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label">Tasdiqlash kodi</label>
              <input className="form-input" placeholder="Kodni kiriting" value={otp} onChange={e => setOtp(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Yangi parol</label>
              <input type="password" className="form-input" placeholder="Yangi parolni kiriting" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Saqlanmoqda...' : 'Parolni yangilash'}
            </button>
          </form>
        )}
        <div className="auth-footer">
          <Link href="/login">Kirishga qaytish</Link>
        </div>
      </div>
    </div>
  );
}
