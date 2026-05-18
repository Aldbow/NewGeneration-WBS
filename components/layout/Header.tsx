'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Menu, X, FileText, ChevronRight } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/deklarasi', label: 'Deklarasi' },
  { href: '/lapor', label: 'Lapor Pelanggaran' },
  { href: '/cek-tiket', label: 'Cek Tiket' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const isHeroPage = pathname === '/'
  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (isAdmin) return null

  /* ── Style logic:
     On hero (dark page):  always show dark glass bg for legibility
     On light pages:       transparent → glass on scroll
  ── */
  const headerBg = isHeroPage
    ? scrolled
      ? 'bg-[#071525]/85 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
      : 'bg-transparent'
    : scrolled
      ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm'
      : 'bg-transparent'

  const logoTextColor = isHeroPage ? 'text-white' : 'text-[#0A2558]'
  const logoSubColor = isHeroPage ? 'text-slate-400' : 'text-slate-500'
  const navTextBase = isHeroPage ? 'text-slate-300 hover:text-white hover:bg-white/8' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
  const navActiveColor = isHeroPage ? 'bg-white/12 text-white' : 'bg-[#0A2558] text-white'

  return (
    <>
      <header
        id="main-header"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-3.5 ${headerBg}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* ── Logo ── */}
          <Link href="/" id="header-logo" className="flex items-center gap-2.5 group">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform ${isHeroPage ? 'bg-gradient-to-br from-blue-600 to-violet-600' : 'gradient-bg'}`}>
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className={`font-heading font-bold text-sm leading-none ${logoTextColor}`}>Portal Integritas</p>
              <p className={`text-xs leading-none mt-0.5 ${logoSubColor}`}>UKPBJ Kemnaker</p>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Navigasi utama">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                id={`nav-${link.href.replace('/', '') || 'home'}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === link.href ? navActiveColor : navTextBase
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── CTA Buttons ── */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/deklarasi"
              id="header-cta-deklarasi"
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-heading font-bold transition-all duration-200 ${isHeroPage
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-400 shadow-lg shadow-cyan-900/30'
                  : 'bg-gradient-to-r from-[#0A2558] to-[#1D5BBF] text-white shadow-lg'
                } hover:scale-105 hover:-translate-y-0.5`}
            >
              <FileText size={14} />
              Buat Deklarasi
            </Link>
            <Link
              href="/admin/login"
              id="header-admin-login"
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isHeroPage
                  ? 'text-slate-300 border border-white/15 hover:bg-white/8 hover:text-white'
                  : 'text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              Admin
            </Link>
          </div>

          {/* ── Mobile Menu Button ── */}
          <button
            id="mobile-menu-btn"
            className={`md:hidden p-2 rounded-xl transition ${isHeroPage ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
              }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Mobile Nav ── */}
        {mobileOpen && (
          <div className={`md:hidden mt-1 border-t ${isHeroPage ? 'bg-[#020817]/95 border-white/8' : 'bg-white border-slate-100'} backdrop-blur-xl`}>
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1" aria-label="Navigasi mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${pathname === link.href
                      ? isHeroPage ? 'bg-white/12 text-white' : 'bg-[#0A2558] text-white'
                      : isHeroPage ? 'text-slate-300 hover:bg-white/8' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {link.label}
                  <ChevronRight size={16} className="opacity-40" />
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/deklarasi"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-bold text-sm"
                >
                  <FileText size={16} /> Buat Deklarasi
                </Link>
                <Link
                  href="/admin/login"
                  onClick={() => setMobileOpen(false)}
                  className={`py-3 rounded-xl text-center text-sm font-medium border ${isHeroPage ? 'border-white/15 text-slate-300' : 'border-slate-200 text-slate-600'
                    }`}
                >
                  Login Admin
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── Offline Banner ── */}
      <div id="offline-banner" className="offline-banner" role="alert" aria-live="polite">
        ⚠️ Koneksi terputus. Mohon periksa jaringan Anda.
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          window.addEventListener('online', () => document.getElementById('offline-banner')?.classList.remove('show'));
          window.addEventListener('offline', () => document.getElementById('offline-banner')?.classList.add('show'));
        `
      }} />
    </>
  )
}
