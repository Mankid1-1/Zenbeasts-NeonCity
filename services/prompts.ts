
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

export const getBreedingPrompt = (parentA: ZenBeast, parentB: ZenBeast, childClass: string, childTraits: any[]) => `
Breeding Event:
Father: ${parentA.name} (${parentA.class}, ${parentA.rarity})
Mother: ${parentB.name} (${parentB.class}, ${parentB.rarity})

I have already determined the offspring's genetic traits:
Class: ${childClass}
Traits: ${JSON.stringify(childTraits.map(t => `${t.type}: ${t.value}`))}

Your task is to:
1. Generate a creative Name that fits these traits and heritage.
2. Write a 2-sentence Description acknowledging its mixed heritage.
3. Calculate stats: Average of parents + small random bonus (0-10%).

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
    const oppClass = 'team' in opponent ? opponent.team[0].class : opponent.class;
    
    return `
      Simulate a gritty Cyberpunk Kung-Fu battle between two entities.
      
      Entity A (Player): ${player.name}
      - Class: ${player.class} | ATK:${player.stats.attack} | DEF:${player.stats.defense} | SPD:${player.stats.speed}
      
      Entity B (Opponent): ${oppName}
      - Class: ${oppClass} | ATK:${oppStats.attack} | DEF:${oppStats.defense}
      
      Context: ${context}
      
      Game Rules:
      1. Class/Elemental Advantages (Rock-Paper-Scissors):
         - Dragon (Fire) beats Ox (Metal).
         - Ox (Metal) beats Tiger & Panda (Wood).
         - Tiger & Panda (Wood) beats Snake (Earth).
         - Snake (Earth) beats Crane (Water).
         - Crane (Water) beats Dragon (Fire).
         - Mantis & Monkey are neutral (Normal effectiveness against all).
      
      2. Effectiveness Logic:
         - SUPER EFFECTIVE: If Attacker Class > Defender Class (e.g. Dragon vs Ox), damage is increased by ~50%. Set "effectiveness" to "super".
         - NOT VERY EFFECTIVE: If Defender Class > Attacker Class (e.g. Ox vs Dragon), damage is reduced by ~50%. Set "effectiveness" to "not_very".
         - NORMAL: Neutral matchups. Set "effectiveness" to "normal".
         
      3. Critical hits (10% chance) deal double damage.
      4. Descriptions must be visceral (e.g. "plasma burn", "neural shock", "cracked armor").
      
      Generate 4-6 battle log entries.
      
      Return JSON only: 
      { 
        "winner": "player"|"enemy", 
        "logs": [
            { 
                "turn": 1, 
                "actor": "${player.name}" or "${oppName}", 
                "action": "Strike Name", 
                "description": "Action description", 
                "damage": number, 
                "isCritical": boolean,
                "effectiveness": "super" | "not_very" | "normal" 
            }
        ], 
        "rewards": { "exp": number, "zenCoins": number, "points": number, "trainerExp": number } 
      }
    `;
};
