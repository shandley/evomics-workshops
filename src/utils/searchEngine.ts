import type { SessionDetail, PresenterProfile } from '../types';

// Search result types
export interface SearchResult {
  item: SessionDetail;
  score: number;
  matches: SearchMatch[];
  relevance: 'high' | 'medium' | 'low';
}

export interface SearchMatch {
  field: string;
  value: string;
  highlights: { start: number; end: number }[];
}

export interface SearchSuggestion {
  text: string;
  type: 'topic' | 'presenter' | 'technique' | 'workshop' | 'description';
  count: number;
  category: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: Date;
  lastUsed: Date;
  resultCount: number;
}

export interface SearchFilters {
  workshops: string[];
  presenters: string[];
  sessionTypes: string[];
  topics: string[];
  techniques: string[];
  years: number[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchOptions {
  includeDescriptions: boolean;
  includeTitles: boolean;
  includeObjectives: boolean;
  includePresenters: boolean;
  includeTechniques: boolean;
  fuzzyMatch: boolean;
  maxResults: number;
  minScore: number;
}

// Default search options
export const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  includeDescriptions: false, // Not available in SessionDetail
  includeTitles: true, // Using topic field
  includeObjectives: false, // Not available in SessionDetail
  includePresenters: true,
  includeTechniques: false, // Not available in SessionDetail
  fuzzyMatch: true,
  maxResults: 50,
  minScore: 0.1
};

// Search index for fast lookups
export class SearchIndex {
  private sessions: SessionDetail[] = [];
  private termIndex: Map<string, Set<string>> = new Map();
  private presenterIndex: Map<string, Set<string>> = new Map();
  private topicIndex: Map<string, Set<string>> = new Map();
  private techniqueIndex: Map<string, Set<string>> = new Map();

  constructor(sessions: SessionDetail[]) {
    this.sessions = sessions;
    this.buildIndex();
  }

  private buildIndex() {
    this.sessions.forEach(session => {
      const sessionId = session.id;

      // Index topic (equivalent to title)
      this.indexText(session.topic, sessionId, 'topic');

      // Note: SessionDetail doesn't have description or objectives fields
      // The topic field contains the main searchable content

      // Index presenters
      session.presenters.forEach(presenter => {
        this.presenterIndex.set(presenter.toLowerCase(), 
          (this.presenterIndex.get(presenter.toLowerCase()) || new Set()).add(sessionId)
        );
      });

      // Index co-presenters
      (session.coPresenters || []).forEach(presenter => {
        this.presenterIndex.set(presenter.toLowerCase(), 
          (this.presenterIndex.get(presenter.toLowerCase()) || new Set()).add(sessionId)
        );
      });

      // Note: SessionDetail doesn't have techniques field
      // We can extract techniques from the topic content instead

      // Index topics (extracted from topic content)
      const topics = this.extractTopics(session.topic);
      topics.forEach(topic => {
        this.topicIndex.set(topic.toLowerCase(),
          (this.topicIndex.get(topic.toLowerCase()) || new Set()).add(sessionId)
        );
      });
    });
  }

  private indexText(text: string, sessionId: string, field: string) {
    const words = this.tokenize(text);
    words.forEach(word => {
      const normalized = word.toLowerCase();
      if (normalized.length > 2) { // Skip very short words
        this.termIndex.set(`${field}:${normalized}`, 
          (this.termIndex.get(`${field}:${normalized}`) || new Set()).add(sessionId)
        );
      }
    });
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    const biologicalTerms = [
      'phylogeny', 'evolution', 'genomics', 'genetics', 'dna', 'rna', 'protein',
      'sequence', 'alignment', 'tree', 'species', 'population', 'selection',
      'mutation', 'variation', 'diversity', 'conservation', 'ecology',
      'bioinformatics', 'analysis', 'modeling', 'simulation', 'algorithm',
      'statistics', 'bayesian', 'likelihood', 'bootstrap', 'mcmc'
    ];

    const normalized = text.toLowerCase();
    biologicalTerms.forEach(term => {
      if (normalized.includes(term)) {
        topics.push(term);
      }
    });

    return [...new Set(topics)]; // Remove duplicates
  }

  search(query: string, filters: SearchFilters = {} as SearchFilters, options: SearchOptions = DEFAULT_SEARCH_OPTIONS): SearchResult[] {
    const searchTerms = this.tokenize(query);
    if (searchTerms.length === 0) {
      return [];
    }

    const results: Map<string, SearchResult> = new Map();

    // Search through different fields
    searchTerms.forEach(term => {
      if (options.includeTitles) {
        this.searchInField(term, 'topic', results, 3.0);
      }
      // Note: No description or objectives fields in SessionDetail
    });

    // Search presenters
    if (options.includePresenters) {
      searchTerms.forEach(term => {
        this.searchPresenters(term, results, 2.5);
      });
    }

    // Note: No techniques field in SessionDetail
    // Techniques are extracted from topic content and indexed as topics

    // Search topics
    searchTerms.forEach(term => {
      this.searchTopics(term, results, 1.5);
    });

    // Apply filters
    const filteredResults = Array.from(results.values())
      .filter(result => this.applyFilters(result.item, filters))
      .filter(result => result.score >= options.minScore);

    // Sort by score and limit results
    return filteredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, options.maxResults)
      .map(result => ({
        ...result,
        relevance: this.calculateRelevance(result.score)
      }));
  }

  private searchInField(term: string, field: string, results: Map<string, SearchResult>, weight: number) {
    const key = `${field}:${term}`;
    const sessionIds = this.termIndex.get(key);
    
    if (sessionIds) {
      sessionIds.forEach(sessionId => {
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
          const existing = results.get(sessionId);
          const score = weight;
          const match: SearchMatch = {
            field,
            value: this.getFieldValue(session, field),
            highlights: this.findHighlights(this.getFieldValue(session, field), term)
          };

          if (existing) {
            existing.score += score;
            existing.matches.push(match);
          } else {
            results.set(sessionId, {
              item: session,
              score,
              matches: [match],
              relevance: 'low'
            });
          }
        }
      });
    }
  }

  private searchPresenters(term: string, results: Map<string, SearchResult>, weight: number) {
    this.presenterIndex.forEach((sessionIds, presenter) => {
      if (presenter.includes(term)) {
        sessionIds.forEach(sessionId => {
          const session = this.sessions.find(s => s.id === sessionId);
          if (session) {
            const existing = results.get(sessionId);
            const score = weight;
            const match: SearchMatch = {
              field: 'presenter',
              value: presenter,
              highlights: this.findHighlights(presenter, term)
            };

            if (existing) {
              existing.score += score;
              existing.matches.push(match);
            } else {
              results.set(sessionId, {
                item: session,
                score,
                matches: [match],
                relevance: 'low'
              });
            }
          }
        });
      }
    });
  }

  private searchTechniques(term: string, results: Map<string, SearchResult>, weight: number) {
    this.techniqueIndex.forEach((sessionIds, technique) => {
      if (technique.includes(term)) {
        sessionIds.forEach(sessionId => {
          const session = this.sessions.find(s => s.id === sessionId);
          if (session) {
            const existing = results.get(sessionId);
            const score = weight;
            const match: SearchMatch = {
              field: 'technique',
              value: technique,
              highlights: this.findHighlights(technique, term)
            };

            if (existing) {
              existing.score += score;
              existing.matches.push(match);
            } else {
              results.set(sessionId, {
                item: session,
                score,
                matches: [match],
                relevance: 'low'
              });
            }
          }
        });
      }
    });
  }

  private searchTopics(term: string, results: Map<string, SearchResult>, weight: number) {
    this.topicIndex.forEach((sessionIds, topic) => {
      if (topic.includes(term)) {
        sessionIds.forEach(sessionId => {
          const session = this.sessions.find(s => s.id === sessionId);
          if (session) {
            const existing = results.get(sessionId);
            const score = weight;
            const match: SearchMatch = {
              field: 'topic',
              value: topic,
              highlights: this.findHighlights(topic, term)
            };

            if (existing) {
              existing.score += score;
              existing.matches.push(match);
            } else {
              results.set(sessionId, {
                item: session,
                score,
                matches: [match],
                relevance: 'low'
              });
            }
          }
        });
      }
    });
  }

  private getFieldValue(session: SessionDetail, field: string): string {
    switch (field) {
      case 'topic':
        return session.topic;
      default:
        return '';
    }
  }

  private findHighlights(text: string, term: string): { start: number; end: number }[] {
    const highlights: { start: number; end: number }[] = [];
    const normalized = text.toLowerCase();
    const searchTerm = term.toLowerCase();
    
    let index = 0;
    while (index < normalized.length) {
      const found = normalized.indexOf(searchTerm, index);
      if (found === -1) break;
      
      highlights.push({
        start: found,
        end: found + searchTerm.length
      });
      index = found + 1;
    }
    
    return highlights;
  }

  private applyFilters(session: SessionDetail, filters: SearchFilters): boolean {
    if (filters.workshops && filters.workshops.length > 0) {
      if (!filters.workshops.includes(session.workshopId)) {
        return false;
      }
    }

    if (filters.presenters && filters.presenters.length > 0) {
      const allPresenters = [...session.presenters, ...(session.coPresenters || [])];
      if (!filters.presenters.some(p => allPresenters.some(sp => sp.toLowerCase().includes(p.toLowerCase())))) {
        return false;
      }
    }

    if (filters.sessionTypes && filters.sessionTypes.length > 0) {
      if (!filters.sessionTypes.includes(session.type)) {
        return false;
      }
    }

    if (filters.years && filters.years.length > 0) {
      if (!filters.years.includes(session.year)) {
        return false;
      }
    }

    if (filters.dateRange) {
      if (session.date) {
        const sessionDate = new Date(session.date);
        if (sessionDate < filters.dateRange.start || sessionDate > filters.dateRange.end) {
          return false;
        }
      }
    }

    return true;
  }

  private calculateRelevance(score: number): 'high' | 'medium' | 'low' {
    if (score >= 5.0) return 'high';
    if (score >= 2.0) return 'medium';
    return 'low';
  }

  // Get suggestions for autocomplete
  getSuggestions(query: string, limit: number = 10): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const normalized = query.toLowerCase();

    // Presenter suggestions
    this.presenterIndex.forEach((sessionIds, presenter) => {
      if (presenter.includes(normalized) && sessionIds.size > 0) {
        suggestions.push({
          text: presenter,
          type: 'presenter',
          count: sessionIds.size,
          category: 'Presenters'
        });
      }
    });

    // Technique suggestions
    this.techniqueIndex.forEach((sessionIds, technique) => {
      if (technique.includes(normalized) && sessionIds.size > 0) {
        suggestions.push({
          text: technique,
          type: 'technique',
          count: sessionIds.size,
          category: 'Techniques'
        });
      }
    });

    // Topic suggestions
    this.topicIndex.forEach((sessionIds, topic) => {
      if (topic.includes(normalized) && sessionIds.size > 0) {
        suggestions.push({
          text: topic,
          type: 'topic',
          count: sessionIds.size,
          category: 'Topics'
        });
      }
    });

    // Sort by count and relevance
    return suggestions
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.text.toLowerCase() === normalized;
        const bExact = b.text.toLowerCase() === normalized;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then by count
        return b.count - a.count;
      })
      .slice(0, limit);
  }

  // Get all unique values for filter options
  getFilterOptions() {
    const workshops = new Set<string>();
    const presenters = new Set<string>();
    const sessionTypes = new Set<string>();
    const techniques = new Set<string>();
    const years = new Set<number>();

    this.sessions.forEach(session => {
      workshops.add(session.workshopId);
      sessionTypes.add(session.type);
      years.add(session.year);
      
      session.presenters.forEach(p => presenters.add(p));
      (session.coPresenters || []).forEach(p => presenters.add(p));
      // Note: No techniques field in SessionDetail
    });

    return {
      workshops: Array.from(workshops).sort(),
      presenters: Array.from(presenters).sort(),
      sessionTypes: Array.from(sessionTypes).sort(),
      techniques: Array.from(techniques).sort(),
      years: Array.from(years).sort((a, b) => b - a)
    };
  }
}

// Fuzzy string matching utility
export function fuzzyScore(query: string, target: string): number {
  if (query === target) return 1.0;
  if (query.length === 0) return 0.0;
  if (target.length === 0) return 0.0;

  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  // Check for exact substring match
  if (targetLower.includes(queryLower)) {
    return 0.8;
  }

  // Calculate character-based similarity
  let matches = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < targetLower.length && queryIndex < queryLower.length; i++) {
    if (targetLower[i] === queryLower[queryIndex]) {
      matches++;
      queryIndex++;
    }
  }

  return matches / query.length;
}

// Highlight text utility
export function highlightText(text: string, highlights: { start: number; end: number }[]): string {
  if (highlights.length === 0) return text;

  let result = '';
  let lastEnd = 0;

  highlights.forEach(({ start, end }) => {
    result += text.slice(lastEnd, start);
    result += `<mark class="bg-yellow-200 px-1 rounded">${text.slice(start, end)}</mark>`;
    lastEnd = end;
  });

  result += text.slice(lastEnd);
  return result;
}