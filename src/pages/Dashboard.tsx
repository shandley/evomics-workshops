import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { calculateArchiveStatistics, getWorkshops } from '../utils/dataProcessor';

const Dashboard: React.FC = () => {
  const stats = useMemo(() => calculateArchiveStatistics(), []);
  const workshops = useMemo(() => getWorkshops(), []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Workshop Curriculum Archive
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore {stats.totalYears} years of genomics education excellence. Browse {stats.totalSessions} teaching sessions 
          from {stats.totalPresenters} faculty across {stats.totalWorkshops} workshop series.
        </p>
      </div>

      {/* Evomics Alumni Community - Consistent with Faculty and Student sites */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Evomics Alumni Community</h2>
          <p className="text-gray-600">Connecting faculty and students across the global genomics education network</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl font-bold text-blue-700">{stats.totalSessions}</div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="text-sm font-medium text-blue-600">Teaching Sessions</div>
            <div className="text-xs text-blue-500">Archived & Searchable</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl font-bold text-purple-700">{stats.totalPresenters}</div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="text-sm font-medium text-purple-600">Faculty Presenters</div>
            <div className="text-xs text-purple-500">Contributing Experts</div>
            <div className="mt-2">
              <a 
                href="https://shandley.github.io/evomics-faculty/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 hover:text-purple-800 underline decoration-dotted"
              >
                View Faculty Dashboard
              </a>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl font-bold text-green-700">{stats.yearRange.end - stats.yearRange.start + 1}</div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-sm font-medium text-green-600">Years of Excellence</div>
            <div className="text-xs text-green-500">{stats.yearRange.start} - {stats.yearRange.end}</div>
            <div className="mt-2">
              <div className="text-xs font-medium text-green-600">{stats.totalWorkshops} Workshop Series</div>
              <div className="text-xs text-green-500">3 Active • 3 Historical</div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl font-bold text-orange-700">1,411</div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
            </div>
            <div className="text-sm font-medium text-orange-600">Student Alumni</div>
            <div className="text-xs text-orange-500">Core workshop series</div>
            <div className="mt-2">
              <a 
                href="https://shandley.github.io/evomics-students/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-600 hover:text-orange-800 underline decoration-dotted"
              >
                View Student Dashboard
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            <strong>Building the future of genomics education</strong> — Where{' '}
            <a 
              href="https://shandley.github.io/evomics-faculty/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline decoration-dotted"
            >
              world-class faculty
            </a>
            {' '}and{' '}
            <a 
              href="https://shandley.github.io/evomics-students/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 underline decoration-dotted"
            >
              dedicated students
            </a>
            {' '}create lasting impact in evolutionary genomics
          </p>
        </div>
      </div>

      {/* Workshop Overview */}
      <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Workshop Series</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Active</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full opacity-70"></div>
              <span>Historical</span>
            </div>
          </div>
        </div>
        
        {/* Active Workshops */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Active Workshop Series
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(workshops)
              .filter(([id, workshop]) => {
                const workshopStats = stats.workshopStats[id];
                return workshop.active && workshopStats && workshopStats.sessions > 0;
              })
              .map(([id, workshop]) => {
                const workshopStats = stats.workshopStats[id];
                return (
                  <div key={id} className="border-2 border-green-200 bg-green-50/30 rounded-lg p-4 hover:shadow-lg hover:border-green-300 transition-all transform hover:scale-105">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-900">{workshop.shortName}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{workshop.description}</p>
                    
                    {workshopStats && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sessions:</span>
                          <span className="font-semibold text-green-700">{workshopStats.sessions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Presenters:</span>
                          <span className="font-semibold text-green-700">{workshopStats.presenters}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Since:</span>
                          <span className="font-semibold text-green-700">
                            {workshop.startYear} ({new Date().getFullYear() - workshop.startYear} years)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Historical Workshops */}
        <div>
          <h3 className="text-lg font-semibold text-gray-600 mb-4 flex items-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 opacity-70"></div>
            Historical Workshop Series
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(workshops)
              .filter(([id, workshop]) => {
                const workshopStats = stats.workshopStats[id];
                return !workshop.active && workshopStats && workshopStats.sessions > 0;
              })
              .map(([id, workshop]) => {
                const workshopStats = stats.workshopStats[id];
                return (
                  <div key={id} className="border-2 border-gray-200 bg-gray-50/30 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all opacity-75">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-800">{workshop.shortName}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Historical
                        </span>
                        {workshop.endYear && (
                          <span className="text-xs text-gray-500">
                            Ended {workshop.endYear}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{workshop.description}</p>
                    
                    {workshopStats && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Sessions:</span>
                          <span className="font-medium text-gray-600">{workshopStats.sessions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Presenters:</span>
                          <span className="font-medium text-gray-600">{workshopStats.presenters}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium text-gray-600">
                            {workshop.startYear}–{workshop.endYear || 'Unknown'}
                            {workshop.endYear && ` (${workshop.endYear - workshop.startYear + 1} years)`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          to="/sessions"
          className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6 hover:from-primary-100 hover:to-primary-200 transition-all transform hover:scale-105 shadow-lg group"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mr-4 shadow-md">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-primary-900">Browse Sessions</h3>
          </div>
          <p className="text-primary-700">
            Search and filter through all {stats.totalSessions} teaching sessions with advanced filters.
          </p>
        </Link>

        <Link 
          to="/timeline"
          className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 hover:from-green-100 hover:to-green-200 transition-all transform hover:scale-105 shadow-lg group"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4 shadow-md">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-xl font-bold text-green-900">Timeline View</h3>
          </div>
          <p className="text-green-700">
            Explore curriculum evolution and teaching contributions over {stats.totalYears} years.
          </p>
        </Link>

        <a 
          href="https://shandley.github.io/evomics-faculty/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200 rounded-xl p-6 hover:from-secondary-100 hover:to-secondary-200 transition-all transform hover:scale-105 shadow-lg group"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-secondary-500 rounded-lg flex items-center justify-center mr-4 shadow-md">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-bold text-secondary-900">Faculty Profiles</h3>
          </div>
          <p className="text-secondary-700">
            View detailed faculty profiles with enriched information and teaching histories.
          </p>
        </a>
      </div>

      {/* Recent Activity Preview */}
      <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Archive Highlights</h2>
          <Link 
            to="/sessions" 
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View All Sessions →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Most Recent Workshop</h4>
            <p className="text-blue-800">Workshop on Population and Speciation Genomics 2025</p>
            <p className="text-blue-700 text-sm mt-1">Latest curriculum content available</p>
          </div>
          
          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
            <h4 className="font-semibold text-green-900 mb-2">Archive Scope</h4>
            <p className="text-green-800">{stats.yearRange.start}–{stats.yearRange.end} Coverage</p>
            <p className="text-green-700 text-sm mt-1">Complete historical documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;