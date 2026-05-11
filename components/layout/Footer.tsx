import Link from 'next/link'
import { Shield, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0A2558] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Shield size={18} className="text-white" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm leading-none">Portal Integritas</p>
                <p className="text-xs text-blue-200 leading-none mt-0.5">Kementerian Ketenagakerjaan RI</p>
              </div>
            </div>
            <p className="text-sm text-blue-200 leading-relaxed">
              Platform resmi untuk deklarasi keterpaksaan, benturan kepentingan, dan pelaporan pelanggaran secara anonim.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-blue-300 mb-4">Layanan</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/deklarasi', label: 'Buat Deklarasi' },
                { href: '/lapor', label: 'Lapor Pelanggaran' },
                { href: '/cek-tiket', label: 'Cek Status Tiket' },
                { href: '/admin/login', label: 'Portal Admin' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-200 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-blue-300 mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-blue-200">
                <MapPin size={15} className="mt-0.5 shrink-0" />
                Jl. Jend. Gatot Subroto Kav. 51, Jakarta Selatan 12950
              </li>
              <li className="flex items-center gap-2.5 text-sm text-blue-200">
                <Phone size={15} className="shrink-0" />
                (021) 520-3939
              </li>
              <li className="flex items-center gap-2.5 text-sm text-blue-200">
                <Mail size={15} className="shrink-0" />
                integritas@kemnaker.go.id
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-300">
          <p>© 2025 Kementerian Ketenagakerjaan Republik Indonesia. Hak cipta dilindungi.</p>
          <p>Sistem ini dijamin kerahasiaannya sesuai peraturan yang berlaku.</p>
        </div>
      </div>
    </footer>
  )
}
