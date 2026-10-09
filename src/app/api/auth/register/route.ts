import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Nama, email, dan password wajib diisi' }, { status: 422 });
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) {
        return NextResponse.json({ message: error.message }, { status: 422 });
      }
      return NextResponse.json({
        message: 'Registrasi berhasil',
        access_token: data.session?.access_token,
        user: data.user,
      });
    }

    return NextResponse.json({
      message: 'Registrasi berhasil (Demo Mode)',
      access_token: 'demo_token_masjid_offline',
      user: {
        id: `demo_${Date.now()}`,
        name,
        email,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Server auth error', error }, { status: 500 });
  }
}
