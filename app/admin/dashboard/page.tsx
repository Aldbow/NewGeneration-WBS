'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminStore } from '@/store/useAdminStore'
import Sidebar from '@/components/admin/Sidebar'
import StatsGrid from '@/components/admin/StatsGrid'
import DataTable from '@/components/admin/DataTable'
import DetailDrawer from '@/components/admin/DetailDrawer'

export default function AdminDashboardPage() {
  const router = useRouter()
  const {
    isAuthenticated,
    declarations,
    reports,
    allTickets,
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

  if (!isAuthenticated) return null

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
          <div className="flex items-center gap-2">
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
          {/* Stats */}
          <StatsGrid declarations={declarations} reports={reports} />

          {/* Table */}
          <DataTable
            tickets={allTickets}
            onSelect={(t) => setSelectedTicket(t)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onFilterType={setFilterType}
          />
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
