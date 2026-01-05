
import { ZenBeast, GymLeader } from '../types';

export const GENERATE_BEAST_PROMPT = `
You are the architect of a "ZenBeasts" universe, a high-fidelity Cyberpunk/Fantasy fusion world.
Task: Create a unique "ZenBeast" NFT character profile.

Concept:
- A biological creature enhanced with cybernetic implants and ancient spiritual artifacts.
- They act as spirit guardians for hackers and street samurai in "Neon City".
- Visual Style: Voxel-based but high-resolution, glowing neon veins, chrome plating, traditional Asian armor pieces.

Output JSON only:
{
  "name": "Evocative Name (e.g., 'Chromium Lotus Tiger', 'Null-Sector Mantis', 'Quantum Jade Dragon')",
  "description": "A vivid 2-sentence description focusing on its specific cybernetic enhancements and the aura it projects. Mention specific neon colors and material textures (e.g., 'matte black carbon fiber', 'glowing circuitry').",
  "class": "Tiger|Panda|Crane|Mantis|Monkey|Snake|Ox|Dragon",
  "rarity": "Common|Uncommon|Rare|Epic|Legendary",
  "stats": { "attack": 20-90, "defense": 20-90, "speed": 20-90, "zen": 20-90 },
  "traits": [
    { "type": "Implants", "value": "string (e.g., 'Ocular Visor', 'Titanium Claws')", "rarity": 1-100 },
    { "type": "Aura", "value": "string (e.g., 'Glitch Static', 'Holographic Mist')", "rarity": 1-100 },
    { "type": "Accessory", "value": "string (e.g., 'Prayer Beads', 'Data Scroll')", "rarity": 1-100 },
    { "type": "Skin/Fur", "value": "string (e.g., 'Obsidian Plating', 'Synth-Fur')", "rarity": 1-100 }
  ]
}
`;

export const getBreedingPrompt = (parentA: ZenBeast, parentB: ZenBeast) => `
Breeding Simulation initialized.
Parent 1: ${parentA.name} (${parentA.class}, ${parentA.rarity}) - Traits: ${parentA.traits.map(t => t.value).join(', ')}
Parent 2: ${parentB.name} (${parentB.class}, ${parentB.rarity}) - Traits: ${parentB.traits.map(t => t.value).join(', ')}

Goal: Synthesize a descendant that merges the genetic code of both parents.
- If classes differ, select one randomly (50/50).
- Inherit 2 traits from each parent, but apply a "mutation" filter (e.g., "Titanium Claws" might become "Adamantium Claws").
- Stats should average the parents' stats with a variance of +/- 10%.

Output JSON only. Follow the same schema as generation.
`;

export const getEvolutionPrompt = (original: ZenBeast) => `
Initiating Evolution Sequence for: ${original.name} (${original.rarity} ${original.class}).

Directives:
1.  **Name:** Ascend the name to a higher state of being (e.g., "Tiger" -> "Celestial Tiger Warlord").
2.  **Rarity:** Increase rarity by one tier (e.g., Rare -> Epic).
3.  **Visuals:** Describe the transformation. The cybernetics should look more advanced (e.g., exposed wires become integrated nano-mesh).
4.  **Stats:** Apply a 20-30% boost across all metrics.
5.  **Traits:** Prefix traits with "Ascended", "Quantum", "Void", or "Neon".

Output JSON only. Follow the same schema as generation.
`;

export const getBattlePrompt = (player: ZenBeast, opponent: ZenBeast | GymLeader, context: string) => {
    const oppName = 'team' in opponent ? opponent.name : opponent.name;
    const oppStats = 'team' in opponent ? opponent.team[0].stats : opponent.stats;
    
    return `
      Simulate a turn-based combat encounter in a Cyberpunk Arena.

      Combatants:
      [PLAYER]: ${player.name} (${player.class})
      Stats: ATK:${player.stats.attack}, DEF:${player.stats.defense}, SPD:${player.stats.speed}
      
      [ENEMY]: ${oppName}
      Stats: ATK:${oppStats.attack}, DEF:${oppStats.defense}

      Context: ${context}
      
      Simulation Rules:
      1. Speed determines initiative.
      2. Elemental/Class advantages apply (e.g., Water/Ice > Fire/Electric).
      3. Critical hits happen 10% of the time (multiply damage by 1.5).
      4. Narrative Style: Fast-paced, visceral, using terms like "glitch", "buffer overflow", "kinetic strike", "nano-swarm".
      
      Output JSON only:
      { 
        "winner": "player"|"enemy" (ID),
        "logs": [
            {
                "turn": 1,
                "actor": "${player.name}"|"${oppName}",
                "action": "Attack Name",
                "description": "Short vivid description of the move.",
                "damage": number (0-40),
                "isCritical": boolean
            }
        ], 
        "rewards": { "exp": number (50-200), "zenCoins": number (10-50), "points": number, "trainerExp": number }
      }
    `;
};
