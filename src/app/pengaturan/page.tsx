'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  Download,
  Copy,
  CheckCircle2,
  Building,
  Database,
  RefreshCw,
  KeyRound,
  Lock,
  Trash2,
} from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import { DataService } from '@/lib/data-service';
import { IdentitasMasjid } from '@/types';

export default function PengaturanPage() {
  const [identitas, setIdentitas] = useState<IdentitasMasjid>({
    nama: 'Al-Mukhlisin',
    nomor_id_kemenag: '01.4.13.04.06.000158',
    alamat: 'Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar',
    ketua_dkm: 'Ustadz H. Ahmad Sobari',
    bendahara: 'H. Mulyadi, S.E.',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  // Backup states
  const [backupJson, setBackupJson] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Password states
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwSavedOk, setPwSavedOk] = useState(false);
  const [pwError, setPwError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await DataService.getIdentitas();
      setIdentitas(data);
    } catch (e) {
      console.error('Failed to load identitas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined') {
      const stored =
        localStorage.getItem('masjid_admin_password') ||
        process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
        'Mukhlisin2026!';
      setCurrentPw(stored);
    }
  }, []);

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) {
      setPwError('Kata sandi baru minimal 6 karakter');
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('masjid_admin_password', newPw);
      setCurrentPw(newPw);
      setNewPw('');
      setPwError('');
      setPwSavedOk(true);
      setTimeout(() => setPwSavedOk(false), 3000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await DataService.updateIdentitas(identitas);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan identitas masjid');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateBackup = async () => {
    setBackupLoading(true);
    try {
      const data = await DataService.exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);
      setBackupJson(jsonStr);
    } catch (e) {
      alert('Gagal membuat cadangan data');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleCopyBackup = () => {
    if (!backupJson) return;
    navigator.clipboard.writeText(backupJson).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    });
  };

  const handleDownloadBackup = () => {
    if (!backupJson) return;
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Masjid_Al_Mukhlisin_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = async () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mengosongkan seluruh data transaksi (Kas, Jamaah, Inventaris, Zakat, dll)? Data akan bersih dimulai dari nol (0).'
      )
    ) {
      await DataService.clearAllData();
      alert('Seluruh data transaksi lokal telah berhasil dikosongkan.');
      window.location.reload();
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
            <Settings size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Pengaturan & Cadangan Data</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola identitas resmi SIMAS Kemenag dan lakukan backup/restore seluruh data masjid
            </p>
          </div>
        </div>

        {/* ============================= */}
        {/* SECTION 1: IDENTITAS MASJID */}
        {/* ============================= */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Building size={18} className="text-emerald-700" />
            <h2 className="font-black text-slate-800 text-base">Identitas Resmi Masjid</h2>
            <span className="text-[10px] font-bold text-slate-400 border border-slate-200 rounded-full px-2 py-0.5 uppercase tracking-wide">
              SIMAS Kemenag RI
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400 text-center py-6">Memuat data identitas...</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-5 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
                    Nama Masjid
                  </label>
                  <input
                    type="text"
                    required
                    value={identitas.nama}
                    onChange={(e) => setIdentitas({ ...identitas, nama: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    placeholder="Contoh: Al-Mukhlisin"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
                    Nomor ID SIMAS Kemenag RI
                  </label>
                  <input
                    type="text"
                    required
                    value={identitas.nomor_id_kemenag}
                    onChange={(e) =>
                      setIdentitas({ ...identitas, nomor_id_kemenag: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    placeholder="Contoh: 01.4.13.04.06.000158"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
                  Alamat Lengkap Masjid
                </label>
                <textarea
                  rows={2}
                  required
                  value={identitas.alamat}
                  onChange={(e) => setIdentitas({ ...identitas, alamat: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
                  placeholder="Contoh: Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar, Kec. Margaasih, Kab. Bandung"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
                    Nama Ketua DKM
                  </label>
                  <input
                    type="text"
                    required
                    value={identitas.ketua_dkm}
                    onChange={(e) => setIdentitas({ ...identitas, ketua_dkm: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    placeholder="Contoh: Ustadz H. Ahmad Sobari"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
                    Nama Bendahara DKM
                  </label>
                  <input
                    type="text"
                    required
                    value={identitas.bendahara}
                    onChange={(e) => setIdentitas({ ...identitas, bendahara: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    placeholder="Contoh: H. Mulyadi, S.E."
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div>
                  {savedOk && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 size={15} /> Identitas berhasil disimpan!
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-900/20 transition disabled:opacity-60"
                >
                  {saving ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  {saving ? 'Menyimpan...' : 'Simpan Identitas'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ============================= */}
        {/* SECTION 2: BACKUP DATA */}
        {/* ============================= */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Database size={18} className="text-emerald-700" />
            <h2 className="font-black text-slate-800 text-base">Cadangan Data (Backup)</h2>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Ekspor seluruh data masjid (Kas, Jamaah, Zakat, Inventaris, Wakaf, Petugas Jumat) ke
            format JSON untuk disimpan sebagai arsip atau dipindah ke perangkat lain.
          </p>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button
              onClick={handleGenerateBackup}
              disabled={backupLoading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-md disabled:opacity-60"
            >
              {backupLoading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Database size={14} />
              )}
              {backupLoading ? 'Menyiapkan...' : 'Buat File Backup JSON'}
            </button>

            {backupJson && (
              <>
                <button
                  onClick={handleCopyBackup}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center gap-2 transition"
                >
                  {copiedJson ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                  {copiedJson ? 'Tersalin!' : 'Salin ke Clipboard'}
                </button>
                <button
                  onClick={handleDownloadBackup}
                  className="px-4 py-2.5 border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold rounded-xl flex items-center gap-2 transition"
                >
                  <Download size={14} /> Unduh File .json
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleClearAllData}
              className="px-4 py-2.5 border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold rounded-xl flex items-center gap-2 transition"
              title="Kosongkan seluruh data transaksi agar bersih dari 0"
            >
              <Trash2 size={14} /> Kosongkan Data Transaksi (Mulai dari 0)
            </button>
          </div>

          {backupJson && (
            <div className="relative">
              <pre className="w-full h-52 overflow-auto text-[10px] font-mono bg-slate-900 text-emerald-300 rounded-2xl p-4 border border-slate-700">
                {backupJson}
              </pre>
            </div>
          )}
        </div>

        {/* ============================= */}
        {/* SECTION 3: KEAMANAN & KATA SANDI */}
        {/* ============================= */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound size={18} className="text-emerald-700" />
            <h2 className="font-black text-slate-800 text-base">Keamanan & Kata Sandi Administrator</h2>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Kelola kata sandi yang digunakan oleh pengurus DKM untuk masuk ke Pusat Komando Administrator.
          </p>

          <form onSubmit={handleSavePassword} className="max-w-md space-y-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Kata Sandi Aktif Saat Ini
              </span>
              <p className="font-mono text-sm font-bold text-emerald-800">
                {currentPw || 'Mukhlisin2026!'}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                Ubah Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Masukkan kata sandi baru (min. 6 karakter)..."
                  className="w-full text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-900"
                />
                <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
              {pwError && (
                <p className="text-[11px] font-bold text-red-600 mt-1.5">{pwError}</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Save size={14} /> Simpan Kata Sandi Baru
              </button>
              {pwSavedOk && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={15} /> Sandi berhasil diperbarui!
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
