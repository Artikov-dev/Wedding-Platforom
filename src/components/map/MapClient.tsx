'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { hallsService } from '@/services/api.service';
import { Hall } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Star, LocationOn, GpsFixed, DirectionsCar } from '@mui/icons-material';
import dynamic from 'next/dynamic';
import MarkerClusterGroup from 'react-leaflet-cluster';

const Pannellum = dynamic(() => import('pannellum-react').then(mod => mod.Pannellum), { ssr: false });
const PannellumViewer = Pannellum as any;

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Create a custom modern pin icon without price
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background: var(--burgundy);
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: -2px 2px 6px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: dropIn 0.5s cubic-bezier(0.2, 1.2, 0.3, 1) forwards;
    ">
      <div style="transform: rotate(45deg); width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const HallPopup = ({ hall, userLocation, onRoute }: { hall: Hall, userLocation: [number, number] | null, onRoute: (coords: [number, number]) => void }) => {
  const [show360, setShow360] = useState(false);
  const coords = (hall as any).coords;
  let distanceStr = null;
  if (userLocation && coords) {
    const dist = getDistance(userLocation[0], userLocation[1], coords[0], coords[1]);
    distanceStr = dist.toFixed(1) + ' km';
  }

  return (
    <div style={{ width: 260, padding: 0 }}>
      <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
        {show360 ? (
          <div style={{ width: '100%', height: '100%', cursor: 'grab' }}>
            <PannellumViewer
              width="100%"
              height="100%"
              image="/360-demo.jpg"
              pitch={10}
              yaw={180}
              hfov={110}
              autoLoad
              showZoomCtrl={false}
              mouseZoom={false}
            />
          </div>
        ) : (
          <Image 
            src={(hall.imageUrl && !hall.imageUrl.includes('example.com')) ? hall.imageUrl : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=70'}
            alt={hall.name}
            fill
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        )}

        <button 
          onClick={(e) => { e.preventDefault(); setShow360(!show360); }}
          style={{ position: 'absolute', top: 8, left: 8, background: show360 ? 'var(--burgundy)' : 'rgba(255,255,255,0.9)', color: show360 ? '#fff' : 'var(--text)', border: 'none', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', zIndex: 1000, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
        >
          🥽 {show360 ? "Rasmlar" : "360° Tur"}
        </button>
      </div>
      <div style={{ padding: '16px' }}>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{hall.name}</h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>
          <div><LocationOn sx={{ fontSize: 16, color: 'var(--text-muted)', verticalAlign: 'middle', mt: -0.5 }} /> {hall.city || 'Toshkent'}</div>
          {distanceStr && <div style={{ fontWeight: 600, color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>📍 {distanceStr}</div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Kishi boshiga</span>
            <span style={{ fontWeight: 800, color: 'var(--burgundy)', fontSize: '1.2rem' }}>{formatPrice(hall.pricePerPlate)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', fontSize: '0.95rem', fontWeight: 800, background: '#fffbeb', padding: '4px 8px', borderRadius: '8px', border: '1px solid #fde68a' }}>
            <Star sx={{ fontSize: 16, mr: 0.5 }} /> {hall.rating || '4.8'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Link href={`/halls/${hall.id}`} style={{ flex: 1, display: 'block', background: 'var(--text-main)', color: 'white', textAlign: 'center', padding: '10px 0', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem', transition: 'background 0.2s', border: 'none' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--burgundy)'} onMouseOut={(e) => e.currentTarget.style.background = 'var(--text-main)'}>
            Batafsil
          </Link>
          {coords && (
            <button onClick={(e) => { e.preventDefault(); onRoute(coords); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0f2fe', color: '#0369a1', padding: '0 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} title="Xaritada chizish">
              <DirectionsCar sx={{ fontSize: 20 }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);

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

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      setLocating(false);
    }, () => {
      setLocating(false);
      alert("Joylashuvni aniqlashga ruxsat berilmadi yoki xatolik yuz berdi.");
    });
  };

  const filteredHalls = halls.filter(h => {
    if (filter === 'cheap') return h.pricePerPlate <= 150000;
    if (filter === 'large') return h.capacity >= 500;
    if (filter === 'top') return (h.rating || 0) >= 4.8;
    return true;
  });

  const handleRoute = async (destCoords: [number, number]) => {
    if (!userLocation) {
      alert("Marshrut chizish uchun oldin 'Mening joylashuvim' tugmasini bosing!");
      return;
    }
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
        setRouteCoords(route);
      }
    } catch (err) {
      console.error('Route error:', err);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 70px)', width: '100%', position: 'relative' }}>
      
      {/* Glassmorphism Map Overlays */}
      <div style={{ 
        position: 'absolute', 
        top: 24, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 1000, 
        display: 'flex', 
        gap: 8, 
        padding: '8px', 
        background: 'rgba(255, 255, 255, 0.7)', 
        backdropFilter: 'blur(16px)', 
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '100px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255,255,255,0.4)',
        width: 'max-content',
        maxWidth: '90vw',
        overflowX: 'auto'
      }}>
        {[
          { id: 'all', label: 'Barchasi' },
          { id: 'cheap', label: '💰 < 150 ming' },
          { id: 'large', label: '👥 500+ o\'rin' },
          { id: 'top', label: '⭐ Top' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              background: filter === f.id ? 'var(--burgundy)' : 'transparent',
              color: filter === f.id ? 'white' : 'var(--text-main)',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '100px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: filter === f.id ? '0 4px 12px rgba(114, 47, 55, 0.3)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleLocate}
        disabled={locating}
        className="gps-btn"
        style={{
          position: 'absolute',
          bottom: 30,
          right: 30,
          zIndex: 1000,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: locating ? '#f1f5f9' : 'white',
          color: locating ? '#94a3b8' : 'var(--burgundy)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: locating ? 'wait' : 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        title="Mening joylashuvim"
      >
        <GpsFixed sx={{ fontSize: 28, animation: locating ? 'pulse 1.5s infinite' : 'none' }} />
      </button>

      <MapContainer 
        center={TASHKENT_CENTER} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {userLocation && (
          <Marker 
            position={userLocation}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(59,130,246,0.6);"></div>`
            })}
          >
            <Popup>Sizning joylashuvingiz</Popup>
          </Marker>
        )}

        {routeCoords && (
          <Polyline positions={routeCoords} color="#3b82f6" weight={5} opacity={0.8} />
        )}

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={40}
        >
          {filteredHalls.map((hall) => (
            <Marker 
              key={hall.id} 
              position={hall.coords}
              icon={createCustomIcon()}
            >
              <Popup className="custom-popup">
                <HallPopup hall={hall} userLocation={userLocation} onRoute={handleRoute} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Global styles for Leaflet popups and custom UI */}
      <style>{`
        .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .leaflet-popup-content {
          margin: 0;
          width: 260px !important;
        }
        .leaflet-popup-tip {
          box-shadow: none;
          background: white;
        }
        .custom-map-marker {
          background: transparent;
          border: none;
        }
        .user-location-marker {
          background: transparent;
          border: none;
          animation: pulseMarker 2s infinite;
        }
        .gps-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 28px rgba(0,0,0,0.15) !important;
        }
        
        /* Premium Marker Clustering Styles */
        .marker-cluster {
          background-clip: padding-box;
          border-radius: 20px;
        }
        .marker-cluster div {
          width: 36px;
          height: 36px;
          margin-left: 2px;
          margin-top: 2px;
          text-align: center;
          border-radius: 18px;
          font-weight: 800;
          color: white;
          background-color: var(--burgundy);
          box-shadow: 0 0 0 4px rgba(114, 47, 55, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.3s;
        }
        .marker-cluster:hover div {
          transform: scale(1.1);
          box-shadow: 0 0 0 6px rgba(114, 47, 55, 0.4);
        }

        /* Leaflet Controls reset */
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.5) !important;
          backdrop-filter: blur(4px);
          border-top-left-radius: 8px;
        }

        @keyframes dropIn {
          0% { transform: translateY(-30px) rotate(-45deg); opacity: 0; }
          100% { transform: translateY(0) rotate(-45deg); opacity: 1; }
        }
        @keyframes pulseMarker {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.6); }
          70% { box-shadow: 0 0 0 15px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
