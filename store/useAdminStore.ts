import { create } from 'zustand'
import { MOCK_DECLARATIONS, MOCK_REPORTS, Declaration, WbsReport, Ticket, TicketStatus } from '@/lib/mock-data'

interface AdminStore {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void

  declarations: Declaration[]
  reports: WbsReport[]
  allTickets: Ticket[]

  selectedTicket: Ticket | null
  setSelectedTicket: (ticket: Ticket | null) => void

  updateTicketStatus: (ticketId: string, status: TicketStatus, note?: string) => void

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
    if (username === 'admin' && password === 'admin123') {
      set({ isAuthenticated: true })
      return true
    }
    return false
  },

  logout: () => set({ isAuthenticated: false }),

  declarations: MOCK_DECLARATIONS,
  reports: MOCK_REPORTS,
  allTickets: [...MOCK_DECLARATIONS, ...MOCK_REPORTS],

  selectedTicket: null,
  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),

  updateTicketStatus: (ticketId, status, note) => {
    const now = new Date().toISOString()
    const labelMap: Record<TicketStatus, string> = {
      DITERIMA: 'Diterima',
      DIVERIFIKASI: 'Diverifikasi',
      DIPROSES: 'Sedang Diproses',
      SELESAI: 'Selesai',
      DITOLAK: 'Ditolak',
    }

    set((state) => {
      const updateTicket = (ticket: Ticket): Ticket => {
        if (ticket.ticketId !== ticketId) return ticket
        const newEntry = { status, label: labelMap[status], date: now, note }
        return {
          ...ticket,
          status,
          timeline: [...ticket.timeline, newEntry],
        }
      }

      const newDeclarations = state.declarations.map((d) => updateTicket(d) as Declaration)
      const newReports = state.reports.map((r) => updateTicket(r) as WbsReport)
      const newAll = [...newDeclarations, ...newReports]

      // Update selected ticket if it matches
      const updatedSelected = state.selectedTicket
        ? updateTicket(state.selectedTicket)
        : null

      return {
        declarations: newDeclarations,
        reports: newReports,
        allTickets: newAll,
        selectedTicket: updatedSelected,
      }
    })
  },

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  filterType: 'all',
  setFilterType: (type) => set({ filterType: type }),

  filterStatus: 'all',
  setFilterStatus: (status) => set({ filterStatus: status }),
}))
