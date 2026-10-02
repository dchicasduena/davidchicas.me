import React from 'react';

const projects = [
  {
    id: 'tfmm',
    name: 'thirty five mm',
    description: 'a portfolio of photographs, mostly shot on 35mm film, and a place to practice building for the web',
    details: 'bootstrap, html, css, github pages, 35mm photography',
    links: [{ label: 'visit the site', href: 'https://dchicasduena.github.io/thirty-five-mm/' }],
  },
  {
    id: 'genrify',
    name: 'genrify',
    description: 'a spotify playlist generator that builds playlists from music genres and sub-genres',
    details: 'spotify api, node.js, mongodb, bootstrap, mvc architecture',
    links: [
      { label: 'open the app', href: 'https://genrify-app.herokuapp.com' },
      { label: 'source code', href: 'https://github.com/dchicasduena/genrify' },
    ],
  },
  {
    id: 'automata',
    name: 'automata',
    description: 'a discord bot built for the memorial university computer science society',
    details: 'discord api, python, docker',
    links: [
        { label: 'source code', href: 'https://github.com/MUNComputerScienceSociety/Automata' }
    ],
  },
  {
    id: 'sandwich',
    name: 'sandwich repository',
    description: 'a small place to collect and revisit recipes',
    details: 'jekyll and github pages',
    links: [
        { label: 'visit the site', href: 'https://dchicasduena.github.io/sandwich-repository/' }]
  },
  {
    id: 'cardbinder',
    name: 'card binder',
    description: 'this has been deprecated as the api is no longer available. arrange a pokémon tcg binder, search cards by name or set, then download an image of the finished page',
    details: 'react, pokémon tcg api',
    links: [
      { label: 'open the app', href: 'https://card-binder.netlify.app/' },
      { label: 'source code', href: 'https://github.com/dchicasduena/card.binder' },
    ],
  },
];

const Projects = () => (
  <section id="projects" className="text-section">
    <h2 className="section-title">projects</h2>
    <div className="project-list">
      {projects.map((project) => (
        <article className="project-entry" id={`project-${project.id}`} key={project.id}>
          <h3 className="project-name">
            <span className="project-number">&gt;</span>{' '}
            {project.name}
          </h3>
          <p>{project.description}</p>
          <p className="project-details"><span className="detail-label">tools:</span>{project.details}</p>
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
