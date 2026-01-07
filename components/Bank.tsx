import React, { useState, useEffect } from 'react';
import { ZenBeast, Wallet, EconomicMetrics } from '../types';
import { LandPlot, TrendingUp, TrendingDown, Lock, Unlock, DollarSign, Wallet as WalletIcon, Clock, Layers, Shield, Activity } from 'lucide-react';
import { STAKING_RATES, GENESIS_MULTIPLIER } from '../constants';
import BeastCard from './BeastCard';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';

interface BankProps {
    beasts: ZenBeast[];
    wallet: Wallet;
    onStake: (id: string) => void;
    onUnstake: (id: string) => void;
    onClaimRewards: (id: string) => void;
    onClaimAll: () => void;
}

const Bank: React.FC<BankProps> = ({ beasts, wallet, onStake, onUnstake, onClaimRewards, onClaimAll }) => {
    const [marketTrend, setMarketTrend] = useState<'bull' | 'bear'>('bull');
    const [liveData, setLiveData] = useState<{time: number, price: number}[]>([]);
    
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

    const [, setTick] = useState(0);
    useEffect(() => {
        const i = setInterval(() => setTick(t => t + 1), 5000);
        return () => clearInterval(i);
    }, []);

    const currentPrice = liveData.length > 0 ? liveData[liveData.length - 1].price : 0;

    const getVaultTier = (beast: ZenBeast) => {
        if (!beast.stakingStart) return 'BRONZE';
        const hours = (Date.now() - beast.stakingStart) / (1000 * 60 * 60);
        if (hours > 24) return 'GOLD';
        if (hours > 1) return 'SILVER';
        return 'BRONZE';
    }

    const tierColors = {
        'BRONZE': 'text-orange-400 border-orange-400 bg-orange-400/5',
        'SILVER': 'text-slate-300 border-slate-300 bg-slate-300/5',
        'GOLD': 'text-accent border-accent bg-accent/5',
    }

    return (
        <div className="h-full flex flex-col space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-8 h-[2px] bg-primary"></span>
                        <h2 className="text-4xl font-display font-black text-foreground tracking-tight uppercase italic">NEURAL <span className="text-primary">VAULT</span></h2>
                    </div>
                    <p className="text-sm text-muted-foreground font-display font-bold tracking-widest uppercase ml-10">LIQUIDITY POOLS // YIELD GENERATION</p>
                </div>
                <div className="flex bg-card/40 backdrop-blur-md border border-border px-6 py-3 rounded-xl gap-6 items-center">
                    <div className="text-right">
                        <div className="text-[10px] text-muted-foreground font-display font-bold uppercase tracking-widest mb-1">ZEN INDEX</div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-display font-black text-foreground italic uppercase leading-none">${currentPrice.toFixed(2)}</span>
                            {marketTrend === 'bull' ? <TrendingUp className="text-accent animate-bounce" size={16}/> : <TrendingDown className="text-destructive animate-pulse" size={16}/>}
                        </div>
                    </div>
                    <div className="w-[1px] h-8 bg-border"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-muted-foreground font-display font-bold uppercase tracking-widest mb-1">MARKET CAP</div>
                        <div className="text-xl font-display font-black text-foreground italic uppercase leading-none">$124.5M</div>
                    </div>
                </div>
            </header>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="cyber-card p-8 group">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-muted-foreground text-[10px] font-display font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                            <WalletIcon size={14} className="text-primary" />
                            VAULTED ASSETS
                        </h3>
                        <span className="text-[10px] font-mono text-primary font-bold">{stakedBeasts.length} UNITS</span>
                    </div>
                    <div className="text-4xl text-foreground font-display font-black italic uppercase leading-none mb-2">
                        {wallet.zenBalance.toFixed(2)} <span className="text-primary text-2xl">ZEN</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-display font-bold tracking-widest uppercase">TOTAL PORTFOLIO VALUE: ${(wallet.zenBalance * currentPrice).toFixed(2)} USD</p>
                </div>

                <div className="cyber-card p-8 group">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-muted-foreground text-[10px] font-display font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                            <Clock size={14} className="text-accent" />
                            CURRENT YIELD
                        </h3>
                        <span className="text-[10px] font-mono text-accent font-bold">ACTIVE</span>
                    </div>
                    <div className="text-4xl text-accent font-display font-black italic uppercase leading-none mb-2 animate-pulse">
                        +{totalStakingPower.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-display font-bold tracking-widest uppercase">ZEN COINS GENERATED PER HOUR</p>
                </div>

                <div className="cyber-card p-2 relative overflow-hidden h-32">
                    <div className="absolute top-4 left-4 z-10">
                        <div className="text-[8px] text-primary font-display font-black uppercase tracking-[0.2em]">ZEN/USD REALTIME</div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={liveData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsla(var(--primary))" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="hsla(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area 
                                type="monotone" 
                                dataKey="price" 
                                stroke="hsla(var(--primary))" 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill="url(#colorPrice)" 
                                isAnimationActive={false} 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[500px]">
                {/* Available Assets */}
                <div className="flex flex-col space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <h3 className="text-xs font-display font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                            <Layers size={16} className="text-primary"/> 
                            AVAILABLE ASSETS ({unstakedBeasts.length})
                        </h3>
                        <span className="text-[10px] text-muted-foreground font-display font-bold uppercase tracking-widest">READY TO STAKE</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {unstakedBeasts.map(b => (
                            <div key={b.id} className="group p-4 rounded-xl border border-border bg-card/40 hover:border-primary/50 hover:bg-card/60 transition-all duration-300 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img src={b.imageUrl} className="w-12 h-12 rounded-lg object-cover border border-border group-hover:border-primary/30 transition-all" />
                                    <div>
                                        <div className="text-sm font-display font-black text-foreground uppercase italic group-hover:text-primary transition-colors">{b.name}</div>
                                        <div className="text-[8px] text-muted-foreground font-display font-bold uppercase tracking-[0.2em]">GEN {b.generation} // {b.rarity}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-accent font-display font-black uppercase tracking-widest mb-2">APY: {STAKING_RATES[b.rarity]}%</div>
                                    <button 
                                        onClick={() => onStake(b.id)} 
                                        className="px-6 py-2 bg-primary text-primary-foreground font-display font-black text-[10px] tracking-widest uppercase rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                    >
                                        STAKE UNIT
                                    </button>
                                </div>
                            </div>
                        ))}
                        {unstakedBeasts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-2xl bg-muted/5 opacity-40">
                                <Shield size={32} className="mb-4" />
                                <p className="text-[10px] font-display font-bold uppercase tracking-[0.2em]">NO UNITS DETECTED</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Staked Vault */}
                <div className="flex flex-col space-y-6 relative">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <h3 className="text-xs font-display font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                            <Lock size={16} className="text-primary animate-pulse"/> 
                            LOCKED IN VAULT ({stakedBeasts.length})
                        </h3>
                        {stakedBeasts.length > 0 && (
                            <button 
                                onClick={onClaimAll}
                                className="flex items-center gap-2 text-[10px] font-display font-black text-accent border border-accent/30 px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all uppercase tracking-widest"
                            >
                                <Sparkles size={12} /> HARVEST ALL
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                         {stakedBeasts.map(b => {
                             const pending = calculateCurrentReward(b);
                             const tier = getVaultTier(b);
                             const tierClass = tierColors[tier as keyof typeof tierColors];

                             return (
                                <div key={b.id} className={`group p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${tier === 'GOLD' ? 'border-accent bg-accent/5' : 'border-border bg-card/40 hover:border-primary/50'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img src={b.imageUrl} className="w-12 h-12 rounded-lg object-cover border border-border opacity-60" />
                                            <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] rounded-lg"></div>
                                            <Lock size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary drop-shadow-lg" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-display font-black text-foreground uppercase italic">{b.name}</div>
                                            <div className={`text-[8px] font-display font-black border px-2 py-0.5 rounded-sm uppercase tracking-widest mt-1 inline-block ${tierClass}`}>
                                                {tier} VAULT PROTOCOL
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-[8px] text-muted-foreground font-display font-bold uppercase tracking-widest mb-1">ACCUMULATED</div>
                                            <div className="text-sm font-mono font-bold text-accent">+{pending.toFixed(4)} ZEN</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => onClaimRewards(b.id)} 
                                                className="p-3 bg-card border border-border text-foreground hover:text-accent hover:border-accent transition-all rounded-lg"
                                                title="Claim Yield"
                                            >
                                                <DollarSign size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => onUnstake(b.id)} 
                                                className="p-3 bg-card border border-border text-foreground hover:text-destructive hover:border-destructive transition-all rounded-lg"
                                                title="Unlock Asset"
                                            >
                                                <Unlock size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                             )
                         })}
                         {stakedBeasts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-2xl bg-muted/5 opacity-40">
                                <Activity size={32} className="mb-4" />
                                <p className="text-[10px] font-display font-bold uppercase tracking-[0.2em]">VAULT DEPLOYED // EMPTY</p>
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Bank;
