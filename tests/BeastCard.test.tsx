
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BeastCard from '../components/BeastCard';
import { ZenBeast, Rarity, BeastClass } from '../types';

describe('BeastCard', () => {
  const mockBeast: ZenBeast = {
    id: 'test-1',
    name: 'Test Beast',
    description: 'A test beast',
    class: BeastClass.TIGER,
    rarity: Rarity.COMMON,
    level: 1,
    exp: 0,
    stats: {
      attack: 10,
      defense: 10,
      speed: 10,
      zen: 10
    },
    traits: [],
    imageUrl: 'test.jpg',
    generation: 1,
    obtainedAt: Date.now(),
    isStaked: false,
    isSoulbound: false,
    isOnChain: false,
    ownerId: 'player'
  };

  it('renders null if beast is missing', () => {
    // @ts-ignore - testing runtime safety
    const { container } = render(<BeastCard beast={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null if beast.stats is missing', () => {
    const brokenBeast = { ...mockBeast };
    // @ts-ignore - testing runtime safety
    delete brokenBeast.stats;

    // @ts-ignore - testing runtime safety
    const { container } = render(<BeastCard beast={brokenBeast} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly if beast is valid', () => {
    const { getByText } = render(<BeastCard beast={mockBeast} />);
    expect(getByText('Test Beast')).toBeTruthy();
  });
});
