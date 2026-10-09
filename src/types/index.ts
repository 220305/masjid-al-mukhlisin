export type KondisiBarang = 'baik' | 'pemeliharaan' | 'dipinjamkan' | 'rusak';
export type TipeKas = 'masuk' | 'keluar';
export type KategoriKas =
  | 'Infaq Jumat'
  | 'Donasi'
  | 'Zakat'
  | 'Operasional'
  | 'Listrik & Air'
  | 'Honor'
  | 'Perawatan'
  | 'Lainnya';
export type StatusKhutbah = 'terjadwal' | 'selesai' | 'batal';
export type PeranJamaah =
  | 'Jamaah'
  | 'Pengurus DKM'
  | 'Imam'
  | 'Muadzin'
  | 'Remaja Masjid'
  | 'Donatur';
export type JenisZakat =
  | 'Zakat Fitrah (uang)'
  | 'Zakat Fitrah (beras)'
  | 'Zakat Mal'
  | 'Qurban Sapi (1/7)'
  | 'Qurban Kambing'
  | 'Penyaluran';
export type JenisWakaf =
  | 'Tanah'
  | 'Bangunan'
  | 'Uang'
  | "Al-Qur'an"
  | 'Peralatan'
  | 'Lainnya';

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
  kategori?: string;
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

export interface JamaahItem {
  id: number | string;
  nama: string;
  no_hp?: string;
  alamat?: string;
  peran: PeranJamaah;
  user_id?: string | null;
  created_at?: string;
}

export interface PetugasJumatItem {
  id: number | string;
  tanggal: string;
  imam: string;
  khatib: string;
  muadzin: string;
  user_id?: string | null;
  created_at?: string;
}

export interface ZakatQurbanItem {
  id: number | string;
  tanggal: string;
  nama: string;
  jenis: JenisZakat;
  jumlah_jiwa: number;
  beras_kg: number;
  nominal: number;
  keterangan?: string;
  user_id?: string | null;
  created_at?: string;
}

export interface WakafItem {
  id: number | string;
  tanggal: string;
  wakif: string;
  jenis: JenisWakaf;
  nilai: number;
  keterangan?: string;
  user_id?: string | null;
  created_at?: string;
}

export interface IdentitasMasjid {
  id?: number;
  nama: string;
  nomor_id_kemenag: string;
  alamat: string;
  ketua_dkm: string;
  bendahara: string;
  updated_at?: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role?: string;
}
