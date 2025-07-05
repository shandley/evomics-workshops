import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About the Workshop Archive</h1>
        <p className="text-xl text-gray-600">
          Preserving 15+ years of genomics education excellence
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          The Evomics Workshop Archive serves as a comprehensive repository of educational content, 
          curriculum development, and faculty contributions across the world-renowned Evomics workshop series. 
          Our goal is to preserve and share the knowledge accumulated through years of intensive genomics education.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Preserve Knowledge</h3>
            <p className="text-gray-600 text-sm">Documenting educational innovations and curriculum evolution</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Enable Discovery</h3>
            <p className="text-gray-600 text-sm">Making workshop content searchable and accessible</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Connect Community</h3>
            <p className="text-gray-600 text-sm">Linking faculty, students, and educational resources</p>
          </div>
        </div>
      </div>

      {/* Archive Contents */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What's in the Archive</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Workshop Schedules</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Complete session schedules from 2011-2025</li>
              <li>• Detailed timing and location information</li>
              <li>• Session types and learning objectives</li>
              <li>• Historical evolution of curriculum</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Faculty Contributions</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Teaching histories for 149+ faculty members</li>
              <li>• Presenter and co-presenter information</li>
              <li>• Cross-links to faculty directory profiles</li>
              <li>• Collaboration patterns and networks</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔬 Workshop Series</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Workshop on Genomics (WoG)</li>
              <li>• Population & Speciation Genomics (WPSG)</li>
              <li>• Workshop on Phylogenomics (WPhylo)</li>
              <li>• Historical series (Molecular Evolution, Harvard workshops)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Analytics & Insights</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Curriculum evolution tracking</li>
              <li>• Teaching load distribution</li>
              <li>• Topic popularity trends</li>
              <li>• Geographic and temporal patterns</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Implementation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🛠️ Technology Stack</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>Frontend:</strong> React 18 + TypeScript</li>
              <li>• <strong>Build Tool:</strong> Vite for fast development</li>
              <li>• <strong>Styling:</strong> Tailwind CSS v3</li>
              <li>• <strong>Deployment:</strong> GitHub Pages</li>
              <li>• <strong>Data:</strong> Static JSON with processing utilities</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Advanced search and filtering</li>
              <li>• Timeline visualization</li>
              <li>• Responsive design</li>
              <li>• Cross-site navigation</li>
              <li>• Performance optimized</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">
            <strong>Open Source:</strong> This archive is part of the open-source Evomics ecosystem. 
            View the source code and contribute on{' '}
            <a 
              href="https://github.com/shandley/evomics-faculty" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              GitHub
            </a>.
          </p>
        </div>
      </div>

      {/* Ecosystem */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Evomics Ecosystem</h2>
        <p className="text-gray-700 mb-6">
          The Workshop Archive is part of a comprehensive three-site ecosystem documenting the Evomics community:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a 
            href="https://shandley.github.io/evomics-faculty/"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">
                Faculty Directory
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              184 faculty profiles with teaching histories, research areas, and professional details.
            </p>
          </a>

          <div className="border border-blue-500 bg-blue-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-bold text-blue-900">
                Workshop Archive
              </h3>
            </div>
            <p className="text-blue-800 text-sm">
              You are here! Complete curriculum archive with 580+ sessions and teaching materials.
            </p>
          </div>

          <a 
            href="https://shandley.github.io/evomics-students/"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600">
                Student Alumni
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              1,411+ student alumni with career tracking and outcomes analysis.
            </p>
          </a>
        </div>
      </div>

      {/* Contact & Feedback */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact & Feedback</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📧 Get in Touch</h3>
            <p className="text-gray-700 mb-4">
              Have suggestions, corrections, or additional content to contribute? We'd love to hear from you.
            </p>
            <div className="space-y-2">
              <p className="text-gray-600">
                <strong>Email:</strong>{' '}
                <a href="mailto:fourthculture@gmail.com" className="text-blue-600 hover:text-blue-800">
                  fourthculture@gmail.com
                </a>
              </p>
              <p className="text-gray-600">
                <strong>GitHub:</strong>{' '}
                <a 
                  href="https://github.com/shandley/evomics-faculty/issues" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Submit an Issue
                </a>
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Start</h3>
            <p className="text-gray-700 mb-4">Ready to explore? Here are some great starting points:</p>
            <div className="space-y-2">
              <Link to="/dashboard" className="block text-blue-600 hover:text-blue-800">
                → View Archive Dashboard
              </Link>
              <Link to="/sessions" className="block text-blue-600 hover:text-blue-800">
                → Browse All Sessions
              </Link>
              <Link to="/timeline" className="block text-blue-600 hover:text-blue-800">
                → Explore Timeline View
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">
          Built with ❤️ for the genomics education community. 
          Part of the broader <a href="https://evomics.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">evomics.org</a> mission.
        </p>
      </div>
    </div>
  );
};

export default About;