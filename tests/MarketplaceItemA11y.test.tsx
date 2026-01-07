
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MarketplaceItem from '../components/MarketplaceItem';
import { ZenBeast, Rarity, BeastClass } from '../types';
import React from 'react';

// Mock BeastCard to avoid complex rendering
vi.mock('../components/BeastCard', () => ({
  default: ({ interactive }: { interactive?: boolean }) => (
    <div data-testid="beast-card" data-interactive={interactive?.toString() || "true"}>
      Beast Card Mock
    </div>
  )
}));

// Mock ResizeObserver for Recharts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

const mockBeast: ZenBeast = {
  id: '1',
  name: 'Test Beast',
  price: 500,
  rarity: Rarity.LEGENDARY,
  class: BeastClass.DRAGON,
  stats: { attack: 10, defense: 10, speed: 10, magic: 10, zen: 10 },
  level: 5,
  exp: 100,
  traits: [],
  imageUrl: 'test.jpg',
  obtainedAt: Date.now(),
  isStaked: false,
  generation: 1
};

describe('MarketplaceItem Accessibility', () => {
  afterEach(cleanup);

  it('renders with correct accessibility roles and attributes', () => {
    render(<MarketplaceItem beast={mockBeast} onSelect={vi.fn()} />);

    const item = screen.getByRole('button');
    expect(item).toBeTruthy();
    expect(item.getAttribute('tabindex')).toBe('0');
    expect(item.getAttribute('aria-label')).toContain('Test Beast');
    expect(item.getAttribute('aria-label')).toContain('500');
  });

  it('handles keyboard interaction (Enter)', () => {
    const onSelect = vi.fn();
    render(<MarketplaceItem beast={mockBeast} onSelect={onSelect} />);

    const item = screen.getByRole('button');
    fireEvent.keyDown(item, { key: 'Enter', code: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(mockBeast);
  });

  it('handles keyboard interaction (Space)', () => {
    const onSelect = vi.fn();
    render(<MarketplaceItem beast={mockBeast} onSelect={onSelect} />);

    const item = screen.getByRole('button');
    fireEvent.keyDown(item, { key: ' ', code: 'Space' });

    expect(onSelect).toHaveBeenCalledWith(mockBeast);
  });

  it('prevents nested interactivity in BeastCard', () => {
    render(<MarketplaceItem beast={mockBeast} onSelect={vi.fn()} />);
    const beastCard = screen.getByTestId('beast-card');
    // We expect interactive={false} to be passed to BeastCard
    expect(beastCard.getAttribute('data-interactive')).toBe('false');
  });
});
