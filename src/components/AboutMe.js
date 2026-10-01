import React from 'react';

const AboutMe = () => {
  return (
    <section id="about" className="text-section">
      <h2 className="section-title">About</h2>
      <p>
        {'>'} Currently working for Strong Data Automation. I am interested
        in frontend and backend development, multimedia programming, and user
        interface design.
      </p>
      <p className="detail-line">
        <span className="detail-label">Known Languages &amp; Tools</span>
        React, Node.js, Express, HTML/CSS, JavaScript, Python, C, C++, Git,
        MongoDB, SQL, Pandas, Plotly.
      </p>
    </section>
  );
};

export default AboutMe;
