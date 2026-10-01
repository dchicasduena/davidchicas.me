import React from 'react';
import { Link } from 'react-router-dom';
import logoNormal from '../assets/img/logos/logo normal.svg';

const Home = () => (
  <>
    <header className="masthead" id="home">
      <div className="masthead-top">
        <Link className="brand-link" to="/" aria-label="David Chicas, home">
          <img src={logoNormal} className="masthead-logo" alt="David Chicas logo" />
        </Link>
      </div>

      <nav className="section-nav" aria-label="Page sections">
        <div className="section-links">
          <a href="#about">ABOUT</a>
          <a href="#projects">PROJECTS</a>
          <a href="#contact">CONTACT</a>
        </div>

        <div className="social-links" aria-label="External links">
          <a aria-label="LinkedIn"
            href="https://ca.linkedin.com/in/davidchicas"
            target="_blank"
            rel="noopener noreferrer">
            <i className="fa-brands fa-linkedin" aria-hidden="true"></i>
          </a>
          <a aria-label="GitHub"
            href="https://github.com/dchicasduena"
            target="_blank"
            rel="noopener noreferrer">
            <i className="fa-brands fa-github" aria-hidden="true"></i>
          </a>
          <a aria-label="Resume"
            href="https://davidchicas.me/assets/resume.pdf"
            target="_blank"
            rel="noopener noreferrer">
            <i className="fa-solid fa-file-lines" aria-hidden="true"></i>
          </a>
          <a aria-label="Email" href="mailto:contact@davidchicas.me">
            <i className="fa-solid fa-envelope" aria-hidden="true"></i>
          </a>
        </div>
      </nav>
    </header>

    <section className="introduction" aria-labelledby="page-title">
      <h1 id="page-title">David Chicas</h1>
      <p className="intro-detail">
        {'>'} A software developer in St. John's, Newfoundland. Here are some of my projects, info about me,
        and a way to get in touch.
      </p>
    </section>
  </>
);

export default Home;
