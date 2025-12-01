
export enum Rarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
  ZEN_MASTER = 'Zen Master'
}

export enum BeastClass {
  TIGER = 'Tiger',
  PANDA = 'Panda',
  CRANE = 'Crane',
  MANTIS = 'Mantis',
  MONKEY = 'Monkey',
  SNAKE = 'Snake',
  OX = 'Ox',
  DRAGON = 'Dragon'
}

export type Chain = 'solana' | 'polygon';

export interface Wallet {
  address: string | null;
  chain: Chain;
  zenBalance: number; // On-chain Hard Currency
  isConnected: boolean;
}

// Updated to the 12 specific hashlips layers
export type TraitType = 
  | 'Background' 
  | 'Aura' 
  | 'Body' 
  | 'Cybernetics' 
  | 'Clothes' 
  | 'Eyes' 
  | 'Mouth' 
  | 'Headgear' 
  | 'Weapon' 
  | 'Accessory' 
  | 'Element' 
  | 'Spirit';

export interface Trait {
  name: string; // The specific attribute name (e.g. "Laser Katana")
  value: string; // Same as name, kept for compatibility
  rarity: number; // 1-100 score
  type: TraitType;
}

export interface Stats {
  attack: number;
  defense: number;
  speed: number;
  zen: number; // Mana/Magic equivalent
}

export interface ZenBeast {
  id: string;
  name: string;
  description: string;
  class: BeastClass;
  rarity: Rarity;
  level: number;
  exp: number;
  stats: Stats;
  traits: Trait[];
  imageUrl: string; 
  generation: number;
  obtainedAt: number; // Timestamp for "New" badge
  isStaked: boolean;
  stakingStart?: number; // Timestamp
  accumulatedRewards?: number; // Pending ZEN
  isSoulbound: boolean; // Cannot be sold/transferred (Starter beasts)
  isOnChain: boolean; // True if bridged/minted to blockchain
  ownerId: string; // 'player', 'market', 'gym'
  price?: number; // If listed on market (in ZEN)
  originalOwner?: string; // Track who listed it
}

export interface BattleLog {
  turn: number;
  actor: string;
  action: string;
  damage?: number;
  description: string;
  isCritical?: boolean;
  effectiveness?: 'super' | 'not_very' | 'normal';
}

export interface BattleResult {
  winnerId: string;
  logs: BattleLog[];
  rewards: {
    exp: number;
    zenCoins: number; // Soft Currency
    points: number;
    trainerExp: number;
  };
}

export interface GymLeader {
  id: string;
  name: string;
  title: string;
  difficulty: number; // 1-5
  description: string;
  avatarUrl: string;
  team: ZenBeast[];
  badge: string;
  rewardCoins: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  wins: number;
}

export interface TrainerPerk {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  effectType: 'mint_discount' | 'mining_boost' | 'battle_exp';
  value: number; // e.g. 0.1 for 10%
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  condition: (state: any) => boolean;
  unlocked: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: 'battle_win' | 'mint' | 'breed' | 'earn_coins';
    target: number;
    current: number;
    rewardCoins: number;
    rewardExp: number;
    completed: boolean;
    claimed: boolean;
    lastUpdated?: number;
}

export interface EconomicMetrics {
    tokenPrice: number;
    totalStaked: number;
    volume24h: number;
    marketTrend: 'bull' | 'bear' | 'crab';
}
