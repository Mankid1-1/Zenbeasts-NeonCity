import React from 'react';
import { ZenBeast } from '../types';
import BeastCard from './BeastCard';
import { Tag } from 'lucide-react';

interface MarketplaceItemProps {
  beast: ZenBeast;
  onSelect: (beast: ZenBeast) => void;
}

// Optimization: Memoize the item to prevent re-renders of the entire list when only one item changes or when parent re-renders
const MarketplaceItem: React.FC<MarketplaceItemProps> = React.memo(({
  beast,
  onSelect
}) => {
  return (
    <div className="relative group cursor-pointer" onClick={() => onSelect(beast)}>
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
  );
});

export default MarketplaceItem;
