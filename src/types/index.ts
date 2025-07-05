// Workshop Archive Types

export interface Workshop {
  id: string;
  name: string;
  shortName: string;
  description: string;
  active: boolean;
  startYear: number;
  endYear?: number;
  location: string;
}

export interface WorkshopSession {
  date: string;
  time: string;
  topic: string;
  type: 'lecture' | 'practical' | 'lab' | 'orientation' | 'social' | 'discussion' | 'assessment';
  location?: string;
  presenters: string[];
  coPresenters?: string[];
}

export interface WorkshopWeek {
  week: number;
  sessions: WorkshopSession[];
}

export interface WorkshopSchedule {
  workshop: string;
  year: number;
  location: string;
  dates: string;
  weeks: WorkshopWeek[];
}

export interface TeachingSession {
  date: string;
  time: string;
  topic: string;
  type: string;
  location: string;
  coPresenters: string[];
}

export interface FacultyTeachingHistory {
  totalSessions: number;
  workshopsHistory: {
    [workshopId: string]: {
      [year: string]: TeachingSession[];
    };
  };
  specializations: string[];
  yearsActive: number[];
  firstTaught: number;
  lastTaught: number;
  yearRange: string;
}

export interface EnrichedFacultyProfile {
  [facultyId: string]: {
    teaching: FacultyTeachingHistory;
  };
}

export interface SearchFilters {
  search: string;
  workshop: string[];
  year: number | null;
  sessionType: string[];
  presenter: string[];
  topic: string[];
}

export interface ArchiveStatistics {
  totalWorkshops: number;
  totalSessions: number;
  totalPresenters: number;
  totalYears: number;
  yearRange: {
    start: number;
    end: number;
  };
  workshopStats: {
    [workshopId: string]: {
      sessions: number;
      years: number[];
      presenters: number;
      topics: string[];
    };
  };
}

export interface SessionDetail extends WorkshopSession {
  workshopId: string;
  workshopName: string;
  year: number;
  id: string; // Generated unique identifier
  presenterDetails?: {
    id: string;
    name: string;
    affiliation?: string;
  }[];
}

export interface TimelineEvent {
  year: number;
  workshops: {
    [workshopId: string]: {
      sessions: number;
      topics: string[];
      presenters: string[];
    };
  };
  milestones?: string[];
}

export interface CurriculumEvolution {
  topic: string;
  appearances: {
    year: number;
    workshop: string;
    frequency: number;
  }[];
  trend: 'increasing' | 'decreasing' | 'stable' | 'discontinued';
}