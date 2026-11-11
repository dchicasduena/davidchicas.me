import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { expect, it, vi } from 'vitest';
import Terminal from './Terminal';

it('keeps the first-run help visible after commands without shortcut buttons', async () => {
  const user = userEvent.setup();
  render(<Terminal onClose={vi.fn()} />);

  const dialog = screen.getByRole('dialog', { name: /david chicas interactive terminal/i });
  expect(within(dialog).getByText(/explore a little more about me/i)).toBeInTheDocument();
  expect(within(dialog).getByText(/cat about\.txt/i)).toBeInTheDocument();
  expect(within(dialog).getByText(/best experience, use this terminal on a desktop browser/i)).toBeInTheDocument();
  expect(dialog.querySelectorAll('.terminal-welcome-gap')).toHaveLength(2);
  expect(within(dialog).queryByRole('button', { name: 'help' })).not.toBeInTheDocument();

  await user.type(screen.getByRole('textbox', { name: 'terminal input' }), 'echo hello{Enter}');
  expect(within(dialog).getByText(/explore a little more about me/i)).toBeInTheDocument();
});

it('keeps the working directory in the prompt and closes with Escape', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(<Terminal onClose={onClose} />);

  await user.type(screen.getByRole('textbox', { name: 'terminal input' }), 'cd projects{Enter}');
  const prompts = document.querySelectorAll('.terminal-prompt-home');
  expect(prompts[prompts.length - 1]).toHaveTextContent('~/projects');

  fireEvent.keyDown(screen.getByRole('textbox', { name: 'terminal input' }), { key: 'Escape' });
  expect(onClose).toHaveBeenCalledOnce();
});

it('locks page scrolling while open and restores it when unmounted', () => {
  const bodyOverflow = document.body.style.overflow;
  const documentOverflow = document.documentElement.style.overflow;
  const { unmount } = render(<Terminal onClose={vi.fn()} />);

  expect(document.body.style.overflow).toBe('hidden');
  expect(document.documentElement.style.overflow).toBe('hidden');

  unmount();
  expect(document.body.style.overflow).toBe(bodyOverflow);
  expect(document.documentElement.style.overflow).toBe(documentOverflow);
});
