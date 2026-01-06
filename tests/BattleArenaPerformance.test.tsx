
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import BattleArena from '../components/BattleArena';
import { ZenBeast, Rarity, BeastClass } from '../types';

// Mock dependencies
vi.mock('../components/common/CyberComponents', () => ({
  SectionHeader: ({ title }: any) => <div>{title}</div>,
  CyberButton: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const mockBeasts: ZenBeast[] = [
  {
    id: '1',
    name: 'Battle Beast 1',
    description: 'A test beast',
    class: BeastClass.TIGER,
    rarity: Rarity.COMMON,
    level: 1,
    exp: 0,
    generation: 0,
    obtainedAt: Date.now(),
    isStaked: false,
    isSoulbound: false,
    isOnChain: false,
    ownerId: 'player',
    stats: { attack: 10, defense: 10, speed: 10, zen: 10 },
    traits: [],
    imageUrl: 'http://example.com/beast1.png'
  },
  {
    id: '2',
    name: 'Staked Beast',
    description: 'A staked beast',
    class: BeastClass.DRAGON,
    rarity: Rarity.LEGENDARY,
    level: 5,
    exp: 100,
    generation: 0,
    obtainedAt: Date.now(),
    isStaked: true, // Should be filtered out
    isSoulbound: false,
    isOnChain: false,
    ownerId: 'player',
    stats: { attack: 50, defense: 50, speed: 50, zen: 50 },
    traits: [],
    imageUrl: 'http://example.com/beast2.png'
  }
];

describe('BattleArena Performance', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders and filters unstaked beasts correctly', () => {
    render(
      <BattleArena
        beasts={mockBeasts}
        onBattle={vi.fn()}
        leaderboard={[]}
      />
    );

    // Should show the title
    expect(screen.getByText('NEON COLISEUM')).toBeDefined();

    // Should show unstaked beast
    expect(screen.getByText('Battle Beast 1')).toBeDefined();

    // Should NOT show staked beast
    const stakedBeast = screen.queryByText('Staked Beast');
    expect(stakedBeast).toBeNull();
  });
});
