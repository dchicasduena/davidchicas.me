import React, { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Terminal from './Terminal';
import { Button, ButtonLink } from './ui/button';

const Footer = () => {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const triggerRef = useRef(null);

  const openTerminal = (event) => {
    event.preventDefault();
    setIsTerminalOpen(true);
  };

  const closeTerminal = useCallback(() => {
    setIsTerminalOpen(false);
    triggerRef.current?.focus();
  }, []);

  return (
    <footer className="footer" role="contentinfo">
      <p className="project-links">
        <ButtonLink
          className="legacy-link"
          href="#"
          ref={triggerRef}
          aria-haspopup="dialog"
          onClick={openTerminal}
        >
          OPEN TERMINAL
        </ButtonLink>
      </p>
      {isTerminalOpen && createPortal(<Terminal onClose={closeTerminal} />, document.body)}
      <ButtonLink
        className="footer-icon legacy-link"
        size="icon"
        aria-label="Repository information"
        href="https://github.com/dchicasduena/davidchicas.me"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
      </ButtonLink>
    </footer>
  );
};

export default Footer;
