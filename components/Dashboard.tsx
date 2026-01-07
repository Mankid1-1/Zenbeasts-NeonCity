
import React, { useState, useMemo } from 'react';
import { ZenBeast, LeaderboardEntry, TrainerPerk, Achievement } from '../types';
import { Coins, Zap, Box, Activity, Trophy, Star } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import BeastCard from './BeastCard';
import { TOKENOMICS } from '../constants';
import { CyberButton } from './common/CyberComponents';

interface DashboardProps {
  beasts: ZenBeast[];
  coins: number; // Soft
  leaderboard: LeaderboardEntry[];
  trainerLevel: number;
  trainerExp: number;
  activePerks: TrainerPerk[];
  achievements: Achievement[];
  coinHistory: { name: string, val: number }[];
  onClaim: (amount: number) => void;
}

const Dashboard: React.FC<DashboardProps> = React.memo(({ beasts, coins, leaderboard, trainerLevel, trainerExp, activePerks, achievements, coinHistory, onClaim }) => {
  const totalPower = useMemo(() => {
    return beasts.reduce((acc, b) => acc + b.stats.attack + b.stats.defense + b.stats.speed + b.stats.zen, 0);
  }, [beasts]);

  const [claimAmount, setClaimAmount] = useState<string>('1000');

  const topLeaderboard = useMemo(() => leaderboard.slice(0, 5), [leaderboard]);

  const recentBeasts = useMemo(() => {
    return beasts.slice(-4).reverse();
  }, [beasts]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-[2px] bg-primary"></span>
            <h2 className="text-4xl font-display font-black text-foreground tracking-tight uppercase italic">COMMAND <span className="text-primary">CENTER</span></h2>
          </div>
          <p className="text-sm text-muted-foreground font-display font-bold tracking-widest uppercase ml-10">SYSTEM OVERVIEW // DISTRICT 07 ANALYTICS</p>
        </div>
        <div className="flex items-center gap-6 bg-card/40 backdrop-blur-md px-6 py-3 rounded-xl border border-border">
            <div className="text-right">
                <div className="text-[10px] text-muted-foreground font-display font-bold uppercase tracking-widest">TRAINER LEVEL</div>
                <div className="text-2xl text-primary font-display font-black italic uppercase leading-none">LVL {trainerLevel}</div>
            </div>
            <div className="w-[1px] h-8 bg-border"></div>
            <div className="text-right">
                <div className="text-[10px] text-muted-foreground font-display font-bold uppercase tracking-widest">EXPERIENCE</div>
                <div className="text-2xl text-foreground font-mono font-bold leading-none">{trainerExp} XP</div>
            </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-card p-8 group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-muted-foreground text-[10px] font-display font-bold tracking-[0.2em] uppercase">LIQUID ASSETS</h3>
            <Coins className="text-accent group-hover:animate-bounce" size={20} />
          </div>
          <div className="text-5xl text-accent font-display font-black italic uppercase leading-none mb-2">
            {coins.toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-foreground font-display font-bold tracking-widest uppercase">OFF-CHAIN ZENCOINS</p>
        </div>

        <div className="cyber-card p-8 group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-muted-foreground text-[10px] font-display font-bold tracking-[0.2em] uppercase">COLONY STRENGTH</h3>
            <Zap className="text-secondary group-hover:animate-pulse" size={20} />
          </div>
          <div className="text-5xl text-secondary font-display font-black italic uppercase leading-none mb-2">
            {totalPower.toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-foreground font-display font-bold tracking-widest uppercase">AGGREGATE BATTLE RATING</p>
        </div>

        <div className="cyber-card p-8 group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-muted-foreground text-[10px] font-display font-bold tracking-[0.2em] uppercase">ACTIVE ENTITIES</h3>
            <Box className="text-primary group-hover:scale-110 transition-transform" size={20} />
          </div>
          <div className="text-5xl text-primary font-display font-black italic uppercase leading-none mb-2">
            {beasts.length}
          </div>
          <p className="text-[10px] text-muted-foreground font-display font-bold tracking-widest uppercase">COLLECTED BEAST UNITS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Economy Management */}
        <div className="space-y-8">
            <div className="cyber-card p-8">
                 <h3 className="text-lg font-display font-black text-foreground italic uppercase tracking-tighter mb-6 flex items-center gap-2">
                    <Coins className="text-accent" size={20}/> 
                    BRIDGE TO <span className="text-accent">CHAIN</span>
                 </h3>
                 <div className="space-y-6">
                     <div className="bg-background/50 p-4 rounded-lg border border-border border-dashed">
                        <p className="text-[10px] text-muted-foreground font-display font-bold tracking-widest uppercase mb-2">TRANSFER PROTOCOL</p>
                        <ul className="text-[10px] text-foreground font-mono space-y-1">
                            <li>RATE: 100 ZC = {TOKENOMICS.SWAP_RATE * 100} ZEN</li>
                            <li>MINIMUM: {TOKENOMICS.CLAIM_THRESHOLD} ZC</li>
                        </ul>
                     </div>
                     <div className="flex gap-2">
                         <input 
                            type="number" 
                            value={claimAmount}
                            onChange={(e) => setClaimAmount(e.target.value)}
                            className="bg-background/50 border border-border text-foreground w-full px-4 py-3 rounded-lg text-sm font-mono font-bold focus:border-accent outline-none transition-all"
                         />
                         <button 
                            onClick={() => onClaim(parseInt(claimAmount))} 
                            className="bg-accent text-accent-foreground font-display font-black px-6 py-3 rounded-lg hover:scale-105 transition-all duration-300 uppercase tracking-widest text-xs cyber-button"
                         >
                             CLAIM
                         </button>
                     </div>
                 </div>
            </div>

            <div className="cyber-card p-8">
                <h3 className="text-lg font-display font-black text-foreground italic uppercase tracking-tighter mb-6 flex items-center gap-2">
                    <Star className="text-secondary" size={20}/> 
                    SYSTEM <span className="text-secondary">MILESTONES</span>
                </h3>
                <div className="grid grid-cols-4 gap-3">
                    {achievements.map(ach => (
                        <div
                          key={ach.id}
                          className={`aspect-square flex items-center justify-center rounded-lg border transition-all duration-300 group relative ${ach.unlocked ? 'border-accent bg-accent/10 text-accent shadow-lg shadow-accent/10' : 'border-border bg-background/40 text-muted-foreground opacity-40'}`}
                          title={ach.title + ": " + ach.description}
                        >
                            <Trophy size={20} className={ach.unlocked ? "group-hover:scale-110" : ""} />
                            {ach.unlocked && <div className="absolute inset-0 bg-accent/5 animate-pulse rounded-lg"></div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 cyber-card p-8 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-lg font-display font-black text-foreground italic uppercase tracking-tighter flex items-center gap-2">
                    <Activity className="text-primary animate-pulse" size={20}/> 
                    EARNINGS <span className="text-primary">INDEX</span>
                </h3>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    <span className="text-[10px] text-muted-foreground font-display font-bold tracking-widest uppercase">LIVE ANALYTICS FEED</span>
                </div>
            </div>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={coinHistory}>
                        <defs>
                            <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsla(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsla(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="name" 
                            stroke="hsla(var(--muted-foreground) / 0.2)" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: 'hsla(var(--muted-foreground))', fontWeight: 'bold' }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'hsla(var(--card))', 
                                border: '1px solid hsla(var(--border))',
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                            }} 
                            itemStyle={{ color: 'hsla(var(--primary))', fontWeight: 'bold' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="val" 
                            stroke="hsla(var(--primary))" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorPrimary)" 
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Leaderboard & Recent Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="cyber-card p-8">
            <h3 className="text-lg font-display font-black text-foreground italic uppercase tracking-tighter mb-8 flex items-center gap-2">
                <Trophy className="text-accent" size={20}/> 
                GLOBAL <span className="text-accent">RANKING</span>
            </h3>
            <div className="space-y-4">
                {topLeaderboard.map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center group p-3 rounded-xl border border-transparent hover:border-border hover:bg-background/40 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-display font-black text-xs ${idx === 0 ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20' : 'bg-muted/50 text-muted-foreground'}`}>
                                {idx + 1}
                            </div>
                            <div>
                                <div className="text-sm font-display font-bold text-foreground group-hover:text-primary transition-colors">{entry.name}</div>
                                <div className="text-[10px] text-muted-foreground font-display font-bold uppercase tracking-widest">SECTOR 0{idx + 1}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-mono font-bold text-primary">{entry.score.toLocaleString()}</div>
                            <div className="text-[8px] text-muted-foreground font-display font-bold uppercase tracking-tighter">POINTS</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="lg:col-span-2">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-display font-black text-foreground italic uppercase tracking-tighter">RECENT <span className="text-primary">ACQUISITIONS</span></h2>
                    <p className="text-[10px] text-muted-foreground font-display font-bold tracking-widest uppercase">LATEST ENTITIES ADDED TO THE BARRACKS</p>
                </div>
                <button className="text-[10px] font-display font-black text-primary hover:text-foreground tracking-[0.2em] uppercase transition-colors px-4 py-2 border border-primary/20 rounded-full hover:border-foreground">
                    VIEW ALL UNITS
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recentBeasts.map(b => <BeastCard key={b.id} beast={b} small />)}
                {beasts.length === 0 && (
                    <div className="col-span-full cyber-card p-12 text-center">
                        <p className="text-muted-foreground font-display font-bold tracking-widest uppercase">NO BEAST UNITS DETECTED IN THE LOCAL SECTOR</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
});

// Optimization: Prevent re-renders when parent (App) re-renders but Dashboard props remain stable
export default Dashboard;
