'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FileText, AlertTriangle, Shield, ArrowRight, Lock, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

/* ─────────────────────────────────────────────
   Animated counter hook
───────────────────────────────────────────── */
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(ease * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

const DEFAULT_STATS = [
  { id: 'total', label: 'Tiket Masuk', value: 0, suffix: '', icon: FileText },
  { id: 'selesai', label: 'Tiket Selesai', value: 0, suffix: '', icon: CheckCircle },
  { id: 'deklarasi', label: 'Deklarasi', value: 0, suffix: '', icon: Shield },
  { id: 'laporan', label: 'Laporan WBS', value: 0, suffix: '', icon: AlertTriangle },
]

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [countersStarted, setCountersStarted] = useState(false)
  const [stats, setStats] = useState(DEFAULT_STATS)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: total } = await supabase.from('tickets').select('*', { count: 'exact', head: true })
        const { count: selesai } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).in('status', ['SELESAI', 'DITOLAK'])
        const { count: deklarasi } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('type', 'DEKLARASI')
        const { count: laporan } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('type', 'LAPORAN')

        if (total !== null) {
          setStats([
            { id: 'total', label: 'Total Tiket Masuk', value: total, suffix: '', icon: FileText },
            { id: 'selesai', label: 'Tiket Selesai', value: selesai || 0, suffix: '', icon: CheckCircle },
            { id: 'deklarasi', label: 'Total Deklarasi', value: deklarasi || 0, suffix: '', icon: Shield },
            { id: 'laporan', label: 'Laporan WBS', value: laporan || 0, suffix: '', icon: AlertTriangle },
          ])
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }
    fetchStats()
  }, [])

  const c0 = useCounter(stats[0].value, 2200, countersStarted)
  const c1 = useCounter(stats[1].value, 1800, countersStarted)
  const c2 = useCounter(stats[2].value, 1600, countersStarted)
  const c3 = useCounter(stats[3].value, 1400, countersStarted)
  const c = [c0, c1, c2, c3]

  /* ── Star / Grid Canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Stars
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.7 + 0.1,
      speed: Math.random() * 0.3 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }))

    // Grid lines
    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(99,179,237,0.04)'
      ctx.lineWidth = 1
      const spacing = 60
      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }
    }

    let raf: number
    let t = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawGrid()
      t += 0.01

      stars.forEach((s) => {
        s.pulse += 0.02
        const a = s.alpha * (0.6 + 0.4 * Math.sin(s.pulse))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(147,197,253,${a})`
        ctx.fill()
        s.y -= s.speed
        if (s.y < -5) { s.y = canvas.height + 5; s.x = Math.random() * canvas.width }
      })

      // Scanning line
      const scanY = (Math.sin(t * 0.3) * 0.5 + 0.5) * canvas.height
      const scanGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60)
      scanGrad.addColorStop(0, 'transparent')
      scanGrad.addColorStop(0.5, 'rgba(6,182,212,0.06)')
      scanGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = scanGrad
      ctx.fillRect(0, scanY - 60, canvas.width, 120)

      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  /* ── Intersection for counters ── */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCountersStarted(true) },
      { threshold: 0.3 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #020817 0%, #0A1628 40%, #0D1F3C 70%, #071525 100%)' }}
    >
      {/* ── Aurora Blobs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div className="aurora-blob aurora-blob-4" />
      </div>

      {/* ── Canvas: stars + grid ── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />

      {/* ── Hero Content ── */}
      <div className="relative flex-1 flex items-center pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* LEFT — Copy */}
            <div className="order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold mb-8 hero-badge hero-enter hero-enter-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-cyan-300">Sistem Integritas UKPBJ Kemnaker RI</span>
              </div>

              {/* Headline */}
              <h1 className="font-heading font-bold leading-[1.05] mb-6 text-white">
                <span className="block text-5xl sm:text-6xl lg:text-7xl hero-enter hero-enter-2">
                  Jaga
                </span>
                <span className="block text-5xl sm:text-6xl lg:text-7xl hero-gradient-text mt-1 hero-enter hero-enter-3">
                  Integritas,
                </span>
                <span className="block text-4xl sm:text-5xl lg:text-6xl text-slate-300 mt-2 font-semibold hero-enter hero-enter-4">
                  UKPBJ Kemnaker.
                </span>
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-xl hero-enter hero-enter-5">
                Platform deklarasi benturan kepentingan dan pelaporan pelanggaran <strong className="text-white">100% anonim</strong>
              </p>

              {/* CTA Row */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12 hero-enter hero-enter-6">
                <Link
                  href="/deklarasi"
                  id="hero-cta-deklarasi"
                  className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-heading font-bold text-base text-white transition-all duration-300 hero-btn-primary"
                >
                  <FileText size={20} className="text-cyan-400 group-hover:animate-pulse" />
                  Buat Deklarasi
                  <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 hero-enter hero-enter-7">
                {[
                  { icon: Lock, label: '100% Anonim' },
                  { icon: Shield, label: 'Terenkripsi End-to-End' },
                  // { icon: Eye, label: 'Dilindungi UU No. 13/2022' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-slate-400 text-sm">
                    <Icon size={14} className="text-cyan-400 shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Visual */}
            <div className="order-1 lg:order-2 flex items-center justify-center hero-enter hero-enter-visual">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96">
                {/* Outer rotating ring */}
                <div className="hero-ring hero-ring-outer" aria-hidden="true" />
                {/* Middle ring */}
                <div className="hero-ring hero-ring-mid" aria-hidden="true" />
                {/* Inner ring */}
                <div className="hero-ring hero-ring-inner" aria-hidden="true" />

                {/* Center card */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="hero-center-card">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 mx-auto hero-icon-bg">
                      <Shield size={40} className="text-white" />
                    </div>
                    <p className="text-white font-heading font-bold text-lg text-center leading-tight">Portal<br />Integritas</p>
                    <div className="mt-3 flex items-center gap-1.5 justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-xs font-medium">Sistem Aktif</span>
                    </div>
                  </div>
                </div>

                {/* Orbiting dots */}
                <div className="hero-orbit hero-orbit-1" aria-hidden="true">
                  <div className="hero-orbit-dot bg-cyan-400" />
                </div>
                <div className="hero-orbit hero-orbit-2" aria-hidden="true">
                  <div className="hero-orbit-dot bg-violet-400" />
                </div>
                <div className="hero-orbit hero-orbit-3" aria-hidden="true">
                  <div className="hero-orbit-dot bg-rose-400" />
                </div>

                {/* Floating notification cards */}
                <div className="hero-float-card hero-float-card-tl">
                  <Lock size={12} className="text-cyan-400 shrink-0" />
                  <span>Anonim 100%</span>
                </div>
                <div className="hero-float-card hero-float-card-br">
                  <Shield size={12} className="text-green-400 shrink-0" />
                  <span>Terverifikasi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="relative">
        <div className="hero-stats-bar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
              {stats.map(({ id, label, suffix, icon: Icon }, i) => (
                <div key={id} className={`px-6 py-5 text-center group hover:bg-white/5 transition-colors hero-enter hero-stat-${i}`}>
                  <Icon size={16} className="mx-auto mb-2 text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <p className="text-2xl sm:text-3xl font-heading font-bold text-white leading-none">
                    {c[i]}{suffix}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" aria-hidden="true" />

      <style jsx>{`
        /* Aurora blobs */
        .aurora-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          will-change: transform;
        }
        .aurora-blob-1 {
          width: 600px; height: 600px;
          top: -100px; left: -200px;
          background: radial-gradient(circle, #1e3a8a, #7c3aed);
          animation: blobMove1 18s ease-in-out infinite;
        }
        .aurora-blob-2 {
          width: 500px; height: 500px;
          top: 50px; right: -150px;
          background: radial-gradient(circle, #0e7490, #6d28d9);
          animation: blobMove2 22s ease-in-out infinite;
          opacity: 0.2;
        }
        .aurora-blob-3 {
          width: 400px; height: 400px;
          bottom: 100px; left: 30%;
          background: radial-gradient(circle, #1d4ed8, #0891b2);
          animation: blobMove3 16s ease-in-out infinite;
          opacity: 0.18;
        }
        .aurora-blob-4 {
          width: 350px; height: 350px;
          bottom: -80px; right: 20%;
          background: radial-gradient(circle, #7c3aed, #ec4899);
          animation: blobMove4 20s ease-in-out infinite;
          opacity: 0.15;
        }
        @keyframes blobMove1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(80px, 60px) scale(1.1); }
          66% { transform: translate(-40px, 100px) scale(0.95); }
        }
        @keyframes blobMove2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-100px, 80px) scale(1.15); }
          70% { transform: translate(60px, -40px) scale(0.9); }
        }
        @keyframes blobMove3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          30% { transform: translate(-70px, -50px) scale(1.1); }
          60% { transform: translate(50px, 80px) scale(0.85); }
        }
        @keyframes blobMove4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-80px, -60px) scale(1.2); }
        }

        /* Badge */
        .hero-badge {
          background: rgba(6,182,212,0.08);
          border-color: rgba(6,182,212,0.25);
        }

        /* Headline gradient */
        .hero-gradient-text {
          background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          padding-bottom: 0.15em;
          margin-bottom: -0.15em;
        }

        /* Buttons */
        .hero-btn-primary {
          background: linear-gradient(135deg, #1e3a8a, #6d28d9);
          border: 1px solid rgba(139,92,246,0.4);
          box-shadow: 0 0 30px rgba(109,40,217,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .hero-btn-primary:hover {
          background: linear-gradient(135deg, #1e40af, #7c3aed);
          box-shadow: 0 0 50px rgba(109,40,217,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
          transform: translateY(-2px);
        }
        .hero-btn-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          color: #e2e8f0;
        }
        .hero-btn-secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(6,182,212,0.4);
          color: white;
          transform: translateY(-2px);
        }

        /* Rings */
        .hero-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid;
          animation: ringRotate 20s linear infinite;
        }
        .hero-ring-outer {
          border-color: rgba(6,182,212,0.15);
          animation-duration: 25s;
        }
        .hero-ring-mid {
          inset: 28px;
          border-color: rgba(139,92,246,0.2);
          animation-duration: 18s;
          animation-direction: reverse;
        }
        .hero-ring-inner {
          inset: 60px;
          border-color: rgba(6,182,212,0.25);
          animation-duration: 12s;
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Center card */
        .hero-center-card {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(6,182,212,0.2);
          border-radius: 2rem;
          padding: 2rem 2.5rem;
          box-shadow: 0 0 60px rgba(6,182,212,0.08), 0 25px 50px rgba(0,0,0,0.5);
          animation: cardFloat 6s ease-in-out infinite;
        }
        .hero-icon-bg {
          background: linear-gradient(135deg, #1e3a8a, #6d28d9);
          box-shadow: 0 0 30px rgba(109,40,217,0.4);
        }
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        /* Orbiting elements */
        .hero-orbit {
          position: absolute;
          inset: 0;
          border-radius: 50%;
        }
        .hero-orbit-1 { animation: ringRotate 8s linear infinite; }
        .hero-orbit-2 { animation: ringRotate 12s linear infinite reverse; }
        .hero-orbit-3 { animation: ringRotate 16s linear infinite; }
        .hero-orbit-dot {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          box-shadow: 0 0 12px currentColor;
        }

        /* Floating notification cards */
        .hero-float-card {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(15,23,42,0.9);
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 12px;
          font-weight: 600;
          color: #e2e8f0;
          white-space: nowrap;
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .hero-float-card-tl {
          top: 20px; left: -20px;
          animation: floatTL 4s ease-in-out infinite;
        }
        .hero-float-card-br {
          bottom: 30px; right: -20px;
          animation: floatBR 5s ease-in-out infinite;
        }
        @keyframes floatTL {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-8px, -6px); }
        }
        @keyframes floatBR {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(8px, 6px); }
        }

        /* Stats Bar */
        .hero-stats-bar {
          background: rgba(6, 12, 30, 0.7);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* ── Entrance Animations ── */
        .hero-enter {
          opacity: 0;
          animation-fill-mode: both;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          animation-name: heroSlideUp;
          animation-duration: 700ms;
        }
        .hero-enter-visual {
          animation-name: heroSlideRight;
          animation-duration: 800ms;
        }
        @keyframes heroSlideUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroSlideRight {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .hero-enter-1 { animation-delay: 100ms; }
        .hero-enter-2 { animation-delay: 200ms; }
        .hero-enter-3 { animation-delay: 320ms; }
        .hero-enter-4 { animation-delay: 440ms; }
        .hero-enter-5 { animation-delay: 560ms; }
        .hero-enter-6 { animation-delay: 680ms; }
        .hero-enter-7 { animation-delay: 800ms; }
        .hero-enter-visual { animation-delay: 300ms; }
        .hero-stat-0 { animation-delay: 800ms; }
        .hero-stat-1 { animation-delay: 900ms; }
        .hero-stat-2 { animation-delay: 1000ms; }
        .hero-stat-3 { animation-delay: 1100ms; }
      `}</style>
    </section>
  )
}
