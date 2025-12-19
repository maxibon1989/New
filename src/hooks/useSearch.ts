'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { searchAPI, SearchResult, AutocompleteSuggestion } from '@/lib/api';

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

interface UseSearchOptions {
  debounceMs?: number;
  minLength?: number;
}

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult | null;
  suggestions: AutocompleteSuggestion[];
  loading: boolean;
  error: Error | null;
  search: (q: string) => Promise<void>;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const { debounceMs = 300, minLength = 2 } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const debouncedQuery = useDebounce(query, debounceMs);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < minLength) {
      setResults(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await searchAPI.search(q);
      setResults(response);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [minLength]);

  // Fetch suggestions on query change
  useEffect(() => {
    async function fetchSuggestions() {
      if (debouncedQuery.length < minLength) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await searchAPI.autocomplete(debouncedQuery);
        setSuggestions(response.suggestions);
      } catch (err) {
        // Silently fail for autocomplete
        setSuggestions([]);
      }
    }

    fetchSuggestions();
  }, [debouncedQuery, minLength]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    suggestions,
    loading,
    error,
    search,
  };
}
