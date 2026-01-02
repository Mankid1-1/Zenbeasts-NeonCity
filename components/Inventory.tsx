
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ZenBeast, Rarity, BeastClass } from '../types';
import InventoryGrid from './InventoryGrid';
import { useDebounce } from '../hooks/useDebounce';
import { Filter, Search, X } from 'lucide-react';

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

// Optimization: Memoize Inventory to prevent re-renders when parent (App) re-renders but props remain stable
const Inventory = React.memo<InventoryProps>(({
  beasts,
  onMint,
  onSell,
  onStake,
  onUnstake,
  onEvolve,
  onRename,
  coins,
  mintPrice
}) => {
  const [isMinting, setIsMinting] = useState(false);
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [sellPrice, setSellPrice] = useState('100');
  const [evolvingId, setEvolvingId] = useState<string | null>(null);
  
  // Rename Modal State
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  // Optimization: Use Ref pattern to keep handlers stable even when props (coins, callbacks) change.
  // This ensures InventoryItem (which is React.memo'd) doesn't re-render unnecessarily.
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
  }, [onEvolve]);


  // Filters
  const [filterRarity, setFilterRarity] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Optimization: Debounce search query to prevent filtering on every keystroke
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
    <div className="h-full flex flex-col animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
           <h2 className="text-3xl font-mono text-white mb-1">ARMORY & BARRACKS</h2>
           <p className="text-xs text-gray-500 font-mono">
             STAKE: +1 ZC/5s | EVOLVE: LVL 5+ (COST 200 ZC)
           </p>
        </div>
        <button 
          onClick={handleMint}
          disabled={isMinting || coins < mintPrice}
          className={`
            relative px-8 py-3 bg-neon-blue/10 border-2 border-neon-blue text-neon-blue font-bold font-mono tracking-wider cyber-border
            hover:bg-neon-blue hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden
          `}
        >
          <span className="relative z-10 flex items-center">
            {isMinting ? <span className="animate-pulse">SUMMONING ENTITY...</span> : `MINT BEAST (${mintPrice} ZC)`}
          </span>
          <div className="absolute inset-0 bg-neon-blue transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 origin-left z-0"></div>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/50 p-4 border border-slate-700 mb-6 flex flex-col md:flex-row gap-4 items-center rounded-sm">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 text-gray-500 pointer-events-none" size={16} />
            <input 
                type="text" 
                aria-label="Search beasts by name"
                placeholder="Search database..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-slate-700 text-white pl-10 pr-10 py-2 text-sm focus:border-neon-blue focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-gray-500 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
        </div>
        <select 
            aria-label="Filter by rarity"
            value={filterRarity} 
            onChange={(e) => setFilterRarity(e.target.value)}
            className="w-full md:w-auto bg-black/50 border border-slate-700 text-gray-300 px-4 py-2 text-sm focus:border-neon-blue outline-none cursor-pointer"
        >
            <option value="">All Rarities</option>
            {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select 
            aria-label="Filter by class"
            value={filterClass} 
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full md:w-auto bg-black/50 border border-slate-700 text-gray-300 px-4 py-2 text-sm focus:border-neon-blue outline-none cursor-pointer"
        >
            <option value="">All Classes</option>
            {Object.values(BeastClass).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(filterRarity || filterClass || searchQuery) && (
             <button onClick={() => {setFilterRarity(''); setFilterClass(''); setSearchQuery('')}} className="p-2 text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/50 rounded" aria-label="Clear all filters">
                 <X size={18} />
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
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-slate-900 border-2 border-neon-blue p-8 max-w-md w-full cyber-border shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                  <h3 className="text-2xl text-white font-mono mb-2">LIST ON BLACK MARKET</h3>
                  <label htmlFor="sell-price-input" className="text-gray-400 mb-6 text-sm font-mono block">Enter listing price in ZenCoins.</label>
                  <div className="relative mb-6">
                      <input 
                        id="sell-price-input"
                        type="number" 
                        value={sellPrice} 
                        onChange={(e) => setSellPrice(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmSell();
                            if (e.key === 'Escape') setSellingId(null);
                        }}
                        autoFocus
                        aria-label="Listing Price (ZenCoins)"
                        className="w-full bg-black border border-slate-700 p-4 text-2xl text-neon-blue font-mono text-center focus:border-neon-blue outline-none"
                      />
                      <span className="absolute right-4 top-4 text-gray-500 font-mono">ZC</span>
                  </div>
                  <div className="flex space-x-4">
                      <button onClick={confirmSell} className="flex-1 bg-neon-blue text-black font-bold font-mono py-3 hover:bg-white transition-colors">CONFIRM LISTING</button>
                      <button onClick={() => setSellingId(null)} className="flex-1 bg-transparent border border-red-500 text-red-500 font-mono py-3 hover:bg-red-500/10 transition-colors">CANCEL</button>
                  </div>
              </div>
          </div>
      )}

      {/* Rename Modal */}
      {renamingId && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-slate-900 border-2 border-neon-purple p-8 max-w-md w-full cyber-border shadow-[0_0_30px_rgba(180,0,255,0.2)]">
                  <h3 className="text-2xl text-white font-mono mb-2">REWRITE IDENTITY</h3>
                  <p className="text-gray-400 mb-6 text-sm font-mono">Cost: 10 ZC. Max 25 chars.</p>
                  <div className="relative mb-6">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmRename();
                            if (e.key === 'Escape') setRenamingId(null);
                        }}
                        autoFocus
                        placeholder="New Name"
                        aria-label="New Beast Name"
                        className="w-full bg-black border border-slate-700 p-4 text-xl text-neon-purple font-mono text-center focus:border-neon-purple outline-none"
                      />
                  </div>
                  <div className="flex space-x-4">
                      <button onClick={confirmRename} className="flex-1 bg-neon-purple text-white font-bold font-mono py-3 hover:bg-white hover:text-black transition-colors">CONFIRM RENAME</button>
                      <button onClick={() => setRenamingId(null)} className="flex-1 bg-transparent border border-gray-500 text-gray-500 font-mono py-3 hover:bg-gray-500/10 transition-colors">CANCEL</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
});

export default Inventory;
