import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export async function GET() {
  try {
    const data = await DataService.getKhutbahs();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil jadwal khutbah', error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let tanggal = '';
    let jenis_kegiatan = '';
    let khotib = '';
    let tema = '';
    let link = '';
    let status: 'terjadwal' | 'selesai' | 'batal' = 'terjadwal';
    let file: File | null = null;
    let image = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      tanggal = (formData.get('tanggal') as string) || '';
      jenis_kegiatan = (formData.get('jenis_kegiatan') as string) || 'Shalat Jumat';
      khotib = (formData.get('khotib') as string) || '';
      tema = (formData.get('tema') as string) || '';
      link = (formData.get('link') as string) || '';
      status = ((formData.get('status') as string) || 'terjadwal') as 'terjadwal' | 'selesai' | 'batal';
      const fileData = formData.get('image');
      if (fileData && typeof fileData === 'object' && 'name' in fileData) {
        file = fileData as File;
      } else if (typeof fileData === 'string') {
        image = fileData;
      }
    } else {
      const body = await request.json();
      tanggal = body.tanggal;
      jenis_kegiatan = body.jenis_kegiatan || 'Shalat Jumat';
      khotib = body.khotib;
      tema = body.tema || '';
      link = body.link || '';
      status = body.status || 'terjadwal';
      image = body.image || '';
    }

    if (!tanggal || !khotib || !jenis_kegiatan) {
      return NextResponse.json({ message: 'Tanggal, jenis kegiatan, dan khotib wajib diisi' }, { status: 422 });
    }

    const item = await DataService.addKhutbah(
      {
        tanggal,
        jenis_kegiatan,
        khotib,
        tema,
        link,
        status,
        image: image || null,
      },
      file
    );

    return NextResponse.json({ message: 'Data khutbah berhasil disimpan!', data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menyimpan khutbah', error }, { status: 500 });
  }
}
