import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders LifePilot title', () => {
  render(<App />);
  
  // Since there are multiple "LifePilot" texts, use getAllByText to verify at least one exists
  const lifePilotElements = screen.getAllByText(/LifePilot/i);
  expect(lifePilotElements.length).toBeGreaterThan(0);
});

test('renders App component without crashing', () => {
  render(<App />);
  
  // Just verify the app renders without throwing an error
  // This is a minimal smoke test
  expect(document.body).toBeInTheDocument();
});