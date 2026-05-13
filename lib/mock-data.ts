// Mock data for tickets and reports

export type TicketStatus = 'DITERIMA' | 'DIVERIFIKASI' | 'DIPROSES' | 'SELESAI' | 'DITOLAK'
export type ReportCategory =
  | 'Penyuapan/Gratifikasi'
  | 'Penipuan/Kecurangan'
  | 'Pelecehan/Kekerasan'
  | 'Konflik Kepentingan'
  | 'Pelanggaran Prosedur'
  | 'Korupsi'
  | 'Lainnya'

export type UrgencyLevel = 'RENDAH' | 'SEDANG' | 'TINGGI' | 'KRITIS'

export interface Declaration {
  id: string
  ticketId: string
  type: 'deklarasi'
  nama: string
  nip: string
  jabatan: string
  unit: string
  createdAt: string
  status: TicketStatus
  urgency: UrgencyLevel
  keterangan?: string
  timeline: { status: TicketStatus; label: string; date: string; note?: string }[]
}

export interface WbsReport {
  id: string
  ticketId: string
  type: 'laporan'
  category: ReportCategory
  title: string
  description: string
  eventDate: string
  location?: string
  createdAt: string
  status: TicketStatus
  urgency: UrgencyLevel
  filesCount: number
  timeline: { status: TicketStatus; label: string; date: string; note?: string }[]
}

export type Ticket = Declaration | WbsReport

export const MOCK_DECLARATIONS: Declaration[] = [
  {
    id: 'd1',
    ticketId: 'DKL-2025-00001',
    type: 'deklarasi',
    nama: 'Budi Santoso',
    nip: '198501012010011001',
    jabatan: 'Kepala Bidang',
    unit: 'Biro Perencanaan',
    createdAt: '2025-11-10T08:30:00Z',
    status: 'SELESAI',
    urgency: 'RENDAH',
    keterangan: 'Deklarasi benturan kepentingan terkait pengadaan barang',
    timeline: [
      { status: 'DITERIMA', label: 'Laporan Diterima', date: '2025-11-10T08:30:00Z', note: 'Sistem menerima deklarasi Anda.' },
      { status: 'DIVERIFIKASI', label: 'Sedang Diverifikasi', date: '2025-11-11T10:00:00Z', note: 'Tim integritas memverifikasi data.' },
      { status: 'DIPROSES', label: 'Sedang Diproses', date: '2025-11-14T14:00:00Z', note: 'Proses kajian dokumen.' },
      { status: 'SELESAI', label: 'Selesai', date: '2025-11-20T09:00:00Z', note: 'Deklarasi diterima dan dicatat.' },
    ],
  },
  {
    id: 'd2',
    ticketId: 'DKL-2025-00002',
    type: 'deklarasi',
    nama: 'Siti Rahayu',
    nip: '199001012015012002',
    jabatan: 'Staf Ahli',
    unit: 'Ditjen PHI & JSK',
    createdAt: '2025-11-15T09:00:00Z',
    status: 'DIPROSES',
    urgency: 'SEDANG',
    timeline: [
      { status: 'DITERIMA', label: 'Laporan Diterima', date: '2025-11-15T09:00:00Z' },
      { status: 'DIVERIFIKASI', label: 'Sedang Diverifikasi', date: '2025-11-16T11:00:00Z' },
      { status: 'DIPROSES', label: 'Sedang Diproses', date: '2025-11-19T13:00:00Z' },
    ],
  },
]

export const MOCK_REPORTS: WbsReport[] = [
  {
    id: 'r1',
    ticketId: 'WBS-2025-00001',
    type: 'laporan',
    category: 'Penyuapan/Gratifikasi',
    title: 'Dugaan penerimaan gratifikasi dalam proses seleksi CPNS',
    description: 'Ditemukan indikasi permintaan sejumlah uang kepada peserta seleksi CPNS.',
    eventDate: '2025-10-25',
    location: 'Kantor Pusat Jakarta',
    createdAt: '2025-11-01T14:00:00Z',
    status: 'DIPROSES',
    urgency: 'KRITIS',
    filesCount: 3,
    timeline: [
      { status: 'DITERIMA', label: 'Laporan Diterima', date: '2025-11-01T14:00:00Z' },
      { status: 'DIVERIFIKASI', label: 'Sedang Diverifikasi', date: '2025-11-02T10:00:00Z' },
      { status: 'DIPROSES', label: 'Sedang Diproses', date: '2025-11-05T08:00:00Z', note: 'Investigasi oleh Inspektorat.' },
    ],
  },
  {
    id: 'r2',
    ticketId: 'WBS-2025-00002',
    type: 'laporan',
    category: 'Pelanggaran Prosedur',
    title: 'Pengadaan barang tanpa tender resmi',
    description: 'Pengadaan alat kantor senilai > Rp 200jt dilakukan tanpa proses tender.',
    eventDate: '2025-10-10',
    createdAt: '2025-10-20T10:00:00Z',
    status: 'SELESAI',
    urgency: 'TINGGI',
    filesCount: 1,
    timeline: [
      { status: 'DITERIMA', label: 'Laporan Diterima', date: '2025-10-20T10:00:00Z' },
      { status: 'DIVERIFIKASI', label: 'Sedang Diverifikasi', date: '2025-10-21T09:00:00Z' },
      { status: 'DIPROSES', label: 'Sedang Diproses', date: '2025-10-24T13:00:00Z' },
      { status: 'SELESAI', label: 'Selesai', date: '2025-11-08T11:00:00Z', note: 'Tindakan koreksi telah diambil.' },
    ],
  },
  {
    id: 'r3',
    ticketId: 'WBS-2025-00003',
    type: 'laporan',
    category: 'Pelecehan/Kekerasan',
    title: 'Laporan pelecehan verbal di lingkungan kerja',
    description: 'Adanya kejadian pelecehan verbal dari pimpinan kepada staf.',
    eventDate: '2025-11-08',
    createdAt: '2025-11-09T16:00:00Z',
    status: 'DIVERIFIKASI',
    urgency: 'TINGGI',
    filesCount: 0,
    timeline: [
      { status: 'DITERIMA', label: 'Laporan Diterima', date: '2025-11-09T16:00:00Z' },
      { status: 'DIVERIFIKASI', label: 'Sedang Diverifikasi', date: '2025-11-10T08:00:00Z' },
    ],
  },
]

export const ALL_TICKETS: Ticket[] = [...MOCK_DECLARATIONS, ...MOCK_REPORTS]

export function findTicket(ticketId: string): Ticket | undefined {
  return ALL_TICKETS.find(
    (t) => t.ticketId.toLowerCase() === ticketId.toLowerCase()
  )
}

export function getStatusLabel(status: TicketStatus): string {
  const labels: Record<TicketStatus, string> = {
    DITERIMA: 'Diterima',
    DIVERIFIKASI: 'Diverifikasi',
    DIPROSES: 'Diproses',
    SELESAI: 'Selesai',
    DITOLAK: 'Ditolak',
  }
  return labels[status]
}

export function getStatusColor(status: TicketStatus): string {
  const colors: Record<TicketStatus, string> = {
    DITERIMA: 'badge-info',
    DIVERIFIKASI: 'badge-warning',
    DIPROSES: 'badge-orange',
    SELESAI: 'badge-success',
    DITOLAK: 'badge-danger',
  }
  return colors[status]
}

export function getUrgencyColor(urgency: UrgencyLevel): string {
  const colors: Record<UrgencyLevel, string> = {
    RENDAH: 'badge-info',
    SEDANG: 'badge-warning',
    TINGGI: 'badge-orange',
    KRITIS: 'badge-danger',
  }
  return colors[urgency]
}

export function getStatusDotColor(status: TicketStatus): string {
  const colors: Record<TicketStatus, string> = {
    DITERIMA: 'bg-blue-500',
    DIVERIFIKASI: 'bg-yellow-500',
    DIPROSES: 'bg-orange-500',
    SELESAI: 'bg-green-500',
    DITOLAK: 'bg-red-500',
  }
  return colors[status]
}
