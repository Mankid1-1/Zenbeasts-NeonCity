import React, { useState, useMemo } from 'react';
import { ZenBeast, Rarity, BeastClass } from '../types';
import BeastDetailModal from './BeastDetailModal';
import MarketplaceItem from './MarketplaceItem';
import { ShoppingBag, Search, Activity, Fuel, User, X, Tag } from 'lucide-react';
import { TOKENOMICS } from '../constants';

interface MarketplaceProps {
  listings: ZenBeast[];
  onBuy: (beast: ZenBeast) => void;
  onCancelListing: (id: string) => void;
  marketHistory: string[];
}

const Marketplace: React.FC<MarketplaceProps> = ({ listings, onBuy, onCancelListing, marketHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('');
  const [selectedBeast, setSelectedBeast] = useState<ZenBeast | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');

  const filteredListings = useMemo(() => {
    return listings.filter(beast => {
      const matchesSearch = beast.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = selectedRarity ? beast.rarity === selectedRarity : true;
      const matchesMode = viewMode === 'mine' ? beast.originalOwner === 'player' : true;
      return matchesSearch && matchesRarity && matchesMode;
    });
  }, [listings, searchTerm, selectedRarity, viewMode]);

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-[2px] bg-primary"></span>
            <h2 className="text-4xl font-display font-black text-foreground tracking-tight uppercase italic">BLACK <span className="text-primary">MARKET</span></h2>
          </div>
          <p className="text-sm text-muted-foreground font-display font-bold tracking-widest uppercase ml-10">SECURE P2P TRADING // DISTRIBUTED LEDGER</p>
        </div>
        <div className="flex bg-card/40 backdrop-blur-md border border-border p-1.5 rounded-xl">
            <button 
                onClick={() => setViewMode('all')}
                className={`px-6 py-2 rounded-lg text-xs font-display font-black uppercase tracking-widest transition-all ${viewMode === 'all' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
            >
                GLOBAL LISTINGS
            </button>
            <button 
                onClick={() => setViewMode('mine')}
                className={`px-6 py-2 rounded-lg text-xs font-display font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'mine' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
            >
                <User size={12} />
                MY ASSETS
            </button>
        </div>
      </header>

      {/* Market Feed (Marquee-like) */}
      <div className="cyber-card p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-primary whitespace-nowrap">
                <Activity size={14} className="animate-pulse" />
                <span className="text-[10px] font-display font-black uppercase tracking-widest">LIVE FEED:</span>
            </div>
            <div className="flex-1 overflow-hidden relative h-5">
                <div className="absolute flex gap-8 animate-marquee whitespace-nowrap">
                    {marketHistory.length > 0 ? marketHistory.map((msg, i) => (
                        <span key={i} className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                            {msg} <span className="mx-2 text-primary/30">|</span>
                        </span>
                    )) : (
                        <span className="text-[10px] text-muted-foreground font-mono uppercase">AWAITING SYSTEM TRANSACTIONS...</span>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-md p-6 border border-border flex flex-col md:flex-row gap-6 items-center rounded-xl">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
                type="text" 
                placeholder="SEARCH ASSET CATALOG..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background/50 border border-border text-foreground pl-12 pr-12 py-3 rounded-lg text-sm font-display font-bold tracking-widest focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            )}
        </div>
        <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="w-full md:w-48 bg-background/50 border border-border text-muted-foreground px-4 py-3 rounded-lg text-xs font-display font-bold tracking-widest focus:border-primary outline-none cursor-pointer hover:border-primary/50 transition-all uppercase"
        >
            <option value="">RARITY: ALL</option>
            {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-10">
        {filteredListings.map((beast) => (
            <MarketplaceItem
                key={beast.id}
                beast={beast}
                onSelect={setSelectedBeast}
            />
        ))}
        {filteredListings.length === 0 && (
            <div className="col-span-full cyber-card p-20 text-center flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center border border-border">
                    <Search size={32} className="text-muted-foreground opacity-20" />
                </div>
                <div>
                    <p className="text-sm font-display font-bold text-foreground uppercase tracking-widest mb-2">NO ASSETS DETECTED</p>
                    <p className="text-xs text-muted-foreground font-display font-bold uppercase tracking-widest">ADJUST YOUR SCAN PARAMETERS OR CLEAR FILTERS</p>
                </div>
                {(searchTerm || selectedRarity || viewMode === 'mine') && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedRarity('');
                            setViewMode('all');
                        }}
                        className="text-[10px] font-display font-black text-primary hover:text-foreground tracking-[0.2em] uppercase transition-colors px-6 py-2 border border-primary/20 rounded-full hover:border-foreground"
                    >
                        RESET SCANNER
                    </button>
                )}
            </div>
        )}
      </div>

      {selectedBeast && (
          <BeastDetailModal beast={selectedBeast} onClose={() => setSelectedBeast(null)}>
             <div className="flex flex-col items-end gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex flex-col items-end">
                    <div className="text-[10px] font-display font-black text-primary uppercase tracking-widest mb-1">ASSET VALUATION</div>
                    <div className="text-4xl font-display font-black text-foreground italic uppercase tracking-tighter neon-text">{selectedBeast.price} <span className="text-primary text-2xl">ZEN</span></div>
                </div>
                
                {selectedBeast.originalOwner === 'player' ? (
                     <div className="w-full space-y-4">
                         <div className="text-[10px] text-accent font-display font-bold uppercase tracking-widest text-center">OWNERSHIP VERIFIED</div>
                         <button 
                             onClick={() => { onCancelListing(selectedBeast.id); setSelectedBeast(null); }}
                             className="w-full py-4 bg-destructive text-destructive-foreground font-display font-black tracking-widest uppercase rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-destructive/20"
                         >
                             CANCEL LISTING
                         </button>
                     </div>
                ) : (
                    <div className="w-full space-y-4">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-display font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-1">
                                <Fuel size={12} className="text-secondary"/> 
                                EST. NETWORK FEE: ~0.005 ZEN
                            </div>
                            <span className="text-accent">TRANSACTION SECURE</span>
                        </div>
                        <button 
                            onClick={() => { onBuy(selectedBeast); setSelectedBeast(null); }}
                            className="w-full py-4 bg-primary text-primary-foreground font-display font-black tracking-widest uppercase rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            ACQUIRE ASSET
                        </button>
                    </div>
                )}
             </div>
          </BeastDetailModal>
      )}
    </div>
  );
};

export default React.memo(Marketplace);
