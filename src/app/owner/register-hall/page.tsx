'use client';

import React, { useState } from 'react';
import { hallsService } from '@/services/api.service';
import { useToast } from '@/components/ui/Toast';
import { DISTRICTS, HALL_CATEGORIES } from '@/lib/utils';

export default function RegisterHallPage() {
  const [form, setForm] = useState({ name: '', description: '', category: '', capacity: '', pricePerPlate: '', city: '', address: '', phone: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.capacity || !form.pricePerPlate) { showToast("Majburiy maydonlarni to'ldiring", 'error'); return; }
    setLoading(true);
    try {
      await hallsService.create({
        name: form.name, description: form.description, category: form.category || 'Standart',
        capacity: parseInt(form.capacity), pricePerPlate: parseFloat(form.pricePerPlate), imageUrl: form.imageUrl || undefined,
      });
      showToast("To'yxona yuborildi! Admin tasdiqlashini kuting");
      setForm({ name: '', description: '', category: '', capacity: '', pricePerPlate: '', city: '', address: '', phone: '', imageUrl: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xatolik';
      showToast(msg, 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <h1 className="page-title">To&apos;yxona ro&apos;yxatdan o&apos;tkazish</h1>
      <div className="card card-body" style={{ maxWidth: 700 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">To&apos;yxona nomi *</label>
            <input className="form-input" placeholder="Masalan: Navruz to'yxonasi" value={form.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Tavsif</label>
            <textarea className="form-textarea" placeholder="To'yxona haqida qisqacha..." value={form.description} onChange={e => update('description', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kategoriya</label>
              <select className="form-select" value={form.category} onChange={e => update('category', e.target.value)}>
                <option value="">Tanlang</option>
                {HALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rayon</label>
              <select className="form-select" value={form.city} onChange={e => update('city', e.target.value)}>
                <option value="">Tanlang</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sig&apos;im (kishi) *</label>
              <input type="number" className="form-input" placeholder="300" value={form.capacity} onChange={e => update('capacity', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">1 o&apos;rindiq narxi (so&apos;m) *</label>
              <input type="number" className="form-input" placeholder="150000" value={form.pricePerPlate} onChange={e => update('pricePerPlate', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Manzil</label>
            <input className="form-input" placeholder="To'liq manzil" value={form.address} onChange={e => update('address', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Telefon</label>
            <input className="form-input" placeholder="+998 90 123 45 67" value={form.phone} onChange={e => update('phone', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Rasm URL</label>
            <input className="form-input" placeholder="https://..." value={form.imageUrl} onChange={e => update('imageUrl', e.target.value)} />
          </div>
          <div className="image-placeholder" style={{ marginBottom: 'var(--space-lg)' }}>
            {form.imageUrl ? <img src={form.imageUrl} alt="Preview" style={{ maxHeight: 200, objectFit: 'cover' }} /> : "📷 To'yxona rasmi shu yerda ko'rinadi"}
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Yuborilmoqda...' : "Ro'yxatdan o'tkazish"}
          </button>
        </form>
      </div>
    </div>
  );
}
