'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Wallet,
  CalendarDays,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
  User,
  Database,
  Users,
  HandHeart,
  UserCheck,
  FileText,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isSupabaseConnected } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Buku Kas Keuangan', href: '/finance', icon: Wallet },
    { title: 'Zakat & Qurban', href: '/zakat', icon: HandHeart },
    { title: 'Data Jamaah', href: '/jamaah', icon: Users },
    { title: 'Jadwal Petugas Jumat', href: '/petugas-jumat', icon: UserCheck },
    { title: 'Khutbah & Kajian', href: '/khutbah', icon: CalendarDays },
    { title: 'Inventaris & Wakaf', href: '/inventory', icon: Package },
    { title: 'Laporan Resmi (SIMAS)', href: '/laporan', icon: FileText },
    { title: 'Pengaturan & Backup', href: '/pengaturan', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 bg-[#0a1f18] text-white border-b border-emerald-900/40 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="font-serif-elegant flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white shadow-md">
            M
          </div>
          <div>
            <h1 className="font-serif-elegant text-base font-bold leading-none tracking-wide text-white">Al-Mukhlisin</h1>
            <p className="text-[9px] font-bold tracking-widest text-emerald-300 uppercase">Pusat Komando</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Toggle Menu"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Backdrop for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-[#0a1f18] text-white flex flex-col justify-between p-6 z-50 transition-transform duration-300 ease-in-out border-r border-emerald-950/80 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-8">
          {/* Mosque Brand & System Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="font-serif-elegant flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-bold text-white shadow-lg shadow-emerald-900/40">
                M
              </div>
              <div>
                <span className="font-serif-elegant text-xl font-bold tracking-wide text-white block leading-tight">
                  Al-Mukhlisin
                </span>
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1">
                  <Shield size={11} /> Admin Portal
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Database Connection Status Badge */}
          <div className="rounded-2xl bg-emerald-950/60 border border-emerald-800/40 p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Database size={13} className="text-emerald-400" /> Database Backend
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </div>
            <p className="text-[11px] font-bold text-emerald-300">
              {isSupabaseConnected ? 'Terhubung ke Supabase' : 'Mode Offline / Local DB'}
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">
              {isSupabaseConnected
                ? 'Sinkronisasi real-time cloud aktif'
                : 'Data disimpan lokal (isi .env.local untuk Supabase)'}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className="px-3 text-[10px] font-black tracking-widest text-emerald-500 uppercase mb-2">
              Menu Utama
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0d8a5e] to-emerald-700 text-white shadow-lg shadow-emerald-950/50'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-emerald-400'} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with User Profile and Action buttons */}
        <div className="space-y-4 pt-6 border-t border-emerald-950/80">
          {/* Quick link to public landing page */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} className="text-emerald-400" /> Lihat Website Publik
            </span>
            <span className="text-[9px] text-emerald-400 uppercase tracking-wider">Web</span>
          </Link>

          {/* User Info & Logout */}
          <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-xl bg-emerald-600/60 flex items-center justify-center shrink-0 text-white font-bold text-xs uppercase">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin Masjid'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@masjid.id'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded-xl transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Page Area */}
      <main className="flex-1 min-w-0 bg-[#f8fafc] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
