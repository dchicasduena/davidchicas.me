import React from 'react';

const projects = [
  {
    id: 'tfmm',
    name: 'Thirty Five mm',
    description: 'Portfolio of photographs, mostly shot on 35mm film, and a place to practice building for the web',
    details: 'Bootstrap, HTML, CSS, GitHub pages, 35mm photography',
    links: [{ label: 'VISIT THE SITE', href: 'https://dchicasduena.github.io/thirty-five-mm/' }],
  },
  {
    id: 'genrify',
    name: 'Genrify',
    description: 'Spotify playlist generator that builds playlists from music genres and sub-genres',
    details: 'Spotify API, Node.js, MongoDB, Bootstrap, MVC architecture',
    links: [
      { label: 'OPEN THE APP', href: 'https://genrify-app.herokuapp.com' },
      { label: 'SOURCE CODE', href: 'https://github.com/dchicasduena/genrify' },
    ],
  },
  {
    id: 'automata',
    name: 'Automata',
    description: 'Discord bot built for the Memorial University Computer Science Society',
    details: 'Discord API, Python, Docker',
    links: [
        { label: 'SOURCE CODE', href: 'https://github.com/MUNComputerScienceSociety/Automata' }
    ],
  },
  {
    id: 'sandwich',
    name: 'Sandwich Repository',
    description: 'Small place to collect and revisit recipes',
    details: 'Jekyll and GitHub pages',
    links: [
        { label: 'VISIT THE SITE', href: 'https://dchicasduena.github.io/sandwich-repository/' }]
  },
  {
    id: 'cardbinder',
    name: 'Card Binder',
    description: 'This has been deprecated as the API is no longer available. Arrange a Pokémon TCG binder, search cards by name or set, then download an image of the finished page',
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
      {projects.map((project) => (
        <article className="project-entry" id={`project-${project.id}`} key={project.id}>
          <p className="project-name">
            <span className="project-number"></span>{' '}
            {project.name}
          </p>
          <p><span className="project-number">&gt;</span>{' '}{project.description}</p>
          <p className="project-details"><span className="detail-label">Tools:</span>{project.details}</p>
          {project.links?.length > 0 && (
            <p className="project-links">
              {project.links.map((link) => (
                <a href={link.href} key={`${link.label}:${link.href}`} target="_blank" rel="noopener noreferrer">
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
