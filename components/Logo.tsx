import React from 'react';
import { GitBranch } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20 border border-white/10 group-hover:scale-105 transition-transform duration-300 ${className}`}>
        <GitBranch className="text-white w-6 h-6 relative z-10" />
        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
    </div>
  );
};

