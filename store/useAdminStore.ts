import { create } from 'zustand'
import {
  fetchAllTickets,
  updateTicketStatusInDb,
  deleteTicketData,
  TicketWithDetails,
  TicketStatus,
} from '@/lib/supabase-service'

interface AdminStore {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void

  tickets: TicketWithDetails[]
  isLoading: boolean
  fetchError: string | null
  loadTickets: () => Promise<void>

  selectedTicket: TicketWithDetails | null
  setSelectedTicket: (ticket: TicketWithDetails | null) => void

  updateTicketStatus: (ticketUuid: string, ticketId: string, status: TicketStatus, note?: string) => Promise<boolean>
  deleteTicketPermanently: (ticketUuid: string, ticketId: string, type: 'deklarasi' | 'laporan', note?: string) => Promise<boolean>

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

  logout: () => set({ isAuthenticated: false, tickets: [], selectedTicket: null }),

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

  deleteTicketPermanently: async (ticketUuid, ticketId, type, note) => {
    // 1. Update status to DITOLAK with the note to leave a timeline trail
    const statusUpdated = await get().updateTicketStatus(ticketUuid, ticketId, 'DITOLAK', note)
    if (!statusUpdated) return false

    // 2. Hard delete the physical data
    const { success, error } = await deleteTicketData(ticketUuid, type)
    if (!success) {
      console.error('Failed to hard delete ticket data:', error)
      return false
    }

    // 3. Update local state to strip the sensitive fields
    set((state) => {
      const stripTicket = (ticket: TicketWithDetails): TicketWithDetails => {
        if (ticket.id !== ticketUuid) return ticket
        return {
          ...ticket,
          // Strip declaration fields
          nama: undefined,
          nip: undefined,
          jabatan: undefined,
          unit: undefined,
          email: undefined,
          noHp: undefined,
          q1: undefined,
          q2: undefined,
          q3: undefined,
          q4: undefined,
          q5: undefined,
          keteranganLain: undefined,
          signaturePath: undefined,
          isAgreed: undefined,
          // Strip WBS fields
          category: undefined,
          title: undefined,
          description: undefined,
          eventDate: undefined,
          eventTime: undefined,
          location: undefined,
          filesCount: undefined,
        }
      }

      return {
        tickets: state.tickets.map(stripTicket),
        selectedTicket: state.selectedTicket ? stripTicket(state.selectedTicket) : null,
      }
    })

    return true
  },

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  filterType: 'all',
  setFilterType: (type) => set({ filterType: type }),

  filterStatus: 'all',
  setFilterStatus: (status) => set({ filterStatus: status }),
}))
