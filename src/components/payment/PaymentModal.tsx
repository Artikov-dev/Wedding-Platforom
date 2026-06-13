'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
  isProcessingOverride?: boolean; // For when the parent is processing the actual API
}

export default function PaymentModal({ isOpen, onClose, amount, onSuccess, isProcessingOverride }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState<'uzcard' | 'humo' | 'visa' | 'unknown'>('unknown');
  
  const [step, setStep] = useState<'input' | 'processing' | 'sms' | 'success'>('input');
  const [smsCode, setSmsCode] = useState('');
  const [error, setError] = useState('');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setSmsCode('');
      setError('');
    }
  }, [isOpen]);

  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format card number with spaces every 4 digits
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('8600')) setCardType('uzcard');
    else if (val.startsWith('9860')) setCardType('humo');
    else if (val.startsWith('4')) setCardType('visa');
    else setCardType('unknown');

    let formatted = '';
    for (let i = 0; i < val.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += val[i];
    }
    setCardNumber(formatted.slice(0, 19));
  };

  const handleExpiryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4);
    }
    setExpiry(val);
  };

  const handlePayClick = () => {
    if (cardNumber.length < 19 || expiry.length < 5) {
      setError('Karta ma\'lumotlari to\'liq emas');
      return;
    }
    setError('');
    setStep('processing');
    
    // Simulate API delay
    setTimeout(() => {
      setStep('sms');
    }, 1500);
  };

  const handleSmsSubmit = () => {
    if (smsCode.length < 5) {
      setError('Kod 5 xonali bo\'lishi kerak');
      return;
    }
    setError('');
    setStep('processing');
    
    // Simulate SMS verification
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: 400, padding: 0, overflow: 'hidden', borderRadius: 24 }}>
        
        {/* Header */}
        <div style={{ background: 'var(--bg-light)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
            <CreditCard size={20} />
            To&apos;lov qilish
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          
          {/* Amount Display */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>To&apos;lov summasi</p>
            <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--burgundy)', fontFamily: 'var(--font-display)' }}>
              {formatPrice(amount)}
            </h2>
          </div>

          {(step === 'input' || (step === 'processing' && !isProcessingOverride)) && (
            <div className="fade-in">
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Karta raqami
                </label>
                <input 
                  type="text" 
                  value={cardNumber}
                  onChange={handleCardInput}
                  placeholder="0000 0000 0000 0000"
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '1px', paddingRight: 50 }}
                  disabled={step === 'processing'}
                />
                <div style={{ position: 'absolute', right: 12, top: 38 }}>
                  {cardType === 'uzcard' && <div style={{ background: '#00529A', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 'bold' }}>UZCARD</div>}
                  {cardType === 'humo' && <div style={{ background: '#FFC000', color: '#1a1a1a', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 'bold' }}>HUMO</div>}
                  {cardType === 'visa' && <div style={{ background: '#1A1F71', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 'bold' }}>VISA</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Amal qilish muddati
                  </label>
                  <input 
                    type="text" 
                    value={expiry}
                    onChange={handleExpiryInput}
                    placeholder="AA/YY"
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontSize: '1.1rem', textAlign: 'center' }}
                    disabled={step === 'processing'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    CVV (ixtiyoriy)
                  </label>
                  <input 
                    type="password" 
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="***"
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontSize: '1.1rem', textAlign: 'center' }}
                    disabled={step === 'processing'}
                  />
                </div>
              </div>

              {error && <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: 16, textAlign: 'center' }}>{error}</div>}

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', height: 50, fontSize: '1.1rem' }}
                onClick={handlePayClick}
                disabled={step === 'processing'}
              >
                {step === 'processing' ? <span className="spinner" /> : 'To\'lash'}
              </button>
            </div>
          )}

          {step === 'sms' && (
            <div className="fade-in" style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: 'var(--bg-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <ShieldCheck size={32} color="var(--primary)" />
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>Tasdiqlash kodi</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
                Telefon raqamingizga yuborilgan 5 xonali SMS kodni kiriting
              </p>
              
              <input 
                type="text" 
                value={smsCode}
                onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="12345"
                className="form-input"
                style={{ fontFamily: 'monospace', fontSize: '2rem', textAlign: 'center', letterSpacing: '8px', marginBottom: 16 }}
              />

              {error && <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: 16 }}>{error}</div>}

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', height: 50, fontSize: '1.1rem' }}
                onClick={handleSmsSubmit}
              >
                Tasdiqlash
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 80, height: 80, background: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--success)' }}>To&apos;lov muvaffaqiyatli!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Broningiz tasdiqlanmoqda...</p>
            </div>
          )}
          
          {(step === 'input' && isProcessingOverride) && (
            <div className="fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
               <span className="spinner" style={{ width: 40, height: 40, borderWidth: 4, borderColor: 'var(--border)', borderTopColor: 'var(--burgundy)' }} />
               <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Tizimga yozilmoqda...</p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <ShieldCheck size={14} /> Barcha to&apos;lovlar himoyalangan
          </div>
        </div>
      </div>
    </div>
  );
}
