import React from 'react';
import { ZenBeast } from '../types';
import BeastCard from './BeastCard';
import { ArrowUpCircle, Edit3 } from 'lucide-react';

interface InventoryItemProps {
  beast: ZenBeast;
  onOpenSellModal: (id: string) => void;
  onToggleStake: (id: string, isStaked: boolean) => void;
  onEvolve: (beast: ZenBeast) => void;
  onRename: (id: string) => void;
  isEvolving: boolean;
}

// Optimization: Memoize the item to prevent re-renders of the entire list when only one item changes or when parent re-renders unrelated state
const InventoryItem: React.FC<InventoryItemProps> = React.memo(({
  beast,
  onOpenSellModal,
  onToggleStake,
  onEvolve,
  onRename,
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

  const handleRenameClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRename(beast.id);
  };

  return (
      <div className="relative group">
          <BeastCard beast={beast} interactive={false} />

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-300 flex flex-col items-center justify-center space-y-4 z-20">
              <div className="flex gap-2">
                {!beast.isStaked && (
                    <>
                        <button
                            onClick={handleSellClick}
                            className="bg-background border border-border text-foreground hover:bg-foreground hover:text-background px-4 py-2 text-[10px] font-display font-bold tracking-widest transition-all duration-300 rounded-sm"
                        >
                            SELL
                        </button>
                        <button
                             onClick={handleRenameClick}
                             className="bg-background border border-primary text-primary hover:bg-primary hover:text-background px-4 py-2 text-[10px] font-display font-bold tracking-widest transition-all duration-300 rounded-sm"
                        >
                             <Edit3 size={14} />
                        </button>
                    </>
                )}
                <button
                    onClick={handleStakeClick}
                    className={`
                        px-4 py-2 text-[10px] font-display font-bold tracking-widest border transition-all duration-300 rounded-sm
                        ${beast.isStaked
                            ? 'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground'
                            : 'border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground'}
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
                  className="flex items-center space-x-2 bg-accent/10 border border-accent text-accent px-6 py-2 text-[10px] font-display font-bold tracking-widest hover:bg-accent hover:text-accent-foreground transition-all duration-300 rounded-sm cyber-button"
                >
                  {isEvolving ? <span className="animate-spin text-lg">↻</span> : <><ArrowUpCircle size={16} /> <span>EVOLVE</span></>}
                </button>
              )}
          </div>
      </div>
  );
});

export default InventoryItem;
