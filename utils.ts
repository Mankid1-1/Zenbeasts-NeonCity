
import { ZenBeast, BeastClass, Rarity } from './types';

export const safeParseJSON = <T>(text: string, fallback: T): T => {
  try {
    // Strip markdown code blocks if present (e.g. ```json ... ```)
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as T;
  } catch (e) {
    console.warn("JSON Parse Error, using fallback", e);
    return fallback;
  }
};

export const loadState = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    // If parsed is null/undefined (bad data), return default
    const parsed = saved ? JSON.parse(saved) : defaultValue;
    return parsed !== null && parsed !== undefined ? parsed : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export const saveState = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage Save Error", e);
  }
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
};

/**
 * SECURITY: Use crypto.randomUUID for secure ID generation instead of Math.random
 * Fallback for environments where crypto is not available (though widely supported now)
 */
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback (less secure, but better than nothing for legacy/test envs)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * SECURITY: Generate cryptographically secure hex strings
 * Uses crypto.getRandomValues instead of Math.random
 */
export const generateSecureHex = (length: number): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback for environments without crypto
  return Array.from({ length }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
};

export const sanitizeZenBeast = (data: any): ZenBeast => {
  if (!data || typeof data !== 'object') {
    data = {};
  }

  const defaultStats = { attack: 10, defense: 10, speed: 10, zen: 10 };
  const stats = data.stats && typeof data.stats === 'object' ? {
    attack: typeof data.stats.attack === 'number' && data.stats.attack >= 0 ? data.stats.attack : defaultStats.attack,
    defense: typeof data.stats.defense === 'number' && data.stats.defense >= 0 ? data.stats.defense : defaultStats.defense,
    speed: typeof data.stats.speed === 'number' && data.stats.speed >= 0 ? data.stats.speed : defaultStats.speed,
    zen: typeof data.stats.zen === 'number' && data.stats.zen >= 0 ? data.stats.zen : defaultStats.zen,
  } : defaultStats;

  const validClasses = Object.values(BeastClass);
  const beastClass = validClasses.includes(data.class) ? data.class : BeastClass.TIGER;

  const validRarities = Object.values(Rarity);
  const rarity = validRarities.includes(data.rarity) ? data.rarity : Rarity.COMMON;

  return {
    id: typeof data.id === 'string' ? data.id : `beast-${generateUUID()}`,
    name: typeof data.name === 'string' ? data.name : 'Unknown Beast',
    description: typeof data.description === 'string' ? data.description : 'A mysterious creature.',
    class: beastClass,
    rarity: rarity,
    level: typeof data.level === 'number' && data.level >= 1 ? data.level : 1,
    exp: typeof data.exp === 'number' && data.exp >= 0 ? data.exp : 0,
    stats: stats,
    traits: Array.isArray(data.traits) ? data.traits : [],
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : 'https://via.placeholder.com/400',
    generation: typeof data.generation === 'number' && data.generation >= 0 ? data.generation : 0,
    obtainedAt: typeof data.obtainedAt === 'number' ? data.obtainedAt : Date.now(),
    isStaked: !!data.isStaked,
    stakingStart: typeof data.stakingStart === 'number' ? data.stakingStart : undefined,
    accumulatedRewards: typeof data.accumulatedRewards === 'number' && data.accumulatedRewards >= 0 ? data.accumulatedRewards : undefined,
    isSoulbound: !!data.isSoulbound,
    isOnChain: !!data.isOnChain,
    ownerId: typeof data.ownerId === 'string' ? data.ownerId : 'player',
    price: (typeof data.price === 'number' && data.price > 0) ? data.price : undefined,
    originalOwner: typeof data.originalOwner === 'string' ? data.originalOwner : undefined,
  };
};
