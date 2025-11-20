import React, { useState, useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal as TerminalIcon, ChevronRight, MoreHorizontal, Command, Cpu } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
  onCommand: (cmd: string) => void;
  commandHistory?: string[];
}

const GIT_COMMANDS = [
  'git init', 'git add', 'git commit', 'git status', 'git log', 'git branch',
  'git checkout', 'git merge', 'git push', 'git pull', 'git fetch', 'git clone',
  'git remote', 'git tag', 'git reset', 'git revert', 'git cherry-pick',
  'git rebase', 'git diff', 'git stash', 'git rebase -i', 'git commit --amend'
];

export const Terminal: React.FC<TerminalProps> = ({ logs, onCommand, commandHistory = [] }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K to focus terminal
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Esc to close suggestions
      if (e.key === 'Escape') {
        setSuggestions([]);
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autocomplete suggestions
  useEffect(() => {
    if (input.trim().length > 0 && input.startsWith('git ')) {
      const query = input.toLowerCase();
      const matches = GIT_COMMANDS.filter(cmd => 
        cmd.toLowerCase().includes(query) || cmd.toLowerCase().startsWith(query)
      ).slice(0, 5);
      setSuggestions(matches);
      setSelectedSuggestion(0);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Arrow up - command history
    if (e.key === 'ArrowUp' && commandHistory.length > 0) {
      e.preventDefault();
      const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInput(commandHistory[newIndex]);
      setSuggestions([]);
    }
    // Arrow down - command history
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
    // Tab - autocomplete
    else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      setInput(suggestions[selectedSuggestion]);
      setSuggestions([]);
    }
    // Arrow keys in suggestions
    else if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.max(0, prev - 1));
    }
    else if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.min(suggestions.length - 1, prev + 1));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onCommand(input);
    setInput('');
    setSuggestions([]);
    setHistoryIndex(-1);
  };

  const handleContainerClick = () => {
      inputRef.current?.focus();
  }

  const selectSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div 
        className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-mono text-sm relative overflow-hidden group min-h-0"
        onClick={handleContainerClick}
        data-terminal
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 md:px-4 py-1.5 md:py-2 bg-slate-200/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-300 dark:border-slate-700/50 select-none z-10">
        <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold tracking-widest uppercase">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500/50"></div>
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-yellow-500/50"></div>
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500/50"></div>
          <span className="ml-1.5 md:ml-2 text-slate-500">terminal</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 opacity-30 text-slate-400">
            <Cpu className="w-3 h-3 md:w-[14px] md:h-[14px]" />
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 cursor-text relative z-0 custom-scrollbar"
      >
        {/* Welcome Message */}
        <div className="text-slate-600 dark:text-slate-400 mb-4 text-xs leading-relaxed border-l-2 border-indigo-500/30 dark:border-indigo-500/30 pl-3">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">GitJourney OS v2.4.0</span><br/>
          Ready for input. Type <span className="text-cyan-600 dark:text-cyan-300">help</span> for commands.
        </div>

        {logs.map((log) => (
          <div key={log.id} className={`break-words leading-relaxed ${
            log.type === 'command' ? 'flex items-start gap-2 mt-3 text-slate-900 dark:text-slate-100 font-bold' :
            log.type === 'error' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2 rounded border-l-2 border-red-500/50 dark:border-red-500/50 my-1' :
            log.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
            'text-slate-600 dark:text-slate-400'
          }`}>
            {log.type === 'command' ? (
                <>
                    <ChevronRight size={14} className="mt-[4px] text-pink-600 dark:text-pink-500 shrink-0" />
                    <span>{log.text}</span>
                </>
            ) : log.text}
          </div>
        ))}
        
        {/* Active Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-3 group relative">
            <div className="text-pink-600 dark:text-pink-500 animate-pulse font-bold">
                <ChevronRight size={16} />
            </div>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-700 font-bold"
              placeholder="Execute command... (Ctrl+K to focus)"
              autoComplete="off"
              spellCheck={false}
            />
            
            {/* Autocomplete Suggestions */}
            {suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute bottom-full mb-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50"
              >
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    onClick={() => selectSuggestion(suggestion)}
                    className={`px-3 py-2 cursor-pointer font-mono text-sm transition-colors ${
                      idx === selectedSuggestion
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};