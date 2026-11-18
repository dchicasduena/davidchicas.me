import React from 'react';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { ButtonLink } from './ui/button';

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
      { label: 'SOURCE CODE', href: 'https://github.com/MUNComputerScienceSociety/Automata' },
    ],
  },
  {
    id: 'sandwich',
    name: 'Sandwich Repository',
    description: 'Small place to collect and revisit recipes',
    details: 'Jekyll and GitHub pages',
    links: [
      { label: 'VISIT THE SITE', href: 'https://dchicasduena.github.io/sandwich-repository/' },
    ],
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
          <Card className="legacy-card">
            <CardHeader className="legacy-card-header">
              <CardTitle as="h3" className="project-name">
                {project.name}
              </CardTitle>
              <CardDescription className="project-description">
                <span className="project-number">&gt;</span>{' '}{project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="legacy-card-content">
              <p className="project-details">
                <Badge variant="ghost" className="legacy-badge detail-label">Tools:</Badge>
                {project.details}
              </p>
            </CardContent>
            {project.links?.length > 0 && (
              <CardFooter className="legacy-card-footer">
                <p className="project-links">
                  {project.links.map((link) => (
                    <ButtonLink
                      size="sm"
                      className="legacy-link"
                      key={`${link.label}:${link.href}`}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </ButtonLink>
                  ))}
                </p>
              </CardFooter>
            )}
          </Card>
        </article>
      ))}
    </div>
  </section>
);

export default Projects;
