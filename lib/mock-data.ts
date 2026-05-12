// Helper functions for ticket display (used across components)
// Types are sourced from supabase-service.ts as single source of truth

import type { TicketStatus, UrgencyLevel } from './supabase-service'

export type { TicketStatus, UrgencyLevel }

export type ReportCategory =
  | 'Penyuapan/Gratifikasi'
  | 'Penipuan/Kecurangan'
  | 'Pelecehan/Kekerasan'
  | 'Konflik Kepentingan'
  | 'Pelanggaran Prosedur'
  | 'Korupsi'
  | 'Lainnya'

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

export function getUrgencyLabel(urgency: UrgencyLevel): string {
  const labels: Record<UrgencyLevel, string> = {
    RENDAH: 'Rendah',
    SEDANG: 'Sedang',
    TINGGI: 'Tinggi',
    KRITIS: 'Kritis',
  }
  return labels[urgency]
}
