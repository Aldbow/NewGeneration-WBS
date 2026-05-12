'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import StepIndicator from '@/components/deklarasi/StepIndicator'
import Step1DataDiri, { Step1Data } from '@/components/deklarasi/Step1DataDiri'
import Step2Kuesioner, { QuestionnaireData } from '@/components/deklarasi/Step2Kuesioner'
import Step3Signature, { SignatureData } from '@/components/deklarasi/Step3Signature'
import Step4Sukses from '@/components/deklarasi/Step4Sukses'
import AnimateIn from '@/components/ui/AnimateIn'
import { submitDeclaration } from '@/lib/supabase-service'

const STEPS = ['Data Diri', 'Kuesioner', 'Tanda Tangan', 'Selesai']

interface FormState {
  step1?: Step1Data
  step2?: QuestionnaireData
  step3?: SignatureData
}

export default function DeklarasiPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormState>({})
  const [ticketId, setTicketId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleStep1 = (data: Step1Data) => {
    setFormData((prev) => ({ ...prev, step1: data }))
    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep2 = (data: QuestionnaireData) => {
    setFormData((prev) => ({ ...prev, step2: data }))
    setCurrentStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep3 = async (data: SignatureData) => {
    setFormData((prev) => ({ ...prev, step3: data }))
    setSubmitting(true)
    setSubmitError('')

    const step1 = formData.step1!
    const step2 = formData.step2!

    const result = await submitDeclaration({
      nama: step1.nama,
      nip: step1.nip,
      jabatan: step1.jabatan,
      unit: step1.unit,
      email: step1.email || undefined,
      noHp: step1.noHp || undefined,
      q1: step2.q1,
      q2: step2.q2,
      q3: step2.q3,
      q4: step2.q4,
      q5: step2.q5,
      keteranganLain: step2.keteranganLain || undefined,
      signatureDataUrl: data.signatureDataUrl,
      agreed: data.agreed,
    })

    setSubmitting(false)

    if (result.error || !result.ticketId) {
      setSubmitError(result.error || 'Gagal mengirim deklarasi. Silakan coba lagi.')
      return
    }

    setTicketId(result.ticketId)
    setCurrentStep(4)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    setFormData({})
    setTicketId('')
    setSubmitError('')
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Header />
      <main id="deklarasi-main" className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">

        {/* ── Page Header ── */}
        <AnimateIn animation="fadeIn" duration={600} threshold={0}>
          <div className="gradient-bg py-12 mb-8 overflow-hidden relative">
            {/* Decorative shapes */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />
            <div className="absolute -bottom-8 left-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />
            <AnimateIn animation="slideDown" delay={100} threshold={0}>
              <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
                <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-3">
                  Form Deklarasi Keterpaksaan
                </h1>
                <p className="text-blue-100 text-base sm:text-lg">
                  Deklarasikan kondisi benturan kepentingan Anda secara resmi dan terlindungi.
                </p>
              </div>
            </AnimateIn>
          </div>
        </AnimateIn>

        {/* ── Form Container ── */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6">

          {/* Step Indicator */}
          {currentStep < 4 && (
            <AnimateIn animation="slideDown" delay={50} duration={500} threshold={0}>
              <div className="card p-5 mb-6">
                <StepIndicator steps={STEPS} currentStep={currentStep} />
              </div>
            </AnimateIn>
          )}

          {/* Submit Error */}
          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 flex items-start gap-2" role="alert">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          {/* Form Steps — each step slides up when it appears */}
          <AnimateIn
            key={currentStep}           /* key forces re-animation on step change */
            animation={currentStep === 4 ? 'scaleUp' : 'slideUp'}
            delay={currentStep === 4 ? 0 : 80}
            duration={currentStep === 4 ? 600 : 500}
            threshold={0}
            className="card p-6 sm:p-8"
          >
            {currentStep === 1 && (
              <Step1DataDiri
                defaultValues={formData.step1}
                onNext={handleStep1}
              />
            )}
            {currentStep === 2 && (
              <Step2Kuesioner
                defaultValues={formData.step2}
                onNext={handleStep2}
                onBack={() => { setCurrentStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              />
            )}
            {currentStep === 3 && (
              <Step3Signature
                onNext={handleStep3}
                onBack={() => { setCurrentStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                userName={formData.step1?.nama}
                isSubmitting={submitting}
              />
            )}
            {currentStep === 4 && ticketId && (
              <Step4Sukses
                ticketId={ticketId}
                nama={formData.step1?.nama || 'Anda'}
                onReset={handleReset}
              />
            )}
          </AnimateIn>

          {/* Privacy Note */}
          {currentStep < 4 && (
            <AnimateIn animation="fadeIn" delay={200} threshold={0}>
              <p className="text-center text-xs text-[#94A3B8] mt-4">
                🔒 Data Anda diproses secara aman dan tidak disimpan di perangkat ini.
              </p>
            </AnimateIn>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
