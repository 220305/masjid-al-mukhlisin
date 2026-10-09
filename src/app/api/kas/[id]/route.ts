import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await DataService.updateKas(id, body);
    return NextResponse.json({ message: 'Data kas berhasil diupdate', data: updated });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengupdate kas', error }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await DataService.deleteKas(id);
    return NextResponse.json({ message: 'Data kas berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus kas', error }, { status: 500 });
  }
}
