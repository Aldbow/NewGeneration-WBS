'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image, Video, AlertCircle, CheckCircle } from 'lucide-react'

interface FileDropzoneProps {
  onFilesChange: (files: File[]) => void
}

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const BLOCKED_EXT = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.scr']

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image
  if (type.startsWith('video/')) return Video
  return FileText
}

export default function FileDropzone({ onFilesChange }: FileDropzoneProps) {
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const addFiles = (newFiles: File[]) => {
    const errs: string[] = []
    const validFiles: File[] = []

    newFiles.forEach((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (BLOCKED_EXT.includes(ext)) {
        errs.push(`"${file.name}" — tipe file ini tidak diizinkan.`)
      } else if (file.size > MAX_SIZE) {
        errs.push(`"${file.name}" — ukuran file melebihi batas 10 MB.`)
      } else {
        validFiles.push(file)
      }
    })

    const updated = [...files, ...validFiles]
    setFiles(updated)
    setErrors(errs)
    onFilesChange(updated)
  }

  const removeFile = (idx: number) => {
    const updated = files.filter((_, i) => i !== idx)
    setFiles(updated)
    onFilesChange(updated)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: addFiles,
    noClick: false,
    multiple: true,
  })

  return (
    <div>
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        id="file-dropzone"
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-[#1D5BBF] bg-blue-50 scale-[1.02]'
            : 'border-[#CBD5E1] hover:border-[#1D5BBF] hover:bg-[#F8FAFC]'
        }`}
        aria-label="Area upload file bukti"
      >
        <input {...getInputProps()} aria-label="Pilih file" />
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all ${
            isDragActive ? 'bg-blue-100' : 'bg-[#F1F5F9]'
          }`}
        >
          <Upload
            size={24}
            className={`transition-colors ${isDragActive ? 'text-[#1D5BBF]' : 'text-[#94A3B8]'}`}
          />
        </div>
        <p className="font-heading font-semibold text-[#1E293B] mb-1">
          {isDragActive ? 'Lepaskan file di sini...' : 'Seret & Lepas file di sini'}
        </p>
        <p className="text-sm text-[#475569] mb-3">atau klik untuk memilih file</p>
        <p className="text-xs text-[#94A3B8]">
          Mendukung: JPG, PNG, PDF, MP4, DOCX • Maks. 10 MB per file
        </p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-3 space-y-1" role="alert">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              {err}
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, idx) => {
            const Icon = getFileIcon(file.type)
            const sizeMB = (file.size / 1024 / 1024).toFixed(1)
            return (
              <div
                key={idx}
                id={`file-item-${idx}`}
                className="flex items-center gap-3 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-[#1D5BBF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1E293B] truncate">{file.name}</p>
                  <p className="text-xs text-[#94A3B8]">{sizeMB} MB</p>
                </div>
                <CheckCircle size={16} className="text-green-500 shrink-0" />
                <button
                  type="button"
                  id={`remove-file-${idx}`}
                  onClick={() => removeFile(idx)}
                  className="p-1 rounded hover:bg-red-50 hover:text-red-500 transition-colors"
                  aria-label={`Hapus file ${file.name}`}
                >
                  <X size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
