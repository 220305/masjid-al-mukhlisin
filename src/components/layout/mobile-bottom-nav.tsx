'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wallet,
  Users,
  CalendarDays,
  HandHeart,
  Package,
  FileText,
} from 'lucide-react';

function MosqueIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2v2.5" />
      <path d="M12 4.5c-2.3 0-3.8 1.6-3.8 4V11h7.6V8.5c0-2.4-1.5-4-3.8-4z" />
      <path d="M5 11v10h14V11" />
      <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
      <path d="M5 11H3v10h2" />
      <path d="M19 11h2v10h-2" />
    </svg>
  );
}

interface MobileBottomNavProps {
  variant?: 'admin' | 'public';
}

export default function MobileBottomNav({ variant }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: 'Beranda',
      href: '/',
      icon: MosqueIcon,
      active: pathname === '/',
    },
    {
      title: 'Kas',
      href: '/keuangan',
      icon: Wallet,
      active: pathname === '/keuangan' || pathname === '/finance',
    },
    {
      title: 'Jamaah',
      href: '/jamaah',
      icon: Users,
      active: pathname === '/jamaah' || pathname === '/admin-jamaah',
    },
    {
      title: 'Agenda',
      href: '/agenda',
      icon: CalendarDays,
      active: pathname === '/agenda' || pathname === '/khutbah' || pathname === '/petugas-jumat',
    },
    {
      title: 'Zakat',
      href: '/zakat',
      icon: HandHeart,
      active: pathname === '/zakat' || pathname === '/admin-zakat',
    },
    {
      title: 'Aset',
      href: '/fasilitas',
      icon: Package,
      active: pathname === '/fasilitas' || pathname === '/inventory',
    },
    {
      title: 'Laporan',
      href: '/laporan',
      icon: FileText,
      active: pathname === '/laporan' || pathname === '/admin-laporan',
    },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,6px)] pt-1.5 transition-all"
    >
      <div className="grid grid-cols-7 items-center max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-emerald-700 font-black'
                  : 'text-slate-400 hover:text-slate-600 font-semibold'
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-2xs'
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-emerald-700 stroke-[2.2]' : 'text-slate-400'}
                />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 truncate w-full text-center ${
                  isActive ? 'text-emerald-800 font-extrabold' : 'text-slate-500 font-semibold'
                }`}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
