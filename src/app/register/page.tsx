'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await register(name, email, password);
      if (res.success) {
        setSuccessMessage('Registrasi pengurus berhasil! Mengalihkan ke dashboard...');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1200);
      } else {
        setErrorMessage(res.error || 'Pendaftaran gagal');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-3.5 sm:px-4 py-8 sm:py-12 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-slate-400 hover:text-white flex items-center gap-2 text-xs font-bold transition-colors z-20"
      >
        <ArrowLeft size={16} /> Kembali ke Beranda
      </Link>

      <div className="w-full max-w-md rounded-2xl sm:rounded-[3rem] bg-white p-6 sm:p-8 md:p-10 shadow-2xl relative z-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-900 border border-emerald-500/30 shadow-md overflow-hidden">
            <img src="/icon.svg" alt="Masjid Al-Mukhlisin" className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black text-emerald-950 font-serif-elegant">Al-Mukhlisin</h2>
          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-1">
            Pendaftaran Akun Pengurus Masjid
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 animate-pulse rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-bold text-red-600">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="px-2 text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5">
              Nama Lengkap Pengurus
            </label>
            <div className="relative">
              <input
                type="text"
                required
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 pl-11 text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
                placeholder="Ustadz Abdullah"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <User className="absolute left-4 top-3.5 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="px-2 text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5">
              Email Pengurus
            </label>
            <div className="relative">
              <input
                type="email"
                required
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 pl-11 text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
                placeholder="pengurus@masjid.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="px-2 text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5">
              Kata Sandi (Min. 6 Karakter)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 pl-11 text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={16} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 py-4 font-black text-xs tracking-widest text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
          >
            {loading ? 'MENDAFTAR...' : 'BUAT AKUN PENGURUS'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-bold text-emerald-600 hover:underline">
              Masuk Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
