import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  // 1. Verifikasi Cron Secret
  // Vercel Cron akan mengirimkan header Authorization berisi `Bearer CRON_SECRET`
  const authHeader = request.headers.get('authorization')
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Lakukan operasi ringan ke Supabase untuk mencegah inactivity pause
    // Memanggil tabel 'tickets' dengan limit 1 hanya untuk memastikan koneksi aktif
    const { error } = await supabase.from('tickets').select('id').limit(1)

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase pinged successfully to prevent inactivity shutdown.',
      timestamp: new Date().toISOString()
    })
  } catch (err: unknown) {
    console.error('Cron job error:', err)
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to ping Supabase' 
    }, { status: 500 })
  }
}
