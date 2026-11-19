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
