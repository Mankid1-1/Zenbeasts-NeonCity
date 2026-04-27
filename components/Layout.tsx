import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Notification, Wallet, Quest, Chain } from '../types';
import { Menu, X, Coins, Map, Home, Box, Dna, Sword, ShoppingBag, LandPlot, User, Wallet as WalletIcon, Terminal, Gift } from 'lucide-react';
import { CyberToast } from './common/CyberComponents';
import QuestLog from './QuestLog';
import { calculateLevelProgress } from '../utils';

interface LayoutProps {
  children: React.ReactNode;
  userCoins: number;
  trainerLevel: number;
  trainerExp: number;
  notifications: Notification[];
  wallet: Wallet;
  quests: Quest[];
  onDismissNotification: (id: string) => void;
  onConnectWallet: (chain: Chain) => void;
  onSwitchChain: (chain: Chain) => void;
  onClaimQuest: (id: string) => void;
}

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick?: () => void }> = ({ to, icon, label, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) => `
            flex items-center px-4 py-3 mb-1 text-sm font-display tracking-wider transition-all duration-300 border-l-2
            ${isActive
                ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_hsla(var(--primary)/0.2)]'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5'}
        `}
    >
        <span className="mr-3">{icon}</span>
        <span className="uppercase">{label}</span>
    </NavLink>
);

const Layout: React.FC<LayoutProps> = ({
    children,
    userCoins,
    trainerLevel,
    trainerExp,
    notifications,
    wallet,
    quests,
    onDismissNotification,
    onConnectWallet,
    onSwitchChain,
    onClaimQuest
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [showQuestLog, setShowQuestLog] = useState(false);

  const { nextLevelExp, progress: expProgress } = calculateLevelProgress(trainerLevel, trainerExp);
  const pendingClaims = quests.filter(q => q.completed && !q.claimed).length;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-[60px] flex items-center justify-between p-4 bg-card/80 backdrop-blur-lg border-b border-border z-50">
            <div className="flex items-center">
                <Terminal className="text-primary w-6 h-6 mr-2 animate-pulse" />
                <h1 className="text-xl font-display font-bold tracking-widest leading-none">
                    ZEN<span className="text-primary">BEASTS</span>
                </h1>
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex items-center text-accent font-bold font-mono text-xs">
                    <Coins size={14} className="mr-1"/>
                    {userCoins.toLocaleString()}
                 </div>
                 <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-foreground">
                     {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                 </button>
            </div>
        </div>

        {/* Sidebar / Mobile Menu */}
        <aside className={`
            fixed inset-0 top-[60px] md:top-0 bg-card/95 md:bg-card/50 md:relative md:w-64 border-r border-border z-40 backdrop-blur-md transition-transform duration-300 flex flex-col justify-between
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="hidden md:flex p-6 items-center justify-start border-b border-border bg-background/20">
                <Terminal className="text-primary w-8 h-8 mr-3 animate-pulse flex-shrink-0" />
                <h1 className="text-2xl font-display font-bold text-foreground tracking-widest leading-none">
                    ZEN<span className="text-primary text-3xl">BEASTS</span>
                </h1>
            </div>
            
            <nav className="mt-4 md:mt-8 space-y-2 px-2">
                <NavItem to="/" icon={<Map size={20} />} label="NEON CITY" onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem to="/dashboard" icon={<Home size={20} />} label="COMMAND HQ" onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem to="/inventory" icon={<Box size={20} />} label="ARMORY" onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem to="/breeding" icon={<Dna size={20} />} label="LAB" onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem to="/battle" icon={<Sword size={20} />} label="ARENA" onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem to="/market" icon={<Coins size={20} />} label="MARKET" onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem to="/bank" icon={<LandPlot size={20} />} label="NEURAL BANK" onClick={() => setIsMobileMenuOpen(false)} />
            </nav>
          </div>

          <div className="p-4 border-t border-border bg-background/40">
             <div className="flex flex-col space-y-3">
                 <button
                    onClick={() => { setShowQuestLog(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-between w-full bg-muted/50 hover:bg-muted p-2 rounded border border-border transition-all duration-200 group"
                 >
                    <div className="flex items-center text-accent">
                        <Gift size={16} className="mr-2 group-hover:animate-bounce"/> <span className="font-display text-xs font-bold">QUESTS</span>
                    </div>
                    {pendingClaims > 0 && <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 rounded-full animate-pulse">{pendingClaims}</span>}
                 </button>

                 {/* Wallet Connection */}
                 <div className="relative">
                     {!wallet.isConnected ? (
                         <button
                            onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                            className="w-full flex items-center justify-center md:justify-start bg-primary/20 text-primary border border-primary/50 p-2 rounded hover:bg-primary/30 transition-all duration-300"
                         >
                            <WalletIcon size={16} className="mr-2" />
                            <span className="font-display text-xs font-bold">CONNECT</span>
                         </button>
                     ) : (
                         <button
                            onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                            className="w-full text-left bg-muted/50 p-2 rounded border border-border cursor-pointer hover:border-primary/50 transition-all duration-300"
                         >
                             <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-muted-foreground font-mono uppercase">{wallet.chain}</span>
                                <div className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_5px_hsla(var(--accent)/0.5)]"></div>
                             </div>
                             <div className="text-xs font-mono text-foreground truncate mb-1">{wallet.address?.substring(0,6)}...{wallet.address?.slice(-4)}</div>
                             <div className="text-xs font-mono text-accent">{wallet.zenBalance.toFixed(2)} ZEN</div>
                         </button>
                     )}

                     {isWalletMenuOpen && (
                         <div className="absolute bottom-full mb-2 left-0 w-full bg-card border border-border p-2 rounded shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                             {!wallet.isConnected ? (
                                <>
                                    <div className="text-[10px] text-muted-foreground mb-2 font-display font-bold text-center">SELECT NETWORK</div>
                                    <button onClick={() => { onConnectWallet('solana'); setIsWalletMenuOpen(false); }} className="w-full text-left text-xs font-mono p-2 hover:bg-muted text-secondary block mb-1 rounded transition-colors">SOLANA</button>
                                    <button onClick={() => { onConnectWallet('polygon'); setIsWalletMenuOpen(false); }} className="w-full text-left text-xs font-mono p-2 hover:bg-muted text-primary block rounded transition-colors">POLYGON</button>
                                </>
                             ) : (
                                 <>
                                    <div className="text-[10px] text-muted-foreground mb-2 font-display font-bold text-center">SWITCH NETWORK</div>
                                    <button onClick={() => { onSwitchChain('solana'); setIsWalletMenuOpen(false); }} className={`w-full text-left text-xs font-mono p-2 hover:bg-muted block mb-1 rounded transition-colors ${wallet.chain === 'solana' ? 'text-accent' : 'text-muted-foreground'}`}>SOLANA</button>
                                    <button onClick={() => { onSwitchChain('polygon'); setIsWalletMenuOpen(false); }} className={`w-full text-left text-xs font-mono p-2 hover:bg-muted block rounded transition-colors ${wallet.chain === 'polygon' ? 'text-accent' : 'text-muted-foreground'}`}>POLYGON</button>
                                 </>
                             )}
                         </div>
                     )}
                 </div>

                 {/* Trainer Level */}
                 <div className="bg-muted/30 p-2 rounded border border-border">
                     <div className="flex justify-between items-center text-xs font-mono mb-1">
                         <div className="flex items-center text-primary">
                             <User size={12} className="mr-1" /> <span className="font-display font-bold uppercase">LVL {trainerLevel}</span>
                         </div>
                         <span className="text-muted-foreground">{trainerExp}/{nextLevelExp}</span>
                     </div>
                     <div className="w-full bg-background h-1.5 rounded-full overflow-hidden border border-border/50">
                         <div className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_hsla(var(--primary)/0.5)]" style={{ width: `${Math.min(100, expProgress)}%` }}></div>
                     </div>
                 </div>

                 {/* Soft Currency (Desktop Only) */}
                 <div className="hidden md:flex items-center justify-start space-x-2 text-accent font-bold font-mono text-lg bg-background/50 p-2 rounded border border-border shadow-inner">
                    <Coins size={16} />
                    <span>{userCoins.toLocaleString()} ZC</span>
                 </div>
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
           {/* Background Grid */}
           <div className="absolute inset-0 bg-[linear-gradient(hsla(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(90deg,hsla(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-0"></div>
           
           <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar pb-24 md:pb-8">
              {children}
           </div>

           <CyberToast notifications={notifications} onDismiss={onDismissNotification} />
           
           {showQuestLog && <QuestLog quests={quests} onClaim={onClaimQuest} onClose={() => setShowQuestLog(false)} />}
        </main>
    </div>
  );
};

export default Layout;
