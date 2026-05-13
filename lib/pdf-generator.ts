import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { TicketWithDetails } from './supabase-service'
import { supabase } from './supabase'

export const generateDeclarationPdf = async (ticket: TicketWithDetails) => {
  const doc = new jsPDF()

  // Fonts and colors
  doc.setFont('helvetica')
  
  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('FORMULIR DEKLARASI KETERPAKSAAN', 105, 20, { align: 'center' })
  
  // Ticket info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`ID Tiket: ${ticket.ticketId}`, 14, 30)
  doc.text(`Tanggal: ${new Date(ticket.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 35)

  // Section 1: Data Diri
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('I. DATA DIRI', 14, 45)

  autoTable(doc, {
    startY: 50,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold' }, 1: { cellWidth: 5 }, 2: { cellWidth: 'auto' } },
    body: [
      ['Nama', ':', ticket.nama || '-'],
      ['NIP/NIK', ':', ticket.nip || '-'],
      ['Jabatan', ':', ticket.jabatan || '-'],
      ['Unit Kerja', ':', ticket.unit || '-'],
      ['Email', ':', ticket.email || '-'],
      ['No. HP', ':', ticket.noHp || '-'],
    ],
  })

  // Section 2: Kuesioner
  const finalYDataDiri = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('II. PERNYATAAN BENTURAN KEPENTINGAN', 14, finalYDataDiri)

  const questions = [
    { q: 'Apakah Anda memiliki hubungan keluarga/afiliasi dengan pihak terkait?', a: ticket.q1 },
    { q: 'Apakah Anda memiliki kepentingan finansial langsung/tidak langsung?', a: ticket.q2 },
    { q: 'Apakah Anda pernah menerima/menjanjikan hadiah/fasilitas?', a: ticket.q3 },
    { q: 'Apakah ada tekanan atau paksaan dari pihak mana pun?', a: ticket.q4 },
    { q: 'Apakah semua informasi yang diberikan benar dan akurat?', a: ticket.q5 },
  ]

  autoTable(doc, {
    startY: finalYDataDiri + 5,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 30, halign: 'center' } },
    head: [['No', 'Pertanyaan', 'Jawaban']],
    body: questions.map((item, index) => [
      (index + 1).toString(),
      item.q,
      item.a?.toUpperCase() || '-'
    ]),
  })

  const finalYKuesioner = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5

  if (ticket.keteranganLain) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Keterangan Tambahan:', 14, finalYKuesioner + 5)
    doc.setFont('helvetica', 'normal')
    
    // Auto wrap text
    const splitText = doc.splitTextToSize(ticket.keteranganLain, 180)
    doc.text(splitText, 14, finalYKuesioner + 10)
  }

  // Calculate position for signature
  const signatureY = ticket.keteranganLain ? finalYKuesioner + 30 : finalYKuesioner + 20

  // Section 3: Pengesahan
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('III. PENGESAHAN', 14, signatureY)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const statement = 'Dengan ini saya menyatakan bahwa data yang saya berikan adalah benar dan saya menyetujui seluruh ketentuan yang berlaku. Deklarasi ini dibuat dengan sebenar-benarnya tanpa ada paksaan dari pihak manapun selain yang mungkin telah saya sebutkan di atas.'
  const splitStatement = doc.splitTextToSize(statement, 180)
  doc.text(splitStatement, 14, signatureY + 5)

  const sigLabelY = signatureY + 25
  doc.text('Yang Menyatakan,', 140, sigLabelY, { align: 'center' })

  // Process Signature Image if exists
  if (ticket.signaturePath) {
    try {
      const { data: blob, error } = await supabase.storage.from('signatures').download(ticket.signaturePath)
      
      if (error) throw error
      if (blob) {
        // Convert blob to base64
        const base64data = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.readAsDataURL(blob)
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
        })

        // Add image (x, y, width, height)
        doc.addImage(base64data, 'PNG', 115, sigLabelY + 5, 50, 20)
      }
    } catch (error) {
      console.error('Error fetching signature for PDF:', error)
      doc.setFont('helvetica', 'italic')
      doc.text('(Tanda Tangan Tidak Tersedia)', 140, sigLabelY + 15, { align: 'center' })
    }
  }

  // Name under signature
  doc.setFont('helvetica', 'bold')
  doc.text(ticket.nama || 'Pelapor', 140, sigLabelY + 30, { align: 'center' })

  // Open the PDF in a new tab for full preview
  const pdfBlob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  window.open(pdfUrl, '_blank')
}
