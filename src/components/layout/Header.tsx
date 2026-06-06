'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => { logout(); window.location.href = '/'; };

  return (
    <>
      <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="main-header-inner">
          <Link href="/" className="main-header-logo">To&apos;yxona.uz</Link>
          <nav className="main-header-nav">
            <Link href="/">Bosh sahifa</Link>
            <Link href="/halls">To&apos;yxonalar</Link>
            {isAuthenticated && user?.role === 'CUSTOMER' && (
              <>
                <Link href="/my-bookings">Bronlarim</Link>
                <Link href="/favorites">Sevimlilar</Link>
              </>
            )}
          </nav>
          <div className="main-header-actions">
            {isAuthenticated ? (
              <div className="flex" style={{ gap: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{user?.firstName}</span>
                {user?.role === 'ADMIN' && <Link href="/admin/dashboard" className="btn btn-sm btn-outline">Admin</Link>}
                {user?.role === 'HALL_OWNER' && <Link href="/owner/dashboard" className="btn btn-sm btn-outline">Dashboard</Link>}
                <button className="btn btn-sm btn-ghost" onClick={handleLogout}>Chiqish</button>
              </div>
            ) : (
              <div className="flex" style={{ gap: '0.4rem' }}>
                <Link href="/login" className="btn btn-sm btn-ghost">Kirish</Link>
                <Link href="/register" className="btn btn-sm btn-primary">Ro&apos;yxatdan o&apos;tish</Link>
              </div>
            )}
            <button className="hamburger" onClick={() => setMobileOpen(true)}><span /><span /><span /></button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--burgundy)' }}>To&apos;yxona.uz</span>
          <button className="modal-close" onClick={() => setMobileOpen(false)}>✕</button>
        </div>
        <Link href="/" onClick={() => setMobileOpen(false)}>Bosh sahifa</Link>
        <Link href="/halls" onClick={() => setMobileOpen(false)}>To&apos;yxonalar</Link>
        {isAuthenticated && user?.role === 'CUSTOMER' && (
          <><Link href="/my-bookings" onClick={() => setMobileOpen(false)}>Bronlarim</Link>
          <Link href="/favorites" onClick={() => setMobileOpen(false)}>Sevimlilar</Link></>
        )}
        {!isAuthenticated && (
          <><Link href="/login" onClick={() => setMobileOpen(false)}>Kirish</Link>
          <Link href="/register" onClick={() => setMobileOpen(false)}>Ro&apos;yxatdan o&apos;tish</Link></>
        )}
        {isAuthenticated && <a href="#" onClick={() => { handleLogout(); setMobileOpen(false); }}>Chiqish</a>}
      </div>

      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          <Link href="/" className="mobile-nav-item"><span style={{fontSize:'1.2rem'}}>🏠</span><span>Bosh sahifa</span></Link>
          <Link href="/halls" className="mobile-nav-item"><span style={{fontSize:'1.2rem'}}>🏛️</span><span>To&apos;yxonalar</span></Link>
          {isAuthenticated ? (
            <><Link href="/my-bookings" className="mobile-nav-item"><span style={{fontSize:'1.2rem'}}>📋</span><span>Bronlarim</span></Link>
            <Link href="/favorites" className="mobile-nav-item"><span style={{fontSize:'1.2rem'}}>❤️</span><span>Sevimlilar</span></Link></>
          ) : <Link href="/login" className="mobile-nav-item"><span style={{fontSize:'1.2rem'}}>👤</span><span>Kirish</span></Link>}
        </div>
      </nav>
    </>
  );
}
