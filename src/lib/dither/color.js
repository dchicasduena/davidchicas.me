"use client";;
import { useEffect, useState } from "react";

import { cssColor } from "@/lib/dither/tokens";

const DEFAULT_CELL = 3;

let probe = null;

const getProbe = () => {
  if (!probe) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    probe = canvas.getContext("2d", { willReadFrequently: true });
  }
  return probe;
};

/**
 * Resolve a colour to sRGB. CSS variables resolve in the context of `el`
 * (the document root by default), so scoped overrides apply. Any format
 * the browser understands works, including oklch, because the colour is
 * painted into a 1x1 canvas and read back.
 */
export const resolveColor = (value, el) => {
  const host = el ?? document.documentElement;
  const span = document.createElement("span");
  span.style.color = cssColor(value);
  span.style.display = "none";
  host.append(span);
  const { color } = getComputedStyle(span);
  span.remove();

  const context = getProbe();
  if (!context) {
    return [0, 0, 0, 1];
  }
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = context.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255, a / 255];
};

/** The dither cell size in CSS pixels, read from `--dither-cell` on `el`. */
export const readDitherCell = el => {
  const host = el ?? document.documentElement;
  const value = Number.parseFloat(
    getComputedStyle(host).getPropertyValue("--dither-cell")
  );
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_CELL;
};

const themeListeners = new Set();
let themeObserver = null;

/**
 * Call `listener` whenever the class or style of `<html>` changes, which is
 * how next-themes and most theme switchers swap palettes. One observer is
 * shared by every subscriber. Returns the unsubscribe function.
 */
export const subscribeToTheme = listener => {
  themeListeners.add(listener);
  if (!themeObserver) {
    themeObserver = new MutationObserver(() => {
      for (const notify of themeListeners) {
        notify();
      }
    });
    themeObserver.observe(document.documentElement, {
      attributeFilter: ["class", "style", "data-theme"],
      attributes: true,
    });
  }
  return () => {
    themeListeners.delete(listener);
    if (themeListeners.size === 0) {
      themeObserver?.disconnect();
      themeObserver = null;
    }
  };
};

const DEFAULT_NAMES = ["--dither-ink", "--dither-paper"];

export function useDitherColors(el, names = DEFAULT_NAMES) {
  const [colors, setColors] = useState(null);
  const key = names.join("|");

  useEffect(() => {
    const list = key === "" ? [] : key.split("|");
    const read = () =>
      setColors(list.map((name) => resolveColor(name, el?.current)));
    read();
    return subscribeToTheme(read);
  }, [el, key]);

  return colors;
}
