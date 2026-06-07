'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Hall } from '@/types';
import { formatPrice } from '@/lib/utils';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=75',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=75',
  'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=600&q=75',
  'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=75',
  'https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=600&q=75',
  'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=600&q=75',
];

function getHallImage(hall: Hall): string {
  if (hall.imageUrl && hall.imageUrl.startsWith('http') && !hall.imageUrl.includes('example.com')) {
    return hall.imageUrl;
  }
  const idx = hall.id ? hall.id.charCodeAt(0) % FALLBACK_IMAGES.length : 0;
  return FALLBACK_IMAGES[idx];
}

interface HallCardProps {
  hall: Hall;
  linkPrefix?: string;
  showActions?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onApprove?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function HallCard({
  hall,
  linkPrefix = '/halls',
  showActions,
  isFavorite = false,
  onFavoriteToggle,
  onApprove,
  onDelete,
}: HallCardProps) {
  const imgSrc = getHallImage(hall);
  const isApproved = hall.approvalStatus === 'APPROVED' || hall.status === 'APPROVED';
  const rating = hall.ratings ? Number(hall.ratings) : hall.rating;

  return (
    <div className="venue-card">
      <div className="venue-card-img" style={{ position: 'relative' }}>
        <Image
          src={imgSrc}
          alt={hall.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: 'cover' }}
          unoptimized
        />
        {!isApproved && (
          <div className="venue-card-badge">Yangi</div>
        )}
        {onFavoriteToggle && (
          <button
            className="venue-card-fav"
            aria-label="Sevimli"
            onClick={e => { e.preventDefault(); e.stopPropagation(); onFavoriteToggle(hall.id); }}
            style={{ background: isFavorite ? 'rgba(186,35,67,0.9)' : 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer' }}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}
      </div>
      <div className="venue-card-content">
        <h3 className="venue-card-name">{hall.name}</h3>
        <div className="venue-card-location">
          {/* Location pin icon */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {hall.city || hall.address || 'Toshkent'}
        </div>
        <div className="venue-card-meta">
          <span className="venue-card-meta-item">
            {/* People icon */}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 3 }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {hall.capacity} kishi
          </span>
          {rating && rating > 0 ? (
            <span className="venue-card-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#C49B3C" style={{ marginRight: 3 }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {Number(rating).toFixed(1)}
            </span>
          ) : null}
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
            {showActions && !isApproved && onApprove && (
              <button className="btn btn-sm btn-secondary" onClick={e => { e.preventDefault(); onApprove(hall.id); }} title="Tasdiqlash">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            )}
            {showActions && onDelete && (
              <button className="btn btn-sm btn-danger" onClick={e => { e.preventDefault(); onDelete(hall.id); }} title="O'chirish">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            )}
            <Link href={`${linkPrefix}/${hall.id}`} className="btn btn-sm btn-primary">
              Batafsil
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 4 }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
