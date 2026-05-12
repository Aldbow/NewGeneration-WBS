'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FileDropzone from '@/components/lapor/FileDropzone'
import AnimateIn from '@/components/ui/AnimateIn'
import {
  Shield, Lock, Eye, AlertCircle, CheckCircle, Copy, ExternalLink, Home
} from 'lucide-react'
import Link from 'next/link'
import { submitWbsReport } from '@/lib/supabase-service'

const CATEGORIES = [
  'Penyuapan/Gratifikasi',
  'Penipuan/Kecurangan',
  'Pelecehan/Kekerasan',
  'Konflik Kepentingan',
  'Pelanggaran Prosedur',
  'Korupsi',
  'Lainnya',
]

export default function LaporPage() {
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const [form, setForm] = useState({
    category: '',
    title: '',
    eventDate: '',
    eventTime: '',
    location: '',
    description: '',
  })

  const setField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.category) errs.category = 'Pilih kategori pelanggaran'
    if (!form.title || form.title.length < 5) errs.title = 'Judul minimal 5 karakter'
    if (!form.eventDate) errs.eventDate = 'Tanggal kejadian harus diisi'
    if (!form.description || form.description.length < 20) errs.description = 'Deskripsi minimal 20 karakter'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSubmitError('')
    setLoading(true)

    const result = await submitWbsReport({
      category: form.category,
      title: form.title,
      description: form.description,
      eventDate: form.eventDate,
      eventTime: form.eventTime || undefined,
      location: form.location || undefined,
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    })

    setLoading(false)

    if (result.error || !result.ticketId) {
      setSubmitError(result.error || 'Gagal mengirim laporan. Silakan coba lagi.')
      return
    }

    setTicketId(result.ticketId)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const copyTicket = () => {
    navigator.clipboard.writeText(ticketId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ── Success State ── */
  if (submitted) {
    return (
      <>
        <Header />
        <main id="lapor-sukses" className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 pt-24 pb-20">
          <AnimateIn animation="scaleUp" duration={600} threshold={0} className="max-w-lg w-full card p-8 sm:p-10 text-center">

            <AnimateIn animation="slideDown" delay={100} threshold={0} className="flex justify-center mb-6">
              <div className="relative w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle size={48} className="text-green-500" />
                <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-30" />
              </div>
            </AnimateIn>

            <AnimateIn animation="slideUp" delay={200} threshold={0}>
              <h1 className="text-2xl font-heading font-bold text-[#1E293B] mb-2">Laporan Terkirim!</h1>
              <p className="text-[#475569] mb-6">
                Laporan Anda telah diterima secara anonim. Identitas Anda sepenuhnya terlindungi.
              </p>
            </AnimateIn>

            <AnimateIn animation="slideUp" delay={300} threshold={0}>
              <div className="gradient-bg rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-12 translate-x-8" />
                <p className="text-blue-200 text-sm mb-2 uppercase tracking-wider">Nomor Tiket Laporan</p>
                <div className="flex items-center justify-center gap-3">
                  <span id="wbs-ticket-id" className="text-3xl font-heading font-bold tracking-wider">{ticketId}</span>
                  <button
                    id="copy-wbs-ticket"
                    onClick={copyTicket}
                    className="p-2 rounded-lg bg-white/15 hover:bg-white/25 transition"
                    aria-label="Salin nomor tiket"
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-blue-200 text-xs mt-3">Simpan nomor ini untuk memantau status laporan Anda</p>
              </div>
            </AnimateIn>

            <AnimateIn animation="slideLeft" delay={400} threshold={0}>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 text-left flex items-start gap-2">
                <Shield size={16} className="shrink-0 mt-0.5" />
                <span>Laporan ini disampaikan secara anonim. Tidak ada data identitas yang tersimpan dalam sistem kami.</span>
              </div>
            </AnimateIn>

            <AnimateIn animation="slideUp" delay={500} threshold={0}>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/cek-tiket?id=${ticketId}`} id="wbs-cek-tiket" className="btn btn-primary">
                  <ExternalLink size={16} /> Pantau Status
                </Link>
                <Link href="/" id="wbs-home" className="btn btn-secondary">
                  <Home size={16} /> Beranda
                </Link>
              </div>
            </AnimateIn>

          </AnimateIn>
        </main>
        <Footer />
      </>
    )
  }

  /* ── Form State ── */
  return (
    <>
      <Header />
      <main id="lapor-main" className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">

        {/* Page Header */}
        <AnimateIn animation="fadeIn" duration={500} threshold={0}>
          <div className="gradient-bg py-12 mb-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />
            <AnimateIn animation="slideDown" delay={100} threshold={0}>
              <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-3">
                  Lapor Pelanggaran
                </h1>
                <p className="text-blue-100">Whistleblowing System — Anonim, Aman, dan Terlindungi</p>
              </div>
            </AnimateIn>
          </div>
        </AnimateIn>

        <div className="max-w-2xl mx-auto px-4 sm:px-6">

          {/* Privacy Banner — slides in from left */}
          <AnimateIn animation="slideLeft" delay={0} threshold={0.05}>
            <div className="glass border border-blue-100 rounded-2xl p-5 mb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                <Lock size={18} className="text-white" />
              </div>
              <div>
                <p className="font-heading font-bold text-[#0A2558] mb-1 flex items-center gap-2">
                  <Shield size={14} /> Jaminan 100% Anonim
                </p>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Laporan Anda disampaikan tanpa menyimpan identitas apapun. Tidak ada log IP, cookie pelacak, atau data yang dapat mengidentifikasi Anda.
                </p>
                <div className="mt-2 flex gap-4 flex-wrap">
                  {['Tanpa Identitas', 'Terenkripsi', 'Dilindungi UU'].map((t) => (
                    <span key={t} className="flex items-center gap-1 text-xs text-green-700 font-medium">
                      <Eye size={11} /> {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </AnimateIn>

          {/* Form — each field group has its own animation */}
          <form id="lapor-form" onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Category — slides from right */}
            <AnimateIn animation="slideRight" delay={60} threshold={0.05} className="card p-5">
              <label htmlFor="field-category" className="form-label">
                Kategori Pelanggaran <span className="text-red-500">*</span>
              </label>
              <select
                id="field-category"
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
                className={`form-input ${errors.category ? 'error' : ''}`}
                aria-invalid={!!errors.category}
              >
                <option value="">— Pilih kategori —</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="form-error" role="alert"><AlertCircle size={13} />{errors.category}</p>}
            </AnimateIn>

            {/* Title — slides from left */}
            <AnimateIn animation="slideLeft" delay={120} threshold={0.05} className="card p-5">
              <label htmlFor="field-title" className="form-label">
                Judul Laporan <span className="text-red-500">*</span>
              </label>
              <input
                id="field-title"
                type="text"
                placeholder="Ringkasan singkat pelanggaran yang dilaporkan"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                className={`form-input ${errors.title ? 'error' : ''}`}
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="form-error" role="alert"><AlertCircle size={13} />{errors.title}</p>}
            </AnimateIn>

            {/* Date & Time — slides from right */}
            <AnimateIn animation="slideRight" delay={180} threshold={0.05} className="card p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-date" className="form-label">
                    Tanggal Kejadian <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="field-date"
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setField('eventDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`form-input ${errors.eventDate ? 'error' : ''}`}
                  />
                  {errors.eventDate && <p className="form-error" role="alert"><AlertCircle size={13} />{errors.eventDate}</p>}
                </div>
                <div>
                  <label htmlFor="field-time" className="form-label">Perkiraan Waktu</label>
                  <input
                    id="field-time"
                    type="time"
                    value={form.eventTime}
                    onChange={(e) => setField('eventTime', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </AnimateIn>

            {/* Location — slides from left */}
            <AnimateIn animation="slideLeft" delay={240} threshold={0.05} className="card p-5">
              <label htmlFor="field-location" className="form-label">Lokasi Kejadian (Opsional)</label>
              <input
                id="field-location"
                type="text"
                placeholder="Nama gedung, ruangan, atau wilayah"
                value={form.location}
                onChange={(e) => setField('location', e.target.value)}
                className="form-input"
              />
            </AnimateIn>

            {/* Description — slides up */}
            <AnimateIn animation="slideUp" delay={300} threshold={0.05} className="card p-5">
              <label htmlFor="field-description" className="form-label">
                Isi Laporan <span className="text-red-500">*</span>
              </label>
              <textarea
                id="field-description"
                rows={6}
                placeholder="Ceritakan kejadian yang Anda saksikan secara detail. Semakin lengkap, semakin mudah ditindaklanjuti..."
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                className={`form-input resize-none ${errors.description ? 'error' : ''}`}
                style={{ resize: 'vertical', minHeight: '120px' }}
                aria-invalid={!!errors.description}
              />
              <p className="text-xs text-[#94A3B8] mt-1 text-right">{form.description.length} karakter</p>
              {errors.description && <p className="form-error" role="alert"><AlertCircle size={13} />{errors.description}</p>}
            </AnimateIn>

            {/* File Upload — slides from right */}
            <AnimateIn animation="slideRight" delay={360} threshold={0.05} className="card p-5">
              <label className="form-label">Bukti Pendukung (Opsional)</label>
              <FileDropzone onFilesChange={(files) => setUploadedFiles(files)} />
            </AnimateIn>

            {/* Submit Error */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 flex items-start gap-2" role="alert">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit — slides up */}
            <AnimateIn animation="slideUp" delay={420} threshold={0.05}>
              <button
                id="lapor-submit-btn"
                type="submit"
                disabled={loading}
                className={`btn btn-primary w-full py-4 text-base ${loading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    Mengirim Laporan...
                  </>
                ) : (
                  <><Shield size={18} /> Kirim Laporan Secara Anonim</>
                )}
              </button>
              <p className="text-center text-xs text-[#94A3B8] mt-3">
                🔒 Tidak ada data identitas yang tersimpan. Laporan ini bersifat 100% anonim.
              </p>
            </AnimateIn>

          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
