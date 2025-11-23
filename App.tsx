import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { GitCanvas } from './components/GitCanvas';
import { Terminal } from './components/Terminal';
import { GuidePanel } from './components/GuidePanel';
import { RepositoryInfo } from './components/RepositoryInfo';
import { executeGitCommand, LESSONS, PRACTICE_LESSON } from './utils/gitLogic';
import { GitState, LogEntry } from './types';
import { RotateCcw, Map, Code2, HelpCircle, Trophy, Sun, Moon, Undo, Redo, History, Download, Menu, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { AchievementBadge } from './components/AchievementBadge';
import { Logo } from './components/Logo';
import { getCurrentUser, saveProgress, loadProgress } from './utils/auth';


const CurriculumView = lazy(() => import('./components/CurriculumView').then(m => ({ default: m.CurriculumView })));
const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const CommandReference = lazy(() => import('./components/CommandReference').then(m => ({ default: m.CommandReference })));
const FeatureGuide = lazy(() => import('./components/FeatureGuide').then(m => ({ default: m.FeatureGuide })));


const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

type ViewMode = 'landing' | 'curriculum' | 'workspace';

interface HistoryState {
  gitState: GitState;
  logs: LogEntry[];
  timestamp: number;
}

const GameWrapper = ({ children, isDarkMode }: { children: React.ReactNode; isDarkMode: boolean }) => {
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowMobileWarning(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`${isDarkMode ? 'dark' : ''} h-screen w-screen overflow-hidden font-sans transition-colors duration-500`}>
      <div className="h-full w-full bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 relative overflow-hidden flex flex-col">

        {showMobileWarning && isMobile && (
          <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 dark:bg-amber-600 text-white px-4 py-3 shadow-lg border-b border-amber-600 dark:border-amber-700">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">
                    For the best experience, please use GitJourney on a desktop or tablet device.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileWarning(false)}
                className="ml-4 flex-shrink-0 text-white hover:text-amber-100 transition-colors"
                aria-label="Dismiss warning"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}


        <div className={`absolute inset-0 z-0 transition-opacity duration-700 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0f172a] to-[#0f172a]"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className={`absolute inset-0 z-0 transition-opacity duration-700 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white"></div>
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 left-10 w-72 h-72 bg-indigo-300/10 rounded-full blur-3xl"></div>
        </div>


        <div className="relative z-10 flex flex-col h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function App() {

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('gitjourney-dark-mode');
    return saved ? JSON.parse(saved) : true;
  });
  const [view, setView] = useState<ViewMode>(() => {

    const user = getCurrentUser();
    return user ? 'curriculum' : 'landing';
  });
  const [currentLessonIdx, setCurrentLessonIdx] = useState(() => {
    const progress = loadProgress();
    return progress?.currentLessonIdx ?? 0;
  });
  const [unlockedLessonIdx, setUnlockedLessonIdx] = useState(() => {
    const progress = loadProgress();
    return progress?.unlockedLessonIdx ?? 0;
  });

  const [gitState, setGitState] = useState<GitState>(LESSONS[0].initialState);
  const [logs, setLogs] = useState<LogEntry[]>([{ id: '0', type: 'info', text: `Welcome to GitJourney.` }]);
  const [showHelp, setShowHelp] = useState(false);
  const [hasShownSuccessForLevel, setHasShownSuccessForLevel] = useState(false);
  const [showFeatureGuide, setShowFeatureGuide] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);


  const [historyStates, setHistoryStates] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [showCommandHistory, setShowCommandHistory] = useState(false);
  const [lessonStartTime, setLessonStartTime] = useState<number>(Date.now());
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentLesson = React.useMemo(() =>
    currentLessonIdx === -1 ? PRACTICE_LESSON : LESSONS[currentLessonIdx],
    [currentLessonIdx]
  );
  const [guideScrollComplete, setGuideScrollComplete] = React.useState(false);

  const isTheoryOnly = React.useMemo(() =>
    currentLessonIdx !== -1 && (!currentLesson.task || currentLesson.task.trim() === ''),
    [currentLessonIdx, currentLesson]
  );

  const taskComplete = React.useMemo(() => currentLesson.checkSuccess(gitState), [currentLesson, gitState]);
  const isLessonComplete = React.useMemo(() => {
    return (isTheoryOnly ? guideScrollComplete : taskComplete) && guideScrollComplete;
  }, [isTheoryOnly, guideScrollComplete, taskComplete]);


  const scrollCompleteCalledRef = useRef(false);


  useEffect(() => {
    scrollCompleteCalledRef.current = false;
  }, [currentLessonIdx]);


  const handleGuideScrollComplete = useCallback(() => {

    if (!scrollCompleteCalledRef.current) {
      scrollCompleteCalledRef.current = true;
      setGuideScrollComplete(prev => {

        if (prev) return prev;
        return true;
      });
    }
  }, []);


  useEffect(() => {
    const hasCompletedGuide = localStorage.getItem('gitjourney-guide-completed') === 'true';
    const user = getCurrentUser();


    if (user && !hasCompletedGuide && !showFeatureGuide && (view === 'curriculum' || view === 'workspace')) {

      const timer = setTimeout(() => {

        const stillNotCompleted = localStorage.getItem('gitjourney-guide-completed') !== 'true';
        if (stillNotCompleted) {
          setShowFeatureGuide(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [view]);


  useEffect(() => {
    localStorage.setItem('gitjourney-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);


  useEffect(() => {
    if (getCurrentUser()) {
      saveProgress(currentLessonIdx, unlockedLessonIdx, totalTimeSpent);
    }
  }, [currentLessonIdx, unlockedLessonIdx, totalTimeSpent]);


  useEffect(() => {
    setLessonStartTime(Date.now());
    return () => {
      const timeSpent = Date.now() - lessonStartTime;
      setTotalTimeSpent(prev => prev + timeSpent);
    };
  }, [currentLessonIdx]);


  useEffect(() => {
    if (isLessonComplete && !hasShownSuccessForLevel && currentLessonIdx !== -1) {
      if (currentLessonIdx + 1 > unlockedLessonIdx) {
        setUnlockedLessonIdx(currentLessonIdx + 1);
      }
      setHasShownSuccessForLevel(true);
    }
  }, [isLessonComplete, hasShownSuccessForLevel, currentLessonIdx, unlockedLessonIdx]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };


  const saveToHistory = (newState: GitState, newLogs: LogEntry[]) => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    historyTimeoutRef.current = setTimeout(() => {
      const historyEntry: HistoryState = {
        gitState: JSON.parse(JSON.stringify(newState)),
        logs: JSON.parse(JSON.stringify(newLogs)),
        timestamp: Date.now()
      };

      setHistoryStates(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(historyEntry);
        return newHistory.slice(-50);
      });
      setHistoryIndex(prev => Math.min(prev + 1, 49));
    }, 300);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = historyStates[historyIndex - 1];
      setGitState(prevState.gitState);
      setLogs(prevState.logs);
      setHistoryIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (historyIndex < historyStates.length - 1) {
      const nextState = historyStates[historyIndex + 1];
      setGitState(nextState.gitState);
      setLogs(nextState.logs);
      setHistoryIndex(prev => prev + 1);
    }
  };

  const exportCommandHistory = () => {
    const historyText = commandHistory.join('\n');
    const blob = new Blob([historyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gitjourney-commands-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const progressPercentage = currentLessonIdx !== -1
    ? Math.round(((currentLessonIdx + 1) / LESSONS.length) * 100)
    : 0;


  const achievements = {
    'first-commit': currentLessonIdx >= 2,
    'branch-master': currentLessonIdx >= 6,
    'merge-wizard': currentLessonIdx >= 8,
    'remote-expert': currentLessonIdx >= 12,
    'all-complete': currentLessonIdx >= LESSONS.length - 1,
  };

  const startLesson = (index: number) => {
    setCurrentLessonIdx(index);
    setGitState(LESSONS[index].initialState);
    setLogs([{ id: uuidv4(), type: 'info', text: `Started Level ${index + 1}: ${LESSONS[index].title}` }]);
    setView('workspace');
    setHasShownSuccessForLevel(false);
    setHistoryStates([]);
    setHistoryIndex(-1);
    setLessonStartTime(Date.now());
    setGuideScrollComplete(false);
  };

  const startPractice = () => {
    setCurrentLessonIdx(-1);
    setGitState(PRACTICE_LESSON.initialState);
    setLogs([{ id: uuidv4(), type: 'info', text: `Started Practice Sandbox` }]);
    setView('workspace');
  };

  const advanceLesson = () => {
    if (currentLessonIdx !== -1 && currentLessonIdx < LESSONS.length - 1) {
      startLesson(currentLessonIdx + 1);
    } else {
      setView('curriculum');
    }
  };

  const resetLesson = () => {
    setGitState(currentLesson.initialState);
    setLogs([{ id: uuidv4(), type: 'info', text: `Reset: ${currentLesson.title}` }]);
    setHasShownSuccessForLevel(false);
  };

  const handleCommand = useCallback(async (cmd: string) => {

    if (cmd.trim() && cmd !== 'clear') {
      setCommandHistory(prev => [...prev, cmd].slice(-100));
    }

    if (cmd === 'clear') {
      setLogs([]);
      return;
    }


    const commands = cmd.split('&&').map(c => c.trim()).filter(c => c.length > 0);


    setGitState(currentState => {
      let state = currentState;
      let allOutputs: string[] = [];
      let allSuccess = true;

      for (const singleCmd of commands) {
        const result = executeGitCommand(singleCmd, state);

        if (result.success) {
          state = result.newState;
          allOutputs.push(result.output);
        } else {
          allSuccess = false;
          allOutputs.push(result.output);

          break;
        }
      }

      const combinedOutput = allOutputs.join('\n\n');

      if (allSuccess) {
        setLogs(prevLogs => {
          const newLogs = [...prevLogs, { id: uuidv4(), type: 'command', text: cmd }, { id: uuidv4(), type: 'success', text: combinedOutput }];
          saveToHistory(state, newLogs);
          return newLogs;
        });
      } else {
        setLogs(prevLogs => {
          const newLogs = [...prevLogs, { id: uuidv4(), type: 'command', text: cmd }, { id: uuidv4(), type: 'error', text: combinedOutput }];
          saveToHistory(currentState, newLogs);
          return newLogs;
        });
      }

      return state;
    });
  }, []);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {

      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowHelp(true);
      }

      if (e.key === 'Escape') {
        setShowHelp(false);
        setShowCommandHistory(false);
      }

      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (historyIndex > 0) {
          const prevState = historyStates[historyIndex - 1];
          setGitState(prevState.gitState);
          setLogs(prevState.logs);
          setHistoryIndex(prev => prev - 1);
        }
      }

      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        if (historyIndex < historyStates.length - 1) {
          const nextState = historyStates[historyIndex + 1];
          setGitState(nextState.gitState);
          setLogs(nextState.logs);
          setHistoryIndex(prev => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, historyStates]);




  if (view === 'landing') {
    return (
      <GameWrapper isDarkMode={isDarkMode}>
        <Suspense fallback={<LoadingFallback />}>
          <LandingPage
            onLogin={() => {

              const progress = loadProgress();
              if (progress) {
                setCurrentLessonIdx(progress.currentLessonIdx);
                setUnlockedLessonIdx(progress.unlockedLessonIdx);
                setTotalTimeSpent(progress.totalTimeSpent);
              }
              setView('curriculum');
            }}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
        </Suspense>
      </GameWrapper>
    )
  }

  if (view === 'curriculum') {
    return (
      <GameWrapper isDarkMode={isDarkMode}>
        <Suspense fallback={<LoadingFallback />}>
          <CurriculumView
            lessons={LESSONS}
            currentLessonIdx={currentLessonIdx}
            unlockedLessonIdx={unlockedLessonIdx}
            onSelectLesson={startLesson}
            onStartPractice={startPractice}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            onLogout={() => {
              setView('landing');
              setCurrentLessonIdx(0);
              setUnlockedLessonIdx(0);
              setTotalTimeSpent(0);
            }}
          />
        </Suspense>
      </GameWrapper>
    );
  }

  return (
    <GameWrapper isDarkMode={isDarkMode}>
      {showFeatureGuide && (
        <Suspense fallback={null}>
          <FeatureGuide
            isOpen={showFeatureGuide}
            onClose={() => {
              setShowFeatureGuide(false);

              if (localStorage.getItem('gitjourney-guide-completed') !== 'true') {
                localStorage.setItem('gitjourney-guide-completed', 'true');
              }
            }}
            view={view === 'curriculum' ? 'curriculum' : 'workspace'}
            isDarkMode={isDarkMode}
          />
        </Suspense>
      )}
      {showHelp && (
        <Suspense fallback={null}>
          <CommandReference isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </Suspense>
      )}

      <div className="flex flex-col h-full p-4 gap-4 max-w-[1920px] mx-auto w-full overflow-hidden">


        <header className="h-16 md:h-20 flex items-center justify-between px-2 sm:px-3 md:px-6 lg:px-10 shrink-0 sticky top-2 z-[9998] bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl md:rounded-2xl mx-2 md:mx-4 relative min-w-0 overflow-visible">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative cursor-pointer group" onClick={() => setView('curriculum')}>
              <Logo className="w-8 h-8 md:w-12 md:h-12 relative z-10" />
              <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full pulse-glow"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="font-black text-xl md:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-tight leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Git</span>
                <span className="text-glow-purple dark:text-glow-purple">Journey</span>
              </h1>
              <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-indigo-400 tracking-widest uppercase mt-0.5 hidden sm:block">
                Mission Control
              </p>
            </div>

          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-4 min-w-0 flex-shrink">
            {currentLessonIdx !== -1 ? (
              <div className="hidden md:flex flex-col items-end text-right bg-slate-100 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-indigo-500/30 px-4 py-2 rounded-2xl sketch-subtle shrink-0">
                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  Progress
                </div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {progressPercentage}%
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 animate-pulse sketch-subtle shrink-0">
                <Code2 size={14} /> FREE PLAY
              </div>
            )}


            <button
              onClick={toggleTheme}
              className="hidden md:flex p-1.5 md:p-2 rounded-xl md:rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all hover:scale-110 shrink-0"
            >
              {isDarkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-indigo-500" />}
            </button>


            <button
              onClick={() => setView('curriculum')}
              className="hidden md:flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all shadow-xl hover:shadow-indigo-500/50 rounded-xl md:rounded-2xl shrink-0"
            >
              <Map size={14} className="md:w-4 md:h-4" /> <span className="hidden lg:inline">MAP</span>
            </button>


            <div className="hidden md:flex items-center gap-1 md:gap-2 shrink-0" data-navigation>
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-1.5 md:p-2 bg-white/50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl md:rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Undo size={16} />
              </button>

              <button
                onClick={redo}
                disabled={historyIndex >= historyStates.length - 1}
                className="p-1.5 md:p-2 bg-white/50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl md:rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                <Redo size={16} />
              </button>

              <button
                onClick={() => setShowCommandHistory(!showCommandHistory)}
                className="p-2 bg-white/50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200 dark:border-slate-700/50"
                title="Command History"
              >
                <History size={16} />
              </button>

              <button
                onClick={exportCommandHistory}
                disabled={commandHistory.length === 0}
                className="p-2 bg-white/50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border border-slate-200 dark:border-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Export Command History"
              >
                <Download size={16} />
              </button>

              <button
                onClick={() => {
                  setShowFeatureGuide(true);
                }}
                className="p-2 bg-white/50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-500 transition-all border border-purple-200 dark:border-purple-700/50"
                title="Feature Guide - Learn how to use GitJourney"
              >
                <HelpCircle size={16} />
              </button>

              <button
                onClick={() => setShowHelp(true)}
                className="p-2 bg-white/50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl md:rounded-2xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200 dark:border-slate-700/50"
                title="Command Reference (Ctrl+K)"
              >
                <Code2 size={16} />
              </button>

              <button
                onClick={resetLesson}
                className="p-2 bg-white/50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl md:rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-700/50"
                title={currentLessonIdx === -1 ? "Reset Sandbox" : "Restart Level"}
              >
                <RotateCcw size={16} />
              </button>
            </div>


            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 bg-white/50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 transition-all border border-slate-200 dark:border-slate-700/50 shrink-0"
              aria-label="Menu"
            >
              {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
          {showMobileMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 mx-2 md:hidden bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-[9999] overflow-hidden">
              <div className="p-4 space-y-2 max-h-[80vh] overflow-y-auto">

                {currentLessonIdx !== -1 ? (
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-indigo-500/30 rounded-lg mb-2">
                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                      Progress
                    </div>
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {progressPercentage}%
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center px-4 py-3 bg-emerald-100 dark:bg-emerald-500/20 backdrop-blur-md border border-emerald-200 dark:border-emerald-500/30 rounded-lg mb-2">
                    <Code2 size={16} className="text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">FREE PLAY SANDBOX</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setView('curriculum');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-left"
                >
                  <Map size={18} className="flex-shrink-0 text-white" />
                  <span className="font-semibold">View Map</span>
                </button>

                <button
                  onClick={() => {
                    setShowFeatureGuide(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-left"
                >
                  <HelpCircle size={18} className="flex-shrink-0 text-purple-500 dark:text-purple-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">Feature Guide</span>
                </button>

                <button
                  onClick={() => {
                    setShowHelp(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-left"
                >
                  <Code2 size={18} className="flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">Command Reference</span>
                </button>

                <button
                  onClick={() => {
                    toggleTheme();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-left"
                >
                  {isDarkMode ? <Sun size={18} className="flex-shrink-0 text-yellow-400" /> : <Moon size={18} className="flex-shrink-0 text-indigo-500" />}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-left disabled:opacity-30"
                  >
                    <Undo size={18} className="flex-shrink-0 text-slate-600 dark:text-slate-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">Undo</span>
                  </button>

                  <button
                    onClick={redo}
                    disabled={historyIndex >= historyStates.length - 1}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-left disabled:opacity-30"
                  >
                    <Redo size={18} className="flex-shrink-0 text-slate-600 dark:text-slate-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">Redo</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setShowCommandHistory(!showCommandHistory);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-left"
                  >
                    <History size={18} className="flex-shrink-0 text-slate-600 dark:text-slate-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">History</span>
                  </button>

                  <button
                    onClick={exportCommandHistory}
                    disabled={commandHistory.length === 0}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-left disabled:opacity-30"
                  >
                    <Download size={18} className="flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">Export</span>
                  </button>
                </div>

                {currentLessonIdx !== -1 && (
                  <button
                    onClick={() => {
                      resetLesson();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-left"
                  >
                    <RotateCcw size={18} className="flex-shrink-0 text-slate-600 dark:text-slate-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">Restart Level</span>
                  </button>
                )}

                {currentLessonIdx === -1 && (
                  <button
                    onClick={() => {
                      resetLesson();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-left"
                  >
                    <RotateCcw size={18} className="flex-shrink-0 text-slate-600 dark:text-slate-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">Reset Sandbox</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </header>


        <main className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-4 overflow-y-auto overflow-x-hidden p-2 md:p-0 md:overflow-hidden workspace-scrollbar-mobile">


          <div className="md:col-span-1 lg:col-span-4 flex flex-col min-w-0 h-full min-h-[400px] md:min-h-0">
            <div className="h-full min-h-[400px] md:min-h-0 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-xl dark:shadow-2xl flex flex-col transition-colors" data-guide-panel>
              <GuidePanel
                lesson={currentLesson}
                isComplete={isLessonComplete}
                onNext={advanceLesson}
                onScrollComplete={handleGuideScrollComplete}
                onCommand={handleCommand}
              />
            </div>
          </div>

          {/* Center: Viewport */}
          <div className="md:col-span-1 lg:col-span-5 flex flex-col min-w-0 h-full min-h-[400px] md:min-h-0">
            <div className="h-full min-h-[400px] md:min-h-0 bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl md:rounded-3xl border border-indigo-200 dark:border-indigo-500/30 overflow-hidden shadow-xl dark:shadow-2xl relative flex flex-col group transition-colors" data-git-canvas>
              {/* Decorative Corner pieces for Viewport feel */}
              <div className="absolute top-0 left-0 w-3 h-3 md:w-4 md:h-4 border-t-2 border-l-2 border-indigo-500/50 dark:border-indigo-400 rounded-tl-xl opacity-50 group-hover:opacity-100 transition-opacity z-20 m-1.5 md:m-2"></div>
              <div className="absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 border-t-2 border-r-2 border-indigo-500/50 dark:border-indigo-400 rounded-tr-xl opacity-50 group-hover:opacity-100 transition-opacity z-20 m-1.5 md:m-2"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 md:w-4 md:h-4 border-b-2 border-l-2 border-indigo-500/50 dark:border-indigo-400 rounded-bl-xl opacity-50 group-hover:opacity-100 transition-opacity z-20 m-1.5 md:m-2"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 border-b-2 border-r-2 border-indigo-500/50 dark:border-indigo-400 rounded-br-xl opacity-50 group-hover:opacity-100 transition-opacity z-20 m-1.5 md:m-2"></div>

              <GitCanvas gitState={gitState} isDarkMode={isDarkMode} />
            </div>
          </div>

          {/* Right: Command Deck */}
          <div className="md:col-span-2 lg:col-span-3 flex flex-col min-w-0 gap-3 md:gap-4 h-full min-h-0">
            {/* Info Widget */}
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-lg shrink-0 transition-colors">
              <RepositoryInfo
                gitState={gitState}
                repoName={currentLessonIdx === -1 ? 'sandbox' : 'mission-repo'}
              />
            </div>
            {/* Console */}
            <div className="flex-1 min-h-0 bg-slate-100 dark:bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-slate-300 dark:border-slate-700/50 overflow-hidden shadow-2xl flex flex-col transition-colors relative" data-terminal>
              <Terminal logs={logs} onCommand={handleCommand} commandHistory={commandHistory} />

              {/* Command History Sidebar */}
              {showCommandHistory && (
                <div className="absolute top-0 right-0 h-full w-full sm:w-64 bg-slate-800/95 backdrop-blur-xl border-l border-slate-700 z-20 flex flex-col shadow-2xl">
                  <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <History size={16} /> History
                    </h3>
                    <button
                      onClick={() => setShowCommandHistory(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {commandHistory.length === 0 ? (
                      <p className="text-slate-500 text-xs text-center py-4">No commands yet</p>
                    ) : (
                      commandHistory.slice().reverse().map((cmd, idx) => (
                        <div
                          key={`${cmd}-${commandHistory.length - idx}`}
                          className="text-xs font-mono text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-700 hover:bg-slate-700/50 cursor-pointer"
                          onClick={() => handleCommand(cmd)}
                        >
                          {cmd}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </GameWrapper>
  );
}