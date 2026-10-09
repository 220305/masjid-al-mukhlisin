'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Package,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Download,
  Copy,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import { DataService } from '@/lib/data-service';
import { InventoryItem, KondisiBarang } from '@/types';

export default function InventoryPage() {
  const [dataAset, setDataAset] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState<'add' | 'edit' | 'detail' | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Filters & Selection
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKondisi, setFilterKondisi] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  const [currentDateStr, setCurrentDateStr] = useState('');

  // Form
  const [formData, setFormData] = useState({
    nama_barang: '',
    jumlah: '1',
    kondisi: 'baik' as KondisiBarang,
    lokasi: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await DataService.getInventories();
      setDataAset(items);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentDateStr(new Date().toLocaleDateString('id-ID'));
    loadData();
  }, []);

  // Filtered
  const filteredAset = useMemo(() => {
    return dataAset.filter((item) => {
      const matchesSearch =
        item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesKondisi = filterKondisi === 'all' || item.kondisi === filterKondisi;
      return matchesSearch && matchesKondisi;
    });
  }, [dataAset, searchTerm, filterKondisi]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredAset.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: number | string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Export to Excel
  const getTargetData = () =>
    selectedIds.length > 0 ? dataAset.filter((i) => selectedIds.includes(i.id)) : filteredAset;

  const exportToExcel = () => {
    const prepare = getTargetData().map((i) => ({
      'Nama Barang': i.nama_barang,
      Jumlah: i.jumlah,
      Kondisi: i.kondisi.toUpperCase(),
      Lokasi: i.lokasi,
      'Tanggal Input': i.created_at ? new Date(i.created_at).toLocaleDateString('id-ID') : '-',
    }));
    const ws = XLSX.utils.json_to_sheet(prepare);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventaris');
    XLSX.writeFile(wb, `Inventaris_Masjid_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const copyTable = () => {
    const head = 'Nama Barang\tJumlah\tKondisi\tLokasi\n';
    const rows = getTargetData()
      .map((i) => `${i.nama_barang}\t${i.jumlah}\t${i.kondisi}\t${i.lokasi}`)
      .join('\n');
    navigator.clipboard.writeText(head + rows);
    alert('Data tabel inventaris berhasil disalin ke clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  // CRUD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_barang || !formData.lokasi) return;

    try {
      if (showModal === 'edit' && selectedItem) {
        await DataService.updateInventory(selectedItem.id, {
          nama_barang: formData.nama_barang,
          jumlah: parseInt(formData.jumlah, 10) || 1,
          kondisi: formData.kondisi,
          lokasi: formData.lokasi,
        });
      } else {
        await DataService.addInventory({
          nama_barang: formData.nama_barang,
          jumlah: parseInt(formData.jumlah, 10) || 1,
          kondisi: formData.kondisi,
          lokasi: formData.lokasi,
        });
      }
      setShowModal(null);
      setFormData({ nama_barang: '', jumlah: '1', kondisi: 'baik', lokasi: '' });
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan inventaris');
    }
  };

  const handleDelete = async (id: number | string) => {
    if (confirm('Hapus aset fisik ini dari daftar inventaris?')) {
      try {
        await DataService.deleteInventory(id);
        loadData();
      } catch (err: any) {
        alert(err?.message || 'Gagal menghapus inventaris');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 pb-24">
        {/* Print Title */}
        <div className="hidden print-only-title">
          DAFTAR INVENTARIS FASILITAS MASJID AL-MUKHLISIN
          <p className="text-xs font-normal mt-1">Dicetak pada: {currentDateStr || '-'}</p>
        </div>

        {/* Top Header */}
        <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 font-serif-elegant">Manajemen Inventaris</h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
              Aset & Fasilitas Fisik Masjid
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copyTable}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-slate-400 transition-colors shadow-xs"
              title="Salin ke Clipboard"
            >
              <Copy size={15} /> <span className="hidden sm:inline">Salin</span>
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-600 hover:text-emerald-700 transition-colors shadow-xs"
              title="Ekspor ke Excel"
            >
              <Download size={15} /> <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-600 transition-colors shadow-xs"
              title="Cetak Laporan"
            >
              <Printer size={15} /> <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={() => {
                setFormData({ nama_barang: '', jumlah: '1', kondisi: 'baik', lokasi: '' });
                setShowModal('add');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0d8a5e] text-white hover:bg-emerald-700 text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-emerald-900/10 active:scale-95"
            >
              <Plus size={17} /> <span>Tambah Aset</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="no-print rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xs space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama barang atau lokasi penempatan..."
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 pl-11 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1">Kondisi:</span>
            {['all', 'baik', 'pemeliharaan', 'dipinjamkan', 'rusak'].map((k) => (
              <button
                key={k}
                onClick={() => setFilterKondisi(k)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                  filterKondisi === k
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {k === 'all' ? 'Semua Kondisi' : k}
              </button>
            ))}

            {(searchTerm || filterKondisi !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterKondisi('all');
                }}
                className="text-xs text-red-500 font-bold hover:underline ml-auto"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
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
                      checked={selectedIds.length === filteredAset.length && filteredAset.length > 0}
                    />
                  </th>
                  <th className="px-6 py-4">Nama Barang</th>
                  <th className="px-6 py-4 text-center">Jumlah</th>
                  <th className="px-6 py-4 text-center">Kondisi</th>
                  <th className="px-6 py-4">Lokasi</th>
                  <th className="no-print px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAset.length > 0 ? (
                  filteredAset.map((item) => {
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
                        <td className="px-6 py-4 font-bold text-slate-800">{item.nama_barang}</td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-slate-700">
                          {item.jumlah} Unit
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase ${
                              item.kondisi === 'baik'
                                ? 'bg-emerald-50 text-emerald-600'
                                : item.kondisi === 'pemeliharaan'
                                ? 'bg-amber-50 text-amber-600'
                                : item.kondisi === 'dipinjamkan'
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {item.kondisi}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{item.lokasi}</td>
                        <td className="no-print px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-slate-400">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowModal('detail');
                              }}
                              className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Detail"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setFormData({
                                  nama_barang: item.nama_barang,
                                  jumlah: String(item.jumlah),
                                  kondisi: item.kondisi,
                                  lokasi: item.lokasi,
                                });
                                setShowModal('edit');
                              }}
                              className="p-1.5 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit"
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
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Tidak ada data inventaris yang cocok dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MODAL ADD / EDIT --- */}
        {(showModal === 'add' || showModal === 'edit') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowModal(null)} />
            <div className="animate-pop relative z-10 w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 font-serif-elegant">
                  {showModal === 'add' ? 'Tambah Aset Inventaris' : 'Edit Data Aset'}
                </h3>
                <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                    Nama Barang
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sound System Amplifier Yamaha"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900"
                    value={formData.nama_barang}
                    onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                      Jumlah Unit
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900 font-mono"
                      value={formData.jumlah}
                      onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                      Kondisi
                    </label>
                    <select
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900 capitalize"
                      value={formData.kondisi}
                      onChange={(e) => setFormData({ ...formData, kondisi: e.target.value as KondisiBarang })}
                    >
                      <option value="baik">Baik</option>
                      <option value="pemeliharaan">Pemeliharaan</option>
                      <option value="dipinjamkan">Dipinjamkan</option>
                      <option value="rusak">Rusak</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                    Lokasi Penempatan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ruang Shalat Utama / Gudang Audio"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-emerald-600 py-4 text-xs font-black tracking-widest text-white hover:bg-emerald-700 transition-colors mt-4"
                >
                  {showModal === 'add' ? 'SIMPAN ASET' : 'PERBARUI ASET'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL DETAIL --- */}
        {showModal === 'detail' && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowModal(null)} />
            <div className="animate-pop relative z-10 w-full max-w-sm rounded-[2.5rem] bg-white p-8 shadow-2xl text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Package size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{selectedItem.nama_barang}</h3>
              <p className="text-sm font-bold text-slate-400 mt-1">{selectedItem.lokasi}</p>

              <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 space-y-2 text-left my-6">
                <div className="flex justify-between">
                  <span className="font-bold">Jumlah:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedItem.jumlah} Unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Kondisi:</span>
                  <span className="capitalize font-bold text-emerald-700">{selectedItem.kondisi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Dicatat:</span>
                  <span>{new Date(selectedItem.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              <button
                onClick={() => setShowModal(null)}
                className="w-full rounded-2xl bg-slate-900 py-3.5 text-xs font-black tracking-widest text-white hover:bg-slate-800 transition-colors"
              >
                TUTUP DETAIL
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
