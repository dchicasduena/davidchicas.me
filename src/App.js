import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import './App.css';

import Footer from './components/Footer';
import Home from './components/Home';
import AboutMe from './components/AboutMe';
import Projects from './components/Projects';
import Contact from './components/Contact';

const legacyProjectRoutes = {
  '/tfmm': 'project-tfmm',
  '/genrify': 'project-genrify',
  '/cardbinder': 'project-cardbinder',
  '/dclogo': 'project-dclogo',
  '/moreprojects': 'projects',
};

const Portfolio = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath = pathname.replace(/\/+$/, '').toLowerCase();
    const targetId = legacyProjectRoutes[normalizedPath];

    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView?.({ block: 'start' });
    } else if (normalizedPath === '') {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <div className="App">
      <Home />
      <main id="main" className="terminal-content">
        <AboutMe />
        <Projects />
        <Contact />
        <Footer />
      </main>
    </div>
  );
};

const App = () => (
  <Router>
    <Portfolio />
  </Router>
);

export default App;
