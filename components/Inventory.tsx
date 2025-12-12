
import React, { useState, useMemo } from 'react';
import { ZenBeast, Rarity, BeastClass } from '../types';
import BeastCard from './BeastCard';
import { Filter, Search, X, ArrowUpCircle } from 'lucide-react';
import { BASE_MINT_PRICE } from '../constants';

interface InventoryProps {
  beasts: ZenBeast[];
  onMint: () => void;
  onSell: (id: string, price: number) => void;
  onStake: (id: string) => void;
  onUnstake: (id: string) => void;
  onEvolve: (beast: ZenBeast) => void;
  coins: number;
}

const Inventory: React.FC<InventoryProps> = ({ beasts, onMint, onSell, onStake, onUnstake, onEvolve, coins }) => {
  const [isMinting, setIsMinting] = useState(false);
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [sellPrice, setSellPrice] = useState('100');
  const [evolvingId, setEvolvingId] = useState<string | null>(null);
  
  // Filters
  const [filterRarity, setFilterRarity] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBeasts = useMemo(() => {
    return beasts.filter(b => {
        const matchesRarity = filterRarity ? b.rarity === filterRarity : true;
        const matchesClass = filterClass ? b.class === filterClass : true;
        const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRarity && matchesClass && matchesSearch;
    });
  }, [beasts, filterRarity, filterClass, searchQuery]);

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
  }

  const handleEvolveClick = async (e: React.MouseEvent, beast: ZenBeast) => {
    e.stopPropagation();
    if (coins < 200) {
      alert("Insufficient ZenCoins to evolve (Cost: 200 ZC)");
      return;
    }
    setEvolvingId(beast.id);
    await onEvolve(beast);
    setEvolvingId(null);
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
          disabled={isMinting || coins < BASE_MINT_PRICE}
          className={`
            relative px-8 py-3 bg-neon-blue/10 border-2 border-neon-blue text-neon-blue font-bold font-mono tracking-wider cyber-border
            hover:bg-neon-blue hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden
          `}
        >
          <span className="relative z-10 flex items-center">
            {isMinting ? <span className="animate-pulse">SUMMONING ENTITY...</span> : `MINT BEAST (${BASE_MINT_PRICE} ZC)`}
          </span>
          <div className="absolute inset-0 bg-neon-blue transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 origin-left z-0"></div>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/50 p-4 border border-slate-700 mb-6 flex flex-col md:flex-row gap-4 items-center rounded-sm">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 text-gray-500" size={16} />
            <input 
                type="text" 
                placeholder="Search database..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-slate-700 text-white pl-10 pr-4 py-2 text-sm focus:border-neon-blue focus:outline-none transition-colors"
            />
        </div>
        <select 
            value={filterRarity} 
            onChange={(e) => setFilterRarity(e.target.value)}
            className="w-full md:w-auto bg-black/50 border border-slate-700 text-gray-300 px-4 py-2 text-sm focus:border-neon-blue outline-none"
        >
            <option value="">All Rarities</option>
            {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select 
            value={filterClass} 
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full md:w-auto bg-black/50 border border-slate-700 text-gray-300 px-4 py-2 text-sm focus:border-neon-blue outline-none"
        >
            <option value="">All Classes</option>
            {Object.values(BeastClass).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(filterRarity || filterClass || searchQuery) && (
             <button onClick={() => {setFilterRarity(''); setFilterClass(''); setSearchQuery('')}} className="p-2 text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/50 rounded" aria-label="Clear filters">
                 <X size={18} />
             </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-10">
        {filteredBeasts.map(b => (
          <div key={b.id} className="relative group perspective-1000">
              <BeastCard beast={b} />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center space-y-3 z-20">
                  <div className="flex space-x-2">
                    {!b.isStaked && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setSellingId(b.id); }}
                            className="bg-transparent border border-white text-white hover:bg-white hover:text-black px-4 py-2 text-xs font-mono tracking-widest transition-colors"
                        >
                            SELL
                        </button>
                    )}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            b.isStaked ? onUnstake(b.id) : onStake(b.id);
                        }}
                        className={`
                            px-4 py-2 text-xs font-mono tracking-widest border transition-colors
                            ${b.isStaked 
                                ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white' 
                                : 'border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white'}
                        `}
                    >
                        {b.isStaked ? 'UNSTAKE' : 'STAKE'}
                    </button>
                  </div>
                  
                  {/* Evolve Button */}
                  {!b.isStaked && b.level >= 5 && (
                    <button
                      onClick={(e) => handleEvolveClick(e, b)}
                      disabled={evolvingId === b.id}
                      className="flex items-center space-x-2 bg-neon-yellow/10 border border-neon-yellow text-neon-yellow px-4 py-2 text-xs font-mono tracking-widest hover:bg-neon-yellow hover:text-black transition-colors"
                    >
                      {evolvingId === b.id ? <span className="animate-spin text-lg">↻</span> : <><ArrowUpCircle size={14} /> <span>EVOLVE</span></>}
                    </button>
                  )}
              </div>
          </div>
        ))}
        {filteredBeasts.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-600 font-mono">
                NO BEASTS FOUND MATCHING PARAMETERS.
            </div>
        )}
      </div>

      {/* Sell Modal */}
      {sellingId && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-slate-900 border-2 border-neon-blue p-8 max-w-md w-full cyber-border shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                  <h3 className="text-2xl text-white font-mono mb-2">LIST ON BLACK MARKET</h3>
                  <p className="text-gray-400 mb-6 text-sm font-mono">Enter listing price in ZenCoins.</p>
                  <div className="relative mb-6">
                      <input 
                        type="number" 
                        value={sellPrice} 
                        onChange={(e) => setSellPrice(e.target.value)}
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
    </div>
  );
};

export default Inventory;
