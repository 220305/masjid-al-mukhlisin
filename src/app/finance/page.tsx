'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Wallet,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Download,
  Search,
  Filter,
  X,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import { DataService } from '@/lib/data-service';
import { KasItem, TipeKas } from '@/types';

const KETERANGAN_OPTIONS = [
  'Infaq Jumat',
  'Donasi',
  'Zakat',
  'Operasional',
  'Listrik & Air',
  'Honor',
  'Perawatan',
  'Lainnya',
];

export default function FinancePage() {
  const [dataKas, setDataKas] = useState<KasItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewData, setViewData] = useState<KasItem | null>(null);
  const [editData, setEditData] = useState<KasItem | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'masuk' | 'keluar'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  const [currentDateStr, setCurrentDateStr] = useState('');

  // Add Form State
  const [formData, setFormData] = useState({
    keterangan: 'Infaq Jumat',
    keteranganCustom: '',
    nominal: '',
    tipe: 'masuk' as TipeKas,
    tanggal: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await DataService.getKas();
      setDataKas(items);
    } catch (error) {
      console.error('Failed to load kas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentDateStr(new Date().toLocaleDateString('id-ID'));
    setFormData((prev) => ({ ...prev, tanggal: today }));
    loadData();
  }, []);

  // Filtered Data
  const filteredData = useMemo(() => {
    return dataKas.filter((item) => {
      const matchesSearch = item.keterangan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = filterCategory === 'all' || item.tipe === filterCategory;
      const matchesDate = (!startDate || item.tanggal >= startDate) && (!endDate || item.tanggal <= endDate);
      return matchesSearch && matchesCat && matchesDate;
    });
  }, [dataKas, searchTerm, filterCategory, startDate, endDate]);

  const totalInfaq = useMemo(
    () => filteredData.filter((i) => i.tipe === 'masuk').reduce((a, b) => a + Number(b.nominal), 0),
    [filteredData]
  );
  const totalKeluar = useMemo(
    () => filteredData.filter((i) => i.tipe === 'keluar').reduce((a, b) => a + Number(b.nominal), 0),
    [filteredData]
  );

  // Handlers
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.keterangan || !formData.nominal) return;
    const finalKeterangan =
      formData.keterangan === 'Lainnya' && formData.keteranganCustom.trim()
        ? `Lainnya: ${formData.keteranganCustom.trim()}`
        : formData.keterangan;

    try {
      await DataService.addKas({
        keterangan: finalKeterangan,
        nominal: parseFloat(formData.nominal),
        tipe: formData.tipe,
        tanggal: formData.tanggal,
      });
      setShowAddModal(false);
      setFormData({
        keterangan: 'Infaq Jumat',
        keteranganCustom: '',
        nominal: '',
        tipe: 'masuk',
        tanggal: new Date().toISOString().split('T')[0],
      });
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Gagal menambahkan transaksi');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;
    try {
      await DataService.updateKas(editData.id, {
        keterangan: editData.keterangan,
        nominal: Number(editData.nominal),
        tipe: editData.tipe,
        tanggal: editData.tanggal,
      });
      setShowEditModal(false);
      setEditData(null);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Gagal mengubah transaksi');
    }
  };

  const handleDelete = async (id: number | string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan transaksi ini?')) {
      try {
        await DataService.deleteKas(id);
        loadData();
      } catch (err: any) {
        alert(err?.message || 'Gagal menghapus catatan');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: number | string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 pb-24">
        {/* Print-Only Title Header */}
        <div className="hidden print-only-title">
          LAPORAN MUTASI KEUANGAN KAS MASJID AL-MUKHLISIN
          <p className="text-xs font-normal mt-1">Dicetak pada: {currentDateStr || '-'}</p>
        </div>

        {/* Top Header */}
        <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 font-serif-elegant">Manajemen Kas</h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
              Transparansi Keuangan Terbuka
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-600 transition-colors shadow-xs"
              title="Cetak Laporan"
            >
              <Printer size={16} /> <span className="hidden sm:inline">Cetak Laporan</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0d8a5e] text-white hover:bg-emerald-700 text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-emerald-900/10 active:scale-95"
            >
              <Plus size={18} /> <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xs">
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Saldo Akhir Kas</p>
            <p className="mt-2 text-2xl md:text-3xl font-black text-emerald-800 font-serif-elegant">
              Rp {(totalInfaq - totalKeluar).toLocaleString('id-ID')}
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xs">
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Total Pemasukan</p>
            <p className="mt-2 text-2xl md:text-3xl font-black text-blue-600 font-serif-elegant">
              Rp {totalInfaq.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xs">
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Total Pengeluaran</p>
            <p className="mt-2 text-2xl md:text-3xl font-black text-red-500 font-serif-elegant">
              Rp {totalKeluar.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="no-print rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xs space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari keterangan transaksi kas..."
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 pl-11 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
              {(['all', 'masuk', 'keluar'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    filterCategory === cat ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'Semua' : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-xs text-slate-400 font-bold">s/d</span>
              <input
                type="date"
                className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {(searchTerm || filterCategory !== 'all' || startDate || endDate) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-red-500 font-bold hover:underline ml-auto"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Printable Data Table */}
        <div id="printable-area" className="rounded-[2.5rem] border border-slate-100 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                <tr>
                  <th className="no-print px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                    />
                  </th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4 text-right">Nominal</th>
                  <th className="no-print px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          selectedIds.length > 0 && !isSelected ? 'no-print-row' : ''
                        }`}
                      >
                        <td className="no-print px-6 py-4">
                          <input
                            type="checkbox"
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(item.id)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 uppercase">{item.keterangan}</div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              item.tipe === 'masuk'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {item.tipe}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500">{item.tanggal}</td>
                        <td
                          className={`px-6 py-4 text-right font-mono font-black text-xs ${
                            item.tipe === 'masuk' ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {item.tipe === 'masuk' ? '+' : '-'} Rp {Number(item.nominal).toLocaleString('id-ID')}
                        </td>
                        <td className="no-print px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-slate-400">
                            <button
                              onClick={() => setViewData(item)}
                              className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setEditData(item);
                                setShowEditModal(true);
                              }}
                              className="p-1.5 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Transaksi"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Tidak ada catatan transaksi kas yang cocok dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Print Summary at Bottom */}
          <div className="border-t-2 border-emerald-900 p-6 text-right hidden print:block">
            <p className="text-sm font-black text-emerald-900 uppercase">
              Total Saldo Terpilih: Rp{' '}
              {filteredData
                .filter((i) => (selectedIds.length > 0 ? selectedIds.includes(i.id) : true))
                .reduce((acc, curr) => (curr.tipe === 'masuk' ? acc + Number(curr.nominal) : acc - Number(curr.nominal)), 0)
                .toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* --- MODAL ADD --- */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
            <div className="animate-pop relative z-10 w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 font-serif-elegant">Catat Kas Baru</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                    Keterangan
                  </label>
                  <select
                    required
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900 cursor-pointer"
                    value={formData.keterangan}
                    onChange={(e) => {
                      const val = e.target.value;
                      let newTipe = formData.tipe;
                      if (['Infaq Jumat', 'Donasi', 'Zakat'].includes(val)) {
                        newTipe = 'masuk';
                      } else if (['Operasional', 'Listrik & Air', 'Honor', 'Perawatan'].includes(val)) {
                        newTipe = 'keluar';
                      }
                      setFormData({ ...formData, keterangan: val, tipe: newTipe });
                    }}
                  >
                    {KETERANGAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  {formData.keterangan === 'Lainnya' && (
                    <input
                      type="text"
                      placeholder="Tuliskan rincian keterangan lainnya..."
                      className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900"
                      value={formData.keteranganCustom}
                      onChange={(e) => setFormData({ ...formData, keteranganCustom: e.target.value })}
                    />
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="100000"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900 font-mono"
                    value={formData.nominal}
                    onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                      Jenis Arus Kas
                    </label>
                    <select
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900"
                      value={formData.tipe}
                      onChange={(e) => setFormData({ ...formData, tipe: e.target.value as TipeKas })}
                    >
                      <option value="masuk">Pemasukan (+)</option>
                      <option value="keluar">Pengeluaran (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900 font-mono"
                      value={formData.tanggal}
                      onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-emerald-600 py-4 text-xs font-black tracking-widest text-white hover:bg-emerald-700 transition-colors mt-4"
                >
                  SIMPAN TRANSAKSI
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL EDIT --- */}
        {showEditModal && editData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowEditModal(false)} />
            <div className="animate-pop relative z-10 w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 font-serif-elegant">Edit Transaksi Kas</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                    Keterangan
                  </label>
                  <select
                    required
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900 cursor-pointer"
                    value={
                      KETERANGAN_OPTIONS.includes(editData.keterangan)
                        ? editData.keterangan
                        : 'Lainnya'
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      let newTipe = editData.tipe;
                      if (['Infaq Jumat', 'Donasi', 'Zakat'].includes(val)) {
                        newTipe = 'masuk';
                      } else if (['Operasional', 'Listrik & Air', 'Honor', 'Perawatan'].includes(val)) {
                        newTipe = 'keluar';
                      }
                      setEditData({ ...editData, keterangan: val, tipe: newTipe });
                    }}
                  >
                    {KETERANGAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    {!KETERANGAN_OPTIONS.includes(editData.keterangan) && (
                      <option value={editData.keterangan}>{editData.keterangan}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900 font-mono"
                    value={editData.nominal}
                    onChange={(e) => setEditData({ ...editData, nominal: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                      Jenis
                    </label>
                    <select
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900"
                      value={editData.tipe}
                      onChange={(e) => setEditData({ ...editData, tipe: e.target.value as TipeKas })}
                    >
                      <option value="masuk">Pemasukan (+)</option>
                      <option value="keluar">Pengeluaran (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900 font-mono"
                      value={editData.tanggal}
                      onChange={(e) => setEditData({ ...editData, tanggal: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-amber-600 py-4 text-xs font-black tracking-widest text-white hover:bg-amber-700 transition-colors mt-4"
                >
                  PERBARUI TRANSAKSI
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL VIEW DETAIL --- */}
        {viewData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setViewData(null)} />
            <div className="animate-pop relative z-10 w-full max-w-sm rounded-[2.5rem] bg-white p-8 shadow-2xl text-center">
              <div
                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                  viewData.tipe === 'masuk' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}
              >
                {viewData.tipe === 'masuk' ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{viewData.keterangan}</h3>
              <p
                className={`text-2xl font-black font-mono my-3 ${
                  viewData.tipe === 'masuk' ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {viewData.tipe === 'masuk' ? '+' : '-'} Rp {Number(viewData.nominal).toLocaleString('id-ID')}
              </p>
              <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500 space-y-2 text-left mb-6">
                <div className="flex justify-between">
                  <span className="font-bold">Tanggal:</span>
                  <span className="font-mono text-slate-700">{viewData.tanggal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Jenis:</span>
                  <span className="capitalize font-bold text-slate-700">{viewData.tipe}</span>
                </div>
              </div>
              <button
                onClick={() => setViewData(null)}
                className="w-full rounded-2xl bg-slate-900 py-3.5 text-xs font-black tracking-widest text-white hover:bg-slate-800 transition-colors"
              >
                TUTUP
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
