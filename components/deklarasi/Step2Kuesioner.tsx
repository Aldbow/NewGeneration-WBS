'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

export interface QuestionnaireData {
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  keteranganLain?: string
}

const questions = [
  {
    id: 'q1',
    question: 'Apakah Anda saat ini memiliki hubungan keluarga atau afiliasi dengan pihak yang terlibat dalam proses pengadaan barang/jasa di unit Anda?',
    options: [
      { value: 'ya', label: 'Ya, terdapat hubungan' },
      { value: 'tidak', label: 'Tidak ada hubungan' },
      { value: 'tidak_yakin', label: 'Tidak yakin / Perlu dikaji' },
    ],
  },
  {
    id: 'q2',
    question: 'Apakah Anda memiliki kepentingan finansial (saham, investasi, atau kepemilikan) pada perusahaan yang menjadi mitra/vendor instansi?',
    options: [
      { value: 'ya', label: 'Ya, memiliki kepentingan' },
      { value: 'tidak', label: 'Tidak ada' },
      { value: 'tidak_yakin', label: 'Tidak yakin' },
    ],
  },
  {
    id: 'q3',
    question: 'Apakah dalam 1 tahun terakhir Anda menerima hadiah, fasilitas, atau keuntungan lain dari pihak ketiga yang memiliki hubungan dengan pekerjaan Anda?',
    options: [
      { value: 'ya', label: 'Ya, pernah menerima' },
      { value: 'tidak', label: 'Tidak pernah' },
      { value: 'tidak_relevan', label: 'Tidak relevan dengan situasi saya' },
    ],
  },
  {
    id: 'q4',
    question: 'Apakah Anda saat ini sedang menghadapi tekanan atau paksaan dari pihak manapun yang berkaitan dengan pelaksanaan tugas Anda?',
    options: [
      { value: 'ya', label: 'Ya, sedang menghadapi tekanan' },
      { value: 'tidak', label: 'Tidak ada tekanan' },
      { value: 'pernah', label: 'Pernah, namun sudah selesai' },
    ],
  },
  {
    id: 'q5',
    question: 'Dengan penuh kesadaran, apakah Anda menyatakan bahwa seluruh jawaban di atas adalah benar dan dapat dipertanggungjawabkan?',
    options: [
      { value: 'ya', label: 'Ya, saya menyatakan dengan benar' },
      { value: 'tidak', label: 'Tidak, perlu koreksi' },
    ],
  },
]

interface Step2Props {
  defaultValues?: Partial<QuestionnaireData>
  onNext: (data: QuestionnaireData) => void
  onBack: () => void
}

export default function Step2Kuesioner({ defaultValues, onNext, onBack }: Step2Props) {
  const [answers, setAnswers] = useState<Partial<QuestionnaireData>>(defaultValues || {})
  const [error, setError] = useState('')

  const allAnswered = questions.every((q) => answers[q.id as keyof QuestionnaireData])

  const handleSubmit = () => {
    if (!allAnswered) {
      setError('Harap jawab semua pertanyaan sebelum melanjutkan.')
      return
    }
    setError('')
    onNext(answers as QuestionnaireData)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-[#1E293B] mb-1">Kuesioner Deklarasi</h2>
        <p className="text-[#475569] text-sm">
          Jawab setiap pertanyaan dengan jujur. Semua jawaban bersifat rahasia.
        </p>
      </div>

      <div className="space-y-6" role="group" aria-label="Pertanyaan kuesioner">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            id={`question-${q.id}`}
            className="card p-5"
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="flex w-6 h-6 rounded-full bg-[#0A2558] text-white text-xs items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="font-heading font-semibold text-[#1E293B] text-sm leading-relaxed">
                {q.question}
              </p>
            </div>
            <div className="space-y-2" role="radiogroup">
              {q.options.map((opt) => {
                const selected = answers[q.id as keyof QuestionnaireData] === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    id={`${q.id}-${opt.value}`}
                    role="radio"
                    aria-checked={selected}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-all duration-200 ${
                      selected
                        ? 'border-[#0A2558] bg-[#EFF6FF] text-[#0A2558]'
                        : 'border-[#E2E8F0] hover:border-[#93C5FD] hover:bg-[#F8FAFC] text-[#475569]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        selected ? 'border-[#0A2558] bg-[#0A2558]' : 'border-[#CBD5E1]'
                      }`}
                    >
                      {selected && <CheckCircle size={12} className="text-white" />}
                    </div>
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Additional notes */}
        <div className="card p-5">
          <label htmlFor="keteranganLain" className="form-label">
            Keterangan Tambahan (Opsional)
          </label>
          <textarea
            id="keteranganLain"
            rows={3}
            placeholder="Jika ada situasi spesifik yang ingin Anda jelaskan..."
            value={answers.keteranganLain || ''}
            onChange={(e) => setAnswers((prev) => ({ ...prev, keteranganLain: e.target.value }))}
            className="form-input resize-none"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 flex items-center gap-1.5" role="alert">
          ⚠ {error}
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <button id="step2-back-btn" type="button" onClick={onBack} className="btn btn-secondary">
          ← Kembali
        </button>
        <button
          id="step2-next-btn"
          type="button"
          onClick={handleSubmit}
          className={`btn btn-primary px-8 ${!allAnswered ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          Lanjut →
        </button>
      </div>
    </div>
  )
}
