'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { UserRole } from '@/types';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'CUSTOMER' as UserRole });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.password || !form.phone) { showToast("Barcha majburiy maydonlarni to'ldiring", 'error'); return; }
    if (form.password !== form.confirmPassword) { showToast('Parollar mos kelmaydi', 'error'); return; }
    if (form.password.length < 8) { showToast("Parol kamida 8 ta belgidan iborat bo'lishi kerak", 'error'); return; }
    if (form.phone.replace(/\D/g, '').length < 10) { showToast("Telefon raqam kamida 10 ta raqamdan iborat bo'lishi kerak", 'error'); return; }
    setLoading(true);
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password, role: form.role });
      
      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('demo_otp', otpCode);

      // Send OTP Email via local API
      try {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: form.email,
            subject: 'Wedding Platform - Emailni tasdiqlash (OTP)',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #722F37;">Salom, ${form.firstName}! 👋</h2>
                <p style="font-size: 16px; color: #333;">Siz <b>Wedding Platform</b> tizimidan ro'yxatdan o'tdingiz. Akkountni faollashtirish uchun quyidagi kodni kiriting:</p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #722F37;">${otpCode}</span>
                </div>
                
                <p style="font-size: 14px; color: #777;">Kodni hech kimga bermang. Hurmat bilan,<br/>Wedding Platform Jamoasi</p>
              </div>
            `
          })
        });
      } catch (err) {
        console.error('Email sending failed', err);
      }

      showToast('Tasdiqlash kodi pochtangizga yuborildi!');
      window.location.href = `/verify-otp?email=${encodeURIComponent(form.email)}`;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xatolik yuz berdi';
      showToast(msg, 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--gold)', fontSize: '1.1rem', display: 'block', marginBottom: 'var(--s-2)' }}>
            ✦ Yangi akkount
          </span>
          <h1 style={{ fontSize: '2rem' }}>Ro&apos;yxatdan o&apos;tish</h1>
          <p style={{ marginTop: 'var(--s-3)' }}>Bepul akkount yarating</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Ism *</label><input className="form-input" placeholder="Ismingiz" autoComplete="given-name" value={form.firstName} onChange={e => update('firstName', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Familiya</label><input className="form-input" placeholder="Familiyangiz" autoComplete="family-name" value={form.lastName} onChange={e => update('lastName', e.target.value)} /></div>
          </div>
          <div className="form-group"><label htmlFor="register-email" className="form-label">Email *</label><input id="register-email" type="email" className="form-input" placeholder="email@example.com" autoComplete="email" value={form.email} onChange={e => update('email', e.target.value)} /></div>
          <div className="form-group"><label htmlFor="register-phone" className="form-label">Telefon *</label><input id="register-phone" className="form-input" placeholder="+998 90 123 45 67" autoComplete="tel" value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
          <div className="form-group">
            <label htmlFor="register-role" className="form-label">Ro&apos;l</label>
            <select id="register-role" className="form-select" value={form.role} onChange={e => update('role', e.target.value)}>
              <option value="CUSTOMER">Foydalanuvchi</option>
              <option value="HALL_OWNER">To&apos;yxona egasi</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group"><label htmlFor="register-password" className="form-label">Parol *</label><input id="register-password" type="password" className="form-input" placeholder="Kamida 8 ta belgi" autoComplete="new-password" value={form.password} onChange={e => update('password', e.target.value)} /></div>
            <div className="form-group"><label htmlFor="register-confirm-password" className="form-label">Parolni tasdiqlang *</label><input id="register-confirm-password" type="password" className="form-input" placeholder="Qayta kiriting" autoComplete="new-password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} /></div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', borderRadius: 'var(--r-lg)' }} disabled={loading}>
            {loading ? 'Yuklanmoqda...' : "Ro'yxatdan o'tish"}
          </button>
        </form>
        <div className="auth-footer">
          Akkountingiz bormi? <Link href="/login">Kirish</Link>
        </div>
      </div>
    </div>
  );
}
