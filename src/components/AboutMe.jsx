import React from 'react';

const AboutMe = () => {
  return (
    <section id="about" className="text-section">
      <h2 className="section-title">ABOUT</h2>
      <p>
        <span className="project-number">&gt;</span>{' '}Currently working for <a className="inline-text-link" href="https://www.strongdata.ca/" target="_blank" rel="noopener noreferrer">Strong Data Automation</a>. I am interested
        in frontend and backend development, multimedia programming, and user
        interface design
      </p>
      <p>
        Known languages &amp; tools:
        React, Node.js, Express, HTML/CSS, JavaScript, Python, C, C++, Git,
        MongoDB, SQL, Pandas, Plotly and .NET architecture
      </p>
    </section>
  );
};

export default AboutMe;
