import { getThresholdMap } from "@/lib/dither/matrices";

export const DITHER_METHODS = [
  "bayer4",
  "bayer8",
  "blue-noise",
  "floyd-steinberg",
  "atkinson",
  "sierra-lite"
];

const BLACK_AND_WHITE = [
  [0, 0, 0],
  [1, 1, 1],
];

const KERNELS = {
  atkinson: [
    [1, 0, 1 / 8],
    [2, 0, 1 / 8],
    [-1, 1, 1 / 8],
    [0, 1, 1 / 8],
    [1, 1, 1 / 8],
    [0, 2, 1 / 8],
  ],

  "floyd-steinberg": [
    [1, 0, 7 / 16],
    [-1, 1, 3 / 16],
    [0, 1, 5 / 16],
    [1, 1, 1 / 16],
  ],

  "sierra-lite": [
    [1, 0, 2 / 4],
    [-1, 1, 1 / 4],
    [0, 1, 1 / 4],
  ]
};

const nearest = (palette, r, g, b) => {
  let best = 0;
  let bestDistance = Infinity;
  for (let index = 0; index < palette.length; index += 1) {
    const color = palette[index];
    if (!color) {
      continue;
    }
    const dr = r - color[0];
    const dg = g - color[1];
    const db = b - color[2];
    // Weighted towards green, as the eye is.
    const distance = 0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  return best;
};

const write = (
  out,
  offset,
  color,
  alpha
) => {
  out[offset] = color[0] * 255;
  out[offset + 1] = color[1] * 255;
  out[offset + 2] = color[2] * 255;
  out[offset + 3] = alpha;
};

const ditherOrdered = (image, method, palette, bias) => {
  const { data, width, height } = image;
  const out = new Uint8ClampedArray(data.length);
  const map = getThresholdMap(method);
  // Spread the threshold over one step between palette colours.
  const spread = 1 / (palette.length - 1);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const threshold =
        map.thresholds[(y % map.size) * map.size + (x % map.size)] ?? 0.5;
      const shift = (0.5 - threshold) * spread + bias;
      const r = (data[offset] ?? 0) / 255 + shift;
      const g = (data[offset + 1] ?? 0) / 255 + shift;
      const b = (data[offset + 2] ?? 0) / 255 + shift;
      const color = palette[nearest(palette, r, g, b)] ?? palette[0];
      write(out, offset, color, data[offset + 3] ?? 255);
    }
  }
  return out;
};

/** Pass one pixel's rounding error on to its unvisited neighbours. */
const spreadError = ({
  error,
  height,
  kernel,
  reverse,
  width,
  work,
  x,
  y
}) => {
  for (const [dx, dy, weight] of kernel) {
    const nx = reverse ? x - dx : x + dx;
    const ny = y + dy;
    if (nx < 0 || nx >= width || ny >= height) {
      continue;
    }
    const target = (ny * width + nx) * 3;
    for (let channel = 0; channel < 3; channel += 1) {
      work[target + channel] =
        (work[target + channel] ?? 0) + error[channel] * weight;
    }
  }
};

const ditherDiffusion = (image, kernel, palette, bias, serpentine) => {
  const { data, width, height } = image;
  const out = new Uint8ClampedArray(data.length);
  const work = new Float32Array(width * height * 3);
  for (let index = 0; index < width * height; index += 1) {
    for (let channel = 0; channel < 3; channel += 1) {
      work[index * 3 + channel] = (data[index * 4 + channel] ?? 0) / 255 + bias;
    }
  }

  for (let y = 0; y < height; y += 1) {
    const reverse = serpentine && y % 2 === 1;
    for (let step = 0; step < width; step += 1) {
      const x = reverse ? width - 1 - step : step;
      const index = y * width + x;
      const r = work[index * 3] ?? 0;
      const g = work[index * 3 + 1] ?? 0;
      const b = work[index * 3 + 2] ?? 0;
      const color = palette[nearest(palette, r, g, b)] ?? palette[0];
      write(out, index * 4, color, data[index * 4 + 3] ?? 255);

      spreadError({
        error: [r - color[0], g - color[1], b - color[2]],
        height,
        kernel,
        reverse,
        width,
        work,
        x,
        y,
      });
    }
  }
  return out;
};

const DEFAULT_OPTIONS = { method: "floyd-steinberg" };

/**
 * Dither an image to a palette. Returns a new `ImageData` the same size;
 * `image` is not modified. Default: Floyd–Steinberg in black and white.
 */
export const ditherImage = (image, options = DEFAULT_OPTIONS) => {
  const palette = options.palette ?? BLACK_AND_WHITE;
  const bias = 0.5 - (options.threshold ?? 0.5);
  let data;
  switch (options.method) {
    case "bayer4":
    case "bayer8":
    case "blue-noise": {
      data = ditherOrdered(image, options.method, palette, bias);
      break;
    }
    case "floyd-steinberg":
    case "atkinson":
    case "sierra-lite": {
      data = ditherDiffusion(
        image,
        KERNELS[options.method],
        palette,
        bias,
        options.serpentine ?? true
      );
      break;
    }
    default: {
      const exhaustive = options;
      return exhaustive;
    }
  }
  return new ImageData(data, image.width, image.height);
};
