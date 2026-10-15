import React from 'react';

const Contact = () => {
  return (
    <section id="contact" className="text-section">
      <h2 className="section-title">contact</h2>
      <p>ways to get in touch:</p>
      <ul className="contact-list">
        <li>
          <span>- discord:</span>
          <span>dech89</span>
        </li>
        <li>
          <span>- github:</span>
          <a href="https://github.com/dchicasduena" target="_blank" rel="noopener noreferrer">dchicasduena</a>
        </li>
        <li>
          <span>- email:</span>
          <a href="mailto:contact@davidchicas.me">contact@davidchicas.me</a>
        </li>
      </ul>
    </section>
  );
};

export default Contact;
