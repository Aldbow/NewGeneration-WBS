'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAdminStore } from '@/store/useAdminStore'
import {
  Shield, LayoutDashboard, FileText, AlertTriangle,
  LogOut, Menu, X, ChevronRight
} from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/dashboard?tab=deklarasi', label: 'Deklarasi', icon: FileText },
  { href: '/admin/dashboard?tab=laporan', label: 'Laporan WBS', icon: AlertTriangle },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const logout = useAdminStore((s) => s.logout)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-[#E2E8F0] ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shrink-0">
          <Shield size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-heading font-bold text-sm text-[#0A2558] leading-none">Portal Integritas</p>
            <p className="text-xs text-[#94A3B8] leading-none mt-0.5">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1" aria-label="Admin navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === '/admin/dashboard'
          return (
            <Link
              key={href}
              href={href}
              id={`sidebar-${label.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active && href === '/admin/dashboard'
                  ? 'bg-[#0A2558] text-white'
                  : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1E293B]'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
              {!collapsed && <ChevronRight size={14} className="ml-auto opacity-40" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className={`p-3 border-t border-[#E2E8F0] ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full ${collapsed ? 'justify-center' : ''}`}
          aria-label="Logout"
        >
          <LogOut size={18} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        id="admin-sidebar"
        className={`hidden lg:flex flex-col bg-white border-r border-[#E2E8F0] transition-all duration-300 h-screen sticky top-0 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent />
        <button
          id="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-[#E2E8F0] rounded-full flex items-center justify-center shadow-sm hover:bg-[#F1F5F9] transition"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight size={12} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="font-heading font-bold text-sm text-[#0A2558]">Admin Panel</span>
        </div>
        <button
          id="mobile-sidebar-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-[#F1F5F9] transition"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col" onClick={(e) => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
