
import React from 'react';

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
