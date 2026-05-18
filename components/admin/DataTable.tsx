'use client'

import { useState } from 'react'
import { getStatusColor, getStatusLabel, getUrgencyColor } from '@/lib/mock-data'
import { TicketWithDetails } from '@/lib/supabase-service'
import { formatDateShort } from '@/lib/ticket'
import { FileText, AlertTriangle, ChevronUp, ChevronDown, Eye, Search, Copy, Check, X } from 'lucide-react'
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

  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyId = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(ticketId)
    setCopiedId(ticketId)
    setTimeout(() => setCopiedId(null), 2000)
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === t
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
                        id={`copy-ticket-${ticket.ticketId}`}
                        onClick={(e) => handleCopyId(ticket.ticketId, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition"
                        aria-label={`Salin ID tiket ${ticket.ticketId}`}
                      >
                        {copiedId === ticket.ticketId ? (
                          <><Check size={13} className="text-green-600" /> Disalin</>
                        ) : (
                          <><Copy size={13} /> Salin ID</>
                        )}
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

      {/* Removed Delete Confirmation Modal */}
    </motion.div>
  )
}
