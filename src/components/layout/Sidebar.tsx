'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  DashboardOutlined, 
  BusinessOutlined, 
  AddOutlined, 
  PeopleOutlined, 
  CalendarMonthOutlined, 
  CreditCardOutlined, 
  PublicOutlined, 
  LogoutOutlined, 
  TrendingUpOutlined,
  HistoryOutlined,
  SettingsOutlined
} from '@mui/icons-material';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarSection {
  title: string;
  links: SidebarLink[];
}

const adminSections: SidebarSection[] = [
  {
    title: 'Asosiy',
    links: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: <DashboardOutlined sx={{ fontSize: 20 }} /> },
    ],
  },
  {
    title: 'Boshqaruv',
    links: [
      { href: '/admin/users', label: "Mijozlar", icon: <PeopleOutlined sx={{ fontSize: 20 }} /> },
      { href: '/admin/halls', label: "To'yxonalar", icon: <BusinessOutlined sx={{ fontSize: 20 }} /> },
      { href: '/admin/halls/create', label: "Yangi to'yxona", icon: <AddOutlined sx={{ fontSize: 20 }} /> },
      { href: '/admin/owners', label: "To'yxona egalari", icon: <PeopleOutlined sx={{ fontSize: 20 }} /> },
      { href: '/admin/bookings', label: 'Bronlar', icon: <CalendarMonthOutlined sx={{ fontSize: 20 }} /> },
      { href: '/admin/calendar', label: 'Taqvim', icon: <CalendarMonthOutlined sx={{ fontSize: 20 }} /> },
      { href: '/admin/payments', label: "To'lovlar", icon: <CreditCardOutlined sx={{ fontSize: 20 }} /> },
    ],
  },
  {
    title: 'Tizim',
    links: [
      { href: '/admin/logs', label: 'Activity Logs', icon: <HistoryOutlined sx={{ fontSize: 20 }} /> },
      { href: '/admin/settings', label: 'Sozlamalar', icon: <SettingsOutlined sx={{ fontSize: 20 }} /> },
    ]
  }
];

const ownerSections: SidebarSection[] = [
  {
    title: 'Asosiy',
    links: [
      { href: '/owner/dashboard', label: 'Dashboard', icon: <DashboardOutlined sx={{ fontSize: 20 }} /> },
      { href: '/owner/analytics', label: 'Analitika', icon: <TrendingUpOutlined sx={{ fontSize: 20 }} /> },
      { href: '/owner/calendar', label: 'Taqvim', icon: <CalendarMonthOutlined sx={{ fontSize: 20 }} /> },
    ],
  },
  {
    title: "To'yxonam",
    links: [
      { href: '/owner/my-hall', label: "To'yxonalarim", icon: <BusinessOutlined sx={{ fontSize: 20 }} /> },
      { href: '/owner/register-hall', label: "Yangi to'yxona", icon: <AddOutlined sx={{ fontSize: 20 }} /> },
      { href: '/owner/bookings', label: 'Bronlar', icon: <CalendarMonthOutlined sx={{ fontSize: 20 }} /> },
    ],
  },
];

const customerSections: SidebarSection[] = [
  {
    title: 'Mening Kabinetim',
    links: [
      { href: '/customer/bookings', label: 'Mening Bronlarim', icon: <CalendarMonthOutlined sx={{ fontSize: 20 }} /> },
      { href: '/customer/profile', label: 'Profil Sozlamalari', icon: <SettingsOutlined sx={{ fontSize: 20 }} /> },
    ],
  },
];

export default function Sidebar({ type }: { type: 'admin' | 'owner' | 'customer' }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  let sections = adminSections;
  if (type === 'owner') sections = ownerSections;
  if (type === 'customer') sections = customerSections;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link href={type === 'admin' ? '/admin/dashboard' : type === 'owner' ? '/owner/dashboard' : '/customer/bookings'}>
          <h2>{type === 'admin' ? 'Admin Panel' : type === 'owner' ? "To'yxona Egasi" : 'Mijoz Kabineti'}</h2>
        </Link>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
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
                <span style={{ display: 'flex', alignItems: 'center' }}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div style={{ padding: 'var(--s-4)', borderTop: '1px solid var(--border-light)' }}>
        <Link href="/" className="sidebar-link">
          <span style={{ display: 'flex', alignItems: 'center' }}><PublicOutlined sx={{ fontSize: 20 }} /></span> Saytga o&apos;tish
        </Link>
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="sidebar-link"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.92rem' }}
        >
          <span style={{ display: 'flex', alignItems: 'center' }}><LogoutOutlined sx={{ fontSize: 20 }} /></span> Chiqish
        </button>
      </div>
    </aside>
  );
}
