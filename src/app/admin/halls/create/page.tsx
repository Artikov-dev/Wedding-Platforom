'use client';

import React, { useState } from 'react';
import { hallsService } from '@/services/api.service';
import { useToast } from '@/components/ui/Toast';
import { DISTRICTS, HALL_CATEGORIES } from '@/lib/utils';

interface Singer { name: string; price: string; }
interface Car { brand: string; price: string; }

export default function AdminCreateHallPage() {
  const [form, setForm] = useState({ name: '', description: '', category: '', capacity: '', pricePerPlate: '', city: '', address: '', phone: '', imageUrl: '' });
  const [singers, setSingers] = useState<Singer[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [hasSurnay, setHasSurnay] = useState(false);
  const [surnayPrice, setSurnayPrice] = useState('');
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
      showToast("To'yxona qo'shildi!");
      setForm({ name: '', description: '', category: '', capacity: '', pricePerPlate: '', city: '', address: '', phone: '', imageUrl: '' });
      setSingers([]); setCars([]); setMenuItems([]); setHasSurnay(false); setSurnayPrice('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xatolik';
      showToast(msg, 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <h1 className="page-title">Yangi to&apos;yxona qo&apos;shish</h1>
      <div className="card card-body" style={{ maxWidth: 800 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Nomi *</label><input className="form-input" placeholder="To'yxona nomi" value={form.name} onChange={e => update('name', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Tavsif</label><textarea className="form-textarea" value={form.description} onChange={e => update('description', e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Kategoriya</label><select className="form-select" value={form.category} onChange={e => update('category', e.target.value)}><option value="">Tanlang</option>{HALL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Rayon</label><select className="form-select" value={form.city} onChange={e => update('city', e.target.value)}><option value="">Tanlang</option>{DISTRICTS.map(d => <option key={d}>{d}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Sig&apos;im *</label><input type="number" className="form-input" value={form.capacity} onChange={e => update('capacity', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Narx (so&apos;m/kishi) *</label><input type="number" className="form-input" value={form.pricePerPlate} onChange={e => update('pricePerPlate', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Manzil</label><input className="form-input" value={form.address} onChange={e => update('address', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Telefon</label><input className="form-input" value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Rasm URL</label><input className="form-input" placeholder="https://..." value={form.imageUrl} onChange={e => update('imageUrl', e.target.value)} /></div>

          {/* Qo'shimcha xizmatlar */}
          <h3 style={{ marginTop: 'var(--space-2xl)', marginBottom: 'var(--space-lg)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border)' }}>
            Qo&apos;shimcha xizmatlar
          </h3>

          {/* Honandalar */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="form-label">🎤 Honandalar</label>
              <button type="button" className="btn btn-sm btn-outline" onClick={() => setSingers(p => [...p, { name: '', price: '' }])}>+ Qo&apos;shish</button>
            </div>
            {singers.map((s, i) => (
              <div key={i} className="form-row" style={{ marginBottom: 'var(--space-sm)' }}>
                <input className="form-input" placeholder="Ism" value={s.name} onChange={e => { const n = [...singers]; n[i].name = e.target.value; setSingers(n); }} />
                <div className="flex">
                  <input type="number" className="form-input" placeholder="Narx" value={s.price} onChange={e => { const n = [...singers]; n[i].price = e.target.value; setSingers(n); }} />
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => setSingers(p => p.filter((_, j) => j !== i))}>✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Karnay-surnay */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={hasSurnay} onChange={e => setHasSurnay(e.target.checked)} />
              <span className="form-label" style={{ marginBottom: 0 }}>🎺 Karnay-surnay</span>
            </label>
            {hasSurnay && (
              <div className="form-group" style={{ marginTop: 'var(--space-sm)', maxWidth: 200 }}>
                <input type="number" className="form-input" placeholder="Narx" value={surnayPrice} onChange={e => setSurnayPrice(e.target.value)} />
              </div>
            )}
          </div>

          {/* Menu */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="form-label">🍽️ Menu taomlari</label>
              <button type="button" className="btn btn-sm btn-outline" onClick={() => setMenuItems(p => [...p, ''])}>+ Qo&apos;shish</button>
            </div>
            {menuItems.map((m, i) => (
              <div key={i} className="flex" style={{ marginBottom: 'var(--space-sm)' }}>
                <input className="form-input" placeholder="Taom nomi" value={m} onChange={e => { const n = [...menuItems]; n[i] = e.target.value; setMenuItems(n); }} />
                <button type="button" className="btn btn-sm btn-danger" onClick={() => setMenuItems(p => p.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>

          {/* Mashinalar */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="form-label">🚗 Mashinalar</label>
              <button type="button" className="btn btn-sm btn-outline" onClick={() => setCars(p => [...p, { brand: '', price: '' }])}>+ Qo&apos;shish</button>
            </div>
            {cars.map((c, i) => (
              <div key={i} className="form-row" style={{ marginBottom: 'var(--space-sm)' }}>
                <input className="form-input" placeholder="Brand" value={c.brand} onChange={e => { const n = [...cars]; n[i].brand = e.target.value; setCars(n); }} />
                <div className="flex">
                  <input type="number" className="form-input" placeholder="Narx" value={c.price} onChange={e => { const n = [...cars]; n[i].price = e.target.value; setCars(n); }} />
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => setCars(p => p.filter((_, j) => j !== i))}>✕</button>
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Saqlanmoqda...' : "To'yxona qo'shish"}
          </button>
        </form>
      </div>
    </div>
  );
}
