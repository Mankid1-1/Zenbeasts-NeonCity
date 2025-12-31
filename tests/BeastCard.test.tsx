 fix-beast-card-crash-check-8981718995585845795


 ZenBeasts
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BeastCard from '../components/BeastCard';
 fix-beast-card-crash-check-8981718995585845795
import { ZenBeast, Rarity, BeastClass } from '../types';

const mockBeast: ZenBeast = {
  id: 'beast-1',
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

describe('BeastCard', () => {
  it('renders correctly with valid beast data', () => {
    render(<BeastCard beast={mockBeast} />);
    // Use getAllByText to handle potential multiple occurrences or just check for existence
    const nameElements = screen.getAllByText('Test Beast');
    expect(nameElements.length).toBeGreaterThan(0);
    expect(screen.getByText('L1')).toBeDefined();
  });

  it('returns null when beast is null', () => {
    const { container } = render(<BeastCard beast={null as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when beast stats are missing', () => {
    const beastWithoutStats = { ...mockBeast, stats: undefined } as any;
    const { container } = render(<BeastCard beast={beastWithoutStats} />);
    expect(container.firstChild).toBeNull();
  });

  it('handles missing image url gracefully', () => {
      const beastWithoutImage = { ...mockBeast, imageUrl: undefined } as any;
      render(<BeastCard beast={beastWithoutImage} />);
      const nameElements = screen.getAllByText('Test Beast');
      expect(nameElements.length).toBeGreaterThan(0);
  });

  it('handles missing rarity gracefully', () => {
      const beastWithoutRarity = { ...mockBeast, rarity: undefined } as any;
      render(<BeastCard beast={beastWithoutRarity} />);
      // Should default to COMMON color/style logic, no crash
      const nameElements = screen.getAllByText('Test Beast');
      expect(nameElements.length).toBeGreaterThan(0);

import { ZenBeast, BeastClass, Rarity } from '../types';

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
 ZenBeasts
  });
});
