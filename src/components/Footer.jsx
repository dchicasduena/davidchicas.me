import React, { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Terminal from './Terminal';

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
        <a href="#" ref={triggerRef} onClick={openTerminal} aria-haspopup="dialog">open terminal</a>
      </p>
      {isTerminalOpen && createPortal(<Terminal onClose={closeTerminal} />, document.body)}
      <a className="footer-icon" aria-label="Repository information" href="https://github.com/dchicasduena/davidchicas.me" target="_blank" rel="noopener noreferrer">
        <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
      </a>
    </footer>
  );
};

export default Footer;
