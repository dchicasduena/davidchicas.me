import { BLUE_NOISE_64_BASE64 } from "@/lib/dither/blue-noise";

export const DITHER_MATRICES = ["bayer2", "bayer4", "bayer8", "blue-noise"];

const fromRanks = (size, ranks, steps) => ({
  ranks,
  size,
  steps,
  thresholds: Float32Array.from(ranks, (rank) => (rank + 0.5) / steps),
});

// Bayer ranks: interleave the bits of (x xor y) and y, least significant
// first, so each 2x2 block of the previous size splits into four.
const bayerRanks = size => {
  const ranks = new Uint8Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let rank = 0;
      for (let bit = 1; bit < size; bit *= 2) {
        const xBit = Math.floor(x / bit) % 2;
        const yBit = Math.floor(y / bit) % 2;
        rank = rank * 4 + 2 * ((xBit + yBit) % 2) + yBit;
      }
      ranks[y * size + x] = rank;
    }
  }
  return ranks;
};

const decodeBase64 = value => {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.codePointAt(0) ?? 0);
};

export const BAYER_2 = fromRanks(2, bayerRanks(2), 4);
export const BAYER_4 = fromRanks(4, bayerRanks(4), 16);
export const BAYER_8 = fromRanks(8, bayerRanks(8), 64);

/** 64x64 void-and-cluster blue noise, 256 levels of 16 cells each. */
export const BLUE_NOISE_64 = fromRanks(
  64,
  decodeBase64(BLUE_NOISE_64_BASE64),
  256
);

export const getThresholdMap = matrix => {
  switch (matrix) {
    case "bayer2": {
      return BAYER_2;
    }
    case "bayer4": {
      return BAYER_4;
    }
    case "bayer8": {
      return BAYER_8;
    }
    case "blue-noise": {
      return BLUE_NOISE_64;
    }
    default: {
      const exhaustive = matrix;
      return exhaustive;
    }
  }
};

const wrap = (value, size) =>
  ((Math.floor(value) % size) + size) % size;

/** The threshold in (0, 1) at cell (x, y). Coordinates wrap. */
export const thresholdAt = (matrix, x, y) => {
  const map = getThresholdMap(matrix);
  return map.thresholds[wrap(y, map.size) * map.size + wrap(x, map.size)] ?? 0;
};

/** Whether a cell is inked for a tone in [0, 1]. */
export const isInked = (
  matrix,
  x,
  y,
  tone
) => tone > thresholdAt(matrix, x, y);
