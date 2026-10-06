import React from 'react';

const AboutMe = () => {
  return (
    <section id="about" className="text-section">
      <h2 className="section-title">about</h2>
      <p>
        <span className="project-number">&gt;</span>{' '}currently working for <a className="inline-text-link" href="https://www.strongdata.ca/" target="_blank" rel="noopener noreferrer">strong data automation</a>. i am interested
        in frontend and backend development, multimedia programming, and user
        interface design
      </p>
      <p>
        known languages &amp; tools:
        react, node.js, express, html/css, javascript, python, c, c++, git,
        mongodb, sql, pandas, plotly and dotnet architecture
      </p>
    </section>
  );
};

export default AboutMe;
