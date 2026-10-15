import React, { useEffect, useRef, useState } from 'react';

// Commands are registered as name -> (args) => string[]. Add entries here later.
const commands = new Map();

const Prompt = () => (
  <span className="terminal-prompt" aria-hidden="true">
    <span className="terminal-prompt-user">user@davidchicas.me</span>
    {':~$ '}
  </span>
);

const Terminal = ({ onClose }) => {
  const [entries, setEntries] = useState([]);
  const [input, setInput] = useState('');
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const windowRef = useRef(null);
  const dragRef = useRef(null);
  const frameRef = useRef(null);

  const handleDragStart = (event) => {
    if (event.button !== 0 || event.target.closest('button')) return;

    const rect = windowRef.current.getBoundingClientRect();
    dragRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: offset.x,
      originY: offset.y,
      // Window bounds at rest, so the drag can be clamped to the viewport.
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

    // Position is written straight to the DOM once per frame. React state is only updated when the drag ends.
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
    event.currentTarget.releasePointerCapture(event.pointerId);
    setOffset(drag.latest ?? { x: drag.originX, y: drag.originY });
    setIsDragging(false);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [entries]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const [name, ...args] = input.trim().split(/\s+/);
    let entry = { command: input, lines: [], isError: false };

    if (name) {
      const run = commands.get(name);
      if (run) {
        entry = { ...entry, lines: run(args) };
      } else {
        entry = { ...entry, lines: [`${name}: command not found`], isError: true };
      }
    }

    setEntries((previous) => [...previous, entry]);
    setInput('');
  };

  return (
    <div className="terminal-overlay">
      <div
        ref={windowRef}
        className={isDragging ? 'terminal-window is-dragging' : 'terminal-window'}
        role="dialog"
        aria-label="terminal"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        onClick={() => inputRef.current?.focus()}
      >
        <div
          className="terminal-header"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          <span aria-hidden="true" />
          <span className="terminal-title">user@davidchicas.me: ~</span>
          <button type="button" className="terminal-close" onClick={onClose} aria-label="close terminal">
            &times;
          </button>
        </div>

        <div className="terminal-body">
          <div className="terminal-log" ref={logRef} role="log" aria-live="polite">
            {entries.map((entry, index) => (
              <div className="terminal-entry" key={index}>
                <p className="terminal-line">
                  <Prompt />
                  {entry.command}
                </p>
                {entry.lines.map((line, lineIndex) => (
                  <p
                    className={entry.isError ? 'terminal-line terminal-error' : 'terminal-line'}
                    key={lineIndex}
                  >
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <form className="terminal-input-line" onSubmit={handleSubmit}>
            <Prompt />
            <input
              ref={inputRef}
              className="terminal-input"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              aria-label="terminal input"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
