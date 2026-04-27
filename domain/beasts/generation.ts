import hashlipsConfig from '../../hashlips_config.json';
import { Rarity } from '../../types';
import type { Trait } from './schemas';

/**
 * Pure trait + rarity generation. No I/O, no React, no fetch — safe to run
 * on the server, in tests, or in the browser. Extracted from the original
 * `services/geminiService.ts` so the same logic can drive both the legacy
 * client path and the upcoming Cloudflare Worker BFF.
 */

interface HashlipsLayer {
  name: string;
  weight: number;
  rarity: string;
}

const RARITY_SCORE: Record<string, number> = {
  'Zen Master': 50,
  Legendary: 20,
  Epic: 10,
  Rare: 5,
  Uncommon: 2,
  Common: 1,
};

const layerOptions = (layerName: string): HashlipsLayer[] | null => {
  const layers = hashlipsConfig.layers as Record<string, HashlipsLayer[] | undefined>;
  return layers[layerName] ?? null;
};

/** Weighted random pick from a layer's variant list. */
export const pickTraitFromConfig = (
  layerName: string
): HashlipsLayer | null => {
  const opts = layerOptions(layerName);
  if (!opts || opts.length === 0) return null;

  const totalWeight = opts.reduce((acc, opt) => acc + opt.weight, 0);
  let r = Math.random() * totalWeight;
  for (const opt of opts) {
    if (r < opt.weight) return opt;
    r -= opt.weight;
  }
  return opts[0];
};

/** Look up the config entry for a known trait value (used for breeding mixes). */
export const findTraitConfig = (
  layerName: string,
  variantName: string
): HashlipsLayer | null => {
  const opts = layerOptions(layerName);
  return opts?.find(o => o.name === variantName) ?? null;
};

const scoreFromRarityLabel = (label: string): number =>
  RARITY_SCORE[label] ?? 1;

const overallRarityFromScore = (score: number): Rarity => {
  if (score > 100) return Rarity.ZEN_MASTER;
  if (score > 60) return Rarity.LEGENDARY;
  if (score > 40) return Rarity.EPIC;
  if (score > 25) return Rarity.RARE;
  if (score > 15) return Rarity.UNCOMMON;
  return Rarity.COMMON;
};

const traitFromConfigEntry = (
  layerName: string,
  entry: HashlipsLayer
): Trait => ({
  name: entry.name,
  value: entry.name,
  type: layerName as Trait['type'],
  rarity: 100 - entry.weight,
});

/**
 * Generate a fresh set of 12 traits using the weighted hashlips config, plus
 * the overall rarity tier derived from the sum of trait rarity scores.
 */
export const generateHashlipsTraits = (): {
  traits: Trait[];
  overallRarity: Rarity;
} => {
  const traits: Trait[] = [];
  let score = 0;

  for (const { name } of hashlipsConfig.layerConfigurations[0].layersOrder) {
    const picked = pickTraitFromConfig(name);
    if (!picked) continue;
    traits.push(traitFromConfigEntry(name, picked));
    score += scoreFromRarityLabel(picked.rarity);
  }

  return { traits, overallRarity: overallRarityFromScore(score) };
};

/**
 * Mix two parents' traits to produce a child's traits. Per-layer:
 *   - 10% chance to mutate (random new variant)
 *   - otherwise inherit 50/50 from whichever parent has the trait
 *   - if neither parent has the trait, fall back to a random pick
 */
export const mixTraits = (
  parentATraits: Trait[],
  parentBTraits: Trait[]
): { traits: Trait[]; overallRarity: Rarity } => {
  const traits: Trait[] = [];
  let score = 0;

  const mapA = new Map(parentATraits.map(t => [t.type as string, t]));
  const mapB = new Map(parentBTraits.map(t => [t.type as string, t]));

  const MUTATION_RATE = 0.1;

  for (const { name: layerName } of hashlipsConfig.layerConfigurations[0].layersOrder) {
    const a = mapA.get(layerName);
    const b = mapB.get(layerName);

    let chosen: Trait | null = null;
    if (Math.random() < MUTATION_RATE) {
      const picked = pickTraitFromConfig(layerName);
      if (picked) chosen = traitFromConfigEntry(layerName, picked);
    } else if (a && b) {
      chosen = Math.random() < 0.5 ? a : b;
    } else if (a) {
      chosen = a;
    } else if (b) {
      chosen = b;
    } else {
      const picked = pickTraitFromConfig(layerName);
      if (picked) chosen = traitFromConfigEntry(layerName, picked);
    }

    if (!chosen) continue;
    traits.push(chosen);
    const cfg = findTraitConfig(layerName, chosen.value);
    score += cfg ? scoreFromRarityLabel(cfg.rarity) : 1;
  }

  return { traits, overallRarity: overallRarityFromScore(score) };
};
