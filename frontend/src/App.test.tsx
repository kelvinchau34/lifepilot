import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders LifePilot application', () => {
  render(<App />);
  
  // Test for the main title in App.tsx specifically
  const mainTitle = screen.getByRole('heading', { level: 1, name: /^LifePilot$/ });
  expect(mainTitle).toBeInTheDocument();
  
  // Alternative: Test for multiple LifePilot occurrences
  const lifePilotElements = screen.getAllByText(/LifePilot/i);
  expect(lifePilotElements.length).toBeGreaterThan(0);
  
  // Test for key components being rendered
  expect(screen.getByText('Executive Agent')).toBeInTheDocument();
  expect(screen.getByText('AI Assistant')).toBeInTheDocument();
});

test('renders dashboard with sidebar navigation', () => {
  render(<App />);
  
  // Test sidebar navigation elements
  expect(screen.getByText('Executive Agent')).toBeInTheDocument();
  expect(screen.getByText('Calendar Agent')).toBeInTheDocument();
  expect(screen.getByText('Finance Agent')).toBeInTheDocument();
  expect(screen.getByText('Health Agent')).toBeInTheDocument();
  expect(screen.getByText('Knowledge Agent')).toBeInTheDocument();
});

test('renders coming soon content by default', () => {
  render(<App />);
  
  // Test that Coming Soon component is rendered for the default active agent
  expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  expect(screen.getByText(/AI team is crafting intelligent/i)).toBeInTheDocument();
});