import { getThresholdMap } from "@/lib/dither/matrices";
import { ditherMask } from "@/lib/dither/pattern";
import { cssColor } from "@/lib/dither/tokens";

/**
 * The style kit: fill variants, bloom and the default series palette.
 * Everything here is pure and server-safe. The SVG pieces that use it
 * (`FillPattern`, `BloomGroup`, `Bloom`) live in `pattern.tsx`.
 */

/**
 * How a shape is filled.
 * `gradient`: dense at the leading edge, thinning through dither levels.
 * `dotted`: a sparse staggered lattice of single cells.
 * `hatched`: diagonal lines one cell wide.
 * `solid`: flat colour.
 */
export const FILL_VARIANTS = ["gradient", "dotted", "hatched", "solid"];

/** A soft glow in the fill's colour behind it. */
export const BLOOMS = ["off", "low", "high"];

/**
 * Series colours in order: distinct hues, so two or more series never
 * rely on texture alone.
 */
export const SERIES_COLORS = ["ink", "orange", "green", "pink", "purple", "blue", "red", "grey"];

/** The colour of series `index`: its own, or the next palette colour. */
export const seriesColor = (color, index) =>
  color ?? SERIES_COLORS[index % SERIES_COLORS.length] ?? "ink";

/** Write one SVG path covering the inked cells of a grid, in cell units. */
const cellsPath = (
  width,
  height,
  inked
) => {
  let path = "";
  for (let y = 0; y < height; y += 1) {
    let start = -1;
    for (let x = 0; x <= width; x += 1) {
      const on = x < width && inked(x, y);
      if (on && start === -1) {
        start = x;
      } else if (!on && start !== -1) {
        path += `M${start} ${y}h${x - start}v1h${start - x}z`;
        start = -1;
      }
    }
  }
  return path;
};

// Dots on a staggered lattice: every other cell, rows offset by one.
const DOTTED = {
  path: cellsPath(4, 4, (x, y) => y % 2 === 0 && (x + y / 2) % 2 === 0),
  size: 4,
};

// Rising diagonals, one cell wide, four cells apart.
const HATCHED = {
  path: cellsPath(4, 4, (x, y) => (x + y) % 4 === 3),
  size: 4,
};

/** The repeating tile of a textured variant. */
export const fillTile = variant => variant === "dotted" ? DOTTED : HATCHED;

const rampCache = new Map();

/**
 * A dithered ramp: coverage falls linearly from `from` at `edge` to `to`
 * over `length` cells, then holds. The tile is one matrix wide across the
 * ramp, and its length is rounded up to whole matrices so it lines up with
 * a plain dither of the same matrix.
 */
export const ditherRamp = (
  {
    edge,
    length,
    extent = length,
    from,
    to,
    matrix = "bayer4"
  }
) => {
  const key = `${edge}:${length}:${extent}:${from}:${to}:${matrix}`;
  const cached = rampCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const { size, thresholds } = getThresholdMap(matrix);
  const fade = Math.max(1, Math.round(length));
  const along = Math.ceil(Math.max(fade, extent) / size) * size;
  const vertical = edge === "top" || edge === "bottom";
  const width = vertical ? size : along;
  const height = vertical ? along : size;
  const levelAt = (index) => {
    const step = edge === "top" || edge === "left" ? index : along - 1 - index;
    return step >= fade ? to : from + (to - from) * ((step + 0.5) / fade);
  };
  const tile = {
    height,
    path: cellsPath(
      width,
      height,
      (x, y) =>
        levelAt(vertical ? y : x) >
        (thresholds[(y % size) * size + (x % size)] ?? 1)
    ),
    width,
  };
  rampCache.set(key, tile);
  return tile;
};

const svgUrl = (width, height, path) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges"><path d="${path}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const EDGE_POSITION = {
  bottom: "left bottom",
  left: "left top",
  right: "right top",
  top: "left top"
};

const times = (cell, count) =>
  typeof cell === "number" ? `${cell * count}px` : `calc(${cell} * ${count})`;

/**
 * Inline styles that paint an element with a fill variant: a background
 * colour and, for every variant but `solid`, a tiled CSS mask. The element
 * needs a size; children are masked too, so put content in a sibling.
 *
 * ```tsx
 * <div className="absolute inset-0" style={fillStyle("gradient", { color: "green", edge: "left" })} />
 * ```
 */
export const fillStyle = (
  variant,
  {
    color = "ink",
    cell = "var(--dither-cell)",
    edge = "bottom",
    length = 24,
    from = 1,
    to = 0.0625,
    matrix = "bayer4"
  } = {}
) => {
  const backgroundColor = cssColor(color);
  if (variant === "solid") {
    return { backgroundColor };
  }
  if (variant === "dotted" || variant === "hatched") {
    const { size, path } = fillTile(variant);
    const image = svgUrl(size, size, path);
    const tile = times(cell, size);
    return {
      WebkitMaskImage: image,
      WebkitMaskSize: tile,
      backgroundColor,
      maskImage: image,
      maskSize: tile,
    };
  }
  // A ramp along the edge, unioned with the plain floor level. Bayer sets
  // nest, so the union is exact where both are anchored to the same edge.
  const ramp = ditherRamp({ edge, from, length, matrix, to });
  const { size } = getThresholdMap(matrix);
  const image = `${svgUrl(ramp.width, ramp.height, ramp.path)}, ${ditherMask(to, { matrix })}`;
  const size2 = `${times(cell, ramp.width)} ${times(cell, ramp.height)}, ${times(cell, size)}`;
  const repeat = `${edge === "top" || edge === "bottom" ? "repeat-x" : "repeat-y"}, repeat`;
  const position = `${EDGE_POSITION[edge]}, ${EDGE_POSITION[edge]}`;
  return {
    WebkitMaskImage: image,
    WebkitMaskPosition: position,
    WebkitMaskRepeat: repeat,
    WebkitMaskSize: size2,
    backgroundColor,
    maskImage: image,
    maskPosition: position,
    maskRepeat: repeat,
    maskSize: size2,
  };
};

/** Blur radius and strength of each bloom level. */
export const BLOOM_LEVELS = {
  high: { blur: 18, strength: 0.55 },
  low: { blur: 10, strength: 0.3 }
};

/**
 * Styles for a bloom layer: a blurred, translucent copy of a fill drawn
 * behind it. `--dither-bloom` scales the strength per theme (1 in dark,
 * lower in light, where glows turn muddy). `undefined` when off.
 */
export const bloomLayerStyle = bloom => {
  if (bloom === "off") {
    return undefined;
  }
  const { blur, strength } = BLOOM_LEVELS[bloom];
  return {
    filter: `blur(${blur}px)`,
    opacity: `calc(var(--dither-bloom, 1) * ${strength})`,
  };
};

/**
 * A CSS `filter` that glows around an element in `color`, for DOM pieces
 * (buttons, bars) where a copy of the fill is not handy. `undefined` when off.
 */
export const bloomFilter = (color, bloom) => {
  if (bloom === "off") {
    return undefined;
  }
  const { blur, strength } = BLOOM_LEVELS[bloom];
  const tint = (share) =>
    `color-mix(in oklab, ${cssColor(color)} calc(var(--dither-bloom, 1) * ${Math.round(share * 100)}%), transparent)`;
  return `drop-shadow(0 0 ${Math.round(blur / 3)}px ${tint(strength * 1.4)}) drop-shadow(0 0 ${blur}px ${tint(strength)})`;
};

/** `{ filter }` for `bloomFilter`, ready to spread into `style`. */
export const bloomStyle = (color, bloom) => {
  const filter = bloomFilter(color, bloom);
  return filter === undefined ? {} : { filter };
};
