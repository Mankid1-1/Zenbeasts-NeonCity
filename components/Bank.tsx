
import React, { useState, useEffect } from 'react';
import { ZenBeast, Wallet, EconomicMetrics } from '../types';
import { SectionHeader, CyberButton } from './common/CyberComponents';
import { LandPlot, TrendingUp, TrendingDown, Lock, Unlock, DollarSign, Wallet as WalletIcon, Clock, Layers, Shield } from 'lucide-react';
import { STAKING_RATES, GENESIS_MULTIPLIER } from '../constants';
import BeastCard from './BeastCard';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface BankProps {
    beasts: ZenBeast[];
    wallet: Wallet;
    onStake: (id: string) => void;
    onUnstake: (id: string) => void;
    onClaimRewards: (id: string) => void;
    onClaimAll: () => void;
}

const Bank: React.FC<BankProps> = ({ beasts, wallet, onStake, onUnstake, onClaimRewards, onClaimAll }) => {
    const [selectedBeast, setSelectedBeast] = useState<ZenBeast | null>(null);
    const [marketTrend, setMarketTrend] = useState<'bull' | 'bear'>('bull');
    const [liveData, setLiveData] = useState<{time: number, price: number}[]>([]);
    
    // Initialize mock market data
    useEffect(() => {
        const initialData = Array.from({ length: 20 }, (_, i) => ({
            time: i,
            price: 1.2 + Math.random() * 0.4 + (Math.sin(i / 3) * 0.2)
        }));
        setLiveData(initialData);

        const interval = setInterval(() => {
            setLiveData(prev => {
                const last = prev[prev.length - 1];
                const newPrice = Math.max(0.5, last.price + (Math.random() - 0.45) * 0.1);
                setMarketTrend(newPrice > last.price ? 'bull' : 'bear');
                return [...prev.slice(1), { time: last.time + 1, price: newPrice }];
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    
    // Derived Metrics
    const stakedBeasts = beasts.filter(b => b.isStaked);
    const unstakedBeasts = beasts.filter(b => !b.isStaked && !b.isSoulbound); 
    
    const totalPendingRewards = stakedBeasts.reduce((acc, b) => acc + (b.accumulatedRewards || 0), 0);
    const totalStakingPower = stakedBeasts.reduce((acc, b) => {
        let rate = STAKING_RATES[b.rarity] || 0.1;
        if (b.generation === 0) rate *= GENESIS_MULTIPLIER;
        return acc + rate;
    }, 0);

    const calculateCurrentReward = (beast: ZenBeast) => {
        if (!beast.isStaked || !beast.stakingStart) return 0;
        const now = Date.now();
        const hoursStaked = (now - beast.stakingStart) / (1000 * 60 * 60);
        let rate = STAKING_RATES[beast.rarity];
        if (beast.generation === 0) rate *= GENESIS_MULTIPLIER;
        return (beast.accumulatedRewards || 0) + (hoursStaked * rate);
    };

    // Force refresh for reward display tick
    const [, setTick] = useState(0);
    useEffect(() => {
        const i = setInterval(() => setTick(t => t + 1), 5000);
        return () => clearInterval(i);
    }, []);

    const currentPrice = liveData.length > 0 ? liveData[liveData.length - 1].price : 0;

    // Helper to determine Vault Tier based on stake time (mocked for visualization)
    const getVaultTier = (beast: ZenBeast) => {
        if (!beast.stakingStart) return 'BRONZE';
        const hours = (Date.now() - beast.stakingStart) / (1000 * 60 * 60);
        if (hours > 24) return 'GOLD';
        if (hours > 1) return 'SILVER';
        return 'BRONZE';
    }

    const tierColors = {
        'BRONZE': 'text-orange-400 border-orange-400',
        'SILVER': 'text-gray-300 border-gray-300',
        'GOLD': 'text-yellow-400 border-yellow-400',
    }

    return (
        <div className="h-full flex flex-col animate-fade-in-up pb-8">
            <SectionHeader 
                title="NEURAL VAULT" 
                subtitle="DECENTRALIZED FINANCE // STAKING // LIQUIDITY" 
                icon={<LandPlot />} 
                rightElement={
                    <div className="flex flex-col items-end">
                        <div className="text-neon-yellow font-mono text-xl font-bold flex items-center">
                            1 ZEN = ${currentPrice.toFixed(2)} USD
                            {marketTrend === 'bull' ? <TrendingUp className="ml-2 text-neon-green" size={20}/> : <TrendingDown className="ml-2 text-red-500" size={20}/>}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">MARKET CAP: $124.5M</div>
                    </div>
                }
            />

            {/* Overview Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Portfolio */}
                <div className="bg-slate-900/60 border border-slate-700 p-6 cyber-border">
                    <h3 className="text-gray-400 text-xs font-mono mb-4 tracking-widest flex items-center"><WalletIcon size={14} className="mr-2"/> ON-CHAIN ASSETS</h3>
                    <div className="flex justify-between items-end mb-2">
                         <div>
                             <div className="text-3xl text-white font-mono">{wallet.zenBalance.toFixed(4)} <span className="text-sm text-neon-yellow">ZEN</span></div>
                             <div className="text-xs text-gray-500 font-mono">≈ ${(wallet.zenBalance * currentPrice).toFixed(2)} USD</div>
                         </div>
                         <div className="text-right">
                             <div className="text-xl text-neon-blue font-mono">{stakedBeasts.length}</div>
                             <div className="text-[10px] text-gray-500 font-mono uppercase">Vaulted Beasts</div>
                         </div>
                    </div>
                </div>

                {/* Yields */}
                <div className="bg-slate-900/60 border border-slate-700 p-6 cyber-border">
                    <h3 className="text-gray-400 text-xs font-mono mb-4 tracking-widest flex items-center"><Clock size={14} className="mr-2"/> YIELD FARMING</h3>
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <div className="text-3xl text-neon-green font-mono animate-pulse">+{totalStakingPower.toFixed(2)}</div>
                            <div className="text-xs text-gray-500 font-mono">ZEN / HOUR</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl text-neon-yellow font-mono">{totalPendingRewards.toFixed(4)}</div>
                            <div className="text-[10px] text-gray-500 font-mono uppercase">Pending Claim</div>
                        </div>
                    </div>
                </div>

                {/* Market Graph */}
                <div className="bg-slate-900/60 border border-slate-700 p-2 cyber-border relative overflow-hidden">
                    <div className="absolute top-2 left-2 text-[10px] text-gray-500 font-mono z-10">ZEN/USD [1H]</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={liveData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00ffff" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#00ffff" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="price" stroke="#00ffff" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full min-h-[400px]">
                {/* Unstaked Column */}
                <div className="bg-black/40 border border-gray-800 p-4 flex flex-col">
                    <h3 className="text-white font-mono mb-4 border-b border-gray-700 pb-2 flex justify-between">
                        <span>AVAILABLE ASSETS</span>
                        <span className="text-xs text-gray-500">{unstakedBeasts.length}</span>
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {unstakedBeasts.map(b => (
                            <div key={b.id} className="flex items-center justify-between p-2 border border-gray-700 bg-slate-900/50 hover:border-neon-blue transition-colors group">
                                <div className="flex items-center gap-3">
                                    <img src={b.imageUrl} className="w-10 h-10 object-cover border border-gray-600"/>
                                    <div>
                                        <div className="text-xs font-bold text-white">{b.name}</div>
                                        <div className="text-[10px] text-gray-400 font-mono">GEN {b.generation} • {b.rarity}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-neon-green mb-1">APY: {STAKING_RATES[b.rarity]}%</div>
                                    <CyberButton onClick={() => onStake(b.id)} variant="primary" className="text-[10px] py-1 px-2 h-auto">
                                        STAKE
                                    </CyberButton>
                                </div>
                            </div>
                        ))}
                        {unstakedBeasts.length === 0 && <div className="text-center text-gray-600 text-xs font-mono mt-10">NO ELIGIBLE ASSETS</div>}
                    </div>
                </div>

                {/* Staked Column */}
                <div className="bg-black/40 border border-neon-blue/30 p-4 flex flex-col relative">
                    <div className="absolute inset-0 bg-neon-blue/5 pointer-events-none animate-pulse"></div>
                    <h3 className="text-neon-blue font-mono mb-4 border-b border-neon-blue/30 pb-2 flex justify-between relative z-10 items-center">
                        <div>
                             <span>LOCKED IN VAULT</span>
                             <span className="text-xs text-neon-blue ml-2">({stakedBeasts.length})</span>
                        </div>
                        {stakedBeasts.length > 0 && (
                            <button 
                                onClick={onClaimAll}
                                className="flex items-center gap-1 text-[10px] bg-neon-green/20 text-neon-green border border-neon-green px-2 py-1 rounded hover:bg-neon-green hover:text-black transition-colors"
                            >
                                <Layers size={10} /> HARVEST ALL
                            </button>
                        )}
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar relative z-10">
                         {stakedBeasts.map(b => {
                             const pending = calculateCurrentReward(b);
                             const tier = getVaultTier(b);
                             const tierColor = tierColors[tier];

                             return (
                                <div key={b.id} className={`flex items-center justify-between p-2 border bg-slate-900/80 shadow-[0_0_10px_rgba(0,255,255,0.1)] ${tier === 'GOLD' ? 'border-yellow-400' : 'border-neon-blue/50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img src={b.imageUrl} className={`w-10 h-10 object-cover border opacity-70 ${tierColor.split(' ')[1]}`}/>
                                            <Lock size={12} className={`absolute -top-1 -right-1 bg-black rounded-full ${tierColor.split(' ')[0]}`}/>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">{b.name}</div>
                                            <div className={`text-[10px] font-mono border px-1 rounded inline-block ${tierColor}`}>
                                                {tier} VAULT
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right mr-2">
                                            <div className="text-[10px] text-gray-500">PENDING</div>
                                            <div className="text-xs text-neon-yellow font-mono">+{pending.toFixed(4)}</div>
                                        </div>
                                        <button onClick={() => onClaimRewards(b.id)} className="p-1 hover:text-neon-green transition-colors" title="Claim Rewards" aria-label={`Claim rewards for ${b.name}`}><DollarSign size={14}/></button>
                                        <button onClick={() => onUnstake(b.id)} className="p-1 hover:text-red-500 transition-colors" title="Unstake & Claim" aria-label={`Unstake ${b.name} and claim rewards`}><Unlock size={14}/></button>
                                    </div>
                                </div>
                             )
                         })}
                         {stakedBeasts.length === 0 && <div className="text-center text-gray-600 text-xs font-mono mt-10">VAULT EMPTY</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Bank;
