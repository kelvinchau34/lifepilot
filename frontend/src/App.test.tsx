import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders LifePilot title', () => {
  render(<App />);
  const titleElement = screen.getByText(/LifePilot/i);
  expect(titleElement).toBeInTheDocument();
});
