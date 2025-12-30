
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Marketplace from '../components/Marketplace';
import React from 'react';

describe('Marketplace Accessibility', () => {
    const mockListings = [
        { id: '1', name: 'Fire Beast', rarity: 'Common', price: 10, originalOwner: 'other', traits: [], stats: {}, imageUrl: '' },
        { id: '2', name: 'Water Beast', rarity: 'Rare', price: 20, originalOwner: 'player', traits: [], stats: {}, imageUrl: '' }
    ];

    it('toggle buttons have aria-pressed state', () => {
        render(<Marketplace listings={mockListings} onBuy={vi.fn()} onCancelListing={vi.fn()} marketHistory={[]} />);

        const globalBtn = screen.getByText('GLOBAL').closest('button');
        const mineBtn = screen.getByText('MY LISTINGS').closest('button');

        expect(globalBtn).toBeTruthy();
        expect(mineBtn).toBeTruthy();

        // Initially 'GLOBAL' is active
        // This is expected to FAIL before implementation
        expect(globalBtn?.getAttribute('aria-pressed')).toBe('true');
        expect(mineBtn?.getAttribute('aria-pressed')).toBe('false');

        // Click 'MY LISTINGS'
        fireEvent.click(mineBtn!);
        expect(globalBtn?.getAttribute('aria-pressed')).toBe('false');
        expect(mineBtn?.getAttribute('aria-pressed')).toBe('true');
    });

    it('shows CLEAR FILTERS button when no results found due to filters', () => {
        render(<Marketplace listings={mockListings} onBuy={vi.fn()} onCancelListing={vi.fn()} marketHistory={[]} />);

        // Handle potential multiple inputs
        const searchInputs = screen.getAllByLabelText('Search listings');
        const searchInput = searchInputs[0];

        fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

        expect(screen.getByText('NO LISTINGS FOUND')).toBeTruthy();

        // This assertion will FAIL before implementation
        const clearBtn = screen.queryByText('CLEAR FILTERS');
        expect(clearBtn).toBeTruthy();

        // Click it
        fireEvent.click(clearBtn!);

        // Should clear search
        expect((searchInput as HTMLInputElement).value).toBe('');
        expect(screen.queryByText('NO LISTINGS FOUND')).toBeNull();
    });
});
