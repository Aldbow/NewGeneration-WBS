import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Portal Integritas | Sistem Deklarasi & Whistleblowing',
  description:
    'Platform resmi untuk Deklarasi Keterpaksaan, Benturan Kepentingan, dan Pelaporan Pelanggaran (Whistleblowing System) secara anonim.',
  keywords: ['deklarasi', 'whistleblowing', 'pelaporan pelanggaran', 'integritas', 'kemnaker'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}

