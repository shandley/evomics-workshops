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

// Presenter Profile Types
export interface StandardizedTopic {
  id: string;
  label: string;
  level: number;
  parentId?: string;
  description?: string;
  synonyms?: string[];
  children?: string[];
  icon?: string;
}

export interface PresenterEnrichment {
  lastUpdated: string;
  confidence: 'high' | 'medium' | 'low';
  professional?: {
    title?: string;
    affiliation?: string;
    department?: string;
    labWebsite?: string;
  };
  academic?: {
    orcid?: string;
    researchAreas?: {
      raw: string[];
      standardized?: {
        primary: StandardizedTopic[];
        secondary?: StandardizedTopic[];
      };
    };
  };
  profile?: {
    shortBio?: string;
    source?: string;
  };
}

export interface PresenterTeachingStats {
  totalSessions: number;
  workshopsParticipated: string[];
  yearsActive: number[];
  recentActivity: boolean; // active in last 3 years
  sessionsByWorkshop: { [workshopId: string]: number };
  sessionsByYear: { [year: string]: number };
  firstTaught: number;
  lastTaught: number;
  primaryTopics: string[];
}

export interface PresenterProfile {
  id: string;
  name: string;
  displayName: string;
  
  // From faculty enrichment data
  enrichment?: PresenterEnrichment;
  
  // Calculated from workshop sessions
  teaching: PresenterTeachingStats;
  
  // Derived expertise
  expertise: {
    primaryAreas: string[];
    techniques: string[];
    workshopSpecializations: string[];
  };
}

export interface PresenterDirectory {
  [presenterId: string]: PresenterProfile;
}

export interface EnhancedSessionDetail extends SessionDetail {
  enrichedPresenters: PresenterProfile[];
}