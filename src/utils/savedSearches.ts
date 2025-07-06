import { SavedSearch, SearchFilters } from './searchEngine';

const STORAGE_KEY = 'evomics-saved-searches';
const MAX_SAVED_SEARCHES = 20;

export class SavedSearchManager {
  private searches: SavedSearch[] = [];

  constructor() {
    this.loadSavedSearches();
  }

  private loadSavedSearches() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.searches = parsed.map((search: any) => ({
          ...search,
          createdAt: new Date(search.createdAt),
          lastUsed: new Date(search.lastUsed)
        }));
      }
    } catch (error) {
      console.warn('Failed to load saved searches:', error);
      this.searches = [];
    }
  }

  private saveToBrowser() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.searches));
    } catch (error) {
      console.warn('Failed to save searches to localStorage:', error);
    }
  }

  // Get all saved searches, sorted by last used
  getAllSearches(): SavedSearch[] {
    return [...this.searches].sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
  }

  // Get recent searches (last 5)
  getRecentSearches(): SavedSearch[] {
    return this.getAllSearches().slice(0, 5);
  }

  // Get favorite searches (can be extended later)
  getFavoriteSearches(): SavedSearch[] {
    return this.getAllSearches().filter(search => search.name.includes('⭐'));
  }

  // Save a new search
  saveSearch(name: string, query: string, filters: SearchFilters, resultCount: number = 0): SavedSearch {
    const now = new Date();
    const search: SavedSearch = {
      id: this.generateId(),
      name: name.trim(),
      query: query.trim(),
      filters: { ...filters },
      createdAt: now,
      lastUsed: now,
      resultCount
    };

    // Check if a search with the same name already exists
    const existingIndex = this.searches.findIndex(s => s.name === search.name);
    if (existingIndex >= 0) {
      // Update existing search
      this.searches[existingIndex] = { ...search, createdAt: this.searches[existingIndex].createdAt };
    } else {
      // Add new search
      this.searches.push(search);
    }

    // Limit the number of saved searches
    if (this.searches.length > MAX_SAVED_SEARCHES) {
      this.searches = this.searches
        .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
        .slice(0, MAX_SAVED_SEARCHES);
    }

    this.saveToBrowser();
    return search;
  }

  // Load and use a saved search
  loadSearch(id: string): SavedSearch | null {
    const search = this.searches.find(s => s.id === id);
    if (search) {
      // Update last used time
      search.lastUsed = new Date();
      this.saveToBrowser();
      return search;
    }
    return null;
  }

  // Delete a saved search
  deleteSearch(id: string): boolean {
    const index = this.searches.findIndex(s => s.id === id);
    if (index >= 0) {
      this.searches.splice(index, 1);
      this.saveToBrowser();
      return true;
    }
    return false;
  }

  // Update a saved search
  updateSearch(id: string, updates: Partial<SavedSearch>): boolean {
    const index = this.searches.findIndex(s => s.id === id);
    if (index >= 0) {
      this.searches[index] = {
        ...this.searches[index],
        ...updates,
        lastUsed: new Date()
      };
      this.saveToBrowser();
      return true;
    }
    return false;
  }

  // Rename a saved search
  renameSearch(id: string, newName: string): boolean {
    return this.updateSearch(id, { name: newName.trim() });
  }

  // Check if a search name is already used
  isNameTaken(name: string, excludeId?: string): boolean {
    return this.searches.some(s => s.name === name.trim() && s.id !== excludeId);
  }

  // Generate a unique search name
  generateUniqueName(baseName: string): string {
    let name = baseName.trim();
    let counter = 1;
    
    while (this.isNameTaken(name)) {
      name = `${baseName.trim()} (${counter})`;
      counter++;
    }
    
    return name;
  }

  // Get search statistics
  getStatistics() {
    const totalSearches = this.searches.length;
    const totalQueries = this.searches.reduce((sum, s) => sum + 1, 0);
    const avgResultCount = this.searches.length > 0 
      ? this.searches.reduce((sum, s) => sum + s.resultCount, 0) / this.searches.length
      : 0;
    
    const mostUsed = this.searches.reduce((most, current) => 
      current.lastUsed > most.lastUsed ? current : most
    , this.searches[0]);

    return {
      totalSearches,
      totalQueries,
      avgResultCount: Math.round(avgResultCount),
      mostUsed: mostUsed?.name || 'None',
      oldestSearch: this.searches.length > 0 
        ? Math.min(...this.searches.map(s => s.createdAt.getTime()))
        : null
    };
  }

  // Export searches (for backup)
  exportSearches(): string {
    return JSON.stringify(this.searches, null, 2);
  }

  // Import searches (from backup)
  importSearches(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      if (Array.isArray(imported)) {
        const validSearches = imported.filter(this.isValidSearch);
        this.searches = validSearches.map(search => ({
          ...search,
          createdAt: new Date(search.createdAt),
          lastUsed: new Date(search.lastUsed)
        }));
        this.saveToBrowser();
        return true;
      }
    } catch (error) {
      console.warn('Failed to import searches:', error);
    }
    return false;
  }

  // Clear all saved searches
  clearAllSearches() {
    this.searches = [];
    this.saveToBrowser();
  }

  private generateId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isValidSearch(search: any): boolean {
    return search && 
           typeof search.id === 'string' &&
           typeof search.name === 'string' &&
           typeof search.query === 'string' &&
           typeof search.filters === 'object' &&
           search.createdAt &&
           search.lastUsed;
  }
}

// Singleton instance
export const savedSearchManager = new SavedSearchManager();

// Utility functions for common operations
export function saveCurrentSearch(name: string, query: string, filters: SearchFilters, resultCount: number = 0): SavedSearch {
  return savedSearchManager.saveSearch(name, query, filters, resultCount);
}

export function loadSavedSearch(id: string): SavedSearch | null {
  return savedSearchManager.loadSearch(id);
}

export function deleteSavedSearch(id: string): boolean {
  return savedSearchManager.deleteSearch(id);
}

export function getAllSavedSearches(): SavedSearch[] {
  return savedSearchManager.getAllSearches();
}

export function getRecentSearches(): SavedSearch[] {
  return savedSearchManager.getRecentSearches();
}

// Quick search templates
export const QUICK_SEARCH_TEMPLATES = [
  {
    name: 'Phylogenetic Analysis',
    query: 'phylogeny tree reconstruction',
    filters: { workshops: [], presenters: [], sessionTypes: ['Lecture', 'Practical'], topics: ['phylogeny'], techniques: [], years: [] } as SearchFilters,
    description: 'Find sessions about phylogenetic tree reconstruction and analysis'
  },
  {
    name: 'Genomic Variants',
    query: 'variant calling SNP mutation',
    filters: { workshops: [], presenters: [], sessionTypes: ['Practical'], topics: ['genomics'], techniques: [], years: [] } as SearchFilters,
    description: 'Sessions focused on variant calling and SNP analysis'
  },
  {
    name: 'Population Genetics',
    query: 'population structure diversity',
    filters: { workshops: ['wpsg'], presenters: [], sessionTypes: [], topics: ['population'], techniques: [], years: [] } as SearchFilters,
    description: 'Population genetics and structure analysis sessions'
  },
  {
    name: 'Bioinformatics Tools',
    query: 'BLAST alignment tools software',
    filters: { workshops: [], presenters: [], sessionTypes: ['Practical'], topics: ['bioinformatics'], techniques: [], years: [] } as SearchFilters,
    description: 'Hands-on sessions with bioinformatics tools and software'
  },
  {
    name: 'Recent Advances',
    query: '',
    filters: { workshops: [], presenters: [], sessionTypes: ['Lecture'], topics: [], techniques: [], years: [2023, 2024, 2025] } as SearchFilters,
    description: 'Latest lectures from recent workshops'
  }
];

export function applyQuickSearchTemplate(template: typeof QUICK_SEARCH_TEMPLATES[0]): SavedSearch {
  return savedSearchManager.saveSearch(
    template.name,
    template.query,
    template.filters,
    0
  );
}