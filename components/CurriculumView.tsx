import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Lesson } from '../types';
import { Check, Lock, Play, Star, Code2, Sun, Moon, Zap, Target, Trophy, GitBranch, GitCommit, GitMerge, GitPullRequest, Users, History, Workflow, Award, Sparkles, Clock, Flame, HelpCircle, X, LogOut, User, Medal, Menu } from 'lucide-react';
import { Logo } from './Logo';
import { getCurrentUser, signOut } from '../utils/auth';

// --- Internal Confetti Engine (No external dependencies) ---
const ConfettiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

    class Particle {
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * -canvas!.height;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 3 + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 7 + 3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        if (this.y > canvas!.height) {
          this.y = -10;
          this.x = Math.random() * canvas!.width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    for (let i = 0; i < 150; i++) {
      particles.push(new Particle());
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[100]" />;
};

interface CurriculumViewProps {
  lessons: Lesson[];
  currentLessonIdx: number;
  unlockedLessonIdx: number;
  onSelectLesson: (index: number) => void;
  onStartPractice: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({ 
  lessons, 
  currentLessonIdx, 
  unlockedLessonIdx,
  onSelectLesson, 
  onStartPractice,
  isDarkMode,
  onToggleTheme,
  onLogout
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Check if completion animation has been shown before
  const hasShownCompletionAnimation = () => {
    return localStorage.getItem('gitjourney-completion-animation-shown') === 'true';
  };
  
  const markCompletionAnimationShown = () => {
    localStorage.setItem('gitjourney-completion-animation-shown', 'true');
  };
  
  // Auto-scroll active node into view
  useEffect(() => {
    if (containerRef.current) {
      const activeNode = containerRef.current.querySelector('[data-active="true"]');
      if (activeNode) {
        activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLessonIdx]);

  // Memoize section data to avoid recalculations
  const sectionData = useMemo(() => {
    const sections = new Map<string, { lessons: Lesson[], startIndex: number }>();
    for (const [idx, lesson] of lessons.entries()) {
      if (!sections.has(lesson.section)) {
        sections.set(lesson.section, { lessons: [], startIndex: idx });
      }
      const section = sections.get(lesson.section);
      if (section) {
        section.lessons.push(lesson);
      }
    }
    return sections;
  }, [lessons]);

  // Calculate quick stats
  const quickStats = useMemo(() => {
    const total = lessons.length;
    // Fix: If current index is beyond last lesson (via logic) or we completed everything
    // Checking unlockedLessonIdx is a safer way to know if the user finished the last one
    const isAllComplete = unlockedLessonIdx >= total || currentLessonIdx >= total; 
    
    const displayIndex = isAllComplete ? total : currentLessonIdx;
    
    const completed = displayIndex;
    const progress = Math.round((completed / total) * 100); 
    
    const estimatedTimePerLesson = 5; // minutes
    const remainingLessons = total - completed;
    const estimatedTimeRemaining = remainingLessons * estimatedTimePerLesson;
    const xpPoints = completed * 100; // 100 XP per lesson
    const level = Math.floor(xpPoints / 500) + 1; // Level up every 500 XP
    
    // Milestone checkpoints
    const milestones = [25, 50, 75, 100];
    const currentMilestone = milestones.find(m => progress >= m) || 0;
    const nextMilestone = milestones.find(m => progress < m) || 100;
    
    return {
      completed,
      total,
      progress,
      estimatedTimeRemaining,
      xpPoints,
      level,
      currentMilestone,
      nextMilestone,
      isAllComplete
    };
  }, [lessons, currentLessonIdx, unlockedLessonIdx]);

  // Trigger Celebration when progress hits 100% (only once)
  useEffect(() => {
    // Robust completion check:
    // 1. Progress bar is 100% OR
    // 2. The unlocked index is equal to or greater than total lessons (meaning last one is done)
    const isFinished = quickStats.progress === 100 || unlockedLessonIdx >= lessons.length;
    
    // Only show if finished AND hasn't been shown before AND not currently showing
    if (isFinished && !showCelebration && !hasShownCompletionAnimation()) {
      const timer = setTimeout(() => {
        setShowCelebration(true);
        markCompletionAnimationShown();
      }, 1000); // Slight delay for dramatic effect after last lesson
      return () => clearTimeout(timer);
    }
  }, [quickStats.progress, unlockedLessonIdx, lessons.length, showCelebration]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !showShortcuts) {
        setShowShortcuts(true);
      } else if (e.key === 'Escape') {
        if (showShortcuts) setShowShortcuts(false);
        if (showCelebration) setShowCelebration(false);
      } else if (e.key === 'ArrowRight' && !showShortcuts && !showCelebration && unlockedLessonIdx < lessons.length - 1) {
        onSelectLesson(Math.min(unlockedLessonIdx + 1, lessons.length - 1));
      } else if (e.key === 'ArrowLeft' && !showShortcuts && !showCelebration && currentLessonIdx > 0) {
        onSelectLesson(Math.max(currentLessonIdx - 1, 0));
      } else if (e.key === ' ' && !showShortcuts && !showCelebration && currentLessonIdx <= unlockedLessonIdx) {
        e.preventDefault();
        if (currentLessonIdx < lessons.length) {
            onSelectLesson(currentLessonIdx);
        }
      }
    };

    globalThis.addEventListener('keydown', handleKeyPress);
    return () => globalThis.removeEventListener('keydown', handleKeyPress);
  }, [showShortcuts, showCelebration, unlockedLessonIdx, currentLessonIdx, lessons.length, onSelectLesson]);

  // Track window size for responsive calculations
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { points, pathD, height } = useMemo(() => {
    // Responsive calculations
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;
    
    const nodeSpacing = isMobile ? 120 : isTablet ? 160 : 200;
    const amplitude = isMobile ? 60 : isTablet ? 90 : 120;
    // Center X should be responsive - use container width / 2 for mobile/tablet
    const centerX = isMobile ? windowWidth / 2 : isTablet ? windowWidth / 2 : 576;
    // Increased startY to avoid overlap with stats/details section
    const startY = isMobile ? 280 : isTablet ? 250 : 200;
    
    const calculatedPoints = lessons.map((_, i) => {
      const y = startY + (i * nodeSpacing);
      const x = centerX + Math.sin(i * 0.6) * amplitude;
      return { x, y };
    });

    let d = `M ${calculatedPoints[0].x} ${calculatedPoints[0].y}`;
    for (let i = 0; i < calculatedPoints.length - 1; i++) {
        const curr = calculatedPoints[i];
        const next = calculatedPoints[i+1];
        const cp1x = curr.x;
        const cp1y = curr.y + (nodeSpacing / 2);
        const cp2x = next.x;
        const cp2y = next.y - (nodeSpacing / 2);
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    
    return { 
        points: calculatedPoints, 
        pathD: d, 
        height: startY + (lessons.length * nodeSpacing) + (isMobile ? 100 : isTablet ? 150 : 200)
    };
  }, [lessons, windowWidth]);

  return (
    <div className={`h-full w-full flex flex-col font-sans relative z-10 transition-colors duration-500 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#0f172a]`}>
      <style>{`
        @keyframes textShineInside {
          0% { 
            background-position: -200% center;
          }
          100% { 
            background-position: 200% center;
          }
        }
        .text-with-shine {
          background: linear-gradient(90deg, 
            #fbbf24 0%, 
            #fbbf24 30%, 
            #fde047 40%, 
            #ffffff 45%, 
            #ffffff 50%, 
            #ffffff 55%, 
            #fde047 60%, 
            #fbbf24 70%, 
            #fbbf24 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textShineInside 2.5s ease-in-out infinite;
        }
      `}</style>
      
      {/* Celebration Overlay - Responsive for All Devices */}
      {showCelebration && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gradient-to-br from-black/80 via-purple-900/40 to-black/80 backdrop-blur-md animate-in fade-in duration-700 p-4 sm:p-6 md:p-8">
          <ConfettiCanvas />
          
          {/* Animated Background Rings - Responsive Sizes */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 border-3 border-yellow-400/20 rounded-full animate-ping"></div>
            <div className="absolute w-56 h-56 sm:w-80 sm:h-80 md:w-96 md:h-96 border-2 border-purple-400/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute w-64 h-64 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] border border-indigo-400/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Mobile Layout: Compact Vertical */}
          <div className={`
             relative z-[1001] w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl
             ${isDarkMode 
               ? 'bg-gradient-to-br from-slate-900/98 via-indigo-900/95 to-slate-900/98 border-2 border-yellow-500/30' 
               : 'bg-gradient-to-br from-white/98 via-indigo-50/95 to-white/98 border-2 border-yellow-400/40'}
             shadow-2xl text-center transform transition-all
             animate-in zoom-in-95 duration-500
             rounded-xl sm:rounded-2xl
             p-4 sm:p-6 md:p-8
          `}>
            {/* Floating Trophy Icon - Responsive Sizing */}
            <div className="absolute -top-8 sm:-top-10 md:-top-12 left-1/2 -translate-x-1/2">
               <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 blur-xl sm:blur-2xl opacity-60 animate-pulse"></div>
                 <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 sm:p-3 md:p-4 shadow-2xl">
                   <Trophy size={32} className="sm:w-10 sm:h-10 md:w-12 md:h-12 text-white drop-shadow-lg animate-bounce" style={{ animationDuration: '2s' }} />
                 </div>
                 {/* Sparkle effects - Responsive */}
                 <Sparkles size={12} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] absolute -top-1 -right-1 text-yellow-300 animate-pulse" style={{ animationDelay: '0.3s' }} />
                 <Sparkles size={10} className="sm:w-3 sm:h-3 md:w-4 md:h-4 absolute -bottom-1 -left-1 text-orange-300 animate-pulse" style={{ animationDelay: '0.6s' }} />
               </div>
            </div>
            
            {/* Main Content - Responsive Spacing */}
            <div className="mt-8 sm:mt-10 md:mt-12 mb-4 sm:mb-5 md:mb-6">
              <div className="relative inline-block mb-2 sm:mb-3">
                {/* Liquid Glass Container - Responsive Padding */}
                <div className={`
                  relative px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-xl sm:rounded-2xl backdrop-blur-xl border
                  ${isDarkMode 
                    ? 'bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-indigo-500/20 border-purple-400/30' 
                    : 'bg-gradient-to-br from-purple-400/25 via-pink-400/20 to-indigo-400/25 border-purple-300/40'}
                  shadow-2xl shadow-purple-500/20
                  animate-in slide-in-from-bottom-4 duration-700
                `}>
                  {/* Inner glow */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                  
                  {/* Text with shine line inside - Responsive Font Sizes */}
                  <h2 
                    className="text-with-shine relative text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black drop-shadow-lg tracking-wider uppercase leading-tight" 
                    style={{ 
                      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      letterSpacing: '0.05em',
                      filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.6)) drop-shadow(0 0 20px rgba(251, 191, 36, 0.4))'
                    }}
                  >
                    MISSION ACCOMPLISHED!
                  </h2>
                  
                  {/* Outer glow ring */}
                  <div className="absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400/20 via-yellow-400/20 via-pink-400/20 to-purple-400/20 blur-xl opacity-50 animate-pulse"></div>
                </div>
              </div>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-600 dark:text-slate-300 mb-1">
                You've mastered Git!
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 font-semibold">
                Congratulations on completing all {quickStats.total} lessons
              </p>
            </div>

            {/* Stats Grid - Responsive: 3 cols on mobile, 3 on tablet, 3 on desktop */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
              <div className={`
                relative p-3 rounded-xl border-2 overflow-hidden group
                ${isDarkMode 
                  ? 'bg-gradient-to-br from-indigo-900/60 to-indigo-800/40 border-indigo-500/40' 
                  : 'bg-gradient-to-br from-indigo-50 to-indigo-100/60 border-indigo-400/40'}
                hover:scale-105 transition-transform duration-300
              `}>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 tracking-wider">Total XP</div>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{quickStats.xpPoints}</div>
                </div>
              </div>
              
              <div className={`
                relative p-3 rounded-xl border-2 overflow-hidden group
                ${isDarkMode 
                  ? 'bg-gradient-to-br from-emerald-900/60 to-emerald-800/40 border-emerald-500/40' 
                  : 'bg-gradient-to-br from-emerald-50 to-emerald-100/60 border-emerald-400/40'}
                hover:scale-105 transition-transform duration-300
              `}>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 tracking-wider">Lessons</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{quickStats.total}</div>
                </div>
              </div>
              
              <div className={`
                relative p-3 rounded-xl border-2 overflow-hidden group
                ${isDarkMode 
                  ? 'bg-gradient-to-br from-purple-900/60 to-purple-800/40 border-purple-500/40' 
                  : 'bg-gradient-to-br from-purple-50 to-purple-100/60 border-purple-400/40'}
                hover:scale-105 transition-transform duration-300
              `}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 tracking-wider">Level</div>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{quickStats.level}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Responsive */}
            <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3">
               <button 
                 onClick={() => {
                   alert("Certificate feature coming soon!");
                 }}
                 className={`
                   relative w-full py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl text-white font-black text-xs sm:text-sm uppercase tracking-wider
                   bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
                   hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500
                   shadow-xl shadow-purple-500/30
                   flex items-center justify-center gap-1.5 sm:gap-2
                   transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50
                   overflow-hidden group
                 `}
               >
                 <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                 <Medal size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] relative z-10" />
                 <span className="relative z-10">Claim Your Certificate</span>
               </button>
               
               <button 
                 onClick={() => setShowCelebration(false)}
                 className={`
                   w-full py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300
                   ${isDarkMode 
                     ? 'text-slate-400 hover:bg-slate-800/60 hover:text-white' 
                     : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}
                 `}
               >
                 Continue Journey
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 z-0 transition-opacity duration-700 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0f172a] to-[#0f172a]"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/3 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className={`absolute inset-0 z-0 transition-opacity duration-700 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white"></div>
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-400/15 rounded-full blur-2xl"></div>
          <div className="absolute top-1/3 left-10 w-72 h-72 bg-indigo-300/10 rounded-full blur-2xl"></div>
        </div>
      </div>
      
      {/* Game Navbar */}
      <nav className="h-16 md:h-20 flex items-center justify-between px-3 md:px-6 lg:px-10 shrink-0 sticky top-2 z-50 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl md:rounded-2xl mx-2 md:mx-4 mt-2 relative">
         <div className="flex items-center gap-2 md:gap-3">
             <div className="relative">
                 <Logo className="w-8 h-8 md:w-12 md:h-12 relative z-10" />
                 <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full pulse-glow"></div>
             </div>
             <div className="flex flex-col">
                <h1 className="font-black text-xl md:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-tight leading-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Git</span>
                    <span className="text-glow-purple dark:text-glow-purple">Journey</span>
                </h1>
                <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-purple-400 tracking-widest uppercase mt-0.5 hidden sm:block">
                      Mission Control 
                </p>
             </div>
         </div>
         <div className="flex items-center gap-2 md:gap-4">
             {/* Quick Stats Dashboard */}
             <div className="hidden md:flex items-center gap-2">
                <div className="flex flex-col items-end text-right bg-slate-100 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-indigo-500/30 px-2.5 py-1.5 rounded-lg h-12 w-16">
                    <div className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-tight">
                    Progress
                    </div>
                    <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-tight">
                        {quickStats.progress}%
                    </div>
                </div>
                <div className="flex flex-col items-end text-right bg-slate-100 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-indigo-500/30 px-2.5 py-1.5 rounded-lg h-12 w-16">
                    <div className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-0.5 leading-tight">
                        <Flame size={8} className="text-orange-500" />
                        Level
                    </div>
                    <div className="text-base font-black text-indigo-600 dark:text-indigo-400 leading-tight">
                        {quickStats.level}
                    </div>
                </div>
                <div className="flex flex-col items-end text-right bg-slate-100 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-indigo-500/30 px-2.5 py-1.5 rounded-lg h-12 w-16">
                    <div className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-0.5 leading-tight">
                        <Clock size={8} />
                        Est. Time
                    </div>
                    <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 leading-tight">
                        {quickStats.estimatedTimeRemaining}m
                    </div>
                </div>
             </div>
             {/* Mobile Menu Button */}
             <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-indigo-500/30 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                aria-label="Menu"
              >
                 {showMobileMenu ? <X size={18} className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} /> : <Menu size={18} className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} />}
             </button>

             {/* Desktop Buttons */}
             <button 
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="hidden md:flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-indigo-500/30 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all hover:scale-110"
                title="Keyboard Shortcuts (Press ?)"
              >
                 <HelpCircle size={16} className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} />
             </button>
             <button 
                onClick={onToggleTheme}
                className="hidden md:flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-indigo-500/30 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all hover:scale-110"
              >
                 {isDarkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-indigo-500" />}
             </button>
             
             {getCurrentUser() && (
               <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-indigo-500/30 rounded-lg h-12 min-w-[120px] max-w-[140px]">
                 <User size={12} className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} />
                 <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex-1 truncate" title={getCurrentUser()?.email}>
                   {getCurrentUser()?.avatarName || getCurrentUser()?.email.split('@')[0]}
                 </span>
                 <button
                   onClick={() => {
                     signOut();
                     onLogout();
                   }}
                   className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
                   title="Logout"
                 >
                   <LogOut size={12} className={isDarkMode ? 'text-slate-400' : 'text-slate-600'} />
                 </button>
               </div>
             )}
             <button 
                onClick={onStartPractice}
                data-sandbox-button
                className="hidden md:flex relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 backdrop-blur-md text-white border-2 border-indigo-400/50 px-6 py-2.5 rounded-lg text-sm font-black uppercase tracking-wider transition-all items-center gap-2 shadow-2xl hover:shadow-indigo-500/50 hover:scale-105"
             >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                <Code2 size={18} className="relative z-10" /> 
                <span className="relative z-10">Sandbox</span>
             </button>
         </div>

         {/* Mobile Dropdown Menu */}
         {showMobileMenu && (
           <div className="absolute top-full left-0 right-0 mt-2 mx-2 md:hidden bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
             <div className="p-4 space-y-3">
               {/* Quick Stats for Mobile */}
               <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                 <div className="flex flex-col items-center text-center bg-slate-100 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-indigo-500/30 px-2 py-2 rounded-lg">
                   <div className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                     Progress
                   </div>
                   <div className="text-base font-black text-indigo-600 dark:text-indigo-400">
                     {quickStats.progress}%
                   </div>
                 </div>
                 <div className="flex flex-col items-center text-center bg-slate-100 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-indigo-500/30 px-2 py-2 rounded-lg">
                   <div className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-0.5">
                     <Flame size={6} className="text-orange-500" />
                     Level
                   </div>
                   <div className="text-base font-black text-indigo-600 dark:text-indigo-400">
                     {quickStats.level}
                   </div>
                 </div>
                 <div className="flex flex-col items-center text-center bg-slate-100 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-indigo-500/30 px-2 py-2 rounded-lg">
                   <div className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-0.5">
                     <Clock size={6} />
                     Time
                   </div>
                   <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                     {quickStats.estimatedTimeRemaining}m
                   </div>
                 </div>
               </div>

               {/* Menu Items */}
               <button
                 onClick={() => {
                   setShowShortcuts(true);
                   setShowMobileMenu(false);
                 }}
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-left"
               >
                 <HelpCircle size={18} className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} />
                 <span className="font-semibold text-slate-900 dark:text-white">Keyboard Shortcuts</span>
               </button>

               <button
                 onClick={() => {
                   onToggleTheme();
                   setShowMobileMenu(false);
                 }}
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-left"
               >
                 {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-500" />}
                 <span className="font-semibold text-slate-900 dark:text-white">
                   {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                 </span>
               </button>

               <button
                 onClick={() => {
                   onStartPractice();
                   setShowMobileMenu(false);
                 }}
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-left"
               >
                 <Code2 size={18} />
                 <span className="font-semibold">Sandbox</span>
               </button>

               {getCurrentUser() && (
                 <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                   <div className="flex items-center gap-3 px-4 py-2 mb-2">
                     <User size={16} className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} />
                     <div className="flex-1 min-w-0">
                       <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">User</div>
                       <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                         {getCurrentUser()?.email || 'Guest'}
                       </div>
                     </div>
                   </div>
                   <button
                     onClick={() => {
                       signOut();
                       onLogout();
                       setShowMobileMenu(false);
                     }}
                     className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-left border border-red-200 dark:border-red-800"
                   >
                     <LogOut size={18} className="text-red-600 dark:text-red-400" />
                     <span className="font-semibold text-red-600 dark:text-red-400">Logout</span>
                   </button>
                 </div>
               )}
             </div>
           </div>
         )}
      </nav>

      {/* Keyboard Shortcuts Overlay */}
      {showShortcuts && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowShortcuts(false)}
        >
          <div 
            className={`
              relative w-full max-w-md rounded-2xl border-2 shadow-2xl p-6 backdrop-blur-xl
              ${isDarkMode 
                ? 'bg-slate-900/95 border-indigo-500/70' 
                : 'bg-white/95 border-indigo-400/70'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} className={isDarkMode ? 'text-slate-400' : 'text-slate-600'} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start/Resume Lesson</span>
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs font-mono">Space</kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Next Lesson</span>
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs font-mono">→</kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Previous Lesson</span>
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs font-mono">←</kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Show Shortcuts</span>
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs font-mono">?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={containerRef} data-curriculum-map className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative p-2 md:p-4">
        <div className="relative w-full max-w-6xl mx-auto" style={{ height: `${height}px` }}>
            {/* Main Content Area */}
            <div className="relative" style={{ height: `${height}px` }}>
            {/* Milestone Markers */}
            {[25, 50, 75, 100].map((milestone) => {
              const milestoneIndex = Math.floor((milestone / 100) * lessons.length) - 1;
              if (milestoneIndex < 0 || milestoneIndex >= lessons.length) return null;
              const point = points[milestoneIndex];
              const isReached = quickStats.progress >= milestone;
              
              return (
                <div
                  key={`milestone-${milestone}`}
                  className="absolute pointer-events-none z-15"
                  style={{
                    left: point.x - 15,
                    top: point.y - 15,
                  }}
                >
                  <div className={`
                    w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300
                    ${isReached
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 shadow-lg shadow-yellow-500/50 scale-110'
                      : 'bg-slate-700/50 border-slate-600/50'}
                  `}>
                    {isReached ? (
                      <Trophy size={16} className="text-white" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                    )}
                  </div>
                  <div className={`
                    absolute top-full mt-1 left-1/2 transform -translate-x-1/2 text-[10px] font-black whitespace-nowrap
                    ${isReached ? 'text-yellow-400' : 'text-slate-500'}
                  `}>
                    {milestone}%
                  </div>
                </div>
              );
            })}

            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 text-center py-6 z-5 pointer-events-none">
                <div className="flex items-center justify-center gap-6 md:gap-8 flex-wrap px-4">
                    <div className="flex items-center gap-3 bg-white/15 dark:bg-slate-900/60 backdrop-blur-sm border-2 border-emerald-500/50 dark:border-emerald-400/50 rounded-2xl px-6 py-4 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-5 h-5 rounded-full bg-emerald-400 dark:bg-emerald-500 shadow-md shadow-emerald-500/50 ring-2 ring-emerald-500/30"></div>
                        <div className="flex flex-col items-start">
                            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-300 leading-none">
                                {lessons.filter((_, i) => i < currentLessonIdx).length}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-1">
                                Completed
                            </span>
                        </div>
                </div>
                    
                    <div className="flex items-center gap-3 bg-white/15 dark:bg-slate-900/60 backdrop-blur-sm border-2 border-indigo-500/50 dark:border-indigo-400/50 rounded-2xl px-6 py-4 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-5 h-5 rounded-full bg-indigo-400 dark:bg-indigo-500 shadow-md shadow-indigo-500/50 ring-2 ring-indigo-500/30"></div>
                        <div className="flex flex-col items-start">
                            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-300 leading-none">
                                {lessons.filter((_, i) => i >= currentLessonIdx && i <= unlockedLessonIdx).length}
                            </span>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-1">
                                Available
                        </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/15 dark:bg-slate-900/60 backdrop-blur-sm border-2 border-slate-500/40 dark:border-slate-600/40 rounded-2xl px-6 py-4 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-5 h-5 rounded-full bg-slate-500 dark:bg-slate-600 ring-2 ring-slate-500/30"></div>
                        <div className="flex flex-col items-start">
                            <span className="text-3xl font-black text-slate-600 dark:text-slate-400 leading-none">
                                {lessons.filter((_, i) => i > unlockedLessonIdx).length}
                            </span>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mt-1">
                                Locked
                        </span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Achievement Badge Collection */}
            <div className="absolute top-4 -right-20 z-20 pointer-events-none hidden xl:block">
                <div className={`
                    rounded-2xl border shadow-xl backdrop-blur-sm p-4 w-64
                    ${isDarkMode 
                        ? 'bg-gradient-to-br from-indigo-900/30 via-[#0f172a]/50 to-indigo-900/30 border-indigo-500/20' 
                        : 'bg-gradient-to-br from-indigo-50/50 via-slate-50/60 to-indigo-50/50 border-indigo-400/30'}
                `}>
                    <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-indigo-500/15">
                        <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-indigo-800/30 border border-indigo-500/20' : 'bg-indigo-100/60 border border-indigo-300/40'}`}>
                            <Trophy size={16} className="text-yellow-400 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600 uppercase tracking-widest">
                                Achievements
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                                {Math.floor((currentLessonIdx) / 3)}/9
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 9 }).map((_, idx) => {
                            const isUnlocked = idx < Math.floor((currentLessonIdx) / 3);
                            
                            const achievements = [
                                { icon: Sparkles, color: 'emerald', darkBg: 'from-emerald-900/40 via-emerald-800/30 to-emerald-900/40', darkBorder: 'border-emerald-500/30', darkShadow: 'shadow-emerald-500/15', darkText: 'text-emerald-300', lightBg: 'from-emerald-100/60 via-emerald-50/70 to-emerald-100/60', lightBorder: 'border-emerald-400/40', lightText: 'text-emerald-600', glow: 'bg-emerald-500' },
                                { icon: GitBranch, color: 'blue', darkBg: 'from-blue-900/40 via-blue-800/30 to-blue-900/40', darkBorder: 'border-blue-500/30', darkShadow: 'shadow-blue-500/15', darkText: 'text-blue-300', lightBg: 'from-blue-100/60 via-blue-50/70 to-blue-100/60', lightBorder: 'border-blue-400/40', lightText: 'text-blue-600', glow: 'bg-blue-500' },
                                { icon: GitCommit, color: 'purple', darkBg: 'from-purple-900/40 via-purple-800/30 to-purple-900/40', darkBorder: 'border-purple-500/30', darkShadow: 'shadow-purple-500/15', darkText: 'text-purple-300', lightBg: 'from-purple-100/60 via-purple-50/70 to-purple-100/60', lightBorder: 'border-purple-400/40', lightText: 'text-purple-600', glow: 'bg-purple-500' },
                                { icon: GitMerge, color: 'pink', darkBg: 'from-pink-900/40 via-pink-800/30 to-pink-900/40', darkBorder: 'border-pink-500/30', darkShadow: 'shadow-pink-500/15', darkText: 'text-pink-300', lightBg: 'from-pink-100/60 via-pink-50/70 to-pink-100/60', lightBorder: 'border-pink-400/40', lightText: 'text-pink-600', glow: 'bg-pink-500' },
                                { icon: GitPullRequest, color: 'orange', darkBg: 'from-orange-900/40 via-orange-800/30 to-orange-900/40', darkBorder: 'border-orange-500/30', darkShadow: 'shadow-orange-500/15', darkText: 'text-orange-300', lightBg: 'from-orange-100/60 via-orange-50/70 to-orange-100/60', lightBorder: 'border-orange-400/40', lightText: 'text-orange-600', glow: 'bg-orange-500' },
                                { icon: Users, color: 'cyan', darkBg: 'from-cyan-900/40 via-cyan-800/30 to-cyan-900/40', darkBorder: 'border-cyan-500/30', darkShadow: 'shadow-cyan-500/15', darkText: 'text-cyan-300', lightBg: 'from-cyan-100/60 via-cyan-50/70 to-cyan-100/60', lightBorder: 'border-cyan-400/40', lightText: 'text-cyan-600', glow: 'bg-cyan-500' },
                                { icon: History, color: 'amber', darkBg: 'from-amber-900/40 via-amber-800/30 to-amber-900/40', darkBorder: 'border-amber-500/30', darkShadow: 'shadow-amber-500/15', darkText: 'text-amber-300', lightBg: 'from-amber-100/60 via-amber-50/70 to-amber-100/60', lightBorder: 'border-amber-400/40', lightText: 'text-amber-600', glow: 'bg-amber-500' },
                                { icon: Workflow, color: 'violet', darkBg: 'from-violet-900/40 via-violet-800/30 to-violet-900/40', darkBorder: 'border-violet-500/30', darkShadow: 'shadow-violet-500/15', darkText: 'text-violet-300', lightBg: 'from-violet-100/60 via-violet-50/70 to-violet-100/60', lightBorder: 'border-violet-400/40', lightText: 'text-violet-600', glow: 'bg-violet-500' },
                                { icon: Award, color: 'rose', darkBg: 'from-rose-900/40 via-rose-800/30 to-rose-900/40', darkBorder: 'border-rose-500/30', darkShadow: 'shadow-rose-500/15', darkText: 'text-rose-300', lightBg: 'from-rose-100/60 via-rose-50/70 to-rose-100/60', lightBorder: 'border-rose-400/40', lightText: 'text-rose-600', glow: 'bg-rose-500' },
                            ];
                            
                            const achievement = achievements[idx];
                            const Icon = achievement.icon;
                            
                            return (
                                <div
                                    key={`achievement-${idx}`}
                                    className={`
                                        relative aspect-square rounded-lg border flex items-center justify-center transition-all duration-300 group
                                        ${isUnlocked
                                            ? isDarkMode
                                                ? `bg-gradient-to-br ${achievement.darkBg} ${achievement.darkBorder} shadow-lg ${achievement.darkShadow} hover:scale-110`
                                                : `bg-gradient-to-br ${achievement.lightBg} ${achievement.lightBorder} shadow-lg hover:scale-110`
                                            : isDarkMode
                                                ? 'bg-[#0f172a]/30 border-slate-700/20 opacity-25'
                                                : 'bg-slate-200/40 border-slate-300/25 opacity-25'}
                                    `}
                                >
                                    {isUnlocked ? (
                                        <Icon size={18} className={`${isDarkMode ? achievement.darkText : achievement.lightText} fill-current group-hover:animate-bounce`} />
                                    ) : (
                                        <Lock size={14} className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                                    )}
                                    {isUnlocked && (
                                        <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 blur-sm transition-opacity ${isDarkMode ? achievement.glow : achievement.glow.replace('500', '400')}`}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Floating Info Cards - Hidden on mobile */}
            {lessons.map((_, i) => {
                if (i === 0 || i === lessons.length - 1) return null;
                if (i % 3 !== 0) return null;
                
                const point = points[i];
                const nextPoint = points[i + 1];
                
                const midY = (point.y + nextPoint.y) / 2;
                const midX = (point.x + nextPoint.x) / 2;
                
                const curveSide = Math.sin(i * 0.6) > 0 ? 'right' : 'left';
                const offsetX = curveSide === 'left' ? -200 : 200;
                
                const cardTypes = [
                    { icon: Code2, title: "Pro Tip", content: "Clear commit messages", color: "indigo" },
                    { icon: Zap, title: "Quick Tip", content: "Use branches for features", color: "purple" },
                    { icon: Target, title: "Best Practice", content: "Pull before you push", color: "pink" },
                    { icon: Trophy, title: "Git Wisdom", content: "Review with git diff", color: "indigo" },
                    { icon: Code2, title: "Pro Tip", content: "Small frequent commits", color: "purple" },
                ];
                
                const card = cardTypes[i % cardTypes.length];
                const Icon = card.icon;
                
                return (
                    <div
                        key={`path-card-${i}`}
                        className="absolute pointer-events-none opacity-60 hover:opacity-100 transition-all duration-500 group hidden xl:block"
                        style={{
                            left: midX + offsetX,
                            top: midY - 30,
                            transform: 'translateX(-50%)',
                            zIndex: 4
                        }}
                    >
                        <div className={`
                            relative rounded-2xl border shadow-xl backdrop-blur-sm overflow-hidden transition-all duration-300
                            group-hover:scale-105
                            ${isDarkMode 
                                ? 'bg-gradient-to-br from-indigo-900/30 via-[#0f172a]/40 to-indigo-900/30 border-indigo-500/25' 
                                : 'bg-gradient-to-br from-indigo-50/50 via-slate-50/60 to-indigo-50/50 border-indigo-400/35'}
                        `}>
                            <div className={`
                                absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300
                                ${isDarkMode 
                                    ? 'bg-gradient-to-r from-indigo-500/50 via-indigo-400/30 to-indigo-500/50'
                                    : 'bg-gradient-to-r from-indigo-400/40 via-indigo-300/30 to-indigo-400/40'}
                            `}></div>
                            
                            <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${isDarkMode ? 'border-indigo-400/40' : 'border-indigo-500/50'} rounded-tl-lg`}></div>
                            <div className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${isDarkMode ? 'border-indigo-400/40' : 'border-indigo-500/50'} rounded-tr-lg`}></div>
                            <div className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l ${isDarkMode ? 'border-indigo-400/40' : 'border-indigo-500/50'} rounded-bl-lg`}></div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${isDarkMode ? 'border-indigo-400/40' : 'border-indigo-500/50'} rounded-br-lg`}></div>
                            
                            <div className={`relative flex items-center gap-3 mb-3 pb-3 border-b ${isDarkMode ? 'border-indigo-500/15' : 'border-indigo-400/20'} bg-gradient-to-r from-transparent via-indigo-500/2 to-transparent px-4 pt-4`}>
                                <div className={`
                                    relative p-2 rounded-lg backdrop-blur-sm
                                    ${isDarkMode 
                                        ? 'bg-indigo-800/30 border border-indigo-500/25' 
                                        : 'bg-indigo-100/60 border border-indigo-300/40'}
                                `}>
                                    <Icon size={16} className={`${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                </div>
                                <h4 className={`
                                    text-xs font-black uppercase tracking-widest flex-1
                                    ${isDarkMode
                                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600'
                                        : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700'}
                                `}>
                                    {card.title}
                                </h4>
                            </div>
                            
                            <div className="relative px-4 pb-4">
                                <p className={`
                                    text-xs font-bold leading-relaxed
                                    ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}
                                `}>
                                    {card.content}
                                </p>
                            </div>
                            
                            <div className={`
                                absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-15 blur-lg transition-opacity duration-300 -z-10
                                ${isDarkMode 
                                    ? 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500'
                                    : 'bg-gradient-to-r from-indigo-400 via-indigo-300 to-indigo-400'}
                            `}></div>
                        </div>
                    </div>
                );
            })}
            
            {/* Optimized Path */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <defs>
                    <filter id="glowCore">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
                        <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="1" />
                    </linearGradient>
                </defs>
                
                <path d={pathD} fill="none" stroke={isDarkMode ? "#6366f1" : "#818cf8"} strokeWidth="16" strokeLinecap="round" opacity={isDarkMode ? "0.15" : "0.2"} />
                <path d={pathD} fill="none" stroke="url(#pathGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" filter="url(#glowCore)" />
                <path d={pathD} fill="none" stroke="url(#pathGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="1" />
            </svg>

            {lessons.map((lesson, i) => {
                const point = points[i];
                const isLastLesson = i === lessons.length - 1;
                const isAllComplete = quickStats.isAllComplete;
                
                // Enhanced completion logic for the last node
                const isCompleted = i < currentLessonIdx || (isLastLesson && isAllComplete);
                const isActive = i === currentLessonIdx && !isAllComplete;
                const isLocked = i > unlockedLessonIdx && !isAllComplete; 
                
                const isSectionStart = i === 0 || lessons[i-1].section !== lesson.section;

                return (
                    <React.Fragment key={lesson.id}>
                        {isSectionStart && (() => {
                            const sectionInfo = sectionData.get(lesson.section);
                            if (!sectionInfo) return null;
                            
                            const sectionLessons = sectionInfo.lessons;
                            const sectionCompleted = sectionLessons.filter((l) => {
                                const globalIdx = lessons.findIndex(lesson => lesson.id === l.id);
                                return globalIdx < currentLessonIdx || (isAllComplete && globalIdx === lessons.length - 1);
                            }).length;
                            const sectionProgress = (sectionCompleted / sectionLessons.length) * 100;
                            const isSectionComplete = sectionCompleted === sectionLessons.length;
                            const hasActiveInSection = sectionLessons.some((l) => {
                                const globalIdx = lessons.findIndex(lesson => lesson.id === l.id);
                                return globalIdx === currentLessonIdx && !isAllComplete;
                            });
                            
                            return (
                                <div 
                                    className="absolute z-10 pointer-events-none group hidden lg:block"
                                    style={{ 
                                        left: point.x - (windowWidth < 1024 ? 200 : 280),
                                        top: point.y - 20,
                                        transform: 'translateX(-100%)'
                                    }}
                                >
                                    <div className={`
                                        relative rounded-lg md:rounded-xl shadow-xl backdrop-blur-sm overflow-hidden transition-all duration-200 border-2 px-3 md:px-5 py-2 md:py-3 min-w-[200px] md:min-w-[240px] max-w-[280px]
                                        ${isSectionComplete 
                                            ? isDarkMode 
                                                ? 'bg-gradient-to-r from-emerald-900/95 via-emerald-800/95 to-emerald-900/95 border-emerald-400/70' 
                                                : 'bg-gradient-to-r from-emerald-50/95 via-emerald-100/95 to-emerald-50/95 border-emerald-500/70'
                                            : hasActiveInSection
                                                ? isDarkMode
                                                    ? 'bg-gradient-to-r from-indigo-900/95 via-indigo-800/95 to-indigo-900/95 border-indigo-400/70'
                                                    : 'bg-gradient-to-r from-indigo-50/95 via-indigo-100/95 to-indigo-50/95 border-indigo-500/70'
                                                : isDarkMode 
                                                    ? 'bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95 border-slate-600/50' 
                                                    : 'bg-gradient-to-r from-slate-100/95 via-slate-200/95 to-slate-100/95 border-slate-400/50'}
                                    `}>
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                p-2 rounded-lg
                                                ${isSectionComplete 
                                                    ? isDarkMode ? 'bg-emerald-800/50' : 'bg-emerald-100'
                                                    : hasActiveInSection
                                                        ? isDarkMode ? 'bg-indigo-800/50' : 'bg-indigo-100'
                                                        : isDarkMode ? 'bg-slate-700/50' : 'bg-slate-200'}
                                            `}>
                                                {isSectionComplete ? (
                                                    <Trophy className={`w-4 h-4 md:w-5 md:h-5 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`} />
                                                ) : hasActiveInSection ? (
                                                    <Target className={`w-4 h-4 md:w-5 md:h-5 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'} animate-pulse`} />
                                                ) : (
                                                    <Zap className={`w-4 h-4 md:w-5 md:h-5 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`} />
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`
                                                    font-black text-xs md:text-sm lg:text-base uppercase tracking-wider truncate
                                                    ${isSectionComplete 
                                                        ? isDarkMode ? 'text-emerald-200' : 'text-emerald-700'
                                                        : hasActiveInSection
                                                            ? isDarkMode ? 'text-indigo-200' : 'text-indigo-700'
                                                            : isDarkMode ? 'text-slate-300' : 'text-slate-700'}
                                                `}>
                                                    {lesson.section}
                                                </h3>
                                                <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 mt-1 flex-wrap">
                                                    <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400">
                                                        {sectionCompleted}/{sectionLessons.length} Missions
                                                    </span>
                                                    <div className={`w-16 md:w-20 lg:w-24 h-1.5 md:h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800/60' : 'bg-slate-200/60'} border border-slate-300/30 dark:border-slate-700/30`}>
                                                        <div 
                                                            className={`
                                                                h-full rounded-full transition-all duration-500 shadow-sm
                                                                ${isSectionComplete 
                                                                    ? 'bg-emerald-500 dark:bg-emerald-400'
                                                                    : hasActiveInSection
                                                                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                                                                        : 'bg-indigo-500 dark:bg-indigo-400'}
                                                            `}
                                                            style={{ width: `${sectionProgress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`
                                                        text-xs md:text-sm font-black
                                                        ${isSectionComplete 
                                                            ? isDarkMode ? 'text-emerald-300' : 'text-emerald-600'
                                                            : isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}
                                                    `}>
                                                        {Math.round(sectionProgress)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div 
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                            style={{ 
                                left: point.x, 
                                top: point.y,
                                zIndex: isActive ? 100 : 10 + i
                            }}
                            data-active={isActive}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.zIndex = '10000';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.zIndex = isActive ? '100' : (10 + i).toString();
                            }}
                        >
                            {isActive && (
                                <>
                                    <div className="absolute inset-[-10px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-30"></div>
                                    <div className="absolute inset-[-6px] rounded-full border-3 border-indigo-400/50"></div>
                                </>
                            )}

                            <button
                                onClick={() => !isLocked && onSelectLesson(i)}
                                disabled={isLocked}
                                aria-label={`${isLocked ? 'Locked' : isCompleted ? 'Completed' : isActive ? 'Active' : 'Available'} lesson: ${lesson.title}`}
                                aria-pressed={isActive}
                                className={`
                                    relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
                                    focus:outline-none focus:ring-4 focus:ring-indigo-500/50 focus:ring-offset-2
                                    ${isActive 
                                        ? 'scale-125 shadow-2xl ring-4 ring-indigo-500/30' 
                                        : isCompleted 
                                            ? 'hover:scale-110 hover:shadow-lg focus:scale-110' 
                                            : !isLocked 
                                                ? 'hover:scale-110 hover:shadow-lg focus:scale-110'
                                                : 'cursor-not-allowed opacity-50'}
                                `}
                            >
                                <div className={`
                                    absolute inset-0 rounded-full border-3 transition-all duration-300
                                    ${isActive 
                                        ? 'border-white shadow-[0_0_20px_rgba(99,102,241,0.6)]' 
                                        : isCompleted 
                                            ? 'border-emerald-400 dark:border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                                            : !isLocked 
                                                ? 'border-indigo-500 dark:border-indigo-400'
                                                : 'border-slate-400 dark:border-slate-600'}
                                `}></div>
                                
                                <div className={`
                                    absolute inset-1 rounded-full transition-all duration-300
                                    ${isActive 
                                        ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600' 
                                        : isCompleted 
                                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
                                            : !isLocked 
                                                ? 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900'
                                                : 'bg-slate-300 dark:bg-slate-800'}
                                `}></div>
                                
                                <div className={`
                                    absolute inset-3 rounded-full border-2 transition-all duration-300
                                    ${isActive 
                                        ? 'border-white/40' 
                                        : isCompleted 
                                            ? 'border-emerald-200/40 dark:border-emerald-300/40' 
                                            : !isLocked 
                                                ? 'border-indigo-300/30 dark:border-indigo-400/30'
                                                : 'border-slate-400/30'}
                                `}></div>
                                
                                <div className="relative z-10">
                                {isCompleted ? (
                                    <Check size={32} strokeWidth={3} className="text-white" />
                                ) : isActive ? (
                                    <Play size={36} fill="currentColor" className="text-white ml-1" />
                                ) : isLocked ? (
                                    <Lock size={24} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
                                ) : (
                                    <div className="font-black text-xl text-indigo-600 dark:text-indigo-400">{i + 1}</div>
                                )}
                                </div>
                                
                                {(isActive || (!isLocked && !isCompleted)) && (
                                    <div className={`
                                        absolute inset-0 rounded-full opacity-30 blur-md
                                        ${isActive 
                                            ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' 
                                            : 'bg-indigo-500'}
                                    `}></div>
                                )}

                                {!isLocked && (
                                    <div className={`
                                        absolute top-full mt-4 w-72 max-w-[calc(100vw-2rem)] rounded-xl border-2 shadow-2xl text-left backdrop-blur-sm overflow-hidden
                                        opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200
                                        ${isActive ? 'opacity-100' : ''}
                                        ${isDarkMode 
                                            ? 'bg-slate-900/98 border-indigo-500/70' 
                                            : 'bg-white/98 border-indigo-400/70'}
                                    `}
                                    style={{
                                        left: '50%',
                                        transform: 'translateX(-50%) translateY(0.5rem)',
                                        zIndex: window.innerWidth < 768 ? 1000 : 10001, // Lower z-index on mobile to allow dropdown to appear above
                                        pointerEvents: isActive ? 'auto' : 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.pointerEvents = 'auto';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.pointerEvents = 'none';
                                        }
                                    }}
                                    >
                                        <div className={`
                                            px-4 pt-3 pb-2.5 border-b
                                            ${isDarkMode ? 'border-indigo-500/40' : 'border-indigo-400/40'}
                                        `}>
                                            <div className="flex items-center gap-2.5">
                                                <div className={`
                                                    w-8 h-8 rounded-md flex items-center justify-center font-black text-sm
                                                    ${isDarkMode ? 'bg-indigo-900/60 text-indigo-300 border-2 border-indigo-500/60' : 'bg-indigo-100 text-indigo-700 border-2 border-indigo-400'}
                                                `}>
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 uppercase tracking-widest">
                                                        MISSION {i + 1}
                                                    </div>
                                                    <div className={`
                                                        text-[10px] font-bold px-2 py-0.5 rounded border backdrop-blur-sm mt-0.5 inline-block
                                                        ${isDarkMode ? 'bg-indigo-900/60 text-indigo-200 border-indigo-500/60' : 'bg-indigo-100 text-indigo-700 border-indigo-400'}
                                                    `}>
                                                        {lesson.section}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="px-4 py-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight tracking-tight line-clamp-1 flex-1">
                                                    {lesson.title.replace(/^\d+\.\s/, '')}
                                                </h3>
                                                <div className={`
                                                    flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ml-2
                                                    ${isDarkMode 
                                                        ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/50' 
                                                        : 'bg-indigo-100 text-indigo-700 border border-indigo-400'}
                                                `}>
                                                    <Clock size={10} />
                                                    ~5m
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed mb-3 line-clamp-2 font-semibold">
                                                {lesson.description}
                                            </p>
                                            
                                            <div className="flex justify-start">
                                            {isActive ? (
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectLesson(i);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white text-[10px] font-black px-4 py-2 rounded-md uppercase tracking-wider shadow-xl hover:shadow-indigo-500/50 transition-all hover:scale-105 glow-box-pink cursor-pointer"
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            onSelectLesson(i);
                                                        }
                                                    }}
                                                >
                                                    <Play size={12} fill="currentColor" /> Resume
                                                </div>
                                            ) : isCompleted ? (
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectLesson(i);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-[10px] font-black px-4 py-2 rounded-md uppercase tracking-wider shadow-xl hover:shadow-emerald-500/50 transition-all hover:scale-105 glow-box cursor-pointer"
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            onSelectLesson(i);
                                                        }
                                                    }}
                                                >
                                                    <Check size={12} strokeWidth={3} /> Replay
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectLesson(i);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[10px] font-black px-4 py-2 rounded-md uppercase tracking-wider shadow-xl hover:shadow-indigo-500/50 transition-all hover:scale-105 glow-box cursor-pointer"
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            onSelectLesson(i);
                                                        }
                                                    }}
                                                >
                                                    <Play size={12} fill="currentColor" /> Start
                                                </div>
                                            )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </button>

                            {isCompleted && (
                                <div className="absolute -top-2 -right-2 text-yellow-300 bg-orange-600 rounded-full p-1.5 border-2 border-white dark:border-slate-900 shadow-lg">
                                    <Star size={14} fill="currentColor" />
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                );
            })}
            </div>
        </div>
      </div>
    </div>
  );
};