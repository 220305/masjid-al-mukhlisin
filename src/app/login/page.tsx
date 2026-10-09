'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, isSupabaseConnected } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setErrorMessage(res.error || 'Login gagal, periksa email dan password Anda');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setEmail('admin@masjid.id');
    setPassword('admin123');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Floating Home Link */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 text-xs font-bold transition-colors z-20"
      >
        <ArrowLeft size={16} /> Kembali ke Beranda
      </Link>

      <div className="w-full max-w-md rounded-[3rem] bg-white p-8 md:p-10 shadow-2xl relative z-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 shadow-inner">
            <Shield size={28} />
          </div>
          <h2 className="text-3xl font-black text-emerald-950 font-serif-elegant">Al-Mukhlisin</h2>
          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-1">
            Pusat Komando Administrator
          </p>
        </div>

        {/* Database backend badge info */}
        <div className="mb-6 rounded-2xl bg-slate-50 border border-slate-100 p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
            <span className="font-bold text-slate-600">
              {isSupabaseConnected ? 'Supabase Auth' : 'Demo Mode (Offline)'}
            </span>
          </div>
          {!isSupabaseConnected && (
            <button
              type="button"
              onClick={handleUseDemo}
              className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              Isi Demo
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="mb-5 animate-pulse rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-bold text-red-600">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="px-2 text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5">
              Email Pengurus
            </label>
            <div className="relative">
              <input
                type="email"
                required
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 pl-11 text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
                placeholder="admin@masjid.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="px-2 text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                required
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
            {loading ? 'MEMVERIFIKASI...' : 'MASUK KE DASHBOARD'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Belum punya akun pengurus?{' '}
            <Link href="/register" className="font-bold text-emerald-600 hover:underline">
              Daftar Baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
