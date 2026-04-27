/**
 * Public surface of the beasts domain. Outside code should import from here,
 * not from individual files.
 */

export {
  RaritySchema,
  BeastClassSchema,
  TraitTypeSchema,
  TraitSchema,
  StatsSchema,
  ZenBeastSchema,
  AIBeastDescriptorSchema,
} from './schemas';

export type {
  Trait,
  Stats,
  ZenBeast,
  AIBeastDescriptor,
} from './schemas';

export {
  pickTraitFromConfig,
  findTraitConfig,
  generateHashlipsTraits,
  mixTraits,
} from './generation';
