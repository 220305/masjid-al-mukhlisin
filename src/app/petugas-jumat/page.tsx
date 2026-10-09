'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Download,
  Search,
  X,
  Calendar,
  Mic,
  Award,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import { DataService } from '@/lib/data-service';
import { PetugasJumatItem } from '@/types';

export default function PetugasJumatPage() {
  const [dataPetugas, setDataPetugas] = useState<PetugasJumatItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<PetugasJumatItem | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    tanggal: '',
    imam: '',
    khatib: '',
    muadzin: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await DataService.getPetugasJumat();
      setDataPetugas(items);
    } catch (error) {
      console.error('Failed to load petugas jumat:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Next Friday calculation helper
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() + ((5 + 7 - day) % 7);
    const nextFri = new Date(d.setDate(diff));
    setFormData((prev) => ({
      ...prev,
      tanggal: nextFri.toISOString().split('T')[0],
    }));
    loadData();
  }, []);

  // Filtered
  const filteredPetugas = useMemo(() => {
    return dataPetugas.filter((item) => {
      const q = searchTerm.toLowerCase();
      return (
        item.imam.toLowerCase().includes(q) ||
        item.khatib.toLowerCase().includes(q) ||
        item.muadzin.toLowerCase().includes(q) ||
        item.tanggal.includes(q)
      );
    });
  }, [dataPetugas, searchTerm]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredPetugas.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: number | string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tanggal || !formData.khatib) return;
    try {
      await DataService.addPetugasJumat({
        tanggal: formData.tanggal,
        imam: formData.imam || formData.khatib,
        khatib: formData.khatib,
        muadzin: formData.muadzin || 'Petugas Marbot',
      });
      setShowAddModal(false);
      setFormData({
        tanggal: '',
        imam: '',
        khatib: '',
        muadzin: '',
      });
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Gagal menambahkan jadwal petugas');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem || !editItem.tanggal || !editItem.khatib) return;
    try {
      await DataService.updatePetugasJumat(editItem.id, editItem);
      setShowEditModal(false);
      setEditItem(null);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Gagal memperbarui jadwal petugas');
    }
  };

  const handleDelete = async (id: number | string, tgl: string) => {
    if (window.confirm(`Yakin ingin menghapus jadwal petugas Jumat tanggal ${tgl}?`)) {
      try {
        await DataService.deletePetugasJumat(id);
        loadData();
      } catch (err: any) {
        alert(err?.message || 'Gagal menghapus jadwal');
      }
    }
  };

  const getTargetData = () =>
    selectedIds.length > 0 ? dataPetugas.filter((i) => selectedIds.includes(i.id)) : filteredPetugas;

  const exportToExcel = () => {
    const prepare = getTargetData().map((i, idx) => ({
      No: idx + 1,
      Tanggal: i.tanggal,
      Khatib: i.khatib,
      Imam: i.imam,
      Muadzin: i.muadzin,
    }));
    const ws = XLSX.utils.json_to_sheet(prepare);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Petugas Jumat');
    XLSX.writeFile(wb, `Jadwal_Petugas_Jumat_Al_Mukhlisin_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const printTable = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <UserCheck size={24} />
              </span>
              <h1 className="text-2xl font-black text-slate-800">Jadwal Petugas Shalat Jumat</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Penyusunan dan mading jadwal Khatib, Imam, dan Muadzin Shalat Jumat Masjid Al-Mukhlisin
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
              <Printer size={15} /> Cetak Mading
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-900/20 transition"
            >
              <Plus size={16} /> Jadwalkan Petugas
            </button>
          </div>
        </div>

        {/* Quick Schedule Preview Cards for upcoming Fridays */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dataPetugas.slice(0, 3).map((item, idx) => (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition shadow-sm ${
                idx === 0
                  ? 'bg-gradient-to-br from-[#0a1f18] to-emerald-950 text-white border-emerald-800/80 shadow-emerald-950/20'
                  : 'bg-white text-slate-800 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 border-slate-100">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    idx === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {idx === 0 ? 'Jumat Terdekat' : `Pekan ke-${idx + 1}`}
                </span>
                <span className={`text-xs font-bold ${idx === 0 ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {new Date(item.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div>
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${idx === 0 ? 'text-slate-400' : 'text-slate-400'}`}>
                    Khatib Jumat:
                  </p>
                  <p className="font-extrabold text-sm">{item.khatib}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${idx === 0 ? 'text-slate-400' : 'text-slate-400'}`}>
                      Imam:
                    </p>
                    <p className="font-bold">{item.imam}</p>
                  </div>
                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${idx === 0 ? 'text-slate-400' : 'text-slate-400'}`}>
                      Muadzin:
                    </p>
                    <p className="font-bold">{item.muadzin}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama khatib, imam, muadzin, atau tanggal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {filteredPetugas.length} jadwal terdaftar
          </span>
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
                      checked={selectedIds.length === filteredPetugas.length && filteredPetugas.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Tanggal Jumat</th>
                  <th className="py-3.5 px-4">Khatib Shalat</th>
                  <th className="py-3.5 px-4">Imam Shalat</th>
                  <th className="py-3.5 px-4">Muadzin</th>
                  <th className="py-3.5 px-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Memuat jadwal petugas Jumat...
                    </td>
                  </tr>
                ) : filteredPetugas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Belum ada jadwal petugas Jumat yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredPetugas.map((item, index) => {
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
                        <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                          <span className="flex items-center gap-2">
                            <Calendar size={14} className="text-emerald-600" />
                            {new Date(item.tanggal).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-800">
                          {item.khatib}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {item.imam}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {item.muadzin}
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
                              onClick={() => handleDelete(item.id, item.tanggal)}
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
                  <UserCheck size={16} className="text-emerald-400" /> Jadwalkan Petugas Jumat
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
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Shalat Jumat *</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khatib Shalat Jumat *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: K.H. Syarif Hidayatullah"
                    value={formData.khatib}
                    onChange={(e) => setFormData({ ...formData, khatib: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Imam Shalat (kosongkan jika sama dengan Khatib)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ust. Rahmat Hidayat"
                    value={formData.imam}
                    onChange={(e) => setFormData({ ...formData, imam: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Muadzin / Bilal</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kang Asep Sunandar"
                    value={formData.muadzin}
                    onChange={(e) => setFormData({ ...formData, muadzin: e.target.value })}
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
                    Simpan Jadwal
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
                  <Edit2 size={16} className="text-emerald-400" /> Perbarui Jadwal Petugas
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
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Shalat Jumat *</label>
                  <input
                    type="date"
                    required
                    value={editItem.tanggal}
                    onChange={(e) => setEditItem({ ...editItem, tanggal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khatib Shalat Jumat *</label>
                  <input
                    type="text"
                    required
                    value={editItem.khatib}
                    onChange={(e) => setEditItem({ ...editItem, khatib: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Imam Shalat</label>
                  <input
                    type="text"
                    value={editItem.imam}
                    onChange={(e) => setEditItem({ ...editItem, imam: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Muadzin / Bilal</label>
                  <input
                    type="text"
                    value={editItem.muadzin}
                    onChange={(e) => setEditItem({ ...editItem, muadzin: e.target.value })}
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
