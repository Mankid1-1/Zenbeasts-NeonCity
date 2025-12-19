
import { ZenBeast, Rarity, BeastClass, Trait, Stats } from '../types';
import hashlipsConfig from '../hashlips_config.json';
import { generateStableDiffusionImage } from './stableDiffusionService';
import { getRandomName, getRandomDescription } from './mockData';

// --- TYPES FOR HASHLIPS CONFIG ---
interface HashlipsLayer {
    id: number;
    name: string;
    weight: number;
    rarity: string;
}

// --- GENERATION LOGIC ---

// Helper: Pick a random option from a layer based on weights defined in the JSON
const pickTraitFromConfig = (layerName: string): { name: string, rarity: string, weight: number } | null => {
  const layerOptions = (hashlipsConfig.layers as any)[layerName] as HashlipsLayer[];

  if (!layerOptions) return null;

  const totalWeight = layerOptions.reduce((acc, opt) => acc + opt.weight, 0);
  let random = Math.random() * totalWeight;

  for (const opt of layerOptions) {
    if (random < opt.weight) return { ...opt };
    random -= opt.weight;
  }
  return { ...layerOptions[0] }; // Fallback
};

// Generates the 12 traits programmatically
const generateHashlipsTraits = (): { traits: Trait[], overallRarity: Rarity, rarityScore: number } => {
  const traits: Trait[] = [];
  let rarityScore = 0;

  const layersOrder = hashlipsConfig.layerConfigurations[0].layersOrder;

  layersOrder.forEach(layer => {
    const selected = pickTraitFromConfig(layer.name);
    if (selected) {
        // Calculate a "rarity score" for the trait (100 - weight roughly maps to scarcity)
        const visualRarityScore = 100 - selected.weight;

        traits.push({
            name: selected.name,
            value: selected.name,
            type: layer.name as any,
            rarity: visualRarityScore
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

  return { traits, overallRarity, rarityScore };
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const calculateStats = (rarity: Rarity): Stats => {
    // Base stats by rarity
    let base = 10;
    switch (rarity) {
        case Rarity.ZEN_MASTER: base = 50; break;
        case Rarity.LEGENDARY: base = 40; break;
        case Rarity.EPIC: base = 30; break;
        case Rarity.RARE: base = 20; break;
        case Rarity.UNCOMMON: base = 15; break;
        case Rarity.COMMON: base = 10; break;
    }

    // Add variance (0 to 15)
    const variance = () => Math.floor(Math.random() * 16);

    return {
        attack: base + variance(),
        defense: base + variance(),
        speed: base + variance(),
        zen: base + variance()
    };
};

export const generateZenBeast = async (generation: number): Promise<ZenBeast> => {
    // 1. Generate Traits & Rarity
    const { traits, overallRarity } = generateHashlipsTraits();

    // 2. Pick Class
    const classes = Object.values(BeastClass);
    const selectedClass = classes[Math.floor(Math.random() * classes.length)];

    // 3. Generate Image
    const imageUrl = await generateStableDiffusionImage(selectedClass, traits);

    // 4. Generate Stats
    const stats = calculateStats(overallRarity);

    // 5. Generate Name & Desc
    const name = getRandomName(selectedClass);
    const description = getRandomDescription();

    return {
        id: generateId(),
        name,
        description,
        class: selectedClass,
        rarity: overallRarity,
        level: 1,
        exp: 0,
        generation,
        obtainedAt: Date.now(),
        isStaked: false,
        isSoulbound: false,
        isOnChain: false,
        ownerId: 'player',
        stats,
        traits,
        imageUrl
    };
};

// --- BREEDING LOGIC ---

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

        // Re-calculate rarity contribution
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
    const newGen = Math.max(parentA.generation, parentB.generation) + 1;

    // 1. Determine Child Class
    let childClass: BeastClass;
    if (parentA.class === parentB.class) {
      childClass = parentA.class;
    } else {
      childClass = Math.random() < 0.5 ? parentA.class : parentB.class;
    }

    // 2. Mix Traits
    const { traits: childTraits, overallRarity } = mixTraits(parentA, parentB);

    // 3. Generate Image
    const imageUrl = await generateStableDiffusionImage(childClass, childTraits);

    // 4. Stats: Average + Random Variance (-5 to +5)
    const avg = (a: number, b: number) => Math.floor((a + b) / 2);
    const variance = () => Math.floor(Math.random() * 11) - 5; // -5 to 5

    const stats = {
        attack: Math.max(1, avg(parentA.stats.attack, parentB.stats.attack) + variance()),
        defense: Math.max(1, avg(parentA.stats.defense, parentB.stats.defense) + variance()),
        speed: Math.max(1, avg(parentA.stats.speed, parentB.stats.speed) + variance()),
        zen: Math.max(1, avg(parentA.stats.zen, parentB.stats.zen) + variance())
    };

    return {
        id: generateId(),
        name: `${getRandomName(childClass)} (Gen ${newGen})`,
        description: `Offspring of ${parentA.name} and ${parentB.name}.`,
        class: childClass,
        rarity: overallRarity,
        level: 1,
        exp: 0,
        generation: newGen,
        obtainedAt: Date.now(),
        isStaked: false,
        isSoulbound: false,
        isOnChain: false,
        ownerId: 'player',
        stats,
        traits: childTraits,
        imageUrl
    };
};

export const evolveZenBeast = async (original: ZenBeast): Promise<ZenBeast> => {
    // Evolution adds "Alpha" prefix, boosts stats, and maybe changes a trait
    const boost = 20;

    // Simple Trait Evolution: Append "Ascended" to Aura if possible?
    // Or just keep traits same but regenerate image?
    // Let's regenerate image to reflect "Evolution" (maybe the prompt in Stable Diffusion changes implicitly by us adding 'Evolved' keyword?
    // Actually the SD service uses traits. Let's modify a trait to be "Evolved".

    const evolvedTraits = original.traits.map(t => {
        if (t.type === 'Aura' && t.value === 'None') {
            return { ...t, value: 'Golden Aura', name: 'Golden Aura', rarity: 80 }; // Force an aura
        }
        return t;
    });

    const imageUrl = await generateStableDiffusionImage(original.class, evolvedTraits);

    return {
        ...original,
        name: `Ascended ${original.name}`,
        rarity: Rarity.EPIC, // Force upgrade rarity? Or +1 step?
        stats: {
            attack: original.stats.attack + boost,
            defense: original.stats.defense + boost,
            speed: original.stats.speed + boost,
            zen: original.stats.zen + boost,
        },
        traits: evolvedTraits,
        imageUrl
    };
};
