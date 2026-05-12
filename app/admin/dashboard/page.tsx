'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminStore } from '@/store/useAdminStore'
import Sidebar from '@/components/admin/Sidebar'
import StatsGrid from '@/components/admin/StatsGrid'
import DataTable from '@/components/admin/DataTable'
import DetailDrawer from '@/components/admin/DetailDrawer'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

export default function AdminDashboardPage() {
  const router = useRouter()
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

  if (!isAuthenticated) return null

  // Separate declarations and reports for StatsGrid
  const declarations = tickets.filter((t) => t.type === 'deklarasi')
  const reports = tickets.filter((t) => t.type === 'laporan')

  return (
    <div id="admin-dashboard" className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 lg:mt-0 mt-14">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-heading font-bold text-[#1E293B]">Dashboard Admin</h1>
            <p className="text-xs text-[#94A3B8]">Portal Integritas — Kemnaker RI</p>
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
        </header>

        {/* Content */}
        <main id="dashboard-main" className="flex-1 p-4 sm:p-6">
          {/* Loading State */}
          {isLoading && tickets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 size={40} className="text-[#0A2558] animate-spin mb-4" />
              <p className="text-[#475569]">Memuat data dari database...</p>
            </div>
          )}

          {/* Error State */}
          {fetchError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3" role="alert">
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
            </div>
          )}

          {/* Stats & Table */}
          {(!isLoading || tickets.length > 0) && (
            <>
              {/* Stats */}
              <StatsGrid declarations={declarations} reports={reports} />

              {/* Table */}
              <DataTable
                tickets={tickets}
                onSelect={(t) => setSelectedTicket(t)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterType={filterType}
                onFilterType={setFilterType}
              />
            </>
          )}
        </main>
      </div>

      {/* Detail Drawer */}
      {selectedTicket && (
        <DetailDrawer
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  )
}
