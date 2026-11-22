import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

const AboutMe = () => {
  return (
    <section id="about" className="text-section">
      <h2 className="section-title">ABOUT</h2>
      <Card className="legacy-card">
        <CardContent className="legacy-card-content">
          <p className="legacy-paragraph">
            <span className="project-number">&gt;</span>{' '}Currently working for <a className="inline-text-link" href="https://www.strongdata.ca/" target="_blank" rel="noopener noreferrer">Strong Data Automation</a>. I am interested
            in frontend and backend development, multimedia programming, and user
            interface design
          </p>
          <p className="legacy-paragraph">
            <Badge variant="ghost" className="legacy-badge">Known languages &amp; tools:</Badge>{' '}
            React, Node.js, Express, HTML/CSS, JavaScript, Python, C, C++, Git,
            MongoDB, SQL, Pandas, Plotly and .NET architecture
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default AboutMe;
