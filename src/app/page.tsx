'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  CheckCircle,
  ChevronDown,
  Clock,
  Eye,
  Heart,
  MapPin,
  Menu,
  Shield,
  Target,
  Wallet,
  X,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const IconInstagram = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const IconYoutube = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <polygon points="10 15 15 12 10 9 10 15"/>
  </svg>
);

const IconFacebook = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
import { DataService } from '@/lib/data-service';
import { InventoryItem, KasItem, KhutbahItem } from '@/types';

export default function HomePage() {
  const [jadwal, setJadwal] = useState<KhutbahItem[]>([]);
  const [saldo, setSaldo] = useState<number>(0);
  const [totalFasilitas, setTotalFasilitas] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Jadwal Shalat
  const [jadwalShalat, setJadwalShalat] = useState<Record<string, string> | null>(null);
  const [loadingShalat, setLoadingShalat] = useState(true);
  const [todayDateString, setTodayDateString] = useState('');
  const [currentYear, setCurrentYear] = useState<number>(2026);

  // Modals & Slides
  const [selectedKajian, setSelectedKajian] = useState<KhutbahItem | null>(null);
  const [showDonasiModal, setShowDonasiModal] = useState(false);
  const [dataKeuangan, setDataKeuangan] = useState<KasItem[]>([]);
  const [fasilitas, setFasilitas] = useState<InventoryItem[]>([]);

  // Carousel Slides
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeKeuanganSlide, setActiveKeuanganSlide] = useState(0);

  // Auto slide Inventaris (8s)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Auto slide Keuangan (10s)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveKeuanganSlide((prev) => (prev === 0 ? 1 : 0));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch internal data and prayer times
  useEffect(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setTodayDateString(
      now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    );

    const fetchInternalData = async () => {
      setLoading(true);
      try {
        const [khutbahData, kasData, invData] = await Promise.all([
          DataService.getKhutbahs(),
          DataService.getKas(),
          DataService.getInventories(),
        ]);

        // 1. Khutbah: Urutkan terdekat dan ambil 3 teratas
        setJadwal(khutbahData.slice(0, 3));

        // 2. Keuangan: Hitung total kas & simpan list
        const total = kasData.reduce((acc, curr) => {
          const val = Number(curr.nominal);
          return curr.tipe === 'masuk' ? acc + val : acc - val;
        }, 0);
        setSaldo(total);
        setDataKeuangan(kasData);

        // 3. Inventaris
        setTotalFasilitas(invData.length);
        setFasilitas(invData);
      } catch (err) {
        console.error('Error fetching internal data:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchShalat = async () => {
      try {
        const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Bandung&country=Indonesia&method=20');
        const json = await res.json();
        if (json?.data?.timings) {
          setJadwalShalat(json.data.timings);
        }
      } catch (error) {
        console.warn('Gagal memuat jadwal shalat dari API, menggunakan fallback jam default', error);
        // Fallback waktu shalat Bandung Barat
        setJadwalShalat({
          Fajr: '04:36',
          Sunrise: '05:48',
          Dhuhr: '11:55',
          Asr: '15:10',
          Maghrib: '17:58',
          Isha: '19:07',
        });
      } finally {
        setLoadingShalat(false);
      }
    };

    fetchInternalData();
    fetchShalat();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f7f6] font-sans text-slate-900 selection:bg-emerald-200">
      {/* --- NAVBAR MELAYANG (FLOATING PILL) --- */}
      <header className="fixed top-0 z-50 w-full px-4 pt-6 transition-all md:px-8">
        <nav
          className={`mx-auto max-w-7xl border border-white/10 bg-[#1a2b25]/85 shadow-2xl backdrop-blur-md transition-all duration-300 ${
            isMenuOpen ? 'rounded-[2rem]' : 'rounded-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 md:px-8">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center group">
              <span className="font-serif-elegant text-xl font-bold tracking-wide text-white md:text-2xl block group-hover:text-emerald-300 transition-colors">
                Al-Mukhlisin
              </span>
            </Link>

            {/* Navigation Links (Desktop) */}
            <div className="hidden gap-6 text-[11px] font-bold tracking-widest text-slate-300 uppercase md:flex lg:gap-8">
              <a href="#jadwal" className="transition-colors hover:text-white">
                Jadwal Shalat
              </a>
              <a href="#khutbah" className="transition-colors hover:text-white">
                Kajian & Khutbah
              </a>
              <a href="#fasilitas" className="transition-colors hover:text-white">
                Fasilitas
              </a>
              <a href="#keuangan" className="transition-colors hover:text-white">
                Transparansi
              </a>
            </div>

            {/* Right Side: Portal Link & Burger Button */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 transition-all"
              >
                <Shield size={13} className="text-emerald-400" />
                <span>Portal Pengurus</span>
              </Link>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:hidden"
                aria-label="Menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu (Dropdown) */}
          <div
            className={`overflow-hidden transition-all duration-300 md:hidden ${
              isMenuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="flex flex-col items-center gap-4 border-t border-white/5 pt-4 pb-6 text-[10px] font-black tracking-[0.2em] text-slate-300 uppercase">
              <a href="#jadwal" onClick={() => setIsMenuOpen(false)} className="py-1.5 transition-colors hover:text-white">
                Jadwal Shalat
              </a>
              <a href="#khutbah" onClick={() => setIsMenuOpen(false)} className="py-1.5 transition-colors hover:text-white">
                Kajian & Khutbah
              </a>
              <a href="#fasilitas" onClick={() => setIsMenuOpen(false)} className="py-1.5 transition-colors hover:text-white">
                Fasilitas
              </a>
              <a href="#keuangan" onClick={() => setIsMenuOpen(false)} className="py-1.5 transition-colors hover:text-white">
                Transparansi
              </a>
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="py-1.5 text-emerald-400 font-bold flex items-center gap-1.5"
              >
                <Shield size={14} /> Masuk Portal Pengurus
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative flex min-h-[90vh] items-center px-4 md:min-h-screen md:px-8 overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/images/masjid-bg.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/masjid-cinematic.mp4" type="video/mp4" />
        </video>

        {/* Overlay Gelap dengan Gradasi Hijau Tua */}
        <div className="absolute inset-0 bg-[#0a1f18]/85 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f4f7f6] via-transparent to-[#0a1f18]/40" />

        {/* Konten Hero (Rata Kiri) */}
        <div className="relative z-10 mx-auto w-full max-w-7xl pt-24 pb-12">
          <div className="max-w-3xl">
            {/* Subteks Atas dengan Garis Emas & ID Kemenag */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="h-[2px] w-8 bg-[#d4af37]" />
              <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-400/30 bg-emerald-950/70 px-4 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-md shadow-inner">
                <span className="tracking-wide">Kartu Masjid Kemenag RI</span>
                <span className="text-white/30">|</span>
                <span className="font-mono text-white tracking-wider font-bold">ID 01.4.13.04.06.000158</span>
              </div>
            </div>

            {/* Judul Utama Serif */}
            <h1 className="font-serif-elegant mb-2 text-5xl leading-tight font-bold text-white md:text-7xl lg:text-[5.5rem] drop-shadow-md">
              Masjid Al-Mukhlisin
            </h1>

            {/* Alamat Resmi Hero */}
            <p className="mb-6 flex items-center gap-2 text-xs md:text-sm text-emerald-200/90 font-medium">
              <MapPin size={16} className="text-[#d4af37] shrink-0" />
              <span>Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar</span>
            </p>

            {/* Subjudul Dua Warna */}
            <h2 className="font-serif-elegant mb-8 text-3xl leading-tight font-bold md:text-4xl lg:text-5xl">
              <span className="text-[#0d8a5e]">Menyinari Negeri,</span>{' '}
              <span className="text-[#d4af37]">Menjaga Harmoni.</span>
            </h2>

            {/* Deskripsi */}
            <p className="mb-10 max-w-xl text-sm leading-relaxed font-medium text-slate-300 md:text-lg">
              Selamat datang di Masjid Al-Mukhlisin, simbol ukhuwah dan pusat peradaban islami. Merajut
              persaudaraan dan menebar kedamaian untuk seluruh alam melalui transparansi dan pelayanan umat.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#jadwal"
                className="group flex h-12 w-12 items-center justify-center rounded-full bg-[#0d8a5e] text-white shadow-lg shadow-emerald-900/40 transition-all hover:bg-emerald-500 hover:scale-105 active:scale-95"
                title="Scroll ke Bawah"
              >
                <ChevronDown size={28} className="animate-bounce transition-transform group-hover:scale-110" />
              </a>

              <button
                onClick={() => setShowDonasiModal(true)}
                className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 text-xs font-bold text-white tracking-wider uppercase transition-all backdrop-blur-xs flex items-center gap-2"
              >
                <Heart size={15} className="text-emerald-400 fill-emerald-400" /> Infaq & Sedekah
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT SECTIONS --- */}
      <main className="relative z-20 mx-auto -mt-10 max-w-7xl space-y-24 px-4 py-12 md:-mt-20 md:space-y-32 md:px-8 md:py-20">
        {/* --- 1. JADWAL SHALAT REAL-TIME --- */}
        <section id="jadwal" className="scroll-mt-32">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-200/50 md:p-10">
            <div className="mb-8 flex flex-col items-center justify-between gap-4 border-b border-slate-100 pb-6 md:flex-row">
              <div className="text-center md:text-left">
                <h2 className="font-serif-elegant text-2xl font-bold text-[#0a1f18] md:text-3xl">
                  Waktu Shalat Hari Ini
                </h2>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 md:justify-start">
                  <MapPin size={15} className="text-[#0d8a5e]" /> Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                <Clock size={14} className="text-[#0d8a5e]" />
                <span>{todayDateString || 'Hari Ini'}</span>
              </div>
            </div>

            {loadingShalat ? (
              <div className="flex h-24 items-center justify-center font-bold text-slate-400 gap-2">
                <RefreshCw size={18} className="animate-spin text-emerald-600" />
                <span>Menyinkronkan waktu shalat...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {[
                  { key: 'Fajr', label: 'Subuh' },
                  { key: 'Dhuhr', label: 'Dzuhur' },
                  { key: 'Asr', label: 'Ashar' },
                  { key: 'Maghrib', label: 'Maghrib' },
                  { key: 'Isha', label: 'Isya' },
                ].map((item, idx) => {
                  const waktuJam = jadwalShalat ? jadwalShalat[item.key] : '--:--';
                  return (
                    <div
                      key={idx}
                      className="group rounded-2xl border border-slate-100 bg-slate-50/80 p-5 text-center transition-all hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-900/10 hover:-translate-y-1"
                    >
                      <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase group-hover:text-emerald-100">
                        {item.label}
                      </p>
                      <p className="font-serif-elegant mt-2 text-2xl font-bold text-[#0a1f18] group-hover:text-white md:text-3xl">
                        {waktuJam ? waktuJam.split(' ')[0] : '--:--'}
                      </p>
                      <span className="text-[9px] font-bold text-emerald-700 group-hover:text-emerald-100 mt-1 block">
                        WIB
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* --- PROFIL, VISI & MISI MASJID --- */}
        <section id="profil" className="scroll-mt-24">
          <div className="rounded-[2.5rem] bg-white p-8 border border-slate-200/80 shadow-xl shadow-slate-200/40 md:p-14">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              {/* Kiri: Deskripsi Sejarah */}
              <div className="space-y-6 lg:col-span-7">
                <div className="flex items-center gap-3 text-[10px] font-black tracking-widest text-[#0d8a5e] uppercase">
                  <span className="h-px w-6 bg-[#0d8a5e]" /> Tentang Masjid
                </div>
                <h2 className="font-serif-elegant text-3xl font-bold leading-tight text-[#0a1f18] md:text-5xl">
                  Pusat Ibadah, Pembinaan Umat & Laboratorium Peradaban
                </h2>
                <div className="space-y-4 text-sm leading-relaxed text-slate-600 font-medium md:text-base">
                  <p>
                    Masjid Al-Mukhlisin hadir sebagai pusat ibadah dan pembinaan umat di kawasan
                    Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar. Mengusung konsep transparansi modern berbasis teknologi, kami berdedikasi
                    untuk menghadirkan akuntabilitas penuh bagi setiap donasi jamaah.
                  </p>
                  <p>
                    Selama bertahun-tahun, masjid ini telah menjadi rumah bagi berbagai kegiatan dakwah, pendidikan TPA,
                    dan santunan sosial masyarakat, menginspirasi ribuan jamaah untuk saling tolong-menolong sesuai
                    tuntunan Al-Qur'an dan As-Sunnah.
                  </p>
                </div>
              </div>

              {/* Kanan: Visi & Misi */}
              <div className="space-y-5 lg:col-span-5">
                {/* Visi */}
                <div className="group rounded-[2rem] border border-slate-100 bg-slate-50 p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-emerald-900/5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0d8a5e] shadow-xs">
                      <Eye size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-[#0a1f18]">Visi Masjid</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500 font-medium">
                    Menjadi masjid mandiri, pelopor pembangunan peradaban islami yang rahmatan lil 'alamin dan unggul
                    dalam pelayanan umat.
                  </p>
                </div>

                {/* Misi */}
                <div className="group rounded-[2rem] border border-slate-100 bg-slate-50 p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-emerald-900/5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0d8a5e] shadow-xs">
                      <Target size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-[#0a1f18]">Misi Masjid</h3>
                  </div>
                  <ul className="space-y-2.5 text-xs leading-relaxed text-slate-500 font-medium">
                    <li className="flex gap-2.5">
                      <span className="text-[#0d8a5e] font-bold">✓</span>
                      Mewujudkan masjid sebagai rumah ruhani dan pusat kebangkitan masyarakat.
                    </li>
                    <li className="flex gap-2.5">
                      <span className="text-[#0d8a5e] font-bold">✓</span>
                      Membina generasi qur'ani berakhlak mulia dan berwawasan luas.
                    </li>
                    <li className="flex gap-2.5">
                      <span className="text-[#0d8a5e] font-bold">✓</span>
                      Menerapkan tata kelola keuangan kas dan inventaris yang transparan secara real-time.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 2. KHUTBAH & KAJIAN --- */}
        <section id="khutbah" className="scroll-mt-16">
          <div className="mb-10 text-center md:mb-14">
            <p className="mb-3 text-[10px] font-black tracking-widest text-[#d4af37] uppercase">Syiar Agama</p>
            <h2 className="font-serif-elegant text-3xl font-bold text-[#0a1f18] md:text-5xl">
              Majelis Ilmu & Khutbah
            </h2>
            <p className="mt-4 text-sm text-slate-500">
              Jadwal kajian dan ceramah terdekat untuk mempertebal keimanan dan wawasan keislaman.
            </p>
          </div>

          {loading ? (
            <div className="text-center font-bold text-slate-400 py-12 flex justify-center items-center gap-2">
              <RefreshCw size={20} className="animate-spin text-emerald-600" />
              <span>Memuat agenda majelis ilmu...</span>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
              {jadwal.length > 0 ? (
                jadwal.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedKajian(item)}
                    className="group flex cursor-pointer flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-2 hover:border-[#0d8a5e]/30 hover:shadow-2xl hover:shadow-emerald-900/5"
                  >
                    {/* AREA GAMBAR KHATIB */}
                    <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=800&q=80'}
                        alt={item.khotib}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      <div className="absolute top-4 right-4">
                        <span
                          className={`rounded-full px-3.5 py-1.5 text-[8px] font-black tracking-widest uppercase backdrop-blur-md ${
                            item.status === 'terjadwal'
                              ? 'bg-indigo-600/90 text-white'
                              : item.status === 'selesai'
                              ? 'bg-emerald-600/90 text-white'
                              : 'bg-red-500/90 text-white'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* KONTEN TEXT */}
                    <div className="flex flex-col p-7 flex-1 justify-between">
                      <div>
                        <div className="mb-3 flex items-center gap-2.5">
                          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0d8a5e] transition-colors group-hover:bg-[#0d8a5e] group-hover:text-white">
                            <CalendarDays size={16} />
                          </div>
                          <p className="text-[10px] font-black tracking-widest text-[#0d8a5e] uppercase">
                            {item.jenis_kegiatan}
                          </p>
                        </div>

                        <h3 className="font-serif-elegant text-xl font-bold text-[#0a1f18] line-clamp-1 mb-2">
                          {item.khotib}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2 italic font-medium">
                          "{item.tema || 'Tema kajian insya Allah disampaikan pada sesi majelis'}"
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500">
                          {new Date(item.tanggal).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <span className="text-[10px] font-bold text-[#0d8a5e] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Detail <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center p-12 text-slate-400 bg-white rounded-3xl border border-slate-100">
                  Belum ada jadwal kajian terbaru.
                </div>
              )}
            </div>
          )}

          {/* MODAL DETAIL KAJIAN */}
          {selectedKajian && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={() => setSelectedKajian(null)}
              />

              <div
                className="animate-pop relative z-10 flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl md:flex-row"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedKajian(null)}
                  className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
                >
                  <X size={18} />
                </button>

                <div className="h-60 w-full shrink-0 overflow-hidden bg-slate-100 md:h-auto md:w-1/2">
                  <img
                    src={selectedKajian.image || 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=800&q=80'}
                    alt={selectedKajian.khotib}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between overflow-y-auto p-8 md:w-1/2">
                  <div>
                    <span className="rounded-lg bg-emerald-50 px-3 py-1 text-[9px] font-black tracking-widest text-[#0d8a5e] uppercase">
                      {selectedKajian.jenis_kegiatan}
                    </span>
                    <h3 className="font-serif-elegant mt-3 mb-2 text-2xl font-bold text-[#0a1f18]">
                      {selectedKajian.khotib}
                    </h3>
                    <div className="my-4 space-y-3">
                      <div>
                        <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Tema Ceramah</p>
                        <p className="text-sm font-medium text-slate-700 italic mt-0.5">
                          "{selectedKajian.tema || 'Tema kajian belum ditentukan'}"
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Waktu & Tanggal</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">
                          {new Date(selectedKajian.tanggal).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      {selectedKajian.link && (
                        <div>
                          <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Tautan Siaran</p>
                          <a
                            href={selectedKajian.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-emerald-600 hover:underline break-all"
                          >
                            {selectedKajian.link}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedKajian(null)}
                    className="mt-6 w-full rounded-2xl bg-[#0a1f18] py-3.5 text-xs font-black tracking-widest text-white transition-all hover:bg-[#0d8a5e] active:scale-95"
                  >
                    TUTUP DETAIL
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* --- 3. INVENTARIS / FASILITAS SLIDE --- */}
        <section id="fasilitas" className="scroll-mt-32 overflow-hidden">
          <div className="relative min-h-[480px] rounded-[2.5rem] bg-[#0a1f18] text-white shadow-2xl transition-all duration-700 md:rounded-[3rem]">
            {/* Tombol Manual Slide */}
            <div className="absolute right-8 bottom-6 z-30 flex gap-2">
              <button
                onClick={() => setActiveSlide(0)}
                className={`h-2.5 rounded-full transition-all ${activeSlide === 0 ? 'w-8 bg-[#d4af37]' : 'w-2.5 bg-white/20'}`}
                title="Ringkasan Fasilitas"
              />
              <button
                onClick={() => setActiveSlide(1)}
                className={`h-2.5 rounded-full transition-all ${activeSlide === 1 ? 'w-8 bg-[#d4af37]' : 'w-2.5 bg-white/20'}`}
                title="Tabel Aset Fisik"
              />
            </div>

            {/* SLIDE 1: Ringkas Inventaris */}
            <div
              className={`flex flex-col transition-all duration-700 md:flex-row ${
                activeSlide === 0
                  ? 'translate-x-0 opacity-100'
                  : 'pointer-events-none absolute inset-0 -translate-x-full opacity-0'
              }`}
            >
              <div className="relative z-10 flex-1 p-8 md:p-14 lg:p-16">
                <p className="mb-4 flex items-center gap-3 text-[10px] font-black tracking-widest text-[#d4af37] uppercase">
                  <span className="h-px w-6 bg-[#d4af37]" /> Manajemen Fasilitas
                </p>
                <h2 className="font-serif-elegant mb-5 text-3xl leading-tight font-bold md:text-5xl">
                  Kenyamanan Ibadah <br /> Jamaah Selalu Terjaga
                </h2>
                <p className="mb-8 max-w-lg text-sm text-slate-300 leading-relaxed font-medium">
                  Kami merawat aset fisik dan sarana penunjang ibadah secara berkala. Seluruh aset terinventarisasi
                  secara teratur untuk memastikan operasional masjid senantiasa optimal.
                </p>
                <ul className="space-y-3.5">
                  {[
                    'Ruang Ibadah Berpendingin Udara (AC Standing Daikin)',
                    'Sistem Tata Suara Akustik Jernih & Mic Shure',
                    'Area Bersuci & Fasilitas Wudhu Higienis',
                    'Daya Cadangan Genset Otomatis saat Pemadaman',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs md:text-sm font-bold text-slate-200">
                      <CheckCircle size={16} className="text-[#0d8a5e] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-center bg-[#071510] p-8 md:w-1/3">
                <div className="text-center">
                  <p className="font-serif-elegant text-7xl font-bold text-white md:text-8xl">
                    {totalFasilitas}
                  </p>
                  <p className="mt-3 border-t border-[#0d8a5e]/30 pt-3 text-[10px] font-black tracking-widest text-[#0d8a5e] uppercase">
                    Aset Utama Tercatat
                  </p>
                  <button
                    onClick={() => setActiveSlide(1)}
                    className="mt-6 text-[10px] font-bold text-[#d4af37] hover:text-white uppercase tracking-wider underline flex items-center justify-center gap-1 mx-auto"
                  >
                    Buka Daftar Aset <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* SLIDE 2: Tabel Fasilitas Lengkap */}
            <div
              className={`p-6 transition-all duration-700 md:p-12 ${
                activeSlide === 1
                  ? 'translate-x-0 opacity-100'
                  : 'pointer-events-none absolute inset-0 translate-x-full opacity-0'
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black tracking-widest text-[#d4af37] uppercase">Daftar Terverifikasi</p>
                  <h2 className="font-serif-elegant text-2xl font-bold md:text-3xl">Inventaris Fasilitas</h2>
                </div>
                <button
                  onClick={() => setActiveSlide(0)}
                  className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                >
                  Kembali ke Ringkasan
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                      <th className="p-4">Nama Barang</th>
                      <th className="p-4 text-center">Jumlah</th>
                      <th className="p-4 text-center">Kondisi</th>
                      <th className="p-4">Lokasi Penempatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {fasilitas.slice(0, 5).map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white">{item.nama_barang}</td>
                        <td className="p-4 text-center font-mono">{item.jumlah} Unit</td>
                        <td className="p-4 text-center">
                          <span
                            className={`rounded-md px-2.5 py-1 text-[9px] font-black uppercase ${
                              item.kondisi === 'baik'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {item.kondisi}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300">{item.lokasi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* --- 4. TRANSPARANSI KEUANGAN SLIDE --- */}
        <section id="keuangan" className="scroll-mt-32 overflow-hidden">
          <div className="relative min-h-[420px] rounded-[2.5rem] bg-[#0d8a5e] p-6 text-center text-white shadow-2xl transition-all duration-700 md:rounded-[3rem] md:p-12 lg:p-16">
            {/* Background Icon Decor */}
            <div className="pointer-events-none absolute -top-8 -right-8 opacity-10 mix-blend-overlay">
              <Wallet size={280} />
            </div>

            {/* Indicator Slide */}
            <div className="absolute right-8 bottom-6 z-30 flex gap-2">
              <button
                onClick={() => setActiveKeuanganSlide(0)}
                className={`h-2.5 rounded-full transition-all ${
                  activeKeuanganSlide === 0 ? 'w-8 bg-white' : 'w-2.5 bg-white/30'
                }`}
                title="Saldo Kas"
              />
              <button
                onClick={() => setActiveKeuanganSlide(1)}
                className={`h-2.5 rounded-full transition-all ${
                  activeKeuanganSlide === 1 ? 'w-8 bg-white' : 'w-2.5 bg-white/30'
                }`}
                title="Arus Kas Terbaru"
              />
            </div>

            {/* SLIDE 1: TOTAL SALDO */}
            <div
              className={`transition-all duration-700 ${
                activeKeuanganSlide === 0
                  ? 'relative z-10 scale-100 opacity-100'
                  : 'pointer-events-none absolute inset-0 scale-95 opacity-0'
              }`}
            >
              <p className="mb-4 flex items-center justify-center gap-3 text-[10px] font-black tracking-widest text-emerald-100 uppercase">
                <span className="h-px w-6 bg-emerald-200" /> Transparansi Terbuka Real-Time{' '}
                <span className="h-px w-6 bg-emerald-200" />
              </p>
              <h2 className="font-serif-elegant mb-6 text-3xl font-bold md:text-5xl">
                Total Saldo Kas Umat
              </h2>

              {loading ? (
                <div className="mx-auto h-20 w-3/4 animate-pulse rounded-3xl bg-emerald-700/50" />
              ) : (
                <div className="inline-block rounded-3xl border border-emerald-400/40 bg-emerald-900/30 px-8 py-6 backdrop-blur-xs shadow-xl">
                  <p className="font-serif-elegant text-4xl font-bold tracking-tight drop-shadow-lg md:text-6xl">
                    <span className="mr-2 align-top text-xl text-emerald-300 md:text-3xl">Rp</span>
                    {saldo.toLocaleString('id-ID')}
                  </p>
                </div>
              )}

              <p className="mx-auto mt-7 max-w-md text-xs leading-relaxed font-medium text-emerald-50 opacity-80 md:text-sm">
                Dana diperbarui secara otomatis. Setiap rupiah yang disalurkan melalui infaq dan sedekah tercatat
                dengan amanah demi kemakmuran masjid dan jamaah.
              </p>

              <button
                onClick={() => setActiveKeuanganSlide(1)}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-white/90 hover:text-white underline underline-offset-4"
              >
                Lihat 4 Aliran Dana Terakhir <ArrowRight size={14} />
              </button>
            </div>

            {/* SLIDE 2: TABEL TRANSAKSI TERAKHIR */}
            <div
              className={`transition-all duration-700 ${
                activeKeuanganSlide === 1
                  ? 'relative z-10 translate-y-0 opacity-100'
                  : 'pointer-events-none absolute inset-0 translate-y-10 opacity-0'
              }`}
            >
              <div className="mb-6">
                <p className="text-[10px] font-black tracking-widest text-emerald-200 uppercase">Aktivitas Terakhir</p>
                <h2 className="font-serif-elegant text-2xl font-bold md:text-4xl">Aliran Arus Kas</h2>
              </div>

              <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-emerald-900/40 backdrop-blur-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-emerald-800/60 text-[9px] font-black tracking-widest text-emerald-200 uppercase">
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Keterangan</th>
                        <th className="px-4 py-3 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {dataKeuangan.slice(0, 4).map((trx, idx) => (
                        <tr key={idx} className="transition-colors hover:bg-white/5">
                          <td className="px-4 py-3 font-medium opacity-75">{trx.tanggal}</td>
                          <td className="max-w-[180px] truncate px-4 py-3 font-bold md:max-w-xs">
                            {trx.keterangan}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-black ${
                              trx.tipe === 'masuk' ? 'text-emerald-200' : 'text-red-200'
                            }`}
                          >
                            {trx.tipe === 'masuk' ? '+' : '-'} Rp {Number(trx.nominal).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={() => setActiveKeuanganSlide(0)}
                className="mt-6 text-xs font-bold text-white/80 hover:text-white underline underline-offset-4"
              >
                ← Kembali ke Total Saldo
              </button>
            </div>
          </div>
        </section>

        {/* --- MODAL QRIS DONASI --- */}
        {showDonasiModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="animate-fade-in fixed inset-0 bg-black/50 backdrop-blur-xs duration-300"
              onClick={() => setShowDonasiModal(false)}
            />

            <div className="animate-pop relative z-10 w-full max-w-[340px] overflow-hidden rounded-[2.5rem] bg-white p-6 text-center shadow-2xl">
              <div className="mb-4">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#0d8a5e]">
                  <Heart size={24} className="fill-current" />
                </div>
                <h3 className="font-serif-elegant text-2xl font-bold text-[#0a1f18]">Infaq & Sedekah</h3>
                <p className="text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  Masjid Al-Mukhlisin
                </p>
              </div>

              {/* QR Code */}
              <div className="relative mx-auto mb-5 aspect-square w-52 overflow-hidden rounded-2xl border-2 border-slate-100 bg-white p-3 shadow-inner">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=DonasiMasjidAlMukhlisin"
                  alt="QRIS Donasi"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="mb-6 space-y-1 px-2">
                <p className="text-[11px] leading-tight font-bold text-slate-700">
                  Scan QRIS via Mobile Banking (BSI, BCA, Mandiri) atau E-Wallet (Gopay, OVO, Dana)
                </p>
                <p className="text-[9px] text-slate-400 italic mt-1">
                  "Perumpamaan orang yang menafkahkan hartanya di jalan Allah seperti sebutir benih yang menumbuhkan tujuh bulir..."
                </p>
              </div>

              <button
                onClick={() => setShowDonasiModal(false)}
                className="w-full rounded-2xl bg-slate-900 py-3 text-xs font-black tracking-widest text-white transition-all hover:bg-[#0d8a5e] active:scale-95"
              >
                TUTUP
              </button>
            </div>
          </div>
        )}
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-200 bg-white pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-16 grid gap-12 md:grid-cols-4">
            {/* Info Masjid */}
            <div className="md:col-span-2">
              <div className="mb-6">
                <span className="font-serif-elegant text-2xl md:text-3xl font-bold text-[#0a1f18] block leading-none">
                  Al-Mukhlisin
                </span>
              </div>
              <p className="mb-8 max-w-md text-sm leading-relaxed font-medium text-slate-500">
                Menjadi pusat ibadah yang makmur, melayani jamaah dengan sistem modern, transparansi penuh, dan
                berlandaskan Al-Qur'an serta As-Sunnah.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-xs font-bold text-slate-600 transition-all hover:border-[#0d8a5e] hover:bg-[#0d8a5e] hover:text-white"
              >
                <Shield size={16} /> Portal Pengurus Masjid
              </Link>
            </div>

            {/* Kontak & Alamat */}
            <div>
              <h4 className="mb-6 font-bold text-[#0a1f18]">Informasi & Lokasi</h4>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-slate-500">
                  <MapPin className="mt-0.5 shrink-0 text-[#0d8a5e]" size={18} />
                  <div>
                    <span className="block font-medium text-slate-700">Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar</span>
                    <span className="inline-block mt-1.5 font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      ID 01.4.13.04.06.000158
                    </span>
                  </div>
                </li>
                <li className="flex gap-3 text-sm text-slate-500">
                  <Clock className="mt-0.5 shrink-0 text-[#0d8a5e]" size={18} />
                  <span>Buka 24 Jam untuk Ibadah & Syiar</span>
                </li>
              </ul>
            </div>

            {/* Media Sosial */}
            <div>
              <h4 className="mb-6 font-bold text-[#0a1f18]">Media Sosial</h4>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-[#0d8a5e] hover:text-white"
                  title="Instagram"
                >
                  <IconInstagram size={18} />
                </a>
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-[#0d8a5e] hover:text-white"
                  title="YouTube"
                >
                  <IconYoutube size={18} />
                </a>
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-[#0d8a5e] hover:text-white"
                  title="Facebook"
                >
                  <IconFacebook size={18} />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-center md:flex-row md:text-left">
            <p className="text-xs font-bold text-slate-400">
              &copy; {currentYear} Masjid Al-Mukhlisin. All rights reserved.
            </p>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Next.js + Supabase Architecture (Vercel Ready)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
