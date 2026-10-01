import React from 'react';

const Contact = () => {
  return (
    <section id="contact" className="text-section">
      <h2 className="section-title">Contact</h2>
      <p>Ways to get in touch:</p>
      <ul className="contact-list">
        <li><span className="detail-label">Discord:</span>dech89</li>
        <li>
          <span className="detail-label">GitHub:</span>
          <a href="https://github.com/dchicasduena" target="_blank" rel="noopener noreferrer">dchicasduena</a>
        </li>
        <li>
          <span className="detail-label">Email:</span>
          <a href="mailto:contact@davidchicas.me">contact@davidchicas.me</a>
        </li>
      </ul>
    </section>
  );
};

export default Contact;
