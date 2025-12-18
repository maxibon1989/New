'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Grid3X3,
  Map,
  X,
  ChevronDown,
  CheckCircle,
  Sparkles,
  Train,
  Utensils,
  TreeDeciduous,
  Heart,
  GitCompare,
  ArrowUpDown,
  Building2,
  Wifi,
  Car,
  Dumbbell,
  Coffee,
  ShowerHead,
  Shield
} from 'lucide-react';
import { offices, formatCurrency, formatNumber, type Office } from '@/data/mockData';

type ViewMode = 'list' | 'map';
type SortOption = 'match' | 'price_asc' | 'price_desc' | 'size_asc' | 'size_desc';

interface Filters {
  sqmMin: number;
  sqmMax: number;
  rentMin: number;
  rentMax: number;
  priceLevel: string[];
  culture: string[];
  amenities: string[];
  metroMaxDistance: number;
  restaurantMinRating: number;
}

const defaultFilters: Filters = {
  sqmMin: 0,
  sqmMax: 1000,
  rentMin: 0,
  rentMax: 150000,
  priceLevel: [],
  culture: [],
  amenities: [],
  metroMaxDistance: 30,
  restaurantMinRating: 1,
};

const amenityIcons: { [key: string]: React.ElementType } = {
  'Fiber': Wifi,
  'Parkering': Car,
  'Gym': Dumbbell,
  'Pentry': Coffee,
  'Dusch': ShowerHead,
  'Reception': Building2,
};

function OfficeCard({ office, onCompare, onSave, isComparing, isSaved }: {
  office: Office;
  onCompare: () => void;
  onSave: () => void;
  isComparing: boolean;
  isSaved: boolean;
}) {
  const matchScore = office.matchScore || Math.floor(Math.random() * 20) + 80;
  const matchScoreClass = matchScore >= 85 ? 'match-score-high' : matchScore >= 70 ? 'match-score-medium' : 'match-score-low';

  return (
    <div className="office-card bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-300">
      {/* Image placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="w-16 h-16 text-slate-300" />
        </div>

        {/* Match Score Badge */}
        <div className={`absolute top-3 left-3 ${matchScoreClass} text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5`}>
          <Sparkles className="w-4 h-4" />
          {matchScore}% Match
        </div>

        {/* Tags */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {office.verified && (
            <span className="bg-emerald-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verifierad
            </span>
          )}
          {office.newlyRenovated && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
              Nyrenoverad
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={(e) => { e.preventDefault(); onSave(); }}
            className={`p-2 rounded-lg transition-colors ${isSaved ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-white'}`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onCompare(); }}
            className={`p-2 rounded-lg transition-colors ${isComparing ? 'bg-blue-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-white'}`}
          >
            <GitCompare className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Link href={`/property/${office.id}`}>
        <div className="p-5">
          {/* Address & Area */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg text-slate-900 hover:text-blue-600 transition-colors">
              {office.address}
            </h3>
            <p className="text-slate-500 text-sm flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {office.area}, {office.city}
            </p>
          </div>

          {/* Key Info */}
          <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
            <span>{office.sqm} kvm</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>{office.rooms} rum</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="capitalize">{office.culture}</span>
          </div>

          {/* Estimated Rent */}
          <div className="price-tag text-white px-4 py-3 rounded-lg mb-4">
            <div className="text-sm opacity-90">Uppskattad månadshyra</div>
            <div className="text-xl font-bold">{formatCurrency(office.estimatedRent)}</div>
            <div className="text-xs opacity-75">{formatNumber(office.rentPerSqm)} kr/kvm/år</div>
          </div>

          {/* Quick Insights */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">
              <Train className="w-3 h-3" />
              {office.metroDistance} min till T-bana
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">
              <Utensils className="w-3 h-3" />
              {office.restaurantRating}/5 restauranger
            </span>
          </div>

          {/* Amenities Preview */}
          <div className="flex flex-wrap gap-2">
            {office.amenities.slice(0, 4).map((amenity) => {
              const Icon = amenityIcons[amenity] || Shield;
              return (
                <span key={amenity} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                  <Icon className="w-3 h-3" />
                  {amenity}
                </span>
              );
            })}
            {office.amenities.length > 4 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs">
                +{office.amenities.length - 4} till
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialArea = searchParams.get('area') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery || initialArea);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [savedOffices, setSavedOffices] = useState<string[]>([]);
  const [comparingOffices, setComparingOffices] = useState<string[]>([]);

  // Filter and sort offices
  const filteredOffices = useMemo(() => {
    let result = offices.filter(office => {
      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          office.address.toLowerCase().includes(query) ||
          office.area.toLowerCase().includes(query) ||
          office.city.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Size filter
      if (office.sqm < filters.sqmMin || office.sqm > filters.sqmMax) return false;

      // Rent filter
      if (office.estimatedRent < filters.rentMin || office.estimatedRent > filters.rentMax) return false;

      // Price level filter
      if (filters.priceLevel.length > 0 && !filters.priceLevel.includes(office.priceLevel)) return false;

      // Culture filter
      if (filters.culture.length > 0 && !filters.culture.includes(office.culture)) return false;

      // Metro distance filter
      if (office.metroDistance > filters.metroMaxDistance) return false;

      // Restaurant rating filter
      if (office.restaurantRating < filters.restaurantMinRating) return false;

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(a => office.amenities.includes(a));
        if (!hasAllAmenities) return false;
      }

      return true;
    });

    // Add random match scores
    result = result.map(office => ({
      ...office,
      matchScore: Math.floor(Math.random() * 25) + 75
    }));

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.estimatedRent - b.estimatedRent);
        break;
      case 'price_desc':
        result.sort((a, b) => b.estimatedRent - a.estimatedRent);
        break;
      case 'size_asc':
        result.sort((a, b) => a.sqm - b.sqm);
        break;
      case 'size_desc':
        result.sort((a, b) => b.sqm - a.sqm);
        break;
      case 'match':
      default:
        result.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return result;
  }, [searchQuery, filters, sortBy]);

  const toggleFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => {
      const current = prev[key] as string[];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) };
      }
      return { ...prev, [key]: [...current, value] };
    });
  };

  const toggleSaved = (id: string) => {
    setSavedOffices(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleCompare = (id: string) => {
    setComparingOffices(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-grow w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Sök stad, område eller adress..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filter</span>
              {(filters.priceLevel.length > 0 || filters.culture.length > 0 || filters.amenities.length > 0) && (
                <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {filters.priceLevel.length + filters.culture.length + filters.amenities.length}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-600'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
                <span className="hidden sm:inline">Lista</span>
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
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border-b border-slate-200 fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Size Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Yta (kvm)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filters.sqmMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, sqmMin: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Min"
                  />
                  <span className="text-slate-400">–</span>
                  <input
                    type="number"
                    value={filters.sqmMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, sqmMax: parseInt(e.target.value) || 1000 }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Rent Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hyra (kr/mån)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filters.rentMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, rentMin: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Min"
                  />
                  <span className="text-slate-400">–</span>
                  <input
                    type="number"
                    value={filters.rentMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, rentMax: parseInt(e.target.value) || 150000 }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Price Level */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hyresnivå</label>
                <div className="flex flex-wrap gap-2">
                  {['budget', 'standard', 'premium'].map(level => (
                    <button
                      key={level}
                      onClick={() => toggleFilter('priceLevel', level)}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                        filters.priceLevel.includes(level)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Culture */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Företagskultur</label>
                <div className="flex flex-wrap gap-2">
                  {['modern', 'traditional', 'industrial', 'flexible'].map(culture => (
                    <button
                      key={culture}
                      onClick={() => toggleFilter('culture', culture)}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                        filters.culture.includes(culture)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {culture === 'modern' ? 'Moderna' :
                       culture === 'traditional' ? 'Traditionella' :
                       culture === 'industrial' ? 'Industriella' : 'Flexibla'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metro Distance */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max {filters.metroMaxDistance} min till T-bana
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={filters.metroMaxDistance}
                  onChange={(e) => setFilters(prev => ({ ...prev, metroMaxDistance: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Restaurant Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Min restaurangbetyg: {filters.restaurantMinRating}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={filters.restaurantMinRating}
                  onChange={(e) => setFilters(prev => ({ ...prev, restaurantMinRating: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Amenities */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Bekvämligheter</label>
                <div className="flex flex-wrap gap-2">
                  {['Pentry', 'Dusch', 'Fiber', 'Parkering', 'Gym', 'Reception', 'Cykelparkering', 'Balkong'].map(amenity => (
                    <button
                      key={amenity}
                      onClick={() => toggleFilter('amenities', amenity)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        filters.amenities.includes(amenity)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-100">
              <button
                onClick={() => setFilters(defaultFilters)}
                className="text-slate-600 hover:text-slate-900"
              >
                Rensa filter
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Visa {filteredOffices.length} resultat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {filteredOffices.length} lediga lokaler
              {searchQuery && ` i "${searchQuery}"`}
            </h1>
            <p className="text-slate-600">Sorterade efter bästa matchning</p>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="match">Bästa matchning</option>
              <option value="price_asc">Lägsta hyra först</option>
              <option value="price_desc">Högsta hyra först</option>
              <option value="size_asc">Minsta först</option>
              <option value="size_desc">Största först</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Compare Bar */}
        {comparingOffices.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between fade-in">
            <div className="flex items-center gap-3">
              <GitCompare className="w-5 h-5 text-blue-600" />
              <span className="text-blue-900 font-medium">
                {comparingOffices.length} lokaler valda för jämförelse
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setComparingOffices([])}
                className="px-3 py-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
              >
                Rensa
              </button>
              <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Jämför nu
              </button>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'list' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffices.map(office => (
              <OfficeCard
                key={office.id}
                office={office}
                onCompare={() => toggleCompare(office.id)}
                onSave={() => toggleSaved(office.id)}
                isComparing={comparingOffices.includes(office.id)}
                isSaved={savedOffices.includes(office.id)}
              />
            ))}
          </div>
        )}

        {/* Map View Placeholder */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="h-[600px] bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
              <div className="text-center">
                <Map className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Interaktiv karta kommer snart</p>
                <p className="text-sm text-slate-400">Visar {filteredOffices.length} lokaler</p>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredOffices.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Inga lokaler hittades</h2>
            <p className="text-slate-600 mb-6">Prova att justera dina filter eller sök på ett annat område</p>
            <button
              onClick={() => {
                setFilters(defaultFilters);
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Rensa alla filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Laddar sökresultat...</p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}
