'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getStatusColor, getStatusLabel, getUrgencyColor } from '@/lib/mock-data'
import { TicketWithDetails, TicketStatus, getSignatureUrl } from '@/lib/supabase-service'
import { formatDate } from '@/lib/ticket'
import { X, FileText, AlertTriangle, User, Calendar, MapPin, Tag, Clock, CheckCircle, Trash2, Loader2, Mail, Phone, MessageSquare } from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'

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

const QUESTION_LABELS: Record<string, string> = {
  q1: 'Hubungan Keluarga/Afiliasi',
  q2: 'Kepentingan Finansial',
  q3: 'Penerimaan Hadiah',
  q4: 'Tekanan/Paksaan',
  q5: 'Pernyataan Kebenaran',
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
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null)

  const updateTicketStatus = useAdminStore((s) => s.updateTicketStatus)
  const deleteTicket = useAdminStore((s) => s.deleteTicket)

  // Load signature image
  useEffect(() => {
    if (ticket.type === 'deklarasi' && ticket.signaturePath) {
      getSignatureUrl(ticket.signaturePath).then(setSignatureUrl)
    }
  }, [ticket.signaturePath, ticket.type])

  // Reset status selector when ticket changes
  useEffect(() => {
    setNewStatus(ticket.status)
    setUpdated(false)
    setUpdateError('')
    setConfirmDelete(false)
  }, [ticket.id, ticket.status])

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

  const handleDelete = async () => {
    setDeleting(true)
    const success = await deleteTicket(ticket.id)
    setDeleting(false)
    if (success) onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div id="drawer-overlay" className="drawer-overlay" onClick={onClose} />

      {/* Panel */}
      <div id="detail-drawer" className="drawer-panel" role="dialog" aria-modal="true" aria-label={`Detail tiket ${ticket.ticketId}`}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {ticket.type === 'deklarasi' ? <FileText size={18} className="text-violet-500" /> : <AlertTriangle size={18} className="text-red-500" />}
            <div>
              <p className="font-mono text-sm font-bold text-[#0A2558]">{ticket.ticketId}</p>
              <p className="text-xs text-[#94A3B8]">{ticket.type === 'deklarasi' ? 'Deklarasi Keterpaksaan' : 'Laporan Pelanggaran'}</p>
            </div>
          </div>
          <button id="close-drawer-btn" onClick={onClose} className="p-2 rounded-xl hover:bg-[#F1F5F9] transition" aria-label="Tutup">
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
            <h4 className="font-heading font-bold text-sm text-[#1E293B] mb-2">
              {ticket.type === 'deklarasi' ? '📋 Data Pelapor' : '📄 Detail Laporan'}
            </h4>
            {ticket.type === 'deklarasi' ? (
              <>
                {ticket.nama && <DetailRow icon={User} label="Nama" value={ticket.nama} />}
                {ticket.nip && <DetailRow icon={Tag} label="NIP/NIK" value={ticket.nip} />}
                {ticket.jabatan && <DetailRow icon={FileText} label="Jabatan" value={ticket.jabatan} />}
                {ticket.unit && <DetailRow icon={FileText} label="Unit" value={ticket.unit} />}
                {ticket.email && <DetailRow icon={Mail} label="Email" value={ticket.email} />}
                {ticket.noHp && <DetailRow icon={Phone} label="No. HP" value={ticket.noHp} />}
              </>
            ) : (
              <>
                {ticket.category && <DetailRow icon={Tag} label="Kategori" value={ticket.category} />}
                {ticket.title && <DetailRow icon={FileText} label="Judul" value={ticket.title} />}
                {ticket.eventDate && <DetailRow icon={Calendar} label="Tanggal Kejadian" value={ticket.eventDate} />}
                {ticket.location && <DetailRow icon={MapPin} label="Lokasi" value={ticket.location} />}
                <DetailRow icon={FileText} label="Bukti" value={`${ticket.filesCount || 0} file dilampirkan`} />
              </>
            )}
            <DetailRow icon={Clock} label="Diterima" value={formatDate(ticket.createdAt)} />
          </div>

          {/* Questionnaire (Deklarasi only) */}
          {ticket.type === 'deklarasi' && (ticket.q1 || ticket.q2 || ticket.q3 || ticket.q4 || ticket.q5) && (
            <div className="card p-4 space-y-3">
              <h4 className="font-heading font-bold text-sm text-[#1E293B] mb-2">📝 Jawaban Kuesioner</h4>
              {(['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((key) => {
                const val = ticket[key]
                if (!val) return null
                return <DetailRow key={key} icon={MessageSquare} label={QUESTION_LABELS[key]} value={val} />
              })}
              {ticket.keteranganLain && <DetailRow icon={MessageSquare} label="Keterangan Tambahan" value={ticket.keteranganLain} />}
            </div>
          )}

          {/* Description (WBS only) */}
          {ticket.type === 'laporan' && ticket.description && (
            <div className="card p-4">
              <h4 className="font-heading font-bold text-sm text-[#1E293B] mb-2">📄 Deskripsi Lengkap</h4>
              <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>
          )}

          {/* Signature (Deklarasi only) */}
          {ticket.type === 'deklarasi' && (
            <div className="card p-4">
              <h4 className="font-heading font-bold text-sm text-[#1E293B] mb-2">✍️ Tanda Tangan</h4>
              {signatureUrl ? (
                <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-3 bg-[#F8FAFC] flex items-center justify-center">
                  <Image src={signatureUrl} alt="Tanda tangan" width={400} height={128} className="max-h-32 w-auto object-contain" />
                </div>
              ) : ticket.signaturePath ? (
                <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <Loader2 size={14} className="animate-spin" /> Memuat tanda tangan...
                </div>
              ) : (
                <p className="text-sm text-[#94A3B8]">Tidak ada tanda tangan</p>
              )}
              <p className="text-xs text-[#94A3B8] mt-2">
                Persetujuan: {ticket.isAgreed ? <span className="text-green-600 font-semibold">✓ Disetujui</span> : <span className="text-red-500 font-semibold">✗ Belum disetujui</span>}
              </p>
            </div>
          )}

          {/* Update Status */}
          <div className="card p-4">
            <h4 className="font-heading font-bold text-sm text-[#1E293B] mb-3">Ubah Status</h4>
            <div className="space-y-3">
              <select id="status-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value as TicketStatus)} className="form-input text-sm">
                {STATUS_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
              <textarea id="status-note" placeholder="Catatan (opsional)..." value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="form-input text-sm resize-none" />
              {updateError && <p className="text-sm text-red-600" role="alert">{updateError}</p>}
              <button id="update-status-btn" onClick={handleUpdate} disabled={updating} className={`btn btn-primary w-full text-sm py-2.5 ${updating ? 'opacity-70 cursor-wait' : ''}`}>
                {updating ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>) : updated ? (<><CheckCircle size={15} /> Status Diperbarui!</>) : 'Simpan Perubahan Status'}
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

          {/* Delete */}
          <div className="border-t border-[#E2E8F0] pt-4">
            {!confirmDelete ? (
              <button id="delete-ticket-btn" onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition">
                <Trash2 size={14} /> Hapus Tiket
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 mb-2">Yakin hapus tiket {ticket.ticketId}?</p>
                <p className="text-xs text-red-600 mb-3">Tindakan ini tidak dapat dibatalkan. Semua data terkait akan dihapus.</p>
                <div className="flex gap-2">
                  <button onClick={handleDelete} disabled={deleting} className="btn text-sm py-2 px-4 bg-red-600 text-white hover:bg-red-700 rounded-lg">
                    {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="btn text-sm py-2 px-4 bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] rounded-lg">
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
