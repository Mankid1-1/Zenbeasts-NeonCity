
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
 sentinel-secure-random-fix-722868137078572014
 * SECURITY: Generate a cryptographically secure random hex string.
 * Uses window.crypto.getRandomValues where available.
 */
export const generateSecureHex = (length: number): string => {
  if (length <= 0) return '';
  const byteLength = Math.ceil(length / 2);
  const bytes = new Uint8Array(byteLength);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback for environments without crypto (should be rare in modern browsers)
    console.warn("Crypto API unavailable, using Math.random fallback");
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return hex.substring(0, length);
};

/**
 * SECURITY: Generate a cryptographically secure random alphanumeric string.
 */
export const generateSecureAlphaNumeric = (length: number): string => {
  if (length <= 0) return '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
        // modulo bias is negligible for this use case
        result += chars[values[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;

 * SECURITY: Use crypto.getRandomValues for secure hex string generation.
 * Replaces insecure Math.random().
 */
export const generateSecureHex = (length: number): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const byteLength = Math.ceil(length / 2);
    const array = new Uint8Array(byteLength);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, length);
  }
  // Fallback for environments without crypto (should be rare now)
  return Array(length).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

/**
 * SECURITY: Use crypto.getRandomValues for secure alphanumeric string generation.
 */
export const generateSecureAlphaNumeric = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => chars[b % chars.length])
      .join('');
  }
  // Fallback
  return Array(length).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
 ZenBeasts
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
