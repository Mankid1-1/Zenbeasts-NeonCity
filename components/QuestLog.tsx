
import React from 'react';
import { Quest } from '../types';
import { CheckCircle, Circle, Gift } from 'lucide-react';
import { CyberButton } from './common/CyberComponents';

interface QuestLogProps {
    quests: Quest[];
    onClaim: (questId: string) => void;
    onClose: () => void;
}

const QuestLog: React.FC<QuestLogProps> = ({ quests, onClaim, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up" onClick={onClose}>
            <div className="w-full max-w-lg bg-slate-900 border-2 border-neon-blue cyber-border p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h2 className="text-2xl font-mono font-bold text-white flex items-center">
                        <Gift className="mr-2 text-neon-pink" /> DAILY CONTRACTS
                    </h2>
                    <div className="text-xs font-mono text-gray-500">REFRESHES IN: 14H 22M</div>
                </div>

                <div className="space-y-4">
                    {quests.map(quest => (
                        <div key={quest.id} className={`p-4 border ${quest.completed ? 'border-neon-green bg-neon-green/5' : 'border-gray-700 bg-black/40'} rounded relative overflow-hidden transition-all`}>
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <div>
                                    <h3 className={`font-mono font-bold ${quest.completed ? 'text-neon-green' : 'text-white'}`}>{quest.title}</h3>
                                    <p className="text-xs text-gray-400 font-mono">{quest.description}</p>
                                </div>
                                {quest.completed ? <CheckCircle size={20} className="text-neon-green"/> : <Circle size={20} className="text-gray-600"/>}
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-3 relative z-10">
                                <div 
                                    className={`h-full ${quest.completed ? 'bg-neon-green' : 'bg-neon-blue'} transition-all duration-500`} 
                                    style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                                ></div>
                            </div>
                            
                            <div className="flex justify-between items-center relative z-10">
                                <div className="text-xs font-mono text-gray-500">
                                    PROGRESS: {quest.current}/{quest.target}
                                </div>
                                <div>
                                    {quest.completed && !quest.claimed ? (
                                        <CyberButton onClick={() => onClaim(quest.id)} variant="primary" className="text-[10px] py-1 px-3">
                                            CLAIM REWARD
                                        </CyberButton>
                                    ) : quest.claimed ? (
                                        <span className="text-xs font-mono text-gray-500">CLAIMED</span>
                                    ) : (
                                        <div className="text-xs font-mono text-neon-yellow">
                                            {quest.rewardCoins} ZC • {quest.rewardExp} XP
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-6 text-center">
                    <button onClick={onClose} className="text-gray-500 hover:text-white font-mono text-sm underline">CLOSE TERMINAL</button>
                </div>
            </div>
        </div>
    );
};

export default QuestLog;
