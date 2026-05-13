import { create } from 'zustand'
import {
  fetchAllTickets,
  updateTicketStatusInDb,
  deleteTicketFromDb,
  TicketWithDetails,
  TicketStatus,
} from '@/lib/supabase-service'

export type AdminTab = 'dashboard' | 'deklarasi' | 'laporan'

interface AdminStore {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void

  activeTab: AdminTab
  setActiveTab: (tab: AdminTab) => void

  tickets: TicketWithDetails[]
  isLoading: boolean
  fetchError: string | null
  loadTickets: () => Promise<void>

  selectedTicket: TicketWithDetails | null
  setSelectedTicket: (ticket: TicketWithDetails | null) => void

  updateTicketStatus: (ticketUuid: string, ticketId: string, status: TicketStatus, note?: string) => Promise<boolean>
  deleteTicket: (ticketUuid: string) => Promise<boolean>

  searchQuery: string
  setSearchQuery: (q: string) => void

  filterType: 'all' | 'deklarasi' | 'laporan'
  setFilterType: (type: 'all' | 'deklarasi' | 'laporan') => void

  filterStatus: TicketStatus | 'all'
  setFilterStatus: (status: TicketStatus | 'all') => void
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  isAuthenticated: false,

  login: (username, password) => {
    // Demo authentication — for production, use Supabase Auth
    if (username === 'admin' && password === 'admin123') {
      set({ isAuthenticated: true })
      return true
    }
    return false
  },

  logout: () => set({ isAuthenticated: false, tickets: [], selectedTicket: null, activeTab: 'dashboard' }),

  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab, searchQuery: '', filterStatus: 'all' }),

  tickets: [],
  isLoading: false,
  fetchError: null,

  loadTickets: async () => {
    set({ isLoading: true, fetchError: null })

    const { tickets, error } = await fetchAllTickets()

    if (error) {
      set({ isLoading: false, fetchError: error })
      return
    }

    set({ tickets, isLoading: false })
  },

  selectedTicket: null,
  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),

  updateTicketStatus: async (ticketUuid, ticketId, status, note) => {
    const { success, error } = await updateTicketStatusInDb(ticketUuid, status, note)

    if (!success) {
      console.error('Failed to update ticket status:', error)
      return false
    }

    const now = new Date().toISOString()
    const labelMap: Record<TicketStatus, string> = {
      DITERIMA: 'Diterima',
      DIVERIFIKASI: 'Diverifikasi',
      DIPROSES: 'Sedang Diproses',
      SELESAI: 'Selesai',
      DITOLAK: 'Ditolak',
    }

    // Update local state to reflect the change immediately
    set((state) => {
      const newEntry = { status, label: labelMap[status], date: now, note }

      const updateTicket = (ticket: TicketWithDetails): TicketWithDetails => {
        if (ticket.id !== ticketUuid) return ticket
        return {
          ...ticket,
          status,
          timeline: [...ticket.timeline, newEntry],
        }
      }

      const newTickets = state.tickets.map(updateTicket)
      const updatedSelected = state.selectedTicket
        ? updateTicket(state.selectedTicket)
        : null

      return {
        tickets: newTickets,
        selectedTicket: updatedSelected,
      }
    })

    return true
  },

  deleteTicket: async (ticketUuid) => {
    const { success, error } = await deleteTicketFromDb(ticketUuid)

    if (!success) {
      console.error('Failed to delete ticket:', error)
      return false
    }

    // Remove from local state
    set((state) => ({
      tickets: state.tickets.filter((t) => t.id !== ticketUuid),
      selectedTicket: state.selectedTicket?.id === ticketUuid ? null : state.selectedTicket,
    }))

    return true
  },

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  filterType: 'all',
  setFilterType: (type) => set({ filterType: type }),

  filterStatus: 'all',
  setFilterStatus: (status) => set({ filterStatus: status }),
}))
