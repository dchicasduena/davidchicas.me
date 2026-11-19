import React, { useEffect, useRef, useState } from 'react';
import { DitherOrb } from './dithercn/dither-orb';
import { runAssistantCommand } from './assistantCommands';
import { Button, ButtonLink } from './ui/button';

const ROOT = '/home/user';

const displayPath = (path) => path === ROOT
  ? '~'
  : `~/${path.slice(`${ROOT}/`.length)}`;

const Footer = () => {
  const [entries, setEntries] = useState([]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState(ROOT);
  const logRef = useRef(null);
  const entryId = useRef(0);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [entries]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const command = input.trim();
    if (!command) return;

    const result = runAssistantCommand(command, { cwd });
    if (result.cwd) setCwd(result.cwd);
    if (result.openUrl) window.open(result.openUrl, '_blank', 'noopener,noreferrer');

    const lines = result.lines.length > 0
      ? result.lines
      : result.cwd
        ? [`Now exploring ${displayPath(result.cwd)}.`]
        : [];
    setEntries((current) => [
      ...current,
      {
        id: entryId.current++,
        command,
        lines,
        isError: result.isError === true,
        openUrl: result.openUrl,
      },
    ]);
    setInput('');
  };

  return (
    <footer className="footer" role="contentinfo">
      <section className="assistant-surface" aria-label="Portfolio assistant">
        <DitherOrb
          color="--purple"
          background="transparent"
          highlight="color-mix(in oklch, var(--purple) 30%, #fff)"
          size={0.34}
          morph={1.25}
          cell={3}
          lean={1.5}
          animate
          className="assistant-orb absolute inset-x-0 top-0 bottom-[45%] -z-10"
        />
        <form className="assistant-composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="assistant-command">Enter a portfolio command</label>
          <input
            id="assistant-command"
            className="assistant-input"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Enter a command..."
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <Button
            type="submit"
            variant="ghost"
            className="assistant-submit"
            aria-label="Send command"
          >
            <span aria-hidden="true">↵</span>
          </Button>
        </form>

        <div className="assistant-log" role="log" aria-live="polite" ref={logRef}>
          {entries.length === 0 ? (
            <p className="assistant-hint">
              I can help you explore my portfolio. Try <code>help</code>, <code>projects</code>,{' '}
              <code>contact</code>, or <code>resume</code>.
            </p>
          ) : entries.map((entry) => (
            <div className="assistant-entry" key={entry.id}>
              <p className="assistant-query">
                <span aria-hidden="true">&gt; </span>
                {entry.command}
              </p>
              <div className={entry.isError ? 'assistant-response is-error' : 'assistant-response'}>
                {entry.lines.map((line, index) => <p key={index}>{line}</p>)}
                {entry.openUrl ? (
                  <p>
                    <a href={entry.openUrl} target="_blank" rel="noopener noreferrer">
                      Open my resume
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

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
