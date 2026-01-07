import React from 'react';
import { ZenBeast } from '../types';
import InventoryItem from './InventoryItem';

interface InventoryGridProps {
  beasts: ZenBeast[];
  onOpenSellModal: (id: string) => void;
  onToggleStake: (id: string, isStaked: boolean) => void;
  onEvolve: (beast: ZenBeast) => void;
  onRename: (id: string) => void;
  evolvingId: string | null;
}

const InventoryGrid: React.FC<InventoryGridProps> = React.memo(({
  beasts,
  onOpenSellModal,
  onToggleStake,
  onEvolve,
  evolvingId,
  onRename
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-10">
      {beasts.map(b => (
        <div key={b.id} className="animate-in fade-in zoom-in-95 duration-300">
            <InventoryItem
              beast={b}
              onOpenSellModal={onOpenSellModal}
              onToggleStake={onToggleStake}
              onEvolve={onEvolve}
              onRename={onRename}
              isEvolving={evolvingId === b.id}
            />
        </div>
      ))}
      {beasts.length === 0 && (
          <div className="col-span-full cyber-card p-20 text-center flex flex-col items-center gap-6 opacity-40">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center border border-border">
                  <Activity size={32} className="text-muted-foreground opacity-20" />
              </div>
              <p className="text-sm font-display font-bold text-foreground uppercase tracking-widest">NO UNITS DETECTED IN LOCAL DATABASE</p>
          </div>
      )}
    </div>
  );
});

export default InventoryGrid;
