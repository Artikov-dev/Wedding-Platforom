'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import { hallsService } from '@/services/api.service';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { Hall } from '@/types';
import { formatPrice, DISTRICTS, HALL_CATEGORIES } from '@/lib/utils';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=75';

export default function MyHallPage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [editHall, setEditHall] = useState<Hall | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '', description: '', category: '', capacity: '',
    pricePerPlate: '', city: '', address: '', phone: '', imageUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const fetchHalls = useCallback(async () => {
    setLoading(true);
    try {
      // /api/halls/owner returns 401 — use /api/halls/search and filter by userId
      const res = await hallsService.search({ limit: 100, ownerId: user?.id });
      const allHalls: Hall[] = res.data.data?.halls || [];
      const myHalls = user?.id
        ? allHalls.filter(h => h.userId === user.id || h.ownerId === user.id)
        : allHalls;
      setHalls(myHalls);
    } catch { setHalls([]); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchHalls(); }, [fetchHalls]);

  const isApproved = (h: Hall) => h.approvalStatus === 'APPROVED' || h.status === 'APPROVED';

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
      phone: h.phone || '',
      imageUrl: h.imageUrl || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editHall) return;
    if (!editForm.name || !editForm.capacity || !editForm.pricePerPlate) {
      showToast("Majburiy maydonlarni to'ldiring", 'error'); return;
    }
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
        phone: editForm.phone || undefined,
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

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await hallsService.delete(deleteId);
      showToast("To'yxona o'chirildi");
      setDeleteId(null);
      fetchHalls();
    } catch { showToast("O'chirishda xatolik", 'error'); }
    finally { setSaving(false); }
  };

  const imgSrc = (h: Hall) =>
    h.imageUrl && !h.imageUrl.includes('example.com') ? h.imageUrl : FALLBACK_IMG;

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--s-8)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--s-1)' }}>To&apos;yxonalarim</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{halls.length} ta to&apos;yxona</p>
        </div>
        <Link href="/owner/register-hall" className="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Yangi to&apos;yxona
        </Link>
      </div>

      {halls.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏛️</div>
          <h3>Hali to&apos;yxona qo&apos;shilmagan</h3>
          <p style={{ marginBottom: 'var(--s-6)' }}>Yangi to&apos;yxona ro&apos;yxatdan o&apos;tkazing</p>
          <Link href="/owner/register-hall" className="btn btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            To&apos;yxona qo&apos;shish
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
          {halls.map(h => (
            <div key={h.id} style={{
              display: 'grid', gridTemplateColumns: '280px 1fr auto',
              gap: 'var(--s-6)', background: 'var(--surface)',
              borderRadius: 'var(--r-xl)', overflow: 'hidden',
              boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)',
            }}>
              {/* Image */}
              <div style={{ position: 'relative', minHeight: 200 }}>
                <Image src={imgSrc(h)} alt={h.name} fill style={{ objectFit: 'cover' }} unoptimized />
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                  <span className={`badge ${isApproved(h) ? 'badge-success' : 'badge-warning'}`}>
                    {isApproved(h) ? 'Tasdiqlangan' : 'Tasdiqlanmagan'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: 'var(--s-6)' }}>
                <h3 style={{ marginBottom: 'var(--s-3)', fontSize: '1.2rem' }}>{h.name}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-3)', marginBottom: 'var(--s-4)' }}>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {h.city || 'Toshkent'}{h.address ? `, ${h.address}` : ''}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    {h.capacity} kishi sig&apos;im
                  </div>
                  <div style={{ fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>Narx:</span>
                    <strong style={{ color: 'var(--burgundy)' }}>{formatPrice(h.pricePerPlate)}/kishi</strong>
                  </div>
                  {h.category && (
                    <div style={{ fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>Kategoriya:</span>
                      <span>{h.category}</span>
                    </div>
                  )}
                </div>
                {h.description && (
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {h.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div style={{ padding: 'var(--s-6)', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', justifyContent: 'center', minWidth: 140 }}>
                <Link href="/owner/bookings" className="btn btn-sm btn-ghost" style={{ textAlign: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Bronlar
                </Link>
                <button className="btn btn-sm btn-outline" onClick={() => openEdit(h)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Tahrirlash
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(h.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5 }}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  O&apos;chirish
                </button>
              </div>
            </div>
          ))}
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
                {HALL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
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
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Manzil</label>
              <input className="form-input" placeholder="To'liq manzil" value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Telefon</label>
              <input className="form-input" placeholder="+998 90 ..." value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
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

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="O'chirishni tasdiqlang">
        <p style={{ marginBottom: 'var(--s-6)', color: 'var(--text-secondary)' }}>
          Bu to&apos;yxonani o&apos;chirmoqchimisiz? Bu amalni qaytarib bo&apos;lmaydi.
        </p>
        <div style={{ display: 'flex', gap: 'var(--s-4)' }}>
          <button className="btn btn-danger" onClick={handleDelete} disabled={saving} style={{ flex: 1 }}>
            {saving ? 'O\'chirilmoqda...' : 'Ha, o\'chirish'}
          </button>
          <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Bekor qilish</button>
        </div>
      </Modal>
    </div>
  );
}
