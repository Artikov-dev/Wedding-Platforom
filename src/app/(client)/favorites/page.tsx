'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HallCard from '@/components/shared/HallCard';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { Favorite } from '@/types';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => { if (isAuthenticated) fetchFavorites(); else setLoading(false); }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/api/favorites');
      const d = res.data.data;
      const list = Array.isArray(d) ? d : d?.favorites || [];
      // Backend returns hall fields directly (not nested under .hall)
      // Normalize: if item has 'name' but no 'hall', wrap it
      const normalized = list.map((item: Record<string, unknown>) => {
        if (item.hall) return item;
        if (item.name) {
          return { id: item.id, hallId: item.id, userId: item.userId, hall: item };
        }
        return item;
      });
      setFavorites(normalized);
    } catch { setFavorites([]); }
    finally { setLoading(false); }
  };

  const removeFavorite = async (hallId: string) => {
    try {
      await api.delete(`/api/favorites/${hallId}`);
      showToast("Sevimlilardan o'chirildi");
      setFavorites(prev => prev.filter(f => (f.hallId || f.id) !== hallId));
    } catch { showToast('Xatolik yuz berdi', 'error'); }
  };

  return (
    <>
      <Header />
      <div style={{ paddingTop: 'var(--header-h)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--cream) 0%, var(--cream-deep) 100%)', padding: 'var(--s-12) 0', textAlign: 'center' }}>
          <div className="container">
            <span style={{ fontFamily: 'var(--font-accent)', color: 'var(--gold)', fontSize: '1.1rem' }}>✦ Tanlangan joylar</span>
            <h1 style={{ marginTop: 'var(--s-2)' }}>Sevimli to&apos;yxonalar</h1>
            {favorites.length > 0 && (
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--s-2)' }}>{favorites.length} ta to&apos;yxona saqlangan</p>
            )}
          </div>
        </div>

        <div className="container" style={{ padding: 'var(--s-10) var(--s-8) var(--s-16)' }}>
          {!isAuthenticated ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔐</div>
              <h3>Tizimga kiring</h3>
              <p style={{ marginBottom: 'var(--s-6)' }}>Sevimlilarni ko&apos;rish uchun tizimga kiring</p>
              <a href="/login" className="btn btn-primary">Kirish</a>
            </div>
          ) : loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-3">
              {favorites.map(fav => fav.hall && (
                <HallCard
                  key={fav.id}
                  hall={fav.hall}
                  isFavorite={true}
                  onFavoriteToggle={() => removeFavorite(fav.hallId)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">❤️</div>
              <h3>Sevimlilar bo&apos;sh</h3>
              <p style={{ marginBottom: 'var(--s-6)' }}>To&apos;yxona sahifasida ❤️ tugmasini bosing</p>
              <a href="/halls" className="btn btn-primary">To&apos;yxonalarni ko&apos;rish</a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
