import { render, waitFor } from '@testing-library/react';
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
