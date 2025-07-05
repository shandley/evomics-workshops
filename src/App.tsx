import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Evomics Workshop Archive
              </h1>
            </div>
            <nav className="flex space-x-8">
              <a 
                href="https://shandley.github.io/evomics-faculty/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Faculty Directory
              </a>
              <a 
                href="https://shandley.github.io/evomics-students/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Student Alumni
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Workshop Curriculum Archive
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore 15+ years of genomics education excellence. Search through workshop schedules, 
            curriculum evolution, and faculty teaching contributions across the evomics workshop series.
          </p>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Workshop Archive Coming Soon</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're building a comprehensive archive of workshop curricula, schedules, and educational resources. 
            This will include searchable content from all Evomics workshops spanning 2011-2025.
          </p>
          
          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-left">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Workshop Schedules</h4>
              <p className="text-blue-700 text-sm">Complete schedules for all workshops including sessions, times, and locations</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Faculty Teaching History</h4>
              <p className="text-green-700 text-sm">Detailed teaching contributions and curriculum evolution over time</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Advanced Search</h4>
              <p className="text-purple-700 text-sm">Search by topic, presenter, year, location, and workshop type</p>
            </div>
          </div>
        </div>

        {/* Navigation to Other Sites */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <a 
            href="https://shandley.github.io/evomics-faculty/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Faculty Directory
              </h3>
            </div>
            <p className="text-gray-600">
              Explore profiles of 184 faculty members with comprehensive teaching histories and research areas.
            </p>
          </a>

          <a 
            href="https://shandley.github.io/evomics-students/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                Student Alumni
              </h3>
            </div>
            <p className="text-gray-600">
              Browse 1,411 student alumni from workshops spanning 2011-2025 with career outcomes and achievements.
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}

export default App;