import React from 'react';
import { ButtonLink } from './ui/button';
import { DitherText } from './dithercn/dither-text';

const Home = () => {
  return (
    <>
      <header className="masthead" id="home">
        <nav className="section-nav" aria-label="Page sections">
          <div className="section-links">
            <ButtonLink className="legacy-link" size="sm" href="#about">ABOUT</ButtonLink>
            <ButtonLink className="legacy-link" size="sm" href="#projects">PROJECTS</ButtonLink>
            <ButtonLink className="legacy-link" size="sm" href="#contact">CONTACT</ButtonLink>
          </div>

          <div className="social-links" aria-label="External links">
            <ButtonLink className="legacy-link" size="icon-lg"
              aria-label="LinkedIn"
              href="https://ca.linkedin.com/in/davidchicas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-linkedin" aria-hidden="true"></i>
            </ButtonLink>
            <ButtonLink className="legacy-link" size="icon-lg"
              aria-label="GitHub"
              href="https://github.com/dchicasduena"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-github" aria-hidden="true"></i>
            </ButtonLink>
            <ButtonLink className="legacy-link" size="icon-lg"
              aria-label="Resume"
              href="https://davidchicas.me/assets/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-solid fa-file-lines" aria-hidden="true"></i>
            </ButtonLink>
            <ButtonLink className="legacy-link" size="icon-lg"
              aria-label="Email"
              href="mailto:contact@davidchicas.me"
            >
              <i className="fa-solid fa-envelope" aria-hidden="true"></i>
            </ButtonLink>
          </div>
        </nav>
      </header>

      <section className="introduction" aria-labelledby="page-title">
        <DitherText
          as="h1"
          id="page-title"
          fill="gradient"
          direction="down"
          to={0.7}
          bloom="high"
          speed={1.5}
          cell={3}
          className="introduction-title"
        >
          David Chicas
        </DitherText>
        <p className="intro-detail">
          <span className="project-number">&gt;</span>{' '}Software developer in Newfoundland, Canada. Here are some of my projects, some information about me,
          and a couple ways to get in touch{' '}
        </p>
      </section>
    </>
  );
};

export default Home;
