
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';
import { BeastClass, Rarity } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock crypto.randomUUID or Math.random for deterministic IDs if needed
// But useGameState uses Math.random() in a way we can just accept

describe('Game Simulation (Mock Mode)', () => {

    beforeEach(() => {
        window.localStorage.clear();
    });

    it('should initialize with a starter beast', async () => {
        const { result } = renderHook(() => useGameState());

        // Wait for the useEffect to run (starter beast creation)
        await waitFor(() => {
            expect(result.current.beasts.length).toBeGreaterThanOrEqual(1);
        }, { timeout: 2000 });

        expect(result.current.beasts[0].name).toBe('Neon Initiate');
        expect(result.current.coins).toBeGreaterThan(0);
    });

    it('should allow minting a new beast', async () => {
        const { result } = renderHook(() => useGameState());
        await waitFor(() => { expect(result.current.beasts.length).toBeGreaterThanOrEqual(1); });

        // Add coins to ensure minting is possible
        await act(async () => {
             result.current.debugMethods.addCoins(1000);
        });

        const initialCoins = result.current.coins;
        const mintPrice = result.current.calculateMintPrice();

        await act(async () => {
            await result.current.handleMint();
        });

        expect(result.current.beasts.length).toBeGreaterThanOrEqual(2);
        expect(result.current.coins).toBe(initialCoins - mintPrice);
    });

    it('should allow breeding two beasts', async () => {
        const { result } = renderHook(() => useGameState());
        await waitFor(() => { expect(result.current.beasts.length).toBeGreaterThanOrEqual(1); });

         // Add coins to ensure minting is possible
        await act(async () => {
             result.current.debugMethods.addCoins(5000);
        });

        // Get two beasts first
        await act(async () => {
            await result.current.handleMint(); // Beast 2
        });

        const p1 = result.current.beasts[0];
        const p2 = result.current.beasts[1];

        await act(async () => {
            await result.current.handleBreed(p1, p2);
        });

        expect(result.current.beasts.length).toBeGreaterThanOrEqual(3);
        const child = result.current.beasts[2];
        expect(child.generation).toBeGreaterThan(0);
    });

    it('should allow staking and claiming rewards', async () => {
        const { result } = renderHook(() => useGameState());
        await waitFor(() => { expect(result.current.beasts.length).toBeGreaterThanOrEqual(1); });

        // Connect wallet first (simulated)
        await act(async () => {
            await result.current.connectWallet('solana');
        });

        // Mint a non-soulbound beast (starter is soulbound)
        await act(async () => {
            result.current.debugMethods.addCoins(10000); // Add plenty of coins
        });
        await act(async () => {
             await result.current.handleMint();
        });

        const beastToStake = result.current.beasts[1];
        expect(beastToStake.isSoulbound).toBe(false);

        // Stake
        act(() => {
            result.current.handleStake(beastToStake.id);
        });

        expect(result.current.beasts[1].isStaked).toBe(true);
        expect(result.current.beasts[1].stakingStart).toBeDefined();

        // Fast forward time? We can't easily mock Date.now() inside the hook closure
        // without more complex mocking, but we can verify state change.

        // Unstake
        act(() => {
            result.current.handleUnstake(beastToStake.id);
        });

        expect(result.current.beasts[1].isStaked).toBe(false);
        // Rewards should have been claimed into wallet
        // Since no time passed, 0 rewards, but logic executed.
    });

    it('should simulate battle and grant rewards', async () => {
        const { result } = renderHook(() => useGameState());
        await waitFor(() => { expect(result.current.beasts.length).toBeGreaterThanOrEqual(1); });

        const beast = result.current.beasts[0];
        const initialCoins = result.current.coins;
        const initialExp = beast.exp;

        let battleResult;
        await act(async () => {
            battleResult = await result.current.handleBattle(beast);
        });

        expect(battleResult).toBeDefined();
        if (battleResult.winnerId === beast.id) {
            expect(result.current.coins).toBeGreaterThan(initialCoins);
            expect(result.current.beasts[0].exp).toBeGreaterThan(initialExp);
        }

        // Verify logs exist
        expect(battleResult.logs.length).toBeGreaterThan(0);
    });
});
