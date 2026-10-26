'use client';

import React, { useState, useEffect } from 'react';
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
  MapPin,
  MessageSquareHeart,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { DataService } from '@/lib/data-service';
import { IdentitasMasjid } from '@/types';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isSupabaseConnected } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [identitas, setIdentitas] = useState<IdentitasMasjid | null>(null);
  const [unreadSaran, setUnreadSaran] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchIdentitas = async () => {
      try {
        const data = await DataService.getIdentitas();
        if (isMounted) setIdentitas(data);
      } catch (e) {
        console.error('Failed to load identitas in layout:', e);
      }
    };
    const fetchUnreadSaran = async () => {
      try {
        if (typeof DataService?.getSaranKritik === 'function') {
          const saranList = await DataService.getSaranKritik();
          if (isMounted && Array.isArray(saranList)) {
            const baruCount = saranList.filter((s) => s.status === 'baru').length;
            setUnreadSaran(baruCount);
          }
        }
      } catch (e) {
        console.error('Failed to load saran count in layout:', e);
      }
    };

    fetchIdentitas();
    fetchUnreadSaran();

    const handleUpdated = (e: any) => {
      if (e?.detail) setIdentitas(e.detail);
      else fetchIdentitas();
    };

    const handleSaranUpdated = () => {
      fetchUnreadSaran();
    };

    window.addEventListener('masjid_identitas_updated', handleUpdated);
    window.addEventListener('masjid_saran_updated', handleSaranUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('masjid_identitas_updated', handleUpdated);
      window.removeEventListener('masjid_saran_updated', handleSaranUpdated);
    };
  }, []);

  const navItems = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Saran & Kritik Jamaah', href: '/admin/saran', icon: MessageSquareHeart, badge: unreadSaran },
    { title: 'Buku Kas Keuangan', href: '/admin/finance', icon: Wallet },
    { title: 'Zakat & Qurban', href: '/admin/zakat', icon: HandHeart },
    { title: 'Data Jamaah', href: '/admin/jamaah', icon: Users },
    { title: 'Jadwal Petugas Jumat', href: '/admin/petugas-jumat', icon: UserCheck },
    { title: 'Khutbah & Kajian', href: '/admin/khutbah', icon: CalendarDays },
    { title: 'Inventaris & Wakaf', href: '/admin/inventory', icon: Package },
    { title: 'Laporan Resmi (SIMAS)', href: '/admin/laporan', icon: FileText },
    { title: 'Pengaturan & Backup', href: '/admin/pengaturan', icon: Settings },
  ];


  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 bg-[#0a1f18] text-white border-b border-emerald-900/40 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-800/80 border border-emerald-500/30 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={identitas?.logo_url || '/icon.svg'}
              alt={identitas?.nama || 'Masjid Al-Mukhlisin'}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-serif-elegant text-lg font-bold leading-none tracking-wide text-white">
              {identitas?.nama || 'Al-Mukhlisin'}
            </h1>
            <p className="text-[9px] font-mono text-emerald-300 mt-1">
              ID {identitas?.nomor_id_kemenag || '01.4.13.04.06.000158'}
            </p>
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
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-[#0a1f18] text-white flex flex-col justify-between p-6 z-50 overflow-y-auto transition-transform duration-300 ease-in-out border-r border-emerald-950/80 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-800/80 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow overflow-hidden">
                <img
                  src={identitas?.logo_url || '/icon.svg'}
                  alt={identitas?.nama || 'Masjid Al-Mukhlisin'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif-elegant text-2xl font-bold tracking-wide text-white block leading-tight">
                  {identitas?.nama || 'Al-Mukhlisin'}
                </span>
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1 mt-0.5">
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
          <div className="rounded-2xl bg-emerald-950/60 border border-emerald-800/40 p-3.5 space-y-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Database size={13} className="text-emerald-400" /> Database Backend
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] font-bold text-emerald-300">
                {isSupabaseConnected ? 'Database Cloud Terhubung' : 'Database Aktif & Terlindungi'}
              </p>
            </div>

            {/* Identitas SIMAS & Alamat */}
            <div className="border-t border-emerald-900/40 pt-2 text-[10px] space-y-0.5">
              <span className="font-mono font-bold text-emerald-400 block">
                ID {identitas?.nomor_id_kemenag || '01.4.13.04.06.000158'}
              </span>
              <p className="text-slate-300 flex items-start gap-1 leading-tight">
                <MapPin size={11} className="shrink-0 text-emerald-500 mt-0.5" />
                <span>{identitas?.alamat || 'Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar'}</span>
              </p>
            </div>
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
                  <span className="flex-1">{item.title}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-emerald-950 shadow-sm animate-pulse">
                      {item.badge} baru
                    </span>
                  )}
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
      <main className="flex-1 min-w-0 bg-[#f8fafc] overflow-y-auto pb-8 md:pb-0">
        {children}
      </main>
    </div>
  );
}
