
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Marketplace from '../components/Marketplace';
import React from 'react';

// Mock child components that might cause issues or aren't needed for this test
vi.mock('../components/MarketplaceItem', () => ({
  default: () => <div data-testid="marketplace-item" />
}));

vi.mock('../components/BeastDetailModal', () => ({
  default: () => <div data-testid="beast-detail-modal" />
}));

describe('Marketplace Empty State', () => {
  const mockProps = {
    listings: [],
    onBuy: vi.fn(),
    onCancelListing: vi.fn(),
    marketHistory: []
  };

  afterEach(() => {
    cleanup();
  });

  it('shows empty state message when no listings exist', () => {
    render(<Marketplace {...mockProps} />);
    expect(screen.getByText('NO LISTINGS FOUND')).toBeDefined();
    // Button should not be visible initially as no filters are active
    expect(screen.queryByText('CLEAR FILTERS')).toBeNull();
  });

  it('shows clear filters button when search filter is active', async () => {
    render(<Marketplace {...mockProps} />);

    // Type in search
    const searchInput = screen.getByPlaceholderText('Search Listings...');
    fireEvent.change(searchInput, { target: { value: 'Dragon' } });

    // Check if button appears (wait for state update)
    expect(await screen.findByText('CLEAR FILTERS')).toBeDefined();

    // Click clear
    fireEvent.click(screen.getByText('CLEAR FILTERS'));

    // Check if search is cleared
    await waitFor(() => {
        expect((searchInput as HTMLInputElement).value).toBe('');
    });
    expect(screen.queryByText('CLEAR FILTERS')).toBeNull();
  });

  it('shows clear filters button when rarity filter is active', async () => {
    render(<Marketplace {...mockProps} />);

    // Select rarity
    // If multiple found, use getAll and take first, or refine query
    const selects = screen.getAllByLabelText('Filter by rarity');
    const select = selects[0];

    fireEvent.change(select, { target: { value: 'Rare' } });

    // Check if button appears
    expect(await screen.findByText('CLEAR FILTERS')).toBeDefined();

    // Click clear
    fireEvent.click(screen.getByText('CLEAR FILTERS'));

    // Check if select is reset
    await waitFor(() => {
        expect((select as HTMLSelectElement).value).toBe('');
    });
    expect(screen.queryByText('CLEAR FILTERS')).toBeNull();
  });
});
