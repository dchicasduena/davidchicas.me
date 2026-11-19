import { getThresholdMap } from "@/lib/dither/matrices";
import { ditherPath } from "@/lib/dither/pattern";
import { cssColor } from "@/lib/dither/tokens";

// The largest canvas side every current browser accepts.
const MAX_CANVAS_SIDE = 16_384;

const createCanvas = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const toImageData = (image) =>
  new ImageData(new Uint8ClampedArray(image.data), image.width, image.height);

const pixelsToCanvas = (image) => {
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("dither-export: no 2D canvas context");
  }
  context.putImageData(toImageData(image), 0, 0);
  return canvas;
};

/**
 * Encode a canvas or pixels as a PNG. With `scale` above 1 every pixel
 * becomes a crisp `scale × scale` block (no smoothing).
 */
export const toPNG = async (
  source,
  {
    scale = 1
  } = {}
) => {
  const { width, height } = source;
  const largest = Math.max(width, height, 1);
  const factor = Math.max(
    1,
    Math.min(Math.round(scale), Math.floor(MAX_CANVAS_SIDE / largest))
  );
  const canvas = new OffscreenCanvas(width * factor, height * factor);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("dither-export: no 2D canvas context");
  }
  context.imageSmoothingEnabled = false;
  const base =
    source instanceof HTMLCanvasElement ? source : pixelsToCanvas(source);
  context.drawImage(base, 0, 0, canvas.width, canvas.height);
  return await canvas.convertToBlob({ type: "image/png" });
};

const hex = (value) =>
  Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, "0");

const formatOpacity = (opacity) =>
  String(Math.round(opacity * 1000) / 1000);

/**
 * Reduce either input to one colour index per cell plus the colour list.
 * Pixels with the same RGBA share an index; fully transparent ones get -1.
 */
const toCells = (source, palette) => {
  const count = source.width * source.height;
  const cells = new Int32Array(count);

  if ("indices" in source) {
    const swatches = (palette ?? []).map((color) => ({
      fill: cssColor(color),
      opacity: 1,
    }));
    for (let index = 0; index < count; index += 1) {
      const value = source.indices[index] ?? -1;
      cells[index] = value >= 0 && value < swatches.length ? value : -1;
    }
    return { cells, swatches };
  }

  const lookup = new Map();
  const swatches = [];
  const { data } = source;
  for (let index = 0; index < count; index += 1) {
    const offset = index * 4;
    const alpha = data[offset + 3] ?? 0;
    if (alpha === 0) {
      cells[index] = -1;
      continue;
    }
    const fill = `#${hex(data[offset] ?? 0)}${hex(data[offset + 1] ?? 0)}${hex(data[offset + 2] ?? 0)}`;
    const key = `${fill}/${alpha}`;
    let swatch = lookup.get(key);
    if (swatch === undefined) {
      swatch = swatches.length;
      lookup.set(key, swatch);
      swatches.push({ fill, opacity: alpha / 255 });
    }
    cells[index] = swatch;
  }
  return { cells, swatches };
};

/** The most used opaque colour, which becomes one background rectangle. */
const mostUsed = (cells, swatches) => {
  const counts = new Uint32Array(swatches.length);
  for (const cell of cells) {
    if (cell >= 0) {
      counts[cell] = (counts[cell] ?? 0) + 1;
    }
  }
  let best = -1;
  let bestCount = 0;
  for (let index = 0; index < counts.length; index += 1) {
    const value = counts[index] ?? 0;
    if (value > bestCount && swatches[index]?.opacity === 1) {
      best = index;
      bestCount = value;
    }
  }
  return best;
};

/** Joins two path numbers; a minus sign separates them on its own. */
const pair = (a, b) => (b < 0 ? `${a}${b}` : `${a} ${b}`);

/**
 * Path data for one colour. Rectangles taller than one cell are filled;
 * one-cell-tall runs, by far the most common in a dither, are drawn as
 * strokes one cell wide along the row's centre line. A stroke run costs
 * `m2 0h3` with relative moves, about a third of a closed rectangle.
 */
class SwatchPath {
  fill = "";
  stroke = "";
  penX = 0;
  penY = 0;

  add(run) {
    if (run.height > 1) {
      this.fill += `M${pair(run.x, run.y)}h${run.width}v${run.height}h${-run.width}z`;
      return;
    }
    const y = run.y + 0.5;
    this.stroke +=
      this.stroke === ""
        ? `M${pair(run.x, y)}h${run.width}`
        : `m${pair(run.x - this.penX, y - this.penY)}h${run.width}`;
    this.penX = run.x + run.width;
    this.penY = y;
  }
}

/**
 * Merge cells into runs of one colour along each row; identical runs on
 * the rows below grow downwards into rectangles. Runs close in reading
 * order, so the relative moves between strokes stay short.
 */
const mergeRuns = ({
  cells,
  height,
  skip,
  swatchCount,
  width
}) => {
  const paths = Array.from({ length: swatchCount }, () => new SwatchPath());
  const close = (runs) => {
    const ordered = [...runs].toSorted((a, b) => a.y - b.y || a.x - b.x);
    for (const run of ordered) {
      paths[run.swatch]?.add(run);
    }
  };

  let open = new Map();
  for (let y = 0; y < height; y += 1) {
    const next = new Map();
    let x = 0;
    while (x < width) {
      const swatch = cells[y * width + x] ?? -1;
      let end = x + 1;
      while (end < width && cells[y * width + end] === swatch) {
        end += 1;
      }
      if (swatch >= 0 && swatch !== skip) {
        const key = `${x}:${end - x}:${swatch}`;
        const above = open.get(key);
        if (above) {
          above.height += 1;
          open.delete(key);
          next.set(key, above);
        } else {
          next.set(key, { height: 1, swatch, width: end - x, x, y });
        }
      }
      x = end;
    }
    close(open.values());
    open = next;
  }
  close(open.values());
  return paths;
};

/**
 * Turn a dither into an SVG document. Coordinates are in cells (the
 * `viewBox`), so the file scales cleanly. Neighbouring cells of one colour
 * merge: one-cell-tall runs become short relative strokes and taller
 * blocks become rectangles, two `<path>`s per colour at most. A 400 × 225
 * ordered dither of a gradient comes to about 150 KB before gzip, and
 * flat artwork to a few kilobytes.
 */
export const toSVG = (
  source,
  {
    cell = 1,
    palette,
    background = true
  } = {}
) => {
  const { width, height } = source;
  const { cells, swatches } = toCells(source, palette);
  const fill = background ? mostUsed(cells, swatches) : -1;
  const paths = mergeRuns({
    cells,
    height,
    skip: fill,
    swatchCount: swatches.length,
    width,
  });

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width * cell}" height="${height * cell}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">`,
  ];
  const backdrop = swatches[fill];
  if (backdrop) {
    parts.push(
      `<rect width="${width}" height="${height}" fill="${backdrop.fill}"/>`
    );
  }
  for (let index = 0; index < swatches.length; index += 1) {
    const swatch = swatches[index];
    const path = paths[index];
    if (!swatch || !path) {
      continue;
    }
    const opacity = swatch.opacity < 1 ? formatOpacity(swatch.opacity) : null;
    if (path.fill) {
      const fillOpacity = opacity ? ` fill-opacity="${opacity}"` : "";
      parts.push(
        `<path fill="${swatch.fill}"${fillOpacity} d="${path.fill}"/>`
      );
    }
    if (path.stroke) {
      const strokeOpacity = opacity ? ` stroke-opacity="${opacity}"` : "";
      parts.push(
        `<path fill="none" stroke="${swatch.fill}"${strokeOpacity} d="${path.stroke}"/>`
      );
    }
  }
  parts.push("</svg>");
  return parts.join("");
};

/** A CSS `url()` holding an SVG, escaped just enough to stay readable. */
export const svgDataUrl = (svg) =>
  `url("data:image/svg+xml,${svg
    .replaceAll("%", "%25")
    .replaceAll('"', "'")
    .replaceAll("#", "%23")
    .replaceAll("<", "%3C")
    .replaceAll(">", "%3E")}")`;

const rule = (selector, declarations) =>
  `${selector} {\n${declarations.map((line) => `  ${line};`).join("\n")}\n}\n`;

/**
 * A CSS rule that draws a dither with no JavaScript. The default `tile`
 * kind repeats one matrix tile at `level` coverage, as a background or a
 * mask. The `image` kind embeds a whole dither as a PNG or SVG background
 * that covers the element.
 */
export const toCSS = options => {
  const selector = options.selector ?? ".dither";
  switch (options.kind) {
    case "image": {
      const { image, format = "png" } = options;
      const url =
        format === "svg"
          ? svgDataUrl(toSVG(image))
          : `url("${pixelsToCanvas(image).toDataURL("image/png")}")`;
      return rule(selector, [
        `aspect-ratio: ${image.width} / ${image.height}`,
        `background: ${url} center / cover no-repeat`,
        "image-rendering: pixelated",
      ]);
    }
    case undefined:
    case "tile": {
      const {
        matrix = "bayer4",
        level,
        cell = 3,
        ink = "#3b82f6",
        paper = "transparent",
        mode = "background",
      } = options;
      const { size } = getThresholdMap(matrix);
      const tile = size * cell;
      const clamped = Math.min(1, Math.max(0, level));
      const fill = mode === "mask" ? "#000" : cssColor(ink);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><path fill="${fill}" d="${ditherPath(clamped, matrix)}"/></svg>`;
      const url = svgDataUrl(svg);
      if (mode === "mask") {
        return rule(selector, [
          `background-color: ${cssColor(ink)}`,
          `-webkit-mask: ${url} 0 0 / ${tile}px ${tile}px repeat`,
          `mask: ${url} 0 0 / ${tile}px ${tile}px repeat`,
        ]);
      }
      return rule(selector, [
        `background-color: ${cssColor(paper)}`,
        `background-image: ${url}`,
        `background-size: ${tile}px ${tile}px`,
      ]);
    }
    default: {
      const exhaustive = options;
      return exhaustive;
    }
  }
};

/**
 * Save a Blob or a string as a file through the browser's download flow.
 * Strings are saved with `type` (default `text/plain`).
 */
export const download = ({
  data,
  filename,
  type = "text/plain"
}) => {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: `${type};charset=utf-8` })
      : data;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  // Revoking straight away can cancel the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
