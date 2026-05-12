'use client'

import { useState, useMemo } from 'react'
import { TicketWithDetails, TicketStatus, exportTicketsToCsv } from '@/lib/supabase-service'
import { getStatusColor, getStatusLabel, getUrgencyColor } from '@/lib/mock-data'
import {
  AlertTriangle, Search, ChevronUp, ChevronDown, Eye, Download,
  MapPin, Paperclip, CheckCircle, Clock, TrendingUp
} from 'lucide-react'

interface LaporanTabProps {
  tickets: TicketWithDetails[]
  onSelect: (ticket: TicketWithDetails) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  filterStatus: TicketStatus | 'all'
  onFilterStatus: (s: TicketStatus | 'all') => void
}

type SortKey = 'ticketId' | 'category' | 'title' | 'eventDate' | 'createdAt' | 'status' | 'urgency'

const STATUS_FILTERS: { value: TicketStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'DITERIMA', label: 'Diterima' },
  { value: 'DIVERIFIKASI', label: 'Diverifikasi' },
  { value: 'DIPROSES', label: 'Diproses' },
  { value: 'SELESAI', label: 'Selesai' },
  { value: 'DITOLAK', label: 'Ditolak' },
]

export default function LaporanTab({ tickets, onSelect, searchQuery, onSearchChange, filterStatus, onFilterStatus }: LaporanTabProps) {
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const reports = useMemo(() => tickets.filter((t) => t.type === 'laporan'), [tickets])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = useMemo(() => {
    return reports
      .filter((t) => {
        if (filterStatus !== 'all' && t.status !== filterStatus) return false
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return t.ticketId.toLowerCase().includes(q) || t.title?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q) || t.location?.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        let va: string, vb: string
        if (sortKey === 'ticketId') { va = a.ticketId; vb = b.ticketId }
        else if (sortKey === 'category') { va = a.category || ''; vb = b.category || '' }
        else if (sortKey === 'title') { va = a.title || ''; vb = b.title || '' }
        else if (sortKey === 'eventDate') { va = a.eventDate || ''; vb = b.eventDate || '' }
        else if (sortKey === 'createdAt') { va = a.createdAt; vb = b.createdAt }
        else if (sortKey === 'urgency') { va = a.urgency; vb = b.urgency }
        else { va = a.status; vb = b.status }
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      })
  }, [reports, filterStatus, searchQuery, sortKey, sortDir])

  const stats = useMemo(() => ({
    total: reports.length,
    kritis: reports.filter((t) => t.urgency === 'KRITIS').length,
    tinggi: reports.filter((t) => t.urgency === 'TINGGI').length,
    diproses: reports.filter((t) => t.status === 'DIPROSES' || t.status === 'DIVERIFIKASI').length,
    selesai: reports.filter((t) => t.status === 'SELESAI').length,
  }), [reports])

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : <ChevronDown size={13} className="opacity-30" />

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Laporan', value: stats.total, color: 'from-rose-500 to-rose-700', icon: AlertTriangle },
          { label: 'Kasus Kritis', value: stats.kritis, color: 'from-red-600 to-red-800', icon: TrendingUp },
          { label: 'Prioritas Tinggi', value: stats.tinggi, color: 'from-orange-500 to-orange-700', icon: AlertTriangle },
          { label: 'Dalam Proses', value: stats.diproses, color: 'from-amber-500 to-amber-700', icon: Clock },
          { label: 'Selesai', value: stats.selesai, color: 'from-emerald-500 to-emerald-700', icon: CheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card p-4 relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${color} opacity-5 rounded-full translate-x-4 -translate-y-4`} />
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
              <Icon size={14} className="text-white" />
            </div>
            <p className="text-xl font-heading font-bold text-[#1E293B]">{value}</p>
            <p className="text-xs text-[#94A3B8]">{label}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input id="laporan-search" type="search" placeholder="Cari judul, kategori, lokasi, atau nomor tiket..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="form-input !pl-9 !py-2 text-sm" />
            </div>
            <button id="export-laporan-btn" onClick={() => exportTicketsToCsv(reports, 'laporan')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#475569] hover:bg-[#F1F5F9] transition">
              <Download size={14} /> Export CSV
            </button>
          </div>
          <div className="flex gap-1 flex-wrap">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button key={value} onClick={() => onFilterStatus(value)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === value ? 'bg-[#0A2558] text-white' : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" id="laporan-data-table">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                {([
                  { key: 'ticketId' as SortKey, label: 'ID Tiket' },
                  { key: 'category' as SortKey, label: 'Kategori' },
                  { key: 'title' as SortKey, label: 'Judul' },
                  { key: 'eventDate' as SortKey, label: 'Tgl Kejadian' },
                  { key: 'urgency' as SortKey, label: 'Urgensi' },
                  { key: 'status' as SortKey, label: 'Status' },
                  { key: null, label: 'Bukti' },
                  { key: null, label: 'Aksi' },
                ] as const).map(({ key, label }) => (
                  <th key={label} className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wider whitespace-nowrap">
                    {key ? (<button onClick={() => toggleSort(key)} className="flex items-center gap-1 hover:text-[#0A2558] transition">{label} <SortIcon col={key} /></button>) : label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-[#94A3B8] text-sm"><AlertTriangle size={32} className="mx-auto mb-3 opacity-30" /><p>Tidak ada data laporan WBS.</p></td></tr>
              ) : filtered.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => onSelect(ticket)}>
                  <td className="px-4 py-3"><span className="font-mono text-xs font-semibold text-[#0A2558]">{ticket.ticketId}</span></td>
                  <td className="px-4 py-3"><span className="text-xs font-medium text-[#475569] bg-[#F1F5F9] px-2 py-1 rounded-lg">{ticket.category || '-'}</span></td>
                  <td className="px-4 py-3 max-w-[200px]"><p className="text-sm font-medium text-[#1E293B] truncate">{ticket.title || '-'}</p>{ticket.location && <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-0.5"><MapPin size={10} />{ticket.location}</p>}</td>
                  <td className="px-4 py-3 text-xs text-[#475569] whitespace-nowrap">{ticket.eventDate || '-'}</td>
                  <td className="px-4 py-3"><span className={`badge ${getUrgencyColor(ticket.urgency)}`}>{ticket.urgency}</span></td>
                  <td className="px-4 py-3"><span className={`badge ${getStatusColor(ticket.status)}`}>{getStatusLabel(ticket.status)}</span></td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1 text-xs text-[#475569]"><Paperclip size={11} />{ticket.filesCount || 0}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={(e) => { e.stopPropagation(); onSelect(ticket) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF6FF] text-[#0A2558] text-xs font-semibold hover:bg-[#DBEAFE] transition">
                      <Eye size={13} /> Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#E2E8F0] text-xs text-[#94A3B8]">
          Menampilkan {filtered.length} dari {reports.length} laporan
        </div>
      </div>
    </div>
  )
}
