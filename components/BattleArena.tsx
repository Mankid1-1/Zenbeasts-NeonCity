import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ZenBeast, GymLeader, BattleResult, LeaderboardEntry } from '../types';
import { Sword, Trophy, Skull, Activity, Shield, Zap, Target } from 'lucide-react';
import { GYM_LEADERS } from '../constants';
import { SectionHeader, CyberButton } from './common/CyberComponents';

interface BattleArenaProps {
  beasts: ZenBeast[];
  onBattle: (beast: ZenBeast, gymLeader?: GymLeader) => Promise<BattleResult | null>;
  leaderboard: LeaderboardEntry[];
}

const BattleVisuals = ({
    playerBeast,
    opponent,
    playerHp,
    enemyHp,
    shakePlayer,
    shakeEnemy,
    activeEffect
}: {
    playerBeast: ZenBeast | null,
    opponent: any,
    playerHp: number,
    enemyHp: number,
    shakePlayer: boolean,
    shakeEnemy: boolean,
    activeEffect: 'attack' | 'crit' | 'heal' | null
}) => {
    return (
        <div className="relative w-full h-[400px] bg-background border border-border rounded-2xl overflow-hidden flex items-end justify-between px-12 md:px-32 py-12 mb-8 group">
            {/* Environment Image */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop" 
                    className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                    alt="Arena"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            </div>

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(hsla(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(90deg,hsla(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-10 opacity-50"></div>

            {/* Player Side */}
            <div className={`relative z-20 flex flex-col items-center transition-all duration-100 ${shakePlayer ? '-translate-x-4 brightness-150' : ''}`}>
                 {activeEffect === 'crit' && !shakePlayer && (
                    <div className="absolute -top-12 text-secondary font-display font-black text-3xl animate-bounce neon-text-secondary">CRITICAL!</div>
                 )}
                 <div className="relative">
                     <div className="w-40 h-40 md:w-56 md:h-56 relative group">
                         <img
                            src={playerBeast?.imageUrl || ''}
                            alt={playerBeast?.name}
                            className={`w-full h-full object-contain filter drop-shadow-[0_0_20px_hsla(var(--primary)/0.5)] ${shakePlayer ? 'animate-shake' : 'animate-pulse'}`}
                         />
                         {/* Ground Shadow */}
                         <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-primary/20 blur-xl rounded-full"></div>
                     </div>
                     {/* HP Bar */}
                     <div className="absolute -bottom-12 left-0 right-0 w-48 mx-auto">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-display font-black text-primary uppercase tracking-widest">INTEGRITY</span>
                            <span className="text-[10px] font-mono font-bold text-primary">{Math.ceil(playerHp)}%</span>
                         </div>
                         <div className="h-2 bg-muted/30 rounded-full overflow-hidden border border-border">
                             <div className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_hsla(var(--primary)/0.5)]" style={{ width: `${playerHp}%` }}></div>
                         </div>
                     </div>
                 </div>
            </div>

            {/* VS CENTER */}
            <div className="relative z-20 mb-24 hidden md:flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center bg-background/50 backdrop-blur-md relative">
                    <span className="text-4xl font-display font-black italic text-foreground tracking-tighter neon-text">VS</span>
                    <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-20"></div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-12 h-[1px] bg-border"></span>
                    <span className="text-[8px] font-display font-bold text-muted-foreground uppercase tracking-[0.3em]">COMBAT PROTOCOL ACTIVE</span>
                    <span className="w-12 h-[1px] bg-border"></span>
                </div>
            </div>

            {/* Enemy Side */}
            <div className={`relative z-20 flex flex-col items-center transition-all duration-100 ${shakeEnemy ? 'translate-x-4 brightness-150' : ''}`}>
                 <div className="relative">
                     <div className="w-40 h-40 md:w-56 md:h-56 relative">
                         {opponent?.avatarUrl ? (
                             <img src={opponent.avatarUrl} className={`w-full h-full object-contain filter drop-shadow-[0_0_20px_hsla(var(--destructive)/0.5)] ${shakeEnemy ? 'animate-shake' : ''}`} alt="Enemy" />
                         ) : (
                             <Skull className={`w-full h-full text-destructive drop-shadow-[0_0_20px_hsla(var(--destructive)/0.5)] ${shakeEnemy ? 'animate-shake' : ''}`} size={120} />
                         )}
                         {/* Ground Shadow */}
                         <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-destructive/20 blur-xl rounded-full"></div>
                     </div>
                     {/* HP Bar */}
                     <div className="absolute -bottom-12 left-0 right-0 w-48 mx-auto">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-display font-black text-destructive uppercase tracking-widest">THREAT LVL</span>
                            <span className="text-[10px] font-mono font-bold text-destructive">{Math.ceil(enemyHp)}%</span>
                         </div>
                         <div className="h-2 bg-muted/30 rounded-full overflow-hidden border border-border">
                             <div className="h-full bg-destructive transition-all duration-500 shadow-[0_0_10px_hsla(var(--destructive)/0.5)]" style={{ width: `${enemyHp}%` }}></div>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    )
}

const FighterList = React.memo(({ beasts, selectedBeast, onSelect }: { beasts: ZenBeast[], selectedBeast: ZenBeast | null, onSelect: (b: ZenBeast) => void }) => {
    return (
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {beasts.map(b => (
                <button
                    key={b.id}
                    onClick={() => onSelect(b)}
                    className={`w-full group p-3 rounded-xl border transition-all duration-300 flex items-center gap-4 text-left ${selectedBeast?.id === b.id ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-card/40 hover:border-primary/30 hover:bg-card/60'}`}
                >
                    <div className="relative">
                        <img src={b.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-border group-hover:border-primary/50 transition-colors" />
                        <div className="absolute -top-1 -right-1 bg-background border border-border rounded-full p-0.5">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-display font-black text-sm text-foreground truncate group-hover:text-primary transition-colors uppercase italic">{b.name}</div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">LVL {b.level}</span>
                            <span className="text-[10px] font-display font-bold text-primary/60 uppercase">{b.class}</span>
                        </div>
                    </div>
                </button>
            ))}
            {beasts.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
                    <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-widest">NO UNITS AVAILABLE</p>
                </div>
            )}
        </div>
    );
});

const BattleArena = React.memo<BattleArenaProps>(({ beasts, onBattle, leaderboard }) => {
    const [selectedBeast, setSelectedBeast] = useState<ZenBeast | null>(null);
    const [selectedGymLeader, setSelectedGymLeader] = useState<GymLeader | null>(null);
    const [mode, setMode] = useState<'sparring' | 'gym'>('gym');
    const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
    const [isBattling, setIsBattling] = useState(false);
    
    const [playerHp, setPlayerHp] = useState(100);
    const [enemyHp, setEnemyHp] = useState(100);
    const [visibleLogs, setVisibleLogs] = useState<any[]>([]);
    const [shakePlayer, setShakePlayer] = useState(false);
    const [shakeEnemy, setShakeEnemy] = useState(false);
    const [activeEffect, setActiveEffect] = useState<'attack' | 'crit' | 'heal' | null>(null);

    const logIntervalRef = useRef<any>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [visibleLogs]);

    const handleBattle = async () => {
        if (!selectedBeast) return;
        setIsBattling(true);
        setBattleResult(null);
        setVisibleLogs([]);
        setPlayerHp(100);
        setEnemyHp(100);
        
        try {
            const res = await onBattle(selectedBeast, mode === 'gym' ? selectedGymLeader! : undefined);
            if (res) {
                setBattleResult(res);
                startLogPlayback(res.logs, selectedBeast.name);
            }
        } finally {
            setIsBattling(false);
        }
    };

    const startLogPlayback = (logs: any[], playerName: string) => {
        let index = 0;
        clearInterval(logIntervalRef.current);
        logIntervalRef.current = setInterval(() => {
            if (index < logs.length) {
                const log = logs[index];
                setVisibleLogs(prev => [...prev, log]);
                
                if (log.damage) {
                    const damagePercent = Math.min(25, log.damage / 2); 

                    if (log.isCritical) {
                        setActiveEffect('crit');
                        setTimeout(() => setActiveEffect(null), 500);
                    }

                    if (log.actor === playerName) {
                        setEnemyHp(prev => Math.max(0, prev - damagePercent));
                        setShakeEnemy(true);
                        setTimeout(() => setShakeEnemy(false), 300);
                    } else {
                        setPlayerHp(prev => Math.max(0, prev - damagePercent));
                        setShakePlayer(true);
                        setTimeout(() => setShakePlayer(false), 300);
                    }
                }
                index++;
            } else {
                clearInterval(logIntervalRef.current);
            }
        }, 800); 
    };

    const resetBattle = () => {
        setBattleResult(null);
        setVisibleLogs([]);
        setPlayerHp(100);
        setEnemyHp(100);
    };

    useEffect(() => { return () => clearInterval(logIntervalRef.current); }, []);

    const unstakedBeasts = useMemo(() => beasts.filter(b => !b.isStaked), [beasts]);

    const currentOpponent = mode === 'gym' && selectedGymLeader
        ? selectedGymLeader
        : { name: 'ROGUE ENTITY', avatarUrl: null };

    return (
        <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-8 h-[2px] bg-primary"></span>
                        <h2 className="text-4xl font-display font-black text-foreground tracking-tight uppercase italic">NEON <span className="text-primary">ARENA</span></h2>
                    </div>
                    <p className="text-sm text-muted-foreground font-display font-bold tracking-widest uppercase ml-10">COMBAT PROTOCOLS // RANKED ENGAGEMENTS</p>
                </div>
                <div className="flex bg-card/40 backdrop-blur-md border border-border p-1.5 rounded-xl">
                    <button
                        onClick={() => setMode('gym')}
                        className={`px-6 py-2 rounded-lg text-xs font-display font-black uppercase tracking-widest transition-all ${mode === 'gym' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        GYM CHALLENGE
                    </button>
                    <button
                        onClick={() => setMode('sparring')}
                        className={`px-6 py-2 rounded-lg text-xs font-display font-black uppercase tracking-widest transition-all ${mode === 'sparring' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        NETWORK SPAR
                    </button>
                </div>
            </header>

            {!battleResult && !isBattling ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 pb-10">
                    {/* Selection */}
                    <div className="lg:col-span-3 cyber-card p-6 flex flex-col min-h-[500px]">
                         <h3 className="text-xs font-display font-black text-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Activity className="text-primary" size={16}/> 
                            READY UNITS
                         </h3>
                         <FighterList beasts={unstakedBeasts} selectedBeast={selectedBeast} onSelect={setSelectedBeast} />
                    </div>

                    {/* Arena Setup */}
                    <div className="lg:col-span-6 flex flex-col cyber-card p-8 items-center justify-between min-h-[500px] relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none"></div>
                         
                         <div className="flex w-full justify-between items-start z-10">
                            <div className="w-[40%] text-center">
                                <div className="text-[10px] text-primary font-display font-black uppercase tracking-[0.2em] mb-4">CHALLENGER</div>
                                {selectedBeast ? (
                                    <div className="space-y-4 animate-in zoom-in-95 duration-500">
                                        <div className="relative inline-block">
                                            <img src={selectedBeast.imageUrl} className="w-40 h-40 object-cover rounded-2xl border-2 border-primary shadow-2xl shadow-primary/20 group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 border border-primary/20 rounded-2xl animate-pulse"></div>
                                        </div>
                                        <div className="font-display font-black text-lg text-foreground uppercase italic neon-text">{selectedBeast.name}</div>
                                    </div>
                                ) : (
                                    <div className="w-40 h-40 mx-auto border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground gap-2">
                                        <Zap size={24} className="opacity-20" />
                                        <span className="text-[10px] font-display font-bold uppercase tracking-widest">AWAITING SELECTION</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center py-16">
                                <div className="text-5xl font-display font-black italic text-destructive tracking-tighter animate-pulse drop-shadow-[0_0_15px_hsla(var(--destructive)/0.5)]">VS</div>
                            </div>

                            <div className="w-[40%] text-center">
                                <div className="text-[10px] text-destructive font-display font-black uppercase tracking-[0.2em] mb-4">TARGET</div>
                                {mode === 'gym' && selectedGymLeader ? (
                                    <div className="space-y-4 animate-in zoom-in-95 duration-500">
                                        <div className="relative inline-block">
                                            <img src={selectedGymLeader.avatarUrl} className="w-40 h-40 object-cover rounded-2xl border-2 border-destructive shadow-2xl shadow-destructive/20 grayscale group-hover:grayscale-0 transition-all duration-500" />
                                            <div className="absolute inset-0 border border-destructive/20 rounded-2xl animate-pulse"></div>
                                        </div>
                                        <div className="font-display font-black text-lg text-foreground uppercase italic">{selectedGymLeader.name}</div>
                                    </div>
                                ) : mode === 'sparring' ? (
                                    <div className="space-y-4 animate-in zoom-in-95 duration-500">
                                        <div className="w-40 h-40 mx-auto bg-muted/20 border-2 border-destructive rounded-2xl flex items-center justify-center text-destructive">
                                            <Skull size={64} className="animate-pulse" />
                                        </div>
                                        <div className="font-display font-black text-lg text-foreground uppercase italic">ROGUE_AI</div>
                                    </div>
                                ) : (
                                    <div className="w-40 h-40 mx-auto border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground gap-2">
                                        <Target size={24} className="opacity-20" />
                                        <span className="text-[10px] font-display font-bold uppercase tracking-widest">AWAITING TARGET</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {mode === 'gym' && (
                            <div className="w-full mt-12 z-10">
                                <h4 className="text-[10px] text-muted-foreground font-display font-bold uppercase tracking-[0.2em] mb-4 text-center">SELECT SECTOR GUARDIAN</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    {GYM_LEADERS.map(l => (
                                        <button
                                            key={l.id}
                                            onClick={() => setSelectedGymLeader(l)}
                                            className={`p-4 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden group/btn ${selectedGymLeader?.id === l.id ? 'border-secondary bg-secondary/5 shadow-lg shadow-secondary/10' : 'border-border bg-background/40 hover:border-secondary/50'}`}
                                        >
                                            <div className="text-[8px] text-secondary font-display font-black tracking-widest uppercase mb-1">DIFFICULTY: {l.difficulty}</div>
                                            <div className="font-display font-black text-[10px] text-foreground truncate uppercase">{l.name}</div>
                                            {selectedGymLeader?.id === l.id && <div className="absolute top-0 right-0 w-1 h-full bg-secondary"></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={handleBattle} 
                            disabled={!selectedBeast || (mode === 'gym' && !selectedGymLeader)} 
                            className="w-full mt-12 py-5 bg-primary text-primary-foreground font-display font-black tracking-[0.3em] uppercase rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                        >
                            {mode === 'gym' ? 'INITIATE CONFLICT' : 'SCAN NETWORK'}
                        </button>
                    </div>

                    {/* Leaderboard */}
                    <div className="lg:col-span-3 cyber-card p-6 flex flex-col">
                         <h3 className="text-xs font-display font-black text-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Trophy className="text-accent" size={16}/> 
                            TOP ELIMINATORS
                         </h3>
                         <div className="space-y-4">
                            {leaderboard.map((e, i) => (
                                <div key={i} className="flex justify-between items-center group p-2 rounded-lg hover:bg-background/40 transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-mono font-bold ${i === 0 ? 'text-accent' : 'text-muted-foreground'}`}>#{e.rank}</span>
                                        <span className="text-xs font-display font-bold text-foreground group-hover:text-primary transition-colors truncate w-24">{e.name}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-primary font-bold">{e.score}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            ) : null}

            {isBattling && !battleResult && (
                 <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[60] flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="relative mb-12">
                        <Sword size={80} className="text-primary animate-spin" />
                        <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-20"></div>
                    </div>
                    <div className="text-3xl font-display font-black text-primary italic uppercase tracking-tighter animate-pulse neon-text">CALCULATING OUTCOME...</div>
                    <div className="mt-4 text-[10px] text-muted-foreground font-display font-bold uppercase tracking-[0.4em]">SYNCING WITH THE NEURAL NET</div>
                </div>
            )}

            {battleResult && (
                <div className="flex-1 flex flex-col items-center justify-start animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
                    <div className="w-full max-w-6xl mx-auto">
                        <BattleVisuals
                            playerBeast={selectedBeast}
                            opponent={currentOpponent}
                            playerHp={playerHp}
                            enemyHp={enemyHp}
                            shakePlayer={shakePlayer}
                            shakeEnemy={shakeEnemy}
                            activeEffect={activeEffect}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Log */}
                            <div className="lg:col-span-8 cyber-card p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xs font-display font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Activity size={16} className="text-primary" />
                                        ACTION LOG
                                    </h3>
                                    <span className="text-[8px] text-muted-foreground font-mono animate-pulse tracking-widest">DECRYPTING DATA...</span>
                                </div>
                                <div className="bg-background/50 rounded-xl border border-border p-6 h-64 overflow-y-auto custom-scrollbar shadow-inner">
                                    {visibleLogs.map((log, i) => (
                                        <div key={i} className="mb-4 flex gap-4 text-xs font-mono animate-in slide-in-from-left duration-300">
                                            <span className="text-muted-foreground opacity-40">[{log.turn < 10 ? `0${log.turn}` : log.turn}]</span>
                                            <div className="flex-1">
                                                <span className={log.actor === selectedBeast?.name ? 'text-primary font-bold' : 'text-destructive font-bold'}>{log.actor?.toUpperCase()}</span>
                                                <span className="text-foreground/80"> {log.description.toUpperCase()}</span>
                                                {log.damage > 0 && <span className="text-destructive font-black ml-2 animate-pulse">-{log.damage} UNITS</span>}
                                                {log.isCritical && <span className="text-secondary font-black ml-2 neon-text-secondary">[CRIT]</span>}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={logsEndRef} />
                                </div>
                            </div>

                            {/* Result Summary */}
                            <div className="lg:col-span-4 cyber-card p-8 flex flex-col justify-between items-center text-center overflow-hidden relative">
                                {visibleLogs.length === battleResult.logs.length ? (
                                    <div className="animate-in zoom-in-95 duration-500 w-full h-full flex flex-col justify-between items-center py-4">
                                        <div>
                                            <h3 className={`text-6xl font-display font-black italic tracking-tighter mb-4 ${battleResult.winnerId === selectedBeast?.id ? 'text-primary neon-text' : 'text-destructive'}`}>
                                                {battleResult.winnerId === selectedBeast?.id ? 'VICTORY' : 'DEFEAT'}
                                            </h3>
                                            <p className="text-[10px] text-muted-foreground font-display font-bold uppercase tracking-[0.2em]">ENGAGEMENT TERMINATED</p>
                                        </div>

                                        <div className="w-full space-y-4">
                                            <div className="flex justify-center gap-6">
                                                <div className="bg-background/50 border border-border p-4 rounded-xl flex-1">
                                                    <div className="text-[8px] text-accent font-display font-black uppercase tracking-widest mb-1">ZC EARNED</div>
                                                    <div className="text-2xl font-display font-black text-foreground leading-none">+{battleResult.rewards.zenCoins}</div>
                                                </div>
                                                <div className="bg-background/50 border border-border p-4 rounded-xl flex-1">
                                                    <div className="text-[8px] text-primary font-display font-black uppercase tracking-widest mb-1">XP GAINED</div>
                                                    <div className="text-2xl font-display font-black text-foreground leading-none">+{battleResult.rewards.exp}</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={resetBattle} 
                                                className="w-full py-4 bg-foreground text-background font-display font-black tracking-widest uppercase rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                                            >
                                                RETURN TO LOBBY
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full opacity-40">
                                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-[10px] font-display font-bold uppercase tracking-widest">FINALIZING DATA...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default BattleArena;
