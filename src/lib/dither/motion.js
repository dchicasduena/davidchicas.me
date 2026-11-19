"use client";;
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const subscribeToReducedMotion = (onChange) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** Whether the visitor asked for reduced motion. `false` on the server. */
export const usePrefersReducedMotion = () => useSyncExternalStore(
  subscribeToReducedMotion,
  () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
  () => false
);

const subscribeToVisibility = (onChange) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

/** Whether the tab is visible. `true` on the server. */
export const useDocumentVisible = () => useSyncExternalStore(
  subscribeToVisibility,
  () => document.visibilityState === "visible",
  () => true
);

/**
 * Whether the element is on screen, or within `rootMargin` of it.
 * `false` until the first observation.
 */
export const useInView = (
  ref,
  {
    rootMargin = "120px"
  } = {}
) => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
};

const NO_TARGET = { current: null };

// One long frame (a tab switch, a debugger) must not jump the motion.
const MAX_DELTA = 0.1;

/**
 * A requestAnimationFrame loop that runs only when it can be seen. It
 * pauses offscreen and in hidden tabs, and under reduced motion (or
 * `enabled: false`) it calls `callback` once with `stillTime` instead.
 * Returns the loop state, which changes rarely, never per frame.
 */
export const useFrameLoop = (
  callback,
  {
    target,
    enabled = true,
    fps = 30,
    stillTime = 0
  } = {}
) => {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  const reducedMotion = usePrefersReducedMotion();
  const visible = useDocumentVisible();
  const inView = useInView(target ?? NO_TARGET);
  const onScreen = target ? inView : true;

  const isStatic = reducedMotion || !enabled;
  const isRunning = !isStatic && visible && onScreen;
  const timeRef = useRef(0);

  useEffect(() => {
    if (isStatic) {
      callbackRef.current(stillTime, 0);
      return;
    }
    if (!isRunning) {
      return;
    }
    const interval = 1000 / Math.max(1, fps);
    let frame = 0;
    let lastTick = performance.now();
    let lastDraw = -Infinity;
    const tick = (now) => {
      frame = requestAnimationFrame(tick);
      const delta = Math.min((now - lastTick) / 1000, MAX_DELTA);
      lastTick = now;
      timeRef.current += delta;
      // A small tolerance so 60Hz screens hit 30fps evenly.
      if (now - lastDraw >= interval - 2) {
        const sinceDraw = Math.min((now - lastDraw) / 1000, MAX_DELTA);
        lastDraw = now;
        callbackRef.current(timeRef.current, sinceDraw);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isStatic, isRunning, fps, stillTime]);

  if (isStatic) {
    return "static";
  }
  return isRunning ? "running" : "paused";
};
