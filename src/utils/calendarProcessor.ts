import type { SessionDetail, Workshop } from '../types';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getYear, getMonth } from 'date-fns';

export type CalendarView = 'decade' | 'year' | 'month';

export interface CalendarFilters {
  workshops: string[];
  presenters: string[];
  sessionTypes: string[];
  topics: string[];
  workshopStatus?: 'active' | 'historical';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface CalendarDay {
  date: Date;
  sessions: SessionDetail[];
  sessionCount: number;
  uniquePresenters: number;
  workshopTypes: string[];
  density: 'none' | 'low' | 'medium' | 'high' | 'peak';
  color: string;
}

export interface CalendarMonth {
  year: number;
  month: number; // 0-11
  name: string;
  days: CalendarDay[];
  totalSessions: number;
  uniquePresenters: number;
  workshopTypes: string[];
  density: 'none' | 'low' | 'medium' | 'high' | 'peak';
}

export interface CalendarYear {
  year: number;
  months: CalendarMonth[];
  totalSessions: number;
  uniquePresenters: number;
  workshopTypes: string[];
  density: 'none' | 'low' | 'medium' | 'high' | 'peak';
}

export interface CalendarData {
  years: CalendarYear[];
  totalSessions: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  patterns: {
    peakMonths: string[];
    activeWorkshops: string[];
    presenterActivity: { [presenterId: string]: number };
  };
}

// Color schemes for heatmaps with better contrast
export const DENSITY_COLORS = {
  none: '#ffffff',     // White
  low: '#f0f9ff',      // Blue-50 - very light
  medium: '#e0f2fe',   // Sky-100 - light
  high: '#bae6fd',     // Sky-200 - medium
  peak: '#7dd3fc'      // Sky-300 - strong but readable
} as const;

export const WORKSHOP_COLORS = {
  'wog': '#3b82f6',      // Blue
  'wpsg': '#10b981',     // Green
  'wphylo': '#8b5cf6',   // Purple
  'wmolevo': '#f59e0b',  // Orange
  'htranscriptomics': '#ec4899', // Pink
  'hmicrobial': '#6366f1' // Indigo
} as const;

// Helper function to parse session date
function parseSessionDate(session: SessionDetail): Date | null {
  try {
    // Try to parse the date from session.date and session.year
    const year = session.year;
    const dateStr = session.date;
    
    // Handle various date formats
    if (dateStr.includes('Jan')) {
      const day = parseInt(dateStr.match(/\d+/)?.[0] || '1');
      return new Date(year, 0, day); // January = month 0
    } else if (dateStr.includes('Feb')) {
      const day = parseInt(dateStr.match(/\d+/)?.[0] || '1');
      return new Date(year, 1, day);
    } else if (dateStr.includes('Mar')) {
      const day = parseInt(dateStr.match(/\d+/)?.[0] || '1');
      return new Date(year, 2, day);
    } else if (dateStr.includes('Apr')) {
      const day = parseInt(dateStr.match(/\d+/)?.[0] || '1');
      return new Date(year, 3, day);
    } else if (dateStr.includes('May')) {
      const day = parseInt(dateStr.match(/\d+/)?.[0] || '1');
      return new Date(year, 4, day);
    } else if (dateStr.includes('Jun')) {
      const day = parseInt(dateStr.match(/\d+/)?.[0] || '1');
      return new Date(year, 5, day);
    } else if (dateStr.includes('Jul')) {
      const day = parseInt(dateStr.match(/\d+/)?.[0] || '1');
      return new Date(year, 6, day);
    } else if (dateStr.includes('Aug')) {
      const day = parseInt(dateStr.match(/\d+/)?.[0] || '1');
      return new Date(year, 7, day);
    } else if (dateStr.includes('Sep')) {
      const day = parseInt(dateStr.match(/\d+/)?.[0] || '1');
      return new Date(year, 8, day);
    } else if (dateStr.includes('Oct')) {
      const day = parseInt(dateStr.match(/\d+/)?.[0] || '1');
      return new Date(year, 9, day);
    } else if (dateStr.includes('Nov')) {
      const day = parseInt(dateStr.match(/\d+/)?.[0] || '1');
      return new Date(year, 10, day);
    } else if (dateStr.includes('Dec')) {
      const day = parseInt(dateStr.match(/\d+/)?.[0] || '1');
      return new Date(year, 11, day);
    }
    
    // Try to extract day number and default to January
    const dayMatch = dateStr.match(/\d+/);
    if (dayMatch) {
      const day = parseInt(dayMatch[0]);
      return new Date(year, 0, day); // Default to January
    }
    
    // Fallback to January 1st of the session year
    return new Date(year, 0, 1);
  } catch (error) {
    console.warn('Failed to parse session date:', session.date, session.year);
    return new Date(session.year, 0, 1); // Fallback
  }
}

// Calculate density level based on session count
function calculateDensity(sessionCount: number): 'none' | 'low' | 'medium' | 'high' | 'peak' {
  if (sessionCount === 0) return 'none';
  if (sessionCount <= 2) return 'low';
  if (sessionCount <= 5) return 'medium';
  if (sessionCount <= 10) return 'high';
  return 'peak';
}

// Apply filters to sessions
export function applyCalendarFilters(sessions: SessionDetail[], filters: CalendarFilters, workshops?: { [key: string]: Workshop }): SessionDetail[] {
  return sessions.filter(session => {
    // Workshop filter
    if (filters.workshops.length > 0 && !filters.workshops.includes(session.workshopId)) {
      return false;
    }
    
    // Presenter filter
    if (filters.presenters.length > 0) {
      const sessionPresenters = [...session.presenters, ...(session.coPresenters || [])];
      const hasMatchingPresenter = sessionPresenters.some(presenter => 
        filters.presenters.includes(presenter)
      );
      if (!hasMatchingPresenter) return false;
    }
    
    // Session type filter
    if (filters.sessionTypes.length > 0 && !filters.sessionTypes.includes(session.type)) {
      return false;
    }
    
    // Topic filter (simple text search)
    if (filters.topics.length > 0) {
      const hasMatchingTopic = filters.topics.some(topic =>
        session.topic.toLowerCase().includes(topic.toLowerCase())
      );
      if (!hasMatchingTopic) return false;
    }
    
    // Workshop status filter
    if (filters.workshopStatus && workshops) {
      const workshop = workshops[session.workshopId];
      if (!workshop) return false;
      
      if (filters.workshopStatus === 'active' && !workshop.active) {
        return false;
      }
      if (filters.workshopStatus === 'historical' && workshop.active) {
        return false;
      }
    }
    
    // Date range filter
    if (filters.dateRange) {
      const sessionDate = parseSessionDate(session);
      if (!sessionDate) return false;
      
      if (sessionDate < filters.dateRange.start || sessionDate > filters.dateRange.end) {
        return false;
      }
    }
    
    return true;
  });
}

// Process sessions into calendar data structure
export function processCalendarData(
  sessions: SessionDetail[], 
  filters: CalendarFilters = { workshops: [], presenters: [], sessionTypes: [], topics: [] },
  workshops?: { [key: string]: Workshop }
): CalendarData {
  const filteredSessions = applyCalendarFilters(sessions, filters, workshops);
  
  // Group sessions by year and month
  const yearGroups: { [year: number]: SessionDetail[] } = {};
  const allDates: Date[] = [];
  
  filteredSessions.forEach(session => {
    const date = parseSessionDate(session);
    if (date) {
      const year = getYear(date);
      if (!yearGroups[year]) yearGroups[year] = [];
      yearGroups[year].push(session);
      allDates.push(date);
    }
  });
  
  // Calculate date range
  const sortedDates = allDates.sort((a, b) => a.getTime() - b.getTime());
  const dateRange = {
    start: sortedDates[0] || new Date(2011, 0, 1),
    end: sortedDates[sortedDates.length - 1] || new Date()
  };
  
  // Process each year
  const years: CalendarYear[] = [];
  const presenterActivity: { [presenterId: string]: number } = {};
  const workshopTypes = new Set<string>();
  
  Object.keys(yearGroups).sort().forEach(yearStr => {
    const year = parseInt(yearStr);
    const yearSessions = yearGroups[year];
    
    // Group by month
    const monthGroups: { [month: number]: SessionDetail[] } = {};
    yearSessions.forEach(session => {
      const date = parseSessionDate(session);
      if (date) {
        const month = getMonth(date);
        if (!monthGroups[month]) monthGroups[month] = [];
        monthGroups[month].push(session);
      }
    });
    
    // Process each month
    const months: CalendarMonth[] = [];
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthSessions = monthGroups[monthIndex] || [];
      
      // Create days for this month
      const monthStart = new Date(year, monthIndex, 1);
      const monthEnd = endOfMonth(monthStart);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      const days: CalendarDay[] = daysInMonth.map(date => {
        const daySessions = monthSessions.filter(session => {
          const sessionDate = parseSessionDate(session);
          return sessionDate && isSameDay(sessionDate, date);
        });
        
        const uniquePresenters = new Set([
          ...daySessions.flatMap(s => s.presenters),
          ...daySessions.flatMap(s => s.coPresenters || [])
        ]).size;
        
        const dayWorkshopTypes = [...new Set(daySessions.map(s => s.workshopId))];
        const density = calculateDensity(daySessions.length);
        
        // Track presenter activity
        daySessions.forEach(session => {
          [...session.presenters, ...(session.coPresenters || [])].forEach(presenter => {
            presenterActivity[presenter] = (presenterActivity[presenter] || 0) + 1;
          });
        });
        
        // Track workshop types
        dayWorkshopTypes.forEach(type => workshopTypes.add(type));
        
        return {
          date,
          sessions: daySessions,
          sessionCount: daySessions.length,
          uniquePresenters,
          workshopTypes: dayWorkshopTypes,
          density,
          color: DENSITY_COLORS[density]
        };
      });
      
      const monthUniquePresenters = new Set([
        ...monthSessions.flatMap(s => s.presenters),
        ...monthSessions.flatMap(s => s.coPresenters || [])
      ]).size;
      
      const monthWorkshopTypes = [...new Set(monthSessions.map(s => s.workshopId))];
      
      months.push({
        year,
        month: monthIndex,
        name: format(new Date(year, monthIndex, 1), 'MMMM'),
        days,
        totalSessions: monthSessions.length,
        uniquePresenters: monthUniquePresenters,
        workshopTypes: monthWorkshopTypes,
        density: calculateDensity(monthSessions.length)
      });
    }
    
    const yearUniquePresenters = new Set([
      ...yearSessions.flatMap(s => s.presenters),
      ...yearSessions.flatMap(s => s.coPresenters || [])
    ]).size;
    
    const yearWorkshopTypes = [...new Set(yearSessions.map(s => s.workshopId))];
    
    years.push({
      year,
      months,
      totalSessions: yearSessions.length,
      uniquePresenters: yearUniquePresenters,
      workshopTypes: yearWorkshopTypes,
      density: calculateDensity(yearSessions.length)
    });
  });
  
  // Identify patterns
  const monthlyTotals: { [monthName: string]: number } = {};
  years.forEach(year => {
    year.months.forEach(month => {
      const monthKey = month.name;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + month.totalSessions;
    });
  });
  
  const peakMonths = Object.entries(monthlyTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([month]) => month);
  
  return {
    years,
    totalSessions: filteredSessions.length,
    dateRange,
    patterns: {
      peakMonths,
      activeWorkshops: Array.from(workshopTypes),
      presenterActivity
    }
  };
}

// Get calendar data for specific view
export function getCalendarViewData(
  calendarData: CalendarData,
  view: CalendarView,
  selectedDate: Date
): CalendarYear[] | CalendarMonth[] | CalendarDay[] {
  switch (view) {
    case 'decade':
      return calendarData.years;
    
    case 'year':
      const selectedYear = getYear(selectedDate);
      const yearData = calendarData.years.find(y => y.year === selectedYear);
      return yearData ? yearData.months : [];
    
    case 'month':
      const targetYear = getYear(selectedDate);
      const targetMonth = getMonth(selectedDate);
      const yearForMonth = calendarData.years.find(y => y.year === targetYear);
      const monthData = yearForMonth?.months.find(m => m.month === targetMonth);
      return monthData ? monthData.days : [];
    
    default:
      return calendarData.years;
  }
}

// Navigation helpers
export function navigateToDate(targetDate: Date, currentView: CalendarView): { view: CalendarView; date: Date } {
  return {
    view: currentView === 'decade' ? 'year' : currentView === 'year' ? 'month' : 'month',
    date: targetDate
  };
}

export function navigateUp(currentView: CalendarView, currentDate: Date): { view: CalendarView; date: Date } {
  switch (currentView) {
    case 'month':
      return { view: 'year', date: new Date(getYear(currentDate), 0, 1) };
    case 'year':
      return { view: 'decade', date: new Date(2015, 0, 1) }; // Middle of our data range
    default:
      return { view: currentView, date: currentDate };
  }
}

// Quick navigation targets
export function getQuickNavTargets(calendarData: CalendarData) {
  const currentYear = new Date().getFullYear();
  const latestYear = Math.max(...calendarData.years.map(y => y.year));
  const earliestYear = Math.min(...calendarData.years.map(y => y.year));
  
  // Find peak activity month
  let peakMonth = { year: latestYear, month: 0, sessions: 0 };
  calendarData.years.forEach(year => {
    year.months.forEach(month => {
      if (month.totalSessions > peakMonth.sessions) {
        peakMonth = { year: year.year, month: month.month, sessions: month.totalSessions };
      }
    });
  });
  
  return {
    latest: new Date(latestYear, 0, 1),
    current: new Date(currentYear, 0, 1),
    peak: new Date(peakMonth.year, peakMonth.month, 1),
    origins: new Date(earliestYear, 0, 1)
  };
}