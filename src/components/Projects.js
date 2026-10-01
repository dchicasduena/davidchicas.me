import React from 'react';
import { Link } from 'react-router-dom';

const projects = [
  {
    id: 'tfmm',
    name: 'Thirty Five mm',
    path: '/tfmm',
    description: 'A portfolio of photographs, mostly shot on 35mm film, and a place to practice building for the web.',
    details: 'Bootstrap, HTML, CSS, GitHub Pages, 35mm photography',
    links: [{ label: 'VISIT THE SITE', href: 'https://dchicasduena.github.io/thirty-five-mm/' }],
  },
  {
    id: 'genrify',
    name: 'Genrify',
    path: '/genrify',
    description: 'A Spotify playlist generator that builds playlists from music genres and sub-genres.',
    details: 'Spotify API, Node.js, MongoDB, Bootstrap, MVC architecture',
    links: [
      { label: 'OPEN THE APP', href: 'https://genrify-app.herokuapp.com' },
      { label: 'SOURCE CODE', href: 'https://github.com/dchicasduena/genrify' },
    ],
  },
  {
    id: 'automata',
    name: 'Automata',
    description: 'A Discord bot built for the Memorial University Computer Science Society.',
    details: 'Discord API, Python, Docker',
    links: [{ label: 'SOURCE CODE', href: 'https://github.com/MUNComputerScienceSociety/Automata' }],
  },
  {
    id: 'sandwich',
    name: 'Sandwich Repository',
    description: 'A small place to collect and revisit recipes.',
    details: 'Jekyll and GitHub Pages',
    links: [{ label: 'OPEN THE REPOSITORY', href: 'https://dchicasduena.github.io/sandwich-repository/' }],
  },
  {
    id: 'cardbinder',
    name: 'Card Binder',
    path: '/cardBinder',
    description: 'This has been deprecated as the API is no longer available. Arrange a Pokémon TCG binder, search cards by name or set, then download an image of the finished page.',
    details: 'React, Pokémon TCG API',
    links: [
      { label: 'OPEN THE APP', href: 'https://card-binder.netlify.app/' },
      { label: 'SOURCE CODE', href: 'https://github.com/dchicasduena/card.binder' },
    ],
  },
];

const Projects = () => (
  <section id="projects" className="text-section">
    <h2 className="section-title">PROJECTS</h2>
    <div className="project-list">
      {projects.map((project, index) => (
        <article className="project-entry" id={`project-${project.id}`} key={project.id}>
          <h3>
            <span className="project-number">{String(index + 1).padStart(2, '0')}.</span>{' '}
            {project.path ? <Link to={project.path}>{project.name}</Link> : project.name}
          </h3>
          <p>{'>'} {project.description}</p>
          <p className="project-details"><span className="detail-label">TOOLS</span>{project.details}</p>
          {project.links?.length > 0 && (
            <p className="project-links">
              {project.links.map((link) => (
                <a href={link.href} key={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ))}
            </p>
          )}
        </article>
      ))}
    </div>
  </section>
);

export default Projects;
