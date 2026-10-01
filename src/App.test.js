import { render, screen } from '@testing-library/react';
import React from 'react';

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <>{children}</>,
  useLocation: () => ({ pathname: globalThis.location.pathname }),
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });

import App from './App';

test('renders the text-first portfolio and section links', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /david chicas/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '#projects');
  expect(screen.getByRole('heading', { name: /about/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /projects/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /contact/i })).toBeInTheDocument();
  expect(screen.getByText('01.', { selector: '.project-number' })).toBeInTheDocument();
});

test('keeps legacy project URLs and shows their project entry', () => {
  window.history.pushState({}, '', '/cardBinder');
  render(<App />);

  expect(window.location.pathname).toBe('/cardBinder');
  expect(screen.getByRole('heading', { name: /card binder/i })).toBeInTheDocument();
});
