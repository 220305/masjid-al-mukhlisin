import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET() {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('identitas_masjid')
        .select('id, nama')
        .limit(1);

      if (error) {
        return NextResponse.json(
          { status: 'warning', message: 'Query error', error: error.message, timestamp: now },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: 'ok',
        message: 'Supabase ping keep-alive success',
        timestamp: now,
        data,
      });
    } catch (err: any) {
      return NextResponse.json(
        { status: 'error', message: err?.message || 'Server error', timestamp: now },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Ping success (Supabase not configured)',
    timestamp: now,
  });
}
