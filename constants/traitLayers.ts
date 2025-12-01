
import { Rarity } from '../types';

export interface TraitOption {
  value: string;
  weight: number; // Higher number = more common. 1 = Zen Master rarity.
  rarityClass: Rarity;
}
export interface Layer {
  name: string;
  options: TraitOption[];
}

// The 12 Unique Trait Layers
export const TRAIT_LAYERS: Layer[] = [
  {
    name: "Background",
    options: [
      { value: "Slum Alley", weight: 50, rarityClass: Rarity.COMMON },
      { value: "Neon Market", weight: 40, rarityClass: Rarity.COMMON },
      { value: "Dojo Interior", weight: 30, rarityClass: Rarity.UNCOMMON },
      { value: "Cyber-Pagoda", weight: 20, rarityClass: Rarity.RARE },
      { value: "High-Rise Penthouse", weight: 10, rarityClass: Rarity.EPIC },
      { value: "Digital Void", weight: 5, rarityClass: Rarity.LEGENDARY },
      { value: "Nirvana Plane", weight: 1, rarityClass: Rarity.ZEN_MASTER }
    ]
  },
  {
    name: "Aura",
    options: [
      { value: "None", weight: 60, rarityClass: Rarity.COMMON },
      { value: "Static Glitch", weight: 30, rarityClass: Rarity.UNCOMMON },
      { value: "Steam Vents", weight: 20, rarityClass: Rarity.RARE },
      { value: "Neon Outline", weight: 10, rarityClass: Rarity.EPIC },
      { value: "Matrix Code", weight: 5, rarityClass: Rarity.LEGENDARY },
      { value: "Golden Enlightenment", weight: 1, rarityClass: Rarity.ZEN_MASTER }
    ]
  },
  {
    name: "Body",
    options: [
      { value: "Standard Organic", weight: 50, rarityClass: Rarity.COMMON },
      { value: "Scarneon Tattoos", weight: 30, rarityClass: Rarity.UNCOMMON },
      { value: "Heavy Fur/Scales", weight: 20, rarityClass: Rarity.RARE },
      { value: "Chrome Plating", weight: 10, rarityClass: Rarity.EPIC },
      { value: "Translucent Holo", weight: 5, rarityClass: Rarity.LEGENDARY },
      { value: "Pure Energy", weight: 1, rarityClass: Rarity.ZEN_MASTER }
    ]
  },
  {
    name: "Cybernetics",
    options: [
      { value: "None", weight: 40, rarityClass: Rarity.COMMON },
      { value: "Data Port", weight: 30, rarityClass: Rarity.UNCOMMON },
      { value: "Bionic Arm", weight: 20, rarityClass: Rarity.RARE },
      { value: "Exo-Spine", weight: 10, rarityClass: Rarity.EPIC },
      { value: "Full Mech Conversion", weight: 5, rarityClass: Rarity.LEGENDARY },
      { value: "Nanobot Swarm", weight: 1, rarityClass: Rarity.ZEN_MASTER }
    ]
  },
  {
    name: "Clothes",
    options: [
      { value: "Tattered Rags", weight: 50, rarityClass: Rarity.COMMON },
      { value: "Street Hoodie", weight: 40, rarityClass: Rarity.UNCOMMON },
      { value: "Tactical Vest", weight: 30, rarityClass: Rarity.RARE },
      { value: "Monk Robes (Neon)", weight: 20, rarityClass: Rarity.EPIC },
      { value: "Samurai Armor", weight: 10, rarityClass: Rarity.LEGENDARY },
      { value: "Emperor's Silk", weight: 1, rarityClass: Rarity.ZEN_MASTER }
    ]
  },
  {
    name: "Eyes",
    options: [
      { value: "Determined", weight: 50, rarityClass: Rarity.COMMON },
      { value: "Sunglasses", weight: 30, rarityClass: Rarity.UNCOMMON },
      { value: "VR Goggles", weight: 20, rarityClass: Rarity.RARE },
      { value: "Cyber-Optic Red", weight: 10, rarityClass: Rarity.EPIC },
      { value: "Hollow Glow", weight: 5, rarityClass: Rarity.LEGENDARY },
      { value: "All-Seeing Third Eye", weight: 1, rarityClass: Rarity.ZEN_MASTER }
    ]
  },
  {
    name: "Mouth",
    options: [
      { value: "Neutral", weight: 50, rarityClass: Rarity.COMMON },
      { value: "Grin", weight: 30, rarityClass: Rarity.UNCOMMON },
      { value: "Cigar", weight: 20, rarityClass: Rarity.RARE },
      { value: "Gas Mask", weight: 10, rarityClass: Rarity.EPIC },
      { value: "Cyber-Mandible", weight: 5, rarityClass: Rarity.LEGENDARY },
      { value: "Void Whisper", weight: 1, rarityClass: Rarity.ZEN_MASTER }
    ]
  },
  {
    name: "Headgear",
    options: [
      { value: "None", weight: 50, rarityClass: Rarity.COMMON },
      { value: "Headband", weight: 30, rarityClass: Rarity.UNCOMMON },
      { value: "Straw Hat", weight: 20, rarityClass: Rarity.RARE },
      { value: "Kabuto Helmet", weight: 10, rarityClass: Rarity.EPIC },
      { value: "Neural Halo", weight: 5, rarityClass: Rarity.LEGENDARY },
      { value: "Crown of Light", weight: 1, rarityClass: Rarity.ZEN_MASTER }
    ]
  },
  {
    name: "Weapon",
    options: [
      { value: "None", weight: 40, rarityClass: Rarity.COMMON },
      { value: "Brass Knuckles", weight: 30, rarityClass: Rarity.UNCOMMON },
      { value: "Nunchaku", weight: 20, rarityClass: Rarity.RARE },
      { value: "Laser Katana", weight: 10, rarityClass: Rarity.EPIC },
      { value: "Plasma Cannon", weight: 5, rarityClass: Rarity.LEGENDARY },
      { value: "Reality Slicer", weight: 1, rarityClass: Rarity.ZEN_MASTER }
    ]
  },
  {
    name: "Accessory",
    options: [
      { value: "None", weight: 50, rarityClass: Rarity.COMMON },
      { value: "Earring", weight: 30, rarityClass: Rarity.UNCOMMON },
      { value: "Gold Chain", weight: 20, rarityClass: Rarity.RARE },
      { value: "Prayer Beads", weight: 10, rarityClass: Rarity.EPIC },
      { value: "Floating Drone", weight: 5, rarityClass: Rarity.LEGENDARY },
      { value: "Time Relic", weight: 1, rarityClass: Rarity.ZEN_MASTER }
    ]
  },
  {
    name: "Element",
    options: [
      { value: "Physical", weight: 40, rarityClass: Rarity.COMMON },
      { value: "Iron", weight: 30, rarityClass: Rarity.UNCOMMON },
      { value: "Electric", weight: 20, rarityClass: Rarity.RARE },
      { value: "Plasma", weight: 10, rarityClass: Rarity.EPIC },
      { value: "Dark Matter", weight: 5, rarityClass: Rarity.LEGENDARY },
      { value: "Pure Zen", weight: 1, rarityClass: Rarity.ZEN_MASTER }
    ]
  },
  {
    name: "Spirit",
    options: [
      { value: "Dormant", weight: 50, rarityClass: Rarity.COMMON },
      { value: "Awakened", weight: 30, rarityClass: Rarity.UNCOMMON },
      { value: "Restless", weight: 20, rarityClass: Rarity.RARE },
      { value: "Vengeful", weight: 10, rarityClass: Rarity.EPIC },
      { value: "Ascended", weight: 5, rarityClass: Rarity.LEGENDARY },
      { value: "God-Tier", weight: 1, rarityClass: Rarity.ZEN_MASTER }
    ]
  }
];
