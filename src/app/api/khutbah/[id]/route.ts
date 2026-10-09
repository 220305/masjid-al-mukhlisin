import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get('content-type') || '';
    let file: File | null = null;
    let payload: Record<string, any> = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      formData.forEach((val, key) => {
        if (key !== 'image' && key !== '_method') {
          payload[key] = val;
        }
      });
      const fileData = formData.get('image');
      if (fileData && typeof fileData === 'object' && 'name' in fileData) {
        file = fileData as File;
      }
    } else {
      payload = await request.json();
    }

    const updated = await DataService.updateKhutbah(id, payload, file);
    return NextResponse.json({ message: 'Jadwal berhasil diperbarui', data: updated });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengupdate khutbah', error }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await DataService.deleteKhutbah(id);
    return NextResponse.json({ message: 'Jadwal dihapus' });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus khutbah', error }, { status: 500 });
  }
}
