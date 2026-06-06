'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Hall } from '@/types';
import { formatPrice, DISTRICTS } from '@/lib/utils';

export default function AdminHallsPage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [view, setView] = useState<'table' | 'card'>('table');
  const { showToast } = useToast();

  const fetchHalls = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { limit: 100 };
      if (city) params.city = city;
      const res = await api.get('/api/halls/search', { params });
      const d = res.data.data;
      setHalls(Array.isArray(d) ? d : d?.halls || []);
    } catch { setHalls([]); }
    finally { setLoading(false); }
  }, [city]);

  useEffect(() => { fetchHalls(); }, [fetchHalls]);

  const approveHall = async (id: string) => {
    try { await api.put(`/api/halls/${id}`, { status: 'APPROVED' }); showToast('Tasdiqlandi!'); fetchHalls(); }
    catch { showToast('Xatolik', 'error'); }
  };

  const deleteHall = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try { await api.delete(`/api/halls/${id}`); showToast("O'chirildi"); fetchHalls(); }
    catch { showToast('Xatolik', 'error'); }
  };

  const filtered = search ? halls.filter(h => h.name.toLowerCase().includes(search.toLowerCase())) : halls;

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>To&apos;yxonalar</h1>
        <div className="flex">
          <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('table')}>📋 Jadval</button>
          <button className={`btn btn-sm ${view === 'card' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('card')}>🔲 Kartalar</button>
          <Link href="/admin/halls/create" className="btn btn-primary">➕ Yangi qo&apos;shish</Link>
        </div>
      </div>

      <div className="filters-bar">
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Qidiruv</label>
          <input className="form-input" placeholder="Nomi bo'yicha..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Rayon</label>
          <select className="form-select" value={city} onChange={e => setCity(e.target.value)}>
            <option value="">Barchasi</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : view === 'table' ? (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Nomi</th><th>Rayon</th><th>Sig&apos;im</th><th>Narx</th><th>Status</th><th>Amallar</th></tr></thead>
            <tbody>
              {filtered.map(h => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 600 }}>{h.name}</td>
                  <td>{h.city || '—'}</td>
                  <td>{h.capacity}</td>
                  <td>{formatPrice(h.pricePerPlate)}</td>
                  <td><span className={`badge ${h.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>{h.status === 'APPROVED' ? 'Tasdiqlangan' : 'Tasdiqlanmagan'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Link href={`/admin/halls/${h.id}`} className="btn btn-sm btn-ghost">👁</Link>
                      {h.status !== 'APPROVED' && <button className="btn btn-sm btn-secondary" onClick={() => approveHall(h.id)}>✓</button>}
                      <button className="btn btn-sm btn-danger" onClick={() => deleteHall(h.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>To&apos;yxona topilmadi</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-3">
          {filtered.map(h => (
            <div key={h.id} className="hall-card">
              <div className="hall-card-image">{h.imageUrl ? <img src={h.imageUrl} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏛️'}</div>
              <div className="hall-card-body">
                <h4 className="hall-card-name">{h.name}</h4>
                <div className="hall-card-location">📍 {h.city || 'Toshkent'}</div>
                <div className="hall-card-details">
                  <span className="hall-card-price">{formatPrice(h.pricePerPlate)}</span>
                  <span className="hall-card-capacity">👥 {h.capacity}</span>
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '4px' }}>
                  <Link href={`/admin/halls/${h.id}`} className="btn btn-sm btn-outline" style={{ flex: 1 }}>Ko&apos;rish</Link>
                  {h.status !== 'APPROVED' && <button className="btn btn-sm btn-secondary" onClick={() => approveHall(h.id)}>✓</button>}
                  <button className="btn btn-sm btn-danger" onClick={() => deleteHall(h.id)}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
