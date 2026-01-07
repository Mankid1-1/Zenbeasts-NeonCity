import React from 'react';
import { ZenBeast, Rarity } from '../types';
import { RARITY_COLORS } from '../constants';
import { CircuitBoard, ChevronUp, Lock } from 'lucide-react';
import { ClassIcon } from './CyberComponents';

interface BeastCardProps {
  beast: ZenBeast;
  selected?: boolean;
  onClick?: () => void;
  small?: boolean;
  interactive?: boolean;
}

// Optimization: Memoize card to prevent re-renders in large lists
const BeastCard: React.FC<BeastCardProps> = React.memo(({ beast, selected, onClick, small, interactive = true }) => {
  if (!beast || !beast.stats) return null;

  const rarityKey = beast.rarity || Rarity.COMMON;
  const canEvolve = beast.level >= 5;
  const isReadyToEvolve = canEvolve && !beast.isStaked;
  const isNew = beast.obtainedAt && (Date.now() - beast.obtainedAt < 24 * 60 * 60 * 1000);

  if (small) {
    return (
      <div 
        onClick={interactive ? onClick : undefined}
        className={`
            relative cyber-card aspect-square transition-all duration-300 overflow-hidden group
            ${interactive ? 'cursor-pointer hover:border-primary/50' : ''}
            ${selected ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-border'}
        `}
      >
        <img src={beast.imageUrl} alt={beast.name} className="w-full h-full object-cover image-pixelated group-hover:scale-110 transition-transform duration-500" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
        <div className="p-1 absolute bottom-0 w-full bg-black/60 backdrop-blur-sm border-t border-white/5">
             <div className="text-[10px] font-display font-bold text-foreground truncate">{beast.name}</div>
        </div>
        <div className="absolute top-1 right-1 bg-black/60 p-1 rounded-sm border border-white/5 backdrop-blur-sm">
            <ClassIcon beastClass={beast.class} className="w-3 h-3 text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div 
      onClick={interactive ? onClick : undefined}
      className={`
        relative cyber-card flex flex-col transition-all duration-300 overflow-hidden
        ${interactive ? 'cursor-pointer' : ''}
        ${selected ? 'border-primary ring-4 ring-primary/20 z-10' : 'border-border'}
      `}
    >
      {/* Evolution Glow Effect */}
      {isReadyToEvolve && !selected && (
         <div className="absolute inset-0 z-0 bg-accent/5 animate-pulse-neon pointer-events-none blur-xl"></div>
      )}

      {/* Badges */}
      <div className="absolute top-2 right-2 z-10 flex gap-2 items-center">
        {isNew && <span className="text-[8px] bg-accent text-accent-foreground px-2 py-0.5 font-display font-bold rounded-sm shadow-lg shadow-accent/20">NEW</span>}
        <span className="text-[10px] bg-background/80 backdrop-blur-md px-2 py-1 text-foreground border border-border font-mono rounded-sm">LVL {beast.level}</span>
      </div>

      <div className="relative aspect-square overflow-hidden bg-muted/20">
        <img 
          src={beast.imageUrl} 
          alt={beast.name} 
          className="w-full h-full object-cover image-pixelated group-hover:scale-110 transition-transform duration-700"
          loading="lazy" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        
        <div className="absolute bottom-3 left-3 right-3">
           <div className="flex items-center gap-2 mb-1">
             <ClassIcon beastClass={beast.class} className="w-4 h-4 text-primary" />
             <span className="text-[10px] text-primary font-display font-bold uppercase tracking-widest">{beast.class}</span>
           </div>
           <h3 className="text-lg font-display font-black text-foreground truncate neon-text">{beast.name}</h3>
        </div>
      </div>

      <div className="p-4 bg-card/40 border-t border-border/50">
        <div className="grid grid-cols-4 gap-2 text-center mb-3">
            {Object.entries(beast.stats).map(([key, val]) => (
                <div key={key} className="bg-background/50 rounded-sm p-1.5 border border-border/50 transition-colors hover:border-primary/30">
                    <div className="text-[8px] text-muted-foreground uppercase font-display font-bold tracking-tighter">{key.substring(0,3)}</div>
                    <div className="text-xs font-mono font-bold text-foreground">{val}</div>
                </div>
            ))}
        </div>
        
        {/* EXP Bar */}
        <div className="relative h-1.5 w-full bg-muted/30 rounded-full overflow-hidden border border-border/20">
            <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary transition-all duration-1000" 
                style={{ width: `${Math.min(100, (beast.exp % 100))}%` }}
            ></div>
            {/* Gloss effect */}
            <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
});

export default BeastCard;
