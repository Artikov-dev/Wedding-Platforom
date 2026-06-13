'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { hallsService } from '@/services/api.service';
import { Hall } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Star, LocationOn } from '@mui/icons-material';

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Create a custom modern pin icon
const createCustomIcon = (price: number) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background: var(--burgundy);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      position: relative;
      white-space: nowrap;
      transform: translate(-50%, -100%);
    ">
      ${formatPrice(price).replace(' UZS', '')}
      <div style="
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid var(--burgundy);
      "></div>
    </div>`,
  });
};

const TASHKENT_CENTER: [number, number] = [41.2995, 69.2401];

// Helper to jitter coordinates slightly so pins don't overlap if they have same city
const getCoordinates = (hall: Hall, index: number): [number, number] => {
  // In a real app, hall would have lat/lng. Here we simulate around Tashkent
  const latJitter = (Math.random() - 0.5) * 0.1;
  const lngJitter = (Math.random() - 0.5) * 0.1;
  return [TASHKENT_CENTER[0] + latJitter, TASHKENT_CENTER[1] + lngJitter];
};

export default function MapClient() {
  const [halls, setHalls] = useState<(Hall & { coords: [number, number] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const res = await hallsService.search({ limit: 100 });
        const fetchedHalls = res.data.data?.halls || [];
        
        // Add fake coordinates for simulation
        const withCoords = fetchedHalls.map((h, i) => ({
          ...h,
          coords: getCoordinates(h, i)
        }));
        setHalls(withCoords);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHalls();
  }, []);

  if (loading) {
    return <div className="loading-page"><div className="spinner" /></div>;
  }

  return (
    <div style={{ height: 'calc(100vh - 70px)', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={TASHKENT_CENTER} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {halls.map((hall) => (
          <Marker 
            key={hall.id} 
            position={hall.coords}
            icon={createCustomIcon(hall.pricePerPlate)}
          >
            <Popup className="custom-popup">
              <div style={{ width: 220, padding: 0 }}>
                <div style={{ position: 'relative', width: '100%', height: 140, borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
                  <Image 
                    src={(hall.imageUrl && !hall.imageUrl.includes('example.com')) ? hall.imageUrl : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=70'}
                    alt={hall.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                </div>
                <div style={{ padding: '12px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{hall.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 8 }}>
                    <LocationOn sx={{ fontSize: 14 }} /> {hall.city || 'Toshkent'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, color: 'var(--burgundy)', fontSize: '1.1rem' }}>
                      {formatPrice(hall.pricePerPlate)} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ kishi</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 700 }}>
                      <Star sx={{ fontSize: 16 }} /> {hall.rating || '4.8'}
                    </div>
                  </div>
                  <Link href={`/halls/${hall.id}`} style={{ display: 'block', width: '100%', background: 'var(--burgundy)', color: 'white', textAlign: 'center', padding: '8px 0', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
                    Batafsil
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Global styles for Leaflet popups */}
      <style>{`
        .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 0;
          width: 220px !important;
        }
        .leaflet-popup-tip {
          box-shadow: none;
        }
        .custom-map-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}
