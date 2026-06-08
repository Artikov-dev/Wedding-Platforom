'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HallCard from '@/components/shared/HallCard';
import { hallsService, favoritesService } from '@/services/api.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Hall } from '@/types';
import { DISTRICTS, HALL_CATEGORIES } from '@/lib/utils';

function HallsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [halls, setHalls] = useState<Hall[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const fetchHalls = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 9 };
      if (search) params.search = search;
      if (city) params.city = city;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await hallsService.search(params);
      const d = res.data.data;
      if (d?.halls) {
        setHalls(d.halls);
        setTotalPages(d.pagination?.pages || Math.ceil((d.pagination?.total || d.halls.length) / 9) || 1);
      } else {
        setHalls([]);
      }
    } catch { setHalls([]); }
    finally { setLoading(false); }
  }, [page, search, city, category, minPrice, maxPrice]);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await favoritesService.list();
      const list = Array.isArray(res.data.data) ? res.data.data : [];
      setFavoriteIds(new Set(list.map((f: { hallId?: string; id: string }) => f.hallId || f.id)));
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => { fetchHalls(); }, [fetchHalls]);
  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const toggleFavorite = async (hallId: string) => {
    if (!isAuthenticated) { showToast('Avval tizimga kiring', 'error'); return; }
    const isFav = favoriteIds.has(hallId);
    try {
      if (isFav) {
        await favoritesService.remove(hallId);
        setFavoriteIds(prev => { const s = new Set(prev); s.delete(hallId); return s; });
        showToast("Sevimlilardan o'chirildi");
      } else {
        await favoritesService.add(hallId);
        setFavoriteIds(prev => new Set([...prev, hallId]));
        showToast("Sevimlilarga qo'shildi ❤️");
      }
    } catch { showToast('Xatolik yuz berdi', 'error'); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchHalls(); };

  return (
    <>
      <Header />
      <div style={{ paddingTop: 'var(--header-h)' }}>
        {/* Page Hero */}
        <div style={{
          background: 'linear-gradient(135deg, var(--cream) 0%, var(--cream-deep) 100%)',
          padding: 'var(--s-16) 0 var(--s-12)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-40%', right: '-15%', width: '50%', height: '180%', background: 'radial-gradient(ellipse, rgba(212,165,116,0.08) 0%, transparent 60%)' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--gold)', fontSize: '1.15rem' }}>✦ Eng yaxshi tanlov</span>
            <h1 style={{ marginTop: 'var(--s-2)', marginBottom: 'var(--s-3)' }}>To&apos;yxonalar</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto' }}>
              Toshkentdagi barcha to&apos;yxonalarni ko&apos;ring va o&apos;zingizga mosini tanlang
            </p>
          </div>
        </div>

        <div className="container" style={{ padding: 'var(--s-10) var(--s-8) var(--s-16)' }}>
          <div className="filters-bar" style={{ borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-soft)' }}>
            <form onSubmit={handleSearch} style={{ display: 'contents' }}>
              <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
                <label className="form-label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Qidiruv
                </label>
                <input className="form-input" placeholder="To'yxona nomi..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Rayon</label>
                <select className="form-select" value={city} onChange={e => setCity(e.target.value)}>
                  <option value="">Barchasi</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Kategoriya</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">Barchasi</option>
                  {HALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Min narx</label>
                <input type="number" className="form-input" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Max narx</label>
                <input type="number" className="form-input" placeholder="999 999" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                <label className="form-label">&nbsp;</label>
                <button type="submit" className="btn btn-primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Qidirish
                </button>
              </div>
            </form>
          </div>

          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : halls.length > 0 ? (
            <>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--s-6)', fontSize: '0.9rem' }}>
                {halls.length} ta to&apos;yxona topildi
              </p>
              <div className="grid grid-3">
                {halls.map(hall => (
                  <HallCard
                    key={hall.id}
                    hall={hall}
                    isFavorite={favoriteIds.has(hall.id)}
                    onFavoriteToggle={toggleFavorite}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button className="pagination-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i + 1} className={`pagination-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="pagination-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>To&apos;yxona topilmadi</h3>
              <p>Filterlarni o&apos;zgartirib qaytadan qidiring</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function HallsPage() {
  return <Suspense fallback={<div className="loading-page"><div className="spinner" /></div>}><HallsContent /></Suspense>;
}
