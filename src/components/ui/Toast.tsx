'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'live_notification';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" style={{ zIndex: 99999 }}>
        {toasts.map((t) => {
          if (t.type === 'live_notification') {
            return (
              <div key={t.id} className="toast" style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                color: '#333',
                padding: '16px 20px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transform: 'translateY(0)',
                animation: 'slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #FFD700, #FDB931)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(253, 185, 49, 0.4)',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '20px' }}>🔔</span>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#111', fontWeight: 700 }}>Yangi Xabarnoma!</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#555', lineHeight: 1.4 }}>{t.message}</p>
                </div>
              </div>
            );
          }

          return (
            <div key={t.id} className={`toast toast-${t.type}`}>
              {t.type === 'success' && '✓ '}
              {t.type === 'error' && '✕ '}
              {t.type === 'info' && 'ℹ '}
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
