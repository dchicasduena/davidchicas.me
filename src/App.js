import React, { useEffect, useLayoutEffect } from 'react';
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

const notFoundArt = String.raw` __    __   ______   __    __ 
|  \  |  \ /      \ |  \  |  \
| $$  | $$|  $$$$$$\| $$  | $$
| $$__| $$| $$$\| $$| $$__| $$
| $$    $$| $$$$\ $$| $$    $$
 \$$$$$$$$| $$\$$\$$ \$$$$$$$$
      | $$| $$_\$$$$      | $$
      | $$ \$$  \$$$      | $$
       \$$  \$$$$$$        \$$
                              `;

const Portfolio = () => {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, '').toLowerCase();
  const isPortfolioPath = normalizedPath === '' || Object.prototype.hasOwnProperty.call(legacyProjectRoutes, normalizedPath);

  useEffect(() => {
    const root = document.documentElement;
    let frameId = null;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;

    const updatePointer = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        root.style.setProperty('--pointer-x', `${pointerX}px`);
        root.style.setProperty('--pointer-y', `${pointerY}px`);
        frameId = null;
      });
    };

    window.addEventListener('pointermove', updatePointer, { passive: true });

    return () => {
      window.removeEventListener('pointermove', updatePointer);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

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
        <div className="crt-screen-effects" aria-hidden="true" />
        <main className="App not-found-content">
          <pre className="not-found-art" aria-hidden="true">{notFoundArt}</pre>
          <h1 className="not-found-title">
            sorry something went wrong ...<span className="not-found-cursor" aria-hidden="true">_</span>
          </h1>
          <p className="project-links">
            <a href="/">go back to main</a>
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <div className="crt-screen-effects" aria-hidden="true" />
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
    <Portfolio />
  </Router>
);

export default App;
