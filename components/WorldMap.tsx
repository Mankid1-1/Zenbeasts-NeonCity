
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
            className={`absolute group p-0 bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-neon-blue rounded-full ${isLocked ? 'cursor-not-allowed grayscale opacity-70' : 'cursor-pointer'}`}
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}ms` }}
            onClick={handleClick}
            disabled={isLocked}
            aria-label={isLocked ? `${label} (Locked, Level ${levelRequired} Required)` : `Go to ${label}`}
        >
            <div className={`
                w-16 h-16 md:w-24 md:h-24 rounded-full border-2 ${isLocked ? 'border-gray-600 bg-gray-900' : `${color} bg-black/80`} backdrop-blur-md
                flex flex-col items-center justify-center relative z-10 transition-transform duration-300
                ${!isLocked && 'hover:scale-110 shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_currentColor]'}
            `}>
                <div className={`${!isLocked && color.replace('border-', 'text-')} mb-1 transform ${!isLocked && 'group-hover:-translate-y-1'} transition-transform`}>
                    {isLocked ? <Lock size={24} className="text-gray-500"/> : icon}
                </div>
                <div className="text-[8px] md:text-[10px] font-mono font-bold tracking-widest text-white uppercase bg-black/50 px-2 rounded">
                    {label}
                </div>
                {isLocked && (
                    <div className="absolute -bottom-6 bg-red-900/80 text-red-200 text-[10px] px-2 py-0.5 rounded font-mono border border-red-800 whitespace-nowrap">
                        LVL {levelRequired} REQ
                    </div>
                )}
            </div>
            {/* Connecting lines pulse effect could go here */}
            {!isLocked && <div className={`absolute inset-0 rounded-full ${color.replace('border-', 'bg-')} opacity-20 animate-ping`}></div>}
        </button>
    );
};

const WorldMap = ({ trainerLevel }: { trainerLevel: number }) => {
    return (
        <div className="relative w-full h-full bg-[#050510] overflow-hidden animate-fade-in-up">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [perspective:1000px] [transform:rotateX(20deg)_scale(1.2)] origin-top"></div>
            
            <div className="absolute top-8 left-8 z-20 pointer-events-none">
                <h1 className="text-4xl md:text-6xl font-black font-mono text-white tracking-tighter italic">NEON <span className="text-neon-pink text-shadow-neon">CITY</span></h1>
                <p className="text-neon-blue font-mono text-sm tracking-widest">SECTOR 7 // OPEN WORLD</p>
                <p className="text-gray-500 font-mono text-xs mt-1">ACCESS LEVEL: {trainerLevel}</p>
            </div>

            {/* Map Nodes */}
            <div className="relative w-full h-full max-w-5xl mx-auto transform translate-y-10">
                <MapNode x={50} y={45} icon={<Home size={32}/>} label="HQ" path="/dashboard" color="border-white" delay={0} levelRequired={MAP_UNLOCKS.DASHBOARD} currentLevel={trainerLevel} />
                
                <MapNode x={20} y={30} icon={<Box size={32}/>} label="Barracks" path="/inventory" color="border-neon-blue" delay={100} levelRequired={MAP_UNLOCKS.INVENTORY} currentLevel={trainerLevel} />
                
                <MapNode x={80} y={30} icon={<Swords size={32}/>} label="Arena" path="/battle" color="border-red-500" delay={200} levelRequired={MAP_UNLOCKS.BATTLE} currentLevel={trainerLevel} />
                
                <MapNode x={25} y={70} icon={<Dna size={32}/>} label="Fusion Lab" path="/breeding" color="border-neon-purple" delay={300} levelRequired={MAP_UNLOCKS.BREEDING} currentLevel={trainerLevel} />
                
                <MapNode x={75} y={70} icon={<ShoppingBag size={32}/>} label="Market" path="/market" color="border-neon-yellow" delay={400} levelRequired={MAP_UNLOCKS.MARKET} currentLevel={trainerLevel} />

                <MapNode x={50} y={15} icon={<LandPlot size={32}/>} label="Neural Bank" path="/bank" color="border-neon-green" delay={500} levelRequired={MAP_UNLOCKS.BANK} currentLevel={trainerLevel} />

                {/* Decorative Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                    <line x1="50%" y1="45%" x2="20%" y2="30%" stroke="#00ffff" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                    <line x1="50%" y1="45%" x2="80%" y2="30%" stroke="#ff073a" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                    <line x1="50%" y1="45%" x2="25%" y2="70%" stroke="#b026ff" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                    <line x1="50%" y1="45%" x2="75%" y2="70%" stroke="#fff01f" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                    <line x1="50%" y1="45%" x2="50%" y2="15%" stroke="#39ff14" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                </svg>
            </div>
        </div>
    );
};

export default WorldMap;
