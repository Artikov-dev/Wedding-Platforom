'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
}

interface SidebarSection {
  title: string;
  links: SidebarLink[];
}

const adminSections: SidebarSection[] = [
  {
    title: 'Asosiy',
    links: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    ],
  },
  {
    title: 'Boshqaruv',
    links: [
      { href: '/admin/halls', label: "To'yxonalar", icon: '🏛️' },
      { href: '/admin/halls/create', label: "Yangi to'yxona", icon: '➕' },
      { href: '/admin/owners', label: "To'yxona egalari", icon: '👥' },
      { href: '/admin/bookings', label: 'Bronlar', icon: '📋' },
    ],
  },
];

const ownerSections: SidebarSection[] = [
  {
    title: 'Asosiy',
    links: [
      { href: '/owner/dashboard', label: 'Dashboard', icon: '📊' },
    ],
  },
  {
    title: "To'yxonam",
    links: [
      { href: '/owner/my-hall', label: "To'yxonam", icon: '🏛️' },
      { href: '/owner/register-hall', label: "Ro'yxatdan o'tkazish", icon: '➕' },
      { href: '/owner/bookings', label: 'Bronlar', icon: '📋' },
    ],
  },
];

export default function Sidebar({ type }: { type: 'admin' | 'owner' }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const sections = type === 'admin' ? adminSections : ownerSections;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link href={type === 'admin' ? '/admin/dashboard' : '/owner/dashboard'}>
          <h2>{type === 'admin' ? 'Admin Panel' : "To'yxona Egasi"}</h2>
        </Link>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          {user?.firstName} {user?.lastName}
        </p>
      </div>
      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="sidebar-section">{section.title}</div>
            {section.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--color-border-light)' }}>
        <Link href="/" className="sidebar-link">
          <span>🌐</span> Saytga o&apos;tish
        </Link>
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="sidebar-link"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.92rem' }}
        >
          <span>🚪</span> Chiqish
        </button>
      </div>
    </aside>
  );
}
