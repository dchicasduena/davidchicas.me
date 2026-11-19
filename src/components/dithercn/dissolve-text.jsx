"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  cssColor,
  ditherMask,
  fillTile,
  getThresholdMap,
  MOTION,
  useInView,
  usePrefersReducedMotion,
} from "@/lib/dither";
import { cn } from "@/lib/utils";

export const DISSOLVE_FILLS = ["solid", "gradient", "dotted", "hatched"];
export const DISSOLVE_ORDERS = ["start", "end", "center", "edges", "random"];

const STEPS = {
  bayer2: 4,
  bayer4: 16,
  bayer8: 16,
};

const percent = (value) => `${(value * 100).toFixed(2)}%`;

const svgUrl = (size, path) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><path d="${path}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const sheetName = ({ matrix, fill, last }) =>
  `${matrix}-${fill}${fill === "gradient" ? `-${last}` : ""}`;

const maskAt = ({ matrix, fill, last }, step) => {
  const steps = STEPS[matrix];
  if (fill === "dotted" || fill === "hatched") {
    const { size, path } = fillTile(fill);
    const texture = svgUrl(size, path);
    return step >= steps
      ? texture
      : `${ditherMask(step / steps, { matrix })},${texture}`;
  }
  if (fill === "solid" && step >= steps) {
    return "none";
  }
  return ditherMask(Math.min(step, last) / steps, { matrix });
};

const sheets = new Map();

const keyframesFor = (sheet) => {
  const name = sheetName(sheet);
  const cached = sheets.get(name);
  if (cached !== undefined) {
    return cached;
  }
  const steps = STEPS[sheet.matrix];
  const indices = Array.from({ length: steps + 1 }, (_, index) => index);
  const frame = (offset, step) =>
    `${percent(offset)}{-webkit-mask-image:${maskAt(sheet, step)};mask-image:${maskAt(sheet, step)}}`;
  const offset = (step) => 1 - Math.sqrt(1 - step / steps);
  const enter = indices.map((step) => frame(offset(step), step));
  const exit = indices.map((step) => frame(offset(step), steps - step));
  const css = `@keyframes dcn-dissolve-in-${name}{${enter.join("")}}@keyframes dcn-dissolve-out-${name}{${exit.join("")}}`;
  sheets.set(name, css);
  return css;
};

const BASE_CSS = `
@keyframes dcn-dissolve-tint{from{color:var(--dissolve-accent)}}
.dcn-dissolve [data-dissolve-unit]{
  -webkit-mask-repeat:repeat;mask-repeat:repeat;
  -webkit-mask-size:var(--dissolve-tile);mask-size:var(--dissolve-tile);
  -webkit-mask-composite:source-in;mask-composite:intersect;
  animation-duration:var(--dissolve-duration),calc(var(--dissolve-duration) * 2);
  animation-delay:calc(var(--i, 0) * var(--dissolve-stagger) + var(--dissolve-delay));
  animation-fill-mode:both;
  animation-timing-function:step-end,${MOTION.ease};
}
.dcn-dissolve:is([data-state=in],[data-state=waiting]) [data-dissolve-unit]{animation-name:var(--dissolve-in),var(--dissolve-tint)}
.dcn-dissolve[data-state=waiting] [data-dissolve-unit]{animation-play-state:paused}
.dcn-dissolve[data-state=out] [data-dissolve-unit]{animation-name:var(--dissolve-out),none}
@media (prefers-reduced-motion:reduce){
  .dcn-dissolve [data-dissolve-unit]{animation:none}
  .dcn-dissolve[data-state=out]{opacity:0}
}`;

const NOSCRIPT_CSS =
  ".dcn-dissolve[data-state=waiting] [data-dissolve-unit]{animation:none}";

const unitStyle = (rank) => ({ "--i": rank });

const jitter = (index) => {
  const value = Math.sin(index * 78.233 + 12.9898) * 43_758.5453;
  return value - Math.floor(value);
};

const ranks = (count, order) => {
  const middle = (count - 1) / 2;
  const indices = Array.from({ length: count }, (_, index) => index);
  switch (order) {
    case "start":
      return indices;
    case "end":
      return indices.map((index) => count - 1 - index);
    case "center":
      return indices.map((index) => Math.abs(index - middle));
    case "edges":
      return indices.map((index) => middle - Math.abs(index - middle));
    case "random": {
      const shuffled = indices.toSorted((a, b) => jitter(a) - jitter(b));
      const rank = Array.from({ length: count }, () => 0);
      for (const [place, index] of shuffled.entries()) {
        rank[index] = place;
      }
      return rank;
    }
    default:
      return indices;
  }
};

const rootVars = ({
  sheet,
  by,
  accent,
  color,
  cell,
  delay,
  duration,
  speed,
  stagger,
}) => {
  const name = sheetName(sheet);
  const pace = Math.max(0.05, speed);
  const { size } = getThresholdMap(sheet.matrix);
  const cellSize = cell === undefined ? "var(--dither-cell)" : `${cell}px`;
  return {
    "--dissolve-delay": `${delay / pace}ms`,
    "--dissolve-duration": `${duration / pace}ms`,
    "--dissolve-in": `dcn-dissolve-in-${name}`,
    "--dissolve-out": `dcn-dissolve-out-${name}`,
    "--dissolve-stagger": `${(stagger ?? (by === "word" ? 90 : 28)) / pace}ms`,
    "--dissolve-tile": `calc(${cellSize} * ${size})`,
    "--dissolve-tint": accent === "none" ? "none" : "dcn-dissolve-tint",
    ...(accent === "none" ? {} : { "--dissolve-accent": cssColor(accent) }),
    ...(color === undefined ? {} : { color: cssColor(color) }),
  };
};

const splitText = (text, by) => {
  let index = 0;
  return text.split(/(\s+)/u).map((part) => {
    if (part.trim() === "") {
      return { space: part, units: [] };
    }
    const pieces = by === "char" ? [...part] : [part];
    const units = pieces.map((piece) => {
      const unit = { index, text: piece };
      index += 1;
      return unit;
    });
    return { space: "", units };
  });
};

export const DissolveText = ({
  as: Tag = "span",
  children,
  by = "char",
  direction = "start",
  trigger = "in-view",
  show = true,
  color,
  accent = "none",
  fill = "solid",
  level = 0.625,
  duration = MOTION.slow,
  stagger,
  delay = 0,
  speed = 1,
  matrix = "bayer4",
  cell,
  className,
  style,
  ...rest
}) => {
  const ref = useRef(null);
  const setRef = useCallback((node) => {
    ref.current = node;
  }, []);
  const inView = useInView(ref, { rootMargin: "0px 0px -8% 0px" });
  const reducedMotion = usePrefersReducedMotion();
  const [seen, setSeen] = useState(trigger === "mount");

  useEffect(() => {
    if (inView) {
      setSeen(true);
    }
  }, [inView]);

  let state = "in";
  if (!show) {
    state = "out";
  } else if (!(seen || reducedMotion)) {
    state = "waiting";
  }

  const sheet = {
    fill,
    last: Math.max(1, Math.min(STEPS[matrix], Math.round(level * STEPS[matrix]))),
    matrix,
  };
  const rootStyle = {
    ...rootVars({
      accent,
      by,
      cell,
      color,
      delay,
      duration,
      sheet,
      speed,
      stagger,
    }),
    ...style,
  };
  const words = by === "line" ? [] : splitText(children, by);
  const count = words.reduce((total, word) => total + word.units.length, 0);
  const order = ranks(count, direction);

  return (
    <Tag
      {...rest}
      ref={setRef}
      data-state={state}
      aria-hidden={show ? rest["aria-hidden"] : true}
      className={cn("dcn-dissolve", className)}
      style={rootStyle}
    >
      <style href="dcn-dissolve" precedence="default">
        {BASE_CSS}
      </style>
      <style href={`dcn-dissolve-${sheetName(sheet)}`} precedence="default">
        {keyframesFor(sheet)}
      </style>
      <noscript>
        <style>{NOSCRIPT_CSS}</style>
      </noscript>
      {by === "line" ? (
        <span data-dissolve-unit="">{children}</span>
      ) : (
        words.map(({ space, units }, wordIndex) =>
          space === "" ? (
            <span key={wordIndex} className="whitespace-nowrap">
              {units.map((unit) => (
                <span
                  key={unit.index}
                  data-dissolve-unit=""
                  style={unitStyle(order[unit.index] ?? unit.index)}
                >
                  {unit.text}
                </span>
              ))}
            </span>
          ) : (
            space
          )
        )
      )}
    </Tag>
  );
};
