import React, { useState, useRef, useEffect } from 'react';
import { SearchSuggestion } from '../utils/searchEngine';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  suggestions: SearchSuggestion[];
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function SearchAutocomplete({
  value,
  onChange,
  onSearch,
  suggestions,
  onSuggestionClick,
  placeholder = "Search sessions, presenters, topics...",
  className = "",
  disabled = false,
  loading = false
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('evomics-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse recent searches:', e);
      }
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    if (query.trim().length < 2) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('evomics-recent-searches', JSON.stringify(updated));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        return;
      }
      if (e.key === 'Enter') {
        handleSearch();
        return;
      }
      return;
    }

    const totalItems = suggestions.length + (recentSearches.length > 0 ? recentSearches.length : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex < suggestions.length) {
            const suggestion = suggestions[highlightedIndex];
            onSuggestionClick(suggestion);
            onChange(suggestion.text);
            setIsOpen(false);
            saveRecentSearch(suggestion.text);
          } else {
            const recentIndex = highlightedIndex - suggestions.length;
            if (recentIndex < recentSearches.length) {
              const recent = recentSearches[recentIndex];
              onChange(recent);
              setIsOpen(false);
              handleSearch(recent);
            }
          }
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSearch = (query?: string) => {
    const searchQuery = query || value;
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      saveRecentSearch(searchQuery);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSuggestionClick(suggestion);
    onChange(suggestion.text);
    setIsOpen(false);
    saveRecentSearch(suggestion.text);
  };

  const handleRecentClick = (recent: string) => {
    onChange(recent);
    setIsOpen(false);
    handleSearch(recent);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay closing to allow click events on suggestions
    setTimeout(() => setIsOpen(false), 200);
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'presenter':
        return '👨‍🏫';
      case 'topic':
        return '🔬';
      case 'technique':
        return '🧬';
      case 'workshop':
        return '📚';
      case 'description':
        return '📄';
      default:
        return '🔍';
    }
  };

  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.category]) {
      acc[suggestion.category] = [];
    }
    acc[suggestion.category].push(suggestion);
    return acc;
  }, {} as Record<string, SearchSuggestion[]>);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 pl-12 pr-12 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Search Button */}
        <button
          type="button"
          onClick={() => handleSearch()}
          disabled={disabled || loading}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div 
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-200">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recent Searches</h4>
              <div className="space-y-1">
                {recentSearches.map((recent, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => handleRecentClick(recent)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center space-x-2 transition-colors ${
                      highlightedIndex === suggestions.length + index
                        ? 'bg-primary-50 text-primary-900'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-gray-400">🕐</span>
                    <span className="text-gray-700">{recent}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions by Category */}
          {Object.entries(groupedSuggestions).map(([category, categorySuggestions]) => (
            <div key={category} className="p-3 border-b border-gray-200 last:border-b-0">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{category}</h4>
              <div className="space-y-1">
                {categorySuggestions.map((suggestion, index) => {
                  const globalIndex = suggestions.indexOf(suggestion);
                  return (
                    <button
                      key={`${suggestion.type}-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                        highlightedIndex === globalIndex
                          ? 'bg-primary-50 text-primary-900'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{getSuggestionIcon(suggestion.type)}</span>
                        <span className="text-gray-900">{suggestion.text}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {suggestion.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* No Results */}
          {suggestions.length === 0 && recentSearches.length === 0 && value.trim() && (
            <div className="p-4 text-center text-gray-500">
              <div className="text-2xl mb-2">🔍</div>
              <p>No suggestions found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}

          {/* Empty State */}
          {suggestions.length === 0 && recentSearches.length === 0 && !value.trim() && (
            <div className="p-4 text-center text-gray-500">
              <div className="text-2xl mb-2">💡</div>
              <p className="font-medium">Start typing to search</p>
              <p className="text-sm">Try searching for:</p>
              <div className="mt-2 space-x-2">
                <span className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs">phylogeny</span>
                <span className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs">genomics</span>
                <span className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs">BLAST</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchAutocomplete;