'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface Owner { id: string; firstName: string; lastName: string; email: string; phone: string; isVerified: boolean; }

export default function AdminOwnersPage() {
  const [owners] = useState<Owner[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleAddOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.password) { showToast("Majburiy maydonlarni to'ldiring", 'error'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/register', { ...form, role: 'HALL_OWNER' });
      showToast("To'yxona egasi qo'shildi!");
      setShowAddModal(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', password: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xatolik';
      showToast(msg, 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>To&apos;yxona egalari</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>➕ Yangi egasi qo&apos;shish</button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>Ism</th><th>Familiya</th><th>Email</th><th>Telefon</th><th>Status</th></tr></thead>
          <tbody>
            {owners.length > 0 ? owners.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight: 600 }}>{o.firstName}</td>
                <td>{o.lastName}</td>
                <td>{o.email}</td>
                <td>{o.phone || '—'}</td>
                <td><span className={`badge ${o.isVerified ? 'badge-success' : 'badge-warning'}`}>{o.isVerified ? 'Tasdiqlangan' : 'Tasdiqlanmagan'}</span></td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                Egalari ro&apos;yxati bo&apos;sh. Yangi qo&apos;shish uchun tugmani bosing.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Yangi to'yxona egasi">
        <form onSubmit={handleAddOwner}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Ism *</label><input className="form-input" value={form.firstName} onChange={e => update('firstName', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Familiya</label><input className="form-input" value={form.lastName} onChange={e => update('lastName', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" value={form.email} onChange={e => update('email', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Telefon</label><input className="form-input" value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Parol *</label><input type="password" className="form-input" value={form.password} onChange={e => update('password', e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saqlanmoqda...' : "Qo'shish"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Bekor qilish</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
