import React from 'react';
import { ZenBeast } from '../types';
import BeastCard from './BeastCard';
import { ArrowUpCircle } from 'lucide-react';

interface InventoryItemProps {
  beast: ZenBeast;
  onOpenSellModal: (id: string) => void;
  onToggleStake: (id: string, isStaked: boolean) => void;
  onEvolve: (beast: ZenBeast) => void;
  isEvolving: boolean;
}

// Optimization: Memoize the item to prevent re-renders of the entire list when only one item changes or when parent re-renders unrelated state
const InventoryItem: React.FC<InventoryItemProps> = React.memo(({
  beast,
  onOpenSellModal,
  onToggleStake,
  onEvolve,
  isEvolving
}) => {

  const handleSellClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpenSellModal(beast.id);
  };

  const handleStakeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleStake(beast.id, beast.isStaked);
  };

  const handleEvolveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEvolve(beast);
  };

  return (
      <div className="relative group perspective-1000">
          <BeastCard beast={beast} />

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center space-y-3 z-20">
              <div className="flex space-x-2">
                {!beast.isStaked && (
                    <button
                        onClick={handleSellClick}
                        aria-label={`Sell ${beast.name}`}
                        className="bg-transparent border border-white text-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none px-4 py-2 text-xs font-mono tracking-widest transition-colors"
                    >
                        SELL
                    </button>
                )}
                <button
                    onClick={handleStakeClick}
                    aria-label={`${beast.isStaked ? 'Unstake' : 'Stake'} ${beast.name}`}
                    className={`
                        px-4 py-2 text-xs font-mono tracking-widest border transition-colors focus:outline-none
                        ${beast.isStaked
                            ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white'
                            : 'border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white focus:bg-neon-purple focus:text-white'}
                    `}
                >
                    {beast.isStaked ? 'UNSTAKE' : 'STAKE'}
                </button>
              </div>

              {/* Evolve Button */}
              {!beast.isStaked && beast.level >= 5 && (
                <button
                  onClick={handleEvolveClick}
                  disabled={isEvolving}
                  aria-label={`Evolve ${beast.name}`}
                  className="flex items-center space-x-2 bg-neon-yellow/10 border border-neon-yellow text-neon-yellow px-4 py-2 text-xs font-mono tracking-widest hover:bg-neon-yellow hover:text-black focus:bg-neon-yellow focus:text-black focus:outline-none transition-colors"
                >
                  {isEvolving ? <span className="animate-spin text-lg">↻</span> : <><ArrowUpCircle size={14} /> <span>EVOLVE</span></>}
                </button>
              )}
          </div>
      </div>
  );
});

export default InventoryItem;
