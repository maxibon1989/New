'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Eye,
  CheckCircle,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  BarChart3,
  ArrowRight,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';
import { areaStats, formatNumber } from '@/data/mockData';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/search');
    }
  };

  const stockholmAreas = areaStats.filter(a => a.city === 'Stockholm');

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-emerald-600';
      case 'down': return 'text-red-600';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-gradient text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>100x bättre än konkurrenterna</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Hitta ditt nästa kontor.
              <br />
              <span className="text-blue-200">Med insikter du aldrig sett förut.</span>
            </h1>

            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Sluta gissa hyror. Få full transparens och smarta rekommendationer baserade på verklig data.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Sök stad, område eller adress..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-36 py-5 text-lg bg-white text-slate-900 rounded-2xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300/50 placeholder-slate-400"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                  >
                    Sök lokaler
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Link
                href="/list-property"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors border border-white/20"
              >
                <Building2 className="w-4 h-4" />
                Hyr ut din lokal
              </Link>
              <Link
                href="/rent-index"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors border border-white/20"
              >
                <BarChart3 className="w-4 h-4" />
                Se vårt Hyresindex
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold">2,450+</div>
                <div className="text-blue-200 text-sm">Lediga lokaler</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-blue-200 text-sm">Verifierade</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">3 städer</div>
                <div className="text-blue-200 text-sm">I Sverige</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Varför välja Office Oracle?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Vi har byggt plattformen som vi själva hade velat ha när vi letade kontor.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Eye className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Full transparens</h3>
              <p className="text-slate-600">Se uppskattade hyror överallt - även på lokaler utan angivet pris. Ingen mer gissning.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Verifierad tillgänglighet</h3>
              <p className="text-slate-600">Inga gamla annonser. Vi verifierar regelbundet att lokalerna fortfarande är lediga.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Områdes-insights</h3>
              <p className="text-slate-600">Allt om din framtida arbetsplats: restauranger, kollektivtrafik, grönområden och mer.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Spara tid</h3>
              <p className="text-slate-600">Hitta rätt direkt med smarta filter och AI-driven matchning baserat på dina behov.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Areas Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Trendande områden i Stockholm
              </h2>
              <p className="text-slate-600">Se hur hyrorna utvecklas i olika stadsdelar</p>
            </div>
            <Link
              href="/rent-index"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Se hela Hyresindex
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stockholmAreas.map((area) => (
              <Link
                key={area.name}
                href={`/search?area=${encodeURIComponent(area.name)}`}
                className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {area.name}
                    </h3>
                    <p className="text-slate-500 text-sm">{area.city}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getTrendIcon(area.trend)}
                    <span className={`font-medium ${getTrendColor(area.trend)}`}>
                      {area.yearChange > 0 ? '+' : ''}{area.yearChange}%
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {formatNumber(area.avgRentPerSqm)} kr
                    </div>
                    <div className="text-sm text-slate-500">per kvm/år i snitt</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-slate-700">
                      {area.totalListings}
                    </div>
                    <div className="text-sm text-slate-500">lediga lokaler</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>Se alla lokaler i {area.name}</span>
                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
                <Shield className="w-4 h-4" />
                Gratis för företag som söker lokal
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Redo att hitta ditt drömkontor?
              </h2>

              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Kom igång idag och få tillgång till alla våra verktyg och insikter - helt gratis.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                >
                  <Search className="w-5 h-5" />
                  Börja söka lokaler
                </Link>
                <Link
                  href="/rent-index"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500/30 text-white rounded-xl font-semibold hover:bg-blue-500/50 transition-colors border border-white/30"
                >
                  <BarChart3 className="w-5 h-5" />
                  Utforska Hyresindex
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Property Owners Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-6">
                <Building2 className="w-4 h-4" />
                För fastighetsägare
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Fyll dina lokaler snabbare med rätt hyresgäster
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Nå kvalificerade företag som aktivt letar efter kontorslokaler. Få detaljerad statistik och insikter om din marknad.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Detaljerad dashboard med visningar och leads</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Quality Score - högre kvalitet = bättre synlighet</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Premium marknadsrapporter och efterfrågedata</span>
                </li>
              </ul>

              <Link
                href="/list-property"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
              >
                Annonsera din lokal
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="bg-slate-100 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-900">Annonsstatistik</h4>
                  <span className="text-sm text-slate-500">Senaste 30 dagarna</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">1,245</div>
                    <div className="text-sm text-slate-500">Visningar</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">89</div>
                    <div className="text-sm text-slate-500">Klick</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">12</div>
                    <div className="text-sm text-slate-500">Leads</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Quality Score: 92/100</div>
                    <div className="text-sm text-slate-500">Toppnivå - prioriterad synlighet</div>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
