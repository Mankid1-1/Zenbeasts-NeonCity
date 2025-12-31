
import React, { useState, useEffect, useRef } from 'react';
import { ZenBeast, GymLeader, BattleResult, LeaderboardEntry } from '../types';
import { Sword, Trophy, Skull } from 'lucide-react';
import { GYM_LEADERS } from '../constants';
import { SectionHeader, CyberButton } from './common/CyberComponents';

interface BattleArenaProps {
  beasts: ZenBeast[];
  onBattle: (beast: ZenBeast, gymLeader?: GymLeader) => Promise<BattleResult | null>;
  leaderboard: LeaderboardEntry[];
}

// Visual component for battle sprites
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
        <div className="relative w-full h-64 md:h-80 bg-black/80 border border-slate-700 rounded-lg overflow-hidden flex items-end justify-between px-8 md:px-20 py-8 mb-6 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

            {/* Player Sprite */}
            <div className={`relative z-10 flex flex-col items-center transition-transform duration-100 ${shakePlayer ? 'translate-x-[-10px] grayscale brightness-200' : ''}`}>
                 {activeEffect === 'crit' && !shakePlayer && <div className="absolute -top-10 text-neon-yellow font-black text-2xl animate-bounce">CRITICAL!</div>}
                 <div className="w-32 h-32 md:w-48 md:h-48 relative">
                     <img
                        src={playerBeast?.imageUrl || ''}
                        alt={playerBeast?.name || 'Player Beast'}
                        className={`w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(57,255,20,0.5)] ${shakePlayer ? 'animate-shake' : 'animate-pulse'}`}
                        alt="Player"
                     />
                     {/* Health Bar */}
                     <div className="absolute -bottom-8 left-0 right-0">
                         <div className="h-2 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
                             <div className="h-full bg-neon-green transition-all duration-300" style={{ width: `${playerHp}%` }}></div>
                         </div>
                         <div className="text-center text-xs text-neon-green font-mono mt-1">{Math.ceil(playerHp)}%</div>
                     </div>
                 </div>
            </div>

            {/* VS Badge */}
            <div className="relative z-10 mb-20 hidden md:block">
                <span className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue animate-pulse">VS</span>
            </div>

            {/* Enemy Sprite */}
            <div className={`relative z-10 flex flex-col items-center transition-transform duration-100 ${shakeEnemy ? 'translate-x-[10px] grayscale brightness-200' : ''}`}>
                 <div className="w-32 h-32 md:w-48 md:h-48 relative">
                     {opponent?.avatarUrl ? (
                         <img src={opponent.avatarUrl} className={`w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,0,0,0.5)] ${shakeEnemy ? 'animate-shake' : ''}`} alt="Enemy" />
                     ) : (
                         <Skull className={`w-full h-full text-red-500 ${shakeEnemy ? 'animate-shake' : ''}`} />
                     )}
                     {/* Health Bar */}
                     <div className="absolute -bottom-8 left-0 right-0">
                         <div className="h-2 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
                             <div className="h-full bg-red-500 transition-all duration-300 ml-auto" style={{ width: `${enemyHp}%` }}></div>
                         </div>
                         <div className="text-center text-xs text-red-500 font-mono mt-1">{Math.ceil(enemyHp)}%</div>
                     </div>
                 </div>
            </div>
        </div>
    )
}

const BattleArena = React.memo<BattleArenaProps>(({ beasts, onBattle, leaderboard }) => {
    const [selectedBeast, setSelectedBeast] = useState<ZenBeast | null>(null);
    const [selectedGymLeader, setSelectedGymLeader] = useState<GymLeader | null>(null);
    const [mode, setMode] = useState<'sparring' | 'gym'>('gym');
    const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
    const [isBattling, setIsBattling] = useState(false);
    
    // Vis
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
                
                // Damage Logic & FX
                if (log.damage) {
                    const damagePercent = Math.min(25, log.damage / 2); 

                    if (log.isCritical) {
                        setActiveEffect('crit');
                        setTimeout(() => setActiveEffect(null), 500);
                    }

                    if (log.actor === playerName) {
                        // Player hit enemy
                        setEnemyHp(prev => Math.max(0, prev - damagePercent));
                        setShakeEnemy(true);
                        setTimeout(() => setShakeEnemy(false), 300);
                    } else {
                        // Enemy hit player
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

    const unstakedBeasts = beasts.filter(b => !b.isStaked);

    // Get current opponent object for visuals
    const currentOpponent = mode === 'gym' && selectedGymLeader
        ? selectedGymLeader
        : { name: 'Rogue AI', avatarUrl: null }; // Fallback for sparring visuals

    return (
        <div className="h-full flex flex-col animate-fade-in-up">
            <SectionHeader 
                title="NEON COLISEUM" 
                subtitle="RANKED PVP // GYM CHALLENGES" 
                icon={<Sword />}
                rightElement={
                    <div className="flex bg-slate-900 border border-slate-700 p-1 rounded">
                        <button onClick={() => setMode('gym')} className={`px-4 py-1 text-sm ${mode === 'gym' ? 'bg-neon-blue text-black font-bold' : 'text-gray-400'}`}>GYM</button>
                        <button onClick={() => setMode('sparring')} className={`px-4 py-1 text-sm ${mode === 'sparring' ? 'bg-neon-blue text-black font-bold' : 'text-gray-400'}`}>SPARRING</button>
                    </div>
                }
            />

            {!battleResult && !isBattling ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-6">
                    {/* Selection */}
                    <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 p-4 rounded cyber-border flex flex-col">
                         <h3 className="text-white font-mono text-sm mb-4 border-b border-gray-700 pb-2">AVAILABLE FIGHTERS</h3>
                         <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                             {unstakedBeasts.map(b => (
                                 <button
                                     key={b.id}
                                     onClick={() => setSelectedBeast(b)}
                                     type="button"
                                     aria-pressed={selectedBeast?.id === b.id}
                                     className={`w-full p-2 border cursor-pointer flex items-center gap-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-neon-green ${selectedBeast?.id === b.id ? 'border-neon-green bg-neon-green/10' : 'border-gray-700 bg-black/40 hover:bg-slate-800'}`}
                                 >
                                    <img src={b.imageUrl} alt="" className="w-10 h-10 object-cover border border-gray-600" />
                                    <div>
                                        <div className="font-bold text-sm truncate w-32 text-white">{b.name}</div>
                                        <div className="text-xs text-gray-400 font-mono">Lvl {b.level}</div>
                                    </div>
                                 </button>
                             ))}
                         </div>
                    </div>

                    {/* Arena Setup */}
                    <div className="lg:col-span-6 flex flex-col bg-black/60 border border-slate-700 p-6 cyber-border items-center justify-between backdrop-blur-md">
                         <div className="flex w-full justify-between items-start mb-8">
                            <div className="w-1/3 text-center">
                                <div className="text-xs text-neon-green mb-2 font-mono">CHALLENGER</div>
                                {selectedBeast ? (
                                    <>
                                        <img src={selectedBeast.imageUrl} className="w-32 h-32 object-cover border-2 border-neon-green mx-auto shadow-[0_0_20px_rgba(57,255,20,0.3)]" />
                                        <div className="mt-2 font-bold text-white font-mono">{selectedBeast.name}</div>
                                    </>
                                ) : <div className="h-32 w-32 mx-auto border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-500">SELECT</div>}
                            </div>
                            <div className="pt-10"><span className="text-4xl font-black italic text-red-500 animate-pulse">VS</span></div>
                            <div className="w-1/3 text-center">
                                <div className="text-xs text-red-500 mb-2 font-mono">ENEMY</div>
                                {mode === 'gym' && selectedGymLeader ? (
                                    <>
                                        <img src={selectedGymLeader.avatarUrl} className="w-32 h-32 object-cover border-2 border-red-500 mx-auto grayscale" />
                                        <div className="mt-2 font-bold text-white font-mono">{selectedGymLeader.name}</div>
                                    </>
                                ) : mode === 'sparring' ? <Skull className="h-32 w-32 mx-auto text-gray-600" /> : <div className="h-32 w-32 mx-auto border-2 border-dashed border-gray-700" />}
                            </div>
                        </div>

                        {mode === 'gym' && (
                            <div className="w-full mt-auto mb-4">
                                <h4 className="text-xs text-gray-500 mb-2 font-mono">SELECT TARGET</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    {GYM_LEADERS.map(l => (
                                        <button key={l.id} onClick={() => setSelectedGymLeader(l)}
                                            className={`p-2 border text-left transition-all ${selectedGymLeader?.id === l.id ? 'border-neon-pink bg-neon-pink/10' : 'border-gray-700 bg-black'}`}>
                                            <div className="text-[10px] text-neon-pink font-mono">TIER {l.difficulty}</div>
                                            <div className="font-bold text-xs text-white truncate">{l.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <CyberButton 
                            onClick={handleBattle} 
                            disabled={!selectedBeast || (mode === 'gym' && !selectedGymLeader)} 
                            className="w-full"
                        >
                            {mode === 'gym' ? 'INITIATE PROTOCOL' : 'SEARCH NETWORK'}
                        </CyberButton>
                    </div>

                    {/* Leaderboard */}
                    <div className="lg:col-span-3 bg-black/20 border border-slate-800 p-4 rounded">
                         <h3 className="text-neon-yellow font-mono text-sm mb-4 border-b border-gray-800 pb-2"><Trophy size={14} className="inline mr-2"/> TOP RANKING</h3>
                         {leaderboard.map((e, i) => (
                             <div key={i} className="flex justify-between items-center py-2 px-2 text-sm border-b border-white/5">
                                 <span className={i===0?'text-neon-yellow': 'text-gray-400'}>#{e.rank} {e.name}</span>
                                 <span className="text-neon-blue font-mono">{e.score}</span>
                             </div>
                         ))}
                    </div>
                </div>
            ) : null}

            {isBattling && !battleResult && (
                 <div
                    role="status"
                    aria-live="polite"
                    className="flex-1 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50 absolute inset-0"
                >
                    <Sword size={64} className="text-neon-pink animate-spin mb-8" />
                    <div className="text-2xl font-mono text-neon-blue animate-pulse">COMPUTING COMBAT LOGIC...</div>
                </div>
            )}

            {battleResult && (
                <div className="flex-1 flex flex-col items-center justify-start animate-fade-in-up pb-8 px-4 overflow-y-auto">
                    <div className="w-full max-w-5xl mx-auto">
                        <BattleVisuals
                            playerBeast={selectedBeast}
                            opponent={currentOpponent}
                            playerHp={playerHp}
                            enemyHp={enemyHp}
                            shakePlayer={shakePlayer}
                            shakeEnemy={shakeEnemy}
                            activeEffect={activeEffect}
                        />

                        <div className="w-full bg-slate-900 border-2 border-neon-blue p-6 cyber-border relative shadow-[0_0_30px_rgba(0,255,255,0.1)]">
                            <div
                                role="log"
                                aria-label="Battle Log"
                                className="bg-black border border-gray-700 p-4 font-mono text-sm h-48 overflow-y-auto custom-scrollbar shadow-inner mb-6"
                            >
                                {visibleLogs.map((log, i) => (
                                    <div key={i} className="mb-2 border-l-2 border-gray-700 pl-3 animate-fade-in-up">
                                        <span className="text-gray-500 text-xs">TURN_{log.turn} </span>
                                        <span className={log.actor === selectedBeast?.name ? 'text-neon-green' : 'text-red-400'}>{log.actor}</span>
                                        <span className="text-gray-300"> {log.description}</span>
                                        {log.damage > 0 && <span className="text-red-500 font-bold ml-2">-{log.damage} HP</span>}
                                        {log.isCritical && <span className="text-neon-yellow font-black ml-2 animate-pulse">[CRIT]</span>}
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>

                            {visibleLogs.length === battleResult.logs.length && (
                                <div className="mt-8 text-center animate-fade-in-up">
                                    <h3 className={`text-5xl font-black font-mono mb-4 ${battleResult.winnerId === selectedBeast?.id ? 'text-neon-green text-shadow-neon' : 'text-red-500'}`}>
                                        {battleResult.winnerId === selectedBeast?.id ? 'VICTORY' : 'DEFEAT'}
                                    </h3>
                                    <div className="flex justify-center gap-4">
                                         <div className="text-xs font-mono text-gray-400">
                                             EARNINGS: <span className="text-white">+{battleResult.rewards.zenCoins} ZC</span>
                                         </div>
                                         <div className="text-xs font-mono text-gray-400">
                                             XP: <span className="text-white">+{battleResult.rewards.exp}</span>
                                         </div>
                                    </div>
                                    <div className="mt-4">
                                        <CyberButton onClick={resetBattle} variant="primary">RETURN TO LOBBY</CyberButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default BattleArena;
