import { supabase, isSupabaseConfigured } from './supabase/client';
import {
  InventoryItem,
  KasItem,
  KhutbahItem,
  JamaahItem,
  PetugasJumatItem,
  ZakatQurbanItem,
  WakafItem,
  IdentitasMasjid,
} from '@/types';

// ==============================================================================
// INITIAL FALLBACK / SEED DATA
// ==============================================================================

const INITIAL_IDENTITAS: IdentitasMasjid = {
  nama: 'Al-Mukhlisin',
  nomor_id_kemenag: '01.4.13.04.06.000158',
  alamat: 'Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar',
  ketua_dkm: 'Ustadz H. Ahmad Sobari',
  bendahara: 'H. Mulyadi, S.E.',
};

const INITIAL_KAS: KasItem[] = [
  {
    id: 1,
    keterangan: 'Infaq Kotak Amal Shalat Jumat',
    kategori: 'Infaq Jumat',
    nominal: 4850000,
    tipe: 'masuk',
    tanggal: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 2,
    keterangan: 'Sedekah Operasional Hamba Allah',
    kategori: 'Donasi',
    nominal: 2500000,
    tipe: 'masuk',
    tanggal: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 3,
    keterangan: 'Pembayaran Listrik PLN & Air PDAM',
    kategori: 'Listrik & Air',
    nominal: 850000,
    tipe: 'keluar',
    tanggal: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 4,
    keterangan: 'Bisyarah Ustadz Khotib Jumat',
    kategori: 'Honor',
    nominal: 500000,
    tipe: 'keluar',
    tanggal: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 5,
    keterangan: 'Infaq Donasi QRIS Al-Mukhlisin',
    kategori: 'Donasi',
    nominal: 1200000,
    tipe: 'masuk',
    tanggal: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 6,
    keterangan: 'Pembelian Sabun & Pembersih Lantai Masjid',
    kategori: 'Perawatan',
    nominal: 175000,
    tipe: 'keluar',
    tanggal: new Date().toISOString().split('T')[0],
  },
];

const INITIAL_JAMAAH: JamaahItem[] = [
  {
    id: 1,
    nama: 'Ustadz H. Ahmad Sobari',
    no_hp: '081223344556',
    alamat: 'Kp. Jalan Cagak RT 05/04',
    peran: 'Pengurus DKM',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 2,
    nama: 'H. Mulyadi, S.E.',
    no_hp: '081399887766',
    alamat: 'Kp. Jalan Cagak RT 05/04',
    peran: 'Pengurus DKM',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: 3,
    nama: 'Ustadz Rahmat Hidayat',
    no_hp: '082155667788',
    alamat: 'Komplek Griya Lagadar Indah B-12',
    peran: 'Imam',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 4,
    nama: 'Kang Asep Sunandar',
    no_hp: '085711223344',
    alamat: 'Kp. Jalan Cagak RT 02/04',
    peran: 'Muadzin',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 5,
    nama: 'Haji Dedi Kurniawan',
    no_hp: '081234567890',
    alamat: 'Jl. Utama Lagadar No. 15',
    peran: 'Donatur',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 6,
    nama: 'Rizky Maulana',
    no_hp: '087812345678',
    alamat: 'Kp. Babakan RT 01/04',
    peran: 'Remaja Masjid',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 7,
    nama: 'Bapak Hendra Wijaya',
    no_hp: '081987654321',
    alamat: 'Kp. Jalan Cagak RT 04/04',
    peran: 'Jamaah',
    created_at: new Date().toISOString(),
  },
  {
    id: 8,
    nama: 'K.H. Syarif Hidayatullah',
    no_hp: '081298765432',
    alamat: 'Komplek Islamic Center Lagadar',
    peran: 'Imam',
    created_at: new Date().toISOString(),
  },
  {
    id: 9,
    nama: 'Ust. Dr. H. Ahmad Farhan, M.Ag',
    no_hp: '081387654321',
    alamat: 'Jl. Pesantren No. 08 Lagadar',
    peran: 'Imam',
    created_at: new Date().toISOString(),
  },
  {
    id: 10,
    nama: 'Kang Bilal Fauzi',
    no_hp: '085612349876',
    alamat: 'Kp. Jalan Cagak RT 01/04',
    peran: 'Muadzin',
    created_at: new Date().toISOString(),
  },
];

const INITIAL_PETUGAS_JUMAT: PetugasJumatItem[] = [
  {
    id: 1,
    tanggal: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    imam: 'Ust. Rahmat Hidayat',
    khatib: 'Ust. Dr. H. Ahmad Farhan, M.Ag',
    muadzin: 'Kang Asep Sunandar',
  },
  {
    id: 2,
    tanggal: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
    imam: 'Ust. H. Ahmad Sobari',
    khatib: 'K.H. Syarif Hidayatullah',
    muadzin: 'Kang Ujang Marbot',
  },
  {
    id: 3,
    tanggal: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    imam: 'Ust. Rahmat Hidayat',
    khatib: 'Habib Ali Zainal Abidin Assegaf',
    muadzin: 'Kang Asep Sunandar',
  },
];

const INITIAL_ZAKAT_QURBAN: ZakatQurbanItem[] = [
  {
    id: 1,
    tanggal: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    nama: 'Keluarga Bpk. Hendra (4 Jiwa)',
    jenis: 'Zakat Fitrah (uang)',
    jumlah_jiwa: 4,
    beras_kg: 0,
    nominal: 180000,
    keterangan: 'Zakat Fitrah 4 jiwa @ Rp 45.000',
  },
  {
    id: 2,
    tanggal: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
    nama: 'Keluarga Ibu Hj. Siti Aminah (3 Jiwa)',
    jenis: 'Zakat Fitrah (beras)',
    jumlah_jiwa: 3,
    beras_kg: 7.5,
    nominal: 0,
    keterangan: 'Zakat Fitrah 3 jiwa @ 2.5 kg',
  },
  {
    id: 3,
    tanggal: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    nama: 'H. Dedi Kurniawan',
    jenis: 'Zakat Mal',
    jumlah_jiwa: 1,
    beras_kg: 0,
    nominal: 5000000,
    keterangan: 'Zakat Harta Perniagaan',
  },
  {
    id: 4,
    tanggal: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    nama: 'Keluarga Bpk. H. Mulyadi',
    jenis: 'Qurban Sapi (1/7)',
    jumlah_jiwa: 1,
    beras_kg: 0,
    nominal: 3200000,
    keterangan: 'Bagian 1/7 Sapi Qurban A',
  },
  {
    id: 5,
    tanggal: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    nama: 'Ibu Ratna Dewi',
    jenis: 'Qurban Kambing',
    jumlah_jiwa: 1,
    beras_kg: 0,
    nominal: 2750000,
    keterangan: 'Kambing Qurban Tipe B',
  },
  {
    id: 6,
    tanggal: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    nama: 'Penyaluran Santunan 15 Mustahiq RT 05',
    jenis: 'Penyaluran',
    jumlah_jiwa: 15,
    beras_kg: 37.5,
    nominal: 3000000,
    keterangan: 'Penyaluran beras dan sembako/uang tunai',
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    nama_barang: 'Sound System Amplifier Yamaha EMX5014C',
    jumlah: 1,
    kondisi: 'baik',
    lokasi: 'Ruang Kontrol Audio',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 2,
    nama_barang: 'Microphone Wireless Shure BLX288/PG58',
    jumlah: 4,
    kondisi: 'baik',
    lokasi: 'Mimbar Utama',
    created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: 3,
    nama_barang: 'Karpet Sajadah Tebal Turki Grade A (Roll)',
    jumlah: 12,
    kondisi: 'baik',
    lokasi: 'Ruang Shalat Utama',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 4,
    nama_barang: 'Pendingin Ruangan AC Daikin Standing 5 PK',
    jumlah: 4,
    kondisi: 'baik',
    lokasi: 'Ruang Shalat Utama',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 5,
    nama_barang: 'Genset Silent Honda 7500 Watt',
    jumlah: 1,
    kondisi: 'baik',
    lokasi: 'Gudang Belakang',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: 6,
    nama_barang: 'Mimbar Jati Ukir Kaligrafi Jepara',
    jumlah: 1,
    kondisi: 'baik',
    lokasi: 'Mimbar Utama',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 7,
    nama_barang: 'Jam Dinding Digital Jadwal Shalat LED 7-Segment',
    jumlah: 2,
    kondisi: 'baik',
    lokasi: 'Ruang Shalat Utama',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 8,
    nama_barang: 'Kamera CCTV Hikvision IP HD 8-Channel',
    jumlah: 8,
    kondisi: 'baik',
    lokasi: 'Area Dalam & Halaman Masjid',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 9,
    nama_barang: 'Proyektor Epson EB-E500 & Layar Motorized',
    jumlah: 1,
    kondisi: 'baik',
    lokasi: 'Ruang Kajian / Serbaguna',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 10,
    nama_barang: "Lemari Kaca Al-Qur'an & Kitab Jati",
    jumlah: 4,
    kondisi: 'baik',
    lokasi: 'Ruang Shalat Utama & Akhwat',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 11,
    nama_barang: 'Dispenser Air Minum RO Jamaah 3-Kran',
    jumlah: 2,
    kondisi: 'rusak_ringan',
    lokasi: 'Selasar Tempat Wudhu Pria',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 12,
    nama_barang: 'Vacuum Cleaner Wet & Dry Karcher 30 Liter',
    jumlah: 2,
    kondisi: 'baik',
    lokasi: 'Ruang Marbot & Perlengkapan',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

const INITIAL_WAKAF: WakafItem[] = [
  {
    id: 1,
    tanggal: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    wakif: 'Hamba Allah',
    jenis: 'Tanah',
    nilai: 50000000,
    keterangan: 'Wakaf tanah perluasan selasar samping seluas 40m2',
  },
  {
    id: 2,
    tanggal: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
    wakif: 'Alm. Bpk. H. Sukarna (Keluarga)',
    jenis: "Al-Qur'an",
    nilai: 5000000,
    keterangan: '50 Mushaf Al-Qur`an Terjemah Standar Madinah',
  },
  {
    id: 3,
    tanggal: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    wakif: 'Komunitas Alumni 98',
    jenis: 'Peralatan',
    nilai: 8500000,
    keterangan: '1 Set Proyektor HD & Screen Otomatis',
  },
];

const INITIAL_KHUTBAH: KhutbahItem[] = [
  {
    id: 1,
    tanggal: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    jenis_kegiatan: 'Shalat Jumat',
    khotib: 'Ust. Dr. H. Ahmad Farhan, M.Ag',
    tema: 'Merajut Ukhuwah di Tengah Keberagaman',
    image: null,
    status: 'terjadwal',
  },
  {
    id: 2,
    tanggal: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    jenis_kegiatan: 'Kajian Ahad Subuh',
    khotib: 'K.H. Muhammad Ridwan',
    tema: 'Tafsir Surat Al-Kahfi: Menjaga Aqidah Akhir Zaman',
    image: null,
    status: 'terjadwal',
  },
  {
    id: 3,
    tanggal: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    jenis_kegiatan: 'Tabligh Akbar',
    khotib: 'Habib Ali Zainal Abidin Assegaf',
    tema: 'Meneladani Akhlak Mulia Baginda Rasulullah SAW',
    image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80',
    status: 'terjadwal',
  },
];

// Helper local storage
function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to set localStorage', e);
  }
}

export const DataService = {
  // ==========================================
  // IDENTITAS MASJID & SIMAS KEMENAG RI
  // ==========================================
  async getIdentitas(): Promise<IdentitasMasjid> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('identitas_masjid')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (!error && data) return data as IdentitasMasjid;
    }
    return getStored<IdentitasMasjid>('masjid_identitas_data', INITIAL_IDENTITAS);
  },

  async updateIdentitas(item: Partial<IdentitasMasjid>): Promise<IdentitasMasjid> {
    const payload = { ...item, updated_at: new Date().toISOString() };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('identitas_masjid')
        .upsert({ id: 1, ...payload })
        .select()
        .single();
      if (!error && data) return data as IdentitasMasjid;
    }
    const current = getStored<IdentitasMasjid>('masjid_identitas_data', INITIAL_IDENTITAS);
    const updated = { ...current, ...payload };
    setStored('masjid_identitas_data', updated);
    return updated;
  },

  // ==========================================
  // KAS KEUANGAN
  // ==========================================
  async getKas(): Promise<KasItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('kas')
        .select('*')
        .order('tanggal', { ascending: false });
      if (!error && data) return data as KasItem[];
    }
    return getStored<KasItem[]>('masjid_kas_data', INITIAL_KAS);
  },

  async addKas(item: Omit<KasItem, 'id' | 'created_at'>): Promise<KasItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('kas')
        .insert([{ ...item }])
        .select()
        .single();
      if (!error && data) return data as KasItem;
    }
    const current = getStored<KasItem[]>('masjid_kas_data', INITIAL_KAS);
    const newItem: KasItem = {
      ...item,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...current];
    setStored('masjid_kas_data', updated);
    return newItem;
  },

  async updateKas(id: number | string, item: Partial<KasItem>): Promise<KasItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('kas')
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as KasItem;
    }
    const current = getStored<KasItem[]>('masjid_kas_data', INITIAL_KAS);
    const updated = current.map((k) => (String(k.id) === String(id) ? { ...k, ...item } : k));
    setStored('masjid_kas_data', updated);
    return updated.find((k) => String(k.id) === String(id)) as KasItem;
  },

  async deleteKas(id: number | string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('kas').delete().eq('id', id);
      if (!error) return true;
    }
    const current = getStored<KasItem[]>('masjid_kas_data', INITIAL_KAS);
    const updated = current.filter((k) => String(k.id) !== String(id));
    setStored('masjid_kas_data', updated);
    return true;
  },

  // ==========================================
  // DATA JAMAAH & WARGA
  // ==========================================
  async getJamaah(): Promise<JamaahItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('jamaah')
        .select('*')
        .order('nama', { ascending: true });
      if (!error && data) return data as JamaahItem[];
    }
    return getStored<JamaahItem[]>('masjid_jamaah_data', INITIAL_JAMAAH);
  },

  async addJamaah(item: Omit<JamaahItem, 'id' | 'created_at'>): Promise<JamaahItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('jamaah')
        .insert([{ ...item }])
        .select()
        .single();
      if (!error && data) return data as JamaahItem;
    }
    const current = getStored<JamaahItem[]>('masjid_jamaah_data', INITIAL_JAMAAH);
    const newItem: JamaahItem = {
      ...item,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...current];
    setStored('masjid_jamaah_data', updated);
    return newItem;
  },

  async updateJamaah(id: number | string, item: Partial<JamaahItem>): Promise<JamaahItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('jamaah')
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as JamaahItem;
    }
    const current = getStored<JamaahItem[]>('masjid_jamaah_data', INITIAL_JAMAAH);
    const updated = current.map((j) => (String(j.id) === String(id) ? { ...j, ...item } : j));
    setStored('masjid_jamaah_data', updated);
    return updated.find((j) => String(j.id) === String(id)) as JamaahItem;
  },

  async deleteJamaah(id: number | string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('jamaah').delete().eq('id', id);
      if (!error) return true;
    }
    const current = getStored<JamaahItem[]>('masjid_jamaah_data', INITIAL_JAMAAH);
    const updated = current.filter((j) => String(j.id) !== String(id));
    setStored('masjid_jamaah_data', updated);
    return true;
  },

  // ==========================================
  // PETUGAS SHALAT JUMAT
  // ==========================================
  async getPetugasJumat(): Promise<PetugasJumatItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('petugas_jumat')
        .select('*')
        .order('tanggal', { ascending: false });
      if (!error && data) return data as PetugasJumatItem[];
    }
    return getStored<PetugasJumatItem[]>('masjid_petugas_jumat_data', INITIAL_PETUGAS_JUMAT);
  },

  async addPetugasJumat(item: Omit<PetugasJumatItem, 'id' | 'created_at'>): Promise<PetugasJumatItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('petugas_jumat')
        .insert([{ ...item }])
        .select()
        .single();
      if (!error && data) return data as PetugasJumatItem;
    }
    const current = getStored<PetugasJumatItem[]>('masjid_petugas_jumat_data', INITIAL_PETUGAS_JUMAT);
    const newItem: PetugasJumatItem = {
      ...item,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...current].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    setStored('masjid_petugas_jumat_data', updated);
    return newItem;
  },

  async updatePetugasJumat(id: number | string, item: Partial<PetugasJumatItem>): Promise<PetugasJumatItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('petugas_jumat')
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as PetugasJumatItem;
    }
    const current = getStored<PetugasJumatItem[]>('masjid_petugas_jumat_data', INITIAL_PETUGAS_JUMAT);
    const updated = current.map((p) => (String(p.id) === String(id) ? { ...p, ...item } : p));
    setStored('masjid_petugas_jumat_data', updated);
    return updated.find((p) => String(p.id) === String(id)) as PetugasJumatItem;
  },

  async deletePetugasJumat(id: number | string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('petugas_jumat').delete().eq('id', id);
      if (!error) return true;
    }
    const current = getStored<PetugasJumatItem[]>('masjid_petugas_jumat_data', INITIAL_PETUGAS_JUMAT);
    const updated = current.filter((p) => String(p.id) !== String(id));
    setStored('masjid_petugas_jumat_data', updated);
    return true;
  },

  // ==========================================
  // ZAKAT & QURBAN
  // ==========================================
  async getZakatQurban(): Promise<ZakatQurbanItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('zakat_qurban')
        .select('*')
        .order('tanggal', { ascending: false });
      if (!error && data) return data as ZakatQurbanItem[];
    }
    return getStored<ZakatQurbanItem[]>('masjid_zakat_qurban_data', INITIAL_ZAKAT_QURBAN);
  },

  async addZakatQurban(item: Omit<ZakatQurbanItem, 'id' | 'created_at'>): Promise<ZakatQurbanItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('zakat_qurban')
        .insert([{ ...item }])
        .select()
        .single();
      if (!error && data) return data as ZakatQurbanItem;
    }
    const current = getStored<ZakatQurbanItem[]>('masjid_zakat_qurban_data', INITIAL_ZAKAT_QURBAN);
    const newItem: ZakatQurbanItem = {
      ...item,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...current];
    setStored('masjid_zakat_qurban_data', updated);
    return newItem;
  },

  async updateZakatQurban(id: number | string, item: Partial<ZakatQurbanItem>): Promise<ZakatQurbanItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('zakat_qurban')
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as ZakatQurbanItem;
    }
    const current = getStored<ZakatQurbanItem[]>('masjid_zakat_qurban_data', INITIAL_ZAKAT_QURBAN);
    const updated = current.map((z) => (String(z.id) === String(id) ? { ...z, ...item } : z));
    setStored('masjid_zakat_qurban_data', updated);
    return updated.find((z) => String(z.id) === String(id)) as ZakatQurbanItem;
  },

  async deleteZakatQurban(id: number | string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('zakat_qurban').delete().eq('id', id);
      if (!error) return true;
    }
    const current = getStored<ZakatQurbanItem[]>('masjid_zakat_qurban_data', INITIAL_ZAKAT_QURBAN);
    const updated = current.filter((z) => String(z.id) !== String(id));
    setStored('masjid_zakat_qurban_data', updated);
    return true;
  },

  // ==========================================
  // INVENTARIS
  // ==========================================
  async getInventories(): Promise<InventoryItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('inventories')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as InventoryItem[];
    }
    return getStored<InventoryItem[]>('masjid_inventory_data', INITIAL_INVENTORY);
  },

  async addInventory(item: Omit<InventoryItem, 'id' | 'created_at'>): Promise<InventoryItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('inventories')
        .insert([{ ...item }])
        .select()
        .single();
      if (!error && data) return data as InventoryItem;
    }
    const current = getStored<InventoryItem[]>('masjid_inventory_data', INITIAL_INVENTORY);
    const newItem: InventoryItem = {
      ...item,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...current];
    setStored('masjid_inventory_data', updated);
    return newItem;
  },

  async updateInventory(id: number | string, item: Partial<InventoryItem>): Promise<InventoryItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('inventories')
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as InventoryItem;
    }
    const current = getStored<InventoryItem[]>('masjid_inventory_data', INITIAL_INVENTORY);
    const updated = current.map((inv) => (String(inv.id) === String(id) ? { ...inv, ...item } : inv));
    setStored('masjid_inventory_data', updated);
    return updated.find((inv) => String(inv.id) === String(id)) as InventoryItem;
  },

  async deleteInventory(id: number | string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('inventories').delete().eq('id', id);
      if (!error) return true;
    }
    const current = getStored<InventoryItem[]>('masjid_inventory_data', INITIAL_INVENTORY);
    const updated = current.filter((inv) => String(inv.id) !== String(id));
    setStored('masjid_inventory_data', updated);
    return true;
  },

  // ==========================================
  // WAKAF & DONASI ASET
  // ==========================================
  async getWakaf(): Promise<WakafItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('wakaf')
        .select('*')
        .order('tanggal', { ascending: false });
      if (!error && data) return data as WakafItem[];
    }
    return getStored<WakafItem[]>('masjid_wakaf_data', INITIAL_WAKAF);
  },

  async addWakaf(item: Omit<WakafItem, 'id' | 'created_at'>): Promise<WakafItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('wakaf')
        .insert([{ ...item }])
        .select()
        .single();
      if (!error && data) return data as WakafItem;
    }
    const current = getStored<WakafItem[]>('masjid_wakaf_data', INITIAL_WAKAF);
    const newItem: WakafItem = {
      ...item,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...current];
    setStored('masjid_wakaf_data', updated);
    return newItem;
  },

  async updateWakaf(id: number | string, item: Partial<WakafItem>): Promise<WakafItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('wakaf')
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as WakafItem;
    }
    const current = getStored<WakafItem[]>('masjid_wakaf_data', INITIAL_WAKAF);
    const updated = current.map((w) => (String(w.id) === String(id) ? { ...w, ...item } : w));
    setStored('masjid_wakaf_data', updated);
    return updated.find((w) => String(w.id) === String(id)) as WakafItem;
  },

  async deleteWakaf(id: number | string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('wakaf').delete().eq('id', id);
      if (!error) return true;
    }
    const current = getStored<WakafItem[]>('masjid_wakaf_data', INITIAL_WAKAF);
    const updated = current.filter((w) => String(w.id) !== String(id));
    setStored('masjid_wakaf_data', updated);
    return true;
  },

  // ==========================================
  // KHUTBAH & KAJIAN
  // ==========================================
  async getKhutbahs(): Promise<KhutbahItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('khutbahs')
        .select('*')
        .order('tanggal', { ascending: true });
      if (!error && data) return data as KhutbahItem[];
    }
    return getStored<KhutbahItem[]>('masjid_khutbah_data', INITIAL_KHUTBAH);
  },

  async uploadKhutbahImage(file: File): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      const ext = file.name.split('.').pop();
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('khutbah-images')
        .upload(cleanFileName, file);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('khutbah-images')
          .getPublicUrl(cleanFileName);
        return publicUrlData.publicUrl;
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  },

  async addKhutbah(item: Omit<KhutbahItem, 'id'>, file?: File | null): Promise<KhutbahItem> {
    let imageUrl = item.image;
    if (file) {
      imageUrl = await this.uploadKhutbahImage(file);
    }

    const payload = { ...item, image: imageUrl };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('khutbahs')
        .insert([payload])
        .select()
        .single();
      if (!error && data) return data as KhutbahItem;
    }

    const current = getStored<KhutbahItem[]>('masjid_khutbah_data', INITIAL_KHUTBAH);
    const newItem: KhutbahItem = {
      ...payload,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [...current, newItem].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    setStored('masjid_khutbah_data', updated);
    return newItem;
  },

  async updateKhutbah(
    id: number | string,
    item: Partial<KhutbahItem>,
    file?: File | null
  ): Promise<KhutbahItem> {
    let imageUrl = item.image;
    if (file) {
      imageUrl = await this.uploadKhutbahImage(file);
    }

    const payload = {
      ...item,
      ...(imageUrl !== undefined ? { image: imageUrl } : {}),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('khutbahs')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as KhutbahItem;
    }

    const current = getStored<KhutbahItem[]>('masjid_khutbah_data', INITIAL_KHUTBAH);
    const updated = current.map((k) => (String(k.id) === String(id) ? { ...k, ...payload } : k));
    setStored('masjid_khutbah_data', updated);
    return updated.find((k) => String(k.id) === String(id)) as KhutbahItem;
  },

  async deleteKhutbah(id: number | string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('khutbahs').delete().eq('id', id);
      if (!error) return true;
    }
    const current = getStored<KhutbahItem[]>('masjid_khutbah_data', INITIAL_KHUTBAH);
    const updated = current.filter((k) => String(k.id) !== String(id));
    setStored('masjid_khutbah_data', updated);
    return true;
  },

  // ==========================================
  // BACKUP & RESTORE DATA (JSON)
  // ==========================================
  async exportAllData(): Promise<Record<string, any>> {
    const [id, kas, jam, ag, zk, inv, wk, jd] = await Promise.all([
      this.getIdentitas(),
      this.getKas(),
      this.getJamaah(),
      this.getKhutbahs(),
      this.getZakatQurban(),
      this.getInventories(),
      this.getWakaf(),
      this.getPetugasJumat(),
    ]);

    return {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      identitas: id,
      kas,
      jamaah: jam,
      khutbah: ag,
      zakat_qurban: zk,
      inventaris: inv,
      wakaf: wk,
      petugas_jumat: jd,
    };
  },

  async importAllData(data: Record<string, any>): Promise<boolean> {
    if (!data.kas && !data.identitas) {
      throw new Error('Format data cadangan JSON tidak valid');
    }

    if (data.identitas) setStored('masjid_identitas_data', data.identitas);
    if (data.kas) setStored('masjid_kas_data', data.kas);
    if (data.jamaah) setStored('masjid_jamaah_data', data.jamaah);
    if (data.khutbah) setStored('masjid_khutbah_data', data.khutbah);
    if (data.zakat_qurban) setStored('masjid_zakat_qurban_data', data.zakat_qurban);
    if (data.inventaris) setStored('masjid_inventory_data', data.inventaris);
    if (data.wakaf) setStored('masjid_wakaf_data', data.wakaf);
    if (data.petugas_jumat) setStored('masjid_petugas_jumat_data', data.petugas_jumat);

    return true;
  },
};
