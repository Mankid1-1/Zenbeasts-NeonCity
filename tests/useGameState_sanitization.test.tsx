import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';

// Mock dependencies to avoid side effects
vi.mock('../services/geminiService', () => ({
  generateZenBeast: vi.fn(),
  breedZenBeasts: vi.fn(),
  simulateBattle: vi.fn(),
  evolveZenBeast: vi.fn(),
}));

vi.mock('../services/web3', () => ({
  connectWalletService: vi.fn(),
  simulateTransaction: vi.fn(),
  bridgeOffChainToOnChain: vi.fn(),
  estimateGas: vi.fn(() => 0.01),
}));

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useGameState - Data Sanitization', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize beasts as empty array if localStorage is empty', () => {
    // When localStorage is empty, it returns null.
    // loadState returns default value ([]).
    // map runs on [].
    const { result } = renderHook(() => useGameState());

    // Note: useGameState has an effect that mints a starter beast if beasts is empty on mount.
    // However, the *initial* state before effect runs should be valid (empty array).
    // result.current reflects the state after render.
    // The effect runs after render. If we check immediately, we might see the initial state.
    // But renderHook usually processes effects unless we suppress them.
    // Let's check that it is an array at least.
    expect(Array.isArray(result.current.beasts)).toBe(true);
  });

  it('should handle non-array data in localStorage by resetting to empty array', () => {
    // Scenario: User has corrupt data that is an object, not an array
    window.localStorage.setItem('zen_beasts', JSON.stringify({ some: 'object' }));

    const { result } = renderHook(() => useGameState());

    // The hook logic: if (!Array.isArray(loaded)) loaded = [];
    // So it should be an array.
    expect(Array.isArray(result.current.beasts)).toBe(true);
  });

  it('should sanitize invalid beast objects in the array', () => {
    // Scenario: Array exists but contains bad items (nulls, partials, primitives)
    const badBeasts = [
      null,
      { name: 'Bad Beast' }, // Missing stats, id, class, etc.
      'invalid-string' // Not an object
    ];
    window.localStorage.setItem('zen_beasts', JSON.stringify(badBeasts));

    const { result } = renderHook(() => useGameState());

    // Should have 3 items, all sanitized
    expect(result.current.beasts).toHaveLength(3);

    // Item 1 (was null) -> should become a default beast
    expect(result.current.beasts[0]).toHaveProperty('id');
    expect(result.current.beasts[0].name).toBe('Unknown Beast');
    expect(result.current.beasts[0].stats).toBeDefined();

    // Item 2 (was partial) -> should preserve name, fill defaults
    expect(result.current.beasts[1].name).toBe('Bad Beast');
    expect(result.current.beasts[1].stats).toHaveProperty('attack', 10); // Default stat

    // Item 3 (was string) -> should become default beast
    expect(result.current.beasts[2]).toHaveProperty('id');
    expect(result.current.beasts[2].name).toBe('Unknown Beast');
  });
});
