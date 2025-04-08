import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './assets/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import AboutMe from './components/AboutMe';
import Projects from './components/Projects';
import Contact from './components/Contact';

import MoreProjects from "./pages/MoreProjects";
import Genrify from "./pages/Genrify";
import CardBinder from './pages/CardBinder';
import TFMM from './pages/TFMM';
import DCLogo from './pages/DCLogo';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Header />

        <Routes>
          <Route path="/" element={
            <>
              <Home showBurger />
              <main id="main">
                <AboutMe />
                <Projects />
                <Contact />
              </main>
            </>
          } />
          <Route path="/moreprojects" element={
            <>
              <Home showBack />
              <main id="main">
                <MoreProjects />
              </main>
            </>
          } />
          <Route path="/genrify" element={
            <>
              <Home showBack />
              <main id="main">
                <Genrify />
              </main>
            </>
          } />
          <Route path="/cardBinder" element={
            <>
              <Home showBack />
              <main id="main">
                <CardBinder />
              </main>
            </>
          } />
          <Route path="/TFMM" element={
            <>
              <Home showBack />
              <main id="main">
                <TFMM />
              </main>
            </>
          } />
          <Route path="/DCLogo" element={
            <>
              <Home showBack />
              <main id="main">
                <DCLogo />
              </main>
            </>
          } />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
