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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Interactive Workshop Calendar</h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          Explore {sessions.length} workshop sessions across 15 years of genomics education. 
          Navigate through decades, years, and months to discover patterns and find specific sessions.
        </p>
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