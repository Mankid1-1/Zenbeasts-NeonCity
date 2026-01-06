
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutProps } from '../types';
import { Menu, X, Coins, Map, Home, Box, Dna, Sword, ShoppingBag, LandPlot, User, Wallet as WalletIcon, Terminal, Gift } from 'lucide-react';
import { CyberToast } from './common/CyberComponents';
import QuestLog from './QuestLog';
 sentinel/fix-code-corruption-and-csp-enhancement-15535713623322996782

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

const NavItem = ({ to, icon, label, onClick }: { to: string, icon: React.ReactNode, label: string, onClick?: () => void }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link 
            to={to} 
            onClick={onClick}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className={`
                flex items-center p-3 rounded-md transition-all duration-300 group border-l-2
                ${isActive 
                    ? 'bg-neon-pink/10 text-neon-pink border-neon-pink shadow-[0_0_10px_rgba(255,0,255,0.2)]' 
                    : 'border-transparent text-gray-500 hover:bg-white/5 hover:text-white hover:border-gray-500'}
            `}
        >
            <span className={`${isActive ? 'text-neon-pink' : 'text-gray-500 group-hover:text-white transition-colors'}`}>{icon}</span>
            <span className="ml-3 font-mono text-sm tracking-widest">{label}</span>
        </Link>
    )
}

const Layout: React.FC<LayoutProps> = ({ children, userCoins, trainerLevel, trainerExp, notifications, wallet, quests, onDismissNotification, onConnectWallet, onSwitchChain, onClaimQuest }) => {
  const nextLevelExp = LEVEL_THRESHOLDS[trainerLevel + 1] || trainerExp;
  const currentLevelExp = LEVEL_THRESHOLDS[trainerLevel] || 0;
  const expProgress = nextLevelExp === currentLevelExp ? 100 : ((trainerExp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;


import { calculateLevelProgress } from '../utils';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick?: () => void }> = ({ to, icon, label, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) => `
            flex items-center px-4 py-3 mb-1 text-sm font-mono tracking-wider transition-all duration-200 border-l-2
            ${isActive
                ? 'border-neon-pink bg-neon-pink/10 text-white shadow-[0_0_15px_rgba(255,0,255,0.2)]'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}
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
 ZenBeasts
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [showQuestLog, setShowQuestLog] = useState(false);

  const { nextLevelExp, progress: expProgress } = calculateLevelProgress(trainerLevel, trainerExp);
  const pendingClaims = quests.filter(q => q.completed && !q.claimed).length;

  return (
    <div className="flex h-screen bg-[#050510] overflow-hidden selection:bg-neon-pink selection:text-white">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-[60px] flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 z-50">
            <div className="flex items-center">
                <Terminal className="text-neon-pink w-6 h-6 mr-2 animate-pulse" />
                <h1 className="text-xl font-mono font-bold text-white tracking-widest leading-none">
                    ZEN<span className="text-neon-pink">BEASTS</span>
                </h1>
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex items-center text-neon-yellow font-bold font-mono text-xs">
                    <Coins size={14} className="mr-1"/>
                    {userCoins.toLocaleString()}
                 </div>
                 <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
                     {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                 </button>
            </div>
        </div>

        {/* Sidebar / Mobile Menu */}
        <div className={`
            fixed inset-0 top-[60px] md:top-0 bg-slate-900/95 md:bg-slate-900/90 md:relative md:w-64 border-r border-slate-800 z-40 backdrop-blur-md transition-transform duration-300 flex flex-col justify-between
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="hidden md:flex p-6 items-center justify-start border-b border-slate-800 bg-black/20">
                <Terminal className="text-neon-pink w-8 h-8 mr-3 animate-pulse flex-shrink-0" />
                <h1 className="text-2xl font-mono font-bold text-white tracking-widest leading-none">
                    ZEN<span className="text-neon-pink text-3xl">BEASTS</span>
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

          <div className="p-4 border-t border-slate-800 bg-black/40">
             <div className="flex flex-col space-y-3">
                 <button
                    onClick={() => { setShowQuestLog(true); setIsMobileMenuOpen(false); }}
                    aria-label="Quest Log"
                    className="flex items-center justify-between w-full bg-slate-800 hover:bg-slate-700 p-2 rounded border border-gray-600 transition-colors group"
                    aria-label="Quest Log"
                 >
                    <div className="flex items-center text-neon-yellow">
                        <Gift size={16} className="mr-2 group-hover:animate-bounce"/> <span className="font-mono text-xs">QUESTS</span>
                    </div>
                    {pendingClaims > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full animate-pulse">{pendingClaims}</span>}
                 </button>

                 {/* Wallet Connection */}
                 <div className="relative">
                     {!wallet.isConnected ? (
                         <button
                            onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                            className="w-full flex items-center justify-center md:justify-start bg-blue-600/20 text-blue-400 border border-blue-500/50 p-2 rounded hover:bg-blue-600/30 transition-colors"
                            aria-label="Connect Wallet"
                         >
 sentinel/fix-code-corruption-and-csp-enhancement-15535713623322996782
                            <WalletIcon size={16} className="mr-2" />
                            <span className="font-mono text-xs">CONNECT WALLET</span>

                            <WalletIcon size={16} className="md:mr-2" />
                            <span className="hidden md:inline font-mono text-xs">CONNECT WALLET</span>
                            <span className="md:hidden font-mono text-xs">CONNECT WALLET</span>
 ZenBeasts
                         </button>
                     ) : (
                         <button
                            onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                            aria-label="Wallet Menu"
                            className="w-full text-left bg-slate-800/80 p-2 rounded border border-slate-600 cursor-pointer hover:border-neon-green transition-colors"
                            onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                            aria-label="Wallet Menu"
                         >
                             <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-gray-400 font-mono uppercase">{wallet.chain}</span>
                                <div className="h-2 w-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_5px_#39ff14]"></div>
                             </div>
                             <div className="text-xs font-mono text-white truncate mb-1">{wallet.address?.substring(0,6)}...{wallet.address?.slice(-4)}</div>
                             <div className="text-xs font-mono text-neon-yellow">{wallet.zenBalance.toFixed(2)} ZEN</div>
                         </button>
                     )}

                     {isWalletMenuOpen && (
                         <div className="absolute bottom-full mb-2 left-0 w-full bg-slate-900 border border-slate-700 p-2 rounded shadow-lg z-50">
                             {!wallet.isConnected ? (
                                <>
                                    <div className="text-xs text-gray-400 mb-2 font-mono text-center">SELECT NETWORK</div>
                                    <button onClick={() => { onConnectWallet('solana'); setIsWalletMenuOpen(false); }} className="w-full text-left text-xs font-mono p-2 hover:bg-slate-800 text-neon-purple block mb-1">SOLANA (Low Fee)</button>
                                    <button onClick={() => { onConnectWallet('polygon'); setIsWalletMenuOpen(false); }} className="w-full text-left text-xs font-mono p-2 hover:bg-slate-800 text-neon-blue block">POLYGON</button>
                                </>
                             ) : (
                                 <>
                                    <div className="text-xs text-gray-400 mb-2 font-mono text-center">SWITCH NETWORK</div>
                                    <button onClick={() => { onSwitchChain('solana'); setIsWalletMenuOpen(false); }} className={`w-full text-left text-xs font-mono p-2 hover:bg-slate-800 block mb-1 ${wallet.chain === 'solana' ? 'text-neon-green' : 'text-gray-400'}`}>SOLANA</button>
                                    <button onClick={() => { onSwitchChain('polygon'); setIsWalletMenuOpen(false); }} className={`w-full text-left text-xs font-mono p-2 hover:bg-slate-800 block ${wallet.chain === 'polygon' ? 'text-neon-green' : 'text-gray-400'}`}>POLYGON</button>
                                 </>
                             )}
                         </div>
                     )}
                 </div>

                 {/* Trainer Level */}
                 <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                     <div className="flex justify-between items-center text-xs font-mono mb-1">
                         <div className="flex items-center text-neon-blue">
                             <User size={12} className="mr-1" /> <span>LVL {trainerLevel}</span>
                         </div>
                         <span className="text-gray-500">{trainerExp}/{nextLevelExp}</span>
                     </div>
                     <div className="w-full bg-black h-1 rounded-full overflow-hidden">
                         <div className="h-full bg-neon-blue transition-all duration-1000 shadow-[0_0_5px_#00ffff]" style={{ width: `${Math.min(100, expProgress)}%` }}></div>
                     </div>
                 </div>

                 {/* Soft Currency (Desktop Only - Mobile has it in header) */}
                 <div className="hidden md:flex items-center justify-start space-x-2 text-neon-yellow font-bold font-mono text-lg bg-black/50 p-2 rounded border border-slate-700 shadow-inner">
                    <Coins size={16} />
                    <span>{userCoins.toLocaleString()} ZC</span>
                 </div>
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050510] to-black">
           <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,20,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,20,0.3)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>

           <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 custom-scrollbar pb-20 md:pb-6">
              {children}
           </div>

           <CyberToast notifications={notifications} onDismiss={onDismissNotification} />
           
           {showQuestLog && <QuestLog quests={quests} onClaim={onClaimQuest} onClose={() => setShowQuestLog(false)} />}
        </div>
    </div>
  );
};

export default Layout;
