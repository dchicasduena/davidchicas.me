import React, { useEffect, useRef, useState } from 'react';
import { ButtonLink } from './ui/button';

const ART_PATH = '/assets/ascii-art/david-chicas.txt';
const MOBILE_ART_PATH = '/assets/ascii-art/david-chicas-mobile.txt';
const FALLBACK_ART = 'DAVID CHICAS';
const ASCII_HIGHLIGHT_RADIUS = 6;

const getPrefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const shuffleArtFrames = (frames, previousFrame) => {
  const shuffledFrames = [...frames];

  for (let index = shuffledFrames.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledFrames[index], shuffledFrames[randomIndex]] =
      [shuffledFrames[randomIndex], shuffledFrames[index]];
  }

  if (shuffledFrames.length > 1 && shuffledFrames[0] === previousFrame) {
    const differentFrameIndex = shuffledFrames.findIndex((frame) => frame !== previousFrame);
    [shuffledFrames[0], shuffledFrames[differentFrameIndex]] =
      [shuffledFrames[differentFrameIndex], shuffledFrames[0]];
  }

  return shuffledFrames;
};

const Home = () => {
  const [artFrames, setArtFrames] = useState([FALLBACK_ART]);
  const [mobileArt, setMobileArt] = useState(FALLBACK_ART);
  const [isArtLoaded, setIsArtLoaded] = useState(false);
  const [artIndex, setArtIndex] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState(0);
  const [animationPhase, setAnimationPhase] = useState('typing');
  const [artFontSizes, setArtFontSizes] = useState([8]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion);
  const [isAsciiHighlightActive, setIsAsciiHighlightActive] = useState(false);
  const [asciiPointerCell, setAsciiPointerCell] = useState(null);
  const titleRef = useRef(null);
  const artRef = useRef(null);
  const highlightRef = useRef(null);
  const asciiHighlightActiveRef = useRef(false);
  const asciiPointerCellRef = useRef(null);
  const measureContextRef = useRef(null);
  const pointerFrameRef = useRef(null);
  const pendingPointerRef = useRef(null);

  const updateAsciiHighlight = (active) => {
    if (asciiHighlightActiveRef.current === active) return;
    asciiHighlightActiveRef.current = active;
    setIsAsciiHighlightActive(active);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mediaQuery) return undefined;

    const updatePreference = (event) => {
      setPrefersReducedMotion(event.matches);
      if (event.matches) updateAsciiHighlight(false);
    };
    mediaQuery.addEventListener?.('change', updatePreference);
    return () => mediaQuery.removeEventListener?.('change', updatePreference);
  }, []);

  useEffect(() => () => {
    if (pointerFrameRef.current !== null) {
      window.cancelAnimationFrame(pointerFrameRef.current);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchText = (path) => fetch(path)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load ASCII art');
        return response.text();
      })
      .catch(() => null);

    Promise.all([fetchText(ART_PATH), fetchText(MOBILE_ART_PATH)])
      .then(([contents, mobileContents]) => {
        if (cancelled) return;

        const frames = contents
          ?.split(/\r?\n+[\t ]*%%ART%%[\t ]*\r?\n+/)
          .map((frame) => frame
            .replace(/^\r?\n|\r?\n$/g, '')
            .split(/\r?\n/)
            .map((line) => line.trimEnd())
            .join('\n'))
          .filter(Boolean) || [];

        if (frames.length > 0) {
          setArtFrames(shuffleArtFrames(frames));
          setArtIndex(0);
          setVisibleColumns(0);
          setAnimationPhase('typing');
        }

        if (mobileContents) setMobileArt(mobileContents.replace(/^\r?\n|\r?\n$/g, ''));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsArtLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return undefined;

    const updateSizing = () => {
      const availableWidth = title.clientWidth || 820;
      const titleStyle = window.getComputedStyle(title);
      const topPadding = Number.parseFloat(titleStyle.paddingTop) || 0;
      const availableHeight = (title.clientHeight || 148) - topPadding - 4;
      const frameDimensions = artFrames.map((frame) => {
        const lines = frame.split('\n');
        return {
          lineCount: lines.length,
          widestLine: Math.max(...lines.map((line) => line.length)),
        };
      });
      const largestFrame = frameDimensions.reduce((largest, frame) =>
        frame.lineCount * frame.widestLine > largest.lineCount * largest.widestLine
          ? frame
          : largest
      );
      const largestFrameFontSize = Math.min(
        availableWidth / (largestFrame.widestLine * 0.7),
        availableHeight / (largestFrame.lineCount * 1.08)
      );
      const maxArtWidth = largestFrame.widestLine * largestFrameFontSize * 0.7;
      const maxArtHeight = largestFrame.lineCount * largestFrameFontSize * 1.08;
      const fontSizes = frameDimensions.map(({ lineCount, widestLine }) => Math.min(
        maxArtWidth / (widestLine * 0.7),
        maxArtHeight / (lineCount * 1.08)
      ));

      setArtFontSizes((current) => {
        if (current.length === fontSizes.length &&
          current.every((size, index) => size === fontSizes[index])) return current;

        return fontSizes;
      });
    };

    updateSizing();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateSizing);
      return () => window.removeEventListener('resize', updateSizing);
    }

    const observer = new ResizeObserver(updateSizing);
    observer.observe(title);
    return () => observer.disconnect();
  }, [artFrames]);

  useEffect(() => {
    const frame = artFrames[artIndex] || '';
    const frameWidth = Math.max(...frame.split('\n').map((line) => line.length));
    let timer;

    if (prefersReducedMotion) {
      setVisibleColumns(frameWidth);
      return undefined;
    }

    if (animationPhase === 'typing') {
      if (visibleColumns >= frameWidth) {
        timer = setTimeout(() => setAnimationPhase('holding'), 180);
      } else {
        timer = setTimeout(
          () => setVisibleColumns((count) => Math.min(count + 2, frameWidth)),
          20
        );
      }
    } else if (animationPhase === 'holding') {
      timer = setTimeout(() => setAnimationPhase('deleting'), 25000);
    } else if (visibleColumns === 0) {
      timer = setTimeout(() => {
        if (artIndex === artFrames.length - 1) {
          setArtFrames((frames) => shuffleArtFrames(frames, frames[artIndex]));
          setArtIndex(0);
        } else {
          setArtIndex((index) => index + 1);
        }
        setAnimationPhase('typing');
      }, 250);
    } else {
      timer = setTimeout(
        () => setVisibleColumns((count) => Math.max(count - 3, 0)),
        20
      );
    }

    return () => clearTimeout(timer);
  }, [animationPhase, artFrames, artIndex, prefersReducedMotion, visibleColumns]);

  const frameLines = (artFrames[artIndex] || '').split('\n');
  const visibleArt = frameLines.map((line) => line.slice(0, visibleColumns)).join('\n');

  const handleTitlePointerMove = (event) => {
    if (prefersReducedMotion || event.pointerType === 'touch' || !artRef.current) return;

    const art = artRef.current;
    const bounds = art.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    if (x < 0 || y < 0 || x >= bounds.width || y >= bounds.height) {
      updateAsciiHighlight(false);
      return;
    }

    const styles = window.getComputedStyle(art);
    const fontSize = Number.parseFloat(styles.fontSize);
    const lineHeight = Number.parseFloat(styles.lineHeight) || fontSize * 1.08;
    if (!measureContextRef.current) {
      measureContextRef.current = document.createElement('canvas').getContext('2d');
    }

    const context = measureContextRef.current;
    if (context) context.font = `${styles.fontWeight} ${fontSize}px ${styles.fontFamily}`;
    const characterWidth = context?.measureText('M').width || fontSize * 0.6;

    updateAsciiHighlight(true);
    pendingPointerRef.current = {
      column: Math.floor(x / characterWidth),
      row: Math.floor(y / lineHeight),
    };

    if (pointerFrameRef.current === null) {
      pointerFrameRef.current = window.requestAnimationFrame(() => {
        pointerFrameRef.current = null;
        const pointer = pendingPointerRef.current;
        if (!pointer || !highlightRef.current) return;

        if (
          asciiPointerCellRef.current?.column !== pointer.column ||
          asciiPointerCellRef.current?.row !== pointer.row
        ) {
          asciiPointerCellRef.current = pointer;
          setAsciiPointerCell(pointer);
        }
      });
    }
  };

  const handleTitlePointerLeave = () => {
    updateAsciiHighlight(false);
    asciiPointerCellRef.current = null;
    setAsciiPointerCell(null);
  };

  return (
    <>
      <header className="masthead" id="home">
        <nav className="section-nav" aria-label="Page sections">
          <div className="section-links">
            <ButtonLink className="legacy-link" size="sm" href="#about">ABOUT</ButtonLink>
            <ButtonLink className="legacy-link" size="sm" href="#projects">PROJECTS</ButtonLink>
            <ButtonLink className="legacy-link" size="sm" href="#contact">CONTACT</ButtonLink>
          </div>

          <div className="social-links" aria-label="External links">
            <ButtonLink className="legacy-link" size="icon-lg"
              aria-label="LinkedIn"
              href="https://ca.linkedin.com/in/davidchicas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-linkedin" aria-hidden="true"></i>
            </ButtonLink>
            <ButtonLink className="legacy-link" size="icon-lg"
              aria-label="GitHub"
              href="https://github.com/dchicasduena"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-github" aria-hidden="true"></i>
            </ButtonLink>
            <ButtonLink className="legacy-link" size="icon-lg"
              aria-label="Resume"
              href="https://davidchicas.me/assets/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-solid fa-file-lines" aria-hidden="true"></i>
            </ButtonLink>
            <ButtonLink className="legacy-link" size="icon-lg"
              aria-label="Email"
              href="mailto:contact@davidchicas.me"
            >
              <i className="fa-solid fa-envelope" aria-hidden="true"></i>
            </ButtonLink>
          </div>
        </nav>
      </header>

      <section className="introduction" aria-labelledby="page-title">
        <div
          id="page-title"
          ref={titleRef}
          className="introduction-title"
          role="heading"
          aria-level="1"
          aria-label="David Chicas"
          onPointerMove={handleTitlePointerMove}
          onPointerLeave={handleTitlePointerLeave}
        >
          <pre className="ascii-title" aria-hidden="true">
            <span className="ascii-title-art" style={{ fontSize: `${artFontSizes[artIndex] || 8}px` }}>
              {isArtLoaded ? visibleArt : ''}
            </span>
          </pre>
          <pre
            ref={highlightRef}
            className={`ascii-title ascii-title-highlight${isAsciiHighlightActive ? ' is-active' : ''}`}
            aria-hidden="true"
          >
            <span
              ref={artRef}
              className="ascii-title-art"
              style={{ fontSize: `${artFontSizes[artIndex] || 8}px` }}
            >
              {isArtLoaded
                ? frameLines.map((line, row) => (
                  <React.Fragment key={row}>
                    {Array.from(line.slice(0, visibleColumns), (character, column) => {
                      const distance = asciiPointerCell
                        ? Math.hypot(
                          column - asciiPointerCell.column,
                          row - asciiPointerCell.row
                        )
                        : Infinity;
                      const isHighlighted = character !== ' ' &&
                        distance < ASCII_HIGHLIGHT_RADIUS;

                      return (
                        <span
                          key={column}
                          className={`ascii-highlight-character${isHighlighted ? ' is-highlighted' : ''}`}
                          style={isHighlighted
                            ? { opacity: 0.25 + 0.75 * (1 - distance / ASCII_HIGHLIGHT_RADIUS) }
                            : undefined}
                        >
                          {character}
                        </span>
                      );
                    })}
                    {row < frameLines.length - 1 ? <br /> : null}
                  </React.Fragment>
                ))
                : ''}
            </span>
          </pre>
          <pre className="ascii-title ascii-title-mobile" aria-hidden="true">
            {isArtLoaded ? mobileArt : ''}
          </pre>
        </div>
        <p className="intro-detail">
          <span className="project-number">&gt;</span>{' '}Software developer in Newfoundland, Canada. Here are some of my projects, some information about me,
          and a couple ways to get in touch{' '}
        </p>
      </section>
    </>
  );
};

export default Home;
