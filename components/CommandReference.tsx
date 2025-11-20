import React, { useState, useMemo } from 'react';
import { X, Command, Terminal, Search } from 'lucide-react';

interface CommandReferenceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandReference: React.FC<CommandReferenceProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  if (!isOpen) return null;

  const allCategories = [
    {
      title: "Essentials",
      cmds: [
        { cmd: "git init", desc: "Initialize a new repository" },
        { cmd: "git add .", desc: "Stage all changes" },
        { cmd: "git commit -m \"msg\"", desc: "Commit staged changes" },
        { cmd: "git status", desc: "Show modified files" },
        { cmd: "git log", desc: "View commit history" },
      ]
    },
    {
      title: "Branching",
      cmds: [
        { cmd: "git branch <name>", desc: "Create a new branch" },
        { cmd: "git checkout <name>", desc: "Switch to a branch" },
        { cmd: "git checkout -b <name>", desc: "Create & switch branch" },
        { cmd: "git merge <branch>", desc: "Merge branch into current" },
      ]
    },
    {
      title: "Remote / GitHub",
      cmds: [
        { cmd: "git remote add origin <url>", desc: "Connect to GitHub" },
        { cmd: "git push -u origin main", desc: "Upload branch to GitHub" },
        { cmd: "git fetch", desc: "Download remote changes" },
        { cmd: "git pull", desc: "Fetch and merge changes" },
        { cmd: "git clone <url>", desc: "Download a repo" },
      ]
    },
    {
      title: "Advanced",
      cmds: [
        { cmd: "git reset --hard <ref>", desc: "Move HEAD backward (destructive)" },
        { cmd: "git revert <commit>", desc: "Undo a commit safely" },
        { cmd: "git cherry-pick <commit>", desc: "Copy a specific commit" },
        { cmd: "git commit --amend", desc: "Change last commit message" },
        { cmd: "git rebase <branch>", desc: "Reapply commits on top of another branch" },
        { cmd: "git tag <name>", desc: "Create a tag at current commit" },
      ]
    }
  ];

  const categories = useMemo(() => {
    if (!searchQuery.trim()) return allCategories;
    
    const query = searchQuery.toLowerCase();
    return allCategories.map(cat => ({
      ...cat,
      cmds: cat.cmds.filter(c => 
        c.cmd.toLowerCase().includes(query) || 
        c.desc.toLowerCase().includes(query)
      )
    })).filter(cat => cat.cmds.length > 0);
  }, [searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-50 dark:bg-indigo-500/20 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Terminal size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Git Command Reference</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Quick lookup for common operations</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search commands..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((cat) => (
                    <div key={cat.title} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50">
                        <h3 className="text-indigo-600 dark:text-indigo-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Command size={14} />
                            {cat.title}
                        </h3>
                        <div className="space-y-3">
                            {cat.cmds.map((c, idx) => (
                                <div key={idx} className="group">
                                    <div className="flex items-center justify-between mb-1">
                                        <code className="text-emerald-600 dark:text-emerald-400 font-mono text-sm bg-white dark:bg-slate-900/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/50">
                                            {c.cmd}
                                        </code>
                                    </div>
                                    <div className="text-slate-500 dark:text-slate-400 text-xs pl-1">
                                        {c.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-b-2xl">
            Tip: You can type <span className="text-indigo-600 dark:text-indigo-400 font-mono">clear</span> to clean the terminal output.
        </div>
      </div>
    </div>
  );
};