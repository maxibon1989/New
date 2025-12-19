'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Building2, Navigation } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';

interface SearchWithAutocompleteProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  size?: 'default' | 'large';
}

export default function SearchWithAutocomplete({
  placeholder = 'Sök stad, område eller adress...',
  onSearch,
  className = '',
  size = 'default',
}: SearchWithAutocompleteProps) {
  const router = useRouter();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { query, setQuery, suggestions, loading } = useSearch({
    debounceMs: 200,
    minLength: 2,
  });

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleSuggestionClick = (suggestion: { type: string; value: string }) => {
    setQuery(suggestion.value);
    setShowSuggestions(false);

    if (onSearch) {
      onSearch(suggestion.value);
    } else {
      if (suggestion.type === 'area') {
        router.push(`/search?area=${encodeURIComponent(suggestion.value.split(',')[0])}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(suggestion.value)}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'city':
        return <Navigation className="w-4 h-4 text-slate-400" />;
      case 'area':
        return <MapPin className="w-4 h-4 text-slate-400" />;
      case 'address':
        return <Building2 className="w-4 h-4 text-slate-400" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  const sizeClasses = size === 'large'
    ? 'pl-14 pr-36 py-5 text-lg'
    : 'pl-12 pr-4 py-3';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className={`absolute inset-y-0 left-0 ${size === 'large' ? 'pl-5' : 'pl-4'} flex items-center pointer-events-none`}>
            <Search className={`${size === 'large' ? 'h-6 w-6' : 'h-5 w-5'} text-slate-400`} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full ${sizeClasses} bg-white text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400`}
          />

          {size === 'large' && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                Sök lokaler
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.value}`}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                index === selectedIndex ? 'bg-slate-50' : ''
              }`}
            >
              {getIcon(suggestion.type)}
              <span className="text-slate-900">{suggestion.value}</span>
              <span className="ml-auto text-xs text-slate-400 capitalize">
                {suggestion.type === 'city' ? 'Stad' :
                 suggestion.type === 'area' ? 'Område' : 'Adress'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {loading && showSuggestions && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-4 text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}
    </div>
  );
}
