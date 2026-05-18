'use client'

import { useState, useEffect } from 'react'
import { getStatusColor, getStatusLabel, getUrgencyColor, TicketStatus } from '@/lib/mock-data'
import { TicketWithDetails } from '@/lib/supabase-service'
import { formatDate } from '@/lib/ticket'
import { X, FileText, AlertTriangle, User, Calendar, MapPin, Tag, Clock, CheckCircle, Download } from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'
import { motion } from 'framer-motion'

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'DITERIMA', label: 'Diterima' },
  { value: 'DIVERIFIKASI', label: 'Diverifikasi' },
  { value: 'DIPROSES', label: 'Sedang Diproses' },
  { value: 'SELESAI', label: 'Selesai' },
  { value: 'DITOLAK', label: 'Ditolak' },
]

const dotColor: Record<TicketStatus, string> = {
  DITERIMA: 'bg-blue-500',
  DIVERIFIKASI: 'bg-yellow-500',
  DIPROSES: 'bg-orange-500',
  SELESAI: 'bg-green-500',
  DITOLAK: 'bg-red-500',
}

interface DetailDrawerProps {
  ticket: TicketWithDetails
  onClose: () => void
}

export default function DetailDrawer({ ticket, onClose }: DetailDrawerProps) {
  const [newStatus, setNewStatus] = useState<TicketStatus>(ticket.status)
  const [note, setNote] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updated, setUpdated] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [evidenceFiles, setEvidenceFiles] = useState<{name: string, url: string}[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const updateTicketStatus = useAdminStore((s) => s.updateTicketStatus)

  useEffect(() => {
    if (ticket.type === 'laporan' && ticket.filesCount && ticket.filesCount > 0) {
      const fetchFiles = async () => {
        setLoadingFiles(true)
        const { getWbsEvidenceFiles } = await import('@/lib/supabase-service')
        const files = await getWbsEvidenceFiles(ticket.id)
        setEvidenceFiles(files)
        setLoadingFiles(false)
      }
      fetchFiles()
    }
  }, [ticket])

  const handleGeneratePdf = async () => {
    try {
      setGeneratingPdf(true)
      const { generateDeclarationPdf } = await import('@/lib/pdf-generator')
      await generateDeclarationPdf(ticket)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Gagal menghasilkan PDF.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handleUpdate = async () => {
    if (newStatus === ticket.status && !note) return
    setUpdating(true)
    setUpdateError('')

    const success = await updateTicketStatus(ticket.id, ticket.ticketId, newStatus, note || undefined)

    setUpdating(false)

    if (success) {
      setUpdated(true)
      setNote('')
      setTimeout(() => setUpdated(false), 3000)
    } else {
      setUpdateError('Gagal memperbarui status. Silakan coba lagi.')
    }
  }

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        id="drawer-overlay"
        className="drawer-overlay"
        onClick={onClose}
        aria-label="Tutup detail"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%', opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0.5 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        id="detail-drawer"
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Detail tiket ${ticket.ticketId}`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {ticket.type === 'deklarasi' ? (
              <FileText size={18} className="text-violet-500" />
            ) : (
              <AlertTriangle size={18} className="text-red-500" />
            )}
            <div>
              <p className="font-mono text-sm font-bold text-[#0A2558]">{ticket.ticketId}</p>
              <p className="text-xs text-[#94A3B8]">{ticket.type === 'deklarasi' ? 'Deklarasi Keterpaksaan' : 'Laporan Pelanggaran'}</p>
            </div>
          </div>
          <button
            id="close-drawer-btn"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#F1F5F9] transition"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Urgency */}
          <div className="flex gap-2">
            <span className={`badge ${getStatusColor(ticket.status)}`}>{getStatusLabel(ticket.status)}</span>
            <span className={`badge ${getUrgencyColor(ticket.urgency)}`}>{ticket.urgency}</span>
          </div>

          {/* Details */}
          <div className="card p-4 space-y-3">
            {ticket.type === 'deklarasi' && (!ticket.nama && !ticket.nip) && (
              <div className="text-center py-4 bg-red-50 text-red-500 text-sm font-medium rounded-lg border border-red-100 italic">
                Data Deklarasi telah dihapus permanen.
              </div>
            )}
            {ticket.type === 'deklarasi' ? (
              <>
                {ticket.nama && <DetailRow icon={User} label="Nama" value={ticket.nama} />}
                {ticket.nip && <DetailRow icon={Tag} label="NIP/NIK" value={ticket.nip} />}
                {ticket.jabatan && <DetailRow icon={FileText} label="Jabatan" value={ticket.jabatan} />}
                {ticket.unit && <DetailRow icon={FileText} label="Unit" value={ticket.unit} />}
                {ticket.email && <DetailRow icon={FileText} label="Email" value={ticket.email} />}
                {ticket.noHp && <DetailRow icon={FileText} label="No. HP" value={ticket.noHp} />}
                {ticket.q1 && <DetailRow icon={FileText} label="Q1 - Hubungan Keluarga/Afiliasi" value={ticket.q1} />}
                {ticket.q2 && <DetailRow icon={FileText} label="Q2 - Kepentingan Finansial" value={ticket.q2} />}
                {ticket.q3 && <DetailRow icon={FileText} label="Q3 - Penerimaan Hadiah" value={ticket.q3} />}
                {ticket.q4 && <DetailRow icon={FileText} label="Q4 - Tekanan/Paksaan" value={ticket.q4} />}
                {ticket.q5 && <DetailRow icon={FileText} label="Q5 - Pernyataan Kebenaran" value={ticket.q5} />}
                {ticket.keteranganLain && <DetailRow icon={FileText} label="Keterangan Tambahan" value={ticket.keteranganLain} />}
                {(ticket.nama || ticket.nip) && (
                  <div className="pt-4 mt-2 border-t border-[#E2E8F0]">
                    <button
                      id="download-pdf-btn"
                      onClick={handleGeneratePdf}
                      disabled={generatingPdf}
                      className={`btn bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] w-full text-sm py-2 flex items-center justify-center gap-2 font-medium ${generatingPdf ? 'opacity-70 cursor-wait' : ''}`}
                    >
                      {generatingPdf ? (
                        <><div className="w-4 h-4 border-2 border-[#94A3B8]/30 border-t-[#94A3B8] rounded-full animate-spin" /> Menyiapkan PDF...</>
                      ) : (
                        <><FileText size={16} className="text-violet-500" /> Lihat Dokumen PDF</>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {ticket.category && <DetailRow icon={Tag} label="Kategori" value={ticket.category} />}
                {ticket.title && <DetailRow icon={FileText} label="Judul" value={ticket.title} />}
                {ticket.eventDate && <DetailRow icon={Calendar} label="Tanggal Kejadian" value={ticket.eventDate} />}
                {ticket.location && <DetailRow icon={MapPin} label="Lokasi" value={ticket.location} />}
                <DetailRow icon={FileText} label="Bukti" value={`${ticket.filesCount || 0} file dilampirkan`} />
                {ticket.type === 'laporan' && ticket.filesCount && ticket.filesCount > 0 && (
                  <div className="pl-6 space-y-2 mt-2 mb-4">
                    {loadingFiles ? (
                      <div className="text-xs text-[#94A3B8] flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-[#94A3B8]/30 border-t-[#94A3B8] rounded-full animate-spin" /> Memuat file bukti...
                      </div>
                    ) : (
                      evidenceFiles.map((file, idx) => (
                        <a 
                          key={idx} 
                          href={file.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 transition bg-blue-50/50 hover:bg-blue-50 p-2 rounded border border-blue-100"
                        >
                          <Download size={14} />
                          <span className="truncate font-medium">{file.name}</span>
                        </a>
                      ))
                    )}
                  </div>
                )}
                {ticket.description && (
                  <div className="flex items-start gap-2">
                    <FileText size={13} className="text-[#94A3B8] mt-0.5 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-[#94A3B8] uppercase font-semibold tracking-wide">Deskripsi</p>
                      <p className="text-sm text-[#1E293B] leading-relaxed whitespace-pre-wrap mt-0.5">{ticket.description}</p>
                    </div>
                  </div>
                )}
                {(!ticket.category && !ticket.title) && (
                  <div className="text-center py-4 bg-red-50 text-red-500 text-sm font-medium rounded-lg border border-red-100 italic">
                    Data Laporan telah dihapus permanen.
                  </div>
                )}
              </>
            )}
            <DetailRow icon={Clock} label="Diterima" value={formatDate(ticket.createdAt)} />
          </div>

          {/* Update Status */}
          <div className="card p-4">
            <h4 className="font-heading font-bold text-sm text-[#1E293B] mb-3">Ubah Status</h4>
            <div className="space-y-3">
              <select
                id="status-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                className="form-input text-sm"
                aria-label="Pilih status baru"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <textarea
                id="status-note"
                placeholder="Catatan (opsional)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="form-input text-sm resize-none"
              />
              {updateError && (
                <p className="text-sm text-red-600" role="alert">{updateError}</p>
              )}
              <button
                id="update-status-btn"
                onClick={handleUpdate}
                disabled={updating}
                className={`btn btn-primary w-full text-sm py-2.5 ${updating ? 'opacity-70 cursor-wait' : ''}`}
              >
                {updating ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                ) : updated ? (
                  <><CheckCircle size={15} /> Status Diperbarui!</>
                ) : 'Simpan Perubahan Status'}
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="font-heading font-bold text-sm text-[#1E293B] mb-3 flex items-center gap-2">
              <Clock size={15} /> Riwayat Timeline
            </h4>
            <div>
              {ticket.timeline.map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className={`timeline-dot ${dotColor[item.status]}`}>
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1E293B]">{item.label}</p>
                    <p className="text-xs text-[#94A3B8]">{formatDate(item.date)}</p>
                    {item.note && <p className="text-xs text-[#475569] mt-1">{item.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={13} className="text-[#94A3B8] mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-xs text-[#94A3B8] uppercase font-semibold tracking-wide">{label}</p>
        <p className="text-sm text-[#1E293B] font-medium">{value}</p>
      </div>
    </div>
  )
}
