import Link from 'next/link'
import { Home, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-heading font-bold gradient-text mb-4">404</div>
        <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-[#1E293B] mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-[#475569] mb-8">
          Halaman yang Anda cari tidak ada atau telah dipindahkan. Silakan kembali ke beranda.
        </p>
        <Link href="/" className="btn btn-primary px-8">
          <Home size={18} /> Kembali ke Beranda
        </Link>
      </div>
    </main>
  )
}
