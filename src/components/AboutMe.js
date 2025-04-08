import React from 'react';

const AboutMe = () => {
  return (
    <section id="about" className="section">
      <div className="container">
        <h2><b>about me</b></h2>
        <h3 id='desc' className="mb-0">
          I am a <span className="descspan" style={{ color: '#7386D5' }}>software developer </span> 
          located in St. John's, Newfoundland. I have experience using: React, Node.js, Express, HTML/CSS, JavaScript, Python, C, C++, Git, MongoDB, SQL, Pandas, and Plotly.
          I am interested in web development, both frontend and backend, as well as multimedia programming and user interface design.
        </h3>
      </div>
    </section>
  );
};

export default AboutMe;
