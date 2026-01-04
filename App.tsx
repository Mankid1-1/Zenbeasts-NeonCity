
import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useGameState } from './hooks/useGameState';

import Layout from './components/Layout';
import DebugConsole from './components/DebugConsole';
import PageLoader from './components/PageLoader';

// Lazy load route components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Inventory = React.lazy(() => import('./components/Inventory'));
const Breeding = React.lazy(() => import('./components/Breeding'));
const BattleArena = React.lazy(() => import('./components/BattleArena'));
const Marketplace = React.lazy(() => import('./components/Marketplace'));
const WorldMap = React.lazy(() => import('./components/WorldMap'));
const Bank = React.lazy(() => import('./components/Bank'));

const App = () => {
  const gameState = useGameState();

  return (
    <>
      <HashRouter>
        <Layout 
          userCoins={gameState.coins} 
          trainerLevel={gameState.trainerLevel} 
          trainerExp={gameState.trainerExp}
          notifications={gameState.notifications}
          wallet={gameState.wallet}
          quests={gameState.quests}
          onDismissNotification={gameState.removeNotification}
          onConnectWallet={gameState.connectWallet}
          onSwitchChain={gameState.switchChain}
          onClaimQuest={gameState.claimQuestReward}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<WorldMap trainerLevel={gameState.trainerLevel} />} />
              <Route path="/dashboard" element={
                  <Dashboard 
                      beasts={gameState.beasts} 
                      coins={gameState.coins} 
                      leaderboard={gameState.leaderboard} 
                      trainerLevel={gameState.trainerLevel} 
                      trainerExp={gameState.trainerExp} 
                      activePerks={gameState.activePerks}
                      achievements={gameState.achievements}
                      coinHistory={gameState.coinHistory}
                      onClaim={gameState.claimEarnings}
                  />
              } />
              <Route path="/inventory" element={
                <Inventory 
                  beasts={gameState.beasts} 
                  onMint={gameState.handleMint} 
                  onSell={gameState.handleListForSale} 
                  onStake={gameState.handleStake}
                  onUnstake={gameState.handleUnstake}
                  onEvolve={gameState.handleEvolve}
                  onRename={gameState.handleRename}
                  coins={gameState.coins}
                  mintPrice={gameState.calculateMintPrice()}
                />
              } />
              <Route path="/breeding" element={<Breeding beasts={gameState.beasts} onBreed={gameState.handleBreed} coins={gameState.coins} />} />
              <Route path="/battle" element={<BattleArena beasts={gameState.beasts} onBattle={gameState.handleBattle} leaderboard={gameState.leaderboard} />} />
              <Route path="/market" element={
                <Marketplace 
                    listings={gameState.marketListings} 
                    onBuy={gameState.handleBuy} 
                    onCancelListing={gameState.handleCancelListing}
                    marketHistory={gameState.marketHistory} 
                />
              } />
              <Route path="/bank" element={
                  <Bank 
                      beasts={gameState.beasts} 
                      wallet={gameState.wallet}
                      onStake={gameState.handleStake}
                      onUnstake={gameState.handleUnstake}
                      onClaimRewards={(id) => gameState.claimStakingRewards(id, false)}
                      onClaimAll={gameState.claimAllStakingRewards}
                  />
              } />
            </Routes>
          </Suspense>
            
            {import.meta.env.DEV && (
              <DebugConsole
                onAddCoins={gameState.debugMethods.addCoins}
                onAddBeast={gameState.debugMethods.addBeast}
                onLevelUp={gameState.debugMethods.levelUp}
                onReset={gameState.debugMethods.reset}
              />
            )}
        </Layout>
      </HashRouter>
      <SpeedInsights />
    </>
  );
};

export default App;
