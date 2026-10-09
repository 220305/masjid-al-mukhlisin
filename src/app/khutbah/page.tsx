'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  CalendarDays,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download,
  Search,
  X,
  Upload,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import KhutbahDefaultPoster from '@/components/khutbah-default-poster';
import { DataService } from '@/lib/data-service';
import { KhutbahItem, StatusKhutbah } from '@/types';

export default function KhutbahPage() {
  const [dataJadwal, setDataJadwal] = useState<KhutbahItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState<'add' | 'edit' | 'detail' | null>(null);
  const [selectedItem, setSelectedItem] = useState<KhutbahItem | null>(null);

  // Filters & Checkboxes
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  // File & Form
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    tanggal: '',
    jenis_kegiatan: 'Shalat Jumat',
    khotib: '',
    tema: '',
    link: '',
    status: 'terjadwal' as StatusKhutbah,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await DataService.getKhutbahs();
      setDataJadwal(items);
    } catch (error) {
      console.error('Failed to load khutbahs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered
  const filteredJadwal = useMemo(() => {
    return dataJadwal.filter((item) => {
      const matchesSearch =
        item.khotib.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tema && item.tema.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterKategori === 'all' || item.status === filterKategori;
      return matchesSearch && matchesStatus;
    });
  }, [dataJadwal, searchTerm, filterKategori]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredJadwal.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: number | string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const exportToExcel = () => {
    const target =
      selectedIds.length > 0 ? dataJadwal.filter((i) => selectedIds.includes(i.id)) : filteredJadwal;
    const ws = XLSX.utils.json_to_sheet(
      target.map((i) => ({
        Tanggal: i.tanggal,
        Kegiatan: i.jenis_kegiatan,
        Penceramah: i.khotib,
        Tema: i.tema || '-',
        Status: i.status.toUpperCase(),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Jadwal Khutbah');
    XLSX.writeFile(wb, `Jadwal_Khutbah_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  // CRUD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tanggal || !formData.khotib) return;

    try {
      if (showModal === 'edit' && selectedItem) {
        const payload = {
          ...formData,
          image: imagePreview ? (imageFile ? undefined : imagePreview) : null,
        };
        await DataService.updateKhutbah(selectedItem.id, payload, imageFile);
      } else {
        await DataService.addKhutbah(
          {
            ...formData,
            image: imagePreview ? (imageFile ? undefined : imagePreview) : null,
          },
          imageFile
        );
      }
      setShowModal(null);
      setImageFile(null);
      setImagePreview('');
      setFormData({
        tanggal: '',
        jenis_kegiatan: 'Shalat Jumat',
        khotib: '',
        tema: '',
        link: '',
        status: 'terjadwal',
      });
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan agenda');
    }
  };

  const handleDelete = async (id: number | string) => {
    if (confirm('Batalkan dan hapus agenda kajian/khutbah ini?')) {
      try {
        await DataService.deleteKhutbah(id);
        loadData();
      } catch (err: any) {
        alert(err?.message || 'Gagal menghapus jadwal');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 pb-24">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 font-serif-elegant">Khutbah & Majelis Ilmu</h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
              Syiar Dakwah & Penjadwalan Khotib
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-600 hover:text-emerald-700 transition-colors shadow-xs"
              title="Ekspor ke Excel"
            >
              <Download size={16} /> <span className="hidden sm:inline">Ekspor Excel</span>
            </button>
            <button
              onClick={() => {
                setFormData({
                  tanggal: new Date().toISOString().split('T')[0],
                  jenis_kegiatan: 'Shalat Jumat',
                  khotib: '',
                  tema: '',
                  link: '',
                  status: 'terjadwal',
                });
                setImageFile(null);
                setImagePreview('');
                setShowModal('add');
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#0d8a5e] text-white hover:bg-emerald-700 text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-emerald-900/10 active:scale-95"
            >
              <Plus size={18} /> <span>Tambah Jadwal</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xs space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama penceramah / ustadz atau tema kajian..."
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 pl-11 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1">Status:</span>
            {['all', 'terjadwal', 'selesai', 'batal'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterKategori(st)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                  filterKategori === st
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'Semua Status' : st}
              </button>
            ))}

            {(searchTerm || filterKategori !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterKategori('all');
                }}
                className="text-xs text-red-500 font-bold hover:underline ml-auto"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                <tr>
                  <th className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === filteredJadwal.length && filteredJadwal.length > 0}
                    />
                  </th>
                  <th className="px-6 py-4">Poster</th>
                  <th className="px-6 py-4">Tanggal & Kegiatan</th>
                  <th className="px-6 py-4">Khotib / Penceramah</th>
                  <th className="px-6 py-4">Tema Kajian</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJadwal.length > 0 ? (
                  filteredJadwal.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(item.id)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.khotib}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <KhutbahDefaultPoster
                                variant="thumbnail"
                                jenisKegiatan={item.jenis_kegiatan}
                                khotib={item.khotib}
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{item.jenis_kegiatan}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.tanggal}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-950">{item.khotib}</td>
                        <td className="px-6 py-4 max-w-xs truncate text-slate-500 italic">
                          "{item.tema || 'Belum diisi'}"
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase ${
                              item.status === 'terjadwal'
                                ? 'bg-indigo-50 text-indigo-600'
                                : item.status === 'selesai'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
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
                                  tanggal: item.tanggal,
                                  jenis_kegiatan: item.jenis_kegiatan,
                                  khotib: item.khotib,
                                  tema: item.tema || '',
                                  link: item.link || '',
                                  status: item.status,
                                });
                                setImagePreview(item.image || '');
                                setImageFile(null);
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
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Tidak ada agenda khutbah yang cocok dengan filter.
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
            <div className="animate-pop relative z-10 w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 font-serif-elegant">
                  {showModal === 'add' ? 'Tambah Jadwal Khutbah' : 'Perbarui Jadwal Khutbah'}
                </h3>
                <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                      Tanggal Pelaksanaan
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900 font-mono"
                      value={formData.tanggal}
                      onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                      Jenis Kegiatan
                    </label>
                    <select
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900"
                      value={formData.jenis_kegiatan}
                      onChange={(e) => setFormData({ ...formData, jenis_kegiatan: e.target.value })}
                    >
                      <option value="Shalat Jumat">Shalat Jumat</option>
                      <option value="Kajian Ahad Subuh">Kajian Ahad Subuh</option>
                      <option value="Tabligh Akbar">Tabligh Akbar</option>
                      <option value="Kajian Muslimah">Kajian Muslimah</option>
                      <option value="Kajian Remaja">Kajian Remaja</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                    Nama Khotib / Penceramah
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ust. Dr. H. Ahmad Farhan, M.Ag"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900"
                    value={formData.khotib}
                    onChange={(e) => setFormData({ ...formData, khotib: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                    Tema Khutbah / Kajian
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Merajut Ukhuwah di Tengah Keberagaman"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900"
                    value={formData.tema}
                    onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                      Status Agenda
                    </label>
                    <select
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900 capitalize"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusKhutbah })}
                    >
                      <option value="terjadwal">Terjadwal</option>
                      <option value="selesai">Selesai</option>
                      <option value="batal">Batal</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                      Link Siaran (Opsional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/..."
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    />
                  </div>
                </div>

                {/* Upload Poster Image dengan Pratinjau Default */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Poster / Foto Khotib (Supabase Storage)
                    </label>
                    <span
                      className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        imagePreview
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {imagePreview ? 'Foto Kustom Terpilih' : 'Tampilan Default Aktif'}
                    </span>
                  </div>

                  {/* PREVIEW AREA: TAMPILKAN POSTER DEFAULT OTOMATIS JIKA TIDAK ADA GAMBAR */}
                  {imagePreview ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 flex items-center gap-3.5">
                      <div className="h-20 w-20 rounded-xl overflow-hidden bg-slate-900 border border-emerald-300 shrink-0 shadow-xs">
                        <img src={imagePreview} alt="Pratinjau Foto" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {imageFile ? imageFile.name : 'Poster khusus tersimpan'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Gambar kustom akan digunakan untuk publikasi agenda.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setImageFile(null);
                          }}
                          className="mt-2 text-[10px] font-black uppercase tracking-wider text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                        >
                          <X size={12} />
                          Hapus & Gunakan Poster Default
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Live Default Poster Preview */}
                      <KhutbahDefaultPoster
                        variant="preview"
                        jenisKegiatan={formData.jenis_kegiatan}
                        khotib={formData.khotib}
                        tema={formData.tema}
                        tanggal={formData.tanggal}
                      />
                      <div className="flex items-start gap-1.5 px-1 text-[11px] text-slate-500">
                        <span className="text-emerald-600 text-xs shrink-0">✨</span>
                        <p>
                          <strong className="text-slate-700">Tampilan Default:</strong> Jika tidak memilih file gambar, sistem otomatis menampilkan poster resmi Masjid Al-Mukhlisin di atas.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tombol Input File */}
                  <label className="flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-500 cursor-pointer bg-slate-50/70 text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/30 transition-all">
                    <Upload size={16} className="text-emerald-600" />
                    <span>
                      {imageFile
                        ? `Ganti File: ${imageFile.name}`
                        : imagePreview
                        ? 'Ganti Gambar Poster'
                        : 'Pilih File Gambar Poster (Opsional)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-emerald-600 py-4 text-xs font-black tracking-widest text-white hover:bg-emerald-700 transition-colors mt-4"
                >
                  {showModal === 'add' ? 'SIMPAN AGENDA' : 'PERBARUI AGENDA'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL DETAIL --- */}
        {showModal === 'detail' && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowModal(null)} />
            <div className="animate-pop relative z-10 w-full max-w-md rounded-[2.5rem] bg-white overflow-hidden shadow-2xl">
              <div className="relative h-56 bg-slate-900">
                {selectedItem.image ? (
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.khotib}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <KhutbahDefaultPoster
                    variant="banner"
                    jenisKegiatan={selectedItem.jenis_kegiatan}
                    khotib={selectedItem.khotib}
                    tema={selectedItem.tema}
                    tanggal={selectedItem.tanggal}
                  />
                )}
                <button
                  onClick={() => setShowModal(null)}
                  className="absolute top-4 right-4 h-9 w-9 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors z-20 backdrop-blur-xs"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                <span className="text-[9px] font-black tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md uppercase">
                  {selectedItem.jenis_kegiatan}
                </span>
                <h3 className="font-serif-elegant text-2xl font-bold text-slate-900 mt-2 mb-1">
                  {selectedItem.khotib}
                </h3>
                <p className="text-xs text-slate-500 italic mb-4">
                  "{selectedItem.tema || 'Tema kajian belum ditentukan'}"
                </p>

                <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="font-bold">Tanggal:</span>
                    <span className="font-mono text-slate-800">{selectedItem.tanggal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Status:</span>
                    <span className="capitalize font-bold text-emerald-700">{selectedItem.status}</span>
                  </div>
                  {selectedItem.link && (
                    <div className="flex justify-between">
                      <span className="font-bold">Live Stream:</span>
                      <a
                        href={selectedItem.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 font-bold hover:underline"
                      >
                        Buka Tautan
                      </a>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowModal(null)}
                  className="w-full rounded-2xl bg-slate-900 py-3.5 text-xs font-black tracking-widest text-white hover:bg-slate-800 transition-colors"
                >
                  TUTUP DETAIL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
