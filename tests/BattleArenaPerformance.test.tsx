
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import BattleArena from '../components/BattleArena';
import { ZenBeast, Rarity, BeastClass } from '../types';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function() {};

const mockBeasts: ZenBeast[] = [
    {
        id: '1',
        name: 'CyberDragon',
        class: BeastClass.WARRIOR,
        rarity: Rarity.LEGENDARY,
        level: 10,
        exp: 1000,
        stats: { attack: 100, defense: 80, speed: 60, hp: 200 },
        imageUrl: 'url',
        isStaked: false,
        isSoulbound: false,
        obtainedAt: Date.now()
    },
    {
        id: '2',
        name: 'StakedBeast',
        class: BeastClass.MAGE,
        rarity: Rarity.COMMON,
        level: 5,
        exp: 500,
        stats: { attack: 50, defense: 40, speed: 30, hp: 100 },
        imageUrl: 'url',
        isStaked: true,
        isSoulbound: false,
        obtainedAt: Date.now()
    }
];

const mockOnBattle = async () => ({
    winnerId: '1',
    logs: [{ turn: 1, actor: 'CyberDragon', description: 'attacked', damage: 10, isCritical: false }],
    rewards: { zenCoins: 10, exp: 50 }
});

describe('BattleArena Performance', () => {
    it('should filter unstaked beasts correctly', () => {
        render(
            <BattleArena
                beasts={mockBeasts}
                onBattle={mockOnBattle}
                leaderboard={[]}
            />
        );

        // Only CyberDragon should be visible in the list
        expect(screen.getByText('CyberDragon')).toBeDefined();
        // StakedBeast should not be in the list
        expect(screen.queryByText('StakedBeast')).toBeNull();
    });
});
