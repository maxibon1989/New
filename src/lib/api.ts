/**
 * API Client for Office Oracle
 * Handles all API calls to both Next.js API routes and external backend
 */

import { Office, AreaStats, RentHistoryPoint } from '@/data/mockData';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ListingsQuery {
  city?: string;
  area?: string;
  sqmMin?: number;
  sqmMax?: number;
  rentMin?: number;
  rentMax?: number;
  type?: string;
  culture?: string;
  priceLevel?: string;
  verified?: boolean;
  amenities?: string[];
  sortBy?: 'match' | 'rent_asc' | 'rent_desc' | 'sqm_asc' | 'sqm_desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  listings: {
    data: Office[];
    count: number;
  };
  areas: {
    data: AreaStats[];
    count: number;
  };
  query: string;
}

export interface AutocompleteSuggestion {
  type: 'city' | 'area' | 'address';
  value: string;
}

export interface AnalyticsOverview {
  summary: {
    totalListings: number;
    avgRent: number;
    avgSqm: number;
    avgRentPerSqm: number;
    verifiedCount: number;
    verifiedPercentage: number;
  };
  byType: { type: string; count: number }[];
  byPriceLevel: { priceLevel: string; count: number }[];
  areasCount: number;
  generatedAt: string;
}

// Helper function for API calls
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Listings API
export const listingsAPI = {
  async getAll(query: ListingsQuery = {}): Promise<PaginatedResponse<Office>> {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      }
    });

    return fetchAPI(`/api/listings?${params.toString()}`);
  },

  async getById(id: string): Promise<{ data: Office; similar: Office[] }> {
    return fetchAPI(`/api/listings/${id}`);
  },

  async getForMap(city?: string): Promise<{ data: Office[]; count: number }> {
    const params = city ? `?city=${encodeURIComponent(city)}` : '';
    return fetchAPI(`/api/listings${params}`);
  },
};

// Areas API
export const areasAPI = {
  async getAll(city?: string): Promise<{ data: AreaStats[]; total: number }> {
    const params = city ? `?city=${encodeURIComponent(city)}` : '';
    return fetchAPI(`/api/areas${params}`);
  },

  async getByName(city: string, name: string): Promise<{ area: AreaStats; rentHistory: RentHistoryPoint[] }> {
    return fetchAPI(`/api/areas/${encodeURIComponent(city)}/${encodeURIComponent(name)}`);
  },
};

// Search API
export const searchAPI = {
  async search(q: string, limit = 20, offset = 0): Promise<SearchResult> {
    const params = new URLSearchParams({ q, limit: String(limit), offset: String(offset) });
    return fetchAPI(`/api/search?${params.toString()}`);
  },

  async autocomplete(q: string): Promise<{ suggestions: AutocompleteSuggestion[] }> {
    return fetchAPI(`/api/search/autocomplete?q=${encodeURIComponent(q)}`);
  },
};

// Analytics API
export const analyticsAPI = {
  async getOverview(city?: string): Promise<AnalyticsOverview> {
    const params = city ? `?city=${encodeURIComponent(city)}` : '';
    return fetchAPI(`/api/analytics/overview${params}`);
  },
};

// Export a combined API object
export const api = {
  listings: listingsAPI,
  areas: areasAPI,
  search: searchAPI,
  analytics: analyticsAPI,
};

export default api;
