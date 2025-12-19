'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { formatCurrency, type Office } from '@/data/mockData';

// Mapbox token - in production, use environment variable
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface MapViewProps {
  offices: Office[];
  onMarkerClick?: (office: Office) => void;
  center?: [number, number];
  zoom?: number;
}

export default function MapView({
  offices,
  onMarkerClick,
  center = [18.0686, 59.3293], // Stockholm default
  zoom = 11,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: zoom,
      attributionControl: false,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'bottom-right'
    );

    // Add geolocation control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      'bottom-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, [center, zoom]);

  // Add/update markers when offices change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add new markers
    offices.forEach((office) => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'office-marker';
      el.innerHTML = `
        <div class="marker-pin ${office.verified ? 'verified' : ''}">
          <span class="marker-price">${Math.round(office.rentPerSqm)}</span>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        maxWidth: '300px',
      }).setHTML(`
        <div class="map-popup">
          <h3 class="font-semibold text-slate-900">${office.address}</h3>
          <p class="text-sm text-slate-500">${office.area}, ${office.city}</p>
          <div class="mt-2 flex justify-between items-center">
            <span class="text-sm text-slate-600">${office.sqm} kvm</span>
            <span class="font-semibold text-blue-600">${formatCurrency(office.estimatedRent)}/mån</span>
          </div>
          ${office.verified ? '<span class="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">Verifierad</span>' : ''}
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([office.lng, office.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Handle click
      el.addEventListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(office);
        }
      });

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (offices.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      offices.forEach((office) => {
        bounds.extend([office.lng, office.lat]);
      });
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14,
      });
    }
  }, [offices, mapLoaded, onMarkerClick]);

  return (
    <>
      <style jsx global>{`
        .office-marker {
          cursor: pointer;
        }

        .marker-pin {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: transform 0.15s ease;
        }

        .marker-pin:hover {
          transform: scale(1.1);
        }

        .marker-pin.verified {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .marker-pin::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #1d4ed8;
        }

        .marker-pin.verified::after {
          border-top-color: #059669;
        }

        .map-popup {
          padding: 8px;
        }

        .mapboxgl-popup-content {
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      `}</style>

      <div
        ref={mapContainer}
        className="w-full h-full min-h-[400px] rounded-xl overflow-hidden"
      />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </>
  );
}
