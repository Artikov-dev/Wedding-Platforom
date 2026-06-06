'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HallCard from '@/components/shared/HallCard';
import api from '@/lib/api';
import { Hall } from '@/types';
import { DISTRICTS, HALL_CATEGORIES } from '@/lib/utils';

function HallsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHalls = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 9 };
      if (search) params.search = search;
      if (city) params.city = city;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await api.get('/api/halls/search', { params });
      const data = res.data.data;
      if (Array.isArray(data)) { setHalls(data); setTotalPages(Math.ceil(data.length / 9) || 1); }
      else if (data?.halls) { setHalls(data.halls); setTotalPages(data.totalPages || 1); }
      else { setHalls([]); }
    } catch { setHalls([]); }
    finally { setLoading(false); }
  }, [page, search, city, category, minPrice, maxPrice]);

  useEffect(() => { fetchHalls(); }, [fetchHalls]);

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
          <div style={{
            position: 'absolute', top: '-40%', right: '-15%', width: '50%', height: '180%',
            background: 'radial-gradient(ellipse, rgba(212,165,116,0.08) 0%, transparent 60%)',
          }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--gold)', fontSize: '1.15rem' }}>
              ✦ Eng yaxshi tanlov
            </span>
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
                <label className="form-label">Qidiruv</label>
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
                <button type="submit" className="btn btn-primary">🔍 Qidirish</button>
              </div>
            </form>
          </div>

          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : halls.length > 0 ? (
            <>
              <div className="grid grid-3">
                {halls.map(hall => <HallCard key={hall.id} hall={hall} />)}
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
