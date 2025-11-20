import React from 'react';
import { GitState } from '../types';
import { GitBranch, GitCommit, Cloud, HardDrive, Wifi } from 'lucide-react';

interface RepositoryInfoProps {
  gitState: GitState;
  repoName: string;
}

export const RepositoryInfo: React.FC<RepositoryInfoProps> = ({ gitState, repoName }) => {
  const headRef = gitState.head.type === 'branch' ? gitState.head.ref : gitState.head.ref.substring(0, 7);
  const isDetached = gitState.head.type === 'commit';
  const commitCount = gitState.commits.length;
  const branchCount = gitState.branches.filter(b => !b.name.startsWith('origin/')).length;
  const hasRemote = gitState.branches.some(b => b.name.startsWith('origin/'));

  return (
    <div className="p-3 px-4 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 select-none bg-gradient-to-r from-slate-100/50 to-transparent dark:from-slate-900/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-300">
           <HardDrive size={14} />
           <span className="uppercase tracking-wider">{repoName}</span>
        </div>

        <div className="w-px h-3 bg-slate-300 dark:bg-white/10"></div>

        <div className={`flex items-center gap-2 ${isDetached ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
           <GitBranch size={14} />
           <span>{isDetached ? `DETACHED: ${headRef}` : headRef}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
          {hasRemote && (
             <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400" title="Remote Connected">
                <Wifi size={14} />
                <span>CONNECTED</span>
             </div>
          )}
          
          <div className="flex items-center gap-1.5" title="Local Branches">
             <span className="text-slate-400 dark:text-slate-600">BR:</span>
             <span className="text-slate-700 dark:text-white">{branchCount}</span>
          </div>

          <div className="flex items-center gap-1.5" title="Total Commits">
             <span className="text-slate-400 dark:text-slate-600">CM:</span>
             <span className="text-slate-700 dark:text-white">{commitCount}</span>
          </div>
      </div>
    </div>
  );
};