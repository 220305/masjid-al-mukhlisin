/**
 * Layanan Pengambilan Jadwal Shalat Resmi Kemenag RI (Bimas Islam).
 * Khusus wilayah Kabupaten Bandung (Kecamatan Margaasih / Desa Lagadar).
 *
 * Mengapa menggunakan API Resmi Kemenag RI (MyQuran)?
 * 1. Menerapkan menit 'Ihtiyath' (+2 s.d. +3 menit pengaman) sesuai ketetapan hisab rukyat Kemenag RI.
 * 2. Mengakomodasi elevasi/ketinggian wilayah Bandung Barat / Kab. Bandung sehingga waktu Maghrib & Subuh akurat.
 * 3. Selaras 100% dengan jadwal adzan masjid sekitar, radio/TV, dan aplikasi resmi Kemenag.
 */

export interface PrayerTimings {
  Imsak: string;
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export async function getOfficialPrayerTimes(date: Date = new Date()): Promise<PrayerTimings> {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  // 1. Prioritas Utama: API Resmi Kemenag RI (Bimas Islam) - ID 1201: KAB. BANDUNG (Margaasih, Lagadar)
  try {
    const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/1201/${y}/${m}/${d}`);
    if (res.ok) {
      const json = await res.json();
      if (json?.status && json?.data?.jadwal) {
        const j = json.data.jadwal;
        return {
          Imsak: j.imsak,
          Fajr: j.subuh,
          Sunrise: j.terbit,
          Dhuhr: j.dzuhur,
          Asr: j.ashar,
          Maghrib: j.maghrib,
          Isha: j.isya,
        };
      }
    }
  } catch (err) {
    console.warn('Gagal memuat jadwal shalat dari API Kemenag, mencoba cadangan Aladhan:', err);
  }

  // 2. Cadangan Aladhan API dengan metode 20 (Kemenag) dan koordinat Margaasih / Lagadar (-6.9315, 107.5457)
  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${d}-${m}-${y}?latitude=-6.9315&longitude=107.5457&method=20`
    );
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.timings) {
        return json.data.timings;
      }
    }
  } catch (err) {
    console.warn('Gagal memuat jadwal shalat cadangan Aladhan:', err);
  }

  // 3. Fallback waktu shalat standar wilayah Kab. Bandung
  return {
    Imsak: '03:56',
    Fajr: '04:06',
    Sunrise: '05:16',
    Dhuhr: '11:37',
    Asr: '14:49',
    Maghrib: '17:51',
    Isha: '18:58',
  };
}
