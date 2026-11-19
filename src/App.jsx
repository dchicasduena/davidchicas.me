import React, { useLayoutEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import './App.css';

import Footer from './components/Footer';
import Home from './components/Home';
import AboutMe from './components/AboutMe';
import Projects from './components/Projects';
import Contact from './components/Contact';
import { ButtonLink } from './components/ui/button';
import { NotFound } from './components/dithercn/not-found';
import { MeshGradient } from './components/dithercn/mesh-gradient';

const legacyProjectRoutes = {
  '/tfmm': 'project-tfmm',
  '/genrify': 'project-genrify',
  '/cardbinder': 'project-cardbinder',
  '/moreprojects': 'projects',
};

const Portfolio = () => {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, '').toLowerCase();
  const isPortfolioPath = normalizedPath === '' || Object.prototype.hasOwnProperty.call(legacyProjectRoutes, normalizedPath);

  useLayoutEffect(() => {
    const history = window.history;
    if (!('scrollRestoration' in history)) return undefined;

    const previousScrollRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';

    return () => {
      history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const targetId = legacyProjectRoutes[normalizedPath];

    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView?.({ block: 'start' });
    } else if (normalizedPath === '') {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [normalizedPath]);

  if (!isPortfolioPath) {
    return (
      <>
        <main className="App not-found-content">
          <NotFound
            title={(
              <>
                Sorry something went wrong
                <span className="not-found-cursor" aria-hidden="true">_</span>
              </>
            )}
            description={null}
            detail={`Requested path: ${pathname}`}
            titleAs="h1"
            color="--dither-ink"
            fill="gradient"
            bloom="high"
            depth={6}
            cell={3}
            actions={(
              <p className="project-links">
                <ButtonLink className="legacy-link" href="/">
                  GO BACK
                </ButtonLink>
              </p>
            )}
            className="w-full py-0"
          />
        </main>
      </>
    );
  }

  return (
    <>
      <div className="App">
        <Home />
        <main id="main" className="terminal-content">
          <AboutMe />
          <Projects />
          <Contact />
          <Footer />
        </main>
      </div>
    </>
  );
};

const App = () => (
  <Router>
    <>
      <MeshGradient
        blobs={4}
        size={0.3}
        palette={['#0A0A0A', '#141414', '#141414', '#141414', '#141414']}
        matrix="bayer8"
        cell={2}
        className="fixed inset-0 z-0"
      />
      <Portfolio />
    </>
  </Router>
);

export default App;
