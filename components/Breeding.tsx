import React, { useState } from 'react';
import { ZenBeast } from '../types';
import BeastCard from './BeastCard';
import BeastDetailModal from './BeastDetailModal';
import { Dna, AlertTriangle, Coins, Sparkles, X, Plus } from 'lucide-react';

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

  const canAfford = coins >= BREEDING_COST;

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
    <div className="h-full flex flex-col space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-[2px] bg-primary"></span>
            <h2 className="text-4xl font-display font-black text-foreground tracking-tight uppercase italic">GENETIC <span className="text-primary">LAB</span></h2>
          </div>
          <p className="text-sm text-muted-foreground font-display font-bold tracking-widest uppercase ml-10">FUSION PROTOCOLS // DNA RECOMBINATION</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-card/40 backdrop-blur-md px-6 py-3 rounded-xl border border-border flex items-center gap-3">
                <Coins size={16} className="text-primary" />
                <span className="text-xs font-display font-black uppercase tracking-widest text-foreground">FUSION COST: {BREEDING_COST} ZC</span>
            </div>
            <div className="bg-destructive/10 px-6 py-3 rounded-xl border border-destructive/20 flex items-center gap-3 group">
                <AlertTriangle size={16} className="text-destructive group-hover:animate-pulse" />
                <span className="text-xs font-display font-black uppercase tracking-widest text-destructive">BURN PROTOCOL ACTIVE</span>
            </div>
        </div>
      </header>

      {/* Fusion Stage */}
      <div className="cyber-card p-12 bg-primary/5 border-primary/20 flex flex-col md:flex-row items-center justify-center gap-12 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(hsla(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(90deg,hsla(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-50"></div>

        <div className="flex flex-col items-center gap-4 group">
            <Slot beast={parentA} label="GENOME_A" onRemove={() => setParentA(null)} />
            {parentA && <span className="text-[10px] font-display font-black text-primary uppercase tracking-widest animate-pulse">SOURCE LOADED</span>}
        </div>
        
        <div className="flex flex-col items-center gap-8 z-10">
            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isBreeding ? 'border-primary bg-primary/20 shadow-2xl shadow-primary/50' : 'border-border bg-background/50 backdrop-blur-md'}`}>
                <Dna size={40} className={`text-primary transition-all duration-500 ${isBreeding ? 'animate-spin scale-125' : 'group-hover:scale-110'}`} />
                {isBreeding && (
                    <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-20"></div>
                )}
            </div>

            {parentA && parentB ? (
                <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
                    <button 
                        onClick={handleBreedConfirm} 
                        disabled={isBreeding || !canAfford}
                        className={`px-10 py-4 font-display font-black tracking-[0.2em] uppercase rounded-xl transition-all shadow-xl active:scale-95 cyber-button ${!canAfford ? 'bg-destructive text-destructive-foreground opacity-50 cursor-not-allowed' : 'bg-primary text-primary-foreground shadow-primary/20 hover:scale-105'}`}
                    >
                        {isBreeding ? 'FUSING...' : !canAfford ? 'INSUFFICIENT FUNDS' : 'INITIATE FUSION'}
                    </button>
                    {!canAfford && (
                        <p className="text-[10px] text-destructive font-display font-bold uppercase tracking-widest">REQUIRE {BREEDING_COST} ZC TO PROCEED</p>
                    )}
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-[10px] text-muted-foreground font-display font-bold uppercase tracking-[0.3em]">AWAITING GENOME SELECTION</p>
                </div>
            )}
        </div>

        <div className="flex flex-col items-center gap-4 group">
            <Slot beast={parentB} label="GENOME_B" onRemove={() => setParentB(null)} />
            {parentB && <span className="text-[10px] font-display font-black text-primary uppercase tracking-widest animate-pulse">SOURCE LOADED</span>}
        </div>
      </div>

      {/* Candidate Pool */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-xs font-display font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <Plus size={16} className="text-primary"/> 
                CANDIDATE POOL ({availableBeasts.length})
            </h3>
            <span className="text-[10px] text-muted-foreground font-display font-bold uppercase tracking-widest">SELECT TWO UNITS FOR FUSION</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {availableBeasts.map(b => (
                <div key={b.id} className="animate-in fade-in zoom-in-95 duration-300">
                    <BeastCard beast={b} small onClick={() => handleSelect(b)} />
                </div>
            ))}
            {availableBeasts.length === 0 && (
                <div className="col-span-full cyber-card p-20 text-center flex flex-col items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center border border-border">
                        <Dna size={32} className="text-muted-foreground opacity-20" />
                    </div>
                    <div>
                        <p className="text-sm font-display font-bold text-foreground uppercase tracking-widest mb-2">NO GENETIC MATERIAL DETECTED</p>
                        <p className="text-xs text-muted-foreground font-display font-bold uppercase tracking-widest">UNSTAKE OR ACQUIRE NEW UNITS TO PROCEED</p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Result Reveal */}
      {newChild && (
        <BeastDetailModal beast={newChild} onClose={() => setNewChild(null)}>
            <div className="flex flex-col items-center text-center gap-6 p-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center border-2 border-accent animate-pulse">
                        <Sparkles size={40} className="text-accent" />
                    </div>
                    <div className="absolute inset-0 border-4 border-accent rounded-full animate-ping opacity-20"></div>
                </div>
                <div>
                    <h2 className="text-4xl font-display font-black text-accent italic uppercase tracking-tighter neon-text mb-2">FUSION SUCCESSFUL</h2>
                    <p className="text-xs text-muted-foreground font-display font-bold uppercase tracking-widest">A NEW ENTITY HAS BEEN CONSTRUCTED</p>
                </div>
                <button 
                    onClick={() => setNewChild(null)}
                    className="w-full py-4 bg-foreground text-background font-display font-black tracking-widest uppercase rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
                >
                    ADD TO BARRACKS
                </button>
            </div>
        </BeastDetailModal>
      )}
    </div>
  );
};

const Slot = ({ beast, label, onRemove }: { beast: ZenBeast | null, label: string, onRemove: () => void }) => (
    <div className="relative w-56 h-72 group">
        {beast ? (
            <div
                className="relative w-full h-full cursor-pointer overflow-hidden rounded-2xl border-2 border-primary shadow-2xl shadow-primary/20 animate-in zoom-in-95 duration-500"
                onClick={onRemove}
            >
                <BeastCard beast={beast} interactive={false} />
                <div className="absolute inset-0 bg-destructive/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-md">
                    <X size={40} className="text-destructive-foreground mb-2" />
                    <span className="font-display font-black text-destructive-foreground text-xs tracking-widest uppercase">REMOVE</span>
                </div>
            </div>
        ) : (
            <div className="w-full h-full border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-background/20 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-500">
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-primary/50 transition-all">
                    <Plus size={24} className="opacity-20 group-hover:text-primary group-hover:opacity-100 transition-all" />
                </div>
                <span className="text-[10px] font-display font-black uppercase tracking-[0.2em]">{label}</span>
            </div>
        )}
    </div>
);

export default Breeding;
