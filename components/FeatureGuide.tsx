import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, HelpCircle, Map, Terminal, BookOpen, GitBranch, Keyboard, Trophy, Target, CheckCircle2, Sparkles } from 'lucide-react';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon: React.ReactNode;
}

interface FeatureGuideProps {
  isOpen: boolean;
  onClose: () => void;
  view: 'curriculum' | 'workspace';
  isDarkMode?: boolean;
}

const CURRICULUM_STEPS: GuideStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to GitJourney! 🚀',
    description: 'This interactive tour will help you master Git. You\'ll learn by doing - visualize branches, run commands, and complete missions.',
    position: 'center',
    icon: <Sparkles size={24} />
  },
  {
    id: 'curriculum-map',
    title: 'Curriculum Map',
    description: 'This is your learning path! Each node represents a lesson. Green checkmarks show completed lessons. Click any unlocked lesson to start.',
    target: '[data-curriculum-map]',
    position: 'right',
    icon: <Map size={20} />
  },
  {
    id: 'lesson-selection',
    title: 'Select a Lesson',
    description: 'Click on any unlocked lesson node to begin. The active lesson is highlighted. Complete lessons to unlock the next ones.',
    target: '[data-active="true"]',
    position: 'top',
    icon: <Target size={20} />
  },
  {
    id: 'progress-stats',
    title: 'Track Your Progress',
    description: 'Monitor your learning journey here. See your completion percentage, level, and estimated time remaining.',
    target: '[data-progress-stats]',
    position: 'bottom',
    icon: <Trophy size={20} />
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Press "?" to see all keyboard shortcuts. Use arrow keys to navigate lessons, Space to start/resume.',
    target: '[data-shortcuts-button]',
    position: 'left',
    icon: <Keyboard size={20} />
  },
  {
    id: 'sandbox-mode',
    title: 'Sandbox Mode',
    description: 'Click "Sandbox" to practice freely without lessons. Experiment with any Git command in a safe environment.',
    target: '[data-sandbox-button]',
    position: 'left',
    icon: <GitBranch size={20} />
  }
];

const WORKSPACE_STEPS: GuideStep[] = [
  {
    id: 'workspace-welcome',
    title: 'Workspace View',
    description: 'This is where the magic happens! You\'ll see three main panels: the visual graph, terminal, and guide.',
    position: 'center',
    icon: <Sparkles size={24} />
  },
  {
    id: 'git-canvas',
    title: 'Git Canvas (Visual Graph)',
    description: 'This visualizes your Git repository in real-time. See commits, branches, and merges as you work. Each color represents a different branch.',
    target: '[data-git-canvas]',
    position: 'right',
    icon: <GitBranch size={20} />
  },
  {
    id: 'terminal',
    title: 'Terminal',
    description: 'Type Git commands here just like a real terminal. Use Tab for autocomplete, ↑/↓ for command history. Your commands execute instantly!',
    target: '[data-terminal]',
    position: 'left',
    icon: <Terminal size={20} />
  },
  {
    id: 'guide-panel',
    title: 'Guide Panel',
    description: 'Read the lesson guide here. Scroll to the bottom to unlock the mission. The guide shows what to do and the command to run.',
    target: '[data-guide-panel]',
    position: 'left',
    icon: <BookOpen size={20} />
  },
  {
    id: 'mission-card',
    title: 'Your Mission',
    description: 'This card shows your current task. Complete it by running the command shown. Scroll the guide first to unlock the mission.',
    target: '[data-mission-card]',
    position: 'top',
    icon: <Target size={20} />
  },
  {
    id: 'navigation',
    title: 'Navigation',
    description: 'Use these buttons: Map (curriculum), Undo/Redo (command history), Reset (start over), and Help (command reference).',
    target: '[data-navigation]',
    position: 'bottom',
    icon: <Map size={20} />
  },
  {
    id: 'completion',
    title: 'Completing Lessons',
    description: 'When you complete a lesson, the next one unlocks automatically. Your progress is saved automatically. Keep learning!',
    position: 'center',
    icon: <CheckCircle2 size={20} />
  }
];

export const FeatureGuide: React.FC<FeatureGuideProps> = ({ isOpen, onClose, view, isDarkMode = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false); // Track if guide was previously open
  const initialStepRef = useRef(0); // Track initial step when guide opens

  const steps = view === 'curriculum' ? CURRICULUM_STEPS : WORKSPACE_STEPS;
  const step = steps[currentStep];

  // Handle guide open/close state - preserve step when guide stays open
  useEffect(() => {
    if (!isOpen) {
      // Only reset when guide is actually closed
      if (wasOpenRef.current) {
        setCurrentStep(0);
        setHighlightedElement(null);
      }
      wasOpenRef.current = false;
    } else {
      // Guide is opening or staying open
      if (!wasOpenRef.current) {
        // First time opening - start from step 0
        setCurrentStep(0);
        initialStepRef.current = 0;
      }
      wasOpenRef.current = true;
    }
  }, [isOpen]);

  // Handle step changes and element highlighting - separate effect
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Wait for DOM to be ready - increased timeout for better reliability
    const timer = setTimeout(() => {
      if (step.target) {
        // Try multiple times to find the element
        const findElement = (attempts = 0): void => {
          const element = document.querySelector(step.target!) as HTMLElement;
          if (element) {
            setHighlightedElement(element);
            // Only scroll if element is visible
            try {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (e) {
              // Ignore scroll errors
            }
          } else if (attempts < 5) {
            // Retry if element not found (up to 5 times with 200ms delay)
            setTimeout(() => findElement(attempts + 1), 200);
          } else {
            setHighlightedElement(null);
            console.warn(`Guide: Could not find element with selector: ${step.target}`);
          }
        };
        findElement();
      } else {
        setHighlightedElement(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, currentStep, step?.target || '']);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    // Always mark as completed when user finishes the tour
    localStorage.setItem('gitjourney-guide-completed', 'true');
    onClose();
  };

  const handleSkip = () => {
    // Always mark as completed when user skips the tour
    localStorage.setItem('gitjourney-guide-completed', 'true');
    onClose();
  };

  if (!isOpen) return null;

  // Calculate tooltip position - near the focused element, avoiding overlap
  const getTooltipPosition = () => {
    if (!highlightedElement || step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const rect = highlightedElement.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;
    const tooltipWidth = isMobile ? Math.min(280, window.innerWidth - 40) : 320;
    const tooltipHeight = isMobile ? 180 : 220;
    const spacing = isMobile ? 12 : 16; // Closer spacing on mobile

    let top = 0;
    let left = 0;
    let transform = '';

    switch (step.position) {
      case 'top':
        top = rect.top - tooltipHeight - spacing;
        left = rect.left + (rect.width / 2);
        transform = 'translateX(-50%)';
        break;
      case 'bottom':
        top = rect.bottom + spacing;
        left = rect.left + (rect.width / 2);
        transform = 'translateX(-50%)';
        break;
      case 'left':
        top = rect.top + (rect.height / 2);
        left = rect.left - tooltipWidth - spacing;
        transform = 'translateY(-50%)';
        break;
      case 'right':
        top = rect.top + (rect.height / 2);
        left = rect.right + spacing;
        transform = 'translateY(-50%)';
        break;
    }

    // Keep tooltip within viewport with padding
    const padding = 20;
    const maxTop = window.innerHeight - tooltipHeight - padding;
    const maxLeft = window.innerWidth - tooltipWidth - padding;
    
    // For left position, check if there's enough space on the left
    if (step.position === 'left') {
      const spaceOnLeft = rect.left - padding;
      const spaceOnRight = window.innerWidth - rect.right - padding;
      
      // If not enough space on left but enough on right, move to right
      if (spaceOnLeft < tooltipWidth + spacing && spaceOnRight >= tooltipWidth + spacing) {
        left = rect.right + spacing;
        transform = 'translateY(-50%)';
      } else {
        // Try to keep on left, adjust if needed
        left = Math.max(padding, rect.left - tooltipWidth - spacing);
        transform = 'translateY(-50%)';
      }
      top = Math.max(padding, Math.min(top, maxTop));
    } else if (step.position === 'right') {
      const spaceOnRight = window.innerWidth - rect.right - padding;
      const spaceOnLeft = rect.left - padding;
      
      // If not enough space on right but enough on left, move to left
      if (spaceOnRight < tooltipWidth + spacing && spaceOnLeft >= tooltipWidth + spacing) {
        left = rect.left - tooltipWidth - spacing;
        transform = 'translateY(-50%)';
      } else {
        left = Math.min(maxLeft, rect.right + spacing);
        transform = 'translateY(-50%)';
      }
      top = Math.max(padding, Math.min(top, maxTop));
    } else {
      // For top/bottom, use standard positioning
      top = Math.max(padding, Math.min(top, maxTop));
      left = Math.max(padding, Math.min(left, maxLeft));
      
      // If tooltip would overlap, adjust position
      if (step.position === 'bottom' && top < rect.bottom + spacing) {
        // Move to top instead
        top = rect.top - tooltipHeight - spacing;
        transform = 'translateX(-50%)';
      } else if (step.position === 'top' && top + tooltipHeight > rect.top - spacing) {
        // Move to bottom instead
        top = rect.bottom + spacing;
        transform = 'translateX(-50%)';
      }
    }

    return { 
      top: `${top}px`, 
      left: `${left}px`,
      transform: transform || undefined
    };
  };

  const tooltipStyle = getTooltipPosition();

  return (
    <>
      {/* Overlay with highlight - no blur on focused area */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998] pointer-events-auto"
        onClick={handleNext}
      >
        {/* Dark overlay with smart blur - no blur on highlighted area */}
        {highlightedElement && highlightedElement.getBoundingClientRect ? (() => {
          const rect = highlightedElement.getBoundingClientRect();
          const padding = 12;
          return (
            <>
              {/* Top dark area */}
              <div 
                className="absolute bg-black/75 backdrop-blur-sm"
                style={{
                  top: 0,
                  left: 0,
                  right: 0,
                  height: `${Math.max(0, rect.top - padding)}px`,
                }}
              />
              {/* Bottom dark area */}
              <div 
                className="absolute bg-black/75 backdrop-blur-sm"
                style={{
                  top: `${rect.bottom + padding}px`,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              {/* Left dark area */}
              <div 
                className="absolute bg-black/75 backdrop-blur-sm"
                style={{
                  top: `${Math.max(0, rect.top - padding)}px`,
                  left: 0,
                  width: `${Math.max(0, rect.left - padding)}px`,
                  height: `${rect.height + (padding * 2)}px`,
                }}
              />
              {/* Right dark area */}
              <div 
                className="absolute bg-black/75 backdrop-blur-sm"
                style={{
                  top: `${Math.max(0, rect.top - padding)}px`,
                  left: `${rect.right + padding}px`,
                  right: 0,
                  height: `${rect.height + (padding * 2)}px`,
                }}
              />
              {/* Clear highlight area - NO blur, sharp and clear */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: `${rect.top - padding}px`,
                  left: `${rect.left - padding}px`,
                  width: `${rect.width + (padding * 2)}px`,
                  height: `${rect.height + (padding * 2)}px`,
                  border: '3px solid #818cf8',
                  borderRadius: '12px',
                  boxShadow: '0 0 0 0 rgba(0, 0, 0, 0), 0 0 0 2px rgba(129, 140, 248, 0.6), 0 0 40px rgba(99, 102, 241, 1), inset 0 0 20px rgba(99, 102, 241, 0.2)',
                  background: 'transparent',
                  zIndex: 10,
                }}
              />
            </>
          );
        })() : (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm"></div>
        )}
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-[9999] pointer-events-auto"
        style={tooltipStyle}
      >
        <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl shadow-2xl border-2 border-indigo-500/30 p-4 md:p-6 w-[280px] md:w-80 max-w-[calc(100vw-20px)] animate-in zoom-in-95 duration-300 relative">
          {/* Arrow pointing to focused element */}
          {highlightedElement && step.position !== 'center' && (
            <div
              className="absolute w-0 h-0 border-8 border-transparent pointer-events-none z-10"
              style={{
                ...(step.position === 'right' && {
                  left: '-16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderRightColor: isDarkMode ? 'rgb(15, 23, 42)' : 'rgb(255, 255, 255)',
                }),
                ...(step.position === 'left' && {
                  right: '-16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderLeftColor: isDarkMode ? 'rgb(15, 23, 42)' : 'rgb(255, 255, 255)',
                }),
                ...(step.position === 'top' && {
                  bottom: '-16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderTopColor: isDarkMode ? 'rgb(15, 23, 42)' : 'rgb(255, 255, 255)',
                }),
                ...(step.position === 'bottom' && {
                  top: '-16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderBottomColor: isDarkMode ? 'rgb(15, 23, 42)' : 'rgb(255, 255, 255)',
                }),
              }}
            />
          )}
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                {step.icon}
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} />
              Previous
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-sm hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-lg"
              >
                <CheckCircle2 size={16} />
                Finish Tour
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

