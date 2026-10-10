'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Package,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import { DataService } from '@/lib/data-service';
import { KasItem, InventoryItem, KhutbahItem } from '@/types';

export default function DashboardPage() {
  const [saldo, setSaldo] = useState<number>(0);
  const [totalAset, setTotalAset] = useState<number>(0);
  const [jadwalTerdekat, setJadwalTerdekat] = useState<KhutbahItem | null>(null);

  const [recentTransactions, setRecentTransactions] = useState<KasItem[]>([]);
  const [upcomingAgendas, setUpcomingAgendas] = useState<KhutbahItem[]>([]);

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kasList, invList, khuList] = await Promise.all([
        DataService.getKas(),
        DataService.getInventories(),
        DataService.getKhutbahs(),
      ]);

      // 1. Finance calculations
      const total = kasList.reduce((acc, curr) => {
        const val = Number(curr.nominal);
        return curr.tipe === 'masuk' ? acc + val : acc - val;
      }, 0);
      setSaldo(total);
      setRecentTransactions(kasList.slice(0, 5));

      // 2. Inventory stats
      setTotalAset(invList.length);

      // 3. Khutbah stats
      if (khuList.length > 0) {
        setUpcomingAgendas(khuList.slice(0, 3));
        setJadwalTerdekat(khuList[0]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [todayDateStr, setTodayDateStr] = useState('');

  useEffect(() => {
    loadData();
    const now = new Date();
    const masehi = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    let hijri = '';
    try {
      hijri = new Intl.DateTimeFormat('id-ID-u-ca-islamic-civil', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now);
    } catch {}
    setTodayDateStr(hijri ? `${masehi} · ${hijri}` : masehi);
  }, []);

  return (
    <AdminLayout>
      <div className="p-3.5 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-5 sm:space-y-8">
        {/* Header with Greeting & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 font-serif-elegant">
              Pusat Komando
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
              <p className="text-xs sm:text-sm font-bold text-slate-400">
                Ringkasan Sistem Manajemen Masjid Al-Mukhlisin
              </p>
              {todayDateStr && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] sm:text-xs font-bold border border-emerald-200 shadow-2xs">
                  <CalendarDays size={12} className="text-emerald-600 shrink-0" />
                  <span className="truncate max-w-[240px] sm:max-w-none">{todayDateStr}</span>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-600 hover:text-emerald-700 transition-colors shadow-2xs"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-emerald-600' : ''} />
            <span>Muat Ulang Data</span>
          </button>
        </div>

        {/* --- TOP 3 STAT CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {/* 1. Saldo Kas */}
          <div className="group rounded-[1.8rem] sm:rounded-[2rem] border border-slate-100 bg-white p-5 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Saldo Kas Umat
              </span>
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Wallet size={20} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl md:text-3xl font-black text-emerald-900 font-serif-elegant">
                Rp {saldo.toLocaleString('id-ID')}
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <TrendingUp size={15} />
                <span>Transparansi Kas Terbuka</span>
              </div>
            </div>
          </div>

          {/* 2. Total Fasilitas & Inventaris */}
          <div className="group rounded-[2rem] border border-slate-100 bg-white p-7 shadow-xs hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Aset Terinventaris
              </span>
              <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Package size={22} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl md:text-3xl font-black text-slate-900 font-serif-elegant">
                {totalAset} <span className="text-base font-sans font-bold text-slate-400">Barang</span>
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600">
                <span>Tersedia & Terawat</span>
              </div>
            </div>
          </div>

          {/* 3. Agenda Terdekat */}
          <div className="group rounded-[2rem] border border-slate-100 bg-white p-7 shadow-xs hover:shadow-xl hover:shadow-purple-900/5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Agenda Terdekat
              </span>
              <div className="h-11 w-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <CalendarDays size={22} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-lg md:text-xl font-bold text-slate-900 truncate">
                {jadwalTerdekat?.khotib || 'Belum ada agenda'}
              </p>
              <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                {jadwalTerdekat?.jenis_kegiatan || '-'}
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-purple-600">
                <Clock size={13} />
                <span>
                  {jadwalTerdekat?.tanggal
                    ? new Date(jadwalTerdekat.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })
                    : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN GRID: TRANSAKSI & AGENDA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Kiri: Transaksi Kas Terbaru (7 kolom) */}
          <div className="lg:col-span-7 rounded-[2.5rem] bg-white border border-slate-100 p-7 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Arus Kas Terbaru</h3>
                <p className="text-xs text-slate-400 font-medium">5 Mutasi transaksi kas masjid terakhir</p>
              </div>
              <Link
                href="/finance"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Lihat Semua <ArrowRight size={14} />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((trx) => (
                  <div key={trx.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          trx.tipe === 'masuk'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {trx.tipe === 'masuk' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{trx.keterangan}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{trx.tanggal}</p>
                      </div>
                    </div>

                    <div
                      className={`text-xs font-black font-mono shrink-0 ${
                        trx.tipe === 'masuk' ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {trx.tipe === 'masuk' ? '+' : '-'} Rp {Number(trx.nominal).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">Belum ada transaksi kas</div>
              )}
            </div>
          </div>

          {/* Kanan: Agenda Majelis Mendatang (5 kolom) */}
          <div className="lg:col-span-5 rounded-[2.5rem] bg-white border border-slate-100 p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Majelis & Khutbah</h3>
                  <p className="text-xs text-slate-400 font-medium">Jadwal kegiatan syiar mendatang</p>
                </div>
                <Link
                  href="/khutbah"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  Kelola <ArrowRight size={14} />
                </Link>
              </div>

              <div className="space-y-3.5">
                {upcomingAgendas.length > 0 ? (
                  upcomingAgendas.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1.5">
                        <span className="font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-md uppercase">
                          {item.jenis_kegiatan}
                        </span>
                        <span className="text-slate-400 font-bold">{item.tanggal}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.khotib}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic mt-0.5">
                        "{item.tema || 'Tema belum diinput'}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">Belum ada jadwal kajian</div>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-6 mt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
              <Link
                href="/finance"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors"
              >
                <PlusCircle size={15} /> Catat Kas
              </Link>
              <Link
                href="/inventory"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-bold transition-colors"
              >
                <PlusCircle size={15} /> Input Aset
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
