'use client';

import React from 'react';
import Link from 'next/link';
import { Hall } from '@/types';
import { formatPrice } from '@/lib/utils';

interface HallCardProps {
  hall: Hall;
  linkPrefix?: string;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function HallCard({ hall, linkPrefix = '/halls', showActions, onApprove, onDelete }: HallCardProps) {
  return (
    <div className="venue-card">
      <div className="venue-card-img">
        {hall.imageUrl ? (
          <img src={hall.imageUrl} alt={hall.name} />
        ) : (
          <div className="img-placeholder">
            <span className="img-placeholder-icon">🏛️</span>
            <span>Premium Wedding Hall</span>
          </div>
        )}
        {hall.status && hall.status !== 'APPROVED' && (
          <div className="venue-card-badge">Yangi</div>
        )}
        <button className="venue-card-fav" aria-label="Sevimli">🤍</button>
      </div>
      <div className="venue-card-content">
        <h3 className="venue-card-name">{hall.name}</h3>
        <div className="venue-card-location">📍 {hall.city || hall.address || 'Toshkent'}</div>
        <div className="venue-card-meta">
          <span className="venue-card-meta-item">👥 {hall.capacity} kishi</span>
          {hall.rating && <span className="venue-card-meta-item">⭐ {hall.rating.toFixed(1)}</span>}
        </div>
        {hall.description && (
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 'var(--s-4)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {hall.description}
          </p>
        )}
        <div className="venue-card-divider" />
        <div className="venue-card-footer">
          <div className="venue-card-price">
            <span className="venue-card-price-value">{formatPrice(hall.pricePerPlate)}</span>
            <span className="venue-card-price-label">1 kishi uchun</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {showActions && hall.status !== 'APPROVED' && onApprove && (
              <button className="btn btn-sm btn-secondary" onClick={(e) => { e.preventDefault(); onApprove(hall.id); }}>✓</button>
            )}
            {showActions && onDelete && (
              <button className="btn btn-sm btn-danger" onClick={(e) => { e.preventDefault(); onDelete(hall.id); }}>🗑</button>
            )}
            <Link href={`${linkPrefix}/${hall.id}`} className="btn btn-sm btn-primary">
              Batafsil →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
