'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ExploreOutlined } from '@mui/icons-material';

// Leaflet uses window, so we must load it only on client side
const MapClient = dynamic(() => import('@/components/map/MapClient'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-light)' }}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
    </div>
  )
});

export default function MapPage() {
  return (
    <div style={{ background: 'var(--bg-light)', minHeight: '100vh' }}>
      {/* Header bar */}
      <div style={{ 
        height: '70px', 
        background: 'white', 
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--s-6)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        position: 'relative',
        zIndex: 1000
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontFamily: 'var(--font-display)', 
          color: 'var(--burgundy)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: 0
        }}>
          <ExploreOutlined sx={{ fontSize: 28 }} />
          Xaritadan Qidirish
        </h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
          <a href="/" className="btn btn-outline" style={{ height: 36, padding: '0 16px' }}>Ro&apos;yxatga qaytish</a>
        </div>
      </div>
      
      {/* Map Area */}
      <MapClient />
    </div>
  );
}
