
import { GoogleGenAI } from "@google/genai";
import { ZenBeast, Rarity, BeastClass, BattleResult, GymLeader, Trait } from '../types';
import { safeParseJSON, generateUUID } from '../utils';
import { getBreedingPrompt, getEvolutionPrompt, getBattlePrompt } from './prompts';
import { generateStableDiffusionImage } from './stableDiffusionService';
import { getRandomName, getRandomDescription, generateMockBattleLogs } from './mockData';
import { generateHashlipsTraits, mixTraits } from '../domain/beasts';

// --- API KEY MANAGEMENT & MOCK MODE ---
const getGeminiApiKey = (): string => {
  // Check if running in a browser environment before accessing localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY || '';
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

const GEMINI_API_KEY = getGeminiApiKey();
const MOCK_MODE = !GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const modelName = 'gemini-2.5-flash';

// SECURITY: Use stronger ID generation
const generateId = () => generateUUID();

// Trait + breeding logic now lives in src-domain `domain/beasts/` so the same
// pure functions can drive both the legacy client path and the upcoming
// Cloudflare Worker BFF. Anything imported from there is safe to call on the
// server with no DOM/fetch dependencies.

export const generateZenBeast = async (generation: number): Promise<ZenBeast> => {
  // --- MOCK MODE ---
  if (MOCK_MODE) {
    console.warn("⚠️ MOCK MODE ACTIVE: API Key missing. Simulating beast generation with local data.");
    const { traits, overallRarity } = generateHashlipsTraits();
    const selectedClass = Object.values(BeastClass)[Math.floor(Math.random() * Object.values(BeastClass).length)];
    const imageUrl = await generateStableDiffusionImage(selectedClass, traits);

    // Better Stats Randomization based on rarity
    const baseStat = overallRarity === Rarity.LEGENDARY ? 40 : overallRarity === Rarity.EPIC ? 30 : 20;
    const randomStat = () => baseStat + Math.floor(Math.random() * 15);

    return {
        id: generateId(),
        name: getRandomName(selectedClass),
        description: getRandomDescription(),
        class: selectedClass,
        rarity: overallRarity,
        level: 1, exp: 0, generation: 0, obtainedAt: Date.now(),
        isStaked: false, isSoulbound: false, isOnChain: false,
        ownerId: 'player',
        stats: { attack: randomStat(), defense: randomStat(), speed: randomStat(), zen: randomStat() },
        traits: traits,
        imageUrl: imageUrl,
    };
  }

  try {
    // 1. Generate Traits Deterministically via Hashlips Config
    const { traits, overallRarity } = generateHashlipsTraits();
    
    // 2. Pick a Random Class
    const classes = Object.values(BeastClass);
    const selectedClass = classes[Math.floor(Math.random() * classes.length)];

    // 3. Generate Image via Stable Diffusion (Simulation/API)
    // We pass the deterministic traits to SD to get the matching visual
    const imageUrl = await generateStableDiffusionImage(selectedClass, traits);

    // 4. Construct Prompt for Gemini to Describe the Beast based on these fixed traits
    const prompt = `
      I have generated a ZenBeast with the following specific traits. 
      Class: ${selectedClass}
      Rarity: ${overallRarity}
      Traits: ${JSON.stringify(traits.map(t => `${t.type}: ${t.value}`))}

      Your task is to:
      1. Generate a creative Name that fits these traits.
      2. Write a 2-sentence Description.
      3. Generate stats (Attack, Defense, Speed, Zen) appropriate for a ${overallRarity} ${selectedClass}.
      
      Output JSON only:
      {
        "name": "string",
        "description": "string",
        "stats": { "attack": number, "defense": number, "speed": number, "zen": number }
      }
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const fallback: Partial<ZenBeast> = {
      name: `Glitch ${selectedClass}`, 
      description: "Data corruption during synthesis.", 
      stats: {attack:10, defense:10, speed:10, zen:10}
    };
    
    const data = safeParseJSON(response.text || '{}', fallback);
    
    return {
      id: generateId(),
      name: data.name || `Unnamed ${selectedClass}`,
      description: data.description || "A mysterious entity.",
      class: selectedClass,
      rarity: overallRarity,
      level: 1,
      exp: 0,
      generation: generation,
      obtainedAt: Date.now(),
      isStaked: false,
      isSoulbound: false,
      isOnChain: false,
      ownerId: 'player',
      stats: data.stats || { attack: 10, defense: 10, speed: 10, zen: 10 },
      traits: traits,
      imageUrl: imageUrl
    };
  } catch (error) {
    // SECURITY: Log only the message to prevent potential leakage of config/keys in full error objects
    console.error("Generation failed", error instanceof Error ? error.message : "Unknown error");
    throw error;
  }
};

export const breedZenBeasts = async (parentA: ZenBeast, parentB: ZenBeast): Promise<ZenBeast> => {
    // --- MOCK MODE ---
  if (MOCK_MODE) {
    console.warn("MOCK MODE: Simulating breeding.");
    const childClass = parentA.class;
    // Simple trait mixing for mock mode
    const childTraits = parentA.traits.slice(0, 6).concat(parentB.traits.slice(6, 12));
    const imageUrl = await generateStableDiffusionImage(childClass, childTraits);

    const stats = {
        attack: Math.floor((parentA.stats.attack + parentB.stats.attack) / 2) + Math.floor(Math.random() * 5),
        defense: Math.floor((parentA.stats.defense + parentB.stats.defense) / 2) + Math.floor(Math.random() * 5),
        speed: Math.floor((parentA.stats.speed + parentB.stats.speed) / 2) + Math.floor(Math.random() * 5),
        zen: Math.floor((parentA.stats.zen + parentB.stats.zen) / 2) + Math.floor(Math.random() * 5)
    };

    return {
        id: generateId(),
        name: `${getRandomName(childClass)} (Gen ${Math.max(parentA.generation, parentB.generation) + 1})`,
        description: "A hybrid born from simulated fusion.",
        class: childClass,
        rarity: Rarity.RARE, // Hybrids are at least Rare in mock
        level: 1, exp: 0, generation: Math.max(parentA.generation, parentB.generation) + 1, obtainedAt: Date.now(),
        isStaked: false, isSoulbound: false, isOnChain: false,
        ownerId: 'player',
        stats: stats,
        traits: childTraits,
        imageUrl: imageUrl
    };
  }

  try {
    const newGen = Math.max(parentA.generation, parentB.generation) + 1;

    // 1. Determine Child Class
    let childClass: BeastClass;
    if (parentA.class === parentB.class) {
      childClass = parentA.class;
    } else {
      childClass = Math.random() < 0.5 ? parentA.class : parentB.class;
    }

    // 2. Mix Traits
    const { traits: childTraits, overallRarity: childRarity } = mixTraits(parentA.traits, parentB.traits);

    // 3. Generate Image
    const imageUrl = await generateStableDiffusionImage(childClass, childTraits);

    // 4. Generate Description/Stats via Gemini
     const response = await ai.models.generateContent({
      model: modelName,
      contents: getBreedingPrompt(parentA, parentB, childClass, childTraits),
      config: { responseMimeType: "application/json" }
    });

    const fallback: Partial<ZenBeast> = { 
        name: "Hybrid Error", 
        description: "A genetic anomaly.", 
        stats: {
            attack: Math.floor((parentA.stats.attack + parentB.stats.attack)/2),
            defense: Math.floor((parentA.stats.defense + parentB.stats.defense)/2),
            speed: Math.floor((parentA.stats.speed + parentB.stats.speed)/2),
            zen: Math.floor((parentA.stats.zen + parentB.stats.zen)/2)
        }
    };

    const data = safeParseJSON(response.text || '{}', fallback);

    return {
      id: generateId(),
      name: data.name || "Hybrid",
      description: data.description || "A new life.",
      class: childClass,
      rarity: childRarity,
      level: 1,
      exp: 0,
      generation: newGen,
      obtainedAt: Date.now(),
      isStaked: false,
      isSoulbound: false,
      isOnChain: false,
      ownerId: 'player',
      stats: data.stats || fallback.stats!,
      traits: childTraits,
      imageUrl: imageUrl
    };
  } catch (e) {
    console.error("Breeding failed:", e);
    throw new Error("Breeding failed.");
  }
};

export const evolveZenBeast = async (original: ZenBeast): Promise<ZenBeast> => {
  // --- MOCK MODE ---
  if (MOCK_MODE) {
    console.warn("MOCK MODE: Simulating evolution.");
    const evolvedTraits = original.traits.map(t => ({...t, value: `Alpha ${t.value}`}));
    const imageUrl = await generateStableDiffusionImage(original.class, evolvedTraits);
    return {
        ...original,
        name: `Ascended ${original.name}`,
        rarity: Rarity.EPIC,
        stats: {
            attack: original.stats.attack + 25,
            defense: original.stats.defense + 25,
            speed: original.stats.speed + 25,
            zen: original.stats.zen + 25,
        },
        traits: evolvedTraits,
        imageUrl: imageUrl
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: getEvolutionPrompt(original),
      config: { responseMimeType: "application/json" }
    });

    const data = safeParseJSON(response.text || '{}', original);
    
    // Generate new image for evolved form
    const evolvedTraits = data.traits || original.traits;
    const imageUrl = await generateStableDiffusionImage(original.class, evolvedTraits);

    return {
      ...original,
      name: data.name || original.name,
      description: data.description || original.description,
      rarity: (data.rarity as Rarity) || original.rarity,
      stats: data.stats || original.stats,
      traits: evolvedTraits,
      imageUrl: imageUrl
    };
  } catch (e) {
    throw new Error("Evolution failed.");
  }
}

export const simulateBattle = async (playerBeast: ZenBeast, opponent: ZenBeast | GymLeader): Promise<BattleResult> => {
  // --- MOCK MODE ---
  if (MOCK_MODE) {
    console.warn("MOCK MODE: Simulating battle.");

    // Simple logic: higher stats win + random factor
    const playerPower = playerBeast.stats.attack + playerBeast.stats.speed;
    const oppPower = opponent.stats.attack + opponent.stats.speed;

    // Add randomness (-20% to +20%)
    const playerRoll = playerPower * (0.8 + Math.random() * 0.4);
    const oppRoll = oppPower * (0.8 + Math.random() * 0.4);

    const playerWon = playerRoll >= oppRoll;
    const winnerName = playerWon ? playerBeast.name : opponent.name;
    const loserName = playerWon ? opponent.name : playerBeast.name;

    const logs = generateMockBattleLogs(winnerName, loserName);

    return {
        winnerId: playerWon ? playerBeast.id : 'enemy',
        logs: logs,
        rewards: playerWon
            ? { exp: 50, zenCoins: 25, points: 10, trainerExp: 20 }
            : { exp: 10, zenCoins: 5, points: 0, trainerExp: 5 }
    };
  }

    let context = '';
    
    if ('team' in opponent) {
        context = `Epic Gym Battle against ${opponent.name}.`;
    } else {
        context = `Street fight in the neon slums.`;
    }

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: getBattlePrompt(playerBeast, opponent, context),
        config: { responseMimeType: "application/json" }
      });

      const fallback = { 
          winner: 'enemy', 
          logs: [{ turn: 1, actor: "System", action: "Error", description: "Battle simulation corrupted.", damage: 0 }], 
          rewards: { exp: 0, zenCoins: 0, points: 0, trainerExp: 0 } 
      };

      const data = safeParseJSON(response.text || '{}', fallback);
      const playerWon = data.winner === 'player';

      // Boost rewards if Gym Leader
      let rewards = data.rewards || { exp: 10, zenCoins: 10, points: 5, trainerExp: 10 };
      if (rewards.trainerExp === undefined) rewards.trainerExp = 10;
      
      if ('team' in opponent && playerWon) {
          rewards.zenCoins = (rewards.zenCoins || 50) + opponent.rewardCoins;
          rewards.points = (rewards.points || 10) + 50;
          rewards.trainerExp = (rewards.trainerExp || 10) + 40;
      }

      return {
        winnerId: playerWon ? playerBeast.id : 'enemy',
        logs: data.logs || [],
        rewards: playerWon ? rewards : { exp: 5, zenCoins: 0, points: 0, trainerExp: 5 }
      };

    } catch (e) {
      console.error(e);
      return {
        winnerId: 'enemy',
        logs: [{ turn: 1, actor: "System", action: "Error", description: "Battle simulation interrupted.", damage: 0 }],
        rewards: { exp: 0, zenCoins: 0, points: 0, trainerExp: 0 }
      };
    }
};
