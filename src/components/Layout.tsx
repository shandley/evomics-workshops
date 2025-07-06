import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Timeline', href: '/timeline', icon: '📅' },
    { name: 'Sessions', href: '/sessions', icon: '🔍' },
    { name: 'Presenters', href: '/presenters', icon: '👨‍🏫' },
    { name: 'About', href: '/about', icon: 'ℹ️' },
  ];

  const isActive = (href: string) => location.pathname === href;

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

            {/* External Links */}
            <div className="flex space-x-4">
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