'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import api from '@/lib/api';

// Web Audio API for a professional "Ding" sound
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    // Frequency for a pleasant bell/ding sound
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5); // A4

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1);
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
            showToast('Yangi bildirishnoma! Qayta yuklang yoki tekshiring.', 'success');
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
