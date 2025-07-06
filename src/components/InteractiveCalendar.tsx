import React, { useState, useMemo } from 'react';
import { format, getYear, getMonth } from 'date-fns';
import type { SessionDetail, Workshop } from '../types';
import { 
  processCalendarData, 
  getCalendarViewData, 
  navigateToDate, 
  navigateUp, 
  getQuickNavTargets,
  type CalendarView, 
  type CalendarFilters,
  type CalendarData,
  type CalendarYear,
  type CalendarMonth,
  type CalendarDay,
  DENSITY_COLORS,
  WORKSHOP_COLORS
} from '../utils/calendarProcessor';

interface InteractiveCalendarProps {
  sessions: SessionDetail[];
  workshops: { [key: string]: Workshop };
  onSessionClick?: (session: SessionDetail) => void;
}

interface CalendarHeaderProps {
  view: CalendarView;
  selectedDate: Date;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
  onNavigateUp: () => void;
  quickNavTargets: {
    latest: Date;
    current: Date;
    peak: Date;
    origins: Date;
  };
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
  filterOptions: {
    workshops: string[];
    presenters: string[];
    sessionTypes: string[];
  };
  calendarData: CalendarData;
}

function CalendarHeader({
  view,
  selectedDate,
  onViewChange,
  onDateChange,
  onNavigateUp,
  quickNavTargets,
  filters,
  onFiltersChange,
  filterOptions,
  calendarData
}: CalendarHeaderProps) {
  const getViewTitle = () => {
    switch (view) {
      case 'decade':
        return 'Workshop Archive Timeline';
      case 'year':
        return format(selectedDate, 'yyyy');
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      default:
        return '';
    }
  };

  const getBreadcrumbs = () => {
    const crumbs = ['Archive'];
    if (view === 'year' || view === 'month') {
      crumbs.push(format(selectedDate, 'yyyy'));
    }
    if (view === 'month') {
      crumbs.push(format(selectedDate, 'MMMM'));
    }
    return crumbs;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Title and Breadcrumbs */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getViewTitle()}</h1>
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
            {getBreadcrumbs().map((crumb, index) => (
              <React.Fragment key={crumb}>
                {index > 0 && <span>›</span>}
                <button
                  onClick={() => {
                    if (index === 0) onViewChange('decade');
                    else if (index === 1) onViewChange('year');
                    else if (index === 2) onViewChange('month');
                  }}
                  className="hover:text-gray-700 transition-colors"
                >
                  {crumb}
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-2">
          {view !== 'decade' && (
            <button
              onClick={onNavigateUp}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              ← Zoom Out
            </button>
          )}
          
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            {(['decade', 'year', 'month'] as CalendarView[]).map((viewOption) => (
              <button
                key={viewOption}
                onClick={() => onViewChange(viewOption)}
                className={`px-3 py-2 text-sm capitalize transition-colors ${
                  view === viewOption
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {viewOption}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="flex items-center space-x-4 mb-4">
        <span className="text-sm font-medium text-gray-700">Quick Jump:</span>
        <button
          onClick={() => onDateChange(quickNavTargets.latest)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Latest Workshop
        </button>
        <button
          onClick={() => onDateChange(quickNavTargets.current)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Current Year
        </button>
        <button
          onClick={() => onDateChange(quickNavTargets.peak)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Peak Activity
        </button>
        <button
          onClick={() => onDateChange(quickNavTargets.origins)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Workshop Origins (2011)
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Workshop Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Workshop Series
          </label>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {filterOptions.workshops.map(workshop => (
              <label key={workshop} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.workshops.includes(workshop)}
                  onChange={(e) => {
                    const newWorkshops = e.target.checked
                      ? [...filters.workshops, workshop]
                      : filters.workshops.filter(w => w !== workshop);
                    onFiltersChange({ ...filters, workshops: newWorkshops });
                  }}
                  className="mr-2"
                />
                <span 
                  className="w-3 h-3 rounded mr-2" 
                  style={{ backgroundColor: WORKSHOP_COLORS[workshop as keyof typeof WORKSHOP_COLORS] || '#6b7280' }}
                />
                {workshop.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        {/* Session Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Session Types
          </label>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {filterOptions.sessionTypes.map(type => (
              <label key={type} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.sessionTypes.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...filters.sessionTypes, type]
                      : filters.sessionTypes.filter(t => t !== type);
                    onFiltersChange({ ...filters, sessionTypes: newTypes });
                  }}
                  className="mr-2"
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="text-sm text-gray-600">
          <div><strong>Total Sessions:</strong> {calendarData.totalSessions}</div>
          <div><strong>Date Range:</strong> {format(calendarData.dateRange.start, 'yyyy')} - {format(calendarData.dateRange.end, 'yyyy')}</div>
          <div><strong>Peak Months:</strong> {calendarData.patterns.peakMonths.join(', ')}</div>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.workshops.length > 0 || filters.sessionTypes.length > 0) && (
        <div className="mt-4 flex items-center space-x-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.workshops.map(workshop => (
            <span key={workshop} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              {workshop.toUpperCase()}
              <button
                onClick={() => onFiltersChange({
                  ...filters,
                  workshops: filters.workshops.filter(w => w !== workshop)
                })}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
          {filters.sessionTypes.map(type => (
            <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              {type}
              <button
                onClick={() => onFiltersChange({
                  ...filters,
                  sessionTypes: filters.sessionTypes.filter(t => t !== type)
                })}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={() => onFiltersChange({ workshops: [], presenters: [], sessionTypes: [], topics: [] })}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

interface CalendarGridProps {
  view: CalendarView;
  data: CalendarYear[] | CalendarMonth[] | CalendarDay[];
  onItemClick: (item: any) => void;
  workshops: { [key: string]: Workshop };
}

function CalendarGrid({ view, data, onItemClick, workshops }: CalendarGridProps) {
  if (view === 'decade') {
    const years = data as CalendarYear[];
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {years.map((year) => (
          <div
            key={year.year}
            onClick={() => onItemClick(year)}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
            style={{ 
              backgroundColor: DENSITY_COLORS[year.density],
              borderLeft: year.density !== 'none' ? `4px solid #2563eb` : '4px solid transparent'
            }}
          >
            <div className="text-xl font-bold text-gray-900 mb-1">{year.year}</div>
            <div className="text-sm font-medium text-gray-700 mb-1">{year.totalSessions} sessions</div>
            <div className="text-xs text-gray-600 mb-3">{year.uniquePresenters} presenters</div>
            <div className="flex space-x-1">
              {year.workshopTypes.map(workshop => (
                <div
                  key={workshop}
                  className="w-4 h-4 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: WORKSHOP_COLORS[workshop as keyof typeof WORKSHOP_COLORS] || '#6b7280' }}
                  title={workshops[workshop]?.shortName || workshop}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (view === 'year') {
    const months = data as CalendarMonth[];
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map((month) => (
          <div
            key={`${month.year}-${month.month}`}
            onClick={() => onItemClick(month)}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
            style={{ 
              backgroundColor: DENSITY_COLORS[month.density],
              borderLeft: month.density !== 'none' ? `4px solid #2563eb` : '4px solid transparent'
            }}
          >
            <div className="text-lg font-bold text-gray-900 mb-1">{month.name}</div>
            <div className="text-sm font-medium text-gray-700 mb-1">{month.totalSessions} sessions</div>
            {month.totalSessions > 0 && (
              <>
                <div className="text-xs text-gray-600 mb-3">{month.uniquePresenters} presenters</div>
                <div className="flex space-x-1">
                  {month.workshopTypes.map(workshop => (
                    <div
                      key={workshop}
                      className="w-4 h-4 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: WORKSHOP_COLORS[workshop as keyof typeof WORKSHOP_COLORS] || '#6b7280' }}
                      title={workshops[workshop]?.shortName || workshop}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (view === 'month') {
    const days = data as CalendarDay[];
    // Group days by week for calendar layout
    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];
    
    days.forEach((day, index) => {
      if (index === 0) {
        // Fill in empty days at start of month
        const dayOfWeek = day.date.getDay(); // 0 = Sunday
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({} as CalendarDay);
        }
      }
      
      currentWeek.push(day);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      // Fill in empty days at end of month
      while (currentWeek.length < 7) {
        currentWeek.push({} as CalendarDay);
      }
      weeks.push(currentWeek);
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Calendar header */}
        <div className="grid grid-cols-7 bg-gray-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar weeks */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-t border-gray-200">
            {week.map((day, dayIndex) => {
              if (!day.date) {
                return <div key={dayIndex} className="h-24 bg-gray-50" />;
              }
              
              return (
                <div
                  key={`${day.date.getTime()}-${dayIndex}`}
                  className="h-24 border-r border-gray-200 p-1 cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ backgroundColor: day.sessionCount > 0 ? DENSITY_COLORS[day.density] : undefined }}
                  onClick={() => day.sessionCount > 0 && onItemClick(day)}
                >
                  <div className="text-sm font-medium text-gray-900">
                    {format(day.date, 'd')}
                  </div>
                  {day.sessionCount > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      {day.sessionCount} session{day.sessionCount !== 1 ? 's' : ''}
                    </div>
                  )}
                  {day.workshopTypes.length > 0 && (
                    <div className="flex space-x-1 mt-1">
                      {day.workshopTypes.slice(0, 3).map(workshop => (
                        <div
                          key={workshop}
                          className="w-2 h-2 rounded"
                          style={{ backgroundColor: WORKSHOP_COLORS[workshop as keyof typeof WORKSHOP_COLORS] || '#6b7280' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

export function InteractiveCalendar({ sessions, workshops, onSessionClick }: InteractiveCalendarProps) {
  const [view, setView] = useState<CalendarView>('decade');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState<CalendarFilters>({
    workshops: [],
    presenters: [],
    sessionTypes: [],
    topics: []
  });

  // Process calendar data
  const calendarData = useMemo(() => {
    return processCalendarData(sessions, filters);
  }, [sessions, filters]);

  // Get view-specific data
  const viewData = useMemo(() => {
    return getCalendarViewData(calendarData, view, selectedDate);
  }, [calendarData, view, selectedDate]);

  // Quick navigation targets
  const quickNavTargets = useMemo(() => {
    return getQuickNavTargets(calendarData);
  }, [calendarData]);

  // Filter options
  const filterOptions = useMemo(() => {
    const allWorkshops = new Set<string>();
    const allSessionTypes = new Set<string>();
    const allPresenters = new Set<string>();

    sessions.forEach(session => {
      allWorkshops.add(session.workshopId);
      allSessionTypes.add(session.type);
      session.presenters.forEach(p => allPresenters.add(p));
      (session.coPresenters || []).forEach(p => allPresenters.add(p));
    });

    return {
      workshops: Array.from(allWorkshops).sort(),
      sessionTypes: Array.from(allSessionTypes).sort(),
      presenters: Array.from(allPresenters).sort()
    };
  }, [sessions]);

  const handleItemClick = (item: any) => {
    if (view === 'decade') {
      // Year clicked - navigate to year view
      const year = item as CalendarYear;
      setSelectedDate(new Date(year.year, 0, 1));
      setView('year');
    } else if (view === 'year') {
      // Month clicked - navigate to month view
      const month = item as CalendarMonth;
      setSelectedDate(new Date(month.year, month.month, 1));
      setView('month');
    } else if (view === 'month') {
      // Day clicked - show sessions for that day
      const day = item as CalendarDay;
      if (day.sessions.length === 1) {
        onSessionClick?.(day.sessions[0]);
      } else if (day.sessions.length > 1) {
        // Could show a session picker modal
        console.log('Multiple sessions on this day:', day.sessions);
        onSessionClick?.(day.sessions[0]); // For now, just show the first
      }
    }
  };

  const handleNavigateUp = () => {
    const result = navigateUp(view, selectedDate);
    setView(result.view);
    setSelectedDate(result.date);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    // Automatically adjust view to be appropriate for the date
    if (view === 'decade') {
      setView('year');
    }
  };

  return (
    <div className="space-y-6">
      <CalendarHeader
        view={view}
        selectedDate={selectedDate}
        onViewChange={setView}
        onDateChange={handleDateChange}
        onNavigateUp={handleNavigateUp}
        quickNavTargets={quickNavTargets}
        filters={filters}
        onFiltersChange={setFilters}
        filterOptions={filterOptions}
        calendarData={calendarData}
      />

      <CalendarGrid
        view={view}
        data={viewData}
        onItemClick={handleItemClick}
        workshops={workshops}
      />

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Session Density */}
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">Session Density</h4>
            <div className="flex items-center space-x-3">
              {Object.entries(DENSITY_COLORS).map(([level, color]) => (
                <div key={level} className="flex items-center space-x-1">
                  <div 
                    className="w-4 h-4 rounded border border-gray-300" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-gray-600 capitalize">{level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Workshop Types */}
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">Workshop Series</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(WORKSHOP_COLORS).map(([workshop, color]) => (
                <div key={workshop} className="flex items-center space-x-1">
                  <div 
                    className="w-4 h-4 rounded-full border border-white shadow-sm" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-gray-600">{workshops[workshop]?.shortName || workshop.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}