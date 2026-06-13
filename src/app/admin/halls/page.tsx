'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import { hallsService, adminService } from '@/services/api.service';
import { useToast } from '@/components/ui/Toast';
import { Hall } from '@/types';
import { formatPrice, DISTRICTS, HALL_CATEGORIES } from '@/lib/utils';
import { 
  FormatListBulletedOutlined, 
  GridViewOutlined, 
  AddOutlined, 
  VisibilityOutlined, 
  EditOutlined, 
  CheckCircleOutlined, 
  CancelOutlined, 
  DeleteOutlineOutlined,
  LocationOnOutlined
} from '@mui/icons-material';

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { showToast } = useToast();

  const fetchHalls = useCallback(async () => {
    setLoading(true);
    try {
      // Admin: use admin endpoint to see ALL halls including pending
      const res = await adminService.getAllHalls({ limit: 100 });
      setHalls(res.data.data?.halls || []);
    } catch {
      // Fallback to public search
      try {
        const res = await hallsService.search({ limit: 100 });
        setHalls(res.data.data?.halls || []);
      } catch { setHalls([]); }
    }
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

  const rejectHall = async (id: string) => {
    if (!confirm("Rad etishni tasdiqlaysizmi?")) return;
    try {
      await adminService.approveHall(id, 'REJECTED');
      setHalls(prev => prev.map(h => h.id === id ? { ...h, approvalStatus: 'REJECTED', status: 'REJECTED' } : h));
      showToast('Rad etildi', 'error');
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

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(h => h.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkApprove = async (status: string) => {
    if (!confirm(`Haqiqatan ham tanlangan ${selectedIds.length} ta to'yxona holatini ${status} ga o'zgartirmoqchimisiz?`)) return;
    try {
      const res = await adminService.bulkAction({
        resource: 'halls',
        action: 'update_approval',
        ids: selectedIds,
        value: status
      });
      if (res.data?.success) {
        showToast(`${selectedIds.length} ta to'yxona yangilandi`, 'success');
        setHalls(prev => prev.map(h => selectedIds.includes(h.id) ? { ...h, approvalStatus: status, status: status } : h));
        setSelectedIds([]);
      }
    } catch {
      showToast('Ommaviy yangilashda xatolik', 'error');
    }
  };

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--s-6)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--s-1)' }}>To&apos;yxonalar</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{halls.length} ta jami</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
          <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('table')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <FormatListBulletedOutlined sx={{ fontSize: 16 }} />
            Jadval
          </button>
          <button className={`btn btn-sm ${view === 'card' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('card')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <GridViewOutlined sx={{ fontSize: 16 }} />
            Kartalar
          </button>
          <Link href="/admin/halls/create" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <AddOutlined sx={{ fontSize: 18 }} />
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

      {/* Bulk Actions */}
      {selectedIds.length > 0 && view === 'table' && (
        <div className="card fade-in" style={{ padding: 'var(--s-3) var(--s-4)', marginBottom: 'var(--s-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-light)' }}>
          <div>
            <strong>{selectedIds.length}</strong> ta to&apos;yxona tanlandi
          </div>
          <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Holatni o&apos;zgartirish:</span>
            <button className="btn btn-outline btn-sm" onClick={() => handleBulkApprove('APPROVED')} style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
              Tasdiqlash
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => handleBulkApprove('REJECTED')} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
              Rad etish
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => handleBulkApprove('PENDING')} style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>
              Kutishga o'tkazish
            </button>
          </div>
        </div>
      )}

      {loading ? <div className="loading-page"><div className="spinner" /></div> : view === 'table' ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" className="form-checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                </th>
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
                <tr key={h.id} className={selectedIds.includes(h.id) ? 'selected-row' : ''}>
                  <td>
                    <input type="checkbox" className="form-checkbox" checked={selectedIds.includes(h.id)} onChange={() => toggleSelect(h.id)} />
                  </td>
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
                        <VisibilityOutlined sx={{ fontSize: 16 }} />
                      </Link>
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(h)} title="Tahrirlash">
                        <EditOutlined sx={{ fontSize: 16 }} />
                      </button>
                      {!isApproved(h) && (
                        <>
                          <button className="btn btn-sm btn-secondary" onClick={() => approveHall(h.id)} title="Tasdiqlash">
                            <CheckCircleOutlined sx={{ fontSize: 16 }} />
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => rejectHall(h.id)} title="Rad etish">
                            <CancelOutlined sx={{ fontSize: 16 }} />
                          </button>
                        </>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => deleteHall(h.id)} title="O'chirish">
                        <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
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
                    <LocationOnOutlined sx={{ fontSize: 14, mr: 0.5 }} />
                    {h.city || 'Toshkent'} &bull; {h.capacity} kishi
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--burgundy)', fontFamily: 'var(--font-display)' }}>{formatPrice(h.pricePerPlate)}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(h)}>
                        <EditOutlined sx={{ fontSize: 14 }} />
                      </button>
                      {!isApproved(h) && (
                        <>
                          <button className="btn btn-sm btn-secondary" onClick={() => approveHall(h.id)}>
                            <CheckCircleOutlined sx={{ fontSize: 14 }} />
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => rejectHall(h.id)}>
                            <CancelOutlined sx={{ fontSize: 14 }} />
                          </button>
                        </>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => deleteHall(h.id)}>
                        <DeleteOutlineOutlined sx={{ fontSize: 14 }} />
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
