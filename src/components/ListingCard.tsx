'use client';

import Link from 'next/link';
import {
  MapPin,
  CheckCircle,
  Sparkles,
  Train,
  Utensils,
  Heart,
  GitCompare,
  Building2,
  Wifi,
  Car,
  Dumbbell,
  Coffee,
  ShowerHead,
  Shield
} from 'lucide-react';
import { formatCurrency, formatNumber, type Office } from '@/data/mockData';

const amenityIcons: { [key: string]: React.ElementType } = {
  'Fiber': Wifi,
  'Parkering': Car,
  'Gym': Dumbbell,
  'Pentry': Coffee,
  'Dusch': ShowerHead,
  'Reception': Building2,
};

interface ListingCardProps {
  office: Office;
  onCompare?: () => void;
  onSave?: () => void;
  isComparing?: boolean;
  isSaved?: boolean;
}

export default function ListingCard({
  office,
  onCompare,
  onSave,
  isComparing = false,
  isSaved = false,
}: ListingCardProps) {
  const matchScore = office.matchScore || Math.floor(Math.random() * 20) + 80;
  const matchScoreClass = matchScore >= 85 ? 'match-score-high' : matchScore >= 70 ? 'match-score-medium' : 'match-score-low';

  return (
    <div className="office-card bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-300 transition-all hover:shadow-lg">
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
        {(onCompare || onSave) && (
          <div className="absolute bottom-3 right-3 flex gap-2">
            {onSave && (
              <button
                onClick={(e) => { e.preventDefault(); onSave(); }}
                className={`p-2 rounded-lg transition-colors ${isSaved ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-white'}`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
            {onCompare && (
              <button
                onClick={(e) => { e.preventDefault(); onCompare(); }}
                className={`p-2 rounded-lg transition-colors ${isComparing ? 'bg-blue-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-white'}`}
              >
                <GitCompare className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
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

          {/* Estimated Rent - The "Killer Feature" */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg mb-4">
            <div className="text-sm opacity-90">Beräknad marknadshyra</div>
            <div className="text-xl font-bold">{formatCurrency(office.estimatedRent)}/mån</div>
            <div className="text-xs opacity-75">{formatNumber(office.rentPerSqm)} kr/kvm/år</div>
          </div>

          {/* Rent Comparison */}
          {office.rentVsAverage !== undefined && (
            <div className={`text-sm mb-3 px-3 py-2 rounded-lg ${
              office.rentVsAverage < 0
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {office.rentVsAverage < 0
                ? `${Math.abs(office.rentVsAverage)}% under snittet för ${office.area}`
                : `${office.rentVsAverage}% över snittet för ${office.area}`
              }
            </div>
          )}

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
