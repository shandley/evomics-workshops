import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { SearchIndex, SearchResult, SearchFilters, SearchOptions, DEFAULT_SEARCH_OPTIONS } from '../utils/searchEngine';
import { getAllSessions } from '../utils/dataProcessor';
import type { SessionDetail } from '../types';

interface SearchContextType {
  // Search state
  query: string;
  filters: SearchFilters;
  options: SearchOptions;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  
  // Search actions
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  setOptions: (options: SearchOptions) => void;
  performSearch: (query?: string, filters?: SearchFilters) => void;
  clearSearch: () => void;
  
  // Search utilities
  searchIndex: SearchIndex;
  getSuggestions: (query: string, limit?: number) => any[];
  getFilterOptions: () => any;
  
  // Quick search methods
  searchByPresenter: (presenter: string) => void;
  searchByTechnique: (technique: string) => void;
  searchByWorkshop: (workshop: string) => void;
  searchByYear: (year: number) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

interface SearchProviderProps {
  children: React.ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [query, setQueryState] = useState('');
  const [filters, setFiltersState] = useState<SearchFilters>({
    workshops: [],
    presenters: [],
    sessionTypes: [],
    topics: [],
    techniques: [],
    years: []
  });
  const [options, setOptionsState] = useState<SearchOptions>(DEFAULT_SEARCH_OPTIONS);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize search index
  const sessions = useMemo(() => getAllSessions(), []);
  const searchIndex = useMemo(() => new SearchIndex(sessions), [sessions]);

  const performSearch = useCallback((searchQuery?: string, searchFilters?: SearchFilters) => {
    const effectiveQuery = searchQuery !== undefined ? searchQuery : query;
    const effectiveFilters = searchFilters !== undefined ? searchFilters : filters;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = searchIndex.search(effectiveQuery, effectiveFilters, options);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, filters, options, searchIndex]);

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    // Auto-search after a delay
    const timer = setTimeout(() => {
      performSearch(newQuery, filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, performSearch]);

  const setFilters = useCallback((newFilters: SearchFilters) => {
    setFiltersState(newFilters);
    performSearch(query, newFilters);
  }, [query, performSearch]);

  const setOptions = useCallback((newOptions: SearchOptions) => {
    setOptionsState(newOptions);
    performSearch(query, filters);
  }, [query, filters, performSearch]);

  const clearSearch = useCallback(() => {
    setQueryState('');
    setFiltersState({
      workshops: [],
      presenters: [],
      sessionTypes: [],
      topics: [],
      techniques: [],
      years: []
    });
    setResults([]);
    setError(null);
  }, []);

  const getSuggestions = useCallback((searchQuery: string, limit: number = 10) => {
    return searchIndex.getSuggestions(searchQuery, limit);
  }, [searchIndex]);

  const getFilterOptions = useCallback(() => {
    return searchIndex.getFilterOptions();
  }, [searchIndex]);

  // Quick search methods
  const searchByPresenter = useCallback((presenter: string) => {
    const newFilters = { ...filters, presenters: [presenter] };
    setFilters(newFilters);
  }, [filters, setFilters]);

  const searchByTechnique = useCallback((technique: string) => {
    const newFilters = { ...filters, techniques: [technique] };
    setFilters(newFilters);
  }, [filters, setFilters]);

  const searchByWorkshop = useCallback((workshop: string) => {
    const newFilters = { ...filters, workshops: [workshop] };
    setFilters(newFilters);
  }, [filters, setFilters]);

  const searchByYear = useCallback((year: number) => {
    const newFilters = { ...filters, years: [year] };
    setFilters(newFilters);
  }, [filters, setFilters]);

  const value: SearchContextType = {
    // State
    query,
    filters,
    options,
    results,
    loading,
    error,
    
    // Actions
    setQuery,
    setFilters,
    setOptions,
    performSearch,
    clearSearch,
    
    // Utilities
    searchIndex,
    getSuggestions,
    getFilterOptions,
    
    // Quick search
    searchByPresenter,
    searchByTechnique,
    searchByWorkshop,
    searchByYear
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

// Hook for using search in components
export function useSearchState() {
  const {
    query,
    filters,
    options,
    results,
    loading,
    error
  } = useSearch();

  return {
    query,
    filters,
    options,
    results,
    loading,
    error,
    hasQuery: query.trim().length > 0,
    hasFilters: Object.values(filters).some(filter => 
      Array.isArray(filter) ? filter.length > 0 : filter
    ),
    hasResults: results.length > 0,
    isEmpty: results.length === 0 && !loading
  };
}

// Hook for search actions
export function useSearchActions() {
  const {
    setQuery,
    setFilters,
    setOptions,
    performSearch,
    clearSearch,
    searchByPresenter,
    searchByTechnique,
    searchByWorkshop,
    searchByYear
  } = useSearch();

  return {
    setQuery,
    setFilters,
    setOptions,
    performSearch,
    clearSearch,
    searchByPresenter,
    searchByTechnique,
    searchByWorkshop,
    searchByYear
  };
}

// Hook for search utilities
export function useSearchUtils() {
  const {
    searchIndex,
    getSuggestions,
    getFilterOptions
  } = useSearch();

  return {
    searchIndex,
    getSuggestions,
    getFilterOptions
  };
}