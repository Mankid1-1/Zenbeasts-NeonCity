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
      className="relative group cursor-pointer animate-in fade-in zoom-in-95 duration-300"
      onClick={() => onSelect(beast)}
    >
        <BeastCard beast={beast} interactive={false} />

        {/* Price Tag */}
        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md border border-primary px-3 py-1 z-20 rounded-lg shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <span className="text-primary font-display font-black text-xs flex items-center gap-1.5 uppercase italic"><Tag size={12}/> {beast.price} ZEN</span>
        </div>

        {beast.originalOwner === 'player' && (
            <div className="absolute top-3 right-3 bg-secondary px-3 py-1 z-20 rounded-lg shadow-xl shadow-secondary/20">
                <span className="text-secondary-foreground font-display font-black text-[8px] uppercase tracking-widest">OWNED</span>
            </div>
        )}

        {/* Mini Price Graph Overlay (Visible on Hover) */}
        <div className="absolute top-[40%] left-0 right-0 h-20 bg-background/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-10 px-4 py-2 border-y border-white/5 translate-y-2 group-hover:translate-y-0">
             <div className="text-[8px] text-muted-foreground font-display font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                MARKET TREND
             </div>
             <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData}>
                        <Line type="monotone" dataKey="price" stroke="hsla(var(--accent))" strokeWidth={2} dot={false} animationDuration={1000} />
                    </LineChart>
                </ResponsiveContainer>
             </div>
        </div>
    </div>
  );
});

export default MarketplaceItem;
