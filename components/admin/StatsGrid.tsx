'use client'

import { FileText, AlertTriangle, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react'
import { TicketWithDetails } from '@/lib/supabase-service'
import { motion, AnimatePresence, Variants } from 'framer-motion'

interface StatsGridProps {
  declarations: TicketWithDetails[]
  reports: TicketWithDetails[]
  activeTab?: string
}

export default function StatsGrid({ declarations, reports, activeTab = 'all' }: StatsGridProps) {
  const totalDkl = declarations.length
  const totalWbs = reports.length
  const total = totalDkl + totalWbs
  
  const selesaiDkl = declarations.filter((t) => t.status === 'SELESAI' || t.status === 'DITOLAK').length
  const selesaiWbs = reports.filter((t) => t.status === 'SELESAI' || t.status === 'DITOLAK').length
  const selesaiAll = selesaiDkl + selesaiWbs

  const diprosesDkl = declarations.filter((t) => t.status === 'DIPROSES').length
  const diprosesWbs = reports.filter((t) => t.status === 'DIPROSES').length
  const diprosesAll = diprosesDkl + diprosesWbs

  const kritis = reports.filter((t) => t.urgency === 'KRITIS').length

  const rateSelesaiAll = total > 0 ? Math.round((selesaiAll / total) * 100) : 0
  const rateSelesaiDkl = totalDkl > 0 ? Math.round((selesaiDkl / totalDkl) * 100) : 0
  const rateSelesaiWbs = totalWbs > 0 ? Math.round((selesaiWbs / totalWbs) * 100) : 0

  let cards = []

  if (activeTab === 'deklarasi') {
    cards = [
      {
        id: 'stat-deklarasi',
        label: 'Total Deklarasi',
        value: totalDkl,
        sub: 'Semua deklarasi masuk',
        icon: FileText,
        color: 'from-violet-500 to-violet-700',
        span: 'col-span-2 md:col-span-4',
      },
      {
        id: 'stat-selesai-dkl',
        label: 'Diselesaikan',
        value: `${rateSelesaiDkl}%`,
        sub: `${selesaiDkl} dari ${totalDkl} deklarasi`,
        icon: CheckCircle,
        color: 'from-emerald-500 to-emerald-700',
        span: 'col-span-1 md:col-span-4',
      },
      {
        id: 'stat-diproses-dkl',
        label: 'Sedang Diproses',
        value: diprosesDkl,
        sub: 'Membutuhkan verifikasi',
        icon: Clock,
        color: 'from-amber-500 to-amber-700',
        span: 'col-span-1 md:col-span-4',
      },
    ]
  } else if (activeTab === 'laporan') {
    cards = [
      {
        id: 'stat-laporan',
        label: 'Total Laporan WBS',
        value: totalWbs,
        sub: 'Semua laporan masuk',
        icon: AlertTriangle,
        color: 'from-rose-500 to-rose-700',
        span: 'col-span-2 md:col-span-3',
      },
      {
        id: 'stat-kritis',
        label: 'Kasus Kritis',
        value: kritis,
        sub: 'Prioritas penanganan utama',
        icon: TrendingUp,
        color: 'from-red-600 to-red-800',
        span: 'col-span-2 md:col-span-3',
      },
      {
        id: 'stat-selesai-wbs',
        label: 'Diselesaikan',
        value: `${rateSelesaiWbs}%`,
        sub: `${selesaiWbs} dari ${totalWbs} laporan`,
        icon: CheckCircle,
        color: 'from-emerald-500 to-emerald-700',
        span: 'col-span-1 md:col-span-3',
      },
      {
        id: 'stat-diproses-wbs',
        label: 'Sedang Diproses',
        value: diprosesWbs,
        sub: 'Dalam tahap investigasi',
        icon: Clock,
        color: 'from-amber-500 to-amber-700',
        span: 'col-span-1 md:col-span-3',
      },
    ]
  } else {
    // 'all' view
    cards = [
      {
        id: 'stat-total',
        label: 'Total Tiket',
        value: total,
        sub: 'Semua jenis',
        icon: Users,
        color: 'from-blue-500 to-blue-700',
        span: 'col-span-2 md:col-span-3',
      },
      {
        id: 'stat-deklarasi',
        label: 'Deklarasi',
        value: totalDkl,
        sub: 'Deklarasi masuk',
        icon: FileText,
        color: 'from-violet-500 to-violet-700',
        span: 'col-span-1 md:col-span-3',
      },
      {
        id: 'stat-laporan',
        label: 'Laporan WBS',
        value: totalWbs,
        sub: 'Laporan anonim',
        icon: AlertTriangle,
        color: 'from-rose-500 to-rose-700',
        span: 'col-span-1 md:col-span-3',
      },
      {
        id: 'stat-selesai',
        label: 'Diselesaikan',
        value: `${rateSelesaiAll}%`,
        sub: `${selesaiAll} dari ${total} tiket`,
        icon: CheckCircle,
        color: 'from-emerald-500 to-emerald-700',
        span: 'col-span-2 md:col-span-3',
      },
      {
        id: 'stat-diproses',
        label: 'Sedang Diproses',
        value: diprosesAll,
        sub: 'Membutuhkan tindak lanjut',
        icon: Clock,
        color: 'from-amber-500 to-amber-700',
        span: 'col-span-1 md:col-span-6',
      },
      {
        id: 'stat-kritis',
        label: 'Kasus Kritis',
        value: kritis,
        sub: 'Prioritas tinggi',
        icon: TrendingUp,
        color: 'from-red-600 to-red-800',
        span: 'col-span-1 md:col-span-6',
      },
    ]
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      key={activeTab} // Retrigger animation on tab change
      className="grid grid-cols-2 md:grid-cols-12 gap-4 mb-6"
    >
      <AnimatePresence mode="popLayout">
        {cards.map(({ id, label, value, sub, icon: Icon, color, span }) => (
          <motion.div
            key={id}
            variants={itemVariants}
            layout
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
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
