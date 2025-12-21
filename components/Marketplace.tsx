
import React, { useState, useMemo } from 'react';
import { ZenBeast, Rarity, BeastClass } from '../types';
import BeastCard from './BeastCard';
import BeastDetailModal from './BeastDetailModal';
import { ShoppingBag, Search, Filter, X, Tag, Activity, Fuel, User } from 'lucide-react';
import { SectionHeader, CyberButton } from './common/CyberComponents';
import { TOKENOMICS } from '../constants';

interface MarketplaceProps {
  listings: ZenBeast[];
  onBuy: (beast: ZenBeast) => void;
  onCancelListing: (id: string) => void;
  userCoins: number; 
  marketHistory: string[];
}

const Marketplace: React.FC<MarketplaceProps> = ({ listings, onBuy, onCancelListing, userCoins, marketHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('');
  const [selectedBeast, setSelectedBeast] = useState<ZenBeast | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');

  // Optimization: Memoize filtered listings to prevent re-calculation on every render (e.g. when userCoins changes)
  const filteredListings = useMemo(() => {
    return listings.filter(beast => {
      const matchesSearch = beast.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = selectedRarity ? beast.rarity === selectedRarity : true;
      const matchesMode = viewMode === 'mine' ? beast.originalOwner === 'player' : true;
      return matchesSearch && matchesRarity && matchesMode;
    });
  }, [listings, searchTerm, selectedRarity, viewMode]);

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <SectionHeader 
        title="BLACK MARKET" 
        subtitle="SECURE P2P TRADING NETWORK (ZEN ONLY)" 
        icon={<ShoppingBag />}
        rightElement={
            <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center text-xs text-neon-green mb-1"><Activity size={12} className="mr-1"/> RECENT TRANSACTIONS</div>
                <div className="h-6 overflow-hidden w-64 bg-black border border-gray-800 px-2 rounded">
                    <div className="animate-[translateY_-100%]">
                        {marketHistory.length > 0 ? marketHistory.map((msg, i) => (
                            <div key={i} className="text-[10px] text-gray-400 font-mono truncate">{msg}</div>
                        )) : <div className="text-[10px] text-gray-600">No recent activity...</div>}
                    </div>
                </div>
            </div>
        }
      />

      <div className="bg-slate-900/50 p-4 border border-slate-700 mb-6 flex flex-col md:flex-row gap-4 items-center rounded-sm justify-between">
        <div className="flex gap-4 items-center flex-1">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                <input
                    type="text"
                    placeholder="Search Listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search listings"
                    className="w-full bg-black/50 border border-slate-700 text-white pl-10 pr-4 py-2 text-sm focus:border-neon-yellow outline-none"
                />
            </div>
            <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                aria-label="Filter by rarity"
                className="bg-black/50 border border-slate-700 text-gray-300 px-4 py-2 text-sm focus:border-neon-yellow outline-none"
            >
                <option value="">All Rarities</option>
                {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
        </div>
        
        <div className="flex bg-black p-1 rounded border border-gray-800">
             <button 
                onClick={() => setViewMode('all')}
                className={`px-4 py-1 text-xs font-mono transition-colors ${viewMode === 'all' ? 'bg-neon-yellow text-black font-bold' : 'text-gray-500 hover:text-white'}`}
             >
                 GLOBAL
             </button>
             <button 
                onClick={() => setViewMode('mine')}
                className={`px-4 py-1 text-xs font-mono transition-colors flex items-center ${viewMode === 'mine' ? 'bg-neon-yellow text-black font-bold' : 'text-gray-500 hover:text-white'}`}
             >
                 <User size={12} className="mr-1"/> MY LISTINGS
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pb-10">
        {filteredListings.map((beast) => (
            <div key={beast.id} className="relative group cursor-pointer" onClick={() => setSelectedBeast(beast)}>
                <BeastCard beast={beast} />
                <div className="absolute top-2 left-2 bg-black border border-neon-yellow px-2 py-1 z-20 shadow-lg">
                    <span className="text-neon-yellow font-bold font-mono text-xs flex items-center"><Tag size={12} className="mr-1"/> {beast.price} ZEN</span>
                </div>
                {beast.originalOwner === 'player' && (
                    <div className="absolute top-2 right-2 bg-neon-blue px-2 py-1 z-20">
                        <span className="text-black font-bold font-mono text-[10px]">YOURS</span>
                    </div>
                )}
            </div>
        ))}
        {filteredListings.length === 0 && <div className="col-span-full text-center text-gray-600 py-20 font-mono">NO LISTINGS FOUND</div>}
      </div>

      {selectedBeast && (
          <BeastDetailModal beast={selectedBeast} onClose={() => setSelectedBeast(null)}>
             <div className="flex flex-col items-end gap-2">
                <div className="text-neon-yellow font-mono text-xl font-bold">{selectedBeast.price} ZEN</div>
                
                {selectedBeast.originalOwner === 'player' ? (
                     <div className="flex flex-col items-end">
                         <div className="text-xs text-gray-400 font-mono mb-2">YOU OWN THIS LISTING</div>
                         <CyberButton 
                             onClick={() => { onCancelListing(selectedBeast.id); setSelectedBeast(null); }}
                             variant="danger"
                         >
                             CANCEL LISTING
                         </CyberButton>
                     </div>
                ) : (
                    <>
                        <div className="text-xs text-gray-400 font-mono flex items-center">
                            <Fuel size={12} className="mr-1 text-neon-purple"/> 
                            EST. GAS: ~0.005 ZEN
                        </div>
                        <CyberButton 
                            onClick={() => { onBuy(selectedBeast); setSelectedBeast(null); }}
                            variant="primary"
                        >
                            PURCHASE ASSET
                        </CyberButton>
                    </>
                )}
             </div>
          </BeastDetailModal>
      )}
    </div>
  );
};

export default Marketplace;
