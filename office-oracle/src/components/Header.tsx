'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Building2,
  Search,
  TrendingUp,
  Menu,
  X,
  ChevronDown,
  Eye
} from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl text-slate-900">Office</span>
              <span className="font-bold text-xl text-blue-600">Oracle</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/search"
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Sök lokaler</span>
            </Link>

            <Link
              href="/rent-index"
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Hyresindex</span>
            </Link>

            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Building2 className="w-4 h-4" />
                <span>För fastighetsägare</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2">
                  <Link href="/list-property" className="block px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    Annonsera lokal
                  </Link>
                  <Link href="/owner-dashboard" className="block px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/market-reports" className="block px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    Marknadsrapporter
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-slate-600 hover:text-blue-600 transition-colors"
            >
              Logga in
            </Link>
            <Link
              href="/list-property"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              Hyr ut lokal
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-blue-600 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 fade-in">
          <nav className="px-4 py-4 space-y-2">
            <Link
              href="/search"
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="w-5 h-5" />
              <span>Sök lokaler</span>
            </Link>

            <Link
              href="/rent-index"
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Hyresindex</span>
            </Link>

            <Link
              href="/list-property"
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Building2 className="w-5 h-5" />
              <span>Hyr ut lokal</span>
            </Link>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/list-property"
                className="block w-full px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kom igång gratis
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
