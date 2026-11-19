import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <>{children}</>,
  useLocation: () => ({ pathname: globalThis.location.pathname }),
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}));

import App from './App';

test('renders the text-first portfolio and section links', () => {
  const { container } = render(<App />);

  expect(screen.getByRole('heading', { name: /david chicas/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '#projects');
  expect(screen.getByRole('heading', { name: /^about$/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /projects/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /contact/i })).toBeInTheDocument();
  expect(screen.getAllByText('>', { selector: '.project-number' })).toHaveLength(7);
  const background = container.querySelector('[data-dither-fallback]')?.parentElement;
  expect(background).toHaveClass('fixed', 'inset-0', 'z-0');
  expect(background).toHaveAttribute('aria-hidden', 'true');
  expect(container.querySelector('.crt-screen-effects')).not.toBeInTheDocument();
});

test('keeps legacy project URLs and shows their project entry', () => {
  window.history.pushState({}, '', '/cardBinder');
  render(<App />);

  expect(window.location.pathname).toBe('/cardBinder');
  expect(screen.getByRole('heading', { name: /card binder/i })).toBeInTheDocument();
});

test('shows the 404 screen and a link back home for unknown routes', () => {
  window.history.pushState({}, '', '/missing-page');
  render(<App />);

  expect(screen.getByRole('heading', { name: /sorry something went wrong/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /go back/i })).toHaveAttribute('href', '/');
});
