'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HallCard from '@/components/shared/HallCard';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Favorite } from '@/types';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => { fetchFavorites(); }, []);
  const fetchFavorites = async () => {
    try { const res = await api.get('/api/favorites'); setFavorites(Array.isArray(res.data.data) ? res.data.data : []); }
    catch { setFavorites([]); } finally { setLoading(false); }
  };

  const removeFavorite = async (hallId: string) => {
    try { await api.delete(`/api/favorites/${hallId}`); showToast("Sevimlilardan o'chirildi"); fetchFavorites(); }
    catch { showToast('Xatolik yuz berdi', 'error'); }
  };

  return (
    <>
      <Header />
      <div style={{ paddingTop: 'var(--header-h)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--cream) 0%, var(--cream-deep) 100%)', padding: 'var(--s-12) 0', textAlign: 'center' }}>
          <div className="container">
            <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--gold)', fontSize: '1.1rem' }}>✦ Tanlangan joylar</span>
            <h1 style={{ marginTop: 'var(--s-2)' }}>Sevimli to&apos;yxonalar</h1>
          </div>
        </div>
        <div className="container" style={{ padding: 'var(--s-10) var(--s-8) var(--s-16)' }}>
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-3">
              {favorites.map(fav => fav.hall && (
                <div key={fav.id} style={{ position: 'relative' }}>
                  <HallCard hall={fav.hall} />
                  <button className="btn btn-sm btn-danger" style={{ position: 'absolute', top: 14, right: 14, zIndex: 5, borderRadius: 'var(--r-full)', width: 36, height: 36, padding: 0 }} onClick={() => removeFavorite(fav.hallId)}>✕</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">❤️</div>
              <h3>Sevimlilar bo&apos;sh</h3>
              <p style={{ marginBottom: 'var(--s-6)' }}>To&apos;yxona sahifasida 🤍 tugmasini bosing</p>
              <a href="/halls" className="btn btn-primary">To&apos;yxonalarni ko&apos;rish</a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
