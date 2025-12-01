
import { ZenBeast, GymLeader } from '../types';

export const GENERATE_BEAST_PROMPT = `
Create a "ZenBeast" NFT character for a high-end cyberpunk game.
Concept: Anthropomorphic martial arts masters mixed with neon-lit cybernetic enhancements and ancient Roman/Asian accessories.
Art Style: Voxel 3D, Neon Noir, High Tech Low Life.

Output JSON only:
{
  "name": "Evocative Name (e.g., 'Neon Lotus Tiger', 'Chrome Fist Panda')",
  "description": "2 sentence visual description emphasizing voxel aesthetic and glowing elements.",
  "class": "Tiger|Panda|Crane|Mantis|Monkey|Snake|Ox|Dragon",
  "rarity": "Common|Uncommon|Rare|Epic|Legendary",
  "stats": { "attack": 20-90, "defense": 20-90, "speed": 20-90, "zen": 20-90 },
  "traits": [
    { "type": "Body", "value": "string", "rarity": 1-100 },
    { "type": "Clothes", "value": "string", "rarity": 1-100 },
    { "type": "Eyes", "value": "string", "rarity": 1-100 },
    { "type": "Weapon", "value": "string", "rarity": 1-100 }
  ]
}
`;

export const getBreedingPrompt = (parentA: ZenBeast, parentB: ZenBeast) => `
Breeding Event:
Father: ${parentA.name} (${parentA.class}, ${parentA.rarity})
Mother: ${parentB.name} (${parentB.class}, ${parentB.rarity})

Goal: Create an offspring that inherits traits from both but with potential genetic mutations.
If parents are same class, child is that class. If different, 50/50 chance.
Stats should be average of parents + small random bonus (0-10%).

Output JSON only. Follow the same schema as generation.
`;

export const getEvolutionPrompt = (original: ZenBeast) => `
Evolve this ZenBeast to the next level of existence.
Current: ${original.name} (${original.rarity} ${original.class})

Rules:
1. Name becomes grander (e.g. "Master", "Cyber-God", "Ascended").
2. Rarity increases by one tier (e.g. Rare -> Epic).
3. Stats increase by ~25%.
4. Traits become "glowing", "golden", "quantum", or "celestial".

Output JSON only. Follow the same schema as generation.
`;

export const getBattlePrompt = (player: ZenBeast, opponent: ZenBeast | GymLeader, context: string) => {
    const oppName = 'team' in opponent ? opponent.name : opponent.name;
    const oppStats = 'team' in opponent ? opponent.team[0].stats : opponent.stats;
    
    return `
      Simulate a Cyberpunk Kung-Fu battle.
      Player: ${player.name} (Class: ${player.class}, ATK:${player.stats.attack}, DEF:${player.stats.defense})
      Enemy: ${oppName} (ATK:${oppStats.attack}, DEF:${oppStats.defense})
      Context: ${context}
      
      Mechanics:
      - Class Advantages exist (e.g. Water/Ice themes beat Fire).
      - Higher stats have 80% win chance.
      - Calculate specific damage numbers (10-50 per hit).
      
      Generate 3-5 battle log entries.
      Action verbs: "hacks", "strikes", "overloads", "parries".
      
      Return JSON only: 
      { 
        "winner": "player"|"enemy", 
        "logs": [
            { "turn": 1, "actor": "string", "action": "string", "description": "string", "damage": number }
        ], 
        "rewards": { "exp": number, "zenCoins": number, "points": number, "trainerExp": number } 
      }
    `;
};
