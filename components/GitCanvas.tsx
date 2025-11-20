import React, { useMemo, useState, memo } from 'react';
import { GitState, GraphNode } from '../types';
import { GitBranch, User, Hash, GitMerge, Tag, Cloud, Activity, Layers } from 'lucide-react';

interface GitCanvasProps {
  gitState: GitState;
  isDarkMode: boolean;
}

// Visual Config
const ROW_HEIGHT = 60;
const LANE_WIDTH = 40;
const PADDING_TOP = 60;
const PADDING_LEFT = 40;
const NODE_RADIUS = 7;

// Colors adapted for Light/Dark modes
const DARK_LANE_COLORS = [
  '#a855f7', // Purple
  '#f472b6', // Pink
  '#2dd4bf', // Teal
  '#fbbf24', // Amber
  '#38bdf8', // Sky
  '#818cf8', // Indigo
];

const LIGHT_LANE_COLORS = [
  '#9333ea', // Purple 600
  '#db2777', // Pink 600
  '#0d9488', // Teal 600
  '#d97706', // Amber 600
  '#0284c7', // Sky 600
  '#4f46e5', // Indigo 600
];

// MEMOIZED COMPONENT: Prevents re-renders when parent state (like guide progress) changes
export const GitCanvas: React.FC<GitCanvasProps> = memo(({ gitState, isDarkMode }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const LANE_COLORS = isDarkMode ? DARK_LANE_COLORS : LIGHT_LANE_COLORS;

  // --- Layout Logic ---
  const { nodes, links, height, width, maxLane } = useMemo(() => {
    if (gitState.commits.length === 0) {
        return { nodes: [], links: [], height: 300, width: 300, maxLane: 0 };
    }
    const sortedCommits = [...gitState.commits].sort((a, b) => b.timestamp - a.timestamp);
    const history = new Map<string, number>(); 
    const branchLanes = new Map<string, number>();
    let laneCounter = 0;
    const mainBranch = gitState.branches.find(b => b.name === 'main');
    if (mainBranch) {
        branchLanes.set('main', 0);
        laneCounter = 1;
    }
    gitState.branches.forEach(b => {
        if (b.name !== 'main' && !branchLanes.has(b.name)) {
            branchLanes.set(b.name, laneCounter++);
        }
    });
    const visited = new Set<string>();
    const trace = (commitId: string, lane: number) => {
        const queue = [commitId];
        while(queue.length > 0) {
            const currId = queue.shift()!;
            if (visited.has(currId)) {
                if (history.has(currId) && history.get(currId)! === 0) return;
                if (lane === 0) history.set(currId, 0);
                continue;
            }
            history.set(currId, lane);
            visited.add(currId);
            const c = gitState.commits.find(x => x.id === currId);
            if (c) {
                if (c.parentId) queue.push(c.parentId);
                if (c.secondParentId) queue.push(c.secondParentId);
            }
        }
    };
    if (mainBranch) trace(mainBranch.commitId, 0);
    gitState.branches.forEach(b => {
        if (b.name !== 'main') trace(b.commitId, branchLanes.get(b.name)!);
    });
    sortedCommits.forEach(c => {
        if (!visited.has(c.id)) {
            history.set(c.id, laneCounter); 
        }
    });
    const nodes: (GraphNode & { refs: string[], tags: string[] })[] = [];
    const links: any[] = [];
    sortedCommits.forEach((commit, index) => {
        const lane = history.get(commit.id) || 0;
        const x = PADDING_LEFT + (lane * LANE_WIDTH);
        const y = PADDING_TOP + (index * ROW_HEIGHT);
        const color = LANE_COLORS[lane % LANE_COLORS.length];
        const refs: string[] = [];
        gitState.branches.forEach(b => { if (b.commitId === commit.id) refs.push(b.name) });
        const tags: string[] = [];
        gitState.tags.forEach(t => { if (t.commitId === commit.id) tags.push(t.name) });
        if (gitState.head.type === 'commit' && gitState.head.ref === commit.id) {
            refs.push("HEAD");
        }
        nodes.push({ ...commit, x, y, lane, color, refs, tags });
        [commit.parentId, commit.secondParentId].forEach((pid, i) => {
            if (!pid) return;
            const parentNode = sortedCommits.find(c => c.id === pid);
            if (!parentNode) return;
            const parentIndex = sortedCommits.findIndex(c => c.id === pid);
            const parentLane = history.get(pid) || 0;
            const px = PADDING_LEFT + (parentLane * LANE_WIDTH);
            const py = PADDING_TOP + (parentIndex * ROW_HEIGHT);
            const cp1y = y + (ROW_HEIGHT * 0.6);
            const cp2y = py - (ROW_HEIGHT * 0.6);
            const d = `M ${x} ${y} C ${x} ${cp1y}, ${px} ${cp2y}, ${px} ${py}`;
            links.push({
                id: `${commit.id}-${pid}`,
                d,
                color: i === 1 ? (isDarkMode ? '#475569' : '#94a3b8') : color, 
                isMerge: i === 1,
                source: commit.id,
                target: pid
            });
        });
    });
    const maxL = Math.max(...Array.from(history.values()), laneCounter);
    return { 
        nodes, 
        links, 
        height: PADDING_TOP + (nodes.length * ROW_HEIGHT) + 100,
        width: PADDING_LEFT + (maxL * LANE_WIDTH) + 100,
        maxLane: maxL
    };
  }, [gitState, isDarkMode, LANE_COLORS]);

  if (gitState.commits.length === 0) {
      return (
          <div className="w-full h-full flex items-center justify-center flex-col relative overflow-hidden transition-colors duration-500">
              <div className="bg-white/50 dark:bg-indigo-900/20 p-8 rounded-3xl border border-indigo-200 dark:border-indigo-500/30 backdrop-blur-sm text-center shadow-lg dark:shadow-[0_0_40px_rgba(79,70,229,0.1)]">
                <div className="bg-indigo-100 dark:bg-indigo-500/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-200 dark:border-indigo-500/40 animate-float">
                   <Cloud size={40} className="text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">System Offline</h3>
                <p className="text-indigo-600 dark:text-indigo-200 mb-6">Repository not initialized.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-black/40 border border-indigo-200 dark:border-indigo-500/30 text-sm font-mono text-indigo-600 dark:text-cyan-400">
                    <span>$ git init</span>
                </div>
              </div>
          </div>
      );
  }

  return (
    <div className={`w-full h-full min-h-0 overflow-auto canvas-glass-scrollbar relative group transition-colors duration-500 ${isDarkMode ? 'bg-[#050b14]' : 'bg-[#f8fafc]'}`}>
      
      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{ 
             backgroundImage: isDarkMode 
                ? 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)'
                : 'linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px)', 
             backgroundSize: '40px 40px',
             width: Math.max(width, 1000),
             height: Math.max(height, 1000)
           }}>
      </div>

      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.5) translateY(5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pop-in {
          animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: center center;
        }
        .animate-pulse-glow {
          animation: pulseGlow 2s infinite;
        }
        @keyframes pulseGlow {
           0%, 100% { opacity: 1; filter: drop-shadow(0 0 5px currentColor); }
           50% { opacity: 0.7; filter: drop-shadow(0 0 2px currentColor); }
        }
      `}</style>

      <svg width="100%" height={height} style={{ minWidth: width }} className="relative z-10">
        {/* Lane Guides */}
        {Array.from({ length: maxLane + 1 }).map((_, i) => (
            <path 
                key={`lane-${i}`}
                d={`M ${PADDING_LEFT + (i * LANE_WIDTH)} 0 V ${height}`}
                stroke={isDarkMode ? "#1e293b" : "#e2e8f0"}
                strokeWidth="2"
                strokeDasharray="0"
                opacity={isDarkMode ? "0.3" : "0.8"}
            />
        ))}

        {/* Connections */}
        {links.map((link: any) => (
            <path 
                key={link.id}
                d={link.d}
                fill="none"
                stroke={link.color}
                strokeWidth={link.isMerge ? 2 : 4}
                strokeLinecap="round"
                strokeDasharray={link.isMerge ? "6,4" : "none"}
                className="transition-all duration-500 opacity-80 hover:opacity-100"
                style={{ filter: `drop-shadow(0 0 3px ${link.color})` }}
                opacity={hoveredNode && (link.source !== hoveredNode && link.target !== hoveredNode) ? 0.1 : 1}
            />
        ))}

        {/* Nodes */}
        {nodes.map(node => {
            const isHead = (gitState.head.type === 'commit' ? gitState.head.ref === node.id : 
                           gitState.branches.find(b => b.name === gitState.head.ref)?.commitId === node.id);
            
            return (
                <g 
                    key={node.id} 
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer transition-opacity duration-300"
                    opacity={hoveredNode && hoveredNode !== node.id ? 0.4 : 1}
                >
                    {isHead && (
                        <circle r={16} fill="none" stroke={node.color} strokeWidth={3} strokeDasharray="2,4" className="animate-spin-slow" opacity={0.7} />
                    )}
                    {/* Outer Glow */}
                    <circle r={NODE_RADIUS + 2} fill={node.color} opacity={0.3} className="animate-pulse-glow" />
                    {/* Main Node */}
                    <circle r={NODE_RADIUS} fill={isDarkMode ? "#0f172a" : "#ffffff"} stroke={node.color} strokeWidth={3} />
                    {node.secondParentId && <circle r={3} fill={node.color} />}
                </g>
            );
        })}
      </svg>

      {/* Overlay HTML Content */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
          {nodes.map(node => {
              const isHead = (gitState.head.type === 'commit' ? gitState.head.ref === node.id : 
                           gitState.branches.find(b => b.name === gitState.head.ref)?.commitId === node.id);
              
              return (
                <div 
                    key={node.id}
                    className="absolute flex items-center gap-3 transition-all duration-300"
                    style={{ 
                        top: node.y - 16, 
                        left: node.x + 28,
                        opacity: hoveredNode && hoveredNode !== node.id ? 0.3 : 1
                    }}
                >
                     {/* Branch/Tag Pills */}
                     <div className="flex gap-1.5 pointer-events-auto flex-wrap max-w-[200px]">
                        {/* Branches */}
                        {node.refs.map(ref => {
                            const isActive = gitState.head.ref === ref;
                            const isDetachedHead = ref === 'HEAD';
                            const isRemote = ref.startsWith('origin/');
                            
                            let colors = isDarkMode 
                                ? 'bg-slate-900 text-slate-400 border-slate-700'
                                : 'bg-white text-slate-500 border-slate-300 shadow-sm';
                            
                            if (isDetachedHead) {
                                colors = isDarkMode 
                                    ? 'bg-red-950/80 text-red-400 border-red-500/50'
                                    : 'bg-red-50 text-red-600 border-red-200';
                            }
                            else if (isRemote) {
                                colors = isDarkMode 
                                    ? 'bg-sky-950/80 text-sky-400 border-sky-500/50 border-dashed'
                                    : 'bg-sky-50 text-sky-600 border-sky-300 border-dashed';
                            }
                            else if (isActive) {
                                colors = isDarkMode
                                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.4)]'
                                    : 'bg-indigo-600 text-white border-indigo-600 shadow-md';
                            }

                            return (
                                <span key={ref} className={`
                                    flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border
                                    ${colors} animate-pop-in backdrop-blur-md transition-transform hover:scale-105
                                `}>
                                    {isRemote ? <Cloud size={10} /> : <GitBranch size={10} />}
                                    {ref}
                                </span>
                            );
                        })}
                        {/* Tags */}
                        {node.tags.map((tag, tagIdx) => (
                             <span key={`${node.id}-tag-${tagIdx}-${tag}`} className={`
                                flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border 
                                ${isDarkMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-amber-50 text-amber-600 border-amber-300'}
                                animate-pop-in backdrop-blur-sm shadow-sm hover:scale-105 transition-transform`
                             }>
                                <Tag size={10} />
                                {tag}
                            </span>
                        ))}
                     </div>

                     {/* Commit Info - Glass Card */}
                     <div className={`
                        px-4 py-2 rounded-xl border flex items-center gap-4 shadow-lg pointer-events-auto transition-all group-hover:translate-x-2 duration-300
                        ${isDarkMode 
                            ? 'bg-slate-900/80 backdrop-blur-xl border-white/10 hover:bg-slate-800 text-slate-300' 
                            : 'bg-white/90 backdrop-blur-xl border-slate-200 hover:bg-white text-slate-700'}
                     `}>
                         <span className={`font-mono text-xs font-bold truncate max-w-[280px] ${isHead ? 'text-indigo-500 dark:text-indigo-300' : ''}`}>
                            {node.message}
                         </span>
                         <div className={`flex items-center gap-3 text-[10px] font-mono border-l pl-3 ${isDarkMode ? 'text-slate-500 border-white/10' : 'text-slate-400 border-slate-200'}`}>
                             <span className="flex items-center gap-1"><Hash size={10}/> {node.id.substring(0,4)}</span>
                             <span className="flex items-center gap-1"><User size={10}/> {node.author}</span>
                             {node.secondParentId && <span className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400"><GitMerge size={10}/> Merge</span>}
                         </div>
                     </div>
                </div>
              )
          })}
      </div>

      {/* Floating Status HUD (Bottom Right) */}
      <div className="absolute bottom-6 right-6 pointer-events-none z-30">
          <div className={`
            backdrop-blur-md border rounded-full px-4 py-2 flex items-center gap-4 text-[10px] font-bold shadow-xl
            ${isDarkMode ? 'bg-black/60 border-white/10 text-slate-400' : 'bg-white/80 border-slate-200 text-slate-500'}
          `}>
              <div className="flex items-center gap-1.5">
                  <Activity size={12} className="text-emerald-400 animate-pulse" />
                  <span>SYSTEM: ONLINE</span>
              </div>
              <div className={`w-px h-3 ${isDarkMode ? 'bg-white/10' : 'bg-slate-300'}`}></div>
              <div className="flex items-center gap-1.5">
                  <Layers size={12} className="text-indigo-400" />
                  <span>NODES: {nodes.length}</span>
              </div>
          </div>
      </div>
    </div>
  );
});