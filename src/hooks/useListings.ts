'use client';

import { useState, useEffect, useCallback } from 'react';
import { listingsAPI, ListingsQuery, PaginatedResponse } from '@/lib/api';
import { Office } from '@/data/mockData';

interface UseListingsOptions {
  initialQuery?: ListingsQuery;
  autoFetch?: boolean;
}

interface UseListingsReturn {
  listings: Office[];
  loading: boolean;
  error: Error | null;
  pagination: PaginatedResponse<Office>['pagination'] | null;
  query: ListingsQuery;
  setQuery: (query: ListingsQuery) => void;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useListings(options: UseListingsOptions = {}): UseListingsReturn {
  const { initialQuery = {}, autoFetch = true } = options;

  const [listings, setListings] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<Office>['pagination'] | null>(null);
  const [query, setQuery] = useState<ListingsQuery>(initialQuery);

  const fetchListings = useCallback(async (append = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await listingsAPI.getAll(query);

      if (append) {
        setListings(prev => [...prev, ...response.data]);
      } else {
        setListings(response.data);
      }

      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch listings'));
    } finally {
      setLoading(false);
    }
  }, [query]);

  const refetch = useCallback(async () => {
    await fetchListings(false);
  }, [fetchListings]);

  const loadMore = useCallback(async () => {
    if (!pagination?.hasMore || loading) return;

    setQuery(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 20),
    }));
  }, [pagination, loading]);

  // Auto-fetch on mount and query change
  useEffect(() => {
    if (autoFetch) {
      fetchListings(false);
    }
  }, [autoFetch, fetchListings]);

  return {
    listings,
    loading,
    error,
    pagination,
    query,
    setQuery,
    refetch,
    loadMore,
  };
}

// Hook for single listing
export function useListing(id: string) {
  const [listing, setListing] = useState<Office | null>(null);
  const [similar, setSimilar] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchListing() {
      setLoading(true);
      setError(null);

      try {
        const response = await listingsAPI.getById(id);
        setListing(response.data);
        setSimilar(response.similar);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch listing'));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchListing();
    }
  }, [id]);

  return { listing, similar, loading, error };
}
