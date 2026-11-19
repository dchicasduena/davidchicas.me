import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import Home from './Home';

vi.mock('./dithercn/dither-text', () => ({
  DitherText: ({
    as: Tag,
    children,
    bloom,
    cell,
    direction,
    fill,
    speed,
    to,
    ...props
  }) => (
    <Tag
      {...props}
      data-bloom={bloom}
      data-cell={cell}
      data-direction={direction}
      data-fill={fill}
      data-speed={speed}
      data-to={to}
    >
      {children}
    </Tag>
  ),
}));

vi.mock('./dithercn/dissolve-text', () => ({
  DissolveText: ({
    as: Tag = 'span',
    by,
    cell,
    children,
    delay,
    direction,
    matrix,
    speed,
    stagger,
    ...props
  }) => (
    <Tag
      {...props}
      data-by={by}
      data-cell={cell}
      data-delay={delay}
      data-direction={direction}
      data-matrix={matrix}
      data-speed={speed}
      data-stagger={stagger}
    >
      {children}
    </Tag>
  ),
}));

it('renders David Chicas as the dithered, accessible page heading', () => {
  const { container } = render(<Home />);
  const heading = screen.getByRole('heading', { level: 1, name: 'David Chicas' });

  expect(heading).toHaveAttribute('id', 'page-title');
  expect(heading).toHaveAttribute('data-fill', 'gradient');
  expect(heading).toHaveAttribute('data-direction', 'down');
  expect(heading).toHaveAttribute('data-bloom', 'high');
  expect(heading).toHaveAttribute('data-speed', '1.5');
  expect(heading).toHaveAttribute('data-cell', '3');
  expect(heading).toHaveAttribute('data-to', '0.7');
  expect(container.querySelector('.ascii-title')).not.toBeInTheDocument();
});

it('reveals the intro description by character without terminal markers', () => {
  render(<Home />);
  const description = screen.getByText(/Software developer in Newfoundland, Canada/);

  expect(description.tagName).toBe('P');
  expect(description).toHaveClass('intro-detail');
  expect(description).toHaveAttribute('data-by', 'char');
  expect(description).toHaveAttribute('data-matrix', 'bayer8');
  expect(description).toHaveAttribute('data-cell', '2');
  expect(description).toHaveAttribute('data-delay', '200');
  expect(description).toHaveAttribute('data-direction', 'random');
  expect(description).toHaveAttribute('data-speed', '1.75');
  expect(description).toHaveAttribute('data-stagger', '45');
  expect(description.querySelector('.project-number')).toBeNull();
  expect(description).not.toHaveTextContent('>');
});
