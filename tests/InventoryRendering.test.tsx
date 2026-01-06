
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import InventoryGrid from '../components/InventoryGrid';
import { ZenBeast } from '../types';

describe('InventoryGrid', () => {
    // Basic mock beast
    const mockBeast: ZenBeast = {
        id: '1',
        name: 'TestBeast',
        image: 'img',
        imageUrl: 'url',
        level: 1,
        stats: { attack: 10, defense: 10, speed: 10 },
        type: 'Fire',
        rarity: 'Common',
        class: 'Warrior',
        exp: 0,
        staked: false,
        battles: 0,
        wins: 0
    };

    it('renders beasts correctly', () => {
        render(
            <InventoryGrid
                beasts={[mockBeast]}
                onOpenSellModal={vi.fn()}
                onToggleStake={vi.fn()}
                onEvolve={vi.fn()}
                onRename={vi.fn()}
                evolvingId={null}
            />
        );
        expect(screen.getByText('TestBeast')).toBeDefined();
    });

    it('renders empty state when no beasts', () => {
        render(
            <InventoryGrid
                beasts={[]}
                onOpenSellModal={vi.fn()}
                onToggleStake={vi.fn()}
                onEvolve={vi.fn()}
                onRename={vi.fn()}
                evolvingId={null}
            />
        );
        expect(screen.getByText('NO BEASTS FOUND MATCHING PARAMETERS.')).toBeDefined();
    });
});
