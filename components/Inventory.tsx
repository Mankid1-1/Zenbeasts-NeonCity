import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ZenBeast, Rarity, BeastClass } from '../types';
import BeastCard from './BeastCard';
import InventoryItem from './InventoryItem';
import InventoryGrid from './InventoryGrid';
import { useDebounce } from '../hooks/useDebounce';
import { Filter, Search, X, ArrowUpCircle, Sparkles } from 'lucide-react';

interface InventoryProps {
  beasts: ZenBeast[];
  onMint: () => void;
  onSell: (id: string, price: number) => void;
  onStake: (id: string) => void;
  onUnstake: (id: string) => void;
  onEvolve: (beast: ZenBeast) => void;
  onRename: (id: string, name: string) => void;
  coins: number;
  mintPrice: number;
}

const Inventory = React.memo<InventoryProps>(({ beasts, onMint, onSell, onStake, onUnstake, onEvolve, onRename, coins, mintPrice }) => {
  const [isMinting, setIsMinting] = useState(false);
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [sellPrice, setSellPrice] = useState('100');
  const [evolvingId, setEvolvingId] = useState<string | null>(null);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const onStakeRef = useRef(onStake);
  const onUnstakeRef = useRef(onUnstake);
  const onEvolveRef = useRef(onEvolve);
  const coinsRef = useRef(coins);

  useEffect(() => {
    onStakeRef.current = onStake;
    onUnstakeRef.current = onUnstake;
    onEvolveRef.current = onEvolve;
    coinsRef.current = coins;
  }, [onStake, onUnstake, onEvolve, coins]);

  const handleOpenSellModal = React.useCallback((id: string) => {
    setSellingId(id);
  }, []);

  const handleOpenRenameModal = React.useCallback((id: string) => {
      setRenamingId(id);
      setNewName('');
  }, []);

  const handleToggleStake = React.useCallback((id: string, isStaked: boolean) => {
    if (isStaked) {
      onUnstakeRef.current(id);
    } else {
      onStakeRef.current(id);
    }
  }, []);

  const handleEvolveAction = React.useCallback(async (beast: ZenBeast) => {
    if (coinsRef.current < 200) {
      alert("Insufficient ZenCoins to evolve (Cost: 200 ZC)");
      return;
    }
    setEvolvingId(beast.id);
    await onEvolveRef.current(beast);
    setEvolvingId(null);
  }, []);

  const [filterRarity, setFilterRarity] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredBeasts = useMemo(() => {
    return beasts.filter(b => {
        const matchesRarity = filterRarity ? b.rarity === filterRarity : true;
        const matchesClass = filterClass ? b.class === filterClass : true;
        const matchesSearch = b.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
        return matchesRarity && matchesClass && matchesSearch;
    });
  }, [beasts, filterRarity, filterClass, debouncedSearchQuery]);

  const handleMint = async () => {
    setIsMinting(true);
    await onMint();
    setIsMinting(false);
  };

  const confirmSell = () => {
      if(sellingId) {
          onSell(sellingId, parseInt(sellPrice));
          setSellingId(null);
      }
  };

  const confirmRename = () => {
      if (renamingId && newName.trim()) {
          onRename(renamingId, newName.trim());
          setRenamingId(null);
          setNewName('');
      }
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="w-8 h-[2px] bg-primary"></span>
             <h2 className="text-4xl font-display font-black text-foreground tracking-tight uppercase italic">ARMORY <span className="text-primary">&</span> BARRACKS</h2>
           </div>
           <p className="text-sm text-muted-foreground font-display font-bold tracking-widest uppercase ml-10">
             STAKE: <span className="text-accent">+1 ZC/5s</span> | EVOLVE: <span className="text-primary">LVL 5+</span> (COST 200 ZC)
           </p>
        </div>
        <button 
          onClick={handleMint}
          disabled={isMinting || coins < mintPrice}
          className="relative px-10 py-4 bg-primary text-primary-foreground font-display font-black tracking-[0.2em] uppercase cyber-button shadow-xl shadow-primary/20 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isMinting ? <><Sparkles className="animate-spin" size={20} /> SUMMONING...</> : <>SUMMON ENTITY ({mintPrice} ZC)</>}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card/40 backdrop-blur-md p-6 border border-border flex flex-col md:flex-row gap-6 items-center rounded-xl">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
                type="text" 
                placeholder="SEARCH DATABASE..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background/50 border border-border text-foreground pl-12 pr-12 py-3 rounded-lg text-sm font-display font-bold tracking-widest focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            )}
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
              value={filterRarity} 
              onChange={(e) => setFilterRarity(e.target.value)}
              className="flex-1 md:w-48 bg-background/50 border border-border text-muted-foreground px-4 py-3 rounded-lg text-xs font-display font-bold tracking-widest focus:border-primary outline-none cursor-pointer hover:border-primary/50 transition-all uppercase"
          >
              <option value="">RARITY: ALL</option>
              {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select 
              value={filterClass} 
              onChange={(e) => setFilterClass(e.target.value)}
              className="flex-1 md:w-48 bg-background/50 border border-border text-muted-foreground px-4 py-3 rounded-lg text-xs font-display font-bold tracking-widest focus:border-primary outline-none cursor-pointer hover:border-primary/50 transition-all uppercase"
          >
              <option value="">CLASS: ALL</option>
              {Object.values(BeastClass).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {(filterRarity || filterClass || searchQuery) && (
             <button onClick={() => {setFilterRarity(''); setFilterClass(''); setSearchQuery('')}} className="p-3 text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/50 rounded-lg transition-all" aria-label="Clear all filters">
                 <X size={20} />
             </button>
        )}
      </div>

      {/* Grid - Optimized with React.memo */}
      <InventoryGrid
        beasts={filteredBeasts}
        onOpenSellModal={handleOpenSellModal}
        onToggleStake={handleToggleStake}
        onEvolve={handleEvolveAction}
        onRename={handleOpenRenameModal}
        evolvingId={evolvingId}
      />

      {/* Sell Modal */}
      {sellingId && (
          <div className="fixed inset-0 bg-background/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-card border-2 border-primary p-8 max-w-md w-full rounded-2xl shadow-2xl shadow-primary/20 animate-in zoom-in-95 duration-300">
                  <h3 className="text-3xl font-display font-black text-foreground mb-2 italic uppercase tracking-tighter">LIST ON <span className="text-primary">MARKET</span></h3>
                  <p className="text-muted-foreground mb-8 text-sm font-display font-bold tracking-widest uppercase">Set your asking price in ZenCoins.</p>
                  <div className="relative mb-8">
                      <input 
                        type="number" 
                        value={sellPrice} 
                        onChange={(e) => setSellPrice(e.target.value)}
                        className="w-full bg-background/50 border-2 border-border p-6 rounded-xl text-4xl text-primary font-mono font-bold text-center focus:border-primary outline-none transition-all"
                        autoFocus
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground font-display font-bold tracking-widest">ZC</span>
                  </div>
                  <div className="flex gap-4">
                      <button onClick={confirmSell} className="flex-1 bg-primary text-primary-foreground font-display font-black py-4 rounded-xl hover:scale-105 transition-all duration-300 tracking-widest uppercase shadow-lg shadow-primary/20">CONFIRM</button>
                      <button onClick={() => setSellingId(null)} className="flex-1 bg-transparent border border-border text-muted-foreground font-display font-bold py-4 rounded-xl hover:bg-muted transition-all tracking-widest uppercase">CANCEL</button>
                  </div>
              </div>
          </div>
      )}

      {/* Rename Modal */}
      {renamingId && (
          <div className="fixed inset-0 bg-background/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-card border-2 border-secondary p-8 max-w-md w-full rounded-2xl shadow-2xl shadow-secondary/20 animate-in zoom-in-95 duration-300">
                  <h3 className="text-3xl font-display font-black text-foreground mb-2 italic uppercase tracking-tighter">REWRITE <span className="text-secondary">IDENTITY</span></h3>
                  <p className="text-muted-foreground mb-8 text-sm font-display font-bold tracking-widest uppercase">COST: 10 ZC | MAX 25 CHARS</p>
                  <div className="relative mb-8">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="NEW IDENTIFIER..."
                        className="w-full bg-background/50 border-2 border-border p-6 rounded-xl text-2xl text-secondary font-display font-black text-center focus:border-secondary outline-none transition-all"
                        autoFocus
                      />
                  </div>
                  <div className="flex gap-4">
                      <button onClick={confirmRename} className="flex-1 bg-secondary text-secondary-foreground font-display font-black py-4 rounded-xl hover:scale-105 transition-all duration-300 tracking-widest uppercase shadow-lg shadow-secondary/20">CONFIRM</button>
                      <button onClick={() => setRenamingId(null)} className="flex-1 bg-transparent border border-border text-muted-foreground font-display font-bold py-4 rounded-xl hover:bg-muted transition-all tracking-widest uppercase">CANCEL</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
});

export default Inventory;
