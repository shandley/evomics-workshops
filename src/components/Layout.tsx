import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSearchActions } from '../contexts/SearchContext';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <h1 className="text-2xl font-bold text-white hover:text-primary-100 transition-colors">
                  📚 Evomics Workshop Archive
                </h1>
              </Link>
            </div>
            
            {/* Main Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-white/20 text-white'
                      : 'text-primary-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Header Search & External Links */}
            <div className="flex items-center space-x-4">
              {/* Quick Search */}
              <form onSubmit={handleHeaderSearch} className="hidden lg:block">
                <div className="relative">
                  <input
                    type="text"
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    placeholder="Quick search..."
                    className="w-64 px-3 py-1 pl-8 text-sm text-gray-900 placeholder-gray-400 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white focus:text-gray-900"
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </form>

              <a 
                href="https://shandley.github.io/evomics-faculty/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-100 hover:text-white transition-colors text-sm"
              >
                👥 Faculty
              </a>
              <a 
                href="https://shandley.github.io/evomics-students/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-100 hover:text-white transition-colors text-sm"
              >
                🎓 Students
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-primary-500 bg-primary-700">
          <nav className="px-4 py-2 space-x-4 overflow-x-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive(item.href)
                    ? 'bg-white/20 text-white'
                    : 'text-primary-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

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