'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Building2,
  ArrowRight,
  Calculator,
  Download,
  Filter,
  BarChart3,
  Map,
  Info,
  ChevronDown,
  Search
} from 'lucide-react';
import { areaStats, rentHistory, formatNumber, type AreaStats } from '@/data/mockData';

type ViewMode = 'table' | 'map';
type CityFilter = 'all' | 'Stockholm' | 'Göteborg' | 'Malmö';

export default function RentIndexPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [cityFilter, setCityFilter] = useState<CityFilter>('all');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [valuationForm, setValuationForm] = useState({
    address: '',
    sqm: '',
    buildingYear: '',
    type: 'office'
  });

  const filteredAreas = cityFilter === 'all'
    ? areaStats
    : areaStats.filter(a => a.city === cityFilter);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'down': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Minus className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTrendBgColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'bg-emerald-50 text-emerald-700';
      case 'down': return 'bg-red-50 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getHeatColor = (rent: number) => {
    const max = 350;
    const min = 150;
    const ratio = (rent - min) / (max - min);

    if (ratio > 0.7) return 'bg-red-500';
    if (ratio > 0.5) return 'bg-orange-500';
    if (ratio > 0.3) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const totalListings = areaStats.reduce((sum, area) => sum + area.totalListings, 0);
  const avgRent = Math.round(areaStats.reduce((sum, area) => sum + area.avgRentPerSqm, 0) / areaStats.length);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
                <BarChart3 className="w-4 h-4" />
                Uppdateras veckovis
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Hyresindex Sverige
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                Total transparens på kontorsmarknaden. Se genomsnittshyror, trender
                och prognoser för alla områden i Sverige.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  <Download className="w-5 h-5" />
                  Ladda ned rapport
                </button>
                <a href="#valuation" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors">
                  <Calculator className="w-5 h-5" />
                  Värdera din lokal
                </a>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold mb-2">{formatNumber(totalListings)}</div>
                <div className="text-slate-300">Lediga lokaler</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold mb-2">{avgRent} kr</div>
                <div className="text-slate-300">Snitt kr/kvm/år</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-8 h-8 text-emerald-400" />
                  2.4%
                </div>
                <div className="text-slate-300">Snittökning 2024</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold mb-2">8</div>
                <div className="text-slate-300">Områden indexerade</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Hyror per område</h2>
              <p className="text-slate-600">Genomsnittlig hyra per kvadratmeter/år</p>
            </div>

            <div className="flex gap-3">
              {/* City Filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value as CityFilter)}
                className="px-4 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="all">Alla städer</option>
                <option value="Stockholm">Stockholm</option>
                <option value="Göteborg">Göteborg</option>
                <option value="Malmö">Malmö</option>
              </select>

              {/* View Toggle */}
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-slate-600'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="hidden sm:inline">Tabell</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'map' ? 'bg-white shadow text-blue-600' : 'text-slate-600'
                  }`}
                >
                  <Map className="w-5 h-5" />
                  <span className="hidden sm:inline">Karta</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden fade-in">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold text-slate-600">Område</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-600">Stad</th>
                      <th className="text-right px-6 py-4 font-semibold text-slate-600">Snitt kr/kvm/år</th>
                      <th className="text-right px-6 py-4 font-semibold text-slate-600">Årsförändring</th>
                      <th className="text-right px-6 py-4 font-semibold text-slate-600">Lediga lokaler</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAreas.map((area) => (
                      <tr
                        key={`${area.name}-${area.city}`}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedArea(selectedArea === area.name ? null : area.name)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getHeatColor(area.avgRentPerSqm)}`} />
                            <span className="font-medium text-slate-900">{area.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{area.city}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-slate-900">{formatNumber(area.avgRentPerSqm)} kr</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getTrendBgColor(area.trend)}`}>
                            {getTrendIcon(area.trend)}
                            {area.yearChange > 0 ? '+' : ''}{area.yearChange}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-600">{area.totalListings}</td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/search?area=${encodeURIComponent(area.name)}`}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Se lokaler
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Expanded Area Details */}
              {selectedArea && rentHistory[selectedArea] && (
                <div className="border-t border-slate-200 p-6 bg-slate-50 fade-in">
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Hyresutveckling i {selectedArea} (senaste 12 månaderna)
                  </h3>
                  <div className="h-48 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Diagram för {selectedArea}</p>
                      <div className="flex gap-2 mt-4 justify-center flex-wrap">
                        {rentHistory[selectedArea].slice(-6).map((point, i) => (
                          <div key={i} className="text-xs">
                            <div className="font-medium text-slate-600">{point.rent} kr</div>
                            <div className="text-slate-400">{point.month.split(' ')[0]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Map View */}
          {viewMode === 'map' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden fade-in">
              <div className="h-[500px] bg-gradient-to-br from-blue-50 to-slate-100 relative">
                {/* Heat Map Legend */}
                <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg p-4 z-10">
                  <h4 className="font-medium text-slate-900 mb-3">Hyresnivå (kr/kvm/år)</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500" />
                      <span className="text-sm text-slate-600">300+ (Premium)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-orange-500" />
                      <span className="text-sm text-slate-600">250-300 (Hög)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-500" />
                      <span className="text-sm text-slate-600">200-250 (Medel)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-emerald-500" />
                      <span className="text-sm text-slate-600">&lt;200 (Budget)</span>
                    </div>
                  </div>
                </div>

                {/* Map Placeholder with Area Markers */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Map className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">Interaktiv karta över områden</p>

                    {/* Area markers preview */}
                    <div className="flex flex-wrap gap-2 justify-center max-w-md">
                      {filteredAreas.map(area => (
                        <Link
                          key={`${area.name}-${area.city}`}
                          href={`/search?area=${encodeURIComponent(area.name)}`}
                          className={`${getHeatColor(area.avgRentPerSqm)} text-white px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity`}
                        >
                          {area.name}: {formatNumber(area.avgRentPerSqm)} kr
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trends & Forecasts */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Trender & Prognoser</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Starkast tillväxt</h3>
                  <p className="text-sm text-slate-600">Senaste 12 månaderna</p>
                </div>
              </div>
              <div className="space-y-3">
                {areaStats
                  .filter(a => a.trend === 'up')
                  .sort((a, b) => b.yearChange - a.yearChange)
                  .slice(0, 3)
                  .map(area => (
                    <div key={area.name} className="flex justify-between items-center">
                      <span className="text-slate-700">{area.name}</span>
                      <span className="font-semibold text-emerald-600">+{area.yearChange}%</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Prognos 2025</h3>
                  <p className="text-sm text-slate-600">Baserat på marknadsanalys</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Stockholm centrum</span>
                  <span className="font-semibold text-amber-600">+3-4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Göteborg</span>
                  <span className="font-semibold text-amber-600">+2-3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Malmö</span>
                  <span className="font-semibold text-amber-600">+2-3%</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Mest för pengarna</h3>
                  <p className="text-sm text-slate-600">Låg hyra, bra kommunikation</p>
                </div>
              </div>
              <div className="space-y-3">
                {areaStats
                  .sort((a, b) => a.avgRentPerSqm - b.avgRentPerSqm)
                  .slice(0, 3)
                  .map(area => (
                    <div key={area.name} className="flex justify-between items-center">
                      <span className="text-slate-700">{area.name}</span>
                      <span className="font-semibold text-blue-600">{formatNumber(area.avgRentPerSqm)} kr</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valuation Tool */}
      <section id="valuation" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 lg:p-12 text-white">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Vad är din lokal värd?
                </h2>
                <p className="text-blue-100 text-lg mb-6">
                  Få en omedelbar och anonym uppskattning baserad på vår marknadsdata.
                  Perfekt för både hyresgäster och fastighetsägare.
                </p>
                <ul className="space-y-3 text-blue-100">
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    Baserat på verkliga hyresdata
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    Helt anonymt - ingen registrering
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    Resultat på sekunder
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 text-slate-900">
                <h3 className="font-semibold text-lg mb-4">Fyll i uppgifter om lokalen</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Adress eller område
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={valuationForm.address}
                        onChange={(e) => setValuationForm({ ...valuationForm, address: e.target.value })}
                        placeholder="T.ex. Sveavägen, Stockholm"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Yta (kvm)
                      </label>
                      <input
                        type="number"
                        value={valuationForm.sqm}
                        onChange={(e) => setValuationForm({ ...valuationForm, sqm: e.target.value })}
                        placeholder="150"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Byggnadsår
                      </label>
                      <input
                        type="number"
                        value={valuationForm.buildingYear}
                        onChange={(e) => setValuationForm({ ...valuationForm, buildingYear: e.target.value })}
                        placeholder="1990"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Typ av lokal
                    </label>
                    <select
                      value={valuationForm.type}
                      onChange={(e) => setValuationForm({ ...valuationForm, type: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="office">Kontor</option>
                      <option value="retail">Butik</option>
                      <option value="warehouse">Lager</option>
                      <option value="flex">Flexlokal</option>
                    </select>
                  </div>

                  <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Beräkna värde
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    Genom att klicka godkänner du våra <a href="#" className="text-blue-600 hover:underline">villkor</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data for Property Owners */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Premium marknadsdata</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Få tillgång till detaljerad efterfrågedata, trender per nisch och
              konkurrentanalys för ditt område.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Efterfrågeanalys</h3>
              <p className="text-slate-600 mb-6">
                Se vilka typer av lokaler som är mest efterfrågade i ditt område.
              </p>
              <span className="text-blue-600 font-medium">Från 990 kr/mån</span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Trendrapporter</h3>
              <p className="text-slate-600 mb-6">
                Månatliga rapporter med prognoser och marknadsinsikter.
              </p>
              <span className="text-blue-600 font-medium">Från 1 490 kr/mån</span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Konkurrentanalys</h3>
              <p className="text-slate-600 mb-6">
                Jämför dina lokalers prissättning mot marknaden.
              </p>
              <span className="text-blue-600 font-medium">Från 2 490 kr/mån</span>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/list-property"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
            >
              Kontakta oss för premiumdata
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
