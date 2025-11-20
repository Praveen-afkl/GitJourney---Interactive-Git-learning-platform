import React from 'react';
import { Award, Trophy, Star, Zap, Target } from 'lucide-react';

interface AchievementBadgeProps {
  type: 'first-commit' | 'branch-master' | 'merge-wizard' | 'remote-expert' | 'all-complete';
  unlocked: boolean;
}

const achievementConfig = {
  'first-commit': { icon: Star, label: 'First Commit', color: 'text-yellow-500' },
  'branch-master': { icon: Target, label: 'Branch Master', color: 'text-blue-500' },
  'merge-wizard': { icon: Zap, label: 'Merge Wizard', color: 'text-purple-500' },
  'remote-expert': { icon: Trophy, label: 'Remote Expert', color: 'text-emerald-500' },
  'all-complete': { icon: Award, label: 'Git Master', color: 'text-indigo-500' },
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ type, unlocked }) => {
  const config = achievementConfig[type];
  const Icon = config.icon;
  
  if (!unlocked) return null;
  
  return (
    <div 
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 ${config.color}`}
      title={config.label}
    >
      <Icon size={14} />
      <span className="text-xs font-bold hidden sm:inline">{config.label}</span>
    </div>
  );
};

