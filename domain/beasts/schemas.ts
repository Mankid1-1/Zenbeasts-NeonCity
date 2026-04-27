import { z } from 'zod';
import { Rarity, BeastClass } from '../../types';

/**
 * Single source of truth for beast-domain shapes. Types in `../../types.ts`
 * are kept for legacy compatibility but should be derived from these schemas
 * going forward.
 */

export const RaritySchema = z.nativeEnum(Rarity);
export const BeastClassSchema = z.nativeEnum(BeastClass);

export const TraitTypeSchema = z.enum([
  'Background',
  'Aura',
  'Body',
  'Skin_Pattern',
  'Clothes',
  'Cybernetics',
  'Eyes',
  'Mouth',
  'Headgear',
  'Weapon',
  'Accessory',
  'Spirit_Projection',
]);

export const TraitSchema = z.object({
  name: z.string().min(1).max(64),
  value: z.string().min(1).max(64),
  rarity: z.number().int().min(0).max(100),
  type: TraitTypeSchema,
});

export const StatsSchema = z.object({
  attack: z.number().int().min(0).max(999),
  defense: z.number().int().min(0).max(999),
  speed: z.number().int().min(0).max(999),
  zen: z.number().int().min(0).max(999),
});

export const ZenBeastSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(48),
  description: z.string().max(512),
  class: BeastClassSchema,
  rarity: RaritySchema,
  level: z.number().int().min(1).max(100),
  exp: z.number().int().min(0),
  stats: StatsSchema,
  traits: z.array(TraitSchema).max(12),
  imageUrl: z.string(),
  generation: z.number().int().min(0),
  obtainedAt: z.number().int().nonnegative(),
  isStaked: z.boolean(),
  stakingStart: z.number().int().nonnegative().optional(),
  accumulatedRewards: z.number().nonnegative().optional(),
  isSoulbound: z.boolean(),
  isOnChain: z.boolean(),
  ownerId: z.string().min(1),
  price: z.number().nonnegative().optional(),
  originalOwner: z.string().optional(),
});

/** Shape returned by the AI when asked to describe a generated beast. */
export const AIBeastDescriptorSchema = z.object({
  name: z.string().min(1).max(48),
  description: z.string().min(1).max(512),
  stats: StatsSchema,
});

export type Trait = z.infer<typeof TraitSchema>;
export type Stats = z.infer<typeof StatsSchema>;
export type ZenBeast = z.infer<typeof ZenBeastSchema>;
export type AIBeastDescriptor = z.infer<typeof AIBeastDescriptorSchema>;
