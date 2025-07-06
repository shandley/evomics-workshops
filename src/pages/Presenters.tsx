import React, { useState, useMemo } from 'react';
import { PresenterList, PresenterCard } from '../components/PresenterCard';
import { PresenterModal } from '../components/PresenterModal';
import { HierarchicalExpertiseFilter } from '../components/HierarchicalExpertiseFilter';
import type { PresenterProfile } from '../types';
import { 
  processPresenterProfiles, 
  searchPresentersByExpertise,
  getRelatedPresenters 
} from '../utils/presenterProcessor';
import { loadAllWorkshopData } from '../utils/dataProcessor';
import { mapExpertiseToTaxonomy, findNodeById, EXPERTISE_TAXONOMY } from '../utils/expertiseTaxonomy';

const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'sessions', label: 'Most Sessions' },
  { value: 'workshops', label: 'Most Workshops' },
  { value: 'recent', label: 'Recently Active' },
  { value: 'years', label: 'Years Active' }
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Presenters' },
  { value: 'enriched', label: 'Faculty Members' },
  { value: 'recent', label: 'Recently Active' },
  { value: 'experienced', label: 'Experienced (10+ sessions)' }
];

function Presenters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPresenter, setSelectedPresenter] = useState<PresenterProfile | null>(null);
  const [sortBy, setSortBy] = useState('sessions');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [showExpertiseFilter, setShowExpertiseFilter] = useState(false);

  // Load presenter data
  const presenterDirectory = useMemo(() => {
    const workshopData = loadAllWorkshopData();
    return processPresenterProfiles(workshopData);
  }, []);

  const presenters = useMemo(() => Object.values(presenterDirectory), [presenterDirectory]);

  // Filter and sort presenters
  const filteredPresenters = useMemo(() => {
    let filtered = presenters;

    // Apply text search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(presenter => 
        presenter.name.toLowerCase().includes(search) ||
        presenter.enrichment?.professional?.affiliation?.toLowerCase().includes(search) ||
        presenter.expertise.primaryAreas.some(area => area.toLowerCase().includes(search)) ||
        presenter.expertise.techniques.some(technique => technique.toLowerCase().includes(search))
      );
    }

    // Apply expertise filter using taxonomy
    if (selectedExpertise.length > 0) {
      filtered = filtered.filter(presenter => {
        // Map presenter's existing expertise to taxonomy
        const presenterExpertise = [
          ...presenter.expertise.primaryAreas,
          ...presenter.expertise.techniques
        ];
        const mappedExpertise = mapExpertiseToTaxonomy(presenterExpertise);
        
        // Check if any selected expertise matches
        return selectedExpertise.some(selectedId => {
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
      });
    }

    // Apply categorical filters
    switch (filterBy) {
      case 'enriched':
        filtered = filtered.filter(p => !!p.enrichment);
        break;
      case 'recent':
        filtered = filtered.filter(p => p.teaching.recentActivity);
        break;
      case 'experienced':
        filtered = filtered.filter(p => p.teaching.totalSessions >= 10);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'sessions':
          return b.teaching.totalSessions - a.teaching.totalSessions;
        case 'workshops':
          return b.teaching.workshopsParticipated.length - a.teaching.workshopsParticipated.length;
        case 'recent':
          return (b.teaching.recentActivity ? 1 : 0) - (a.teaching.recentActivity ? 1 : 0);
        case 'years':
          return (b.teaching.lastTaught - b.teaching.firstTaught) - (a.teaching.lastTaught - a.teaching.firstTaught);
        default:
          return 0;
      }
    });

    return filtered;
  }, [presenters, searchTerm, selectedExpertise, filterBy, sortBy, presenterDirectory]);

  // Get related presenters for modal
  const relatedPresenters = useMemo(() => {
    if (!selectedPresenter) return [];
    return getRelatedPresenters(selectedPresenter, presenterDirectory, 5);
  }, [selectedPresenter, presenterDirectory]);

  // Summary statistics
  const stats = useMemo(() => {
    const enrichedCount = presenters.filter(p => !!p.enrichment).length;
    const recentlyActiveCount = presenters.filter(p => p.teaching.recentActivity).length;
    const averageSessions = Math.round(
      presenters.reduce((sum, p) => sum + p.teaching.totalSessions, 0) / presenters.length
    );

    return {
      total: presenters.length,
      enriched: enrichedCount,
      recentlyActive: recentlyActiveCount,
      averageSessions
    };
  }, [presenters]);

  const handleViewProfile = (presenter: PresenterProfile) => {
    setSelectedPresenter(presenter);
  };

  const handleCloseModal = () => {
    setSelectedPresenter(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Workshop Presenters</h1>
          <p className="text-xl text-primary-100 mb-6">
            Discover the experts who shape Evomics education
          </p>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary-500 bg-opacity-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-primary-200">Total Presenters</div>
            </div>
            <div className="bg-primary-500 bg-opacity-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{stats.enriched}</div>
              <div className="text-sm text-primary-200">Faculty Members</div>
            </div>
            <div className="bg-primary-500 bg-opacity-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{stats.recentlyActive}</div>
              <div className="text-sm text-primary-200">Recently Active</div>
            </div>
            <div className="bg-primary-500 bg-opacity-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{stats.averageSessions}</div>
              <div className="text-sm text-primary-200">Avg. Sessions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left column: Search and basic filters */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Search */}
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Search Presenters
                  </label>
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by name, institution..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Category filter */}
                <div>
                  <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
                    Filter Category
                  </label>
                  <select
                    id="filter"
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {FILTER_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results count and expertise toggle */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {filteredPresenters.length} of {presenters.length} presenters
                  {searchTerm && ` matching "${searchTerm}"`}
                  {selectedExpertise.length > 0 && ` with ${selectedExpertise.length} expertise filter${selectedExpertise.length === 1 ? '' : 's'}`}
                </p>
                <button
                  onClick={() => setShowExpertiseFilter(!showExpertiseFilter)}
                  className="lg:hidden flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-800"
                >
                  <span>{showExpertiseFilter ? 'Hide' : 'Show'} Expertise Filter</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${showExpertiseFilter ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right column: Hierarchical expertise filter */}
          <div className={`${showExpertiseFilter ? 'block' : 'hidden lg:block'}`}>
            <HierarchicalExpertiseFilter
              selectedExpertise={selectedExpertise}
              onExpertiseChange={setSelectedExpertise}
            />
          </div>
        </div>

        {/* Presenter grid */}
        <PresenterList
          presenters={filteredPresenters}
          onViewProfile={handleViewProfile}
          showTeachingStats={true}
          emptyMessage={
            searchTerm || selectedExpertise.length > 0 || filterBy !== 'all'
              ? "No presenters match your current filters"
              : "No presenters found"
          }
        />

        {/* Featured section for top presenters */}
        {!searchTerm && selectedExpertise.length === 0 && filterBy === 'all' && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Most Active Presenters</h2>
              <p className="text-gray-600">Presenters with the most workshop sessions taught</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presenters
                .filter(p => p.teaching.totalSessions >= 5)
                .slice(0, 6)
                .map(presenter => (
                  <PresenterCard
                    key={presenter.id}
                    presenter={presenter}
                    onViewProfile={handleViewProfile}
                    showTeachingStats={true}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Presenter Modal */}
      <PresenterModal
        presenter={selectedPresenter}
        isOpen={!!selectedPresenter}
        onClose={handleCloseModal}
        relatedPresenters={relatedPresenters}
        onViewRelated={handleViewProfile}
      />
    </div>
  );
}

export default Presenters;