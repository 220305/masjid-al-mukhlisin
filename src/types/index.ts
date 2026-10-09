export type KondisiBarang = 'baik' | 'pemeliharaan' | 'dipinjamkan' | 'rusak';
export type TipeKas = 'masuk' | 'keluar';
export type StatusKhutbah = 'terjadwal' | 'selesai' | 'batal';

export interface InventoryItem {
  id: number | string;
  nama_barang: string;
  jumlah: number;
  kondisi: KondisiBarang;
  lokasi: string;
  user_id?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface KasItem {
  id: number | string;
  keterangan: string;
  nominal: number;
  tipe: TipeKas;
  tanggal: string;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface KhutbahItem {
  id: number | string;
  tanggal: string;
  jenis_kegiatan: string;
  khotib: string;
  tema?: string | null;
  image?: string | null;
  image_url?: string | null;
  link?: string | null;
  status: StatusKhutbah;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role?: string;
}
