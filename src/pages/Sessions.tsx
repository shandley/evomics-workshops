import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllSessions, getFilterOptions, searchSessions, getWorkshops, loadAllWorkshopData } from '../utils/dataProcessor';
import { processPresenterProfiles, searchPresentersByExpertise } from '../utils/presenterProcessor';
import { convertFacultyIdToName } from '../utils/facultyHelper';
import { HierarchicalExpertiseFilter } from '../components/HierarchicalExpertiseFilter';
import { mapExpertiseToTaxonomy, findNodeById, EXPERTISE_TAXONOMY } from '../utils/expertiseTaxonomy';
import type { SearchFilters, SessionDetail } from '../types';

const Sessions: React.FC = () => {
  const allSessions = useMemo(() => getAllSessions(), []);
  const workshops = useMemo(() => getWorkshops(), []);
  const filterOptions = useMemo(() => getFilterOptions(allSessions), [allSessions]);
  
  // Load presenter profiles for expertise filtering
  const presenterDirectory = useMemo(() => {
    const workshopData = loadAllWorkshopData();
    return processPresenterProfiles(workshopData);
  }, []);


  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    workshop: [],
    year: null,
    sessionType: [],
    presenter: [],
    topic: [],
  });

  const [expertiseFilter, setExpertiseFilter] = useState<string[]>([]);
  const [showExpertiseFilter, setShowExpertiseFilter] = useState(false);

  const [sortBy, setSortBy] = useState<'date' | 'topic' | 'presenter'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredSessions = useMemo(() => {
    let result = searchSessions(allSessions, filters.search, {
      workshop: filters.workshop,
      year: filters.year,
      sessionType: filters.sessionType,
      presenter: filters.presenter,
    });

    // Apply expertise filtering using taxonomy
    if (expertiseFilter.length > 0) {
      const expertsInAreas = new Set<string>();
      
      // Find all presenters that match the selected expertise areas
      Object.values(presenterDirectory).forEach(presenter => {
        // Map presenter's existing expertise to taxonomy
        const presenterExpertise = [
          ...presenter.expertise.primaryAreas,
          ...presenter.expertise.techniques
        ];
        const mappedExpertise = mapExpertiseToTaxonomy(presenterExpertise);
        
        // Check if any selected expertise matches
        const hasMatchingExpertise = expertiseFilter.some(selectedId => {
          if (mappedExpertise.includes(selectedId)) return true;
          
          // Also check text-based matching for non-taxonomy items
          const node = findNodeById(EXPERTISE_TAXONOMY, selectedId);
          if (node) {
            const searchTerms = [node.label, ...(node.aliases || [])];
            return searchTerms.some(term => 
              presenterExpertise.some(exp => 
                exp.toLowerCase().includes(term.toLowerCase()) ||
                term.toLowerCase().includes(exp.toLowerCase())
              )
            );
          }
          return false;
        });
        
        if (hasMatchingExpertise) {
          expertsInAreas.add(presenter.name.toLowerCase());
        }
      });
      
      result = result.filter(session => 
        session.presenters.some(presenter => 
          expertsInAreas.has(presenter.toLowerCase())
        ) ||
        (session.coPresenters || []).some(presenter => 
          expertsInAreas.has(presenter.toLowerCase())
        )
      );
    }

    // Sort results
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.year - b.year;
          break;
        case 'topic':
          comparison = a.topic.localeCompare(b.topic);
          break;
        case 'presenter':
          comparison = a.presenters[0]?.localeCompare(b.presenters[0] || '') || 0;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [allSessions, filters, expertiseFilter, presenterDirectory, sortBy, sortOrder]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      workshop: [],
      year: null,
      sessionType: [],
      presenter: [],
      topic: [],
    });
    setExpertiseFilter([]);
  };

  const getWorkshopColor = (workshopId: string) => {
    const colors = {
      'wog': 'bg-blue-100 text-blue-800',
      'wpsg': 'bg-green-100 text-green-800',
      'wphylo': 'bg-purple-100 text-purple-800',
      'wmolevo': 'bg-orange-100 text-orange-800',
      'htranscriptomics': 'bg-pink-100 text-pink-800',
      'hmicrobial': 'bg-indigo-100 text-indigo-800',
    };
    return colors[workshopId as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workshop Sessions</h1>
          <p className="text-gray-600 mt-1">
            Showing {filteredSessions.length} of {allSessions.length} sessions
          </p>
        </div>
        
        {/* Sort Controls */}
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'topic' | 'presenter')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="topic">Sort by Topic</option>
            <option value="presenter">Sort by Presenter</option>
          </select>
          
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left: Basic Filters */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search topics, presenters..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  value={filters.year || ''}
                  onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Years</option>
                  {filterOptions.years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Workshop */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workshop</label>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {filterOptions.workshops.map(workshopId => (
                    <label key={workshopId} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={filters.workshop.includes(workshopId)}
                        onChange={() => toggleArrayFilter('workshop', workshopId)}
                        className="mr-2"
                      />
                      {workshops[workshopId]?.shortName || workshopId}
                    </label>
                  ))}
                </div>
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {filterOptions.sessionTypes.map(type => (
                    <label key={type} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={filters.sessionType.includes(type)}
                        onChange={() => toggleArrayFilter('sessionType', type)}
                        className="mr-2"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Presenter Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presenter Name
                  <Link 
                    to="/presenters" 
                    className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Browse all →
                  </Link>
                </label>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {filterOptions.presenters.slice(0, 8).map(presenter => (
                    <label key={presenter} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={filters.presenter.includes(presenter)}
                        onChange={() => toggleArrayFilter('presenter', presenter)}
                        className="mr-2"
                      />
                      <span className="truncate">{convertFacultyIdToName(presenter)}</span>
                    </label>
                  ))}
                  {filterOptions.presenters.length > 8 && (
                    <div className="text-xs text-gray-500 pt-1">
                      ... and {filterOptions.presenters.length - 8} more
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Summary and Clear */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredSessions.length} of {allSessions.length} sessions
                {expertiseFilter.length > 0 && ` with ${expertiseFilter.length} expertise filter${expertiseFilter.length === 1 ? '' : 's'}`}
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowExpertiseFilter(!showExpertiseFilter)}
                  className="lg:hidden text-sm text-blue-600 hover:text-blue-800"
                >
                  {showExpertiseFilter ? 'Hide' : 'Show'} Expertise Filter
                </button>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Hierarchical Expertise Filter */}
        <div className={`${showExpertiseFilter ? 'block' : 'hidden lg:block'}`}>
          <HierarchicalExpertiseFilter
            selectedExpertise={expertiseFilter}
            onExpertiseChange={setExpertiseFilter}
          />
        </div>
      </div>

      {/* Session List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-white/20">
            <p className="text-gray-500">No sessions found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Clear filters to see all sessions
            </button>
          </div>
        ) : (
          filteredSessions.map((session: SessionDetail) => (
            <div key={session.id} className="bg-white/80 backdrop-blur rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] p-6 border border-white/20">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkshopColor(session.workshopId)}`}>
                      {workshops[session.workshopId]?.shortName || session.workshopId}
                    </span>
                    <span className="text-gray-500 text-sm">{session.year}</span>
                    <span className="text-gray-500 text-sm">{session.date}</span>
                    <span className="text-gray-500 text-sm">{session.time}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    <Link 
                      to={`/sessions/${session.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {session.topic}
                    </Link>
                  </h3>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Presenter:</strong> {convertFacultyIdToName(session.presenters[0])}</p>
                    {session.coPresenters && session.coPresenters.length > 0 && (
                      <p><strong>Co-presenters:</strong> {session.coPresenters.map(convertFacultyIdToName).join(', ')}</p>
                    )}
                    <p><strong>Type:</strong> {session.type}</p>
                    {session.location && <p><strong>Location:</strong> {session.location}</p>}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-4">
                  <Link
                    to={`/sessions/${session.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More / Pagination placeholder */}
      {filteredSessions.length > 50 && (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">
            Showing first 50 results. Use filters to narrow your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default Sessions;