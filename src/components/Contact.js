import React from 'react';

const Contact = () => {
  return (
    <section id="contact" className="text-section">
      <h2 className="section-title">CONTACT</h2>
      <p>Ways to get in touch:</p>
      <ul className="contact-list">
        <li><span className="detail-label">DISCORD:</span>dech89</li>
        <li>
          <span className="detail-label">GITHUB:</span>
          <a href="https://github.com/dchicasduena" target="_blank" rel="noopener noreferrer">dchicasduena</a>
        </li>
        <li>
          <span className="detail-label">EMAIL:</span>
          <a href="mailto:contact@davidchicas.me">contact@davidchicas.me</a>
        </li>
      </ul>
    </section>
  );
};

export default Contact;
