
import { useState, useEffect, useCallback, useRef } from 'react';
import { ZenBeast, LeaderboardEntry, GymLeader, BattleResult, TrainerPerk, Achievement, Notification, BeastClass, Rarity, Wallet, Chain, Quest } from '../types';
import { INITIAL_ZEN_COINS, INITIAL_LEADERBOARD, INITIAL_MARKET_LISTINGS, TRAINER_PERKS, LEVEL_THRESHOLDS, BASE_MINT_PRICE, ACHIEVEMENTS_LIST, TOKENOMICS, DAILY_CONTRACTS, STAKING_RATES, GENESIS_MULTIPLIER, BREEDING_COST, EVOLUTION_COST } from '../constants';
import { generateZenBeast, breedZenBeasts, simulateBattle, evolveZenBeast } from '../services/geminiService';
import { loadState, saveState } from '../utils';
import { connectWalletService, simulateTransaction, bridgeOffChainToOnChain, estimateGas } from '../services/web3';

export const useGameState = () => {
  // Persistence Keys
  const KEYS = {
    COINS: 'zen_coins', // Soft Currency
    BEASTS: 'zen_beasts',
    MARKET: 'zen_market',
    LEADERBOARD: 'zen_leaderboard',
    TRAINER_LVL: 'zen_trainer_lvl',
    TRAINER_EXP: 'zen_trainer_exp',
    ACHIEVEMENTS: 'zen_achievements',
    HISTORY: 'zen_coin_history',
    WALLET: 'zen_wallet',
    QUESTS: 'zen_quests',
    LAST_LOGIN: 'zen_last_login'
  };

  // State
  const [coins, setCoins] = useState(() => loadState(KEYS.COINS, INITIAL_ZEN_COINS));
  
  // CRITICAL FIX: Sanitize beasts data on load to prevent crashes from missing fields or non-array data
  const [beasts, setBeasts] = useState<ZenBeast[]>(() => {
    let loaded = loadState<ZenBeast[]>(KEYS.BEASTS, []);
    if (!Array.isArray(loaded)) loaded = []; // Ensure it's an array
    
    return loaded.map(b => ({
      ...b,
      stats: b.stats || { attack: 10, defense: 10, speed: 10, zen: 10 },
    }));
  });

  const [marketListings, setMarketListings] = useState<ZenBeast[]>(() => {
      let loaded = loadState<ZenBeast[]>(KEYS.MARKET, INITIAL_MARKET_LISTINGS);
      if (!Array.isArray(loaded)) loaded = INITIAL_MARKET_LISTINGS;

      return loaded.map(b => ({
        ...b,
        stats: b.stats || { attack: 10, defense: 10, speed: 10, zen: 10 },
      }));
  });
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => loadState(KEYS.LEADERBOARD, INITIAL_LEADERBOARD));
  const [trainerLevel, setTrainerLevel] = useState(() => loadState(KEYS.TRAINER_LVL, 1));
  const [trainerExp, setTrainerExp] = useState(() => loadState(KEYS.TRAINER_EXP, 0));
  const [quests, setQuests] = useState<Quest[]>(() => loadState(KEYS.QUESTS, DAILY_CONTRACTS));
  
  // Web3 State
  const [wallet, setWallet] = useState<Wallet>(() => loadState(KEYS.WALLET, { address: null, chain: 'solana', zenBalance: 0, isConnected: false }));
  
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
      const saved = loadState(KEYS.ACHIEVEMENTS, []);
      const safeSaved = Array.isArray(saved) ? saved : [];
      return ACHIEVEMENTS_LIST.map(staticAch => {
          const savedAch = safeSaved.find((s: any) => s.id === staticAch.id);
          return { ...staticAch, unlocked: savedAch ? savedAch.unlocked : false };
      });
  });
  
  const [coinHistory, setCoinHistory] = useState<{name: string, val: number}[]>(() => loadState(KEYS.HISTORY, [
      { name: 'Start', val: INITIAL_ZEN_COINS }
  ]));
  
  const [marketHistory, setMarketHistory] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Refs for stable callbacks
  const beastsRef = useRef(beasts);
  const trainerLevelRef = useRef(trainerLevel);
  const coinsRef = useRef(coins);
  const walletRef = useRef(wallet);
  const marketListingsRef = useRef(marketListings);

  // Track last notified level to handle Level Up notifications via Effect
  const lastNotifiedLevelRef = useRef(trainerLevel);
  
  useEffect(() => { beastsRef.current = beasts; }, [beasts]);
  useEffect(() => { trainerLevelRef.current = trainerLevel; }, [trainerLevel]);
  useEffect(() => { coinsRef.current = coins; }, [coins]);
  useEffect(() => { walletRef.current = wallet; }, [wallet]);
  useEffect(() => { marketListingsRef.current = marketListings; }, [marketListings]);

  const addNotification = useCallback((title: string, message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
      const id = Math.random().toString(36).substr(2, 9);
      setNotifications(prev => [...prev, { id, title, message, type }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Level Up Notification Effect
  useEffect(() => {
    if (trainerLevel > lastNotifiedLevelRef.current) {
         addNotification("LEVEL UP!", `You reached Trainer Level ${trainerLevel}`, 'success');
    }
    lastNotifiedLevelRef.current = trainerLevel;
  }, [trainerLevel, addNotification]);

  // Daily Reset & F2P Check
  useEffect(() => {
    const checkDailyReset = () => {
        const lastLogin = loadState(KEYS.LAST_LOGIN, 0);
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        // Reset quests if it's a new day (simple check)
        const lastDate = new Date(lastLogin).getDate();
        const currentDate = new Date(now).getDate();

        if (lastDate !== currentDate) {
             setQuests(DAILY_CONTRACTS.map(q => ({ ...q, current: 0, completed: false, claimed: false })));
             addNotification("System Reboot", "Daily Contracts Reset", "info");
        }
        saveState(KEYS.LAST_LOGIN, now);
    };

    if (beasts.length === 0) {
        const initBeast = async () => {
            const starter: ZenBeast = {
                id: 'starter-' + Math.random().toString(36).substr(2,9),
                name: 'Neon Initiate',
                description: 'Your spirit companion. Bound to your soul, it cannot be traded.',
                class: BeastClass.TIGER,
                rarity: Rarity.COMMON,
                level: 1,
                exp: 0,
                generation: 0,
                obtainedAt: Date.now(),
                isStaked: false,
                isSoulbound: true,
                isOnChain: false,
                ownerId: 'player',
                stats: { attack: 25, defense: 25, speed: 25, zen: 25 },
                traits: [],
                imageUrl: 'https://picsum.photos/seed/starter/400/400'
            };
            setBeasts([starter]);
            addNotification("Welcome, Initiate", "Soulbound Spirit received.", 'info');
        };
        initBeast();
    }

    checkDailyReset();
  }, []); 

  // Persistence
  useEffect(() => saveState(KEYS.COINS, coins), [coins]);
  useEffect(() => saveState(KEYS.BEASTS, beasts), [beasts]);
  useEffect(() => saveState(KEYS.MARKET, marketListings), [marketListings]);
  useEffect(() => saveState(KEYS.WALLET, wallet), [wallet]);
  useEffect(() => saveState(KEYS.QUESTS, quests), [quests]);

  const activePerks = TRAINER_PERKS.filter(p => p.unlockLevel <= trainerLevel);


  const updateQuestProgress = useCallback((type: string, amount: number) => {
      setQuests(prev => prev.map(q => {
          if (q.type === type && !q.completed) {
              const newCurrent = Math.min(q.target, q.current + amount);
              const isFinished = newCurrent >= q.target;
              if (isFinished && !q.completed) {
                  addNotification("Contract Fulfilled", `Completed: ${q.title}`, 'success');
              }
              return { ...q, current: newCurrent, completed: isFinished };
          }
          return q;
      }));
  }, [addNotification]);

  const addTrainerExp = useCallback((amount: number) => {
    setTrainerExp(prev => {
        const newExp = prev + amount;
        // Use ref for threshold check to determine if we SHOULD level up
        const nextLevelThreshold = LEVEL_THRESHOLDS[trainerLevelRef.current + 1];
        if (nextLevelThreshold && newExp >= nextLevelThreshold) {
            setTrainerLevel(l => l + 1);
        }
        return newExp;
    });
  }, []);

  const claimQuestReward = useCallback((questId: string) => {
      setQuests(prev => prev.map(q => {
          if (q.id === questId && q.completed && !q.claimed) {
              setCoins(c => c + q.rewardCoins);
              addTrainerExp(q.rewardExp);
              addNotification("Rewards Claimed", `+${q.rewardCoins} ZC, +${q.rewardExp} XP`, 'success');
              return { ...q, claimed: true };
          }
          return q;
      }));
  }, [addNotification, addTrainerExp]);

  // Web3 Actions
  const connectWallet = useCallback(async (chain: Chain) => {
      try {
          const newWallet = await connectWalletService(chain);
          setWallet(newWallet);
          addNotification("System Connected", `Wallet linked on ${chain.toUpperCase()}`, 'success');
      } catch (e) {
          addNotification("Connection Error", "Failed to link wallet.", 'error');
      }
  }, [addNotification]);

  const switchChain = useCallback(async (chain: Chain) => {
      if (!walletRef.current.isConnected) return;
      setWallet(prev => ({ ...prev, chain }));
      addNotification("Network Switched", `Active Chain: ${chain.toUpperCase()}`, 'info');
  }, [addNotification]);

  const claimEarnings = useCallback(async (amountZC: number) => {
      if (!walletRef.current.isConnected) {
          addNotification("Wallet Required", "Connect wallet to claim earnings.", 'warning');
          return;
      }
      if (amountZC < TOKENOMICS.CLAIM_THRESHOLD) {
          addNotification("Threshold Not Met", `Minimum claim: ${TOKENOMICS.CLAIM_THRESHOLD} ZC`, 'warning');
          return;
      }
      if (coinsRef.current < amountZC) {
          addNotification("Insufficient Funds", "Not enough ZenCoins.", 'error');
          return;
      }

      setCoins(prev => prev - amountZC);
      try {
          const zenReceived = await bridgeOffChainToOnChain(amountZC, walletRef.current.chain);
          setWallet(prev => ({ ...prev, zenBalance: prev.zenBalance + zenReceived }));
          addNotification("Transfer Complete", `Bridged ${zenReceived.toFixed(4)} ZEN to ${walletRef.current.chain}`, 'success');
      } catch (e: any) {
          setCoins(prev => prev + amountZC); // Refund
          addNotification("Bridge Error", e.message, 'error');
      }
  }, [addNotification]);

  const calculateMintPrice = useCallback(() => {
    let price = BASE_MINT_PRICE;
    const currentActivePerks = TRAINER_PERKS.filter(p => p.unlockLevel <= trainerLevelRef.current);
    const discountPerk = currentActivePerks.find(p => p.effectType === 'mint_discount');
    if (discountPerk) price = Math.floor(price * (1 - discountPerk.value));
    return price;
  }, []);

  // -------------------- STAKING LOGIC START --------------------

  const handleStake = useCallback((id: string) => {
    if (!walletRef.current.isConnected) {
         addNotification("Wallet Required", "Staking requires a secure wallet connection.", 'warning');
         return;
    }
    setBeasts(prev => prev.map(b => {
        if (b.id === id) {
            if (b.isSoulbound) {
                addNotification("Restricted", "Soulbound beasts cannot enter the Vault.", 'error');
                return b;
            }
            return { 
                ...b, 
                isStaked: true, 
                stakingStart: Date.now(),
                accumulatedRewards: b.accumulatedRewards || 0 
            };
        }
        return b;
    }));
    addNotification("Asset Locked", "Beast staked in Neural Vault.", 'success');
  }, [addNotification]);

  const calculatePendingRewards = useCallback((beast: ZenBeast) => {
      if (!beast.isStaked || !beast.stakingStart) return 0;
      const now = Date.now();
      const hoursStaked = (now - beast.stakingStart) / (1000 * 60 * 60);
      let rate = STAKING_RATES[beast.rarity] || 0.1; // fallback rate
      if (beast.generation === 0) rate *= GENESIS_MULTIPLIER;
      
      // Add trainer perk bonuses
      const perks = TRAINER_PERKS.filter(p => p.unlockLevel <= trainerLevelRef.current && p.effectType === 'mining_boost');
      const bonus = perks.reduce((acc, p) => acc + p.value, 0);
      rate = rate * (1 + bonus);

      return (beast.accumulatedRewards || 0) + (hoursStaked * rate);
  }, []);

  const claimStakingRewards = useCallback((id: string, shouldUnstake: boolean) => {
      setBeasts(prev => prev.map(b => {
          if (b.id === id) {
              const rewards = calculatePendingRewards(b);
              // Add to wallet balance (ZEN Hard Currency)
              setWallet(w => ({ ...w, zenBalance: w.zenBalance + rewards }));
              addNotification("Yield Harvested", `+${rewards.toFixed(4)} ZEN`, 'success');
              
              if (shouldUnstake) {
                  return { ...b, isStaked: false, stakingStart: undefined, accumulatedRewards: 0 };
              } else {
                  // Reset timer but keep accumulated 0
                  return { ...b, stakingStart: Date.now(), accumulatedRewards: 0 };
              }
          }
          return b;
      }));
  }, [calculatePendingRewards, addNotification]);

  const claimAllStakingRewards = useCallback(() => {
    let totalClaimed = 0;
    setBeasts(prev => prev.map(b => {
        if (b.isStaked) {
            const rewards = calculatePendingRewards(b);
            totalClaimed += rewards;
            return { ...b, stakingStart: Date.now(), accumulatedRewards: 0 };
        }
        return b;
    }));

    if (totalClaimed > 0) {
        setWallet(w => ({ ...w, zenBalance: w.zenBalance + totalClaimed }));
        addNotification("Mass Harvest", `+${totalClaimed.toFixed(4)} ZEN claimed from all assets.`, 'success');
    } else {
        addNotification("No Yields", "No pending rewards to harvest.", 'info');
    }
  }, [calculatePendingRewards, addNotification]);

  const handleUnstake = useCallback((id: string) => {
      // Unstaking automatically claims rewards
      claimStakingRewards(id, true);
      addNotification("Asset Withdrawn", "Beast returned to inventory.", 'info');
  }, [claimStakingRewards, addNotification]);

  // -------------------- STAKING LOGIC END --------------------

  const handleMint = useCallback(async () => {
    const price = calculateMintPrice();
    if (coinsRef.current < price) {
        addNotification("Transaction Failed", "Insufficient ZenCoins.", 'error');
        throw new Error("Insufficient funds");
    }
    setCoins(prev => prev - price);
    try {
        const newBeast = await generateZenBeast(1);
        newBeast.isOnChain = false; 
        newBeast.isSoulbound = false;
        setBeasts(prev => [...prev, newBeast]);
        addTrainerExp(50);
        updateQuestProgress('mint', 1);
        addNotification("Mint Successful", `Acquired ${newBeast.name}`, 'success');
        return newBeast;
    } catch (e) {
        setCoins(prev => prev + price); 
        addNotification("Mint Error", "Generation failed. Coins refunded.", 'error');
        throw e;
    }
  }, [calculateMintPrice, addNotification, addTrainerExp, updateQuestProgress]);

  const handleBreed = useCallback(async (p1: ZenBeast, p2: ZenBeast) => {
    if (coinsRef.current < BREEDING_COST) {
         addNotification("Fusion Failed", "Insufficient ZC for catalyst.", 'error');
         throw new Error("Insufficient funds");
    }
    
    setCoins(prev => prev - BREEDING_COST);
    try {
        const child = await breedZenBeasts(p1, p2);
        child.isSoulbound = false;
        child.isOnChain = false;
        
        if (!p1.isSoulbound && !p2.isSoulbound) {
            setBeasts(prev => prev.filter(b => b.id !== p1.id && b.id !== p2.id).concat(child));
        } else {
            setBeasts(prev => [...prev, child]);
        }

        addTrainerExp(100);
        updateQuestProgress('mint', 1); 
        addNotification("Fusion Complete", `Created ${child.name}`, 'success');
        return child;
    } catch(e) {
        setCoins(prev => prev + BREEDING_COST);
        addNotification("Fusion Error", "Genetic sequencing failed.", 'error');
        throw e;
    }
  }, [addNotification, addTrainerExp, updateQuestProgress]);

  const handleEvolve = useCallback(async (beast: ZenBeast) => {
    if (coinsRef.current < EVOLUTION_COST) {
        addNotification("Evolution Failed", "Insufficient ZenCoins.", 'error');
        throw new Error("Insufficient funds");
    }
    setCoins(prev => prev - EVOLUTION_COST);
    try {
        const evolved = await evolveZenBeast(beast);
        setBeasts(prev => prev.map(b => b.id === beast.id ? evolved : b));
        addTrainerExp(200);
        addNotification("Evolution Success", `${beast.name} has ascended!`, 'success');
    } catch (e) {
        setCoins(prev => prev + EVOLUTION_COST);
        addNotification("Evolution Error", "The process was unstable.", 'error');
    }
  }, [addNotification, addTrainerExp]);

  const handleRename = useCallback((id: string, newName: string) => {
      // SECURITY: Input validation to prevent excessively long or malicious names
      const trimmedName = newName.trim();
      if (trimmedName.length === 0 || trimmedName.length > 25) {
          addNotification("Invalid Name", "Name must be 1-25 characters.", 'error');
          return;
      }
      if (!/^[a-zA-Z0-9 -]+$/.test(trimmedName)) {
          addNotification("Invalid Name", "Only alphanumeric, spaces, and hyphens allowed.", 'error');
          return;
      }

      const COST = 10;
      if (coinsRef.current < COST) {
          addNotification("Insufficient Funds", `Rename costs ${COST} ZC`, 'error');
          return;
      }
      setCoins(c => c - COST);
      setBeasts(prev => prev.map(b => b.id === id ? { ...b, name: trimmedName } : b));
      addNotification("Identity Updated", `Beast renamed to ${trimmedName}`, 'success');
  }, [addNotification]);

  const handleBattle = useCallback(async (beast: ZenBeast, gymLeader?: GymLeader): Promise<BattleResult | null> => {
    if (beast.isStaked) {
        addNotification("Unit Unavailable", "Beast is currently staked in the Vault.", 'error');
        return null;
    }
    const opponent = gymLeader || { 
        id: 'bot', name: 'Rogue AI', stats: { attack: beast.stats.attack, defense: beast.stats.defense, speed: 50, zen: 50 },
        description: 'A rogue unit.', class: BeastClass.SNAKE, rarity: Rarity.COMMON, traits: [], team: []
    } as any;

    const result = await simulateBattle(beast, opponent);
    
    if (result.winnerId === beast.id) {
        const zenWon = result.rewards.zenCoins;
        setCoins(prev => prev + zenWon);
        updateQuestProgress('earn_coins', zenWon);
        updateQuestProgress('battle_win', 1);

        setBeasts(prev => prev.map(b => {
            if (b.id === beast.id) {
                const newExp = b.exp + result.rewards.exp;
                const newLevel = 1 + Math.floor(newExp / 100);
                if(newLevel > b.level) addNotification("Beast Level Up", `${b.name} reached Lvl ${newLevel}`, 'success');
                return { ...b, exp: newExp, level: newLevel };
            }
            return b;
        }));
        addTrainerExp(result.rewards.trainerExp || 20);
    }
    return result;
  }, [addNotification, updateQuestProgress, addTrainerExp]);

  const handleListForSale = useCallback(async (id: string, price: number) => {
    // SECURITY: Input validation to prevent negative price or NaN listings (Economy Exploit)
    if (!Number.isFinite(price) || price <= 0) {
        addNotification("Invalid Price", "Price must be a valid positive number.", 'error');
        return;
    }

    if (!walletRef.current.isConnected) {
        addNotification("Wallet Locked", "Connect wallet to access Black Market.", 'warning');
        return;
    }

    const gasFee = estimateGas(walletRef.current.chain);
    if (walletRef.current.zenBalance < gasFee) {
        addNotification("Gas Error", `Insufficient ZEN for gas (${gasFee}).`, 'error');
        return;
    }

    setWallet(prev => ({ ...prev, zenBalance: prev.zenBalance - gasFee }));
    
    const beast = beastsRef.current.find(b => b.id === id);
    if (beast) {
        if (beast.isSoulbound) {
            addNotification("Restriction", "Soulbound beasts cannot be sold.", 'error');
            return;
        }
        setBeasts(prev => prev.filter(b => b.id !== id));
        // Add original owner info
        setMarketListings(prev => [...prev, { ...beast, price, ownerId: 'player', originalOwner: walletRef.current.address || 'player', isOnChain: true }]);
        addNotification("Market Listing", `${beast.name} listed for ${price} ZEN`, 'success');
    }
  }, [addNotification]);

  const handleCancelListing = useCallback(async (id: string) => {
      const listing = marketListingsRef.current.find(l => l.id === id);
      if (!listing) return;
      
      // Simulate gas for cancellation
      const gasFee = estimateGas(walletRef.current.chain) / 2;
      setWallet(prev => ({ ...prev, zenBalance: prev.zenBalance - gasFee }));

      setMarketListings(prev => prev.filter(l => l.id !== id));
      setBeasts(prev => [...prev, { ...listing, price: undefined, ownerId: 'player', isStaked: false }]);
      addNotification("Listing Cancelled", `${listing.name} returned to Armory`, 'info');
  }, [addNotification]);

  const handleBuy = useCallback(async (beast: ZenBeast) => {
    if (!walletRef.current.isConnected) {
        addNotification("Wallet Locked", "Connect wallet to trade.", 'warning');
        return;
    }
    
    const totalCost = (beast.price || 0) + estimateGas(walletRef.current.chain);

    if (walletRef.current.zenBalance < totalCost) {
        addNotification("Purchase Failed", `Insufficient ZEN. Cost: ${totalCost.toFixed(4)}`, 'error');
        return;
    }

    try {
        await simulateTransaction(walletRef.current.chain, 'transfer');
        setWallet(prev => ({ ...prev, zenBalance: prev.zenBalance - totalCost }));
        setMarketListings(prev => prev.filter(b => b.id !== beast.id));
        setBeasts(prev => [...prev, { ...beast, price: undefined, ownerId: 'player', isStaked: false, isOnChain: true }]);
        addNotification("Asset Acquired", `Purchased ${beast.name}`, 'success');
        setMarketHistory(prev => [`${beast.name} sold for ${beast.price} ZEN`, ...prev].slice(0, 5));
    } catch (e) {
        addNotification("Transaction Failed", "Blockchain rejected transfer.", 'error');
    }
  }, [addNotification]);

  // Debug methods
  const debugMethods = {
      addCoins: (amount: number) => setCoins(c => c + amount),
      addBeast: async () => { try { await handleMint(); } catch(e){} },
      levelUp: () => setTrainerLevel(l => l + 1),
      reset: () => {
          localStorage.clear();
          window.location.reload();
      }
  };

  return {
    coins,
    beasts,
    leaderboard,
    trainerLevel,
    trainerExp,
    activePerks,
    achievements,
    coinHistory,
    marketListings,
    marketHistory,
    notifications,
    wallet,
    quests,
    removeNotification,
    connectWallet,
    switchChain,
    claimEarnings,
    calculateMintPrice,
    handleMint,
    handleBreed,
    handleEvolve,
    handleBattle,
    handleRename,
    handleListForSale,
    handleCancelListing,
    handleBuy,
    handleStake,
    handleUnstake,
    claimStakingRewards,
    claimAllStakingRewards,
    claimQuestReward,
    debugMethods
  };
};
