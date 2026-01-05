
import React, { useState } from 'react';
import { ZenBeast } from '../types';
import BeastCard from './BeastCard';
import BeastDetailModal from './BeastDetailModal';
import { Dna, AlertTriangle, Coins } from 'lucide-react';
import { SectionHeader, CyberButton } from './common/CyberComponents';

interface BreedingProps {
  beasts: ZenBeast[];
  onBreed: (p1: ZenBeast, p2: ZenBeast) => Promise<ZenBeast>;
  coins: number;
}

const Breeding: React.FC<BreedingProps> = ({ beasts, onBreed, coins }) => {
  const [parentA, setParentA] = useState<ZenBeast | null>(null);
  const [parentB, setParentB] = useState<ZenBeast | null>(null);
  const [isBreeding, setIsBreeding] = useState(false);
  const [newChild, setNewChild] = useState<ZenBeast | null>(null);

  const BREEDING_COST = 50;

  const availableBeasts = beasts.filter(b => !b.isStaked && b.id !== parentA?.id && b.id !== parentB?.id && !b.isSoulbound);

  const handleSelect = (beast: ZenBeast) => {
    if (!parentA) setParentA(beast);
    else if (!parentB) setParentB(beast);
  };

  const handleBreedConfirm = async () => {
    if (!parentA || !parentB) return;
    if (coins < BREEDING_COST) return;
    
    setIsBreeding(true);
    try {
        const child = await onBreed(parentA, parentB);
        setNewChild(child);
        setParentA(null);
        setParentB(null);
    } catch (e) {
        // Handled by hook notification
    }
    setIsBreeding(false);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <SectionHeader 
        title="FUSION VATS" 
        subtitle="COMBINE GENETICS // CREATE OFFSPRING"
        icon={<Dna />} 
        rightElement={
             <div className="flex gap-2">
                 <div className="inline-flex items-center px-4 py-1 bg-neon-purple/10 border border-neon-purple/50 rounded-full">
                    <Coins size={14} className="text-neon-purple mr-2" />
                    <span className="text-neon-purple font-mono text-xs">COST: {BREEDING_COST} ZC</span>
                </div>
                 <div className="inline-flex items-center px-4 py-1 bg-red-500/10 border border-red-500/50 rounded-full">
                    <AlertTriangle size={14} className="text-red-500 mr-2" />
                    <span className="text-red-400 font-mono text-xs uppercase">Parents are Burned</span>
                </div>
            </div>
        }
      />

      {/* Fusion Stage */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-10 bg-slate-900/40 p-8 border-y border-slate-800 relative">
        <Slot beast={parentA} label="FATHER" onRemove={() => setParentA(null)} />
        
        <div className="flex flex-col items-center z-10 relative">
            <div className={`relative rounded-full p-4 border-2 ${isBreeding ? 'border-neon-pink bg-neon-pink/20 shadow-[0_0_20px_#ff00ff]' : 'border-gray-700 bg-black'}`}>
                <Dna size={40} className={`text-neon-pink ${isBreeding ? 'animate-spin' : ''}`} />
            </div>
            {parentA && parentB && (
                <div className="mt-6 flex flex-col items-center bg-black/60 p-4 border border-gray-700 rounded-lg backdrop-blur-sm">
                    <CyberButton 
                        onClick={handleBreedConfirm} 
                        loading={isBreeding} 
                        disabled={isBreeding || coins < BREEDING_COST}
                        variant={coins < BREEDING_COST ? 'danger' : 'secondary'}
                        className="w-full"
                    >
                        {coins < BREEDING_COST ? 'INSUFFICIENT FUNDS' : 'INITIATE FUSION'}
                    </CyberButton>
                    <div className={`text-[10px] font-mono mt-2 flex items-center justify-center w-full ${coins < BREEDING_COST ? 'text-red-500' : 'text-gray-400'}`}>
                        {coins < BREEDING_COST && <AlertTriangle size={10} className="mr-1"/>}
                        REQ: {BREEDING_COST} ZC
                    </div>
                </div>
            )}
        </div>

        <Slot beast={parentB} label="MOTHER" onRemove={() => setParentB(null)} />
      </div>

      {/* Pool */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <h3 className="text-gray-400 font-mono mb-4 text-sm tracking-widest border-b border-gray-800 pb-2">
            CANDIDATE POOL ({availableBeasts.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4 pb-8">
            {availableBeasts.map(b => (
                <BeastCard key={b.id} beast={b} small onClick={() => handleSelect(b)} />
            ))}
            {availableBeasts.length === 0 && (
                <div className="col-span-full text-center text-gray-600 font-mono py-10">NO COMPATIBLE SUBJECTS (Unstake or Mint more)</div>
            )}
        </div>
      </div>

      {/* Reveal Modal */}
      {newChild && (
        <BeastDetailModal beast={newChild} onClose={() => setNewChild(null)}>
            <div className="flex flex-col items-end">
                <h2 className="text-3xl text-neon-green font-mono font-bold mb-2 animate-pulse">FUSION SUCCESSFUL</h2>
                <CyberButton onClick={() => setNewChild(null)}>ADD TO ARMORY</CyberButton>
            </div>
        </BeastDetailModal>
      )}
    </div>
  );
};

const Slot = ({ beast, label, onRemove }: { beast: ZenBeast | null, label: string, onRemove: () => void }) => (
    <div className="relative w-64 h-80 group">
        <div className={`absolute inset-0 border-2 border-dashed ${beast ? 'border-neon-pink' : 'border-gray-600'} rounded-lg transition-colors`}></div>
        {beast ? (
            <div
                className="relative w-full h-full cursor-pointer focus:outline-none"
                onClick={onRemove}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRemove(); } }}
                aria-label={`Remove ${beast.name} from ${label} slot`}
            >
                <BeastCard beast={beast} interactive={false} />
                <div className="absolute inset-0 bg-red-500/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                    <span className="font-bold text-white border-2 border-white px-4 py-2">REMOVE</span>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 font-mono">
                <span className="text-4xl mb-2 opacity-20">{label[0]}</span>
                <span>SELECT {label}</span>
            </div>
        )}
    </div>
);

export default Breeding;
