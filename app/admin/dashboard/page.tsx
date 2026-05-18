'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAdminStore } from '@/store/useAdminStore'
import Sidebar from '@/components/admin/Sidebar'
import StatsGrid from '@/components/admin/StatsGrid'
import DataTable from '@/components/admin/DataTable'
import OverviewCharts from '@/components/admin/OverviewCharts'
import DetailDrawer from '@/components/admin/DetailDrawer'
import { Loader2, AlertCircle, RefreshCw, FileText, AlertTriangle, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  
  const {
    isAuthenticated,
    tickets,
    isLoading,
    fetchError,
    loadTickets,
    selectedTicket,
    setSelectedTicket,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
  } = useAdminStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin/login')
    }
  }, [isAuthenticated, router])

  // Load tickets from database when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTickets()
    }
  }, [isAuthenticated, loadTickets])

  // Sync tab with filterType
  useEffect(() => {
    if (tabParam === 'deklarasi') {
      setFilterType('deklarasi')
    } else if (tabParam === 'laporan') {
      setFilterType('laporan')
    } else {
      setFilterType('all')
    }
  }, [tabParam, setFilterType])

  if (!isAuthenticated) return null

  // Separate declarations and reports for StatsGrid
  const declarations = tickets.filter((t) => t.type === 'deklarasi')
  const reports = tickets.filter((t) => t.type === 'laporan')

  // Dynamic header based on tab
  let title = 'Dashboard Admin'
  let subtitle = 'Portal Integritas — Kemnaker RI'
  let HeaderIcon = LayoutDashboard

  if (tabParam === 'deklarasi') {
    title = 'Data Deklarasi Keterpaksaan'
    subtitle = 'Kelola semua deklarasi keterpaksaan yang masuk'
    HeaderIcon = FileText
  } else if (tabParam === 'laporan') {
    title = 'Data Laporan WBS'
    subtitle = 'Kelola laporan pelanggaran secara anonim'
    HeaderIcon = AlertTriangle
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 lg:mt-0 mt-14 overflow-hidden">
      {/* Top Bar */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between sticky top-0 z-30"
      >
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            <motion.div 
              key={title}
              initial={{ scale: 0.8, opacity: 0, rotate: -90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.3 }}
              className="hidden sm:flex w-10 h-10 rounded-xl bg-[#F8FAFC] items-center justify-center text-[#0A2558] border border-[#E2E8F0]"
            >
              <HeaderIcon size={20} />
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div
              key={title}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-lg font-heading font-bold text-[#1E293B]">{title}</h1>
              <p className="text-xs text-[#94A3B8]">{subtitle}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="refresh-data-btn"
            onClick={() => loadTickets()}
            disabled={isLoading}
            className="p-2 rounded-xl hover:bg-[#F1F5F9] transition text-[#475569] disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-[#1E293B]">Administrator</p>
            <p className="text-xs text-[#94A3B8]">Super Admin</p>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        id="dashboard-main" 
        className="flex-1 p-4 sm:p-6 overflow-y-auto"
      >
        {/* Loading State */}
        {isLoading && tickets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 size={40} className="text-[#0A2558] animate-spin mb-4" />
            <p className="text-[#475569]">Memuat data dari database...</p>
          </div>
        )}

        {/* Error State */}
        {fetchError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3" 
            role="alert"
          >
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Gagal memuat data</p>
              <p className="text-sm text-red-600">{fetchError}</p>
              <button
                onClick={() => loadTickets()}
                className="mt-2 text-sm text-red-700 underline hover:no-underline"
              >
                Coba lagi
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats & Table */}
        {(!isLoading || tickets.length > 0) && (
          <>
            {/* Stats */}
            <StatsGrid declarations={declarations} reports={reports} activeTab={tabParam || 'all'} />

            {/* Content Switcher */}
            {(!tabParam || tabParam === 'all') ? (
              <OverviewCharts tickets={tickets} />
            ) : (
              <DataTable
                tickets={tickets}
                onSelect={(t) => setSelectedTicket(t)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterType={filterType}
                onFilterType={setFilterType}
                activeTab={tabParam}
              />
            )}
          </>
        )}
      </motion.main>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedTicket && (
          <DetailDrawer
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <div id="admin-dashboard" className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-[#0A2558]" /></div>}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
