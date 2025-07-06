import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllSessions, getWorkshops, loadAllWorkshopData } from '../utils/dataProcessor';
import { convertFacultyIdToName, getFacultyProfileUrl } from '../utils/facultyHelper';
import { PresenterBadge } from '../components/PresenterCard';
import { PresenterModal } from '../components/PresenterModal';
import { processPresenterProfiles, getPresenterProfile, getRelatedPresenters } from '../utils/presenterProcessor';
import type { PresenterProfile } from '../types';

const SessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedPresenter, setSelectedPresenter] = useState<PresenterProfile | null>(null);
  
  const allSessions = useMemo(() => getAllSessions(), []);
  const workshops = useMemo(() => getWorkshops(), []);
  
  // Load presenter profiles
  const presenterDirectory = useMemo(() => {
    const workshopData = loadAllWorkshopData();
    return processPresenterProfiles(workshopData);
  }, []);

  const session = useMemo(() => {
    return allSessions.find(s => s.id === id);
  }, [allSessions, id]);

  const relatedSessions = useMemo(() => {
    if (!session) return [];
    
    // Find sessions from same presenter in same workshop
    return allSessions
      .filter(s => 
        s.id !== session.id && 
        s.workshopId === session.workshopId &&
        s.presenters.includes(session.presenters[0])
      )
      .slice(0, 5);
  }, [allSessions, session]);

  // Get presenter profiles for this session
  const sessionPresenters = useMemo(() => {
    if (!session) return [];
    
    const allPresenters = [...session.presenters, ...(session.coPresenters || [])];
    return allPresenters
      .map(presenterName => getPresenterProfile(presenterName, presenterDirectory))
      .filter(Boolean) as PresenterProfile[];
  }, [session, presenterDirectory]);

  // Get related presenters for modal
  const relatedPresenters = useMemo(() => {
    if (!selectedPresenter) return [];
    return getRelatedPresenters(selectedPresenter, presenterDirectory, 5);
  }, [selectedPresenter, presenterDirectory]);

  const handleViewPresenter = (presenter: PresenterProfile) => {
    setSelectedPresenter(presenter);
  };

  const handleCloseModal = () => {
    setSelectedPresenter(null);
  };

  if (!session) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h1>
        <p className="text-gray-600 mb-6">The requested session could not be found.</p>
        <Link 
          to="/sessions"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          ← Back to Sessions
        </Link>
      </div>
    );
  }

  const workshop = workshops[session.workshopId];

  const getWorkshopColor = (workshopId: string) => {
    const colors = {
      'wog': 'bg-blue-100 text-blue-800 border-blue-300',
      'wpsg': 'bg-green-100 text-green-800 border-green-300',
      'wphylo': 'bg-purple-100 text-purple-800 border-purple-300',
      'wmolevo': 'bg-orange-100 text-orange-800 border-orange-300',
      'htranscriptomics': 'bg-pink-100 text-pink-800 border-pink-300',
      'hmicrobial': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    };
    return colors[workshopId as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/sessions" className="hover:text-gray-700">Sessions</Link>
        <span>›</span>
        <span className="text-gray-900">{session.topic}</span>
      </nav>

      {/* Session Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getWorkshopColor(session.workshopId)}`}>
                {workshop?.shortName || session.workshopId}
              </span>
              <span className="text-gray-500">{session.year}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                workshop?.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {workshop?.active ? 'Active Series' : 'Historical Series'}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{session.topic}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 font-medium">Date:</span>
                <div className="text-gray-900">{session.date}</div>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Time:</span>
                <div className="text-gray-900">{session.time}</div>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Type:</span>
                <div className="text-gray-900 capitalize">{session.type}</div>
              </div>
              {session.location && (
                <div>
                  <span className="text-gray-500 font-medium">Location:</span>
                  <div className="text-gray-900">{session.location}</div>
                </div>
              )}
            </div>
          </div>
          
          <Link
            to="/sessions"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            ← Back to Sessions
          </Link>
        </div>
      </div>

      {/* Session Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enhanced Presenter Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Session Presenters</h2>
            
            {sessionPresenters.length > 0 ? (
              <div className="space-y-4">
                {sessionPresenters.map((presenter, index) => (
                  <div key={presenter.id}>
                    {index === 0 && (
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Primary Presenter</h3>
                    )}
                    {index === 1 && session.coPresenters && session.coPresenters.length > 0 && (
                      <h3 className="text-sm font-medium text-gray-700 mb-2 mt-6">Co-presenters</h3>
                    )}
                    
                    <PresenterBadge
                      presenter={presenter}
                      onViewProfile={handleViewPresenter}
                      showExpertise={true}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Fallback for presenters without profiles */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Primary Presenter</h3>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">
                        {convertFacultyIdToName(session.presenters[0])?.split(' ').map(n => n[0]).join('') || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{convertFacultyIdToName(session.presenters[0])}</div>
                      <a 
                        href={getFacultyProfileUrl(session.presenters[0])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Faculty Profile →
                      </a>
                    </div>
                  </div>
                </div>

                {session.coPresenters && session.coPresenters.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Co-presenters</h3>
                    <div className="space-y-2">
                      {session.coPresenters.map((presenter, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-xs">
                              {convertFacultyIdToName(presenter).split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{convertFacultyIdToName(presenter)}</div>
                            <a 
                              href={getFacultyProfileUrl(presenter)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View Faculty Profile →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick actions for presenters */}
            {sessionPresenters.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/presenters"
                    className="inline-flex items-center px-3 py-2 border border-primary-300 rounded-md text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
                  >
                    Browse All Presenters
                  </Link>
                  
                  {sessionPresenters[0] && (
                    <Link
                      to={`/sessions?presenter=${encodeURIComponent(sessionPresenters[0].name)}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      More Sessions by {sessionPresenters[0].displayName.split(' ')[0]}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Workshop Context */}
          {workshop && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Workshop Context</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{workshop.name}</h3>
                  <p className="text-gray-600 mt-1">{workshop.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Location:</span>
                    <div className="text-gray-900">{workshop.location}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Series Status:</span>
                    <div className="text-gray-900">
                      {workshop.active ? 'Active' : 'Historical'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Start Year:</span>
                    <div className="text-gray-900">{workshop.startYear}</div>
                  </div>
                  {workshop.endYear && (
                    <div>
                      <span className="text-gray-500 font-medium">End Year:</span>
                      <div className="text-gray-900">{workshop.endYear}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <a
                href={getFacultyProfileUrl(session.presenters[0])}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
              >
                View Presenter Profile
              </a>
              
              <Link
                to={`/sessions?workshop=${session.workshopId}&year=${session.year}`}
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Other {session.year} Sessions
              </Link>
              
              <Link
                to={`/timeline`}
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View in Timeline
              </Link>
            </div>
          </div>

          {/* Related Sessions */}
          {relatedSessions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                More from {session.presenters[0]}
              </h3>
              
              <div className="space-y-3">
                {relatedSessions.map((relatedSession) => (
                  <Link
                    key={relatedSession.id}
                    to={`/sessions/${relatedSession.id}`}
                    className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      {relatedSession.topic}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {relatedSession.year} • {relatedSession.type}
                    </div>
                  </Link>
                ))}
              </div>
              
              <Link
                to={`/sessions?presenter=${encodeURIComponent(session.presenters[0])}`}
                className="block mt-4 text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All Sessions →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Presenter Modal */}
      <PresenterModal
        presenter={selectedPresenter}
        isOpen={!!selectedPresenter}
        onClose={handleCloseModal}
        relatedPresenters={relatedPresenters}
        onViewRelated={handleViewPresenter}
      />
    </div>
  );
};

export default SessionDetail;