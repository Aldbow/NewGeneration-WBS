'use client'

import Link from 'next/link'
import {
  FileText, Shield, Eye, Clock, AlertTriangle,
  CheckCircle, Lock, ArrowRight, Zap
} from 'lucide-react'
import AnimateIn from '@/components/ui/AnimateIn'

const features = [
  {
    icon: FileText,
    title: 'Deklarasi Digital',
    description: 'Wizard 4-langkah dengan tanda tangan digital berbasis canvas. Aman, cepat, dan paperless.',
    color: 'from-violet-500 to-violet-700',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    icon: Eye,
    title: 'Whistleblowing Anonim',
    description: '100% anonim tanpa lacak IP. Identitas Anda sepenuhnya terlindungi oleh sistem enkripsi end-to-end.',
    color: 'from-rose-500 to-rose-700',
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    icon: Clock,
    title: 'Tracking Real-Time',
    description: 'Pantau status laporan Anda kapan saja dengan nomor tiket unik. Timeline tersedia secara real-time.',
    color: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: Shield,
    title: 'Dashboard Admin',
    description: 'Antarmuka admin dengan filter, sorting, dan detail drawer untuk manajemen seluruh laporan secara terpusat.',
    color: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Lock,
    title: 'Keamanan Berlapis',
    description: 'Data terenkripsi, autentikasi aman, dan perlindungan penuh sesuai regulasi pemerintah.',
    color: 'from-emerald-500 to-emerald-700',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Zap,
    title: 'Respons Cepat',
    description: 'SLA penanganan maksimal 3×24 jam. Setiap laporan ditindaklanjuti secara terstruktur dan transparan.',
    color: 'from-cyan-500 to-cyan-700',
    bg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
]

const stats = [
  { value: '1.240+', label: 'Laporan Ditangani', icon: CheckCircle },
  { value: '89%', label: 'Tingkat Penyelesaian', icon: AlertTriangle },
  { value: '47', label: 'Unit Kerja Terlibat', icon: Shield },
  { value: '< 24 Jam', label: 'Rata-rata Respons', icon: Clock },
]

// Animation type cycling for cards: slideLeft, slideUp, slideRight in rows
const CARD_ANIMATIONS = [
  'slideLeft', 'slideUp', 'slideRight',
  'slideLeft', 'slideUp', 'slideRight',
] as const

export default function FeatureGrid() {
  return (
    <section id="features" className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ── */}
        <AnimateIn animation="slideDown" delay={0} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFF6FF] border border-blue-100 text-sm font-semibold text-[#1D5BBF] mb-4">
            <Zap size={14} className="text-blue-500" />
            Kenapa Portal Ini?
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1E293B] mb-4">
            Dirancang untuk Integritas
          </h2>
          <p className="text-[#475569] max-w-xl mx-auto">
            Setiap fitur dibangun dengan mengutamakan keamanan,
            kemudahan penggunaan, dan perlindungan identitas.
          </p>
        </AnimateIn>

        {/* ── Feature Cards — Bento Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {features.map((f, i) => (
            <AnimateIn
              key={f.title}
              animation={CARD_ANIMATIONS[i]}
              delay={i * 80}
              duration={650}
              className="card p-6 group hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <f.icon size={22} className="text-white" />
              </div>
              <h3 className="font-heading font-bold text-[#1E293B] mb-2">{f.title}</h3>
              <p className="text-sm text-[#475569] leading-relaxed">{f.description}</p>
            </AnimateIn>
          ))}
        </div>

        {/* ── Stats Row ── */}
        <AnimateIn animation="slideUp" delay={100} className="card p-0 overflow-hidden mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#F1F5F9]">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <AnimateIn
                key={label}
                animation="scaleUp"
                delay={i * 100 + 200}
                duration={500}
                className="px-6 py-8 text-center group hover:bg-[#F8FAFC] transition-colors"
              >
                <Icon size={20} className="mx-auto mb-3 text-[#1D5BBF] opacity-60 group-hover:opacity-100 transition-opacity" />
                <p className="text-3xl font-heading font-bold gradient-text mb-1">{value}</p>
                <p className="text-xs text-[#475569] font-medium">{label}</p>
              </AnimateIn>
            ))}
          </div>
        </AnimateIn>

        {/* ── CTA Banner ── */}
        <AnimateIn animation="flipUp" delay={0} duration={700}>
          <div className="relative gradient-bg rounded-3xl p-8 sm:p-12 text-center overflow-hidden">
            {/* decorative circles */}
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5" aria-hidden="true" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-white/5" aria-hidden="true" />

            <AnimateIn animation="slideDown" delay={150} className="relative">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-3">
                Siap Melaporkan Pelanggaran?
              </h2>
              <p className="text-blue-100 mb-8 max-w-md mx-auto">
                Identitas Anda sepenuhnya terlindungi. Mulai buat laporan sekarang dan bantu wujudkan pemerintahan yang bersih.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/lapor"
                  id="feature-cta-lapor"
                  className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-[#0A2558] rounded-2xl font-heading font-bold hover:bg-blue-50 transition-all hover:scale-105"
                >
                  <AlertTriangle size={18} className="text-red-500" />
                  Lapor Sekarang
                  <ArrowRight size={16} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
                <Link
                  href="/cek-tiket"
                  id="feature-cta-cek"
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white/15 text-white rounded-2xl font-heading font-bold hover:bg-white/25 transition-all hover:scale-105 border border-white/20"
                >
                  <Clock size={18} />
                  Cek Status Tiket
                </Link>
              </div>
            </AnimateIn>
          </div>
        </AnimateIn>

      </div>
    </section>
  )
}
