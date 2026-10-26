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
  SaranKritikItem,
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
  logo_url: null,
};

const INITIAL_KAS: KasItem[] = [];
const INITIAL_JAMAAH: JamaahItem[] = [];
const INITIAL_PETUGAS_JUMAT: PetugasJumatItem[] = [];
const INITIAL_ZAKAT_QURBAN: ZakatQurbanItem[] = [];
const INITIAL_INVENTORY: InventoryItem[] = [];
const INITIAL_WAKAF: WakafItem[] = [];
const INITIAL_KHUTBAH: KhutbahItem[] = [];
const INITIAL_SARAN_KRITIK: SaranKritikItem[] = [
  {
    id: 1,
    nama: 'Haji Hendra Kusuma',
    no_hp: '081234567890',
    kategori: 'Fasilitas & Kebersihan',
    pesan: 'Mohon agar kran tempat wudhu bagian selatan diperbaiki karena ada dua kran yang debit airnya kecil saat jam shalat Jumat.',
    status: 'selesai',
    tanggapan_dkm: 'Alhamdulillah, terima kasih atas sarannya Pak Haji Hendra. Tim sarpras DKM telah mengganti sil kran dan pipa saluran wudhu kemarin sore. Saat ini debit air sudah kembali lancar dan normal.',
    ditanggapi_oleh: 'H. Mulyadi, S.E. (Sarpras DKM)',
    ditanggapi_pada: '2026-10-25T14:30:00.000Z',
    is_publik: true,
    created_at: '2026-10-24T08:15:00.000Z',
  },
  {
    id: 2,
    nama: 'Hamba Allah',
    kategori: 'Kajian & Dakwah',
    pesan: 'Apakah bisa diadakan kajian rutin khusus fiqih muamalah kontemporer atau parenting islami untuk remaja dan pemuda masjid di malam minggu?',
    status: 'ditindaklanjuti',
    tanggapan_dkm: 'Jazakallahu khairan atas usulan yang sangat baik. Agenda kajian pemuda sedang kami godok bersama Remaja Masjid (IRMA) dan insyaAllah akan dimulai bulan depan dengan mengundang asatidz tamu.',
    ditanggapi_oleh: 'Ustadz H. Ahmad Sobari (Ketua DKM)',
    ditanggapi_pada: '2026-10-25T19:00:00.000Z',
    is_publik: true,
    created_at: '2026-10-24T16:20:00.000Z',
  },
  {
    id: 3,
    nama: 'Ibu Siti Rahmawati',
    no_hp: '085712349988',
    kategori: 'Fasilitas & Kebersihan',
    pesan: 'Untuk area shalat akhwat / jamaah wanita di lantai 2, mohon ditambah beberapa mukena bersih cadangan dan pewangi ruangan.',
    status: 'selesai',
    tanggapan_dkm: 'Terima kasih atas masukannya Bu Siti. Divisi Muslimah DKM sudah mencuci dan menambahkan 10 set mukena baru serta memasang diffuser aromaterapi di shaf wanita.',
    ditanggapi_oleh: 'Divisi Keputrian DKM',
    ditanggapi_pada: '2026-10-25T11:20:00.000Z',
    is_publik: true,
    created_at: '2026-10-23T10:00:00.000Z',
  },
];


// Helper local storage & Auto-purge cache lama agar mulai bersih dari 0
const STORAGE_DATA_VERSION = 'v2_clean_zero_production';

function checkAndPurgeLegacyData(): void {
  if (typeof window === 'undefined') return;
  try {
    const currentVer = localStorage.getItem('masjid_data_version');
    if (currentVer !== STORAGE_DATA_VERSION) {
      localStorage.removeItem('masjid_kas_data');
      localStorage.removeItem('masjid_jamaah_data');
      localStorage.removeItem('masjid_inventory_data');
      localStorage.removeItem('masjid_khutbah_data');
      localStorage.removeItem('masjid_zakat_qurban_data');
      localStorage.removeItem('masjid_wakaf_data');
      localStorage.removeItem('masjid_petugas_jumat_data');
      localStorage.setItem('masjid_data_version', STORAGE_DATA_VERSION);
    }
  } catch (err) {
    console.warn('Auto purge error:', err);
  }
}

if (typeof window !== 'undefined') {
  checkAndPurgeLegacyData();
}

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    checkAndPurgeLegacyData();
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
    const stored = getStored<IdentitasMasjid>('masjid_identitas_data', INITIAL_IDENTITAS);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('identitas_masjid')
          .select('*')
          .eq('id', 1)
          .maybeSingle();
        if (!error && data) {
          return { ...stored, ...(data as IdentitasMasjid) };
        }
      } catch (err) {
        console.warn('Supabase getIdentitas error:', err);
      }
    }
    return stored;
  },

  async updateIdentitas(item: Partial<IdentitasMasjid>): Promise<IdentitasMasjid> {
    const payload = { ...item, updated_at: new Date().toISOString() };
    let savedData: IdentitasMasjid | null = null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('identitas_masjid')
          .upsert({ id: 1, ...payload })
          .select()
          .single();
        if (!error && data) {
          savedData = data as IdentitasMasjid;
        }
      } catch (err) {
        console.warn('Supabase updateIdentitas fallback to localStorage:', err);
      }
    }
    const current = getStored<IdentitasMasjid>('masjid_identitas_data', INITIAL_IDENTITAS);
    const updated = { ...current, ...payload, ...(savedData || {}) };
    setStored('masjid_identitas_data', updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('masjid_identitas_updated', { detail: updated }));
    }
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
    const rawItems = getStored<KhutbahItem[]>('masjid_khutbah_data', INITIAL_KHUTBAH);
    // Jika tidak ada gambar kustom atau link placeholder/unsplash, set image = null agar poster otomatis ter-generate
    const sanitized = rawItems.map((item) => {
      const isCustomImage =
        Boolean(item.image) &&
        !item.image!.includes('unsplash.com') &&
        !item.image!.includes('default-khutbah') &&
        !item.image!.startsWith('/images/') &&
        (item.image!.startsWith('data:image') ||
          item.image!.includes('supabase.co') ||
          item.image!.includes('supabase.in') ||
          item.image!.includes('khutbah-images'));
      return {
        ...item,
        image: isCustomImage ? item.image : null,
      };
    });
    setStored('masjid_khutbah_data', sanitized);
    return sanitized;
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

  async uploadLogoImage(file: File): Promise<string> {
    // 1. Client-side image compression to ~400px (fast, lightweight, ultra-crisp)
    const compressedDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 400;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
            resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/webp', 0.9));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    // 2. Coba upload ke Supabase Storage jika terhubung
    if (isSupabaseConfigured && supabase) {
      try {
        const ext = file.name.split('.').pop() || 'png';
        const cleanFileName = `logo_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('khutbah-images')
          .upload(cleanFileName, file);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('khutbah-images')
            .getPublicUrl(cleanFileName);
          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Storage upload fallback to compressed image:', err);
      }
    }

    return compressedDataUrl;
  },

  async addKhutbah(item: Omit<KhutbahItem, 'id'>, file?: File | null): Promise<KhutbahItem> {
    let imageUrl = item.image;
    if (file) {
      imageUrl = await this.uploadKhutbahImage(file);
    }
    const payload = { ...item, image: imageUrl || null };
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
      image: imageUrl !== undefined ? imageUrl : item.image,
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
  // SARAN & KRITIK (ASPIRASI JAMAAH)
  // ==========================================
  async getSaranKritik(onlyPublic = false): Promise<SaranKritikItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('saran_kritik')
          .select('*')
          .order('created_at', { ascending: false });
        if (onlyPublic) {
          query = query.eq('is_publik', true);
        }
        const { data, error } = await query;
        if (!error && data) return data as SaranKritikItem[];
      } catch (err) {
        console.warn('Supabase getSaranKritik error:', err);
      }
    }
    const stored = getStored<SaranKritikItem[]>('masjid_saran_data', INITIAL_SARAN_KRITIK);
    if (onlyPublic) {
      return stored.filter((s) => s.is_publik !== false);
    }
    return stored;
  },

  async addSaranKritik(
    item: Omit<SaranKritikItem, 'id' | 'created_at'> & Partial<Pick<SaranKritikItem, 'status' | 'is_publik'>>
  ): Promise<SaranKritikItem> {
    const payload = {
      nama: item.nama || 'Hamba Allah',
      no_hp: item.no_hp || null,
      kategori: item.kategori || 'Umum',
      pesan: item.pesan,
      status: item.status || 'baru',
      is_publik: item.is_publik !== undefined ? item.is_publik : true,
      tanggapan_dkm: item.tanggapan_dkm || null,
      ditanggapi_oleh: item.ditanggapi_oleh || null,
      ditanggapi_pada: item.ditanggapi_pada || null,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('saran_kritik')
          .insert([payload])
          .select()
          .single();
        if (!error && data) {
          const newItem = data as SaranKritikItem;
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('masjid_saran_updated', { detail: newItem }));
          }
          return newItem;
        }
      } catch (err) {
        console.warn('Supabase addSaranKritik error:', err);
      }
    }

    const current = getStored<SaranKritikItem[]>('masjid_saran_data', INITIAL_SARAN_KRITIK);
    const newItem: SaranKritikItem = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      ...payload,
    };
    const updated = [newItem, ...current];
    setStored('masjid_saran_data', updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('masjid_saran_updated', { detail: newItem }));
    }
    return newItem;
  },

  async updateSaranKritik(id: number | string, item: Partial<SaranKritikItem>): Promise<SaranKritikItem> {
    const payload = { ...item, updated_at: new Date().toISOString() };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('saran_kritik')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          const updatedItem = data as SaranKritikItem;
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('masjid_saran_updated', { detail: updatedItem }));
          }
          return updatedItem;
        }
      } catch (err) {
        console.warn('Supabase updateSaranKritik error:', err);
      }
    }

    const current = getStored<SaranKritikItem[]>('masjid_saran_data', INITIAL_SARAN_KRITIK);
    const updated = current.map((s) => (String(s.id) === String(id) ? { ...s, ...payload } : s));
    setStored('masjid_saran_data', updated);
    const target = updated.find((s) => String(s.id) === String(id)) as SaranKritikItem;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('masjid_saran_updated', { detail: target }));
    }
    return target;
  },

  async deleteSaranKritik(id: number | string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('saran_kritik').delete().eq('id', id);
        if (!error) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('masjid_saran_updated', { detail: { id, deleted: true } }));
          }
          return true;
        }
      } catch (err) {
        console.warn('Supabase deleteSaranKritik error:', err);
      }
    }

    const current = getStored<SaranKritikItem[]>('masjid_saran_data', INITIAL_SARAN_KRITIK);
    const updated = current.filter((s) => String(s.id) !== String(id));
    setStored('masjid_saran_data', updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('masjid_saran_updated', { detail: { id, deleted: true } }));
    }
    return true;
  },

  // ==========================================
  // BACKUP & RESTORE DATA (JSON)
  // ==========================================
  async exportAllData(): Promise<Record<string, any>> {
    const [id, kas, jam, ag, zk, inv, wk, jd, sr] = await Promise.all([
      this.getIdentitas(),
      this.getKas(),
      this.getJamaah(),
      this.getKhutbahs(),
      this.getZakatQurban(),
      this.getInventories(),
      this.getWakaf(),
      this.getPetugasJumat(),
      this.getSaranKritik(),
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
      saran_kritik: sr,
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
    if (data.saran_kritik) setStored('masjid_saran_data', data.saran_kritik);

    return true;
  },

  async clearAllData(): Promise<boolean> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('masjid_kas_data');
      localStorage.removeItem('masjid_jamaah_data');
      localStorage.removeItem('masjid_khutbah_data');
      localStorage.removeItem('masjid_zakat_qurban_data');
      localStorage.removeItem('masjid_inventory_data');
      localStorage.removeItem('masjid_wakaf_data');
      localStorage.removeItem('masjid_petugas_jumat_data');
      localStorage.removeItem('masjid_saran_data');
    }
    return true;
  },
};

export default DataService;

