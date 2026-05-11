/**
 * Generate a unique ticket ID
 * Format: PREFIX-YYYY-NNNNN
 */
export function generateTicketId(prefix: 'DKL' | 'WBS'): string {
  const year = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `${prefix}-${year}-${random}`
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateShort(isoString: string): string {
  return new Date(isoString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
