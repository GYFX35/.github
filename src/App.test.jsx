import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AI Video Content Generator header', () => {
  render(<App />);
  const headerElement = screen.getByText(/AI Video Content Generator/i);
  expect(headerElement).toBeDefined();
});
