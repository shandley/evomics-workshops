import React, { useState, useEffect } from 'react';
import { SavedSearch, SearchFilters } from '../utils/searchEngine';
import { savedSearchManager, QUICK_SEARCH_TEMPLATES, applyQuickSearchTemplate } from '../utils/savedSearches';

interface SavedSearchesProps {
  onLoadSearch: (search: SavedSearch) => void;
  onSaveSearch: (name: string, query: string, filters: SearchFilters, resultCount: number) => void;
  currentQuery: string;
  currentFilters: SearchFilters;
  currentResultCount: number;
  className?: string;
}

export function SavedSearches({
  onLoadSearch,
  onSaveSearch,
  currentQuery,
  currentFilters,
  currentResultCount,
  className = ""
}: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = () => {
    setSavedSearches(savedSearchManager.getAllSearches());
  };

  const handleSaveSearch = () => {
    if (newSearchName.trim()) {
      const uniqueName = savedSearchManager.generateUniqueName(newSearchName);
      onSaveSearch(uniqueName, currentQuery, currentFilters, currentResultCount);
      setNewSearchName('');
      setShowSaveDialog(false);
      loadSavedSearches();
    }
  };

  const handleLoadSearch = (search: SavedSearch) => {
    const loaded = savedSearchManager.loadSearch(search.id);
    if (loaded) {
      onLoadSearch(loaded);
      loadSavedSearches(); // Refresh to update last used time
    }
  };

  const handleDeleteSearch = (id: string) => {
    if (window.confirm('Are you sure you want to delete this saved search?')) {
      savedSearchManager.deleteSearch(id);
      loadSavedSearches();
    }
  };

  const handleRenameSearch = (search: SavedSearch) => {
    setEditingSearch(search);
    setNewSearchName(search.name);
  };

  const handleUpdateSearchName = () => {
    if (editingSearch && newSearchName.trim()) {
      savedSearchManager.renameSearch(editingSearch.id, newSearchName);
      setEditingSearch(null);
      setNewSearchName('');
      loadSavedSearches();
    }
  };

  const handleApplyTemplate = (template: typeof QUICK_SEARCH_TEMPLATES[0]) => {
    const savedSearch = applyQuickSearchTemplate(template);
    onLoadSearch(savedSearch);
    setShowQuickTemplates(false);
    loadSavedSearches();
  };

  const canSaveCurrentSearch = currentQuery.trim().length > 0 || 
    Object.values(currentFilters).some(filter => 
      Array.isArray(filter) ? filter.length > 0 : filter
    );

  const formatFilters = (filters: SearchFilters): string => {
    const activeFilters = [];
    if (filters.workshops.length > 0) activeFilters.push(`${filters.workshops.length} workshops`);
    if (filters.presenters.length > 0) activeFilters.push(`${filters.presenters.length} presenters`);
    if (filters.sessionTypes.length > 0) activeFilters.push(`${filters.sessionTypes.length} types`);
    if (filters.years.length > 0) activeFilters.push(`${filters.years.length} years`);
    if (filters.topics.length > 0) activeFilters.push(`${filters.topics.length} topics`);
    if (filters.techniques.length > 0) activeFilters.push(`${filters.techniques.length} techniques`);
    
    return activeFilters.length > 0 ? activeFilters.join(', ') : 'No filters';
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Saved Searches</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowQuickTemplates(!showQuickTemplates)}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
            >
              📋 Templates
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={!canSaveCurrentSearch}
              className="px-3 py-1 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              💾 Save Current
            </button>
          </div>
        </div>
      </div>

      {/* Quick Templates */}
      {showQuickTemplates && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Search Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {QUICK_SEARCH_TEMPLATES.map((template, index) => (
              <button
                key={index}
                onClick={() => handleApplyTemplate(template)}
                className="text-left p-3 bg-white rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{template.name}</div>
                <div className="text-sm text-gray-600 mt-1">{template.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saved Searches List */}
      <div className="max-h-96 overflow-y-auto">
        {savedSearches.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-lg font-medium">No saved searches yet</p>
            <p className="text-sm">Save your searches to access them quickly later</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {savedSearches.map((search) => (
              <div key={search.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {search.name}
                      </h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {search.resultCount} results
                      </span>
                    </div>
                    
                    {search.query && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        "{search.query}"
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Filters: {formatFilters(search.filters)}</span>
                      <span>•</span>
                      <span>Last used: {formatDate(search.lastUsed)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleLoadSearch(search)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Load this search"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRenameSearch(search)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      title="Rename this search"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteSearch(search.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete this search"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Search</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Name
                </label>
                <input
                  type="text"
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  placeholder="Enter a name for this search..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Query:</strong> {currentQuery || 'None'}</p>
                <p><strong>Filters:</strong> {formatFilters(currentFilters)}</p>
                <p><strong>Results:</strong> {currentResultCount} sessions</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewSearchName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={!newSearchName.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {editingSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rename Search</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Name
                </label>
                <input
                  type="text"
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setEditingSearch(null);
                  setNewSearchName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSearchName}
                disabled={!newSearchName.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedSearches;