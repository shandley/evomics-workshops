import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchActions } from '../contexts/SearchContext';

interface QuickSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function QuickSearch({ 
  placeholder = "Quick search...", 
  className = "",
  onSearch 
}: QuickSearchProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { setQuery: setGlobalQuery } = useSearchActions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        setGlobalQuery(query.trim());
        navigate('/search');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Search Button */}
        {query && (
          <button
            type="submit"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}

// Quick search filters component
interface QuickSearchFiltersProps {
  className?: string;
}

export function QuickSearchFilters({ className = "" }: QuickSearchFiltersProps) {
  const navigate = useNavigate();
  const { searchByWorkshop, searchByYear, searchByTechnique } = useSearchActions();

  const handleQuickFilter = (type: string, value: string | number) => {
    switch (type) {
      case 'workshop':
        searchByWorkshop(value as string);
        break;
      case 'year':
        searchByYear(value as number);
        break;
      case 'technique':
        searchByTechnique(value as string);
        break;
    }
    navigate('/search');
  };

  const quickFilters = [
    { type: 'workshop', label: 'WoG', value: 'wog' },
    { type: 'workshop', label: 'WPSG', value: 'wpsg' },
    { type: 'workshop', label: 'WPhylo', value: 'wphylo' },
    { type: 'year', label: '2024', value: 2024 },
    { type: 'year', label: '2023', value: 2023 },
    { type: 'technique', label: 'BLAST', value: 'BLAST' },
    { type: 'technique', label: 'Phylogeny', value: 'phylogeny' },
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <span className="text-sm text-gray-500 font-medium">Quick filters:</span>
      {quickFilters.map((filter, index) => (
        <button
          key={index}
          onClick={() => handleQuickFilter(filter.type, filter.value)}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default QuickSearch;