
import { describe, it, expect } from 'vitest';
import { sanitizeZenBeast } from '../utils';
import { ZenBeast, BeastClass, Rarity } from '../types';

describe('sanitizeZenBeast', () => {
  it('should return a default beast when input is null or undefined', () => {
    const result = sanitizeZenBeast(null);
    expect(result).toBeDefined();
    expect(result.name).toBe('Unknown Beast');
    expect(result.class).toBe(BeastClass.TIGER);
    expect(result.rarity).toBe(Rarity.COMMON);
    expect(result.stats).toEqual({ attack: 10, defense: 10, speed: 10, zen: 10 });
    expect(result.traits).toEqual([]);
    expect(result.isStaked).toBe(false);
  });

  it('should return a default beast when input is an empty object', () => {
    const result = sanitizeZenBeast({});
    expect(result).toBeDefined();
    expect(result.id).toMatch(/^beast-/);
    expect(result.name).toBe('Unknown Beast');
  });

  it('should preserve existing valid fields', () => {
    const input = {
      id: 'custom-id',
      name: 'Dragon King',
      class: BeastClass.DRAGON,
      rarity: Rarity.LEGENDARY,
      level: 50,
      exp: 1000,
      stats: { attack: 100, defense: 90, speed: 80, zen: 70 },
      traits: [{ name: 'Fire Breath', value: 'Fire Breath', rarity: 10, type: 'Element' }],
      imageUrl: 'http://example.com/dragon.png',
      generation: 1,
      obtainedAt: 1234567890,
      isStaked: true,
      isSoulbound: true,
      isOnChain: true,
      ownerId: '0x123'
    };

    const result = sanitizeZenBeast(input);
    expect(result).toEqual(expect.objectContaining(input));
  });

  it('should fill missing fields with defaults', () => {
    const input = {
      id: 'partial-id',
      name: 'Partial Beast'
    };

    const result = sanitizeZenBeast(input);
    expect(result.id).toBe('partial-id');
    expect(result.name).toBe('Partial Beast');
    expect(result.description).toBe('A mysterious creature.');
    expect(result.class).toBe(BeastClass.TIGER);
    expect(result.stats).toEqual({ attack: 10, defense: 10, speed: 10, zen: 10 });
  });

  it('should sanitize nested stats object', () => {
    const input = {
      stats: { attack: 50 } // Missing defense, speed, zen
    };

    const result = sanitizeZenBeast(input);
    expect(result.stats.attack).toBe(50);
    expect(result.stats.defense).toBe(10);
    expect(result.stats.speed).toBe(10);
    expect(result.stats.zen).toBe(10);
  });

  it('should handle invalid enum values by falling back to default', () => {
    const input = {
      class: 'InvalidClass',
      rarity: 'SuperRare'
    };

    const result = sanitizeZenBeast(input);
    expect(result.class).toBe(BeastClass.TIGER);
    expect(result.rarity).toBe(Rarity.COMMON);
  });

  it('should remove negative prices (Security Fix)', () => {
    const input = {
      price: -100,
      name: 'Exploit Beast'
    };
    const result = sanitizeZenBeast(input);
    expect(result.price).toBeUndefined();
  });
});
