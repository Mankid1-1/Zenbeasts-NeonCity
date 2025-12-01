
import React, { useState, useEffect } from 'react';
import { Terminal, X, ChevronRight } from 'lucide-react';

interface DebugConsoleProps {
    onAddCoins: (amount: number) => void;
    onAddBeast: () => void;
    onLevelUp: () => void;
    onReset: () => void;
}

const DebugConsole: React.FC<DebugConsoleProps> = ({ onAddCoins, onAddBeast, onLevelUp, onReset }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [command, setCommand] = useState('');
    const [logs, setLogs] = useState<string[]>(['> ZenBeasts Debug Protocol v1.0 initialized...']);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === '`') {
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const execute = () => {
        const cmd = command.trim().toLowerCase();
        setLogs(prev => [...prev, `> ${cmd}`]);
        
        switch(cmd) {
            case 'add coins':
            case 'rich':
                onAddCoins(1000);
                setLogs(prev => [...prev, '>> Added 1000 ZenCoins']);
                break;
            case 'spawn':
            case 'add beast':
                onAddBeast();
                setLogs(prev => [...prev, '>> Spawned Random Beast']);
                break;
            case 'levelup':
                onLevelUp();
                setLogs(prev => [...prev, '>> Trainer Level Increased']);
                break;
            case 'reset':
                onReset();
                setLogs(prev => [...prev, '>> Game State Reset [Reload Required]']);
                break;
            case 'help':
                setLogs(prev => [...prev, '>> Commands: add coins, spawn, levelup, reset']);
                break;
            default:
                setLogs(prev => [...prev, '>> Unknown Command']);
        }
        setCommand('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-0 left-0 w-full md:w-1/2 h-1/2 bg-black/90 text-green-500 font-mono border-b-2 border-r-2 border-green-500 z-[9999] shadow-2xl flex flex-col p-4 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-green-900 pb-2 mb-2">
                <div className="flex items-center gap-2"><Terminal size={14}/> NETRUNNER CONSOLE</div>
                <button onClick={() => setIsOpen(false)}><X size={14}/></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 text-xs mb-2">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
            <div className="flex items-center gap-2 border-t border-green-900 pt-2">
                <ChevronRight size={14}/>
                <input 
                    type="text" 
                    value={command} 
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && execute()}
                    className="flex-1 bg-transparent outline-none text-green-400 placeholder-green-800"
                    placeholder="Enter command..."
                    autoFocus
                />
            </div>
        </div>
    );
};

export default DebugConsole;
