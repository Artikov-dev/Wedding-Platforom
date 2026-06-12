'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

const TEST_ACCOUNTS = [
  { label: 'Admin', email: 'superadmin@wedding.uz', password: 'SuperAdmin1234!', role: 'ADMIN' },
  { label: 'Hall Owner', email: 'hallowner_test@wedding.uz', password: 'HallOwner1234!', role: 'HALL_OWNER' },
  { label: 'Customer', email: 'customer_test@wedding.uz', password: 'Customer1234!', role: 'CUSTOMER' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { showToast("Barcha maydonlarni to'ldiring", 'error'); return; }
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast('Muvaffaqiyatli kirildi!');
      if (user.role === 'ADMIN') router.push('/admin/dashboard');
      else if (user.role === 'HALL_OWNER') router.push('/owner/dashboard');
      else router.push('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Email yoki parol noto\'g\'ri';
      showToast(msg, 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--gold)', fontSize: '1.1rem', display: 'block', marginBottom: 'var(--s-2)' }}>
            ✦ Xush kelibsiz
          </span>
          <h1>To&apos;yxona.uz</h1>
          <p style={{ marginTop: 'var(--s-3)' }}>Tizimga kiring</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email</label>
            <input id="login-email" type="email" className="form-input" placeholder="email@example.com" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Parol</label>
            <input id="login-password" type="password" className="form-input" placeholder="Parolni kiriting" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div style={{ textAlign: 'right', marginBottom: 'var(--s-6)' }}>
            <Link href="/forgot-password" style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Parolni unutdingizmi?</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', borderRadius: 'var(--r-lg)' }} disabled={loading}>
            {loading ? 'Yuklanmoqda...' : 'Kirish'}
          </button>
        </form>
        <div className="auth-footer">
          Akkountingiz yo&apos;qmi? <Link href="/register">Ro&apos;yxatdan o&apos;ting</Link>
        </div>

        {/* Test accounts for development */}
        <div style={{ marginTop: 'var(--s-6)', padding: 'var(--s-4)', background: 'rgba(139,92,24,0.07)', borderRadius: 'var(--r-md)', border: '1px dashed var(--gold)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--s-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Test akkauntlar
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            {TEST_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--s-2) var(--s-3)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.8rem', textAlign: 'left' }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{acc.label}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{acc.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
