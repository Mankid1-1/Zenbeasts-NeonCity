
import React, { useState, useEffect } from 'react';
import { Terminal, X, ChevronRight, KeyRound, Save } from 'lucide-react';

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
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [stabilityApiKey, setStabilityApiKey] = useState('');

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === '`') {
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyPress);

        // Load keys from localStorage on mount
        const geminiKey = localStorage.getItem('GEMINI_API_KEY') || '';
        const stabilityKey = localStorage.getItem('STABILITY_API_KEY') || '';
        setGeminiApiKey(geminiKey);
        setStabilityApiKey(stabilityKey);

        if (!geminiKey || !stabilityKey) {
            setLogs(prev => [...prev, '>> WARNING: API Keys not set. AI features disabled. Use the console to set them.']);
        }

        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handleSaveKeys = () => {
        localStorage.setItem('GEMINI_API_KEY', geminiApiKey);
        localStorage.setItem('STABILITY_API_KEY', stabilityApiKey);
        setLogs(prev => [...prev, '>> API Keys saved to localStorage. Refresh page to apply.']);
    };

    const execute = () => {
        const rawCmd = command.trim();
        const parts = rawCmd.split(' ');
        const baseCmd = parts[0].toLowerCase();
        const subCmd = parts.length > 1 ? parts[1].toLowerCase() : '';

        // Security: Redact sensitive keys in logs
        if (baseCmd === 'set' && (subCmd === 'gemini' || subCmd === 'stability') && parts.length > 2) {
             setLogs(prev => [...prev, `> ${baseCmd} ${parts[1]} ************`]);
        } else {
             setLogs(prev => [...prev, `> ${rawCmd}`]);
        }

        const arg = parts.slice(1).join(' ').toLowerCase();

        switch(baseCmd) {
            case 'add':
                if (arg === 'coins') {
                    onAddCoins(1000);
                    setLogs(prev => [...prev, '>> Added 1000 ZenCoins']);
                }
                break;
            case 'spawn':
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
            case 'set':
                if (subCmd === 'gemini') {
                    setGeminiApiKey(parts[2]); // Preserve case of the key
                    setLogs(prev => [...prev, '>> Gemini Key set in console. Press Save.']);
                } else if (subCmd === 'stability') {
                    setStabilityApiKey(parts[2]); // Preserve case of the key
                    setLogs(prev => [...prev, '>> Stability Key set in console. Press Save.']);
                } else {
                    setLogs(prev => [...prev, '>> Usage: set [gemini|stability] [key]']);
                }
                break;
            case 'help':
                setLogs(prev => [...prev, '>> Commands: spawn, levelup, reset, add coins, set [gemini|stability] [key]']);
                break;
            default:
                setLogs(prev => [...prev, '>> Unknown Command']);
        }
        setCommand('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-0 left-0 w-full md:w-1/2 h-auto bg-black/90 text-green-500 font-mono border-b-2 border-r-2 border-green-500 z-[9999] shadow-2xl flex flex-col p-4 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-green-900 pb-2 mb-2">
                <div className="flex items-center gap-2"><Terminal size={14}/> NETRUNNER CONSOLE</div>
                <button onClick={() => setIsOpen(false)}><X size={14}/></button>
            </div>

            {/* API Key Management */}
            <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                 <div className="flex items-center gap-1">
                    <KeyRound size={12}/>
                    <input
                        type="password"
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        className="flex-1 bg-green-900/50 outline-none text-green-300 placeholder-green-600 p-1"
                        placeholder="Gemini API Key"
                    />
                 </div>
                 <div className="flex items-center gap-1">
                     <KeyRound size={12}/>
                    <input
                        type="password"
                        value={stabilityApiKey}
                        onChange={(e) => setStabilityApiKey(e.target.value)}
                        className="flex-1 bg-green-900/50 outline-none text-green-300 placeholder-green-600 p-1"
                        placeholder="Stability API Key"
                    />
                 </div>
            </div>
             <button onClick={handleSaveKeys} className="w-full text-center bg-green-800 hover:bg-green-700 p-1 text-xs flex items-center justify-center gap-1 mb-2"><Save size={12}/> Save API Keys</button>


            <div className="flex-1 overflow-y-auto space-y-1 text-xs mb-2 h-48">
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
