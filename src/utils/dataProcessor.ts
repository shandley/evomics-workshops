import type { 
  Workshop, 
  WorkshopSchedule, 
  EnrichedFacultyProfile, 
  ArchiveStatistics,
  SessionDetail,
  TimelineEvent
} from '../types';
import { normalizeWorkshopId, getTeachingWorkshopId } from './workshopIdMapper.js';

// Load data
import workshopsData from '../data/workshops.json' with { type: 'json' };
import teachingData from '../../data/processed/teachingDataCompleteMultiWorkshop.json' with { type: 'json' };

// Process workshop definitions
export function getWorkshops(): { [key: string]: Workshop } {
  return workshopsData as { [key: string]: Workshop };
}

// Process teaching data
export function getTeachingData(): EnrichedFacultyProfile {
  return teachingData as EnrichedFacultyProfile;
}

// Generate all session details from teaching data
export function getAllSessions(): SessionDetail[] {
  const teaching = getTeachingData();
  const workshops = getWorkshops();
  const sessions: SessionDetail[] = [];

  Object.entries(teaching).forEach(([facultyId, data]) => {
    if (!data.teaching?.workshopsHistory) return;

    Object.entries(data.teaching.workshopsHistory).forEach(([teachingWorkshopId, yearHistory]) => {
      const workshopId = normalizeWorkshopId(teachingWorkshopId);
      Object.entries(yearHistory).forEach(([year, yearSessions]) => {
        yearSessions.forEach((session, index) => {
          const workshop = workshops[workshopId];
          if (!workshop) return;

          sessions.push({
            id: `${facultyId}-${workshopId}-${year}-${index}`,
            workshopId,
            workshopName: workshop.name,
            year: parseInt(year),
            date: session.date,
            time: session.time,
            topic: session.topic,
            type: session.type as any,
            location: session.location,
            presenters: [facultyId], // Primary presenter
            coPresenters: session.coPresenters
          });
        });
      });
    });
  });

  return sessions;
}

// Calculate archive statistics
export function calculateArchiveStatistics(): ArchiveStatistics {
  const workshops = getWorkshops();
  const sessions = getAllSessions();
  
  const allYears = new Set<number>();
  const allPresenters = new Set<string>();
  const workshopStats: { [key: string]: any } = {};

  // Initialize workshop stats
  Object.keys(workshops).forEach(workshopId => {
    workshopStats[workshopId] = {
      sessions: 0,
      years: new Set<number>(),
      presenters: new Set<string>(),
      topics: new Set<string>()
    };
  });

  // Process sessions
  sessions.forEach(session => {
    allYears.add(session.year);
    allPresenters.add(session.presenters[0]);
    
    const stats = workshopStats[session.workshopId];
    if (stats) {
      stats.sessions++;
      stats.years.add(session.year);
      stats.presenters.add(session.presenters[0]);
      stats.topics.add(session.topic);
    }
  });

  // Convert sets to arrays and finalize
  Object.keys(workshopStats).forEach(workshopId => {
    const stats = workshopStats[workshopId];
    stats.years = Array.from(stats.years as Set<number>).sort((a, b) => a - b);
    stats.presenters = (stats.presenters as Set<string>).size;
    stats.topics = Array.from(stats.topics as Set<string>);
  });

  // Count only workshops that have actual sessions
  const activeWorkshops = Object.keys(workshopStats).filter(id => workshopStats[id].sessions > 0);

  return {
    totalWorkshops: activeWorkshops.length,
    totalSessions: sessions.length,
    totalPresenters: allPresenters.size,
    totalYears: allYears.size,
    yearRange: {
      start: Math.min(...allYears),
      end: Math.max(...allYears)
    },
    workshopStats
  };
}

// Generate timeline data
export function generateTimelineData(): TimelineEvent[] {
  const sessions = getAllSessions();
  const workshops = getWorkshops();
  
  const timelineMap = new Map<number, TimelineEvent>();

  sessions.forEach(session => {
    if (!timelineMap.has(session.year)) {
      timelineMap.set(session.year, {
        year: session.year,
        workshops: {}
      });
    }

    const event = timelineMap.get(session.year)!;
    if (!event.workshops[session.workshopId]) {
      event.workshops[session.workshopId] = {
        sessions: 0,
        topics: [],
        presenters: []
      };
    }

    const workshopEvent = event.workshops[session.workshopId];
    workshopEvent.sessions++;
    
    if (!workshopEvent.topics.includes(session.topic)) {
      workshopEvent.topics.push(session.topic);
    }
    
    if (!workshopEvent.presenters.includes(session.presenters[0])) {
      workshopEvent.presenters.push(session.presenters[0]);
    }
  });

  return Array.from(timelineMap.values()).sort((a, b) => a.year - b.year);
}

// Search and filter functions
export function searchSessions(
  sessions: SessionDetail[],
  searchTerm: string,
  filters: {
    workshop?: string[];
    year?: number;
    sessionType?: string[];
    presenter?: string[];
  } = {}
): SessionDetail[] {
  return sessions.filter(session => {
    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        session.topic.toLowerCase().includes(searchLower) ||
        session.presenters.some(p => p.toLowerCase().includes(searchLower)) ||
        session.workshopName.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Workshop filter
    if (filters.workshop && filters.workshop.length > 0) {
      if (!filters.workshop.includes(session.workshopId)) return false;
    }

    // Year filter
    if (filters.year && session.year !== filters.year) {
      return false;
    }

    // Session type filter
    if (filters.sessionType && filters.sessionType.length > 0) {
      if (!filters.sessionType.includes(session.type)) return false;
    }

    // Presenter filter
    if (filters.presenter && filters.presenter.length > 0) {
      const hasPresenter = filters.presenter.some(p => 
        session.presenters.includes(p)
      );
      if (!hasPresenter) return false;
    }

    return true;
  });
}

// Get unique values for filters
export function getFilterOptions(sessions: SessionDetail[]) {
  const workshops = new Set<string>();
  const years = new Set<number>();
  const sessionTypes = new Set<string>();
  const presenters = new Set<string>();
  const topics = new Set<string>();

  sessions.forEach(session => {
    workshops.add(session.workshopId);
    years.add(session.year);
    sessionTypes.add(session.type);
    session.presenters.forEach(p => presenters.add(p));
    topics.add(session.topic);
  });

  return {
    workshops: Array.from(workshops).sort(),
    years: Array.from(years).sort((a, b) => b - a),
    sessionTypes: Array.from(sessionTypes).sort(),
    presenters: Array.from(presenters).sort(),
    topics: Array.from(topics).sort()
  };
}