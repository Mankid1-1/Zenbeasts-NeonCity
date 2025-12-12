import React from 'react';
import { ZenBeast, Rarity } from '../types';
import { X, Shield, Wind, Brain, Sword, Activity } from 'lucide-react';
import { RARITY_COLORS } from '../constants';

interface BeastDetailModalProps {
  beast: ZenBeast;
  onClose: () => void;
  children?: React.ReactNode; // For optional action buttons injected by parent
}

const BeastDetailModal: React.FC<BeastDetailModalProps> = ({ beast, onClose, children }) => {
  const rarityColor = RARITY_COLORS[beast.rarity].split(' ')[0] || 'text-gray-400';
  const borderColor = RARITY_COLORS[beast.rarity].split(' ')[1] || 'border-gray-600';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in-up" onClick={onClose}>
      <div 
        className={`bg-slate-900 border-2 ${borderColor} w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row cyber-border shadow-[0_0_50px_rgba(0,0,0,0.5)] relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-500 hover:text-white z-20 bg-black/50 p-2 rounded-full hover:bg-red-500/20 transition-colors"
            aria-label="Close details"
        >
            <X size={24} />
        </button>
        
        {/* Left: Visuals */}
        <div className="w-full md:w-2/5 bg-black relative border-b md:border-b-0 md:border-r border-gray-800">
           <img src={beast.imageUrl} className="w-full h-full object-cover image-pixelated" alt={beast.name} />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
           
           <div className="absolute bottom-6 left-6 right-6">
                <div className={`text-4xl font-mono font-bold text-white mb-2 drop-shadow-md leading-none`}>{beast.name}</div>
                <div className="flex flex-wrap gap-2">
                    <span className={`text-xs px-2 py-1 bg-black/60 border ${borderColor} ${rarityColor} rounded font-mono uppercase tracking-wider`}>
                        {beast.rarity}
                    </span>
                    <span className="text-xs px-2 py-1 bg-black/60 border border-gray-600 text-gray-300 rounded font-mono uppercase tracking-wider">
                        {beast.class}
                    </span>
                    <span className="text-xs px-2 py-1 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded font-mono uppercase tracking-wider">
                        LVL {beast.level}
                    </span>
                    <span className="text-xs px-2 py-1 bg-neon-purple/10 border border-neon-purple/30 text-neon-purple rounded font-mono uppercase tracking-wider">
                        GEN {beast.generation}
                    </span>
                </div>
           </div>
        </div>
        
        {/* Right: Data */}
        <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-slate-900/50">
           <div className="mb-6">
               <h3 className="text-gray-500 font-mono text-xs tracking-widest mb-2 flex items-center"><Activity size={14} className="mr-2"/> COMBAT STATISTICS</h3>
               <div className="grid grid-cols-4 gap-4 bg-black/40 p-4 rounded border border-gray-800">
                  <div className="text-center">
                      <div className="text-gray-500 text-[10px] font-mono mb-1">ATTACK</div>
                      <div className="text-xl font-bold text-red-400 flex justify-center items-center"><Sword size={16} className="mr-1"/>{beast.stats.attack}</div>
                  </div>
                  <div className="text-center">
                      <div className="text-gray-500 text-[10px] font-mono mb-1">DEFENSE</div>
                      <div className="text-xl font-bold text-blue-400 flex justify-center items-center"><Shield size={16} className="mr-1"/>{beast.stats.defense}</div>
                  </div>
                  <div className="text-center">
                      <div className="text-gray-500 text-[10px] font-mono mb-1">SPEED</div>
                      <div className="text-xl font-bold text-green-400 flex justify-center items-center"><Wind size={16} className="mr-1"/>{beast.stats.speed}</div>
                  </div>
                  <div className="text-center">
                      <div className="text-gray-500 text-[10px] font-mono mb-1">ZEN</div>
                      <div className="text-xl font-bold text-purple-400 flex justify-center items-center"><Brain size={16} className="mr-1"/>{beast.stats.zen}</div>
                  </div>
               </div>
           </div>

           <div className="mb-8">
               <h3 className="text-neon-pink font-mono text-xs tracking-widest mb-3 border-b border-gray-800 pb-2">GENETIC TRAIT SEQUENCING</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {beast.traits.map((t, i) => (
                     <div key={i} className="flex justify-between items-center bg-black/40 p-3 border border-gray-800 hover:border-gray-600 transition-colors rounded group">
                        <div className="flex flex-col">
                           <span className="text-[10px] text-gray-500 uppercase font-mono mb-0.5">{t.type}</span>
                           <span className="text-sm text-gray-200 font-medium">{t.value}</span>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] text-gray-500 font-mono">RARITY</div>
                           <div className="flex items-center justify-end">
                                <div className="w-16 h-1 bg-gray-800 rounded-full mr-2 overflow-hidden">
                                    <div className="h-full bg-neon-yellow" style={{ width: `${t.rarity}%` }}></div>
                                </div>
                                <span className="text-sm font-mono text-neon-yellow">{t.rarity}%</span>
                           </div>
                        </div>
                     </div>
                  ))}
                  {beast.traits.length === 0 && <div className="text-gray-500 text-sm font-mono col-span-2">No trait data available.</div>}
               </div>
           </div>

           {beast.description && (
               <div className="mb-6 p-4 bg-neon-blue/5 border border-neon-blue/20 rounded">
                   <h3 className="text-neon-blue font-mono text-xs tracking-widest mb-1">LORE ENTRY</h3>
                   <p className="text-gray-300 text-sm italic">"{beast.description}"</p>
               </div>
           )}

           {children && (
               <div className="pt-4 border-t border-gray-800 flex justify-end gap-4">
                   {children}
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default BeastDetailModal;
