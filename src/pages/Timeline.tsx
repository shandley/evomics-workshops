import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSessions, getWorkshops } from '../utils/dataProcessor';
import { InteractiveCalendar } from '../components/InteractiveCalendar';
import type { SessionDetail } from '../types';

const Timeline: React.FC = () => {
  const navigate = useNavigate();
  const sessions = useMemo(() => getAllSessions(), []);
  const workshops = useMemo(() => getWorkshops(), []);

  const handleSessionClick = (session: SessionDetail) => {
    navigate(`/sessions/${session.id}`);
  };

  // Calculate workshop lifecycle data
  const lifecycleData = useMemo(() => {
    const activeWorkshops = Object.values(workshops).filter(w => w.active);
    const historicalWorkshops = Object.values(workshops).filter(w => !w.active);
    
    const workshopTimelines = Object.values(workshops).map(workshop => {
      const workshopSessions = sessions.filter(s => s.workshopId === workshop.id);
      const years = workshopSessions.map(s => s.year).sort((a, b) => a - b);
      const firstYear = years[0];
      const lastYear = years[years.length - 1];
      
      return {
        ...workshop,
        firstSession: firstYear,
        lastSession: lastYear,
        totalSessions: workshopSessions.length,
        isActive: workshop.active,
        duration: lastYear - firstYear + 1
      };
    }).sort((a, b) => a.startYear - b.startYear);

    return {
      active: activeWorkshops,
      historical: historicalWorkshops,
      timelines: workshopTimelines
    };
  }, [workshops, sessions]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Interactive Workshop Timeline</h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          Explore {sessions.length} workshop sessions across 15 years of genomics education. 
          Navigate through decades, years, and months to discover patterns and find specific sessions.
        </p>
      </div>

      {/* Workshop Lifecycle Overview */}
      <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 border border-white/20">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Workshop Series Lifecycle</h2>
        
        <div className="space-y-4">
          {lifecycleData.timelines.map(timeline => (
            <div key={timeline.id} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-gray-900">{timeline.shortName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    timeline.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {timeline.isActive ? 'Active' : 'Historical'}
                  </span>
                  {timeline.endYear && (
                    <span className="text-sm text-gray-500">
                      Ended {timeline.endYear}
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600">
                  {timeline.totalSessions} sessions • {timeline.duration} years
                </div>
              </div>
              
              {/* Timeline Bar */}
              <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                    timeline.isActive 
                      ? 'bg-gradient-to-r from-green-400 to-green-600' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 opacity-70'
                  }`}
                  style={{
                    marginLeft: `${((timeline.firstSession - 2011) / (2025 - 2011)) * 100}%`,
                    width: `${(timeline.duration / (2025 - 2011)) * 100}%`
                  }}
                />
                
                {/* Start and End markers */}
                <div 
                  className="absolute top-0 h-full w-1 bg-white shadow-sm"
                  style={{ left: `${((timeline.firstSession - 2011) / (2025 - 2011)) * 100}%` }}
                />
                <div 
                  className="absolute top-0 h-full w-1 bg-white shadow-sm"
                  style={{ left: `${((timeline.lastSession - 2011) / (2025 - 2011)) * 100}%` }}
                />
                
                {/* End marker for historical workshops */}
                {!timeline.isActive && timeline.endYear && (
                  <div 
                    className="absolute top-0 h-full w-2 bg-red-500 opacity-75"
                    style={{ left: `${((timeline.endYear - 2011) / (2025 - 2011)) * 100}%` }}
                    title={`Series ended in ${timeline.endYear}`}
                  />
                )}
              </div>
              
              {/* Year labels */}
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{timeline.firstSession}</span>
                <span>{timeline.isActive ? 'Present' : timeline.lastSession}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Timeline scale */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Evolution Timeline</span>
            <span>2011 - 2025</span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 rounded-full opacity-50" />
            {/* Year markers */}
            {[2011, 2015, 2020, 2025].map(year => (
              <div 
                key={year}
                className="absolute top-0 h-full w-0.5 bg-gray-400"
                style={{ left: `${((year - 2011) / (2025 - 2011)) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>2011</span>
            <span>2015</span>
            <span>2020</span>
            <span>2025</span>
          </div>
        </div>
      </div>

      {/* Interactive Calendar */}
      <InteractiveCalendar
        sessions={sessions}
        workshops={workshops}
        onSessionClick={handleSessionClick}
      />
    </div>
  );
};

export default Timeline;