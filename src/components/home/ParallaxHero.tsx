'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Building2, Sparkles, Map, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ParallaxHero() {
  const { isAuthenticated } = useAuth();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Parallax effects
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} style={{
      position: 'relative',
      height: '100vh',
      minHeight: '800px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'var(--bg-main)'
    }}>
      {/* Background Image Parallax */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          y: yBg,
          zIndex: 0
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(26,18,18,0.7) 0%, rgba(26,18,18,0.3) 100%)'
        }} />
      </motion.div>

      {/* Floating Elements (3D feel) */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '200px',
          height: '280px',
          borderRadius: '20px',
          backgroundImage: 'url("https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=400&q=80")',
          backgroundSize: 'cover',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          border: '4px solid rgba(255,255,255,0.1)',
          zIndex: 1,
          opacity: 0.8
        }}
      />
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '10%',
          width: '240px',
          height: '180px',
          borderRadius: '20px',
          backgroundImage: 'url("https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80")',
          backgroundSize: 'cover',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          border: '4px solid rgba(255,255,255,0.1)',
          zIndex: 1,
          opacity: 0.7
        }}
      />

      {/* Content */}
      <motion.div
        style={{
          y: yText,
          opacity,
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '800px',
          padding: '0 24px'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}
        >
          <span style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '8px 20px',
            borderRadius: '30px',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            letterSpacing: '1px'
          }}>
            <Sparkles size={16} color="var(--gold-light)" /> 
            PREMIUM TO'YXONALAR PLATFORMASI
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            color: 'white',
            lineHeight: 1.1,
            marginBottom: '24px',
            fontFamily: 'var(--font-display)',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}
        >
          Orzuingizdagi to'yni <br />
          <span style={{ color: 'var(--gold-light)' }}>biz bilan boshlang</span>
        </motion.h1>

        {/* Glassmorphism Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '100px',
            padding: '12px 12px 12px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            maxWidth: '600px',
            margin: '0 auto 40px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}
        >
          <Search color="rgba(255,255,255,0.7)" size={24} />
          <input 
            type="text" 
            placeholder="To'yxona nomi yoki manzilini yozing..." 
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: '1.1rem',
              flex: 1,
              fontFamily: 'var(--font-body)'
            }}
          />
          <Link href="/halls" className="btn btn-primary" style={{ borderRadius: '50px', padding: '0 32px', height: '54px', fontSize: '1.1rem' }}>
            Qidirish
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          style={{ display: 'flex', justifyContent: 'center', gap: 20 }}
        >
          <Link href="/map" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', borderRadius: '50px', padding: '0 24px', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)' }}>
            <Map size={20} className="inline-icon" /> Xaritadan qidirish
          </Link>
          {!isAuthenticated && (
            <Link href="/register" className="btn btn-ghost" style={{ color: 'white' }}>
              Ro'yxatdan o'tish →
            </Link>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 30,
          height: 50,
          border: '2px solid rgba(255,255,255,0.5)',
          borderRadius: 20,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 10,
          zIndex: 10
        }}
      >
        <div style={{ width: 4, height: 8, background: 'white', borderRadius: 2 }} />
      </motion.div>
    </section>
  );
}
