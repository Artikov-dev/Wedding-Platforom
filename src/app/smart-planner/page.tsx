'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { hallsService } from '@/services/api.service';
import { Hall } from '@/types';
import { formatPrice } from '@/lib/utils';
import { 
  CalculateOutlined, 
  GroupOutlined, 
  MonetizationOnOutlined, 
  LocationOnOutlined,
  CheckCircleOutlineOutlined
} from '@mui/icons-material';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=70';

export default function SmartPlannerPage() {
  const [budget, setBudget] = useState('');
  const [guests, setGuests] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ hall: Hall; totalCost: number; remaining: number }[] | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget || !guests) return;
    
    setLoading(true);
    try {
      // In a real app, this might be a specialized backend route. 
      // For now, we fetch all approved halls and calculate locally.
      const res = await hallsService.search({ limit: 100, city: city || undefined });
      const halls = res.data.data?.halls || [];
      
      const parsedBudget = parseInt(budget.replace(/\D/g, ''));
      const parsedGuests = parseInt(guests);

      const matched = halls
        .filter(h => h.capacity >= parsedGuests) // Must fit the guests
        .map(h => {
          const totalCost = h.pricePerPlate * parsedGuests;
          return { hall: h, totalCost, remaining: parsedBudget - totalCost };
        })
        .filter(match => match.remaining >= 0) // Must fit the budget
        .sort((a, b) => a.totalCost - b.totalCost); // Sort by cheapest to most expensive

      setResults(matched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatInputPrice = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    return parseInt(numbers).toLocaleString('uz-UZ');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', paddingBottom: 'var(--s-16)', fontFamily: 'var(--font-body)' }}>
      {/* Premium Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #722F37 0%, #4a1c22 100%)', 
        color: 'white', 
        padding: '100px 0 160px', 
        textAlign: 'center', 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto', padding: '0 var(--s-4)' }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
            width: 80, height: 80, background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)', borderRadius: '24px', marginBottom: 'var(--s-6)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <CalculateOutlined sx={{ fontSize: 40, color: '#F8E8D4' }} />
          </div>
          <h1 style={{ 
            fontSize: '3.5rem', marginBottom: 'var(--s-4)', fontFamily: 'var(--font-display)', 
            fontWeight: 800, letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' 
          }}>
            Aqlli Byudjet <span style={{ color: '#F8E8D4' }}>Planner</span>
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
            To&apos;yingiz uchun byudjetingiz qancha? Sun&apos;iy intellekt sizning mablag&apos;ingizga eng mos tushadigan to&apos;yxonalarni bir soniyada hisoblab topadi.
          </p>
        </div>
        
        {/* Animated decorative blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to top, #FAFAFA, transparent)' }} />
      </div>

      <div className="container" style={{ marginTop: '-100px', position: 'relative', zIndex: 10, maxWidth: 1000 }}>
        {/* Glassmorphic Form Card */}
        <form 
          onSubmit={handleCalculate} 
          className="fade-in" 
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: 'var(--s-8)', 
            marginBottom: 'var(--s-10)', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.5)',
            display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: 'var(--s-6)', alignItems: 'center' 
          }}
        >
          <div className="modern-input-group">
            <label><MonetizationOnOutlined sx={{ fontSize: 18 }} /> Jami Byudjetingiz</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                placeholder="0" 
                value={budget} 
                onChange={e => setBudget(formatInputPrice(e.target.value))}
                required
                className="giant-input"
              />
              <span className="currency-label">so&apos;m</span>
            </div>
          </div>

          <div className="modern-input-group">
            <label><GroupOutlined sx={{ fontSize: 18 }} /> Mehmonlar soni</label>
            <div className="input-wrapper">
              <input 
                type="number" 
                placeholder="0" 
                value={guests} 
                onChange={e => setGuests(e.target.value)}
                required
                className="giant-input"
              />
              <span className="currency-label">kishi</span>
            </div>
          </div>

          <div className="modern-input-group">
            <label><LocationOnOutlined sx={{ fontSize: 18 }} /> Manzil (ixtiyoriy)</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                placeholder="Shahar / Tuman" 
                value={city} 
                onChange={e => setCity(e.target.value)}
                className="giant-input text-input"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: 'var(--burgundy)', color: 'white', border: 'none', 
              height: 64, width: 64, borderRadius: '20px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 20px rgba(114,47,55,0.3)', transition: 'all 0.3s ease'
            }}
            className="hover-scale"
          >
            {loading ? <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : <CalculateOutlined sx={{ fontSize: 32 }} />}
          </button>
        </form>

        {/* Results */}
        {results && (
          <div className="fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--s-6)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Natijalar <span className="badge badge-success" style={{ fontSize: '1rem' }}>{results.length} ta mos keldi</span>
            </h2>

            {results.length === 0 ? (
              <div className="card" style={{ padding: 'var(--s-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CalculateOutlined sx={{ fontSize: 64, color: 'var(--border)', marginBottom: 'var(--s-4)' }} />
                <h3>Kechirasiz, ushbu byudjetga mos to&apos;yxona topilmadi</h3>
                <p>Mablag&apos;ni ko&apos;paytirib yoki mehmonlar sonini kamaytirib ko&apos;ring</p>
              </div>
            ) : (
              <div className="grid grid-3">
                {results.map((match, i) => {
                  const h = match.hall;
                  const imgSrc = (h.imageUrl && !h.imageUrl.includes('example.com')) ? h.imageUrl : FALLBACK_IMG;
                  return (
                    <div key={h.id} style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', background: 'var(--surface)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)', transition: 'transform 0.2s', position: 'relative' }}>
                      {i === 0 && (
                        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: 'var(--success)', color: 'white', padding: '4px 10px', borderRadius: 'var(--r-full)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircleOutlineOutlined sx={{ fontSize: 14 }} /> Eng maqbul
                        </div>
                      )}
                      <div style={{ position: 'relative', height: 180 }}>
                        <Image src={imgSrc} alt={h.name} fill style={{ objectFit: 'cover' }} unoptimized />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: 'var(--s-4)', color: 'white' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{h.name}</h4>
                          <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.8 }}>{h.city || 'Toshkent'}</p>
                        </div>
                      </div>
                      <div style={{ padding: 'var(--s-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s-2)', fontSize: '0.9rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Kishi boshiga:</span>
                          <span style={{ fontWeight: 600 }}>{formatPrice(h.pricePerPlate)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s-4)', fontSize: '0.9rem', paddingBottom: 'var(--s-3)', borderBottom: '1px dashed var(--border)' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Umumiy sarf:</span>
                          <span style={{ fontWeight: 700, color: 'var(--burgundy)' }}>{formatPrice(match.totalCost)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, textTransform: 'uppercase' }}>Ortib qoladigan pul</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)' }}>{formatPrice(match.remaining)}</div>
                          </div>
                          <Link href={`/halls/${h.id}`} className="btn btn-sm btn-outline">Batafsil</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.6;
          z-index: 1;
          animation: float 10s ease-in-out infinite alternate;
        }
        .blob-1 {
          width: 400px; height: 400px;
          background: #8e3a45;
          top: -100px; left: -100px;
        }
        .blob-2 {
          width: 500px; height: 500px;
          background: #592229;
          bottom: -200px; right: -100px;
          animation-delay: -5s;
        }
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 50px) scale(1.1); }
        }

        .modern-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .modern-input-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .input-wrapper {
          display: flex;
          align-items: baseline;
          border-bottom: 2px solid #eaeaea;
          padding-bottom: 4px;
          transition: border-color 0.3s ease;
        }
        .input-wrapper:focus-within {
          border-bottom-color: var(--burgundy);
        }
        .giant-input {
          border: none;
          background: transparent;
          font-size: 2rem;
          font-weight: 800;
          font-family: var(--font-display);
          color: var(--burgundy);
          width: 100%;
          outline: none;
          padding: 0;
        }
        .giant-input::placeholder {
          color: #dcdcdc;
        }
        .giant-input.text-input {
          font-size: 1.5rem;
          color: var(--text-main);
        }
        .currency-label {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-left: 8px;
        }
        .hover-scale:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 15px 25px rgba(114,47,55,0.4) !important;
        }

        @media (max-width: 900px) {
          form.fade-in { grid-template-columns: 1fr; gap: var(--s-6); border-radius: 16px; padding: var(--s-6); }
          .giant-input { font-size: 1.5rem; }
          .modern-input-group { border-bottom: 1px dashed #eaeaea; padding-bottom: 16px; }
          .modern-input-group:last-of-type { border-bottom: none; }
          button[type="submit"] { width: 100% !important; border-radius: 12px !important; }
        }
      `}</style>
    </div>
  );
}
