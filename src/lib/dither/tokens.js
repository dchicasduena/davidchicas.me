/**
 * The named colours of the dithercn palette. `ink` is the theme's own
 * `--dither-ink`; the others are `--dither-color-<name>` from the
 * `dither-tokens` stylesheet, tuned separately for light and dark.
 */
export const DITHER_COLOR_NAMES = ["ink", "blue", "purple", "green", "pink", "orange", "red", "grey"];

/**
 * Used when a named colour's variable is missing, as in a stylesheet from
 * before the palette existed. Mid lightness, so it reads on black and white.
 */
const FALLBACKS = {
  blue: "oklch(0.64 0.16 245)",
  green: "oklch(0.68 0.16 152)",
  grey: "oklch(0.6 0 0)",
  ink: "oklch(0.6 0.2 270)",
  orange: "oklch(0.72 0.16 58)",
  pink: "oklch(0.66 0.19 352)",
  purple: "oklch(0.62 0.2 302)",
  red: "oklch(0.62 0.21 26)"
};

/** The CSS variable behind each named colour. */
export const DITHER_COLORS = {
  blue: "--dither-color-blue",
  green: "--dither-color-green",
  grey: "--dither-color-grey",
  ink: "--dither-ink",
  orange: "--dither-color-orange",
  pink: "--dither-color-pink",
  purple: "--dither-color-purple",
  red: "--dither-color-red"
};

/** Paper to ink, from the `dither-tokens` CSS variables. */
export const DEFAULT_PALETTE = ["--dither-paper", "--dither-ink"];

const isColorName = value => Object.hasOwn(DITHER_COLORS, value);

/**
 * A CSS colour for any `DitherColor`: `"green"` becomes
 * `"var(--dither-color-green, <fallback>)"`, `"--chart-1"` becomes `"var(--chart-1)"`,
 * and anything else passes through.
 */
export const cssColor = value => {
  if (isColorName(value)) {
    return `var(${DITHER_COLORS[value]}, ${FALLBACKS[value]})`;
  }
  return value.startsWith("--") ? `var(${value})` : value;
};

/**
 * Motion tokens shared by every component: one ease-out curve and three
 * durations in milliseconds. `ease` matches the site's `--ease-out`.
 */
export const MOTION = {
  base: 240,
  ease: "cubic-bezier(0.23, 1, 0.32, 1)",
  fast: 150,
  slow: 600
};
