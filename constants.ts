import { ZenBeast, Rarity, BeastClass, GymLeader, LeaderboardEntry, TrainerPerk, Achievement, Quest } from './types';

// Economy Constants
export const INITIAL_ZEN_COINS = 100; // Low starting soft currency for F2P
export const BASE_MINT_PRICE = 500; // Cost in ZenCoins
export const MINT_COST_ZEN = 10; // Cost in Hard Currency (ZEN) if bypassing grind
export const BREEDING_COST = 50;
export const EVOLUTION_COST = 200;

export const TOKENOMICS = {
  TOTAL_SUPPLY: 100_000_000,
  SWAP_RATE: 0.01, // 100 ZenCoins = 1 ZEN
  CLAIM_THRESHOLD: 1000, // Minimum ZenCoins required to bridge to ZEN
  GAS_FEES: {
    solana: 0.0005, // ZEN
    polygon: 0.01 // ZEN
  },
  LISTING_TAX: {
    solana: 0.02, // 2%
    polygon: 0.05 // 5%
  }
};

// Feature Unlocks (Trainer Level)
export const MAP_UNLOCKS = {
    DASHBOARD: 1,
    INVENTORY: 1,
    BATTLE: 2,     // Unlocks at Level 2
    BREEDING: 3,   // Unlocks at Level 3
    BANK: 4,       // Unlocks at Level 4
    MARKET: 5      // Unlocks at Level 5
};

// Staking APY (ZEN per Hour equivalent)
export const STAKING_RATES = {
    [Rarity.COMMON]: 0.1,
    [Rarity.UNCOMMON]: 0.3,
    [Rarity.RARE]: 0.8,
    [Rarity.EPIC]: 2.0,
    [Rarity.LEGENDARY]: 5.0,
    [Rarity.ZEN_MASTER]: 12.0
};

export const GENESIS_MULTIPLIER = 1.5; // Gen 0 beasts earn 50% more

export const RARITY_COLORS = {
  [Rarity.COMMON]: 'text-gray-400 border-gray-400',
  [Rarity.UNCOMMON]: 'text-green-400 border-green-400',
  [Rarity.RARE]: 'text-blue-400 border-blue-400',
  [Rarity.EPIC]: 'text-purple-400 border-purple-400',
  [Rarity.LEGENDARY]: 'text-yellow-400 border-yellow-400',
  [Rarity.ZEN_MASTER]: 'text-neon-pink border-neon-pink shadow-[0_0_10px_#ff00ff]',
};

export const LEVEL_THRESHOLDS: { [key: number]: number } = {
  1: 0,
  2: 200,   
  3: 500,   
  4: 1000,  
  5: 2000,  
  6: 5000   
};

export const TRAINER_PERKS: TrainerPerk[] = [
  {
    id: 'perk_mining_1',
    name: 'Neural Mining',
    description: '+10% Passive Staking Income',
    unlockLevel: 2,
    effectType: 'mining_boost',
    value: 0.1
  },
  {
    id: 'perk_mint_1',
    name: 'Syndicate Discount',
    description: 'Minting cost reduced by 15%',
    unlockLevel: 3,
    effectType: 'mint_discount',
    value: 0.15
  },
  {
    id: 'perk_battle_1',
    name: 'Combat Protocol',
    description: '+20% EXP from Battles',
    unlockLevel: 4,
    effectType: 'battle_exp',
    value: 0.2
  },
  {
    id: 'perk_mining_2',
    name: 'Quantum Mining',
    description: 'Additional +20% Passive Staking Income',
    unlockLevel: 5,
    effectType: 'mining_boost',
    value: 0.2
  }
];

export const ACHIEVEMENTS_LIST: Omit<Achievement, 'unlocked'>[] = [
  {
    id: 'ach_first_blood',
    title: 'First Blood',
    description: 'Win your first battle.',
    icon: 'Sword',
    condition: (state) => state.leaderboard.find((e: any) => e.name === 'Player')?.wins >= 1
  },
  {
    id: 'ach_collector',
    title: 'Collector',
    description: 'Own 5 ZenBeasts.',
    icon: 'Box',
    condition: (state) => state.beasts.length >= 5
  },
  {
    id: 'ach_breeder',
    title: 'Geneticist',
    description: 'Breed a Generation 2 Beast.',
    icon: 'Dna',
    condition: (state) => state.beasts.some((b: ZenBeast) => b.generation >= 2)
  },
  {
    id: 'ach_tycoon',
    title: 'Neon Tycoon',
    description: 'Amass 1000 ZenCoins.',
    icon: 'Coins',
    condition: (state) => state.coins >= 1000
  },
  {
    id: 'ach_legend',
    title: 'Living Legend',
    description: 'Own a Legendary Beast.',
    icon: 'Crown',
    condition: (state) => state.beasts.some((b: ZenBeast) => b.rarity === Rarity.LEGENDARY)
  }
];

export const DAILY_CONTRACTS: Quest[] = [
    {
        id: 'daily_battle',
        title: 'Street Brawler',
        description: 'Win 3 battles in the Arena.',
        type: 'battle_win',
        target: 3,
        current: 0,
        rewardCoins: 50,
        rewardExp: 25,
        completed: false,
        claimed: false
    },
    {
        id: 'daily_earn',
        title: 'Crypto Miner',
        description: 'Earn 100 ZenCoins from any source.',
        type: 'earn_coins',
        target: 100,
        current: 0,
        rewardCoins: 25,
        rewardExp: 10,
        completed: false,
        claimed: false
    },
    {
        id: 'daily_breed',
        title: 'Life Creator',
        description: 'Breed or Mint 1 new ZenBeast.',
        type: 'mint', // Shared for breed/mint for simplicity
        target: 1,
        current: 0,
        rewardCoins: 100,
        rewardExp: 50,
        completed: false,
        claimed: false
    }
];

// Replaced Mock beasts with Starter logic in hook, but keeping this for structure
export const MOCK_BEASTS: ZenBeast[] = []; 

export const GYM_LEADERS: GymLeader[] = [
  {
    id: 'gym-1',
    name: 'Initiate Kai',
    title: 'The Gatekeeper',
    difficulty: 1,
    description: 'A novice master of the basic forms. Good for training.',
    avatarUrl: 'https://picsum.photos/seed/kai/200',
    badge: 'Stone Lotus',
    rewardCoins: 50,
    team: [
      {
        id: 'gym-1-b1', name: 'Stone Monkey', description: '', class: BeastClass.MONKEY, rarity: Rarity.COMMON, level: 3, exp: 0, generation: 0, isStaked: false, isSoulbound: false, isOnChain: false, ownerId: 'gym', obtainedAt: 0,
        stats: { attack: 40, defense: 40, speed: 60, zen: 20 }, traits: [], imageUrl: 'https://picsum.photos/seed/monkey/200'
      }
    ]
  },
  {
    id: 'gym-2',
    name: 'Sifu Neon',
    title: 'Techno Sage',
    difficulty: 3,
    description: 'Combines ancient wisdom with overclocked circuitry.',
    avatarUrl: 'https://picsum.photos/seed/sifu/200',
    badge: 'Circuit Scroll',
    rewardCoins: 200,
    team: [
      {
        id: 'gym-2-b1', name: 'Volt Tiger', description: '', class: BeastClass.TIGER, rarity: Rarity.RARE, level: 10, exp: 0, generation: 0, isStaked: false, isSoulbound: false, isOnChain: false, ownerId: 'gym', obtainedAt: 0,
        stats: { attack: 85, defense: 60, speed: 70, zen: 50 }, traits: [], imageUrl: 'https://picsum.photos/seed/tiger/200'
      }
    ]
  },
  {
    id: 'gym-3',
    name: 'Grandmaster Void',
    title: 'The Unseen',
    difficulty: 5,
    description: 'A legend who has transcended the digital plane.',
    avatarUrl: 'https://picsum.photos/seed/void/200',
    badge: 'Null Star',
    rewardCoins: 1000,
    team: [
      {
        id: 'gym-3-b1', name: 'Celestial Dragon', description: '', class: BeastClass.DRAGON, rarity: Rarity.LEGENDARY, level: 50, exp: 0, generation: 0, isStaked: false, isSoulbound: false, isOnChain: false, ownerId: 'gym', obtainedAt: 0,
        stats: { attack: 150, defense: 120, speed: 100, zen: 200 }, traits: [], imageUrl: 'https://picsum.photos/seed/dragon/200'
      }
    ]
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'CyberRonin99', score: 9500, wins: 142 },
  { rank: 2, name: 'ZenMasterX', score: 8200, wins: 98 },
  { rank: 3, name: 'CryptoMonk', score: 7100, wins: 85 },
  { rank: 4, name: 'PixelSamurai', score: 6400, wins: 62 },
  { rank: 5, name: 'NeuralNetWalker', score: 5000, wins: 45 },
];

export const INITIAL_MARKET_LISTINGS: ZenBeast[] = [
  {
    id: 'mkt-1',
    name: 'Lotus Viper',
    description: 'Serpent of the digital garden.',
    class: BeastClass.SNAKE,
    rarity: Rarity.UNCOMMON,
    level: 10,
    exp: 0,
    generation: 1,
    isStaked: false,
    isSoulbound: false,
    isOnChain: true,
    ownerId: 'market',
    obtainedAt: 0,
    price: 350, // Listed in ZEN Tokens (simulated as high value)
    stats: { attack: 110, defense: 40, speed: 80, zen: 90 },
    imageUrl: 'https://picsum.photos/seed/viper/300/300',
    traits: [{ name: 'Skin', value: 'Holographic Scales', rarity: 40, type: 'Body' }]
  },
  {
    id: 'mkt-2',
    name: 'Shogun Ox',
    description: 'Heavy armored ox with a feudal helmet.',
    class: BeastClass.OX,
    rarity: Rarity.EPIC,
    level: 25,
    exp: 0,
    generation: 2,
    isStaked: false,
    isSoulbound: false,
    isOnChain: true,
    ownerId: 'market',
    obtainedAt: 0,
    price: 1200,
    stats: { attack: 80, defense: 150, speed: 20, zen: 60 },
    imageUrl: 'https://picsum.photos/seed/ox/300/300',
    traits: [{ name: 'Head', value: 'Kabuto Helmet', rarity: 90, type: 'Headgear' }]
  }
];