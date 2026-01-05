import React from 'react';
import { ZenBeast } from '../types';
import InventoryItem from './InventoryItem';

interface InventoryGridProps {
  beasts: ZenBeast[];
  onOpenSellModal: (id: string) => void;
  onToggleStake: (id: string, isStaked: boolean) => void;
  onEvolve: (beast: ZenBeast) => void;
  evolvingId: string | null;
  onRename: (id: string) => void;
}

// Optimization: Memoize the grid to prevent re-rendering the list when parent state (like coins) changes
// but the filtered beasts list remains the same.
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
        <InventoryItem
          key={b.id}
          beast={b}
          onOpenSellModal={onOpenSellModal}
          onToggleStake={onToggleStake}
          onEvolve={onEvolve}
          onRename={onRename}
          isEvolving={evolvingId === b.id}
        />
      ))}
      {beasts.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-600 font-mono">
              NO BEASTS FOUND MATCHING PARAMETERS.
          </div>
      )}
    </div>
  );
});

export default InventoryGrid;
