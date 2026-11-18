import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { expect, it, vi } from 'vitest';
import Home from './Home';

it('keeps the ASCII title still when reduced motion is requested', async () => {
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  try {
    const { container } = render(<Home />);
    const asciiTitle = container.querySelector('.ascii-title span');

    await waitFor(() => expect(asciiTitle.textContent).not.toBe(''));
    const completeTitle = asciiTitle.textContent;
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(asciiTitle.textContent).toBe(completeTitle);
  } finally {
    window.matchMedia = originalMatchMedia;
  }
});

it('highlights ASCII characters within a nine-character pointer radius', async () => {
  const originalMatchMedia = window.matchMedia;
  const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    measureText: () => ({ width: 4.8 }),
  });
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  try {
    const { container } = render(<Home />);
    const title = container.querySelector('#page-title');
    const highlightedArt = container.querySelector('.ascii-title-highlight .ascii-title-art');
    highlightedArt.getBoundingClientRect = vi.fn(() => ({
      left: 10,
      top: 20,
      right: 210,
      bottom: 120,
      width: 200,
      height: 100,
    }));

    await waitFor(() => expect(highlightedArt.textContent.length).toBeGreaterThan(6));
    fireEvent.pointerMove(title, { pointerType: 'mouse', clientX: 22, clientY: 22 });

    await waitFor(() => {
      expect(container.querySelector('.ascii-title-highlight')).toHaveClass('is-active');
      expect(Number.parseFloat(highlightedArt.style.getPropertyValue('--ascii-radius-x'))).toBeCloseTo(4.8 * 9);
      expect(Number.parseFloat(highlightedArt.style.getPropertyValue('--ascii-radius-y'))).toBeCloseTo(8 * 1.08 * 9);
    });

    const firstPointerX = highlightedArt.style.getPropertyValue('--ascii-pointer-x');
    fireEvent.pointerMove(title, { pointerType: 'mouse', clientX: 32, clientY: 22 });
    await waitFor(() => {
      expect(highlightedArt.style.getPropertyValue('--ascii-pointer-x')).not.toBe(firstPointerX);
    });

    fireEvent.pointerLeave(title);
    await waitFor(() => {
      expect(container.querySelector('.ascii-title-highlight')).not.toHaveClass('is-active');
    });

    fireEvent.pointerMove(title, { pointerType: 'touch', clientX: 22, clientY: 22 });
    expect(container.querySelector('.ascii-title-highlight')).not.toHaveClass('is-active');
  } finally {
    window.matchMedia = originalMatchMedia;
    getContext.mockRestore();
  }
});
