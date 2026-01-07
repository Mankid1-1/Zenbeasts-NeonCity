import React from 'react';
import { ZenBeast } from '../types';
import BeastCard from './BeastCard';
import { Tag } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MarketplaceItemProps {
  beast: ZenBeast;
  onSelect: (beast: ZenBeast) => void;
}

// Mock price history data generator (since we don't have real historical data per beast yet)
const generateMockHistory = () => {
    return Array.from({ length: 10 }, (_, i) => ({
        price: 50 + Math.random() * 50
    }));
};

// Optimization: Memoize the item to prevent re-renders of the entire list when only one item changes or when parent re-renders
const MarketplaceItem: React.FC<MarketplaceItemProps> = React.memo(({
  beast,
  onSelect
}) => {
  const historyData = React.useMemo(() => generateMockHistory(), []);

  return (
    <div
      className="relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-neon-yellow rounded-sm"
      onClick={() => onSelect(beast)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(beast);
        }
      }}
      aria-label={`View listing for ${beast.name}, Price: ${beast.price} ZenCoins`}
    >
        <BeastCard beast={beast} interactive={false} />

        {/* Price Tag */}
        <div className="absolute top-2 left-2 bg-black/90 border border-neon-yellow px-2 py-1 z-20 shadow-[0_0_10px_rgba(255,255,0,0.3)]">
            <span className="text-neon-yellow font-bold font-mono text-xs flex items-center"><Tag size={12} className="mr-1"/> {beast.price} ZEN</span>
        </div>

        {beast.originalOwner === 'player' && (
            <div className="absolute top-2 right-2 bg-neon-blue px-2 py-1 z-20 shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                <span className="text-black font-bold font-mono text-[10px]">YOURS</span>
            </div>
        )}

        {/* Mini Price Graph Overlay (Visible on Hover) */}
        <div className="absolute bottom-[80px] left-0 right-0 h-16 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 px-2 py-1 border-t border-b border-gray-700">
             <div className="text-[9px] text-gray-400 font-mono mb-1">PRICE TREND</div>
             <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData}>
                        <Line type="monotone" dataKey="price" stroke="#39ff14" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
             </div>
        </div>
    </div>
  );
});

export default MarketplaceItem;
