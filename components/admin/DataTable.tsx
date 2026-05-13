'use client'

import { useState } from 'react'
import { getStatusColor, getStatusLabel, getUrgencyColor } from '@/lib/mock-data'
import { TicketWithDetails } from '@/lib/supabase-service'
import { formatDateShort } from '@/lib/ticket'
import { FileText, AlertTriangle, ChevronUp, ChevronDown, Eye, Search, Trash2, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminStore } from '@/store/useAdminStore'

interface DataTableProps {
  tickets: TicketWithDetails[]
  onSelect: (ticket: TicketWithDetails) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  filterType: 'all' | 'deklarasi' | 'laporan'
  onFilterType: (t: 'all' | 'deklarasi' | 'laporan') => void
  activeTab?: string
}

type SortKey = 'ticketId' | 'createdAt' | 'status' | 'urgency'

export default function DataTable({
  tickets,
  onSelect,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterType,
  activeTab = 'all',
}: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<TicketWithDetails | null>(null)
  const [deleteNote, setDeleteNote] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteTicketPermanently = useAdminStore((s) => s.deleteTicketPermanently)

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const prefix = 'DIHAPUS OLEH ADMIN'
    const finalNote = deleteNote.trim() ? `${prefix}: ${deleteNote.trim()}` : prefix
    
    // Hard delete data while keeping the ticket and timeline
    await deleteTicketPermanently(deleteTarget.id, deleteTarget.ticketId, deleteTarget.type, finalNote)
    
    setIsDeleting(false)
    setDeleteTarget(null)
    setDeleteNote('')
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = tickets
    .filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        t.ticketId.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q) ||
        (t.type === 'deklarasi' && t.nama?.toLowerCase().includes(q)) ||
        (t.type === 'laporan' && t.title?.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => {
      let va: string, vb: string
      if (sortKey === 'ticketId') { va = a.ticketId; vb = b.ticketId }
      else if (sortKey === 'createdAt') { va = a.createdAt; vb = b.createdAt }
      else if (sortKey === 'status') { va = a.status; vb = b.status }
      else { va = a.urgency; vb = b.urgency }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
    ) : (
      <ChevronDown size={13} className="opacity-30" />
    )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card overflow-hidden"
    >
      {/* Toolbar */}
      <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
          <input
            id="table-search"
            type="search"
            placeholder="Cari tiket, nama, atau judul..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="form-input !pl-9 !py-2 text-sm"
          />
        </div>
        {/* Filter Tabs - Hide if a specific sidebar tab is active */}
        {(!activeTab || activeTab === 'all') && (
          <div className="flex gap-1 bg-[#F1F5F9] rounded-xl p-1" role="tablist" aria-label="Filter jenis tiket">
            {(['all', 'deklarasi', 'laporan'] as const).map((t) => (
              <button
                key={t}
                id={`filter-tab-${t}`}
                role="tab"
                aria-selected={filterType === t}
                onClick={() => onFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === t
                    ? 'bg-white text-[#0A2558] shadow-sm'
                    : 'text-[#475569] hover:text-[#1E293B]'
                }`}
              >
                {t === 'all' ? 'Semua' : t === 'deklarasi' ? 'Deklarasi' : 'Laporan WBS'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" id="admin-data-table" aria-label="Tabel data tiket">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              {[
                { key: 'ticketId' as SortKey, label: 'ID Tiket' },
                { key: null, label: 'Jenis' },
                { key: null, label: 'Detail' },
                { key: 'createdAt' as SortKey, label: 'Tanggal' },
                { key: 'status' as SortKey, label: 'Status' },
                { key: 'urgency' as SortKey, label: 'Urgensi' },
                { key: null, label: 'Aksi' },
              ].map(({ key, label }) => (
                <th
                  key={label}
                  className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wider whitespace-nowrap"
                >
                  {key ? (
                    <button
                      onClick={() => toggleSort(key)}
                      className="flex items-center gap-1 hover:text-[#0A2558] transition"
                      aria-label={`Sort by ${label}`}
                    >
                      {label} <SortIcon col={key} />
                    </button>
                  ) : label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#94A3B8] text-sm">
                  Tidak ada data yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filtered.map((ticket) => (
                <tr
                  key={ticket.id}
                  id={`row-${ticket.ticketId}`}
                  className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  onClick={() => onSelect(ticket)}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-[#0A2558]">{ticket.ticketId}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-1.5 ${ticket.type === 'deklarasi' ? 'text-violet-600' : 'text-red-500'}`}>
                      {ticket.type === 'deklarasi' ? <FileText size={13} /> : <AlertTriangle size={13} />}
                      <span className="text-xs font-medium">{ticket.type === 'deklarasi' ? 'Deklarasi' : 'WBS'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    {((ticket.type === 'deklarasi' && !ticket.nama && !ticket.nip) || (ticket.type === 'laporan' && !ticket.title && !ticket.category)) ? (
                      <p className="text-sm font-medium text-red-500 italic truncate">(Data Terhapus)</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-[#1E293B] truncate">
                          {ticket.type === 'deklarasi' ? (ticket.nama || '-') : (ticket.title || '-')}
                        </p>
                        <p className="text-xs text-[#94A3B8] truncate">
                          {ticket.type === 'deklarasi' ? (ticket.jabatan || '-') : (ticket.category || '-')}
                        </p>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#475569] whitespace-nowrap">
                    {formatDateShort(ticket.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${getStatusColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${getUrgencyColor(ticket.urgency)}`}>
                      {ticket.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        id={`view-ticket-${ticket.ticketId}`}
                        onClick={(e) => { e.stopPropagation(); onSelect(ticket) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF6FF] text-[#0A2558] text-xs font-semibold hover:bg-[#DBEAFE] transition"
                        aria-label={`Lihat detail ${ticket.ticketId}`}
                      >
                        <Eye size={13} /> Detail
                      </button>
                      <button
                        id={`delete-ticket-${ticket.ticketId}`}
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(ticket) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition"
                        aria-label={`Hapus tiket ${ticket.ticketId}`}
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-[#E2E8F0] text-xs text-[#94A3B8]">
        Menampilkan {filtered.length} dari {tickets.length} tiket
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0A1628]/40 backdrop-blur-sm"
              onClick={() => !isDeleting && setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <Trash2 size={20} />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-[#1E293B]">Hapus Tiket</h3>
                  </div>
                  <button
                    onClick={() => !isDeleting && setDeleteTarget(null)}
                    className="p-2 text-[#94A3B8] hover:bg-[#F1F5F9] rounded-xl transition"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <p className="text-sm text-[#475569] mb-4">
                  Anda yakin ingin menghapus tiket <strong className="text-[#1E293B]">{deleteTarget.ticketId}</strong>?
                  <br/>
                  Tiket ini beserta seluruh data laporannya (termasuk lampiran/tanda tangan) akan dihapus secara fisik dan tidak dapat dipulihkan.
                  Namun, riwayat nomor tiket akan tetap tercatat di timeline.
                </p>

                <div className="mb-6">
                  <label htmlFor="delete-note" className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wide">
                    Alasan Penghapusan (Opsional)
                  </label>
                  <textarea
                    id="delete-note"
                    rows={3}
                    placeholder="Contoh: Tiket spam, data duplikat, dll."
                    value={deleteNote}
                    onChange={(e) => setDeleteNote(e.target.value)}
                    className="form-input text-sm resize-none"
                    disabled={isDeleting}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#475569] font-semibold text-sm hover:bg-[#F8FAFC] transition disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition shadow-[0_4px_12px_rgba(220,38,38,0.25)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                  >
                    {isDeleting ? (
                      <><Loader2 size={16} className="animate-spin" /> Menghapus...</>
                    ) : (
                      'Konfirmasi Hapus'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
