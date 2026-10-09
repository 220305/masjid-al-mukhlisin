'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  HandHeart,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Download,
  Search,
  X,
  Coins,
  Wheat,
  Scale,
  Users2,
  Sparkles,
  RefreshCw,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import { DataService } from '@/lib/data-service';
import { ZakatQurbanItem, JenisZakat } from '@/types';

export default function ZakatPage() {
  const [dataZakat, setDataZakat] = useState<ZakatQurbanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<ZakatQurbanItem | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  // Form State
  const [formData, setFormData] = useState<{
    tanggal: string;
    nama: string;
    jenis: JenisZakat;
    jumlah_jiwa: string;
    beras_kg: string;
    nominal: string;
    keterangan: string;
  }>({
    tanggal: '',
    nama: '',
    jenis: 'Zakat Fitrah (uang)',
    jumlah_jiwa: '1',
    beras_kg: '0',
    nominal: '45000',
    keterangan: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await DataService.getZakatQurban();
      setDataZakat(items);
    } catch (error) {
      console.error('Failed to load zakat:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      tanggal: new Date().toISOString().split('T')[0],
    }));
    loadData();
  }, []);

  // Filtered
  const filteredZakat = useMemo(() => {
    return dataZakat.filter((item) => {
      const matchesSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesJenis = filterJenis === 'all' || item.jenis === filterJenis;
      return matchesSearch && matchesJenis;
    });
  }, [dataZakat, searchTerm, filterJenis]);

  // Statistics
  const totalFitrahUang = useMemo(
    () =>
      dataZakat
        .filter((z) => z.jenis === 'Zakat Fitrah (uang)')
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0),
    [dataZakat]
  );

  const totalFitrahBeras = useMemo(
    () =>
      dataZakat
        .filter((z) => z.jenis === 'Zakat Fitrah (beras)')
        .reduce((sum, item) => sum + Number(item.beras_kg || 0), 0),
    [dataZakat]
  );

  const totalZakatMal = useMemo(
    () =>
      dataZakat
        .filter((z) => z.jenis === 'Zakat Mal')
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0),
    [dataZakat]
  );

  const totalQurbanNominal = useMemo(
    () =>
      dataZakat
        .filter((z) => z.jenis.startsWith('Qurban'))
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0),
    [dataZakat]
  );

  const totalPenyaluranNominal = useMemo(
    () =>
      dataZakat
        .filter((z) => z.jenis === 'Penyaluran')
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0),
    [dataZakat]
  );

  const totalJiwaMuzakki = useMemo(
    () =>
      dataZakat
        .filter((z) => z.jenis !== 'Penyaluran')
        .reduce((sum, item) => sum + Number(item.jumlah_jiwa || 0), 0),
    [dataZakat]
  );

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredZakat.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: number | string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleJenisChange = (val: JenisZakat) => {
    let defNominal = '0';
    let defBeras = '0';
    let defJiwa = '1';

    if (val === 'Zakat Fitrah (uang)') {
      defNominal = '45000';
    } else if (val === 'Zakat Fitrah (beras)') {
      defBeras = '2.5';
    } else if (val === 'Qurban Sapi (1/7)') {
      defNominal = '3200000';
    } else if (val === 'Qurban Kambing') {
      defNominal = '2750000';
    }

    setFormData({
      ...formData,
      jenis: val,
      nominal: defNominal,
      beras_kg: defBeras,
      jumlah_jiwa: defJiwa,
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.tanggal) return;
    try {
      await DataService.addZakatQurban({
        tanggal: formData.tanggal,
        nama: formData.nama,
        jenis: formData.jenis,
        jumlah_jiwa: parseInt(formData.jumlah_jiwa) || 1,
        beras_kg: parseFloat(formData.beras_kg) || 0,
        nominal: parseFloat(formData.nominal) || 0,
        keterangan: formData.keterangan,
      });
      setShowAddModal(false);
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        nama: '',
        jenis: 'Zakat Fitrah (uang)',
        jumlah_jiwa: '1',
        beras_kg: '0',
        nominal: '45000',
        keterangan: '',
      });
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Gagal menambahkan data');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem || !editItem.nama) return;
    try {
      await DataService.updateZakatQurban(editItem.id, {
        ...editItem,
        jumlah_jiwa: Number(editItem.jumlah_jiwa) || 1,
        beras_kg: Number(editItem.beras_kg) || 0,
        nominal: Number(editItem.nominal) || 0,
      });
      setShowEditModal(false);
      setEditItem(null);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Gagal memperbarui data');
    }
  };

  const handleDelete = async (id: number | string, nama: string) => {
    if (window.confirm(`Yakin ingin menghapus catatan zakat/qurban "${nama}"?`)) {
      try {
        await DataService.deleteZakatQurban(id);
        loadData();
      } catch (err: any) {
        alert(err?.message || 'Gagal menghapus data');
      }
    }
  };

  const getTargetData = () =>
    selectedIds.length > 0 ? dataZakat.filter((i) => selectedIds.includes(i.id)) : filteredZakat;

  const exportToExcel = () => {
    const prepare = getTargetData().map((i, idx) => ({
      No: idx + 1,
      Tanggal: i.tanggal,
      'Nama Muzakki / Penerima': i.nama,
      Jenis: i.jenis,
      'Jumlah Jiwa': i.jumlah_jiwa || 0,
      'Beras (Kg)': i.beras_kg || 0,
      'Nominal Uang (Rp)': i.nominal || 0,
      Keterangan: i.keterangan || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(prepare);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Zakat & Qurban');
    XLSX.writeFile(wb, `Zakat_Qurban_Al_Mukhlisin_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const printTable = () => {
    window.print();
  };

  const getJenisBadge = (jenis: JenisZakat) => {
    switch (jenis) {
      case 'Zakat Fitrah (uang)':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Zakat Fitrah (beras)':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Zakat Mal':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Qurban Sapi (1/7)':
      case 'Qurban Kambing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Penyaluran':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <HandHeart size={24} />
              </span>
              <h1 className="text-2xl font-black text-slate-800">Zakat, Infaq & Qurban</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pengelolaan Zakat Fitrah, Zakat Mal, Tabungan Qurban, dan Laporan Distribusi Mustahiq
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
              title="Segarkan Data"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={exportToExcel}
              className="px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2 transition shadow-xs"
            >
              <Download size={15} /> Ekspor Excel
            </button>
            <button
              onClick={printTable}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition shadow-xs"
            >
              <Printer size={15} /> Cetak
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-900/20 transition"
            >
              <Plus size={16} /> Catat Zakat / Qurban
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fitrah Uang</p>
            <p className="text-base font-black text-emerald-700 mt-1">{formatRupiah(totalFitrahUang)}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Terkumpul tunai</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fitrah Beras</p>
            <p className="text-base font-black text-amber-700 mt-1">{totalFitrahBeras.toFixed(1)} Kg</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Beras zakat</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zakat Mal</p>
            <p className="text-base font-black text-blue-700 mt-1">{formatRupiah(totalZakatMal)}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Zakat harta/penghasilan</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dana Qurban</p>
            <p className="text-base font-black text-purple-700 mt-1">{formatRupiah(totalQurbanNominal)}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Sapi & kambing</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penyaluran</p>
            <p className="text-base font-black text-rose-700 mt-1">{formatRupiah(totalPenyaluranNominal)}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Mustahiq tersalurkan</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jiwa Muzakki</p>
            <p className="text-base font-black text-slate-800 mt-1">{totalJiwaMuzakki} Jiwa</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Total donatur</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama muzakki/mustahiq, catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Jenis Transaksi</option>
              <option value="Zakat Fitrah (uang)">Zakat Fitrah (uang)</option>
              <option value="Zakat Fitrah (beras)">Zakat Fitrah (beras)</option>
              <option value="Zakat Mal">Zakat Mal</option>
              <option value="Qurban Sapi (1/7)">Qurban Sapi (1/7)</option>
              <option value="Qurban Kambing">Qurban Kambing</option>
              <option value="Penyaluran">Penyaluran Mustahiq</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredZakat.length && filteredZakat.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Nama Muzakki / Penerima</th>
                  <th className="py-3.5 px-4">Jenis</th>
                  <th className="py-3.5 px-4 text-center">Jiwa</th>
                  <th className="py-3.5 px-4 text-right">Beras (Kg)</th>
                  <th className="py-3.5 px-4 text-right">Nominal Uang</th>
                  <th className="py-3.5 px-4">Keterangan</th>
                  <th className="py-3.5 px-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-slate-400">
                      Memuat data zakat & qurban...
                    </td>
                  </tr>
                ) : filteredZakat.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-slate-400">
                      Tidak ada catatan zakat/qurban yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredZakat.map((item, index) => {
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition group">
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelectRow(item.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-medium">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {new Date(item.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {item.nama}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getJenisBadge(
                              item.jenis
                            )}`}
                          >
                            {item.jenis}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-700">
                          {item.jumlah_jiwa || 1}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-amber-700">
                          {item.beras_kg > 0 ? `${item.beras_kg} kg` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">
                          {item.nominal > 0 ? (
                            <span className={item.jenis === 'Penyaluran' ? 'text-rose-600' : 'text-emerald-700'}>
                              {formatRupiah(item.nominal)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                          {item.keterangan || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100">
                            <button
                              onClick={() => {
                                setEditItem(item);
                                setShowEditModal(true);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 bg-white transition"
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.nama)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 bg-white transition"
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-950 text-white">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <HandHeart size={16} className="text-emerald-400" /> Catat Zakat / Infaq / Qurban
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Muzakki / Donatur / Penerima *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Keluarga Bpk. Ahmad"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Transaksi *</label>
                  <select
                    value={formData.jenis}
                    onChange={(e) => handleJenisChange(e.target.value as JenisZakat)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="Zakat Fitrah (uang)">Zakat Fitrah (uang)</option>
                    <option value="Zakat Fitrah (beras)">Zakat Fitrah (beras)</option>
                    <option value="Zakat Mal">Zakat Mal (Harta)</option>
                    <option value="Qurban Sapi (1/7)">Qurban Sapi (1/7)</option>
                    <option value="Qurban Kambing">Qurban Kambing</option>
                    <option value="Penyaluran">Penyaluran Mustahiq</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jumlah Jiwa</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.jumlah_jiwa}
                      onChange={(e) => setFormData({ ...formData, jumlah_jiwa: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Beras (Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.beras_kg}
                      onChange={(e) => setFormData({ ...formData, beras_kg: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal Uang (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.nominal}
                    onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Keterangan / Catatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: 1 jiwa @ Rp 45.000 / atas nama almarhum..."
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-900/20 transition"
                  >
                    Simpan Catatan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-950 text-white">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Edit2 size={16} className="text-emerald-400" /> Perbarui Catatan Zakat / Qurban
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 text-slate-400 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={editItem.tanggal}
                    onChange={(e) => setEditItem({ ...editItem, tanggal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Muzakki / Donatur / Penerima *
                  </label>
                  <input
                    type="text"
                    required
                    value={editItem.nama}
                    onChange={(e) => setEditItem({ ...editItem, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Transaksi *</label>
                  <select
                    value={editItem.jenis}
                    onChange={(e) =>
                      setEditItem({ ...editItem, jenis: e.target.value as JenisZakat })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="Zakat Fitrah (uang)">Zakat Fitrah (uang)</option>
                    <option value="Zakat Fitrah (beras)">Zakat Fitrah (beras)</option>
                    <option value="Zakat Mal">Zakat Mal (Harta)</option>
                    <option value="Qurban Sapi (1/7)">Qurban Sapi (1/7)</option>
                    <option value="Qurban Kambing">Qurban Kambing</option>
                    <option value="Penyaluran">Penyaluran Mustahiq</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jumlah Jiwa</label>
                    <input
                      type="number"
                      min="1"
                      value={editItem.jumlah_jiwa || 1}
                      onChange={(e) =>
                        setEditItem({ ...editItem, jumlah_jiwa: parseInt(e.target.value) || 1 })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Beras (Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editItem.beras_kg || 0}
                      onChange={(e) =>
                        setEditItem({ ...editItem, beras_kg: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal Uang (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={editItem.nominal || 0}
                    onChange={(e) =>
                      setEditItem({ ...editItem, nominal: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Keterangan / Catatan</label>
                  <input
                    type="text"
                    value={editItem.keterangan || ''}
                    onChange={(e) => setEditItem({ ...editItem, keterangan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-900/20 transition"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
