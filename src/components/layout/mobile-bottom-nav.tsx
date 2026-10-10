'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wallet,
  Users,
  CalendarDays,
  HandHeart,
  Package,
  FileText,
  X,
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navItems = [
    {
      title: 'Beranda',
      fullTitle: 'Beranda Utama',
      href: '/',
      icon: MosqueIcon,
      active: pathname === '/',
    },
    {
      title: 'Kas',
      fullTitle: 'Transparansi Kas',
      href: '/keuangan',
      icon: Wallet,
      active: pathname === '/keuangan',
    },
    {
      title: 'Jamaah',
      fullTitle: 'Direktori Jamaah & DKM',
      href: '/jamaah',
      icon: Users,
      active: pathname === '/jamaah',
    },
    {
      title: 'Agenda',
      fullTitle: 'Agenda & Khutbah',
      href: '/agenda',
      icon: CalendarDays,
      active: pathname === '/agenda',
    },
    {
      title: 'Zakat',
      fullTitle: 'Layanan Zakat & Infaq',
      href: '/zakat',
      icon: HandHeart,
      active: pathname === '/zakat',
    },
    {
      title: 'Aset',
      fullTitle: 'Fasilitas & Wakaf',
      href: '/fasilitas',
      icon: Package,
      active: pathname === '/fasilitas',
    },
    {
      title: 'Laporan',
      fullTitle: 'Laporan Resmi SIMAS',
      href: '/laporan',
      icon: FileText,
      active: pathname === '/laporan',
    },
  ];

  // Mouse hover handlers with slight delay on exit
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  // Close on Click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ============================================================== */}
      {/* 1. TAMPILAN MOBILE (< md): BAR PINNED BOTTOM 7 TABS           */}
      {/* ============================================================== */}
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

      {/* ============================================================== */}
      {/* 2. TAMPILAN LAPTOP / DESKTOP (md: & UP): FLOATING SPEED DIAL   */}
      {/* ============================================================== */}
      <aside
        ref={containerRef}
        aria-label="Navigasi Cepat Desktop"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden md:block fixed bottom-7 right-7 z-50 select-none"
      >
        {/* Tombol-Tombol Bulat Muncul di Atas Tombol Utama */}
        <div
          className={`absolute bottom-16 right-0 flex flex-col-reverse items-end gap-3 transition-all duration-300 ease-out origin-bottom ${
            isOpen
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-y-6 scale-90 pointer-events-none'
          }`}
        >
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.active;

            return (
              <div
                key={item.title}
                className="group flex items-center gap-2.5"
                style={{
                  transitionDelay: isOpen ? `${index * 25}ms` : '0ms',
                }}
              >
                {/* Tooltip Label di sebelah kiri tombol bulat */}
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-md backdrop-blur-md transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? 'bg-emerald-900/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/20'
                      : 'bg-slate-900/85 text-white border-white/10 group-hover:bg-slate-900 group-hover:scale-105'
                  }`}
                >
                  {item.fullTitle}
                </Link>

                {/* Tombol Bulat */}
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  title={item.fullTitle}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg active:scale-95 group-hover:scale-110 border ${
                    isActive
                      ? 'bg-gradient-to-tr from-emerald-700 to-teal-600 text-white border-emerald-300 shadow-emerald-900/40 ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#f4f7f6]'
                      : 'bg-white/95 text-slate-700 hover:bg-emerald-700 hover:text-white border-slate-200 shadow-slate-900/10 hover:shadow-emerald-900/30'
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? 'text-white stroke-[2.2]' : 'transition-colors'}
                  />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Tombol Utama (Trigger FAB) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Menu Layanan Masjid"
          className={`relative group w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border-2 active:scale-95 focus:outline-hidden ${
            isOpen
              ? 'bg-gradient-to-tr from-[#0a1f18] to-slate-900 text-white border-emerald-400 rotate-90 shadow-emerald-950/50'
              : 'bg-gradient-to-tr from-[#0a1f18] to-emerald-800 hover:to-emerald-700 text-white border-emerald-400/50 hover:border-emerald-300 shadow-[0_8px_30px_rgba(10,31,24,0.35)] hover:shadow-[0_10px_35px_rgba(13,138,94,0.45)]'
          }`}
        >
          {/* Subtle pulse ring when closed */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
          )}

          {isOpen ? (
            <X size={24} className="text-emerald-300 transition-transform duration-300 -rotate-90" />
          ) : (
            <MosqueIcon size={24} className="text-emerald-300 group-hover:scale-110 transition-transform duration-300" />
          )}
        </button>
      </aside>
    </>
  );
}
