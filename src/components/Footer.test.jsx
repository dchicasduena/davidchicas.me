import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Footer from './Footer';

vi.mock('./dithercn/dither-orb', () => ({ DitherOrb: () => null }));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('portfolio assistant', () => {
  it('shows help and answers portfolio navigation and file commands', async () => {
    const user = userEvent.setup();
    render(<Footer />);

    expect(screen.getByRole('region', { name: 'Portfolio assistant' })).toBeInTheDocument();
    expect(screen.getByRole('log')).toHaveTextContent(
      'I can help you explore my portfolio. Try help, projects, contact, or resume.',
    );
    expect(screen.queryByRole('link', { name: /open terminal/i })).not.toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: 'Enter a portfolio command' });
    const composer = input.closest('form');
    const log = screen.getByRole('log');
    expect(
      composer.compareDocumentPosition(log) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await user.type(input, 'help{Enter}');
    expect(screen.getByText('help ls pwd whoami cd cat about projects contact resume')).toBeInTheDocument();
    expect(screen.queryByText(/shutdown/)).not.toBeInTheDocument();

    await user.type(input, 'cd projects{Enter}');
    expect(screen.getByText('Now exploring ~/projects.')).toBeInTheDocument();
    await user.type(input, 'cat projects.txt{Enter}');
    expect(screen.getByText(/genrify: spotify playlist generator/)).toBeInTheDocument();
  });

  it('rejects commands that do not return portfolio information', async () => {
    const user = userEvent.setup();
    render(<Footer />);

    await user.type(
      screen.getByRole('textbox', { name: 'Enter a portfolio command' }),
      'rm -rf /{Enter}',
    );

    expect(screen.getByText('rm: not available. Type "help" to see portfolio commands.')).toBeInTheDocument();
  });

  it('keeps resume available and provides a fallback link', async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    render(<Footer />);

    await user.type(
      screen.getByRole('textbox', { name: 'Enter a portfolio command' }),
      'resume{Enter}',
    );

    expect(open).toHaveBeenCalledWith('/assets/resume.pdf', '_blank', 'noopener,noreferrer');
    expect(screen.getByRole('link', { name: 'Open my resume' })).toHaveAttribute(
      'href',
      '/assets/resume.pdf',
    );
  });
});
