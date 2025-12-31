
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Marketplace from '../components/Marketplace';
import { CyberButton } from '../components/common/CyberComponents';
import React from 'react';

// Mock child components to isolate Marketplace logic
vi.mock('../components/MarketplaceItem', () => ({
  default: ({ beast }: any) => <div data-testid="marketplace-item">{beast.name}</div>
}));

// Mock BeastDetailModal to avoid issues with portals or complex children
vi.mock('../components/BeastDetailModal', () => ({
  default: ({ children }: any) => <div data-testid="detail-modal">{children}</div>
}));

const mockListings = [
  { id: '1', price: 100, originalOwner: '0x123', name: 'Dragon 1', rarity: 'LEGENDARY', class: 'DRAGON', stats: { attack: 10, defense: 10, speed: 10, magic: 10 }, level: 1, exp: 0, traits: [] },
  { id: '2', price: 200, originalOwner: 'player', name: 'Tiger 1', rarity: 'COMMON', class: 'TIGER', stats: { attack: 5, defense: 5, speed: 5, magic: 5 }, level: 1, exp: 0, traits: [] }
];

const defaultProps = {
  listings: mockListings,
  onBuy: vi.fn(),
  onCancelListing: vi.fn(),
  marketHistory: ['Sold Dragon 1 for 100 ZEN']
};

// Ensure cleanup after each test
afterEach(() => {
  cleanup();
});

describe('Marketplace Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toggles have correct aria-pressed state', () => {
    render(<Marketplace {...defaultProps} />);

    // Find buttons by accessible name
    const globalBtn = screen.getByRole('button', { name: /show all listings/i });
    const myBtn = screen.getByRole('button', { name: /show only my listings/i });

    // Initial state: Global is active
    expect(globalBtn.getAttribute('aria-pressed')).toBe('true');
    expect(myBtn.getAttribute('aria-pressed')).toBe('false');

    // Click "My Listings"
    fireEvent.click(myBtn);

    // State should flip
    expect(globalBtn.getAttribute('aria-pressed')).toBe('false');
    expect(myBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('search input has accessible label', () => {
    render(<Marketplace {...defaultProps} />);
    // Select the specific search input we care about (the visible one)
    const searchInputs = screen.getAllByLabelText(/search listings/i);
    expect(searchInputs.length).toBeGreaterThan(0);
    expect(searchInputs[0]).toBeTruthy();
  });

  it('renders filter dropdown with accessible label', () => {
    render(<Marketplace {...defaultProps} />);
    const filterSelect = screen.getByLabelText(/filter by rarity/i);
    expect(filterSelect).toBeTruthy();
  });
});

describe('CyberButton Accessibility', () => {
  it('applies aria-busy when loading', () => {
    render(<CyberButton loading>Submit</CyberButton>);
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('hides spinner from screen readers', () => {
    render(<CyberButton loading>Submit</CyberButton>);
    const spinner = screen.getByText('⟳');
    expect(spinner.getAttribute('aria-hidden')).toBe('true');
  });

  it('does not have aria-busy when not loading', () => {
    render(<CyberButton>Submit</CyberButton>);
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button.getAttribute('aria-busy')).toBeNull();
  });
});
