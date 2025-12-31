
import React, { useState, useMemo } from 'react';
import { ZenBeast, Rarity, BeastClass } from '../types';
import BeastCard from './BeastCard';
import BeastDetailModal from './BeastDetailModal';
import { Filter, Search, X, ArrowUpCircle, Lock, Coins, AlertTriangle, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CyberButton, CyberBadge } from './common/CyberComponents';
import { BASE_MINT_PRICE, EVOLUTION_COST } from '../constants';

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

const Inventory: React.FC<InventoryProps> = ({ beasts, onMint, onSell, onStake, onUnstake, onEvolve, onRename, coins, mintPrice }) => {
  const [isMinting, setIsMinting] = useState(false);
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [sellPrice, setSellPrice] = useState('100');
  const [evolvingId, setEvolvingId] = useState<string | null>(null);
  const [selectedBeast, setSelectedBeast] = useState<ZenBeast | null>(null);
  
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
    try {
        await onMint();
    } catch(e) {}
    setIsMinting(false);
  };

  const confirmSell = () => {
      if(sellingId) {
          onSell(sellingId, parseInt(sellPrice));
          setSellingId(null);
      }
  }

  const confirmRename = () => {
      if(renamingId && newName.trim()) {
          onRename(renamingId, newName.trim());
          setRenamingId(null);
          setNewName('');
      }
  }

  const handleEvolveClick = async (e: React.MouseEvent, beast: ZenBeast) => {
    e.stopPropagation();
    if (coins < EVOLUTION_COST) return;
    setEvolvingId(beast.id);
    try {
        await onEvolve(beast);
    } catch(e) {}
    setEvolvingId(null);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
           <h2 className="text-3xl font-mono text-white mb-1">ARMORY & BARRACKS</h2>
           <p className="text-xs text-gray-500 font-mono">
             STAKING AVAILABLE IN <Link to="/bank" className="text-neon-green hover:underline">NEURAL BANK</Link>
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
             <button onClick={() => {setFilterRarity(''); setFilterClass(''); setSearchQuery('')}} className="p-2 text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/50 rounded">
                 <X size={18} />
             </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-10">
        {filteredBeasts.map(b => (
          <div key={b.id} className="relative group perspective-1000" onClick={() => setSelectedBeast(b)}>
              <div className="relative">
                  <BeastCard beast={b} />
                  {!b.isStaked && b.level >= 5 && (
                      <div className="absolute inset-0 rounded-sm shadow-[0_0_15px_rgba(255,240,31,0.5)] border border-neon-yellow animate-pulse pointer-events-none"></div>
                  )}
                  {b.isSoulbound && (
                      <div className="absolute top-2 left-2 z-10 text-gray-500 bg-black/80 rounded-full p-1" title="Soulbound: Cannot be sold">
                          <Lock size={12} />
                      </div>
                  )}
              </div>
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/90 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center space-y-3 z-20 cursor-pointer p-4 text-center">
                  <div className="text-neon-blue text-[10px] font-mono mb-1 tracking-widest animate-pulse">CLICK TO SCAN</div>
                  
                  <div className="flex space-x-2">
                    {!b.isStaked && !b.isSoulbound && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setSellingId(b.id); }}
                            className="bg-transparent border border-white text-white hover:bg-white hover:text-black px-4 py-2 text-xs font-mono tracking-widest transition-colors"
                        >
                            SELL
                        </button>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setRenamingId(b.id); }}
                        className="bg-transparent border border-gray-500 text-gray-400 hover:bg-white hover:text-black px-2 py-2 text-xs transition-colors"
                        title="Rename Protocol"
                    >
                        <Edit3 size={14}/>
                    </button>
                  </div>
                  
                  {/* Evolve Button */}
                  {!b.isStaked && b.level >= 5 && (
                    <div className="w-full mt-2">
                        <button
                          onClick={(e) => handleEvolveClick(e, b)}
                          disabled={evolvingId === b.id || coins < EVOLUTION_COST}
                          className={`
                            flex items-center justify-center space-x-2 w-full border px-2 py-2 text-xs font-mono tracking-widest transition-colors
                            ${coins >= EVOLUTION_COST 
                                ? 'bg-neon-yellow/10 border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-black' 
                                : 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed'}
                          `}
                        >
                          {evolvingId === b.id ? <span className="animate-spin text-lg">↻</span> : <><ArrowUpCircle size={14} /> <span>EVOLVE</span></>}
                        </button>
                        <div className={`text-[10px] font-mono mt-2 px-2 py-1 flex items-center justify-center ${coins >= EVOLUTION_COST ? 'text-neon-yellow bg-neon-yellow/5' : 'text-red-400 bg-red-900/20'}`}>
                           {coins < EVOLUTION_COST && <AlertTriangle size={10} className="mr-1"/>}
                           COST: {EVOLUTION_COST} ZC
                        </div>
                    </div>
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

      {/* Details Modal */}
      {selectedBeast && (
          <BeastDetailModal 
            beast={selectedBeast} 
            onClose={() => setSelectedBeast(null)} 
          >
              <div className="flex flex-col items-end gap-2">
                  {!selectedBeast.isStaked && selectedBeast.level >= 5 && (
                    <div className="flex flex-col items-end p-2 border border-dashed border-gray-700 rounded bg-black/40">
                      <div className="text-xs text-gray-400 font-mono mb-2">EVOLUTION AVAILABLE</div>
                      <CyberButton 
                          variant={coins >= EVOLUTION_COST ? "secondary" : "ghost"}
                          onClick={() => { onEvolve(selectedBeast); setSelectedBeast(null); }}
                          disabled={coins < EVOLUTION_COST}
                      >
                         <ArrowUpCircle className="inline mr-2" size={16}/> EVOLVE
                      </CyberButton>
                      <div className={`text-[10px] font-mono mt-2 flex items-center ${coins >= EVOLUTION_COST ? 'text-neon-yellow' : 'text-red-500'}`}>
                         <Coins size={10} className="mr-1"/> REQUIRED: {EVOLUTION_COST} ZC
                      </div>
                    </div>
                  )}

                  {!selectedBeast.isStaked && !selectedBeast.isSoulbound && (
                      <CyberButton variant="primary" onClick={() => { setSellingId(selectedBeast.id); setSelectedBeast(null); }}>
                          LIST ON MARKET
                      </CyberButton>
                  )}
                  
                  {selectedBeast.isSoulbound && (
                      <CyberBadge color="gray">
                          <Lock size={12} className="inline mr-1"/> SOULBOUND ASSET
                      </CyberBadge>
                  )}
              </div>
          </BeastDetailModal>
      )}

      {/* Sell Modal */}
      {sellingId && (
          <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
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

      {/* Rename Modal */}
      {renamingId && (
          <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
              <div className="bg-slate-900 border-2 border-neon-purple p-8 max-w-md w-full cyber-border shadow-[0_0_30px_rgba(176,38,255,0.2)]">
                  <h3 className="text-2xl text-white font-mono mb-2">RENAME PROTOCOL</h3>
                  <p className="text-gray-400 mb-6 text-sm font-mono">New identity assignment. Cost: 10 ZC</p>
                  <div className="relative mb-6">
                      <input 
                        type="text" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter Name..."
                        className="w-full bg-black border border-slate-700 p-4 text-xl text-white font-mono text-center focus:border-neon-purple outline-none"
                        maxLength={15}
                      />
                  </div>
                  <div className="flex space-x-4">
                      <button onClick={confirmRename} className="flex-1 bg-neon-purple text-white font-bold font-mono py-3 hover:bg-white hover:text-purple-900 transition-colors">EXECUTE</button>
                      <button onClick={() => setRenamingId(null)} className="flex-1 bg-transparent border border-red-500 text-red-500 font-mono py-3 hover:bg-red-500/10 transition-colors">ABORT</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Inventory;
