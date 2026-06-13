'use client';

import React, { useState } from 'react';
import { hallsService } from '@/services/api.service';
import { useToast } from '@/components/ui/Toast';
import { DISTRICTS, HALL_CATEGORIES } from '@/lib/utils';
import { ImageOutlined } from '@mui/icons-material';

export default function RegisterHallPage() {
  const [form, setForm] = useState({ name: '', description: '', category: '', capacity: '', pricePerPlate: '', city: '', address: '', phone: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.capacity || !form.pricePerPlate || !form.category) {
      showToast("Nomi, kategoriya, sig'im va narx majburiy", 'error'); return;
    }
    const capacity = parseInt(form.capacity);
    const pricePerPlate = parseFloat(form.pricePerPlate);
    if (isNaN(capacity) || capacity < 1) { showToast("Sig'im to'g'ri son bo'lishi kerak", 'error'); return; }
    if (isNaN(pricePerPlate) || pricePerPlate < 1) { showToast("Narx to'g'ri son bo'lishi kerak", 'error'); return; }
    setLoading(true);
    try {
      await hallsService.create({
        name: form.name,
        description: form.description || undefined,
        category: form.category,
        capacity,
        pricePerPlate,
        city: form.city || undefined,
        address: form.address || undefined,
        phone: form.phone || undefined,
        imageUrl: form.imageUrl || undefined,
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
                {HALL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
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
          <div className="image-placeholder" style={{ marginBottom: 'var(--s-6)', background: 'var(--cream)', borderRadius: 'var(--r-lg)', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', overflow: 'hidden', position: 'relative' }}>
            {form.imageUrl ? <img src={form.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}><ImageOutlined sx={{ fontSize: 48 }} style={{ opacity: 0.3, marginBottom: 'var(--s-2)' }} /><span>Rasm shu yerda ko&apos;rinadi</span></div>}
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Yuborilmoqda...' : "Ro'yxatdan o'tkazish"}
          </button>
        </form>
      </div>
    </div>
  );
}
