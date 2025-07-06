import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllSessions, getWorkshops } from '../utils/dataProcessor';
import { SearchIndex, SearchResult, SearchOptions, DEFAULT_SEARCH_OPTIONS, highlightText } from '../utils/searchEngine';
import type { SavedSearch, SearchFilters } from '../utils/searchEngine';
import { saveCurrentSearch } from '../utils/savedSearches';
import SearchAutocomplete from '../components/SearchAutocomplete';
import SavedSearches from '../components/SavedSearches';
import { convertFacultyIdToName } from '../utils/facultyHelper';
import type { SessionDetail } from '../types';

interface SearchResultCardProps {
  result: SearchResult;
  onSessionClick: (session: SessionDetail) => void;
}

function SearchResultCard({ result, onSessionClick }: SearchResultCardProps) {
  const { item: session, score, matches, relevance } = result;
  
  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchText = (match: any) => {
    if (match.highlights.length > 0) {
      return highlightText(match.value, match.highlights);
    }
    return match.value;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {session.workshopId.toUpperCase()} • {session.year}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(relevance)}`}>
              {relevance} relevance
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {session.topic}
          </h3>
          
          <div className="text-sm text-gray-600 mb-3">
            <p><strong>Type:</strong> {session.type}</p>
            <p><strong>Presenter:</strong> {convertFacultyIdToName(session.presenters[0])}</p>
            {session.coPresenters && session.coPresenters.length > 0 && (
              <p><strong>Co-presenters:</strong> {session.coPresenters.map(convertFacultyIdToName).join(', ')}</p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-2">
            Score: {score.toFixed(2)}
          </div>
          <button
            onClick={() => onSessionClick(session)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Session Details */}
      <div className="mb-4">
        <div className="text-sm text-gray-600">
          <p><strong>Date:</strong> {session.date}</p>
          <p><strong>Time:</strong> {session.time}</p>
          {session.location && <p><strong>Location:</strong> {session.location}</p>}
        </div>
      </div>

      {/* Search Matches */}
      {matches.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Matches</h4>
          <div className="space-y-2">
            {matches.slice(0, 3).map((match, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium capitalize text-gray-600">{match.field}:</span>
                <span 
                  className="ml-2 text-gray-800"
                  dangerouslySetInnerHTML={{ __html: getMatchText(match) }}
                />
              </div>
            ))}
            {matches.length > 3 && (
              <div className="text-xs text-gray-500">
                +{matches.length - 3} more matches
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  filterOptions: {
    workshops: string[];
    presenters: string[];
    sessionTypes: string[];
    techniques: string[];
    years: number[];
  };
  resultCount: number;
}

function SearchFilters({ filters, onFiltersChange, filterOptions, resultCount }: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters = Object.values(filters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : filter
  );

  const clearAllFilters = () => {
    onFiltersChange({
      workshops: [],
      presenters: [],
      sessionTypes: [],
      topics: [],
      techniques: [],
      years: []
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Search Filters</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{resultCount} results</span>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Workshops */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workshop Series
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {filterOptions.workshops.map(workshop => (
              <label key={workshop} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.workshops.includes(workshop)}
                  onChange={(e) => {
                    const newWorkshops = e.target.checked
                      ? [...filters.workshops, workshop]
                      : filters.workshops.filter(w => w !== workshop);
                    onFiltersChange({ ...filters, workshops: newWorkshops });
                  }}
                  className="mr-2"
                />
                {workshop.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        {/* Session Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Types
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {filterOptions.sessionTypes.map(type => (
              <label key={type} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.sessionTypes.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...filters.sessionTypes, type]
                      : filters.sessionTypes.filter(t => t !== type);
                    onFiltersChange({ ...filters, sessionTypes: newTypes });
                  }}
                  className="mr-2"
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Years */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {filterOptions.years.map(year => (
              <label key={year} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.years.includes(year)}
                  onChange={(e) => {
                    const newYears = e.target.checked
                      ? [...filters.years, year]
                      : filters.years.filter(y => y !== year);
                    onFiltersChange({ ...filters, years: newYears });
                  }}
                  className="mr-2"
                />
                {year}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Top Presenters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Presenters
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {filterOptions.presenters.slice(0, 30).map(presenter => (
                <label key={presenter} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={filters.presenters.includes(presenter)}
                    onChange={(e) => {
                      const newPresenters = e.target.checked
                        ? [...filters.presenters, presenter]
                        : filters.presenters.filter(p => p !== presenter);
                      onFiltersChange({ ...filters, presenters: newPresenters });
                    }}
                    className="mr-2"
                  />
                  {convertFacultyIdToName(presenter)}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFilters>({
    workshops: [],
    presenters: [],
    sessionTypes: [],
    topics: [],
    techniques: [],
    years: []
  });
  const [searchOptions, setSearchOptions] = useState<SearchOptions>(DEFAULT_SEARCH_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);

  // Initialize search index
  const sessions = useMemo(() => getAllSessions(), []);
  const workshops = useMemo(() => getWorkshops(), []);
  const searchIndex = useMemo(() => new SearchIndex(sessions), [sessions]);

  // Get filter options
  const filterOptions = useMemo(() => searchIndex.getFilterOptions(), [searchIndex]);

  // Get search suggestions
  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    return searchIndex.getSuggestions(query, 8);
  }, [query, searchIndex]);

  // Perform search
  useEffect(() => {
    if (query.trim() || Object.values(filters).some(filter => 
      Array.isArray(filter) ? filter.length > 0 : filter
    )) {
      setLoading(true);
      try {
        const results = searchIndex.search(query, filters, searchOptions);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  }, [query, filters, searchOptions, searchIndex]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    setSearchParams(params);
  }, [query, setSearchParams]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.text);
  };

  const handleSessionClick = (session: SessionDetail) => {
    navigate(`/sessions/${session.id}`);
  };

  const handleLoadSavedSearch = (savedSearch: SavedSearch) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    setShowSavedSearches(false);
  };

  const handleSaveSearch = (name: string, searchQuery: string, searchFilters: SearchFilters, resultCount: number) => {
    saveCurrentSearch(name, searchQuery, searchFilters, resultCount);
  };

  const hasSearched = query.trim() || Object.values(filters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : filter
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Workshop Search</h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          Search through {sessions.length} sessions with full-text search, autocomplete, and advanced filtering.
        </p>
      </div>

      {/* Search Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Search Bar */}
          <SearchAutocomplete
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
            loading={loading}
            placeholder="Search sessions, presenters, topics, techniques..."
          />

          {/* Search Options */}
          <div className="flex items-center space-x-4 text-sm">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={searchOptions.fuzzyMatch}
                onChange={(e) => setSearchOptions({...searchOptions, fuzzyMatch: e.target.checked})}
              />
              <span>Fuzzy matching</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={searchOptions.includePresenters}
                onChange={(e) => setSearchOptions({...searchOptions, includePresenters: e.target.checked})}
              />
              <span>Include presenters</span>
            </label>
          </div>

          {/* Filters */}
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            filterOptions={filterOptions}
            resultCount={searchResults.length}
          />

          {/* Search Results */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          )}

          {!loading && hasSearched && searchResults.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Search Results ({searchResults.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <select
                    value={searchOptions.maxResults}
                    onChange={(e) => setSearchOptions({...searchOptions, maxResults: parseInt(e.target.value)})}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value={10}>10 results</option>
                    <option value={25}>25 results</option>
                    <option value={50}>50 results</option>
                    <option value={100}>100 results</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-6">
                {searchResults.map((result, index) => (
                  <SearchResultCard
                    key={`${result.item.id}-${index}`}
                    result={result}
                    onSessionClick={handleSessionClick}
                  />
                ))}
              </div>
            </div>
          )}

          {!loading && !hasSearched && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start your search</h3>
              <p className="text-gray-600">Enter a search term or apply filters to find sessions</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <button
            onClick={() => setShowSavedSearches(!showSavedSearches)}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {showSavedSearches ? 'Hide' : 'Show'} Saved Searches
          </button>

          {showSavedSearches && (
            <SavedSearches
              onLoadSearch={handleLoadSavedSearch}
              onSaveSearch={handleSaveSearch}
              currentQuery={query}
              currentFilters={filters}
              currentResultCount={searchResults.length}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;