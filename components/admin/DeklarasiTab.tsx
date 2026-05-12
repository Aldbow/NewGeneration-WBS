'use client'

import { useState, useMemo } from 'react'
import { TicketWithDetails, TicketStatus, exportTicketsToCsv } from '@/lib/supabase-service'
import { getStatusColor, getStatusLabel } from '@/lib/mock-data'
import { formatDateShort } from '@/lib/ticket'
import {
  FileText, Search, ChevronUp, ChevronDown, Eye, Download,
  CheckCircle, Clock, XCircle, ShieldCheck
} from 'lucide-react'

interface DeklarasiTabProps {
  tickets: TicketWithDetails[]
  onSelect: (ticket: TicketWithDetails) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  filterStatus: TicketStatus | 'all'
  onFilterStatus: (s: TicketStatus | 'all') => void
}

type SortKey = 'ticketId' | 'nama' | 'unit' | 'createdAt' | 'status'

const STATUS_FILTERS: { value: TicketStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'DITERIMA', label: 'Diterima' },
  { value: 'DIVERIFIKASI', label: 'Diverifikasi' },
  { value: 'DIPROSES', label: 'Diproses' },
  { value: 'SELESAI', label: 'Selesai' },
  { value: 'DITOLAK', label: 'Ditolak' },
]

export default function DeklarasiTab({ tickets, onSelect, searchQuery, onSearchChange, filterStatus, onFilterStatus }: DeklarasiTabProps) {
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const declarations = useMemo(() => tickets.filter((t) => t.type === 'deklarasi'), [tickets])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = useMemo(() => {
    return declarations
      .filter((t) => {
        if (filterStatus !== 'all' && t.status !== filterStatus) return false
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return t.ticketId.toLowerCase().includes(q) || t.nama?.toLowerCase().includes(q) || t.nip?.toLowerCase().includes(q) || t.unit?.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        let va: string, vb: string
        if (sortKey === 'ticketId') { va = a.ticketId; vb = b.ticketId }
        else if (sortKey === 'nama') { va = a.nama || ''; vb = b.nama || '' }
        else if (sortKey === 'unit') { va = a.unit || ''; vb = b.unit || '' }
        else if (sortKey === 'createdAt') { va = a.createdAt; vb = b.createdAt }
        else { va = a.status; vb = b.status }
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      })
  }, [declarations, filterStatus, searchQuery, sortKey, sortDir])

  const stats = useMemo(() => ({
    total: declarations.length,
    diterima: declarations.filter((t) => t.status === 'DITERIMA').length,
    diproses: declarations.filter((t) => t.status === 'DIPROSES' || t.status === 'DIVERIFIKASI').length,
    selesai: declarations.filter((t) => t.status === 'SELESAI').length,
    ditolak: declarations.filter((t) => t.status === 'DITOLAK').length,
  }), [declarations])

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : <ChevronDown size={13} className="opacity-30" />

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'from-violet-500 to-violet-700', icon: FileText },
          { label: 'Diterima', value: stats.diterima, color: 'from-blue-500 to-blue-700', icon: ShieldCheck },
          { label: 'Dalam Proses', value: stats.diproses, color: 'from-amber-500 to-amber-700', icon: Clock },
          { label: 'Selesai', value: stats.selesai, color: 'from-emerald-500 to-emerald-700', icon: CheckCircle },
          { label: 'Ditolak', value: stats.ditolak, color: 'from-red-500 to-red-700', icon: XCircle },
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
              <input id="deklarasi-search" type="search" placeholder="Cari nama, NIP, unit, atau nomor tiket..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="form-input !pl-9 !py-2 text-sm" />
            </div>
            <button id="export-deklarasi-btn" onClick={() => exportTicketsToCsv(declarations, 'deklarasi')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#475569] hover:bg-[#F1F5F9] transition">
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
          <table className="w-full" id="deklarasi-data-table">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                {([
                  { key: 'ticketId' as SortKey, label: 'ID Tiket' },
                  { key: 'nama' as SortKey, label: 'Nama / Jabatan' },
                  { key: 'unit' as SortKey, label: 'Unit Kerja' },
                  { key: 'createdAt' as SortKey, label: 'Tanggal' },
                  { key: 'status' as SortKey, label: 'Status' },
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
                <tr><td colSpan={6} className="py-12 text-center text-[#94A3B8] text-sm"><FileText size={32} className="mx-auto mb-3 opacity-30" /><p>Tidak ada data deklarasi.</p></td></tr>
              ) : filtered.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => onSelect(ticket)}>
                  <td className="px-4 py-3"><span className="font-mono text-xs font-semibold text-[#0A2558]">{ticket.ticketId}</span></td>
                  <td className="px-4 py-3"><p className="text-sm font-medium text-[#1E293B]">{ticket.nama || '-'}</p><p className="text-xs text-[#94A3B8]">{ticket.jabatan || '-'}</p></td>
                  <td className="px-4 py-3 text-sm text-[#475569]">{ticket.unit || '-'}</td>
                  <td className="px-4 py-3 text-xs text-[#475569] whitespace-nowrap">{formatDateShort(ticket.createdAt)}</td>
                  <td className="px-4 py-3"><span className={`badge ${getStatusColor(ticket.status)}`}>{getStatusLabel(ticket.status)}</span></td>
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
          Menampilkan {filtered.length} dari {declarations.length} deklarasi
        </div>
      </div>
    </div>
  )
}
