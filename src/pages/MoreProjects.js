import React, { useState } from 'react';

import tfmmImage from '../assets/img/tfmm.jpg';
import genrifyImage from '../assets/img/genrify.jpg';
import automataImage from '../assets/img/automata.jpeg';
import dclogoImage from '../assets/img/dclogo.jpg';
import sandwichImage from '../assets/img/sandwich-repo.jpg';
import cardbinderImage from '../assets/img/cardbinder.jpg';

const MoreProjects = () => {
    const [filter, setFilter] = useState('*');

  const projects = [
    {
      href: '/tfmm',
      title: 'thirty five mm',
      description: 'pictures I have taken',
      imgSrc: tfmmImage,
      altText: 'Thirty Five MM',
      category: 'web',
    },
    {
      href: '/genrify',
      title: 'genrify',
      description: 'random playlist generator',
      imgSrc: genrifyImage,
      altText: 'Genrify',
      category: 'web',
    },
    {
      href: 'https://github.com/MUNComputerScienceSociety/Automata',
      title: 'automata',
      description: 'discord bot for MUNCSS',
      imgSrc: automataImage, 
      altText: 'Automata',
      target: '_blank',
      rel: 'noopener noreferrer',
      target: '_blank',
     rel: 'noopener noreferrer',
     category: 'development',
    },
    {
      href: '/dclogo',
      title: 'website logo',
      description: 'designed and animated',
      imgSrc: dclogoImage,
      altText: 'Website Logo',
      category: 'design',
    },
    {
      href: 'https://dchicasduena.github.io/sandwich-repository/',
      title: 'sandwich repository',
      description: 'place to store recipes',
      imgSrc: sandwichImage,
      altText: 'Sandwich Repository',
      target: '_blank',
      rel: 'noopener noreferrer',
      category: 'misc',
    },      
    {
      href: '/cardbinder',
      title: 'card binder',
      description: 'plan your pokémon TCG binder',
      imgSrc: cardbinderImage, 
      altText: 'Card Binder',
      category: 'web',
    },
  ];

  const filteredProjects = filter === '*' ? projects : projects.filter(project => project.category === filter);

  return (
    <section id="projects" className="section site-portfolio">
      <div className="container">
        <div className="row mb-5 align-items-center">
          <div className="col-md-12 col-lg-6 mb-4 mb-lg-0 aos-init aos-animate" data-aos="fade-up">
            <h2>
              <b>projects</b>
            </h2>
          </div>
          <div className="col-md-12 col-lg-6 text-start text-lg-end aos-init aos-animate" data-aos="fade-up" data-aos-delay="100">
            <div id="filters" className="filters">
              <a href="#" onClick={(e) => {e.preventDefault(); setFilter('*')}} className={filter === '*' ? 'active' : ''}>
                all
              </a>
              <a href="#" onClick={(e) => {e.preventDefault();setFilter('web')}} className={filter === 'web' ? 'active' : ''}>
                web
              </a>
              <a href="#" onClick={(e) => {e.preventDefault();setFilter('design')}} className={filter === 'design' ? 'active' : ''}>
                design
              </a>
              <a href="#" onClick={(e) => {e.preventDefault();setFilter('development')}} className={filter === 'development' ? 'active' : ''}>
                development
              </a>
              <a href="#" onClick={(e) => {e.preventDefault();setFilter('misc')}} className={filter === 'misc' ? 'active' : ''}>
                misc
              </a>
            </div>
          </div>
        </div>
  
        <div id="portfolio-grid" className="row no-gutter aos-init aos-animate" data-aos="fade-up" data-aos-delay="200" >
          {/* Render Projects Based on Filter */}
          {filteredProjects.map((project, index) => {
            if (filter === '*' || project.category === filter) {
              return (
                <div
                  key={index}
                  className={`item ${project.category} col-sm-6 col-md-4 col-lg-4 mb-4`}
                >
                  <a href={project.href} rel={project.rel} target={project.target} className="item-wrap fancybox">
                    <div className="work-info">
                      <h3><mark><b>{project.title}</b></mark></h3>
                      <span><mark>{project.description}</mark></span>
                    </div>
                    <img className="img-fluid" src={project.imgSrc} alt={project.altText} />
                  </a>
                </div>
              );
            }
            return null; 
          })}
        </div>
      
      </div>
    </section>
  );
};

export default MoreProjects;