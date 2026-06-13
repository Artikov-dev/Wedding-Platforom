'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import api from '@/lib/api';

// Web Audio API for a professional "Apple/iOS Double Chime" sound
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    
    // Ping 1 (C6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.50, ctx.currentTime); 
    gain1.gain.setValueAtTime(0.4, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc1.connect(gain1); gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.4);
    
    // Ping 2 (E6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.15); 
    gain2.gain.setValueAtTime(0.6, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15); osc2.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.error("Audio play failed:", e);
  }
};

export function NotificationManager() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const previousUnreadCountRef = useRef<number>(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Only poll if user is logged in
    if (!user) return;

    const checkNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await api.get('/api/notifications?isRead=false&limit=1');

        const currentUnread = res.data?.data?.unreadCount || 0;

        if (!isFirstRender.current) {
          // If unread count went up, it means a new notification arrived
          if (currentUnread > previousUnreadCountRef.current) {
            playNotificationSound();
            const message = res.data?.data?.notifications?.[0]?.message || 'Sizda yangi xabarnoma mavjud!';
            showToast(message, 'live_notification' as any);
          }
        } else {
          isFirstRender.current = false;
        }

        previousUnreadCountRef.current = currentUnread;
      } catch (err) {
        // Silently fail polling
      }
    };

    // Initial check
    checkNotifications();

    // Poll every 10 seconds
    const interval = setInterval(checkNotifications, 10000);

    return () => clearInterval(interval);
  }, [user, showToast]);

  // This is a hidden logic component, renders nothing
  return null;
}
