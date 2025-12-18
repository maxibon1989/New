'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  Users,
  Heart,
  Share2,
  MessageSquare,
  CheckCircle,
  Train,
  Utensils,
  TreeDeciduous,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronRight,
  Wifi,
  Car,
  Dumbbell,
  Coffee,
  ShowerHead,
  Shield,
  Bike,
  Sun,
  Lock,
  Lightbulb,
  Star,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import { offices, areaStats, rentHistory, commuteData, formatCurrency, formatNumber } from '@/data/mockData';

interface PageProps {
  params: Promise<{ id: string }>;
}

const amenityDetails: { [key: string]: { icon: React.ElementType; description: string } } = {
  'Pentry': { icon: Coffee, description: 'Fullt utrustat pentry med diskmaskin och mikrovågsugn' },
  'Dusch': { icon: ShowerHead, description: 'Dusch för anställda' },
  'Fiber': { icon: Wifi, description: 'Fiberanslutning upp till 1 Gbit/s' },
  'Parkering': { icon: Car, description: 'Parkeringsplatser tillgängliga' },
  'Gym': { icon: Dumbbell, description: 'Tillgång till gym i byggnaden' },
  'Reception': { icon: Building2, description: 'Bemannad reception under kontorstid' },
  'Cykelparkering': { icon: Bike, description: 'Säker cykelparkering' },
  'Balkong': { icon: Sun, description: 'Balkong eller terrass' },
  'Terrass': { icon: Sun, description: 'Uteterrass för möten eller paus' },
  'Larm': { icon: Lock, description: 'Larmsystem installerat' },
  'Smart belysning': { icon: Lightbulb, description: 'Intelligent belysningssystem' },
  'Högt i tak': { icon: Building2, description: 'Extra takhöjd för öppen känsla' },
};

export default function PropertyPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'amenities' | 'reviews'>('overview');
  const [isSaved, setIsSaved] = useState(false);

  const office = offices.find(o => o.id === id);

  if (!office) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Lokalen hittades inte</h1>
          <Link href="/search" className="text-blue-600 hover:underline">
            Tillbaka till sökning
          </Link>
        </div>
      </div>
    );
  }

  const areaData = areaStats.find(a => a.name === office.area);
  const areaHistory = rentHistory[office.area] || rentHistory['Norrmalm'];

  const tabs = [
    { id: 'overview', label: 'Översikt' },
    { id: 'insights', label: 'Office Oracle Insights' },
    { id: 'amenities', label: 'Bekvämligheter' },
    { id: 'reviews', label: 'Omdömen' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Tillbaka till sökning
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Image Gallery Placeholder */}
            <div className="lg:col-span-2">
              <div className="relative h-80 lg:h-[450px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="w-24 h-24 text-slate-300" />
                </div>

                {/* Tags */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {office.verified && (
                    <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Verifierad
                    </span>
                  )}
                  {office.newlyRenovated && (
                    <span className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                      Nyrenoverad
                    </span>
                  )}
                  {office.flexibleContract && (
                    <span className="bg-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                      Flexibelt kontrakt
                    </span>
                  )}
                </div>

                {/* Photo count placeholder */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm">
                  1 / 8 bilder
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              {/* Address & Area */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                  {office.address}
                </h1>
                <p className="text-slate-600 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {office.area}, {office.city}
                </p>
              </div>

              {/* Key Facts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">{office.sqm}</div>
                  <div className="text-sm text-slate-500">Kvadratmeter</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">{office.rooms}</div>
                  <div className="text-sm text-slate-500">Rum</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">{office.buildingYear}</div>
                  <div className="text-sm text-slate-500">Byggnadsår</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl capitalize">
                  <div className="text-2xl font-bold text-slate-900">{office.culture}</div>
                  <div className="text-sm text-slate-500">Stil</div>
                </div>
              </div>

              {/* Price Box */}
              <div className="price-tag text-white p-6 rounded-2xl">
                <div className="text-sm opacity-90 mb-1">Uppskattad månadshyra</div>
                <div className="text-3xl font-bold mb-2">{formatCurrency(office.estimatedRent)}</div>
                <div className="text-sm opacity-90">
                  {formatCurrency(office.rentMin)} – {formatCurrency(office.rentMax)} möjligt intervall
                </div>
                <div className="mt-3 pt-3 border-t border-white/20 text-sm">
                  {formatNumber(office.rentPerSqm)} kr/kvm/år
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  Kontakta {office.owner}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                      isSaved
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Sparad' : 'Spara'}
                  </button>
                  <button className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Dela
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8 fade-in">
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Om lokalen</h2>
                <p className="text-slate-600 leading-relaxed">{office.description}</p>
              </div>

              {/* Quick Insights */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Snabböversikt</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Train className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{office.metroDistance} min</div>
                      <div className="text-sm text-slate-500">Till T-bana</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Utensils className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{office.restaurantRating}/5</div>
                      <div className="text-sm text-slate-500">Restauranger</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <TreeDeciduous className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{office.greenSpaceRating}/5</div>
                      <div className="text-sm text-slate-500">Grönområden</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nearby Companies */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Företag i närheten</h2>
                <div className="flex flex-wrap gap-2">
                  {office.nearbyCompanies.map(company => (
                    <span key={company} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Owner Info */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Fastighetsägare</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-slate-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{office.owner}</div>
                    <div className="text-sm text-slate-500">Verifierad fastighetsägare</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    Ring nu
                  </button>
                  <button className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Skicka meddelande
                  </button>
                </div>
              </div>

              {/* Similar Properties */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Liknande lokaler</h3>
                <div className="space-y-3">
                  {offices.filter(o => o.id !== office.id && o.area === office.area).slice(0, 3).map(o => (
                    <Link
                      key={o.id}
                      href={`/property/${o.id}`}
                      className="block p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="font-medium text-slate-900">{o.address}</div>
                      <div className="text-sm text-slate-500">{o.sqm} kvm • {formatCurrency(o.estimatedRent)}/mån</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-8 fade-in">
            {/* Rent Analysis */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Hyresanalys
              </h2>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Comparison */}
                <div>
                  <h3 className="font-medium text-slate-700 mb-4">Jämfört med området</h3>
                  <div className={`p-6 rounded-xl ${office.rentVsAverage < 0 ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      {office.rentVsAverage < 0 ? (
                        <TrendingDown className="w-8 h-8 text-emerald-600" />
                      ) : (
                        <TrendingUp className="w-8 h-8 text-amber-600" />
                      )}
                      <span className={`text-3xl font-bold ${office.rentVsAverage < 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {Math.abs(office.rentVsAverage)}%
                      </span>
                    </div>
                    <p className={office.rentVsAverage < 0 ? 'text-emerald-700' : 'text-amber-700'}>
                      {office.rentVsAverage < 0 ? 'Under' : 'Över'} genomsnittet för {office.area}
                    </p>
                    <p className="text-sm text-slate-600 mt-2">
                      Genomsnittlig hyra i området: {formatNumber(office.areaRentAverage)} kr/kvm/år
                    </p>
                  </div>
                </div>

                {/* Price History Chart Placeholder */}
                <div>
                  <h3 className="font-medium text-slate-700 mb-4">Hyresutveckling i {office.area}</h3>
                  <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Hyresdiagram</p>
                      <p className="text-xs">{areaHistory.length} månaders data</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Area Scorecard */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Områdes-scorecard: {office.area}</h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <Train className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-slate-900 mb-1">{office.metroDistance} min</div>
                  <div className="text-sm text-slate-600">Kommunikation</div>
                  <div className="flex justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${i <= 5 - Math.floor(office.metroDistance / 5) ? 'bg-blue-600' : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center p-6 bg-amber-50 rounded-xl">
                  <Utensils className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-slate-900 mb-1">{office.restaurantRating}/5</div>
                  <div className="text-sm text-slate-600">Restauranger</div>
                  <div className="flex justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${i <= office.restaurantRating ? 'bg-amber-600' : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center p-6 bg-emerald-50 rounded-xl">
                  <TreeDeciduous className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-slate-900 mb-1">{office.greenSpaceRating}/5</div>
                  <div className="text-sm text-slate-600">Grönområden</div>
                  <div className="flex justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${i <= office.greenSpaceRating ? 'bg-emerald-600' : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center p-6 bg-purple-50 rounded-xl">
                  <Building2 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-slate-900 mb-1 capitalize">{office.culture}</div>
                  <div className="text-sm text-slate-600">Atmosfär</div>
                  <div className="flex justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-purple-600" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Commute Analysis */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Pendlaranalys</h2>
              <p className="text-slate-600 mb-6">Genomsnittlig restid till {office.area} med kollektivtrafik</p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {commuteData.map(route => (
                  <div key={route.from} className="p-4 bg-slate-50 rounded-xl text-center">
                    <div className="text-sm text-slate-500 mb-1">Från {route.from}</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {office.area === 'Norrmalm' ? route.toNorrmalm :
                       office.area === 'Kista' ? route.toKista : route.toKungsholmen} min
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Amenities Tab */}
        {activeTab === 'amenities' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 fade-in">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Alla bekvämligheter</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {office.amenities.map(amenity => {
                const details = amenityDetails[amenity] || { icon: CheckCircle, description: 'Tillgänglig' };
                const Icon = details.icon;
                return (
                  <div key={amenity} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{amenity}</div>
                      <div className="text-sm text-slate-500">{details.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 fade-in">
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Omdömen om fastigheten</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Skriv omdöme
                </button>
              </div>

              {/* Placeholder Reviews */}
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Anonym hyresgäst</div>
                        <div className="text-sm text-slate-500">Hyrde 2022-2024</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'text-amber-400 fill-current' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600">
                    Fantastisk fastighetsförvaltning! Snabba på att åtgärda problem och alltid trevligt bemötande.
                    Gemensamma utrymmen hålls i gott skick. Rekommenderas varmt.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Anonym hyresgäst</div>
                        <div className="text-sm text-slate-500">Nuvarande hyresgäst sedan 2023</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-4 h-4 ${i <= 5 ? 'text-amber-400 fill-current' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600">
                    Bra läge och fina lokaler. Värmesystemet är effektivt och el/vatten ingår i hyran.
                    Receptionen är mycket hjälpsam med paketmottagning och besökare.
                  </p>
                </div>
              </div>
            </div>

            {/* Q&A Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Frågor & Svar</h2>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="font-medium text-slate-900 mb-2">Hur fungerar parkeringen?</div>
                  <p className="text-slate-600 text-sm">
                    <span className="font-medium text-blue-600">{office.owner}:</span> Vi har underjordiskt garage med plats för hyresgäster.
                    Kontakta oss för prisinfo och tillgänglighet.
                  </p>
                </div>
              </div>

              <button className="w-full py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Ställ en fråga
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
