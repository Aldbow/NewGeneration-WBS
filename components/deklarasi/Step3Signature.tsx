'use client'

import { useRef, useState, useEffect } from 'react'
import { Trash2, Pen, AlertCircle } from 'lucide-react'

export interface SignatureData {
  signatureDataUrl: string
  agreed: boolean
}

interface Step3Props {
  onNext: (data: SignatureData) => void
  onBack: () => void
  userName?: string
}

const DECLARATION_TEXT = `Saya yang bertanda tangan di bawah ini menyatakan dengan sesungguhnya bahwa:

1. Seluruh informasi dan jawaban yang saya berikan dalam formulir deklarasi ini adalah benar, jujur, dan dapat dipertanggungjawabkan.
2. Saya memahami bahwa deklarasi ini dibuat dalam rangka pemenuhan kewajiban integritas sebagaimana diatur dalam peraturan perundang-undangan yang berlaku.
3. Apabila dikemudian hari terbukti bahwa pernyataan ini tidak benar, saya bersedia menerima sanksi sesuai ketentuan yang berlaku.`

export default function Step3Signature({ onNext, onBack, userName }: Step3Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)
    ctx.strokeStyle = '#0A2558'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      setIsDrawing(true)
      setHasSignature(true)
      const pos = getPos(e, canvas)
      ctx.beginPath()
      ctx.moveTo(pos.x / 2, pos.y / 2)
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return
      e.preventDefault()
      const pos = getPos(e, canvas)
      ctx.lineTo(pos.x / 2, pos.y / 2)
      ctx.stroke()
    }

    const end = () => setIsDrawing(false)

    canvas.addEventListener('mousedown', start)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', end)
    canvas.addEventListener('mouseleave', end)
    canvas.addEventListener('touchstart', start, { passive: false })
    canvas.addEventListener('touchmove', draw, { passive: false })
    canvas.addEventListener('touchend', end)

    return () => {
      canvas.removeEventListener('mousedown', start)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', end)
      canvas.removeEventListener('mouseleave', end)
      canvas.removeEventListener('touchstart', start)
      canvas.removeEventListener('touchmove', draw)
      canvas.removeEventListener('touchend', end)
    }
  }, [isDrawing])

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleSubmit = () => {
    if (!hasSignature) {
      setError('Harap berikan tanda tangan Anda di area yang tersedia.')
      return
    }
    if (!agreed) {
      setError('Harap centang pernyataan persetujuan sebelum melanjutkan.')
      return
    }
    setError('')
    const dataUrl = canvasRef.current?.toDataURL('image/png') || ''
    onNext({ signatureDataUrl: dataUrl, agreed })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-[#1E293B] mb-1">Pernyataan & Tanda Tangan</h2>
        <p className="text-[#475569] text-sm">Baca pernyataan berikut dan berikan tanda tangan digital Anda.</p>
      </div>

      {/* Declaration Text */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 mb-6">
        <p className="text-xs font-heading font-semibold text-[#475569] uppercase tracking-wider mb-3">
          Surat Pernyataan
        </p>
        {userName && (
          <p className="font-semibold text-[#1E293B] mb-3">Yang bertanda tangan: <span className="text-[#0A2558]">{userName}</span></p>
        )}
        <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-line">{DECLARATION_TEXT}</p>
      </div>

      {/* Signature Canvas */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="form-label flex items-center gap-2 mb-0">
            <Pen size={15} />
            Tanda Tangan Digital <span className="text-red-500">*</span>
          </label>
          <button
            id="clear-signature-btn"
            type="button"
            onClick={clearSignature}
            className="flex items-center gap-1.5 text-xs text-[#475569] hover:text-red-500 transition-colors"
            aria-label="Hapus tanda tangan"
          >
            <Trash2 size={13} />
            Hapus
          </button>
        </div>
        <div className="relative h-36 sm:h-48 rounded-2xl overflow-hidden border-2 border-dashed border-[#CBD5E1] bg-white">
          <canvas
            ref={canvasRef}
            id="signature-canvas"
            className="w-full h-full cursor-crosshair touch-none"
            aria-label="Area tanda tangan digital"
          />
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[#CBD5E1] text-sm">
              <div className="text-center">
                <Pen size={24} className="mx-auto mb-2 opacity-40" />
                <p>Gambar tanda tangan Anda di sini</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agreement Checkbox */}
      <label id="agreement-label" htmlFor="agreed-checkbox" className="flex items-start gap-3 cursor-pointer group">
        <input
          id="agreed-checkbox"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-5 h-5 rounded border-2 border-[#CBD5E1] accent-[#0A2558] cursor-pointer"
          aria-describedby="agreement-text"
        />
        <span id="agreement-text" className="text-sm text-[#475569] group-hover:text-[#1E293B] transition-colors leading-relaxed">
          Saya menyatakan bahwa seluruh informasi yang diberikan adalah benar dan saya bertanggung jawab atas isi deklarasi ini sesuai peraturan yang berlaku.
        </span>
      </label>

      {error && (
        <p className="mt-4 text-sm text-red-600 flex items-center gap-1.5" role="alert">
          <AlertCircle size={13} aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <button id="step3-back-btn" type="button" onClick={onBack} className="btn btn-secondary">
          ← Kembali
        </button>
        <button id="step3-next-btn" type="button" onClick={handleSubmit} className="btn btn-primary px-8">
          Kirim Deklarasi →
        </button>
      </div>
    </div>
  )
}
