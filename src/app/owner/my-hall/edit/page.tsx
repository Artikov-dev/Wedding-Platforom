'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Hall } from '@/types';
import { DISTRICTS, HALL_CATEGORIES } from '@/lib/utils';

export default function EditHallPage() {
  const [hall, setHall] = useState<Hall | null>(null);
  const [form, setForm] = useState({ name: '', description: '', category: '', capacity: '', pricePerPlate: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    api.get('/api/halls/search').then(r => {
      const d = r.data.data;
      const halls = Array.isArray(d) ? d : d?.halls || [];
      if (halls[0]) {
        const h = halls[0];
        setHall(h);
        setForm({ name: h.name, description: h.description || '', category: h.category || '', capacity: String(h.capacity), pricePerPlate: String(h.pricePerPlate), imageUrl: h.imageUrl || '' });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hall) return;
    setSaving(true);
    try {
      await api.put(`/api/halls/${hall.id}`, { name: form.name, description: form.description, category: form.category, capacity: parseInt(form.capacity), pricePerPlate: parseFloat(form.pricePerPlate), imageUrl: form.imageUrl || undefined });
      showToast("Ma'lumotlar yangilandi!");
    } catch { showToast('Xatolik yuz berdi', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!hall) return <div className="empty-state"><h3>To&apos;yxona topilmadi</h3></div>;

  return (
    <div className="fade-in">
      <h1 className="page-title">To&apos;yxonani tahrirlash</h1>
      <div className="card card-body" style={{ maxWidth: 700 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Nomi</label><input className="form-input" value={form.name} onChange={e => update('name', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Tavsif</label><textarea className="form-textarea" value={form.description} onChange={e => update('description', e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Kategoriya</label><select className="form-select" value={form.category} onChange={e => update('category', e.target.value)}><option value="">Tanlang</option>{HALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Sig&apos;im</label><input type="number" className="form-input" value={form.capacity} onChange={e => update('capacity', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Narx (so&apos;m/kishi)</label><input type="number" className="form-input" value={form.pricePerPlate} onChange={e => update('pricePerPlate', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Rasm URL</label><input className="form-input" value={form.imageUrl} onChange={e => update('imageUrl', e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => window.history.back()}>Bekor qilish</button>
          </div>
        </form>
      </div>
    </div>
  );
}
