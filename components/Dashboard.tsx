
import React, { useState, useMemo } from 'react';
import { ZenBeast, LeaderboardEntry, TrainerPerk, Achievement } from '../types';
import { Coins, Zap, Box, Activity, Trophy, CircuitBoard, Unlock, Star, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
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

// Optimization: Dashboard is expensive to render due to charts and lists.
// Memoizing it prevents re-renders when parent state (like inventory filters or unread logs) changes but dashboard props remain stable.
const Dashboard = React.memo(({ beasts, coins, leaderboard, trainerLevel, trainerExp, activePerks, achievements, coinHistory, onClaim }: DashboardProps) => {
  // Optimization: Prevent O(N) calculation on every render
  const totalPower = useMemo(() => beasts.reduce((acc, b) => acc + b.stats.attack + b.stats.defense + b.stats.speed + b.stats.zen, 0), [beasts]);
  const [claimAmount, setClaimAmount] = useState<string>('1000');

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-mono text-white mb-1">COMMAND CENTER</h2>
          <p className="text-gray-500 font-mono text-sm tracking-wider">ECOSYSTEM OVERVIEW // REALTIME ANALYTICS</p>
        </div>
        <div className="text-right hidden md:block">
            <div className="text-neon-blue font-mono text-2xl font-bold">LEVEL {trainerLevel}</div>
            <div className="text-xs text-gray-500 font-mono">{trainerExp} XP</div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700 p-6 cyber-border group hover:border-neon-green transition-colors">
          <h3 className="text-gray-400 text-xs font-mono mb-2 tracking-widest">OFF-CHAIN LIQUIDITY</h3>
          <div className="text-4xl text-neon-green font-mono flex items-center group-hover:scale-105 transition-transform origin-left">
            <Coins className="mr-3" size={32} /> {coins.toLocaleString()} <span className="text-xs ml-2 text-gray-500">ZC</span>
          </div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700 p-6 cyber-border group hover:border-neon-pink transition-colors">
          <h3 className="text-gray-400 text-xs font-mono mb-2 tracking-widest">COLONY POWER</h3>
          <div className="text-4xl text-neon-pink font-mono flex items-center group-hover:scale-105 transition-transform origin-left">
            <Zap className="mr-3" size={32} /> {totalPower.toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700 p-6 cyber-border group hover:border-neon-blue transition-colors">
          <h3 className="text-gray-400 text-xs font-mono mb-2 tracking-widest">BEAST COUNT</h3>
          <div className="text-4xl text-neon-blue font-mono flex items-center group-hover:scale-105 transition-transform origin-left">
            <Box className="mr-3" size={32} /> {beasts.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Economy Management */}
        <div className="space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700 p-6 cyber-border">
                 <h3 className="text-neon-yellow font-mono mb-6 flex items-center tracking-wider"><Coins className="mr-2" size={18}/> BRIDGE TO CHAIN</h3>
                 <div className="space-y-4">
                     <div className="text-xs text-gray-400 font-mono">
                        CONVERT GAME EARNINGS TO CRYPTO.
                        <br/>RATE: 100 ZC = {TOKENOMICS.SWAP_RATE * 100} ZEN
                        <br/>MIN CLAIM: {TOKENOMICS.CLAIM_THRESHOLD} ZC
                     </div>
                     <div className="flex gap-2">
                         <input 
                            type="number" 
                            value={claimAmount}
                            onChange={(e) => setClaimAmount(e.target.value)}
                            aria-label="Amount to claim in ZenCoins"
                            className="bg-black/50 border border-gray-700 text-white w-full px-3 py-2 text-sm font-mono outline-none focus:border-neon-yellow"
                         />
                         <CyberButton variant="secondary" onClick={() => onClaim(parseInt(claimAmount))} className="text-xs">
                             CLAIM
                         </CyberButton>
                     </div>
                 </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700 p-6 cyber-border">
                <h3 className="text-neon-purple font-mono mb-4 flex items-center tracking-wider"><Star className="mr-2" size={18}/> ACHIEVEMENTS</h3>
                <div className="grid grid-cols-4 gap-2">
                    {achievements.map(ach => (
                        <button
                          key={ach.id}
                          className={`aspect-square flex items-center justify-center rounded border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue ${ach.unlocked ? 'border-neon-yellow bg-neon-yellow/10 text-neon-yellow' : 'border-gray-800 bg-black/40 text-gray-700'}`}
                          title={ach.title + ": " + ach.description}
                          aria-label={`${ach.title}: ${ach.description} (${ach.unlocked ? 'Unlocked' : 'Locked'})`}
                        >
                            <Trophy size={20} />
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-sm border border-slate-700 p-6 cyber-border h-96">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-neon-blue font-mono flex items-center tracking-wider"><Activity className="mr-2" size={18}/> EARNINGS INDEX</h3>
                <span className="text-xs text-gray-500 font-mono animate-pulse">LIVE FEED</span>
            </div>
            <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={coinHistory}>
                <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00ffff" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#444" fontSize={10} tickLine={false} />
                <YAxis stroke="#444" fontSize={10} tickLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }} 
                    itemStyle={{ color: '#00ffff' }}
                />
                <Area type="monotone" dataKey="val" stroke="#00ffff" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard & Recent Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700 p-6 cyber-border">
            <h3 className="text-neon-yellow font-mono mb-6 flex items-center tracking-wider"><Trophy className="mr-2" size={18}/> GLOBAL RANKING</h3>
            <div className="space-y-4">
                {leaderboard.slice(0, 5).map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 hover:bg-white/5 p-1 rounded transition-colors">
                        <div className="flex items-center">
                            <span className={`w-6 h-6 flex items-center justify-center rounded bg-slate-800 mr-3 font-mono text-xs ${idx === 0 ? 'text-black bg-neon-yellow font-bold' : 'text-gray-400'}`}>#{entry.rank}</span>
                            <span className="text-gray-300 font-medium">{entry.name}</span>
                        </div>
                        <span className="text-neon-blue font-mono text-xs">{entry.score.toLocaleString()} PTS</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="lg:col-span-2">
            <div className="flex justify-between items-end mb-4 border-b border-gray-800 pb-2">
                <h2 className="text-xl text-white font-mono tracking-wider">RECENT ACQUISITIONS</h2>
                <button
                  className="text-xs text-neon-blue cursor-pointer hover:underline bg-transparent border-none p-0 focus:outline-none focus:ring-2 focus:ring-neon-blue rounded px-1"
                  aria-label="View all recent acquisitions"
                >
                  VIEW ALL
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {beasts.slice(-4).reverse().map(b => <BeastCard key={b.id} beast={b} small />)}
            {beasts.length === 0 && <div className="col-span-4 text-center text-gray-600 font-mono py-8">NO BEASTS DETECTED</div>}
            </div>
        </div>
      </div>
    </div>
  );
});

export default Dashboard;
