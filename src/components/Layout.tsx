import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSearchActions } from '../contexts/SearchContext';
import { UnifiedNavigation } from './UnifiedNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setQuery } = useSearchActions();
  const [headerSearch, setHeaderSearch] = useState('');

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Calendar', href: '/timeline', icon: '📅' },
    { name: 'Sessions', href: '/sessions', icon: '📚' },
    { name: 'Presenters', href: '/presenters', icon: '👨‍🏫' },
    { name: 'Search', href: '/search', icon: '🔍' },
    { name: 'About', href: '/about', icon: 'ℹ️' },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      setQuery(headerSearch.trim());
      navigate('/search');
      setHeaderSearch('');
    }
  };

  const handleUniversalSearch = (query: string) => {
    setQuery(query);
    navigate('/search');
  };

  const customNavItems = navigation.map(item => ({
    label: item.name,
    path: item.href
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Unified Navigation */}
      <UnifiedNavigation 
        currentSite="workshops" 
        onUniversalSearch={handleUniversalSearch}
        customNavItems={customNavItems}
      />

      {/* Secondary Navigation for Site-Specific Items */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:text-primary-700 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            
            {/* Quick Search in Secondary Nav */}
            <form onSubmit={handleHeaderSearch} className="ml-auto">
              <div className="relative">
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Quick search sessions..."
                  className="w-64 px-3 py-2 pl-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </form>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2025 Evomics Workshop Archive. Part of the Evomics.org ecosystem.
            </div>
            <div className="flex space-x-6 text-sm">
              <a 
                href="https://evomics.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                evomics.org
              </a>
              <a 
                href="https://github.com/shandley/evomics-faculty" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;