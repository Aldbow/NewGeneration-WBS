'use client'

import { FileText, AlertTriangle, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react'
import { TicketWithDetails } from '@/lib/supabase-service'

interface StatsGridProps {
  declarations: TicketWithDetails[]
  reports: TicketWithDetails[]
}

export default function StatsGrid({ declarations, reports }: StatsGridProps) {
  const totalDkl = declarations.length
  const totalWbs = reports.length
  const total = totalDkl + totalWbs
  const selesai = [...declarations, ...reports].filter((t) => t.status === 'SELESAI').length
  const diproses = [...declarations, ...reports].filter((t) => t.status === 'DIPROSES').length
  const kritis = [...declarations, ...reports].filter((t) => t.urgency === 'KRITIS').length

  const rateSelesai = total > 0 ? Math.round((selesai / total) * 100) : 0

  const cards = [
    {
      id: 'stat-total',
      label: 'Total Tiket',
      value: total,
      sub: 'Semua jenis',
      icon: Users,
      color: 'from-blue-500 to-blue-700',
      span: 'md:col-span-3',
    },
    {
      id: 'stat-deklarasi',
      label: 'Deklarasi',
      value: totalDkl,
      sub: 'Deklarasi masuk',
      icon: FileText,
      color: 'from-violet-500 to-violet-700',
      span: 'md:col-span-3',
    },
    {
      id: 'stat-laporan',
      label: 'Laporan WBS',
      value: totalWbs,
      sub: 'Laporan anonim',
      icon: AlertTriangle,
      color: 'from-rose-500 to-rose-700',
      span: 'md:col-span-3',
    },
    {
      id: 'stat-selesai',
      label: 'Diselesaikan',
      value: `${rateSelesai}%`,
      sub: `${selesai} dari ${total} tiket`,
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-700',
      span: 'md:col-span-3',
    },
    {
      id: 'stat-diproses',
      label: 'Sedang Diproses',
      value: diproses,
      sub: 'Membutuhkan tindak lanjut',
      icon: Clock,
      color: 'from-amber-500 to-amber-700',
      span: 'md:col-span-6',
    },
    {
      id: 'stat-kritis',
      label: 'Kasus Kritis',
      value: kritis,
      sub: 'Prioritas tinggi',
      icon: TrendingUp,
      color: 'from-red-600 to-red-800',
      span: 'md:col-span-6',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-12 gap-4 mb-6">
      {cards.map(({ id, label, value, sub, icon: Icon, color, span }) => (
        <div
          key={id}
          id={id}
          className={`${span} card p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform`}
        >
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-5 rounded-full translate-x-8 -translate-y-8 group-hover:opacity-10 transition-opacity`} aria-hidden="true" />
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-sm`}>
            <Icon size={18} className="text-white" />
          </div>
          <p className="text-2xl font-heading font-bold text-[#1E293B] mb-0.5">{value}</p>
          <p className="text-xs font-semibold text-[#1E293B]">{label}</p>
          <p className="text-xs text-[#94A3B8] mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  )
}
