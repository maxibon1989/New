import Link from 'next/link';
import { Eye, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-white">Office</span>
                <span className="font-bold text-xl text-blue-400">Oracle</span>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Full transparens på kontorsmarknaden. Hitta ditt nästa kontor med insikter du aldrig sett förut.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* Links - Tjänster */}
          <div>
            <h4 className="font-semibold text-white mb-4">Tjänster</h4>
            <ul className="space-y-2">
              <li><Link href="/search" className="hover:text-blue-400 transition-colors">Sök lokaler</Link></li>
              <li><Link href="/rent-index" className="hover:text-blue-400 transition-colors">Hyresindex</Link></li>
              <li><Link href="/valuation" className="hover:text-blue-400 transition-colors">Värderingsverktyg</Link></li>
              <li><Link href="/market-reports" className="hover:text-blue-400 transition-colors">Marknadsrapporter</Link></li>
            </ul>
          </div>

          {/* Links - Fastighetsägare */}
          <div>
            <h4 className="font-semibold text-white mb-4">Fastighetsägare</h4>
            <ul className="space-y-2">
              <li><Link href="/list-property" className="hover:text-blue-400 transition-colors">Annonsera lokal</Link></li>
              <li><Link href="/owner-dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link></li>
              <li><Link href="/premium" className="hover:text-blue-400 transition-colors">Premium-data</Link></li>
              <li><Link href="/api" className="hover:text-blue-400 transition-colors">API-åtkomst</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Kontakt</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <a href="mailto:hej@officeoracle.se" className="hover:text-blue-400 transition-colors">
                  hej@officeoracle.se
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <a href="tel:+46812345678" className="hover:text-blue-400 transition-colors">
                  08-123 456 78
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 mt-1" />
                <span>Sveavägen 42<br />111 34 Stockholm</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Office Oracle. Alla rättigheter förbehållna.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-slate-500 hover:text-blue-400 transition-colors">
              Integritetspolicy
            </Link>
            <Link href="/terms" className="text-slate-500 hover:text-blue-400 transition-colors">
              Villkor
            </Link>
            <Link href="/cookies" className="text-slate-500 hover:text-blue-400 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
