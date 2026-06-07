'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isVerified: boolean;
  role: string;
  createdAt?: string;
}

export default function AdminOwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [allUsers, setAllUsers] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchOwners = useCallback(async () => {
    setLoading(true);
    try {
      // Try to get all users with HALL_OWNER role — admin only endpoint
      const res = await api.get('/api/auth/users');
      const d = res.data.data;
      const list: Owner[] = Array.isArray(d) ? d : d?.users || [];
      setAllUsers(list);
      setOwners(list.filter((u: Owner) => u.role === 'HALL_OWNER'));
    } catch {
      // Fallback: try /api/users
      try {
        const res2 = await api.get('/api/users');
        const d = res2.data.data;
        const list: Owner[] = Array.isArray(d) ? d : d?.users || [];
        setAllUsers(list);
        setOwners(list.filter((u: Owner) => u.role === 'HALL_OWNER'));
      } catch { setOwners([]); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOwners(); }, [fetchOwners]);

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleAddOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.password) { showToast("Majburiy maydonlarni to'ldiring", 'error'); return; }
    if (form.password.length < 8) { showToast("Parol kamida 8 ta belgi", 'error'); return; }
    setSaving(true);
    try {
      await api.post('/api/auth/register', { ...form, role: 'HALL_OWNER' });
      showToast("To'yxona egasi qo'shildi!");
      setShowAddModal(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', password: '' });
      fetchOwners();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xatolik';
      showToast(msg, 'error');
    } finally { setSaving(false); }
  };

  const filtered = owners.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.firstName.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || (o.phone || '').includes(q);
  });

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--s-8)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--s-1)' }}>To&apos;yxona egalari</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{owners.length} ta ega ro&apos;yxatda</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Yangi ega qo&apos;shish
        </button>
      </div>

      {/* Search */}
      <div className="filters-bar">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Qidiruv</label>
          <input className="form-input" placeholder="Ism, email yoki telefon..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {search && (
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Tozalash</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ism</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Status</th>
                <th>Qo&apos;shilgan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((o, idx) => (
                <tr key={o.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--burgundy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                        {o.firstName[0]}{o.lastName?.[0] || ''}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{o.firstName} {o.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hall Owner</div>
                      </div>
                    </div>
                  </td>
                  <td>{o.email}</td>
                  <td>{o.phone || '—'}</td>
                  <td>
                    <span className={`badge ${o.isVerified ? 'badge-success' : 'badge-warning'}`}>
                      {o.isVerified ? 'Tasdiqlangan' : 'Tasdiqlanmagan'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('uz-UZ') : '—'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    {owners.length === 0
                      ? "Hali to'yxona egasi yo'q. Yangi qo'shish uchun tugmani bosing."
                      : 'Qidiruv natijasi topilmadi'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Owner Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Yangi to'yxona egasi">
        <form onSubmit={handleAddOwner}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ism *</label>
              <input className="form-input" placeholder="Ism" value={form.firstName} onChange={e => update('firstName', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Familiya</label>
              <input className="form-input" placeholder="Familiya" value={form.lastName} onChange={e => update('lastName', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input type="email" className="form-input" placeholder="email@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Telefon *</label>
            <input className="form-input" placeholder="+998 90 123 45 67" value={form.phone} onChange={e => update('phone', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Parol *</label>
            <input type="password" className="form-input" placeholder="Kamida 8 ta belgi" value={form.password} onChange={e => update('password', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--s-4)', marginTop: 'var(--s-6)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saqlanmoqda...' : "Qo'shish"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Bekor qilish</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
