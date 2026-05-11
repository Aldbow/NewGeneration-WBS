'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { findTicket, getStatusLabel, getStatusDotColor, Ticket } from '@/lib/mock-data'
import { formatDateShort } from '@/lib/ticket'
import { Search, CheckCircle, AlertCircle, Clock, FileText, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

function TicketTimeline({ ticket }: { ticket: Ticket }) {
  const dotColors: Record<string, string> = {
    DITERIMA: 'bg-blue-500',
    DIVERIFIKASI: 'bg-yellow-500',
    DIPROSES: 'bg-orange-500',
    SELESAI: 'bg-green-500',
    DITOLAK: 'bg-red-500',
  }

  const textColors: Record<string, string> = {
    DITERIMA: 'text-blue-600',
    DIVERIFIKASI: 'text-yellow-600',
    DIPROSES: 'text-orange-600',
    SELESAI: 'text-green-600',
    DITOLAK: 'text-red-600',
  }

  return (
    <div className="mt-6">
      <h3 className="font-heading font-bold text-[#1E293B] mb-4 flex items-center gap-2">
        <Clock size={16} className="text-[#0A2558]" />
        Riwayat Status
      </h3>
      <div className="space-y-0">
        {ticket.timeline.map((item, idx) => {
          const isActive = idx === ticket.timeline.length - 1
          return (
            <div key={idx} className={`timeline-item ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              <div className={`timeline-dot ${dotColors[item.status] || 'bg-gray-400'}`}>
                {isActive && item.status === 'SELESAI' ? (
                  <CheckCircle size={12} className="text-white" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-heading font-bold text-sm ${textColors[item.status]}`}>{item.label}</p>
                  <span className="text-xs text-[#94A3B8] shrink-0">{formatDateShort(item.date)}</span>
                </div>
                {item.note && (
                  <p className="text-sm text-[#475569] mt-1">{item.note}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CekTiketContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('id') || '')
  const [result, setResult] = useState<Ticket | null>(null)
  const [searched, setSearched] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      doSearch(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const doSearch = (q: string) => {
    const found = findTicket(q.trim())
    setSearched(true)
    if (found) {
      setResult(found)
      setNotFound(false)
    } else {
      setResult(null)
      setNotFound(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    doSearch(query)
  }

  const statusBg: Record<string, string> = {
    DITERIMA: 'bg-blue-50 border-blue-200',
    DIVERIFIKASI: 'bg-yellow-50 border-yellow-200',
    DIPROSES: 'bg-orange-50 border-orange-200',
    SELESAI: 'bg-green-50 border-green-200',
    DITOLAK: 'bg-red-50 border-red-200',
  }

  return (
    <>
      {/* Search Bar */}
      <form id="cek-tiket-form" onSubmit={handleSubmit} className="max-w-xl mx-auto mb-10">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="ticket-search-input"
              type="text"
              placeholder="Masukkan nomor tiket (DKL-2025-... / WBS-2025-...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-input pl-12 text-base py-4 shadow-lg w-full"
              aria-label="Nomor tiket"
            />
          </div>
          <button
            id="ticket-search-btn"
            type="submit"
            className="btn btn-primary px-6 py-4 text-sm whitespace-nowrap shrink-0"
          >
            Cek Status
          </button>
        </div>
        <p className="text-center text-sm text-[#94A3B8] mt-2">
          Contoh: <span className="font-mono text-[#475569]">DKL-2025-00001</span> atau <span className="font-mono text-[#475569]">WBS-2025-00001</span>
        </p>
      </form>

      {/* Result */}
      {result && (
        <div id="ticket-result" className="max-w-xl mx-auto">
          {/* Status Header */}
          <div className={`border rounded-2xl p-5 mb-4 ${statusBg[result.status] || 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {result.type === 'deklarasi' ? (
                    <FileText size={16} className="text-[#0A2558]" />
                  ) : (
                    <AlertTriangle size={16} className="text-red-500" />
                  )}
                  <span className="text-xs font-semibold uppercase text-[#475569]">
                    {result.type === 'deklarasi' ? 'Deklarasi Keterpaksaan' : 'Laporan Pelanggaran'}
                  </span>
                </div>
                <p className="font-heading font-bold text-[#1E293B] text-lg mb-1">
                  {result.ticketId}
                </p>
                {result.type === 'laporan' && (
                  <p className="text-sm text-[#475569]">{result.title}</p>
                )}
                {result.type === 'deklarasi' && (
                  <p className="text-sm text-[#475569]">Oleh: {result.nama} — {result.jabatan}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className={`font-heading font-bold text-sm ${getStatusDotColor(result.status).replace('bg-', 'text-')}`}>
                  {getStatusLabel(result.status)}
                </p>
                <p className="text-xs text-[#94A3B8]">{formatDateShort(result.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <TicketTimeline ticket={result} />
        </div>
      )}

      {notFound && (
        <div id="ticket-not-found" className="max-w-xl mx-auto text-center card p-8">
          <AlertCircle size={40} className="mx-auto mb-4 text-[#94A3B8]" />
          <p className="font-heading font-bold text-[#1E293B] mb-2">Tiket Tidak Ditemukan</p>
          <p className="text-sm text-[#475569]">
            Nomor tiket <strong>{query}</strong> tidak ada dalam sistem kami. Pastikan nomor yang dimasukkan benar.
          </p>
          <p className="text-xs text-[#94A3B8] mt-3">
            Coba contoh: DKL-2025-00001 atau WBS-2025-00001
          </p>
        </div>
      )}

      {!searched && (
        <div className="max-w-xl mx-auto text-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {[
              { label: 'Buat Deklarasi', href: '/deklarasi', icon: FileText, desc: 'Deklarasikan benturan kepentingan' },
              { label: 'Lapor Pelanggaran', href: '/lapor', icon: AlertTriangle, desc: 'Laporan anonim terlindungi' },
            ].map(({ label, href, icon: Icon, desc }) => (
              <Link key={href} href={href} className="card p-5 text-left hover:scale-105 transition-transform">
                <Icon size={20} className="text-[#0A2558] mb-2" />
                <p className="font-heading font-semibold text-[#1E293B] text-sm">{label}</p>
                <p className="text-xs text-[#94A3B8]">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default function CekTiketPage() {
  return (
    <>
      <Header />
      <main id="cek-tiket-main" className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
        <div className="gradient-bg py-12 mb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-3">Cek Status Tiket</h1>
            <p className="text-blue-100">Pantau perkembangan laporan atau deklarasi Anda secara real-time</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Suspense fallback={<div className="text-center text-[#94A3B8]">Memuat...</div>}>
            <CekTiketContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
