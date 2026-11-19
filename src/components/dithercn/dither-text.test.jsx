import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { DitherText } from "./dither-text";

const ditherMocks = vi.hoisted(() => ({ colors: null }));

vi.mock("@/lib/dither", () => ({
  bloomFilter: () => "none",
  cssColor: (color) => color,
  ditherMaskStyle: () => ({ maskImage: "url(mask.svg)" }),
  getThresholdMap: () => ({ size: 4, thresholds: Array(16).fill(0.5) }),
  readDitherCell: () => 3,
  useDitherColors: () => ditherMocks.colors,
  useFrameLoop: () => "paused",
}));

const originalResizeObserver = globalThis.ResizeObserver;

beforeEach(() => {
  ditherMocks.colors = null;
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

afterEach(() => {
  vi.restoreAllMocks();
  if (originalResizeObserver === undefined) {
    delete globalThis.ResizeObserver;
  } else {
    globalThis.ResizeObserver = originalResizeObserver;
  }
});

it("keeps its static dither mask until the first frame is ready", () => {
  const { container, rerender } = render(
    <DitherText as="h1" fill="gradient">
      David Chicas
    </DitherText>
  );
  const title = container.querySelector("h1");
  const paint = title.querySelector("span");
  const fallbackMask = paint.style.maskImage;

  expect(title).toHaveAttribute("data-state", "fallback");
  expect(fallbackMask).toContain("mask.svg");

  ditherMocks.colors = [[0, 0, 0, 0], [1, 1, 1, 1]];
  rerender(
    <DitherText as="h1" fill="gradient">
      David Chicas
    </DitherText>
  );

  expect(title).toHaveAttribute("data-state", "fallback");
  expect(paint.style.maskImage).toBe(fallbackMask);
});
