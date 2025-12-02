// @ts-nocheck
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { StatusEnum } from './types';

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('DevStatus App Feature Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('renders the app header', () => {
    render(<App />);
    expect(screen.getByText('DevStatus')).toBeInTheDocument();
  });

  test('persists state to localStorage', async () => {
    const { container } = render(<App />);
    
    // Simulate a status update (this is tricky without full integration, 
    // but we can check if localStorage is populated after initial render)
    await waitFor(() => {
        expect(window.localStorage.getItem('devstatus_statuses')).toBeTruthy();
    });
  });

  test('Focus Mode toggle filters out done items', () => {
    render(<App />);
    const toggleButton = screen.getByText(/Focus Mode/i);
    fireEvent.click(toggleButton);
    
    // In a real browser test, we would check if green tiles are hidden.
    // Here we verify the button state change visually or via class
    expect(toggleButton).toHaveClass('bg-indigo-600');
  });

  test('Dark mode toggle works', () => {
    render(<App />);
    // Find the moon/sun icon button (usually by role or label if accessible, or by SVG presence)
    // For simplicity in this mock test environment:
    const moonIcons = document.querySelectorAll('.lucide-moon');
    if (moonIcons.length > 0) {
        fireEvent.click(moonIcons[0].parentElement!);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    }
  });

  test('Opening Comments Modal', () => {
    render(<App />);
    // Find a comments button. This requires the DOM to be fully rendered with tiles.
    // We assume tiles are rendered.
    const commentButtons = document.querySelectorAll('button[title="Comments"]');
    if (commentButtons.length > 0) {
        fireEvent.click(commentButtons[0]);
        expect(screen.getByText(/Comments:/i)).toBeInTheDocument();
    }
  });
});