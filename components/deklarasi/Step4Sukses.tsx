'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Copy, ExternalLink, Home } from 'lucide-react'
import Link from 'next/link'

interface Step4Props {
  ticketId: string
  nama: string
  onReset: () => void
}

export default function Step4Sukses({ ticketId, nama, onReset }: Step4Props) {
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const copyTicket = () => {
    navigator.clipboard.writeText(ticketId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Success Animation */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={48} className="text-green-500 animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-30" />
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#1E293B] mb-2">
        Deklarasi Berhasil Dikirim!
      </h2>
      <p className="text-[#475569] mb-8 max-w-md mx-auto">
        Terima kasih, <strong>{nama}</strong>. Deklarasi Anda telah kami terima dan akan segera diproses oleh tim integritas.
      </p>

      {/* Ticket Card */}
      <div className="bg-gradient-to-br from-[#0A2558] to-[#1D5BBF] rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-8" aria-hidden="true" />
        <p className="text-blue-200 text-sm mb-2 font-medium uppercase tracking-wider">Nomor Tiket Deklarasi</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span id="ticket-id-display" className="text-3xl font-heading font-bold tracking-wider">
            {ticketId}
          </span>
          <button
            id="copy-ticket-btn"
            onClick={copyTicket}
            className="p-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
            aria-label="Salin nomor tiket"
            title="Salin"
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <p className="text-blue-200 text-xs mt-3">
          Simpan nomor ini untuk melacak status deklarasi Anda
        </p>
      </div>

      {/* Info Steps */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 text-left">
        <p className="font-heading font-semibold text-[#0A2558] mb-3 text-sm">Apa yang terjadi selanjutnya?</p>
        <ol className="space-y-2 text-sm text-[#475569]">
          {[
            'Tim integritas akan memverifikasi deklarasi Anda dalam 1×24 jam',
            'Anda akan mendapat pemberitahuan via email jika perlu tindak lanjut',
            'Status dapat dipantau kapan saja menggunakan nomor tiket di atas',
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0A2558] text-white text-xs flex items-center justify-center mt-0.5 shrink-0">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/cek-tiket?id=${ticketId}`} id="step4-cek-tiket-btn" className="btn btn-primary px-6">
          <ExternalLink size={16} />
          Pantau Status Tiket
        </Link>
        <Link href="/" id="step4-home-btn" className="btn btn-secondary px-6">
          <Home size={16} />
          Kembali ke Beranda
        </Link>
        <button id="step4-new-btn" onClick={onReset} className="btn btn-secondary px-6">
          Buat Deklarasi Baru
        </button>
      </div>
    </div>
  )
}
