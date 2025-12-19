
import { ZenBeast, GymLeader, BattleResult, BattleLog } from '../types';

// Simple Type Effectiveness Chart (Optional - can be expanded)
// For now, we'll keep it simple: strict stat comparison with random variance.

const calculateDamage = (attacker: ZenBeast | GymLeader, defender: ZenBeast | GymLeader): { damage: number, isCritical: boolean } => {
    // Base Damage = (Attack / Defense) * PowerConstant
    // We assume a "move power" of roughly 50 for standard attacks
    const movePower = 50;

    // Attacker Stats
    const att = attacker.stats.attack;
    const speedBonus = attacker.stats.speed / 100; // minimal bonus from speed

    // Defender Stats
    const def = defender.stats.defense;

    // Logic
    let damage = ((att * movePower) / Math.max(def, 1)) + (attacker.stats.zen * 0.2);

    // Variance: +/- 15%
    const variance = (Math.random() * 0.3) + 0.85;
    damage *= variance;

    // Critical Hit: Based on Speed and Zen
    const critChance = (attacker.stats.speed * 0.05) + (attacker.stats.zen * 0.02); // e.g. 20 speed = 1%? No, let's normalize.
    // Let's say max stats are ~100.
    // 50 speed -> 2.5 + 1 = 3.5% chance. Low. Let's buff it.
    const critThreshold = Math.random() * 100;
    const isCritical = critThreshold < (critChance + 5); // Base 5% crit

    if (isCritical) {
        damage *= 1.5;
    }

    return {
        damage: Math.max(1, Math.floor(damage)), // Minimum 1 damage
        isCritical
    };
};

export const simulateBattle = async (playerBeast: ZenBeast, opponent: ZenBeast | GymLeader): Promise<BattleResult> => {
    const logs: BattleLog[] = [];

    // Clone stats to track HP during battle (assuming stats = Max HP roughly for this simple engine)
    // Real RPGs have separate HP. Here we can treat 'Defense' or a sum as HP?
    // The types don't have 'currentHP'.
    // Let's assume Max HP = Defense * 3 + Zen * 2.

    let playerHP = playerBeast.stats.defense * 3 + playerBeast.stats.zen * 2;
    let enemyHP = opponent.stats.defense * 3 + opponent.stats.zen * 2;

    const maxPlayerHP = playerHP;
    const maxEnemyHP = enemyHP;

    let turn = 0;
    const maxTurns = 20; // Prevent infinite loops
    let winnerId = '';

    // Determine Turn Order based on Speed
    let playerTurn = playerBeast.stats.speed >= opponent.stats.speed;

    // Speed tie breaker: random
    if (playerBeast.stats.speed === opponent.stats.speed) playerTurn = Math.random() > 0.5;

    while (playerHP > 0 && enemyHP > 0 && turn < maxTurns) {
        turn++;

        const attacker = playerTurn ? playerBeast : opponent;
        const defender = playerTurn ? opponent : playerBeast;

        const { damage, isCritical } = calculateDamage(attacker, defender);

        // Apply Damage
        if (playerTurn) {
            enemyHP -= damage;
        } else {
            playerHP -= damage;
        }

        // Log
        const actionNames = ["Strike", "Blast", "Slash", "Beam", "Impact"];
        const action = actionNames[Math.floor(Math.random() * actionNames.length)];

        logs.push({
            turn,
            actor: attacker.name,
            action: action,
            damage,
            description: `${attacker.name} used ${action}! ${isCritical ? "It's a Critical Hit!" : ""}`,
            isCritical
        });

        if (enemyHP <= 0) {
            winnerId = playerBeast.id;
            logs.push({ turn: turn + 1, actor: playerBeast.name, action: "Victory", description: `${opponent.name} has been defeated!` });
            break;
        }
        if (playerHP <= 0) {
            winnerId = opponent.id; // GymLeader might use 'enemy' or specific ID
            logs.push({ turn: turn + 1, actor: opponent.name, action: "Victory", description: `${playerBeast.name} has been defeated!` });
            break;
        }

        // Switch turn
        playerTurn = !playerTurn;
    }

    // Fallback if max turns reached (Judge by % HP remaining)
    if (!winnerId) {
        const playerPct = playerHP / maxPlayerHP;
        const enemyPct = enemyHP / maxEnemyHP;
        if (playerPct >= enemyPct) {
            winnerId = playerBeast.id;
            logs.push({ turn: turn + 1, actor: "Referee", action: "Decision", description: "Battle ended. Player wins by decision." });
        } else {
            winnerId = opponent.id;
            logs.push({ turn: turn + 1, actor: "Referee", action: "Decision", description: "Battle ended. Opponent wins by decision." });
        }
    }

    const playerWon = winnerId === playerBeast.id;

    // Calculate Rewards
    // Base rewards
    let exp = 10;
    let zenCoins = 5;
    let trainerExp = 5;
    let points = 0;

    if (playerWon) {
        // Simple XP Formula: Opponent Level * 10? (We don't know opponent level easily if GymLeader doesn't have it, assume 1 or scaled)
        // Opponent stats sum can be a proxy for "Level"
        const oppPower = opponent.stats.attack + opponent.stats.defense + opponent.stats.speed + opponent.stats.zen;

        exp = Math.floor(oppPower / 2);
        zenCoins = Math.floor(oppPower / 4); // Soft Currency
        trainerExp = 20;
        points = 10;

        // Gym Leader Bonus
        if ('team' in opponent) { // It's a GymLeader
             zenCoins += opponent.rewardCoins;
             points += 50;
             trainerExp += 40;
        }
    }

    return {
        winnerId,
        logs,
        rewards: {
            exp,
            zenCoins,
            points,
            trainerExp
        }
    };
};
