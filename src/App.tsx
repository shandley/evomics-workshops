import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Timeline from './pages/Timeline';
import Sessions from './pages/Sessions';
import SessionDetail from './pages/SessionDetail';
import Presenters from './pages/Presenters';
import Search from './pages/Search';
import About from './pages/About';
import { SearchProvider } from './contexts/SearchContext';

function App() {
  return (
    <Router basename="/evomics-workshops">
      <SearchProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
            <Route path="/presenters" element={<Presenters />} />
            <Route path="/search" element={<Search />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
      </SearchProvider>
    </Router>
  );
}

export default App;