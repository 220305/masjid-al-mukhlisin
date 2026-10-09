import { supabase, isSupabaseConfigured } from './supabase/client';
import { InventoryItem, KasItem, KhutbahItem } from '@/types';

// Data bawaan awal (Seed data untuk demo / fallback offline)
const INITIAL_KAS: KasItem[] = [
  {
    id: 1,
    keterangan: 'Infaq Kotak Amal Shalat Jumat',
    nominal: 4850000,
    tipe: 'masuk',
    tanggal: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 2,
    keterangan: 'Sedekah Operasional Hamba Allah',
    nominal: 2500000,
    tipe: 'masuk',
    tanggal: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 3,
    keterangan: 'Pembayaran Listrik PLN & Air PDAM',
    nominal: 850000,
    tipe: 'keluar',
    tanggal: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 4,
    keterangan: 'Bisyarah Ustadz Khotib Jumat',
    nominal: 500000,
    tipe: 'keluar',
    tanggal: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 5,
    keterangan: 'Infaq Donasi QRIS Al-Mukhlisin',
    nominal: 1200000,
    tipe: 'masuk',
    tanggal: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 6,
    keterangan: 'Pembelian Sabun & Pembersih Lantai Masjid',
    nominal: 175000,
    tipe: 'keluar',
    tanggal: new Date().toISOString().split('T')[0],
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    nama_barang: 'Sound System Amplifier Yamaha EMX5014C',
    jumlah: 1,
    kondisi: 'baik',
    lokasi: 'Ruang Kontrol Audio',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 2,
    nama_barang: 'Microphone Wireless Shure BLX288/PG58',
    jumlah: 4,
    kondisi: 'baik',
    lokasi: 'Mimbar Utama',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 3,
    nama_barang: 'Karpet Sajadah Tebal Turki Grade A (Roll)',
    jumlah: 12,
    kondisi: 'baik',
    lokasi: 'Ruang Shalat Utama',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 4,
    nama_barang: 'Pendingin Ruangan AC Daikin Standing 5 PK',
    jumlah: 4,
    kondisi: 'baik',
    lokasi: 'Ruang Shalat Utama',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 5,
    nama_barang: 'Genset Silent Honda 7500 Watt',
    jumlah: 1,
    kondisi: 'baik',
    lokasi: 'Gudang Belakang',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 6,
    nama_barang: 'Vacuum Cleaner Industrial Karcher',
    jumlah: 2,
    kondisi: 'pemeliharaan',
    lokasi: 'Gudang Kebersihan',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 7,
    nama_barang: 'Proyektor Epson EB-E500 & Layar Motorized',
    jumlah: 1,
    kondisi: 'baik',
    lokasi: 'Ruang Kajian / Serbaguna',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 8,
    nama_barang: 'Kursi Lipat Chitose untuk Lansia',
    jumlah: 30,
    kondisi: 'baik',
    lokasi: 'Selasar Depan',
    created_at: new Date().toISOString(),
  },
];

const INITIAL_KHUTBAH: KhutbahItem[] = [
  {
    id: 1,
    tanggal: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    jenis_kegiatan: 'Shalat Jumat',
    khotib: 'Ust. Dr. H. Ahmad Farhan, M.Ag',
    tema: 'Merajut Ukhuwah di Tengah Keberagaman',
    image: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=800&q=80',
    status: 'terjadwal',
  },
  {
    id: 2,
    tanggal: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    jenis_kegiatan: 'Kajian Ahad Subuh',
    khotib: 'K.H. Muhammad Ridwan',
    tema: 'Tafsir Surat Al-Kahfi: Menjaga Aqidah Akhir Zaman',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
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

// Helper local storage untuk fallback offline
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
  // KAS KEUANGAN
  // ==========================================
  async getKas(): Promise<KasItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('kas')
        .select('*')
        .order('tanggal', { ascending: false });
      if (!error && data) return data as KasItem[];
      console.warn('Supabase fetch error, fallback to local storage:', error?.message);
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
      console.warn('Supabase insert error, fallback to local:', error?.message);
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
      console.warn('Supabase update error, fallback to local:', error?.message);
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
      console.warn('Supabase delete error, fallback to local:', error?.message);
    }
    const current = getStored<KasItem[]>('masjid_kas_data', INITIAL_KAS);
    const updated = current.filter((k) => String(k.id) !== String(id));
    setStored('masjid_kas_data', updated);
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
      console.warn('Supabase fetch error, fallback to local:', error?.message);
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
      console.warn('Supabase insert error, fallback to local:', error?.message);
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
      console.warn('Supabase update error, fallback to local:', error?.message);
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
      console.warn('Supabase delete error, fallback to local:', error?.message);
    }
    const current = getStored<InventoryItem[]>('masjid_inventory_data', INITIAL_INVENTORY);
    const updated = current.filter((inv) => String(inv.id) !== String(id));
    setStored('masjid_inventory_data', updated);
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
      console.warn('Supabase fetch error, fallback to local:', error?.message);
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
      console.warn('Supabase Storage upload error, falling back to base64 preview:', uploadError.message);
    }

    // Fallback convert to Data URL for instant display
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
      console.warn('Supabase insert error, fallback to local:', error?.message);
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
      ...(imageUrl ? { image: imageUrl } : {}),
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
      console.warn('Supabase update error, fallback to local:', error?.message);
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
      console.warn('Supabase delete error, fallback to local:', error?.message);
    }
    const current = getStored<KhutbahItem[]>('masjid_khutbah_data', INITIAL_KHUTBAH);
    const updated = current.filter((k) => String(k.id) !== String(id));
    setStored('masjid_khutbah_data', updated);
    return true;
  },
};
