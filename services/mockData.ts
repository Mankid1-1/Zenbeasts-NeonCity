
import { BeastClass, Rarity } from '../types';

export const MOCK_NAMES_PREFIX = [
    "Neo", "Cyber", "Flux", "Void", "Zen", "Pulse", "Data", "Glitch", "Net", "Core", "Mech", "Syn", "Vapor", "Neon", "Null", "Echo"
];

export const MOCK_NAMES_SUFFIX = [
    "fang", "claw", "wing", "scale", "byte", "bot", "droid", "soul", "spirit", "wraith", "shade", "spark", "surge", "node", "link"
];

export const MOCK_DESCRIPTIONS = [
    "Born from the remnants of a corrupted hard drive.",
    "A digital entity that has gained sentience.",
    "It flows with the rhythm of the blockchain.",
    "Forged in the fires of a GPU cluster.",
    "A peaceful spirit wandering the neural network.",
    "Its eyes glow with the light of a thousand pixels.",
    "A glitch in the system that became a feature.",
    "Guardian of the decentralized ledger."
];

export const BATTLE_ACTIONS = [
    "Cyber Strike", "Pixel Slash", "Data Drain", "Firewall Bash", "Logic Bomb", "System Overload", "Neural Shock", "Quantum Leap"
];

export const BATTLE_DESCRIPTIONS = [
    "hits with critical force!",
    "glitches through the defense!",
    "drains energy from the opponent!",
    "shatters the shield!",
    "causes a stack overflow!",
    "rewrites the opponent's code!",
    "surges with power!"
];

export const getRandomName = (beastClass: BeastClass) => {
    const prefix = MOCK_NAMES_PREFIX[Math.floor(Math.random() * MOCK_NAMES_PREFIX.length)];
    const suffix = MOCK_NAMES_SUFFIX[Math.floor(Math.random() * MOCK_NAMES_SUFFIX.length)];
    return `${prefix}${suffix}`;
};

export const getRandomDescription = () => {
    return MOCK_DESCRIPTIONS[Math.floor(Math.random() * MOCK_DESCRIPTIONS.length)];
};

export const generateMockBattleLogs = (winnerName: string, loserName: string) => {
    const logs = [];
    let turns = Math.floor(Math.random() * 3) + 3; // 3 to 5 turns

    for (let i = 1; i <= turns; i++) {
        const isPlayerTurn = i % 2 !== 0; // Alternate turns
        const actor = isPlayerTurn ? winnerName : loserName;
        // The winner dominates slightly more or lands the final blow
        // To make it realistic, we just alternate for now, but ensure winner gets last hit if possible or just more damage.

        // Actually, `simulateBattle` determines winner first.
        // If winnerName is the actor, they should deal damage.
        // If loserName is actor, they deal damage too but less overall?
        // Simple logic: random action.

        const action = BATTLE_ACTIONS[Math.floor(Math.random() * BATTLE_ACTIONS.length)];
        const desc = BATTLE_DESCRIPTIONS[Math.floor(Math.random() * BATTLE_DESCRIPTIONS.length)];
        const damage = Math.floor(Math.random() * 15) + 5;

        logs.push({
            turn: i,
            actor: actor,
            action: action,
            description: `${actor} ${desc}`,
            damage: damage
        });
    }

    // Finishing blow
    logs.push({
        turn: turns + 1,
        actor: winnerName,
        action: "Final Execute",
        description: `${winnerName} delivers the finishing blow!`,
        damage: 50
    });

    return logs;
};
