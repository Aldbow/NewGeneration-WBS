'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminStore } from '@/store/useAdminStore'
import { Shield, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAdminStore((s) => s.login)
  const router = useRouter()

  const [stats, setStats] = useState([
    { label: 'Total Tiket', value: '...' },
    { label: 'Menunggu Review', value: '...' },
    { label: 'Selesai', value: '...' },
    { label: 'Tingkat Selesai', value: '...' },
  ])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: total } = await supabase.from('tickets').select('*', { count: 'exact', head: true })
        const { count: menunggu } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).in('status', ['DITERIMA', 'DIVERIFIKASI'])
        const { count: selesai } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).in('status', ['SELESAI', 'DITOLAK'])

        if (total !== null) {
          const rate = total > 0 ? Math.round(((selesai || 0) / total) * 100) : 0
          setStats([
            { label: 'Total Tiket', value: String(total) },
            { label: 'Menunggu Review', value: String(menunggu || 0) },
            { label: 'Selesai', value: String(selesai || 0) },
            { label: 'Tingkat Selesai', value: `${rate}%` },
          ])
        }
      } catch (err) {
        console.error('Error fetching login stats:', err)
      }
    }
    fetchStats()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    const ok = login(username, password)
    setLoading(false)
    if (ok) {
      router.push('/admin/dashboard')
    } else {
      setError('Username atau password salah. Coba: admin / admin123')
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <main id="admin-login-main" className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden flex-col items-center justify-center p-12"
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 40%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} aria-hidden="true" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative text-center text-white max-w-md"
        >
          <div className="w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center mx-auto mb-8 border border-white/20">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-4">Portal Admin</h1>
          <p className="text-blue-100 leading-relaxed mb-8">
            Dashboard manajemen untuk memantau dan menangani seluruh laporan deklarasi dan pelanggaran secara terpusat.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ label, value }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="bg-white/10 rounded-xl p-3 text-center border border-white/10"
              >
                <p className="text-2xl font-heading font-bold">{value}</p>
                <p className="text-xs text-blue-200 mt-0.5">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Right Panel — Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#F8FAFC] relative"
      >
        {/* Back to Home — top left on desktop */}
        <Link
          href="/"
          id="back-to-home-btn"
          className="absolute top-6 left-6 hidden lg:flex items-center gap-2 text-sm text-[#475569] hover:text-[#0A2558] transition-colors group"
        >
          <span className="w-7 h-7 rounded-full border border-[#E2E8F0] flex items-center justify-center group-hover:border-[#0A2558] group-hover:bg-[#EFF6FF] transition-all">
            <ArrowLeft size={14} />
          </span>
          Kembali ke Beranda
        </Link>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <motion.div variants={fadeInUp} className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm text-[#0A2558]">Portal Integritas</p>
              <p className="text-xs text-[#475569]">Admin Panel</p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h2 className="text-2xl font-heading font-bold text-[#1E293B] mb-1">Selamat Datang</h2>
            <p className="text-[#475569] text-sm mb-8">Masuk ke panel administrasi</p>
          </motion.div>

          <motion.form variants={fadeInUp} id="admin-login-form" onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="admin-username" className="form-label">Username</label>
              <input
                id="admin-username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                autoComplete="username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="form-label">Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pr-12"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] hover:text-[#475569] transition"
                  aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                role="alert"
              >
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="admin-login-btn"
              type="submit"
              disabled={loading || !username || !password}
              className={`btn btn-primary w-full py-4 text-base ${loading || !username || !password ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memverifikasi...
                </>
              ) : 'Masuk ke Dashboard'}
            </motion.button>
            {/* 
            <p className="text-center text-xs text-[#94A3B8]">
              Demo: <code className="bg-gray-100 px-1 rounded">admin</code> / <code className="bg-gray-100 px-1 rounded">admin123</code>
            </p> */}

            {/* Back to Home — visible on mobile */}
            <Link
              href="/"
              id="back-to-home-mobile-btn"
              className="lg:hidden flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0A2558] transition-all mt-1"
            >
              <ArrowLeft size={15} />
              Kembali ke Beranda
            </Link>
          </motion.form>
        </motion.div>
      </motion.div>
    </main>
  )
}
