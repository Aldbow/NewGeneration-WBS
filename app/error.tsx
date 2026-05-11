'use client'

import Link from 'next/link'
import { Home, RefreshCw } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-heading font-bold text-red-400 mb-4">500</div>
        <h1 className="text-2xl font-heading font-bold text-[#1E293B] mb-2">Terjadi Kesalahan</h1>
        <p className="text-[#475569] mb-2">
          Server sedang mengalami gangguan. Tim teknis kami telah diberitahu dan sedang menangani masalah ini.
        </p>
        {error.digest && (
          <p className="text-xs text-[#94A3B8] font-mono mb-6">Kode: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn btn-primary">
            <RefreshCw size={16} /> Coba Lagi
          </button>
          <Link href="/" className="btn btn-secondary">
            <Home size={16} /> Beranda
          </Link>
        </div>
      </div>
    </main>
  )
}
