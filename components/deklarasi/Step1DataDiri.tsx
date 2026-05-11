'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Hash, Briefcase, Building2, AlertCircle } from 'lucide-react'

const schema = z.object({
  nama: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  nip: z.string().min(8, 'NIP/NIK minimal 8 karakter').max(20, 'NIP/NIK maksimal 20 karakter'),
  jabatan: z.string().min(2, 'Jabatan tidak boleh kosong'),
  unit: z.string().min(2, 'Unit/Satuan kerja tidak boleh kosong'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  noHp: z.string().min(8, 'Nomor HP minimal 8 digit').optional().or(z.literal('')),
})

export type Step1Data = z.infer<typeof schema>

interface Step1Props {
  defaultValues?: Partial<Step1Data>
  onNext: (data: Step1Data) => void
}

const fields: {
  name: keyof Step1Data
  label: string
  placeholder: string
  icon: React.ElementType
  type?: string
  required?: boolean
}[] = [
  { name: 'nama', label: 'Nama Lengkap', placeholder: 'Masukkan nama lengkap Anda', icon: User, required: true },
  { name: 'nip', label: 'NIP / NIK', placeholder: 'Masukkan NIP atau NIK Anda', icon: Hash, required: true },
  { name: 'jabatan', label: 'Jabatan', placeholder: 'Jabatan saat ini', icon: Briefcase, required: true },
  { name: 'unit', label: 'Unit / Satuan Kerja', placeholder: 'Nama unit atau satuan kerja', icon: Building2, required: true },
  { name: 'email', label: 'Email (Opsional)', placeholder: 'alamat@email.com', icon: User, type: 'email' },
  { name: 'noHp', label: 'No. HP (Opsional)', placeholder: '08xxxxxxxx', icon: Hash, type: 'tel' },
]

export default function Step1DataDiri({ defaultValues, onNext }: Step1Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  return (
    <form id="form-step1" onSubmit={handleSubmit(onNext)} noValidate>
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-[#1E293B] mb-1">Data Diri Anda</h2>
        <p className="text-[#475569] text-sm">
          Data ini digunakan untuk keperluan administrasi resmi dan tidak dibagikan kepada pihak yang tidak berkepentingan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {fields.map(({ name, label, placeholder, icon: Icon, type, required }) => (
          <div key={name} className={name === 'nama' || name === 'unit' ? 'sm:col-span-2' : ''}>
            <label htmlFor={`field-${name}`} className="form-label">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <Icon
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                aria-hidden="true"
              />
              <input
                id={`field-${name}`}
                type={type || 'text'}
                placeholder={placeholder}
                {...register(name)}
                className={`form-input pl-10 ${errors[name] ? 'error' : ''}`}
                aria-invalid={!!errors[name]}
                aria-describedby={errors[name] ? `error-${name}` : undefined}
              />
            </div>
            {errors[name] && (
              <p id={`error-${name}`} className="form-error" role="alert">
                <AlertCircle size={13} aria-hidden="true" />
                {errors[name]?.message}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button id="step1-next-btn" type="submit" className="btn btn-primary px-8">
          Lanjut →
        </button>
      </div>
    </form>
  )
}
