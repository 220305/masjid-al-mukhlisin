import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export async function GET() {
  try {
    const data = await DataService.getInventories();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data inventaris', error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama_barang, jumlah, kondisi, lokasi } = body;

    if (!nama_barang || !jumlah || !kondisi || !lokasi) {
      return NextResponse.json({ message: 'Semua field wajib diisi' }, { status: 422 });
    }

    const item = await DataService.addInventory({
      nama_barang,
      jumlah: parseInt(jumlah, 10),
      kondisi,
      lokasi,
    });

    return NextResponse.json({ message: 'Inventory berhasil ditambahkan', data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menyimpan inventaris', error }, { status: 500 });
  }
}
