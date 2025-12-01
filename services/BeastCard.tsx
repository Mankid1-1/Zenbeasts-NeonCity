import React from 'react';
import { ZenBeast } from '../types';
import { RARITY_COLORS } from '../constants';
import { CircuitBoard, ChevronUp } from 'lucide-react';

interface BeastCardProps {
  beast: ZenBeast;
  selected?: boolean;
  onClick?: () => void;
  small?: boolean;
}

// Optimization: Memoize card to prevent re-renders in large lists
const BeastCard: React.FC<BeastCardProps> = React.memo(({ beast, selected, onClick, small }) => {
  const rarityBorderColor = RARITY_COLORS[beast.rarity].split(' ')[1] || 'border-gray-500';
  const rarityTextColor = RARITY_COLORS[beast.rarity].split(' ')[0] || 'text-gray-500';
  const canEvolve = beast.level >= 5;

  if (small) {
    return (
      <div 
        onClick={onClick}
        className={`
            relative bg-slate-900 border-2 transition-all duration-200 cursor-pointer overflow-hidden
            ${selected ? 'border-neon-pink shadow-[0_0_15px_#ff00ff] scale-105' : `${rarityBorderColor} hover:border-gray-300 hover:shadow-lg`}
        `}
      >
        <img src={beast.imageUrl} alt={beast.name} className="w-full h-24 object-cover image-pixelated opacity-80 hover:opacity-100 transition-opacity" loading="lazy" />
        <div className="p-1 absolute bottom-0 w-full bg-black/80">
             <div className="text-[10px] font-bold text-white truncate font-mono">{beast.name}</div>
        </div>
      </div>
    )
  }

  return (
    <div 
      onClick={onClick}
      className={`
        relative group bg-slate-900/80 transition-all duration-300 cursor-pointer cyber-border overflow-hidden
        border-2 ${selected ? 'border-neon-pink shadow-[0_0_20px_#ff00ff] z-10' : `${rarityBorderColor} hover:scale-[1.02] hover:shadow-lg`}
      `}
    >
      {/* Badges */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <span className="text-[10px] bg-black/80 px-2 py-0.5 text-white border border-gray-600 font-mono">L{beast.level}</span>
        {beast.isStaked && <CircuitBoard size={16} className="text-neon-green animate-pulse" />}
        {canEvolve && !beast.isStaked && <ChevronUp size={16} className="text-neon-yellow animate-bounce" />}
      </div>

      <div className="relative aspect-square overflow-hidden bg-black/50 border-b border-gray-800">
        <img 
          src={beast.imageUrl} 
          alt={beast.name} 
          className="w-full h-full object-cover image-pixelated group-hover:scale-110 transition-transform duration-700"
          loading="lazy" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
        
        <div className="absolute bottom-2 left-3 right-3">
           <h3 className="text-md font-bold font-mono text-white truncate">{beast.name}</h3>
           <div className="flex justify-between items-center mt-1">
             <span className={`text-[10px] font-bold uppercase ${rarityTextColor}`}>{beast.rarity}</span>
             <span className="text-[10px] text-gray-400 font-mono bg-black/50 px-1 rounded">{beast.class}</span>
           </div>
        </div>
      </div>

      <div className="p-3 bg-black/20">
        <div className="grid grid-cols-4 gap-1 text-center mb-2">
            {Object.entries(beast.stats).map(([key, val]) => (
                <div key={key} className="bg-slate-800/50 rounded p-1 border border-slate-700/50">
                    <div className="text-[8px] text-gray-500 uppercase">{key.substring(0,3)}</div>
                    <div className="text-xs font-bold text-gray-200">{val}</div>
                </div>
            ))}
        </div>
        
        <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mt-2">
            <div 
                className="bg-gradient-to-r from-neon-blue to-neon-purple h-full" 
                style={{ width: `${Math.min(100, (beast.exp % 100))}%` }}
            ></div>
        </div>
      </div>
    </div>
  );
});

export default BeastCard;