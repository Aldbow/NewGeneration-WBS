import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types' // Opsi untuk TS nanti

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL atau Anon Key tidak ditemukan. Pastikan variabel environment sudah diatur.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
