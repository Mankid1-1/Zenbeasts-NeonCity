
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Swords, ShoppingBag, Dna, Box, Activity, LandPlot, Lock } from 'lucide-react';
import { MAP_UNLOCKS } from '../constants';

interface MapNodeProps {
    x: number;
    y: number;
    icon: React.ReactNode;
    label: string;
    path: string;
    color: string;
    delay: number;
    levelRequired: number;
    currentLevel: number;
}

const MapNode = ({ x, y, icon, label, path, color, delay, levelRequired, currentLevel }: MapNodeProps) => {
    const navigate = useNavigate();
    const isLocked = currentLevel < levelRequired;

    const handleClick = () => {
        if (!isLocked) navigate(path);
    };

    return (
        <button
            className={`absolute group p-0 bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl ${isLocked ? 'cursor-not-allowed grayscale opacity-70' : 'cursor-pointer'}`}
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}ms` }}
            onClick={handleClick}
            disabled={isLocked}
        >
            <div className={`
                w-20 h-20 md:w-28 md:h-28 rounded-xl border-2 ${isLocked ? 'border-border bg-card/80' : `border-primary/50 bg-background/80`} backdrop-blur-md
                flex flex-col items-center justify-center relative z-10 transition-all duration-500
                ${!isLocked && 'hover:scale-110 hover:border-primary shadow-xl group-hover:shadow-primary/20'}
                cyber-border
            `}>
                <div className={`${!isLocked ? 'text-primary' : 'text-muted-foreground'} mb-1 transform transition-all duration-300 ${!isLocked && 'group-hover:-translate-y-1'}`}>
                    {isLocked ? <Lock size={24} /> : icon}
                </div>
                <div className="text-[10px] md:text-xs font-display font-bold tracking-widest text-foreground uppercase px-2 py-1 rounded bg-black/40">
                    {label}
                </div>
                {isLocked && (
                    <div className="absolute -bottom-8 bg-destructive/90 text-destructive-foreground text-[10px] px-3 py-1 rounded-sm font-display font-bold border border-destructive/50 whitespace-nowrap">
                        LVL {levelRequired} REQUIRED
                    </div>
                )}
            </div>
            {!isLocked && (
                <div className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse-neon blur-xl -z-10"></div>
            )}
        </button>
    );
};

const WorldMap = React.memo(({ trainerLevel }: { trainerLevel: number }) => {
    return (
        <div className="relative w-full h-full min-h-[600px] bg-background overflow-hidden rounded-2xl border border-border">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1641650265007-b2db704cd9f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBuZW9uJTIwY2l0eSUyMG5pZ2h0fGVufDB8MHx8fDE3Njc3ODgyNjN8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                    alt="Cyberpunk City" 
                    className="w-full h-full object-cover opacity-40 mix-blend-overlay scale-110 animate-pulse"
                    style={{ animationDuration: '8s' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background/50"></div>
            </div>

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(hsla(var(--primary)/0.1)_1px,transparent_1px),linear-gradient(90deg,hsla(var(--primary)/0.1)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-10 opacity-30"></div>
            
            <div className="absolute top-10 left-10 z-20">
                <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter italic uppercase neon-text animate-in slide-in-from-left duration-700">
                    NEON <span className="text-secondary neon-text-secondary">CITY</span>
                </h1>
                <div className="flex items-center gap-3 mt-2 animate-in slide-in-from-left duration-700 delay-150">
                    <span className="w-12 h-[1px] bg-primary"></span>
                    <p className="text-primary font-mono text-sm tracking-[0.3em] uppercase">SECTOR 07 // DISTRICT ACTIVE</p>
                </div>
            </div>

            <div className="absolute top-10 right-10 z-20 text-right animate-in slide-in-from-right duration-700">
                <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-md px-4 py-2 rounded-full border border-border">
                    <Activity className="text-accent animate-pulse" size={16} />
                    <span className="text-xs font-display font-bold text-muted-foreground uppercase tracking-widest">System Status: Online</span>
                </div>
            </div>

            {/* Map Nodes Container */}
            <div className="relative w-full h-full max-w-6xl mx-auto z-20 flex items-center justify-center">
                <MapNode x={50} y={40} icon={<Home size={32}/>} label="HQ" path="/dashboard" color="border-white" delay={0} levelRequired={MAP_UNLOCKS.DASHBOARD} currentLevel={trainerLevel} />
                
                <MapNode x={15} y={25} icon={<Box size={32}/>} label="Armory" path="/inventory" color="border-primary" delay={100} levelRequired={MAP_UNLOCKS.INVENTORY} currentLevel={trainerLevel} />
                
                <MapNode x={85} y={25} icon={<Swords size={32}/>} label="Arena" path="/battle" color="border-destructive" delay={200} levelRequired={MAP_UNLOCKS.BATTLE} currentLevel={trainerLevel} />
                
                <MapNode x={20} y={65} icon={<Dna size={32}/>} label="Lab" path="/breeding" color="border-secondary" delay={300} levelRequired={MAP_UNLOCKS.BREEDING} currentLevel={trainerLevel} />
                
                <MapNode x={80} y={65} icon={<ShoppingBag size={32}/>} label="Market" path="/market" color="border-accent" delay={400} levelRequired={MAP_UNLOCKS.MARKET} currentLevel={trainerLevel} />

                <MapNode x={50} y={10} icon={<LandPlot size={32}/>} label="Bank" path="/bank" color="border-accent" delay={500} levelRequired={MAP_UNLOCKS.BANK} currentLevel={trainerLevel} />

                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    <path d="M 50% 40% L 15% 25%" stroke="hsla(var(--primary)/0.5)" strokeWidth="1" strokeDasharray="4 4" className="animate-pulse" />
                    <path d="M 50% 40% L 85% 25%" stroke="hsla(var(--primary)/0.5)" strokeWidth="1" strokeDasharray="4 4" className="animate-pulse" />
                    <path d="M 50% 40% L 20% 65%" stroke="hsla(var(--primary)/0.5)" strokeWidth="1" strokeDasharray="4 4" className="animate-pulse" />
                    <path d="M 50% 40% L 80% 65%" stroke="hsla(var(--primary)/0.5)" strokeWidth="1" strokeDasharray="4 4" className="animate-pulse" />
                    <path d="M 50% 40% L 50% 10%" stroke="hsla(var(--primary)/0.5)" strokeWidth="1" strokeDasharray="4 4" className="animate-pulse" />
                </svg>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none z-30 opacity-[0.03] bg-[linear-gradient(transparent_50%,#fff_50%)] bg-[size:100%_4px]"></div>
        </div>
    );
});

export default WorldMap;
