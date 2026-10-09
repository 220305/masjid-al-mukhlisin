import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email dan password wajib diisi' }, { status: 422 });
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return NextResponse.json({ message: error.message }, { status: 401 });
      }
      return NextResponse.json({
        message: 'Login sukses',
        access_token: data.session?.access_token,
        user: data.user,
      });
    }

    // Demo / offline token
    return NextResponse.json({
      message: 'Login sukses (Demo/Offline Mode)',
      access_token: 'demo_token_masjid_offline',
      user: {
        id: 'demo_user_1',
        email,
        name: email.split('@')[0],
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Server auth error', error }, { status: 500 });
  }
}
