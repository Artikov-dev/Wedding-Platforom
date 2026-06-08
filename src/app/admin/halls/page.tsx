'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import { hallsService, adminService } from '@/services/api.service';
import { useToast } from '@/components/ui/Toast';
import { Hall } from '@/types';
import { formatPrice, DISTRICTS, HALL_CATEGORIES } from '@/lib/utils';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=70';

export default function AdminHallsPage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState<'table' | 'card'>('table');
  const [editHall, setEditHall] = useState<Hall | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', category: '', capacity: '', pricePerPlate: '', city: '', address: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchHalls = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hallsService.search({ limit: 100 });
      setHalls(res.data.data?.halls || []);
    } catch { setHalls([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHalls(); }, [fetchHalls]);

  const isApproved = (h: Hall) => h.approvalStatus === 'APPROVED' || h.status === 'APPROVED';

  const approveHall = async (id: string) => {
    try {
      await adminService.approveHall(id, 'APPROVED');
      setHalls(prev => prev.map(h => h.id === id ? { ...h, approvalStatus: 'APPROVED', status: 'APPROVED' } : h));
      showToast('Tasdiqlandi!');
    } catch { showToast('Xatolik', 'error'); }
  };

  const deleteHall = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await hallsService.delete(id);
      setHalls(prev => prev.filter(h => h.id !== id));
      showToast("O'chirildi");
    } catch { showToast('Xatolik', 'error'); }
  };

  const openEdit = (h: Hall) => {
    setEditHall(h);
    setEditForm({
      name: h.name,
      description: h.description || '',
      category: h.category || '',
      capacity: String(h.capacity),
      pricePerPlate: String(h.pricePerPlate),
      city: h.city || '',
      address: h.address || '',
      imageUrl: h.imageUrl || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editHall) return;
    setSaving(true);
    try {
      await hallsService.update(editHall.id, {
        name: editForm.name,
        description: editForm.description || undefined,
        category: editForm.category || undefined,
        capacity: parseInt(editForm.capacity),
        pricePerPlate: parseFloat(editForm.pricePerPlate),
        city: editForm.city || undefined,
        address: editForm.address || undefined,
        imageUrl: editForm.imageUrl || undefined,
      });
      showToast("Muvaffaqiyatli yangilandi!");
      setEditHall(null);
      fetchHalls();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xatolik';
      showToast(msg, 'error');
    } finally { setSaving(false); }
  };

  const filtered = halls.filter(h => {
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === 'APPROVED' && !isApproved(h)) return false;
    if (statusFilter === 'PENDING' && isApproved(h)) return false;
    return true;
  });

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--s-6)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--s-1)' }}>To&apos;yxonalar</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{halls.length} ta jami</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
          <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('table')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            Jadval
          </button>
          <button className={`btn btn-sm ${view === 'card' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('card')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Kartalar
          </button>
          <Link href="/admin/halls/create" className="btn btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Yangi qo&apos;shish
          </Link>
        </div>
      </div>

      <div className="filters-bar">
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Qidiruv</label>
          <input className="form-input" placeholder="Nomi bo'yicha..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Status</label>
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Barchasi</option>
            <option value="APPROVED">Tasdiqlangan</option>
            <option value="PENDING">Tasdiqlanmagan</option>
          </select>
        </div>
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : view === 'table' ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Rasm</th>
                <th>Nomi</th>
                <th>Rayon</th>
                <th>Sig&apos;im</th>
                <th>Narx/kishi</th>
                <th>Status</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(h => (
                <tr key={h.id}>
                  <td>
                    <div style={{ width: 52, height: 38, borderRadius: 'var(--r-sm)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      <Image
                        src={(h.imageUrl && !h.imageUrl.includes('example.com')) ? h.imageUrl : FALLBACK_IMG}
                        alt={h.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        unoptimized
                      />
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{h.name}</td>
                  <td>{h.city || '—'}</td>
                  <td>{h.capacity} kishi</td>
                  <td>{formatPrice(h.pricePerPlate)}</td>
                  <td>
                    <span className={`badge ${isApproved(h) ? 'badge-success' : 'badge-warning'}`}>
                      {isApproved(h) ? 'Tasdiqlangan' : 'Kutilmoqda'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Link href={`/admin/halls/${h.id}`} className="btn btn-sm btn-ghost" title="Ko'rish">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </Link>
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(h)} title="Tahrirlash">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      {!isApproved(h) && (
                        <button className="btn btn-sm btn-secondary" onClick={() => approveHall(h.id)} title="Tasdiqlash">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => deleteHall(h.id)} title="O'chirish">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>To&apos;yxona topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-3">
          {filtered.map(h => {
            const imgSrc = (h.imageUrl && !h.imageUrl.includes('example.com')) ? h.imageUrl : FALLBACK_IMG;
            return (
              <div key={h.id} style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', background: 'var(--surface)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
                <div style={{ position: 'relative', height: 180 }}>
                  <Image src={imgSrc} alt={h.name} fill style={{ objectFit: 'cover' }} unoptimized />
                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <span className={`badge ${isApproved(h) ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.72rem' }}>
                      {isApproved(h) ? 'Tasdiqlangan' : 'Kutilmoqda'}
                    </span>
                  </div>
                </div>
                <div style={{ padding: 'var(--s-4)' }}>
                  <h4 style={{ marginBottom: 'var(--s-1)', fontSize: '1rem', fontWeight: 700 }}>{h.name}</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 'var(--s-3)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 3 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {h.city || 'Toshkent'} &bull; {h.capacity} kishi
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--burgundy)', fontFamily: 'var(--font-display)' }}>{formatPrice(h.pricePerPlate)}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(h)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      {!isApproved(h) && (
                        <button className="btn btn-sm btn-secondary" onClick={() => approveHall(h.id)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => deleteHall(h.id)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={!!editHall} onClose={() => setEditHall(null)} title={`Tahrirlash: ${editHall?.name || ''}`}>
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Nomi *</label>
            <input className="form-input" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Tavsif</label>
            <textarea className="form-textarea" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} style={{ minHeight: 80 }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kategoriya</label>
              <select className="form-select" value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}>
                <option value="">Tanlang</option>
                {HALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rayon</label>
              <select className="form-select" value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))}>
                <option value="">Tanlang</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sig&apos;im *</label>
              <input type="number" className="form-input" value={editForm.capacity} onChange={e => setEditForm(p => ({ ...p, capacity: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Narx (so&apos;m/kishi) *</label>
              <input type="number" className="form-input" value={editForm.pricePerPlate} onChange={e => setEditForm(p => ({ ...p, pricePerPlate: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Manzil</label>
            <input className="form-input" value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Rasm URL</label>
            <input className="form-input" placeholder="https://..." value={editForm.imageUrl} onChange={e => setEditForm(p => ({ ...p, imageUrl: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--s-4)', marginTop: 'var(--s-6)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditHall(null)}>Bekor qilish</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
