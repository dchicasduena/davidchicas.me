import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { runCommand } from './terminalCommands';

const ROOT = '/home/user';

const Prompt = ({ cwd = ROOT }) => {
  const path = cwd === ROOT ? '~' : `~/${cwd.slice(`${ROOT}/`.length)}`;

  return (
  <span className="terminal-prompt" aria-hidden="true">
    <span className="terminal-prompt-user">terminal@davidchicas.me</span>
    {':'}
    <span className="terminal-prompt-home">{path}</span>
    {'$ '}
  </span>
  );
};

const renderLine = (line) => {
  if (!Array.isArray(line)) return line;
  return line.map((segment, index) => {
    if (typeof segment === 'string') return segment;
    const className = segment.highlight ? 'terminal-today' : segment.accent ? 'terminal-accent' : 'terminal-label';
    return (
      <span className={className} key={index}>
        {segment.text}
      </span>
    );
  });
};

const LINE_DELAY_MS = 400;
const FREEZE_MS = 4000;

const Terminal = ({ onClose }) => {
  const [entries, setEntries] = useState([]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState(ROOT);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [poweredOff, setPoweredOff] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const inputRef = useRef(null);
  const mirrorRef = useRef(null);
  const logRef = useRef(null);
  const windowRef = useRef(null);
  const dragRef = useRef(null);
  const frameRef = useRef(null);
  const entryIds = useRef(0);
  const history = useRef([]);
  const historyIndex = useRef(null);

  const handleDragStart = (event) => {
    if (event.button !== 0 || event.target.closest('button')) return;

    const rect = windowRef.current.getBoundingClientRect();
    dragRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: offset.x,
      originY: offset.y,
      left: rect.left - offset.x,
      top: rect.top - offset.y,
      width: rect.width,
      height: rect.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handleDragMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = event.clientX - drag.pointerX;
    const dy = event.clientY - drag.pointerY;
    const minX = -drag.left;
    const maxX = window.innerWidth - drag.width - drag.left;
    const minY = -drag.top;
    const maxY = window.innerHeight - drag.height - drag.top;

    drag.latest = {
      x: Math.min(Math.max(drag.originX + dx, minX), maxX),
      y: Math.min(Math.max(drag.originY + dy, minY), maxY),
    };
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const { latest } = dragRef.current ?? {};
        if (latest && windowRef.current) {
          windowRef.current.style.transform = `translate(${latest.x}px, ${latest.y}px)`;
        }
      });
    }
  };

  const handleDragEnd = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setOffset(drag.latest ?? { x: drag.originX, y: drag.originY });
    setIsDragging(false);
  };

  const timers = useRef([]);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);

  useEffect(() => {
    const bodyOverflow = document.body.style.overflow;
    const documentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = documentOverflow;
    };
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [entries, input]);

  useLayoutEffect(() => {
    if (inputRef.current && mirrorRef.current) {
      mirrorRef.current.style.transform = `translateX(${-inputRef.current.scrollLeft}px)`;
    }
  }, [input]);

  const executeCommand = (command) => {
    if (!command.trim()) {
      setInput('');
      return;
    }

    history.current.push(command);
    const commandCwd = cwd;
    const result = runCommand(command, { cwd, history: history.current });
    historyIndex.current = null;

    if (result.openUrl) {
      window.open(result.openUrl, '_blank', 'noopener');
    }
    if (result.cwd) setCwd(result.cwd);
    if (result.powerOff) {
      timers.current.push(setTimeout(() => setPoweredOff(true), 1500));
    }
    if (result.clear) {
      setEntries([]);
    } else {
      const id = entryIds.current++;
      const lines = result.lines ?? [];
      setEntries((previous) => [
        ...previous,
        {
          id,
          command,
          cwd: commandCwd,
          lines,
          isError: result.isError === true,
          shown: result.crash ? 0 : lines.length,
        },
      ]);

      if (result.crash) {
        lines.forEach((_, index) => {
          timers.current.push(
            setTimeout(() => {
              setEntries((previous) =>
                previous.map((entry) => (entry.id === id ? { ...entry, shown: index + 1 } : entry))
              );
            }, (index + 1) * LINE_DELAY_MS)
          );
        });
        const freezeAt = (lines.length + 1) * LINE_DELAY_MS;
        timers.current.push(setTimeout(() => setFrozen(true), freezeAt));
        timers.current.push(
          setTimeout(() => {
            setFrozen(false);
            setEntries([]);
            inputRef.current?.focus();
          }, freezeAt + FREEZE_MS)
        );
      }
    }
    setInput('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    executeCommand(input);
  };

  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      setEntries([]);
      setInput('');
      return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      setInput('');
      return;
    }

    const past = history.current;
    if (event.key === 'ArrowUp' && past.length > 0) {
      event.preventDefault();
      const next = historyIndex.current === null ? past.length - 1 : Math.max(0, historyIndex.current - 1);
      historyIndex.current = next;
      setInput(past[next]);
    } else if (event.key === 'ArrowDown' && historyIndex.current !== null) {
      event.preventDefault();
      if (historyIndex.current < past.length - 1) {
        historyIndex.current += 1;
        setInput(past[historyIndex.current]);
      } else {
        historyIndex.current = null;
        setInput('');
      }
    }
  };

  const handleDialogKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = windowRef.current?.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (poweredOff) {
    return (
      <div className="crt-power-off" aria-hidden="true">
        <div className="crt-power-off-picture" />
      </div>
    );
  }

  return (
    <>
    <div className="terminal-overlay">
      <div
        ref={windowRef}
        className={isDragging ? 'terminal-window is-dragging' : 'terminal-window'}
        role="dialog"
        aria-label="David Chicas interactive terminal"
        aria-modal="true"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        onClick={() => inputRef.current?.focus()}
        onKeyDown={handleDialogKeyDown}
      >
        <div
          className="terminal-header"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          <span aria-hidden="true" />
          <span className="terminal-title">terminal@davidchicas.me: ~</span>
          <button type="button" className="terminal-close" onClick={onClose} aria-label="close terminal">
            &times;
          </button>
        </div>

        <div className="terminal-body" ref={logRef}>
          <div className="terminal-log" role="log" aria-live="polite">
            <section className="terminal-welcome" aria-label="Terminal welcome">
              <p>explore a little more about me, my projects, and how to get in touch, this terminal also will run certain commands you type</p>
              <div className="terminal-welcome-gap" aria-hidden="true" />
              <p className="terminal-welcome-hint">
                type <code>help</code>, <code>ls</code>, or <code>cat about.txt</code> to get started;
                use <code>cd projects</code> to explore a directory
              </p>          
              <div className="terminal-welcome-gap" aria-hidden="true" />
              <p className="terminal-mobile-note">
                for the best experience, use this terminal on a desktop browser
              </p>
            </section>
            {entries.map((entry) => (
              <div className="terminal-entry" key={entry.id}>
                <p className="terminal-line">
                  <Prompt cwd={entry.cwd} />
                  <span className="terminal-command">{entry.command}</span>
                </p>
                {entry.lines.slice(0, entry.shown).map((line, lineIndex) => (
                  <p
                    className={entry.isError ? 'terminal-line terminal-error' : 'terminal-line'}
                    key={lineIndex}
                  >
                    {renderLine(line)}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <form className="terminal-input-line" onSubmit={handleSubmit}>
            <Prompt cwd={cwd} />
            <div className="terminal-input-field">
              <span className="terminal-input-text" ref={mirrorRef} aria-hidden="true">
                {input}
                <span className="terminal-input-cursor">_</span>
              </span>
              <input
                ref={inputRef}
                className="terminal-input"
                type="text"
                value={input}
                disabled={frozen}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="terminal input"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
    {frozen && <div className="terminal-freeze" aria-hidden="true" />}
    </>
  );
};

export default Terminal;
