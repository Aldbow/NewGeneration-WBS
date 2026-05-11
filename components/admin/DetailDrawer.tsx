'use client'

import { useState } from 'react'
import { Ticket, getStatusColor, getStatusLabel, getUrgencyColor, TicketStatus } from '@/lib/mock-data'
import { formatDate } from '@/lib/ticket'
import { X, FileText, AlertTriangle, User, Calendar, MapPin, Tag, Clock, CheckCircle } from 'lucide-react'
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

interface DetailDrawerProps {
  ticket: Ticket
  onClose: () => void
}

export default function DetailDrawer({ ticket, onClose }: DetailDrawerProps) {
  const [newStatus, setNewStatus] = useState<TicketStatus>(ticket.status)
  const [note, setNote] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updated, setUpdated] = useState(false)
  const updateTicketStatus = useAdminStore((s) => s.updateTicketStatus)

  const handleUpdate = async () => {
    if (newStatus === ticket.status && !note) return
    setUpdating(true)
    await new Promise((r) => setTimeout(r, 800))
    updateTicketStatus(ticket.ticketId, newStatus, note || undefined)
    setUpdating(false)
    setUpdated(true)
    setNote('')
    setTimeout(() => setUpdated(false), 3000)
  }

  return (
    <>
      {/* Overlay */}
      <div
        id="drawer-overlay"
        className="drawer-overlay"
        onClick={onClose}
        aria-label="Tutup detail"
      />

      {/* Panel */}
      <div
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
            {ticket.type === 'deklarasi' ? (
              <>
                <DetailRow icon={User} label="Nama" value={ticket.nama} />
                <DetailRow icon={Tag} label="NIP/NIK" value={ticket.nip} />
                <DetailRow icon={FileText} label="Jabatan" value={ticket.jabatan} />
                <DetailRow icon={FileText} label="Unit" value={ticket.unit} />
                {ticket.keterangan && <DetailRow icon={FileText} label="Keterangan" value={ticket.keterangan} />}
              </>
            ) : (
              <>
                <DetailRow icon={Tag} label="Kategori" value={ticket.category} />
                <DetailRow icon={FileText} label="Judul" value={ticket.title} />
                <DetailRow icon={Calendar} label="Tanggal Kejadian" value={ticket.eventDate} />
                {ticket.location && <DetailRow icon={MapPin} label="Lokasi" value={ticket.location} />}
                <DetailRow icon={FileText} label="Bukti" value={`${ticket.filesCount} file dilampirkan`} />
                <div>
                  <p className="text-xs font-semibold text-[#475569] uppercase mb-1 flex items-center gap-1">
                    <FileText size={11} /> Deskripsi
                  </p>
                  <p className="text-sm text-[#1E293B] leading-relaxed">{ticket.description}</p>
                </div>
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
