
import { GoogleGenAI } from "@google/genai";
import { ZenBeast, Rarity, BeastClass, BattleResult, GymLeader, Trait } from '../types';
import { safeParseJSON } from '../utils';
import { getBreedingPrompt, getEvolutionPrompt, getBattlePrompt } from './prompts';
import { generateStableDiffusionImage } from './stableDiffusionService';
import { getRandomName, getRandomDescription, generateMockBattleLogs } from './mockData';

// Import the Hashlips Config
import hashlipsConfig from '../hashlips_config.json';

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

const generateId = () => Math.random().toString(36).substring(2, 9);

// --- HASHLIPS GENERATION LOGIC ---

interface HashlipsLayer {
    name: string;
    weight: number;
    rarity: string;
}

// Helper: Pick a random option from a layer based on weights defined in the JSON
const pickTraitFromConfig = (layerName: string): { name: string, rarity: string, weight: number } | null => {
  // Access the layers object dynamically
  const layerOptions = (hashlipsConfig.layers as any)[layerName] as HashlipsLayer[];
  
  if (!layerOptions) return null;

  const totalWeight = layerOptions.reduce((acc, opt) => acc + opt.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const opt of layerOptions) {
    if (random < opt.weight) return opt;
    random -= opt.weight;
  }
  return layerOptions[0]; // Fallback
};

// Generates the 12 traits programmatically using the Hashlips JSON config
const generateHashlipsTraits = (): { traits: Trait[], overallRarity: Rarity } => {
  const traits: Trait[] = [];
  let rarityScore = 0;

  const layersOrder = hashlipsConfig.layerConfigurations[0].layersOrder;

  layersOrder.forEach(layer => {
    const selected = pickTraitFromConfig(layer.name);
    if (selected) {
        traits.push({
            name: selected.name,
            value: selected.name,
            type: layer.name as any,
            rarity: 100 - selected.weight // Visual rarity score
        });

        // Calculate score for overall rarity
        if (selected.rarity === 'Zen Master') rarityScore += 50;
        else if (selected.rarity === 'Legendary') rarityScore += 20;
        else if (selected.rarity === 'Epic') rarityScore += 10;
        else if (selected.rarity === 'Rare') rarityScore += 5;
        else if (selected.rarity === 'Uncommon') rarityScore += 2;
        else rarityScore += 1;
    }
  });

  // Determine overall rarity based on the sum of trait scores
  let overallRarity = Rarity.COMMON;
  if (rarityScore > 100) overallRarity = Rarity.ZEN_MASTER;
  else if (rarityScore > 60) overallRarity = Rarity.LEGENDARY;
  else if (rarityScore > 40) overallRarity = Rarity.EPIC;
  else if (rarityScore > 25) overallRarity = Rarity.RARE;
  else if (rarityScore > 15) overallRarity = Rarity.UNCOMMON;

  return { traits, overallRarity };
};

// --- END HASHLIPS LOGIC ---

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
    console.error("Generation failed", error);
    throw error;
  }
};

const mixTraits = (parentA: ZenBeast, parentB: ZenBeast): { traits: Trait[], overallRarity: Rarity } => {
  const childTraits: Trait[] = [];
  let rarityScore = 0;
  const layersOrder = hashlipsConfig.layerConfigurations[0].layersOrder;

  // Map traits by type for easier access
  const traitsA = new Map(parentA.traits.map(t => [t.type, t]));
  const traitsB = new Map(parentB.traits.map(t => [t.type, t]));

  layersOrder.forEach(layer => {
    const layerName = layer.name;
    const traitA = traitsA.get(layerName as any);
    const traitB = traitsB.get(layerName as any);

    let selectedTrait: Trait | null = null;
    const mutationChance = 0.1; // 10% chance to mutate

    if (Math.random() < mutationChance) {
      // Mutation: Pick a random new trait
      const picked = pickTraitFromConfig(layerName);
      if (picked) {
        selectedTrait = {
          name: picked.name,
          value: picked.name,
          type: layerName as any,
          rarity: 100 - picked.weight
        };
      }
    } else {
      // Inheritance
      if (traitA && traitB) {
        // Both parents have it: 50/50
        selectedTrait = Math.random() < 0.5 ? traitA : traitB;
      } else if (traitA) {
        selectedTrait = traitA;
      } else if (traitB) {
        selectedTrait = traitB;
      } else {
        // Neither has it, try to pick one (mutation fallback) or skip
        const picked = pickTraitFromConfig(layerName);
        if (picked) {
            selectedTrait = {
              name: picked.name,
              value: picked.name,
              type: layerName as any,
              rarity: 100 - picked.weight
            };
        }
      }
    }

    if (selectedTrait) {
      childTraits.push(selectedTrait);
      // Rarity Calculation Logic from generateHashlipsTraits
      // We need to reverse-engineer the weight or just use the visual rarity score we stored
      // But generateHashlipsTraits uses string checking on the 'rarity' field of the config object,
      // which we don't strictly have here unless we look it up or store it.
      // However, trait.rarity is a number (1-100).
      // Let's approximate score based on the numeric rarity we have.
      // Or, we can re-find the config object to be precise.

      const layerOptions = (hashlipsConfig.layers as any)[layerName] as HashlipsLayer[];
      const configObj = layerOptions?.find(opt => opt.name === selectedTrait!.name);

      if (configObj) {
         if (configObj.rarity === 'Zen Master') rarityScore += 50;
         else if (configObj.rarity === 'Legendary') rarityScore += 20;
         else if (configObj.rarity === 'Epic') rarityScore += 10;
         else if (configObj.rarity === 'Rare') rarityScore += 5;
         else if (configObj.rarity === 'Uncommon') rarityScore += 2;
         else rarityScore += 1;
      } else {
          rarityScore += 1;
      }
    }
  });

  // Determine overall rarity based on the sum of trait scores
  let overallRarity = Rarity.COMMON;
  if (rarityScore > 100) overallRarity = Rarity.ZEN_MASTER;
  else if (rarityScore > 60) overallRarity = Rarity.LEGENDARY;
  else if (rarityScore > 40) overallRarity = Rarity.EPIC;
  else if (rarityScore > 25) overallRarity = Rarity.RARE;
  else if (rarityScore > 15) overallRarity = Rarity.UNCOMMON;

  return { traits: childTraits, overallRarity };
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
    const { traits: childTraits, overallRarity: childRarity } = mixTraits(parentA, parentB);

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
