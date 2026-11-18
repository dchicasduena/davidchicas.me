import React from 'react';
import { Badge } from './ui/badge';
import { ButtonLink } from './ui/button';
import { Card, CardContent } from './ui/card';

const Contact = () => {
  return (
    <section id="contact" className="text-section">
      <h2 className="section-title">CONTACT</h2>
      <Card className="legacy-card">
        <CardContent className="legacy-card-content">
          <p className="legacy-paragraph">Ways to get in touch:</p>
          <ul className="contact-list">
            <li>
              <Badge variant="ghost" className="legacy-badge">- Discord:</Badge>
              <span>dech89</span>
            </li>
            <li>
              <Badge variant="ghost" className="legacy-badge">- GitHub:</Badge>
              <ButtonLink
                size="sm"
                className="legacy-link"
                href="https://github.com/dchicasduena"
                target="_blank"
                rel="noopener noreferrer"
              >
                dchicasduena
              </ButtonLink>
            </li>
            <li>
              <Badge variant="ghost" className="legacy-badge">- Email:</Badge>
              <ButtonLink size="sm" className="legacy-link" href="mailto:contact@davidchicas.me">
                contact@davidchicas.me
              </ButtonLink>
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
};

export default Contact;
