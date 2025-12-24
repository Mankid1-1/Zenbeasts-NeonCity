
import React, { useEffect } from 'react';
import { Notification, BeastClass } from '../../types';
import { X, CheckCircle, AlertTriangle, Info, Zap, Flame, Mountain, Skull, Wind, Shield, Target } from 'lucide-react';

// --- Header Component ---
export const SectionHeader: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode; rightElement?: React.ReactNode }> = ({ title, subtitle, icon, rightElement }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-b border-gray-800 pb-4">
        <div>
            <h2 className="text-3xl font-mono text-white mb-1 flex items-center">
                {icon && <span className="mr-3 text-neon-blue">{icon}</span>}
                {title}
            </h2>
            {subtitle && <p className="text-xs text-gray-500 font-mono tracking-wider">{subtitle}</p>}
        </div>
        {rightElement}
    </div>
);

// --- Button Component ---
interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    loading?: boolean;
}

export const CyberButton: React.FC<CyberButtonProps> = ({ children, variant = 'primary', loading, className = '', ...props }) => {
    const baseStyles = "relative px-6 py-2 font-mono font-bold tracking-wider uppercase transition-all overflow-hidden group border disabled:opacity-50 disabled:cursor-not-allowed clip-path-polygon";
    
    const variants = {
        primary: "bg-neon-blue/10 border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black",
        secondary: "bg-neon-purple/10 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white",
        danger: "bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
        ghost: "bg-transparent border-gray-600 text-gray-400 hover:border-white hover:text-white"
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            <span className="relative z-10 flex items-center justify-center gap-2">
                {loading && <span className="animate-spin">⟳</span>}
                {children}
            </span>
            {!loading && <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity z-0"></div>}
        </button>
    );
};

// --- Toast Component ---
export const CyberToast: React.FC<{ notifications: Notification[]; onDismiss: (id: string) => void }> = ({ notifications, onDismiss }) => {
    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
            {notifications.map(n => (
                <ToastItem key={n.id} notification={n} onDismiss={() => onDismiss(n.id)} />
            ))}
        </div>
    );
}

const ToastItem: React.FC<{ notification: Notification; onDismiss: () => void }> = ({ notification, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const icons = {
        success: <CheckCircle size={18} className="text-neon-green" />,
        warning: <AlertTriangle size={18} className="text-neon-yellow" />,
        error: <X size={18} className="text-red-500" />,
        info: <Info size={18} className="text-neon-blue" />
    };

    const borders = {
        success: 'border-neon-green',
        warning: 'border-neon-yellow',
        error: 'border-red-500',
        info: 'border-neon-blue'
    };

    return (
        <div
            className={`bg-black/90 border-l-4 ${borders[notification.type]} p-4 w-72 shadow-[0_0_15px_rgba(0,0,0,0.5)] animate-fade-in-up flex items-start gap-3 relative`}
            role={notification.type === 'error' ? 'alert' : 'status'}
            aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
        >
            <div className="mt-1" aria-hidden="true">{icons[notification.type]}</div>
            <div>
                <h4 className="text-white font-mono font-bold text-sm">{notification.title}</h4>
                <p className="text-gray-400 text-xs">{notification.message}</p>
            </div>
            <button
                onClick={onDismiss}
                className="absolute top-2 right-2 text-gray-600 hover:text-white"
                aria-label="Close notification"
            >
                <X size={12}/>
            </button>
        </div>
    );
};

// --- Badge Component ---
export const CyberBadge: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = 'blue', className = '' }) => {
    const colors: {[key: string]: string} = {
        blue: "bg-neon-blue/10 text-neon-blue border-neon-blue/50",
        purple: "bg-neon-purple/10 text-neon-purple border-neon-purple/50",
        green: "bg-neon-green/10 text-neon-green border-neon-green/50",
        yellow: "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/50",
        red: "bg-red-500/10 text-red-500 border-red-500/50",
        gray: "bg-gray-800 text-gray-400 border-gray-600"
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide border ${colors[color] || colors['gray']} ${className}`}>
            {children}
        </span>
    );
};

// --- Card Component ---
export const CyberCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-slate-900/60 border border-slate-700 p-4 rounded cyber-border hover:border-neon-blue/50 transition-colors ${className}`}>
        {children}
    </div>
);

// --- Class Icon Component ---
export const ClassIcon: React.FC<{ beastClass: BeastClass; className?: string }> = ({ beastClass, className = '' }) => {
    const icons = {
        [BeastClass.DRAGON]: <Flame className={className} />,
        [BeastClass.TIGER]: <Zap className={className} />,
        [BeastClass.PANDA]: <Zap className={className} />,
        [BeastClass.OX]: <Shield className={className} />,
        [BeastClass.SNAKE]: <Mountain className={className} />,
        [BeastClass.CRANE]: <Wind className={className} />,
        [BeastClass.MONKEY]: <Target className={className} />,
        [BeastClass.MANTIS]: <Skull className={className} />
    };

    return icons[beastClass] || <Info className={className} />;
};
