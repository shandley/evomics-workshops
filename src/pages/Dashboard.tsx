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

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-center text-white transform hover:scale-105 transition-transform">
          <div className="text-3xl font-bold mb-2">{stats.totalSessions}</div>
          <div className="font-medium">Teaching Sessions</div>
          <div className="text-primary-100 text-sm mt-1">Archived & Searchable</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-center text-white transform hover:scale-105 transition-transform">
          <div className="text-3xl font-bold mb-2">{stats.totalPresenters}</div>
          <div className="font-medium">Faculty Presenters</div>
          <div className="text-green-100 text-sm mt-1">Contributing Experts</div>
        </div>
        
        <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-lg p-6 text-center text-white transform hover:scale-105 transition-transform">
          <div className="text-3xl font-bold mb-2">{stats.totalWorkshops}</div>
          <div className="font-medium">Workshop Series</div>
          <div className="text-secondary-100 text-sm mt-1">Active & Historical</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-center text-white transform hover:scale-105 transition-transform">
          <div className="text-3xl font-bold mb-2">{stats.yearRange.end - stats.yearRange.start + 1}</div>
          <div className="font-medium">Years Covered</div>
          <div className="text-orange-100 text-sm mt-1">{stats.yearRange.start}–{stats.yearRange.end}</div>
        </div>
      </div>

      {/* Workshop Overview */}
      <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Workshop Series</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(workshops).map(([id, workshop]) => {
            const workshopStats = stats.workshopStats[id];
            return (
              <div key={id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{workshop.shortName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    workshop.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {workshop.active ? 'Active' : 'Historical'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{workshop.description}</p>
                
                {workshopStats && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sessions:</span>
                      <span className="font-medium">{workshopStats.sessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Presenters:</span>
                      <span className="font-medium">{workshopStats.presenters}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Years:</span>
                      <span className="font-medium">
                        {workshopStats.years.length > 0 
                          ? `${Math.min(...workshopStats.years)}–${Math.max(...workshopStats.years)}`
                          : 'No data'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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