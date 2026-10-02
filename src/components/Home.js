import React, { useEffect, useRef, useState } from 'react';

const ART_PATH = `${process.env.PUBLIC_URL}/assets/ascii-art/david-chicas.txt`;
const MOBILE_ART_PATH = `${process.env.PUBLIC_URL}/assets/ascii-art/david-chicas-mobile.txt`;
const FALLBACK_ART = 'DAVID CHICAS';

const Home = () => {
  const [artFrames, setArtFrames] = useState([FALLBACK_ART]);
  const [mobileArt, setMobileArt] = useState(FALLBACK_ART);
  const [artIndex, setArtIndex] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState(0);
  const [animationPhase, setAnimationPhase] = useState('typing');
  const [artFontSizes, setArtFontSizes] = useState([8]);
  const titleRef = useRef(null);

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
          setArtFrames(frames);
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
        return Math.min(8, widthFit, heightFit);
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
        setArtIndex((index) => (index + 1) % artFrames.length);
        setAnimationPhase('typing');
      }, 250);
    } else {
      timer = setTimeout(
        () => setVisibleColumns((count) => Math.max(count - 3, 0)),
        20
      );
    }

    return () => clearTimeout(timer);
  }, [animationPhase, artFrames, artIndex, visibleColumns]);

  const frameLines = (artFrames[artIndex] || '').split('\n');
  const visibleArt = frameLines.map((line) => line.slice(0, visibleColumns)).join('\n');

  return (
    <>
      <header className="masthead" id="home">
        <nav className="section-nav" aria-label="Page sections">
          <div className="section-links">
            <a href="#about">about</a>
            <a href="#projects">projects</a>
            <a href="#contact">contact</a>
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
        >
          <pre className="ascii-title" aria-hidden="true">
            <span style={{ fontSize: `${artFontSizes[artIndex] || 8}px` }}>{visibleArt}</span>
          </pre>
          <pre className="ascii-title ascii-title-mobile" aria-hidden="true">
            {mobileArt}
          </pre>
        </div>
        <p className="intro-detail">
          <span className="project-number">&gt;</span>{' '}software developer in newfoundland, canada. here are some of my projects, some information about me,
          and a couple ways to get in touch{' '}
        </p>
      </section>
    </>
  );
};

export default Home;
