
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BattleArena from '../components/BattleArena';
import { useGameState } from '../hooks/useGameState';
import React from 'react';

// Mock the hooks
vi.mock('../hooks/useGameState');
vi.mock('../services/battleEngine', () => ({
  initiateBattle: vi.fn(),
  executeTurn: vi.fn(),
}));

// Mock child components to simplify testing
vi.mock('../components/BeastCard', () => ({
  default: ({ beast }: any) => <div data-testid="beast-card">{beast.name}</div>
}));

// Mock scrollIntoView for JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('BattleArena Accessibility', () => {
  const mockStartBattle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useGameState as any).mockReturnValue({
      beasts: [
        { id: '1', name: 'Beast 1', stats: { hp: 100, maxHp: 100, attack: 10, defense: 10, speed: 10 }, type: 'Fire', imageUrl: 'test.jpg' }
      ],
      coins: 100,
      startBattle: mockStartBattle,
    });
  });

  it('manages ARIA roles correctly through the battle flow (status -> log)', async () => {
    let resolveBattle: any;
    const mockOnBattle = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
            resolveBattle = resolve;
        });
    });

    render(<BattleArena
        beasts={[{ id: '1', name: 'Beast 1', stats: { hp: 100, maxHp: 100, attack: 10, defense: 10, speed: 10 }, type: 'Fire', level: 1, imageUrl: 'test.jpg' }]}
        onBattle={mockOnBattle}
        leaderboard={[]}
    />);

    // 1. Select a beast
    const beastOptions = screen.getAllByText('Beast 1');
    fireEvent.click(beastOptions[0]);

    // 2. Select a gym leader
    const leaderButton = screen.getByText('Initiate Kai').closest('button');
    if (leaderButton) fireEvent.click(leaderButton);

    // 3. Click Initiate Protocol
    const initiateBtn = screen.getByText('INITIATE PROTOCOL').closest('button');
    expect((initiateBtn as HTMLButtonElement).disabled).toBe(false);

    if (initiateBtn) fireEvent.click(initiateBtn);

    // 4. Verify Loading State (role="status")
    await waitFor(() => {
        const status = screen.getByRole('status');
        expect(status).toBeTruthy();
        expect(status.getAttribute('aria-live')).toBe('polite');
    });

    // Ensure Log is NOT present yet
    expect(screen.queryByRole('log')).toBeNull();

    // 5. Resolve the battle
    await act(async () => {
        resolveBattle({
            winnerId: '1',
            logs: [
                { turn: 1, actor: 'Beast 1', description: 'attacked', damage: 10, isCritical: false }
            ],
            rewards: { zenCoins: 10, exp: 50 }
        });
    });

    // 6. Verify Battle Log exists (role="log")
    await waitFor(() => {
        const log = screen.getByRole('log');
        expect(log).toBeTruthy();
        expect(log.getAttribute('aria-label')).toBe('Battle Log');
    });

    // Ensure Status is gone
    expect(screen.queryByRole('status')).toBeNull();
  });
});
