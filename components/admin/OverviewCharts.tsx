'use client'

import { useMemo } from 'react'
import { TicketWithDetails } from '@/lib/supabase-service'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'

interface OverviewChartsProps {
  tickets: TicketWithDetails[]
}

const COLORS = {
  deklarasi: '#8B5CF6', // Violet
  wbs: '#F43F5E',       // Rose
  status: {
    DITERIMA: '#3B82F6',     // Blue
    DIVERIFIKASI: '#EAB308', // Yellow
    DIPROSES: '#F97316',     // Orange
    SELESAI: '#10B981',      // Green
    DITOLAK: '#EF4444',      // Red
  },
  urgency: {
    RENDAH: '#3B82F6',   // Blue
    SEDANG: '#F59E0B',   // Amber
    TINGGI: '#F97316',   // Orange
    KRITIS: '#DC2626',   // Red
  }
}

export default function OverviewCharts({ tickets }: OverviewChartsProps) {
  
  // 1. Trend Data (Last 7 Days)
  const trendData = useMemo(() => {
    const dates = new Map<string, { date: string; Deklarasi: number; WBS: number }>()
    
    // Create map for last 7 days to ensure we have continuous dates even if 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const displayDate = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      dates.set(dateStr, { date: displayDate, Deklarasi: 0, WBS: 0 })
    }

    tickets.forEach(ticket => {
      const dateStr = ticket.createdAt.split('T')[0]
      if (dates.has(dateStr)) {
        const item = dates.get(dateStr)!
        if (ticket.type === 'deklarasi') item.Deklarasi++
        else item.WBS++
      }
    })

    return Array.from(dates.values())
  }, [tickets])

  // 2. Status Distribution Data
  const statusData = useMemo(() => {
    const statusMap = {
      DITERIMA: 0,
      DIVERIFIKASI: 0,
      DIPROSES: 0,
      SELESAI: 0,
      DITOLAK: 0,
    }

    tickets.forEach(ticket => {
      if (statusMap[ticket.status as keyof typeof statusMap] !== undefined) {
        statusMap[ticket.status as keyof typeof statusMap]++
      }
    })

    return [
      { name: 'Diterima', count: statusMap.DITERIMA, fill: COLORS.status.DITERIMA },
      { name: 'Diverifikasi', count: statusMap.DIVERIFIKASI, fill: COLORS.status.DIVERIFIKASI },
      { name: 'Diproses', count: statusMap.DIPROSES, fill: COLORS.status.DIPROSES },
      { name: 'Selesai', count: statusMap.SELESAI, fill: COLORS.status.SELESAI },
      { name: 'Ditolak', count: statusMap.DITOLAK, fill: COLORS.status.DITOLAK },
    ]
  }, [tickets])

  // 3. Composition Data
  const typeData = useMemo(() => {
    let deklarasi = 0
    let wbs = 0
    tickets.forEach(t => t.type === 'deklarasi' ? deklarasi++ : wbs++)
    return [
      { name: 'Deklarasi', value: deklarasi, fill: COLORS.deklarasi },
      { name: 'WBS', value: wbs, fill: COLORS.wbs },
    ]
  }, [tickets])

  // 4. Urgency Data (WBS Only)
  const urgencyData = useMemo(() => {
    const wbsTickets = tickets.filter(t => t.type === 'laporan')
    const urgencyMap = { RENDAH: 0, SEDANG: 0, TINGGI: 0, KRITIS: 0 }
    
    wbsTickets.forEach(t => {
      if (urgencyMap[t.urgency as keyof typeof urgencyMap] !== undefined) {
        urgencyMap[t.urgency as keyof typeof urgencyMap]++
      }
    })

    return [
      { name: 'Rendah', value: urgencyMap.RENDAH, fill: COLORS.urgency.RENDAH },
      { name: 'Sedang', value: urgencyMap.SEDANG, fill: COLORS.urgency.SEDANG },
      { name: 'Tinggi', value: urgencyMap.TINGGI, fill: COLORS.urgency.TINGGI },
      { name: 'Kritis', value: urgencyMap.KRITIS, fill: COLORS.urgency.KRITIS },
    ].filter(item => item.value > 0) // Only show non-zero urgencies
  }, [tickets])

  interface TooltipEntry {
    name: string
    value: number
    color?: string
    payload?: { fill?: string }
  }

  interface CustomTooltipProps {
    active?: boolean
    payload?: TooltipEntry[]
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-[#E2E8F0] shadow-xl rounded-xl text-sm">
          <p className="font-semibold text-[#1E293B] mb-2">{label}</p>
          {payload.map((entry: TooltipEntry, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color || entry.payload?.fill }} />
              <span className="text-[#475569]">{entry.name}:</span>
              <span className="font-bold text-[#1E293B]">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Chart */}
        <div className="card p-5 border border-[#E2E8F0]">
          <h3 className="font-heading font-bold text-sm text-[#1E293B] mb-1">Tren Pengajuan (7 Hari Terakhir)</h3>
          <p className="text-xs text-[#94A3B8] mb-6">Jumlah tiket yang masuk per hari berdasarkan jenisnya.</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Deklarasi" stroke={COLORS.deklarasi} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="WBS" stroke={COLORS.wbs} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Chart */}
        <div className="card p-5 border border-[#E2E8F0]">
          <h3 className="font-heading font-bold text-sm text-[#1E293B] mb-1">Distribusi Status Tiket</h3>
          <p className="text-xs text-[#94A3B8] mb-6">Rekapitulasi jumlah tiket berdasarkan status pemrosesan saat ini.</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="count" name="Jumlah" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Composition Chart */}
        <div className="card p-5 border border-[#E2E8F0] flex flex-col items-center">
          <div className="w-full text-left mb-2">
            <h3 className="font-heading font-bold text-sm text-[#1E293B] mb-1">Komposisi Jenis Tiket</h3>
            <p className="text-xs text-[#94A3B8]">Persentase antara Deklarasi dan WBS.</p>
          </div>
          <div className="h-[200px] w-full relative">
            {tickets.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-[#94A3B8]">Belum ada data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Urgency Chart */}
        <div className="card p-5 border border-[#E2E8F0] flex flex-col items-center">
          <div className="w-full text-left mb-2">
            <h3 className="font-heading font-bold text-sm text-[#1E293B] mb-1">Tingkat Urgensi (Khusus WBS)</h3>
            <p className="text-xs text-[#94A3B8]">Distribusi prioritas penanganan pelanggaran.</p>
          </div>
          <div className="h-[200px] w-full relative">
            {urgencyData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-[#94A3B8]">Tidak ada laporan WBS</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Pie
                    data={urgencyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {urgencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  )
}
