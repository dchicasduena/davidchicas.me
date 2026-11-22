import React, { useEffect, useRef, useState } from 'react';

const HIGHLIGHT_RADIUS = 6;

const getPrefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const NotFoundArt = ({ art }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion);
  const [pointerCell, setPointerCell] = useState(null);
  const [cellAspectRatio, setCellAspectRatio] = useState(1);
  const [isHighlightActive, setIsHighlightActive] = useState(false);
  const artRef = useRef(null);
  const pointerCellRef = useRef(null);
  const measureContextRef = useRef(null);
  const pointerFrameRef = useRef(null);
  const pendingPointerRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mediaQuery) return undefined;

    const updatePreference = (event) => {
      setPrefersReducedMotion(event.matches);
      if (event.matches) setIsHighlightActive(false);
    };
    mediaQuery.addEventListener?.('change', updatePreference);
    return () => mediaQuery.removeEventListener?.('change', updatePreference);
  }, []);

  useEffect(() => () => {
    if (pointerFrameRef.current !== null) {
      window.cancelAnimationFrame(pointerFrameRef.current);
    }
  }, []);

  const handlePointerMove = (event) => {
    if (prefersReducedMotion || event.pointerType === 'touch' || !artRef.current) return;

    const bounds = artRef.current.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    if (x < 0 || y < 0 || x >= bounds.width || y >= bounds.height) {
      setIsHighlightActive(false);
      return;
    }

    const styles = window.getComputedStyle(artRef.current);
    const fontSize = Number.parseFloat(styles.fontSize);
    const lineHeight = Number.parseFloat(styles.lineHeight) || fontSize * 1.2;
    if (!measureContextRef.current) {
      measureContextRef.current = document.createElement('canvas').getContext('2d');
    }

    const context = measureContextRef.current;
    if (context) context.font = `${styles.fontWeight} ${fontSize}px ${styles.fontFamily}`;
    const characterWidth = context?.measureText('M').width || fontSize * 0.6;
    const aspectRatio = lineHeight / characterWidth;

    setCellAspectRatio((current) => (
      Math.abs(current - aspectRatio) < 0.001 ? current : aspectRatio
    ));

    setIsHighlightActive(true);
    pendingPointerRef.current = {
      column: Math.floor(x / characterWidth),
      row: Math.floor(y / lineHeight),
    };

    if (pointerFrameRef.current === null) {
      pointerFrameRef.current = window.requestAnimationFrame(() => {
        pointerFrameRef.current = null;
        const nextCell = pendingPointerRef.current;
        if (!nextCell) return;

        if (
          pointerCellRef.current?.column !== nextCell.column ||
          pointerCellRef.current?.row !== nextCell.row
        ) {
          pointerCellRef.current = nextCell;
          setPointerCell(nextCell);
        }
      });
    }
  };

  const handlePointerLeave = () => {
    setIsHighlightActive(false);
    pointerCellRef.current = null;
    pendingPointerRef.current = null;
    setPointerCell(null);
  };

  const lines = art.split('\n');

  return (
    <div
      className="not-found-art-wrap"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <pre className="not-found-art" aria-hidden="true">{art}</pre>
      <pre
        ref={artRef}
        className={`not-found-art not-found-art-highlight${isHighlightActive ? ' is-active' : ''}`}
        aria-hidden="true"
      >
        {lines.map((line, row) => (
          <React.Fragment key={row}>
            {Array.from(line, (character, column) => {
              const distance = pointerCell
                ? Math.hypot(
                  column - pointerCell.column,
                  (row - pointerCell.row) * cellAspectRatio
                )
                : Infinity;
              const isHighlighted = character !== ' ' && distance < HIGHLIGHT_RADIUS;

              return (
                <span
                  key={column}
                  className={`ascii-highlight-character${isHighlighted ? ' is-highlighted' : ''}`}
                  style={isHighlighted
                    ? { opacity: 0.25 + 0.75 * (1 - distance / HIGHLIGHT_RADIUS) }
                    : undefined}
                >
                  {character}
                </span>
              );
            })}
            {row < lines.length - 1 ? <br /> : null}
          </React.Fragment>
        ))}
      </pre>
    </div>
  );
};

export default NotFoundArt;
