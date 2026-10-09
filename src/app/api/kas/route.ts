import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export async function GET() {
  try {
    const data = await DataService.getKas();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data kas', error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keterangan, nominal, tipe, tanggal } = body;

    if (!keterangan || !nominal || !tipe || !tanggal) {
      return NextResponse.json({ message: 'Semua field wajib diisi' }, { status: 422 });
    }

    const item = await DataService.addKas({
      keterangan,
      nominal: parseFloat(nominal),
      tipe,
      tanggal,
    });

    return NextResponse.json({ message: 'Data kas berhasil dicatat', data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mencatat kas', error }, { status: 500 });
  }
}
