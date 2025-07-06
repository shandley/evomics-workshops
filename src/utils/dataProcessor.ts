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

// Import all workshop schedule files
import wog2011FortCollins from '../../data/workshops/wog-2011-fort-collins.json' with { type: 'json' };
import wog2011Smithsonian from '../../data/workshops/wog-2011-smithsonian.json' with { type: 'json' };
import wog2012 from '../../data/workshops/wog-2012.json' with { type: 'json' };
import wog2013 from '../../data/workshops/wog-2013.json' with { type: 'json' };
import wog2014 from '../../data/workshops/wog-2014.json' with { type: 'json' };
import wog2015 from '../../data/workshops/wog-2015.json' with { type: 'json' };
import wog2016 from '../../data/workshops/wog-2016.json' with { type: 'json' };
import wog2017 from '../../data/workshops/wog-2017.json' with { type: 'json' };
import wog2018 from '../../data/workshops/wog-2018.json' with { type: 'json' };
import wog2019 from '../../data/workshops/wog-2019.json' with { type: 'json' };
import wog2020 from '../../data/workshops/wog-2020.json' with { type: 'json' };
import wog2022 from '../../data/workshops/wog-2022.json' with { type: 'json' };
import wog2023 from '../../data/workshops/wog-2023.json' with { type: 'json' };
import wog2024 from '../../data/workshops/wog-2024.json' with { type: 'json' };
import wpsg2016 from '../../data/workshops/wpsg-2016.json' with { type: 'json' };
import wpsg2018 from '../../data/workshops/wpsg-2018.json' with { type: 'json' };
import wpsg2020 from '../../data/workshops/wpsg-2020.json' with { type: 'json' };
import wpsg2022 from '../../data/workshops/wpsg-2022.json' with { type: 'json' };
import wpsg2025 from '../../data/workshops/wpsg-2025.json' with { type: 'json' };
import wphylo2017 from '../../data/workshops/wphylo-2017.json' with { type: 'json' };
import wphylo2019 from '../../data/workshops/wphylo-2019.json' with { type: 'json' };
import wphylo2024 from '../../data/workshops/wphylo-2024.json' with { type: 'json' };

// Process workshop definitions
export function getWorkshops(): { [key: string]: Workshop } {
  return workshopsData as { [key: string]: Workshop };
}

// Process teaching data
export function getTeachingData(): EnrichedFacultyProfile {
  return teachingData as EnrichedFacultyProfile;
}

// Load all workshop schedule data
export function loadAllWorkshopData(): { [key: string]: WorkshopSchedule[] } {
  const workshopSchedules: { [key: string]: WorkshopSchedule[] } = {
    'wog': [
      wog2011FortCollins as WorkshopSchedule,
      wog2011Smithsonian as WorkshopSchedule,
      wog2012 as WorkshopSchedule,
      wog2013 as WorkshopSchedule,
      wog2014 as WorkshopSchedule,
      wog2015 as WorkshopSchedule,
      wog2016 as WorkshopSchedule,
      wog2017 as WorkshopSchedule,
      wog2018 as WorkshopSchedule,
      wog2019 as WorkshopSchedule,
      wog2020 as WorkshopSchedule,
      wog2022 as WorkshopSchedule,
      wog2023 as WorkshopSchedule,
      wog2024 as WorkshopSchedule,
    ],
    'wpsg': [
      wpsg2016 as WorkshopSchedule,
      wpsg2018 as WorkshopSchedule,
      wpsg2020 as WorkshopSchedule,
      wpsg2022 as WorkshopSchedule,
      wpsg2025 as WorkshopSchedule,
    ],
    'wphylo': [
      wphylo2017 as WorkshopSchedule,
      wphylo2019 as WorkshopSchedule,
      wphylo2024 as WorkshopSchedule,
    ]
  };

  return workshopSchedules;
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