import { supabase } from './supabase'

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────

export type TicketType = 'DEKLARASI' | 'LAPORAN'
export type TicketStatus = 'DITERIMA' | 'DIVERIFIKASI' | 'DIPROSES' | 'SELESAI' | 'DITOLAK'
export type UrgencyLevel = 'RENDAH' | 'SEDANG' | 'TINGGI' | 'KRITIS'

export interface DbTicket {
  id: string
  ticket_id: string
  type: TicketType
  status: TicketStatus
  urgency: UrgencyLevel
  created_at: string
  updated_at: string
}

export interface DbDeclaration {
  ticket_id: string
  nama: string
  nip: string
  jabatan: string
  unit: string
  email?: string | null
  no_hp?: string | null
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  keterangan_lain?: string | null
  signature_path?: string | null
  is_agreed: boolean
}

export interface DbWbsReport {
  ticket_id: string
  category: string
  title: string
  description: string
  event_date: string
  event_time?: string | null
  location?: string | null
  files_count: number
}

export interface DbTimeline {
  id: string
  ticket_id: string
  status: TicketStatus
  label: string
  note?: string | null
  created_at: string
}

// Frontend-ready types (flattened for display)
export interface TicketWithDetails {
  id: string
  ticketId: string
  type: 'deklarasi' | 'laporan'
  status: TicketStatus
  urgency: UrgencyLevel
  createdAt: string
  updatedAt: string
  timeline: TimelineEntry[]
  // Declaration fields
  nama?: string
  nip?: string
  jabatan?: string
  unit?: string
  email?: string | null
  noHp?: string | null
  q1?: string
  q2?: string
  q3?: string
  q4?: string
  q5?: string
  keteranganLain?: string | null
  signaturePath?: string | null
  isAgreed?: boolean
  // WBS Report fields
  category?: string
  title?: string
  description?: string
  eventDate?: string
  eventTime?: string | null
  location?: string | null
  filesCount?: number
}

export interface TimelineEntry {
  status: TicketStatus
  label: string
  date: string
  note?: string
}

// ──────────────────────────────────────────────
// TICKET ID GENERATION
// ──────────────────────────────────────────────

/**
 * Generate a unique ticket ID with database validation.
 * Format: PREFIX-YYYY-NNNNN
 */
export async function generateUniqueTicketId(prefix: 'DKL' | 'WBS'): Promise<string> {
  const year = new Date().getFullYear()
  const maxAttempts = 10

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const random = Math.floor(10000 + Math.random() * 90000)
    const ticketId = `${prefix}-${year}-${random}`

    // Check uniqueness in database
    const { data, error } = await supabase
      .from('tickets')
      .select('ticket_id')
      .eq('ticket_id', ticketId)
      .maybeSingle()

    if (error) {
      console.error('Error checking ticket ID uniqueness:', error)
      // Fall back to the generated ID
      return ticketId
    }

    if (!data) {
      // ID is unique
      return ticketId
    }
    // ID exists, try again
  }

  // Fallback: use timestamp-based ID
  const ts = Date.now().toString().slice(-5)
  return `${prefix}-${year}-${ts}`
}

// ──────────────────────────────────────────────
// DEKLARASI SUBMISSION
// ──────────────────────────────────────────────

export interface SubmitDeclarationInput {
  nama: string
  nip: string
  jabatan: string
  unit: string
  email?: string
  noHp?: string
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  keteranganLain?: string
  signatureDataUrl?: string
  agreed: boolean
}

export async function submitDeclaration(
  input: SubmitDeclarationInput
): Promise<{ ticketId: string; error?: string }> {
  try {
    // 1. Generate unique ticket ID
    const ticketId = await generateUniqueTicketId('DKL')

    // 2. Insert into tickets table
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        ticket_id: ticketId,
        type: 'DEKLARASI' as TicketType,
        status: 'DITERIMA' as TicketStatus,
        urgency: 'RENDAH' as UrgencyLevel,
      })
      .select('id')
      .single()

    if (ticketError || !ticketData) {
      console.error('Error inserting ticket:', ticketError)
      return { ticketId: '', error: ticketError?.message || 'Gagal membuat tiket' }
    }

    const ticketUuid = ticketData.id

    // 3. Upload signature to Storage (if provided)
    let signaturePath: string | null = null
    if (input.signatureDataUrl) {
      signaturePath = await uploadSignature(ticketUuid, input.signatureDataUrl)
    }

    // 4. Insert into declarations table
    const { error: declError } = await supabase
      .from('declarations')
      .insert({
        ticket_id: ticketUuid,
        nama: input.nama,
        nip: input.nip,
        jabatan: input.jabatan,
        unit: input.unit,
        email: input.email || null,
        no_hp: input.noHp || null,
        q1: input.q1,
        q2: input.q2,
        q3: input.q3,
        q4: input.q4,
        q5: input.q5,
        keterangan_lain: input.keteranganLain || null,
        signature_path: signaturePath,
        is_agreed: input.agreed,
      })

    if (declError) {
      console.error('Error inserting declaration:', declError)
      // Attempt cleanup: delete the ticket we just created
      await supabase.from('tickets').delete().eq('id', ticketUuid)
      return { ticketId: '', error: declError.message || 'Gagal menyimpan deklarasi' }
    }

    return { ticketId }
  } catch (err) {
    console.error('Unexpected error in submitDeclaration:', err)
    return { ticketId: '', error: 'Terjadi kesalahan tidak terduga' }
  }
}

/**
 * Upload signature image (base64 data URL) to Supabase Storage
 */
async function uploadSignature(ticketUuid: string, dataUrl: string): Promise<string | null> {
  try {
    // Convert base64 data URL to Blob
    const response = await fetch(dataUrl)
    const blob = await response.blob()

    const filePath = `${ticketUuid}/signature.png`

    const { error } = await supabase.storage
      .from('signatures')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: true,
      })

    if (error) {
      console.error('Error uploading signature:', error)
      return null
    }

    return filePath
  } catch (err) {
    console.error('Error processing signature upload:', err)
    return null
  }
}

// ──────────────────────────────────────────────
// WBS REPORT SUBMISSION
// ──────────────────────────────────────────────

export interface SubmitWbsReportInput {
  category: string
  title: string
  description: string
  eventDate: string
  eventTime?: string
  location?: string
  files?: File[]
}

export async function submitWbsReport(
  input: SubmitWbsReportInput
): Promise<{ ticketId: string; error?: string }> {
  try {
    // 1. Generate unique ticket ID
    const ticketId = await generateUniqueTicketId('WBS')

    // 2. Determine urgency based on category
    const urgency = determineUrgency(input.category)

    // 3. Insert into tickets table
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        ticket_id: ticketId,
        type: 'LAPORAN' as TicketType,
        status: 'DITERIMA' as TicketStatus,
        urgency,
      })
      .select('id')
      .single()

    if (ticketError || !ticketData) {
      console.error('Error inserting ticket:', ticketError)
      return { ticketId: '', error: ticketError?.message || 'Gagal membuat tiket' }
    }

    const ticketUuid = ticketData.id

    // 4. Upload evidence files (if any)
    const filesCount = input.files?.length || 0
    if (input.files && input.files.length > 0) {
      await uploadEvidenceFiles(ticketUuid, input.files)
    }

    // 5. Insert into wbs_reports table
    const { error: reportError } = await supabase
      .from('wbs_reports')
      .insert({
        ticket_id: ticketUuid,
        category: input.category,
        title: input.title,
        description: input.description,
        event_date: input.eventDate,
        event_time: input.eventTime || null,
        location: input.location || null,
        files_count: filesCount,
      })

    if (reportError) {
      console.error('Error inserting WBS report:', reportError)
      await supabase.from('tickets').delete().eq('id', ticketUuid)
      return { ticketId: '', error: reportError.message || 'Gagal menyimpan laporan' }
    }

    return { ticketId }
  } catch (err) {
    console.error('Unexpected error in submitWbsReport:', err)
    return { ticketId: '', error: 'Terjadi kesalahan tidak terduga' }
  }
}

/**
 * Upload evidence files to Supabase Storage
 */
async function uploadEvidenceFiles(ticketUuid: string, files: File[]): Promise<void> {
  for (const file of files) {
    const filePath = `${ticketUuid}/${file.name}`
    const { error } = await supabase.storage
      .from('wbs-evidence')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      })

    if (error) {
      console.error(`Error uploading file ${file.name}:`, error)
      // Continue with other files even if one fails
    }
  }
}

/**
 * Determine urgency level based on report category
 */
function determineUrgency(category: string): UrgencyLevel {
  const urgencyMap: Record<string, UrgencyLevel> = {
    'Penyuapan/Gratifikasi': 'KRITIS',
    'Korupsi': 'KRITIS',
    'Penipuan/Kecurangan': 'TINGGI',
    'Pelecehan/Kekerasan': 'TINGGI',
    'Konflik Kepentingan': 'SEDANG',
    'Pelanggaran Prosedur': 'SEDANG',
    'Lainnya': 'RENDAH',
  }
  return urgencyMap[category] || 'RENDAH'
}

// ──────────────────────────────────────────────
// TICKET LOOKUP (Cek Tiket)
// ──────────────────────────────────────────────

export async function lookupTicket(
  ticketIdStr: string
): Promise<{ ticket: TicketWithDetails | null; error?: string }> {
  try {
    // 1. Find the ticket
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_id', ticketIdStr.trim().toUpperCase())
      .maybeSingle()

    if (ticketError) {
      console.error('Error looking up ticket:', ticketError)
      return { ticket: null, error: ticketError.message }
    }

    if (!ticketData) {
      return { ticket: null }
    }

    const ticket = ticketData as DbTicket

    // 2. Fetch timeline
    const { data: timelineData } = await supabase
      .from('ticket_timelines')
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true })

    const timeline: TimelineEntry[] = (timelineData || []).map((t: DbTimeline) => ({
      status: t.status,
      label: t.label,
      date: t.created_at,
      note: t.note || undefined,
    }))

    // 3. Fetch detail based on type
    let result: TicketWithDetails = {
      id: ticket.id,
      ticketId: ticket.ticket_id,
      type: ticket.type === 'DEKLARASI' ? 'deklarasi' : 'laporan',
      status: ticket.status,
      urgency: ticket.urgency,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      timeline,
    }

    if (ticket.type === 'DEKLARASI') {
      const { data: declData } = await supabase
        .from('declarations')
        .select('*')
        .eq('ticket_id', ticket.id)
        .maybeSingle()

      if (declData) {
        const decl = declData as DbDeclaration
        result = {
          ...result,
          nama: decl.nama,
          nip: decl.nip,
          jabatan: decl.jabatan,
          unit: decl.unit,
          email: decl.email,
          noHp: decl.no_hp,
          q1: decl.q1,
          q2: decl.q2,
          q3: decl.q3,
          q4: decl.q4,
          q5: decl.q5,
          keteranganLain: decl.keterangan_lain,
          signaturePath: decl.signature_path,
          isAgreed: decl.is_agreed,
        }
      }
    } else {
      const { data: reportData } = await supabase
        .from('wbs_reports')
        .select('*')
        .eq('ticket_id', ticket.id)
        .maybeSingle()

      if (reportData) {
        const report = reportData as DbWbsReport
        result = {
          ...result,
          category: report.category,
          title: report.title,
          description: report.description,
          eventDate: report.event_date,
          eventTime: report.event_time,
          location: report.location,
          filesCount: report.files_count,
        }
      }
    }

    return { ticket: result }
  } catch (err) {
    console.error('Unexpected error in lookupTicket:', err)
    return { ticket: null, error: 'Terjadi kesalahan tidak terduga' }
  }
}

// ──────────────────────────────────────────────
// ADMIN: FETCH ALL TICKETS
// ──────────────────────────────────────────────

export async function fetchAllTickets(): Promise<{
  tickets: TicketWithDetails[]
  error?: string
}> {
  try {
    // 1. Fetch all tickets
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError)
      return { tickets: [], error: ticketsError.message }
    }

    if (!ticketsData || ticketsData.length === 0) {
      return { tickets: [] }
    }

    const tickets = ticketsData as DbTicket[]
    const ticketIds = tickets.map((t) => t.id)

    // 2. Batch fetch all declarations
    const { data: declsData } = await supabase
      .from('declarations')
      .select('*')
      .in('ticket_id', ticketIds)

    const declsMap = new Map<string, DbDeclaration>()
      ; (declsData || []).forEach((d: DbDeclaration) => declsMap.set(d.ticket_id, d))

    // 3. Batch fetch all wbs_reports
    const { data: reportsData } = await supabase
      .from('wbs_reports')
      .select('*')
      .in('ticket_id', ticketIds)

    const reportsMap = new Map<string, DbWbsReport>()
      ; (reportsData || []).forEach((r: DbWbsReport) => reportsMap.set(r.ticket_id, r))

    // 4. Batch fetch all timelines
    const { data: timelinesData } = await supabase
      .from('ticket_timelines')
      .select('*')
      .in('ticket_id', ticketIds)
      .order('created_at', { ascending: true })

    const timelinesMap = new Map<string, TimelineEntry[]>()
      ; (timelinesData || []).forEach((t: DbTimeline) => {
        const list = timelinesMap.get(t.ticket_id) || []
        list.push({
          status: t.status,
          label: t.label,
          date: t.created_at,
          note: t.note || undefined,
        })
        timelinesMap.set(t.ticket_id, list)
      })

    // 5. Assemble results
    const results: TicketWithDetails[] = tickets.map((ticket) => {
      const base: TicketWithDetails = {
        id: ticket.id,
        ticketId: ticket.ticket_id,
        type: ticket.type === 'DEKLARASI' ? 'deklarasi' : 'laporan',
        status: ticket.status,
        urgency: ticket.urgency,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        timeline: timelinesMap.get(ticket.id) || [],
      }

      if (ticket.type === 'DEKLARASI') {
        const decl = declsMap.get(ticket.id)
        if (decl) {
          return {
            ...base,
            nama: decl.nama,
            nip: decl.nip,
            jabatan: decl.jabatan,
            unit: decl.unit,
            email: decl.email,
            noHp: decl.no_hp,
            q1: decl.q1,
            q2: decl.q2,
            q3: decl.q3,
            q4: decl.q4,
            q5: decl.q5,
            keteranganLain: decl.keterangan_lain,
            signaturePath: decl.signature_path,
            isAgreed: decl.is_agreed,
          }
        }
      } else {
        const report = reportsMap.get(ticket.id)
        if (report) {
          return {
            ...base,
            category: report.category,
            title: report.title,
            description: report.description,
            eventDate: report.event_date,
            eventTime: report.event_time,
            location: report.location,
            filesCount: report.files_count,
          }
        }
      }

      return base
    })

    return { tickets: results }
  } catch (err) {
    console.error('Unexpected error in fetchAllTickets:', err)
    return { tickets: [], error: 'Terjadi kesalahan tidak terduga' }
  }
}

// ──────────────────────────────────────────────
// ADMIN: UPDATE TICKET STATUS
// ──────────────────────────────────────────────

export async function updateTicketStatusInDb(
  ticketUuid: string,
  newStatus: TicketStatus,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const labelMap: Record<TicketStatus, string> = {
      DITERIMA: 'Diterima',
      DIVERIFIKASI: 'Diverifikasi',
      DIPROSES: 'Sedang Diproses',
      SELESAI: 'Selesai',
      DITOLAK: 'Ditolak',
    }

    // 1. Update ticket status
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ status: newStatus })
      .eq('id', ticketUuid)

    if (updateError) {
      console.error('Error updating ticket status:', updateError)
      return { success: false, error: updateError.message }
    }

    // 2. Insert timeline entry
    const { error: timelineError } = await supabase
      .from('ticket_timelines')
      .insert({
        ticket_id: ticketUuid,
        status: newStatus,
        label: labelMap[newStatus],
        note: note || null,
      })

    if (timelineError) {
      console.error('Error inserting timeline entry:', timelineError)
      // Status was updated but timeline failed — not critical
      return { success: true, error: 'Status diperbarui, namun catatan timeline gagal disimpan.' }
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error in updateTicketStatus:', err)
    return { success: false, error: 'Terjadi kesalahan tidak terduga' }
  }
}

// ──────────────────────────────────────────────
// ADMIN: DELETE TICKET DATA (HARD DELETE)
// ──────────────────────────────────────────────

export async function deleteTicketData(
  ticketUuid: string,
  type: 'deklarasi' | 'laporan'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (type === 'deklarasi') {
      // Delete signature if exists
      const { data: decl } = await supabase
        .from('declarations')
        .select('signature_path')
        .eq('ticket_id', ticketUuid)
        .maybeSingle()

      if (decl?.signature_path) {
        await supabase.storage.from('signatures').remove([decl.signature_path])
      }

      const { error } = await supabase.from('declarations').delete().eq('ticket_id', ticketUuid)
      if (error) throw error
    } else {
      // Delete evidence files if exists
      const { data: files } = await supabase.storage.from('wbs-evidence').list(ticketUuid)
      if (files && files.length > 0) {
        const filePaths = files.map((f) => `${ticketUuid}/${f.name}`)
        await supabase.storage.from('wbs-evidence').remove(filePaths)
      }

      const { error } = await supabase.from('wbs_reports').delete().eq('ticket_id', ticketUuid)
      if (error) throw error
    }

    return { success: true }
  } catch (err: unknown) {
    console.error('Error deleting ticket physical data:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus data' }
  }
}

// ──────────────────────────────────────────────
// WBS: GET EVIDENCE FILES
// ──────────────────────────────────────────────

export async function getWbsEvidenceFiles(ticketUuid: string): Promise<{ name: string; url: string }[]> {
  try {
    const { data: files, error } = await supabase.storage.from('wbs-evidence').list(ticketUuid)

    if (error || !files || files.length === 0) {
      return []
    }

    const result = []
    for (const file of files) {
      // Skip empty placeholder files that Supabase might create
      if (file.name === '.emptyFolderPlaceholder') continue

      // Generate a signed URL valid for 1 hour (3600 seconds)
      const { data } = await supabase.storage
        .from('wbs-evidence')
        .createSignedUrl(`${ticketUuid}/${file.name}`, 3600)

      if (data?.signedUrl) {
        result.push({ name: file.name, url: data.signedUrl })
      }
    }

    return result
  } catch (err) {
    console.error('Error fetching evidence files:', err)
    return []
  }
}
