/**
 * Utility untuk konversi dan format tanggal Hijriah baku Indonesia.
 * 
 * Mengapa tidak menggunakan `new Intl.DateTimeFormat('id-ID-u-ca-islamic-civil', { month: 'long' })`?
 * Pada perangkat mobile (terutama Android / Chrome Mobile / WebView), pustaka ICU seringkali
 * tidak menyertakan data lokalisasi nama bulan Hijriah untuk bahasa Indonesia ('id-ID').
 * Hal ini menyebabkan browser Android melakukan fallback ke nama bulan Gregorian (Masehi)
 * dan era Sebelum Masehi (SM). Contoh:
 *   Bulan ke-5 Hijriah (Jumadil Awal) diubah menjadi "Mei", dan era menjadi "SM"
 *   -> "16 Mei 1448 SM" alih-alih "16 Jumadil Awal 1448 H".
 * 
 * Solusi:
 * Mengambil angka numerik hari, bulan (1-12), dan tahun Hijriah, kemudian memetakannya
 * secara eksplisit ke daftar nama bulan Hijriah standar Indonesia.
 */

export const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  'Rabiul Awwal',
  'Rabiul Akhir',
  'Jumadil Awal',
  'Jumadil Akhir',
  'Rajab',
  "Sya'ban",
  'Ramadhan',
  'Syawal',
  "Dzulqa'dah",
  'Dzulhijjah',
] as const;

export function getHijriDateString(date: Date = new Date()): string {
  // 1. Coba Intl.DateTimeFormat dengan numeric parts untuk akurasi astronomis/hisab
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-civil-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    const day = parts.find((p) => p.type === 'day')?.value;
    const monthStr = parts.find((p) => p.type === 'month')?.value;
    const year = parts.find((p) => p.type === 'year')?.value;

    if (day && monthStr && year) {
      const monthNum = parseInt(monthStr, 10);
      const monthName = HIJRI_MONTHS[monthNum - 1];
      if (monthName) {
        return `${day} ${monthName} ${year} H`;
      }
    }
  } catch {
    // Abaikan jika Intl tidak mendukung kalender islamic
  }

  // 2. Fallback algoritma kalkulasi matematis kalender Hijriah (Kuwaiti algorithm)
  try {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    let m = month + 1;
    let y = year;
    if (m < 3) {
      y -= 1;
      m += 12;
    }

    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
    let z = jd - 1948440 + 10632;
    const n = Math.floor((z - 1) / 10631);
    z = z - 10631 * n + 354;
    const j =
      Math.floor((10985 - z) / 5316) * Math.floor((50 * z) / 17719) +
      Math.floor(z / 5670) * Math.floor((43 * z) / 15238);
    z =
      z -
      Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
      Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
      29;
    const mH = Math.floor((24 * z) / 709);
    const dH = z - Math.floor((709 * mH) / 24);
    const yH = 30 * n + j - 30;

    const monthName = HIJRI_MONTHS[mH - 1];
    if (monthName) {
      return `${dH} ${monthName} ${yH} H`;
    }
  } catch {
    // abaikan jika kalkulasi error
  }

  return '';
}
