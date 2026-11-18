import React, { useEffect, useRef, useState } from 'react';

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
  const [artIndex, setArtIndex] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState(0);
  const [animationPhase, setAnimationPhase] = useState('typing');
  const [artFontSizes, setArtFontSizes] = useState([8]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion);
  const [isAsciiHighlightActive, setIsAsciiHighlightActive] = useState(false);
  const titleRef = useRef(null);
  const artRef = useRef(null);
  const asciiHighlightActiveRef = useRef(false);
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
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return undefined;

    const updateSizing = () => {
      const availableWidth = title.clientWidth || 820;
      const availableHeight = (title.clientHeight || 140) - 4;
      const fontSizes = artFrames.map((frame) => {
        const lines = frame.split('\n');
        const widestLine = Math.max(...lines.map((line) => line.length));
        const widthFit = availableWidth / (widestLine * 0.7);
        const heightFit = availableHeight / (lines.length * 1.08);
        const fitSize = Math.min(8, widthFit, heightFit);
        return window.innerWidth > 540 && fitSize >= 10
          ? Math.max(fitSize, 10)
          : fitSize;
      });

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
    if (!measureContextRef.current) {
      measureContextRef.current = document.createElement('canvas').getContext('2d');
    }

    const context = measureContextRef.current;
    if (context) context.font = `${styles.fontWeight} ${fontSize}px ${styles.fontFamily}`;
    const characterWidth = context?.measureText('M').width || fontSize * 0.6;
    const computedLineHeight = Number.parseFloat(styles.lineHeight);
    const lineHeight = Number.isFinite(computedLineHeight)
      ? styles.lineHeight.endsWith('px')
        ? computedLineHeight
        : fontSize * computedLineHeight
      : fontSize * 1.08;

    updateAsciiHighlight(true);
    pendingPointerRef.current = {
      x,
      y,
      radiusX: characterWidth * ASCII_HIGHLIGHT_RADIUS,
      radiusY: lineHeight * ASCII_HIGHLIGHT_RADIUS,
    };

    if (pointerFrameRef.current === null) {
      pointerFrameRef.current = window.requestAnimationFrame(() => {
        pointerFrameRef.current = null;
        const pointer = pendingPointerRef.current;
        if (!pointer || !artRef.current) return;

        artRef.current.style.setProperty('--ascii-pointer-x', `${pointer.x}px`);
        artRef.current.style.setProperty('--ascii-pointer-y', `${pointer.y}px`);
        artRef.current.style.setProperty('--ascii-radius-x', `${pointer.radiusX}px`);
        artRef.current.style.setProperty('--ascii-radius-y', `${pointer.radiusY}px`);
      });
    }
  };

  const handleTitlePointerLeave = () => updateAsciiHighlight(false);

  return (
    <>
      <header className="masthead" id="home">
        <nav className="section-nav" aria-label="Page sections">
          <div className="section-links">
            <a href="#about">ABOUT</a>
            <a href="#projects">PROJECTS</a>
            <a href="#contact">CONTACT</a>
          </div>

          <div className="social-links" aria-label="External links">
            <a aria-label="LinkedIn"
              href="https://ca.linkedin.com/in/davidchicas"
              target="_blank"
              rel="noopener noreferrer">
              <i className="fa-brands fa-linkedin" aria-hidden="true"></i>
            </a>
            <a aria-label="GitHub"
              href="https://github.com/dchicasduena"
              target="_blank"
              rel="noopener noreferrer">
              <i className="fa-brands fa-github" aria-hidden="true"></i>
            </a>
            <a aria-label="Resume"
              href="https://davidchicas.me/assets/resume.pdf"
              target="_blank"
              rel="noopener noreferrer">
              <i className="fa-solid fa-file-lines" aria-hidden="true"></i>
            </a>
            <a aria-label="Email" href="mailto:contact@davidchicas.me">
              <i className="fa-solid fa-envelope" aria-hidden="true"></i>
            </a>
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
            <span className="ascii-title-art" style={{ fontSize: `${artFontSizes[artIndex] || 8}px` }}>{visibleArt}</span>
          </pre>
          <pre className={`ascii-title ascii-title-highlight${isAsciiHighlightActive ? ' is-active' : ''}`} aria-hidden="true">
            <span
              ref={artRef}
              className="ascii-title-art"
              style={{ fontSize: `${artFontSizes[artIndex] || 8}px` }}
            >
              {visibleArt}
            </span>
          </pre>
          <pre className="ascii-title ascii-title-mobile" aria-hidden="true">
            {mobileArt}
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
