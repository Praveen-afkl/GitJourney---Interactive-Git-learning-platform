import React, { memo, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Lesson } from '../types';
import { CheckCircle2, ArrowRight, Target, Terminal, Scroll, Flag, Lightbulb, BookOpen, Code, Info, Zap } from 'lucide-react';
import { LESSON_GUIDES } from '../utils/lessonGuides';

interface GuidePanelProps {
  lesson: Lesson;
  isComplete: boolean;
  onNext: () => void;
  onScrollComplete?: () => void;
  onCommand?: (cmd: string) => void;
}

export const GuidePanel: React.FC<GuidePanelProps> = memo(({ lesson, isComplete, onNext, onScrollComplete, onCommand }) => {
  const guide = LESSON_GUIDES[lesson.id];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const previousLessonIdRef = useRef<string>(lesson.id);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const completionLatch = useRef(false);
  const callbackCalledRef = useRef(false);
  const onScrollCompleteRef = useRef(onScrollComplete);
  const isCompleteRef = useRef(isComplete);


  useEffect(() => {
    onScrollCompleteRef.current = onScrollComplete;
  }, [onScrollComplete]);

  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);


  const isTheoryOnly = !lesson.task || lesson.task.trim() === '';


  useEffect(() => {
    const lessonChanged = previousLessonIdRef.current !== lesson.id;
    previousLessonIdRef.current = lesson.id;

    if (lessonChanged) {
      setHasScrolledToBottom(false);
      completionLatch.current = false;
      callbackCalledRef.current = false;
      scrollPositionRef.current = 0;
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [lesson.id]);


  useLayoutEffect(() => {
    if (scrollContainerRef.current && previousLessonIdRef.current === lesson.id && scrollPositionRef.current > 0) {

      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollPositionRef.current;
        }
      });
    }
  });


  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {

      scrollPositionRef.current = container.scrollTop;


      if (completionLatch.current) return;

      const { scrollTop, scrollHeight, clientHeight } = container;


      const isContentShort = scrollHeight <= clientHeight + 2;
      const isAtBottom = (scrollTop + clientHeight) >= (scrollHeight - 20);

      if (isContentShort || isAtBottom) {
        completionLatch.current = true;


        setHasScrolledToBottom(prev => {
          if (prev) return prev;
          return true;
        });


        if (onScrollCompleteRef.current && !isCompleteRef.current && !callbackCalledRef.current) {
          callbackCalledRef.current = true;

          requestAnimationFrame(() => {
            if (onScrollCompleteRef.current) {
              onScrollCompleteRef.current();
            }
          });
        }
      }
    };


    handleScroll();

    container.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {

      if (container && scrollPositionRef.current > 0) {
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = scrollPositionRef.current;
          }
        });
      }
      handleScroll();
    });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [lesson.id]);


  useEffect(() => {

    if (scrollContainerRef.current && previousLessonIdRef.current === lesson.id && scrollPositionRef.current > 0) {
      const savedPosition = scrollPositionRef.current;

      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = savedPosition;

          setTimeout(() => {
            if (scrollContainerRef.current && scrollContainerRef.current.scrollTop !== savedPosition) {
              scrollContainerRef.current.scrollTop = savedPosition;
            }
          }, 10);
        }
      });
    }
  });

  return (
    <div className="flex flex-col h-full min-h-0 relative overflow-hidden bg-slate-50 dark:bg-slate-900">


      <div className="p-3 md:p-4 pb-2 md:pb-3 bg-indigo-50/80 dark:bg-indigo-900/20 shrink-0 border-b border-indigo-100 dark:border-indigo-500/10">
        <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 opacity-70">
          <Scroll size={12} md:size={14} className="text-purple-500 dark:text-purple-400" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-purple-600 dark:text-purple-300">
            Current Quest
          </span>
        </div>

        <h1 className="text-base md:text-xl font-extrabold text-slate-900 dark:text-white leading-tight drop-shadow-sm">
          {lesson.title?.replace(/^\d+\.\s/, '') || 'Untitled Lesson'}
        </h1>

        <div className="mt-1 md:mt-1.5 inline-block px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
          {lesson.section}
        </div>
      </div>


      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto guide-panel-scrollbar px-3 md:px-5 pb-3 md:pb-4 space-y-3 md:space-y-4 pt-3 md:pt-4"
        style={{
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          scrollbarGutter: 'stable'
        }}
      >


        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-3.5 border border-indigo-200 dark:border-indigo-500/20">
          <div className="flex items-start gap-3">
            <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-2">What is this?</h3>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {guide?.explanation || lesson.description}
              </p>
            </div>
          </div>
        </div>


        {guide?.whyImportant && (
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3.5 border border-amber-200 dark:border-amber-500/20">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-2">Why is this important?</h3>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {guide.whyImportant}
                </p>
              </div>
            </div>
          </div>
        )}


        {guide?.examples && guide.examples.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 mb-2">
              <Code size={16} className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Examples</h3>
            </div>
            {guide.examples.map((example, idx) => (
              <div key={`example-${lesson.id}-${idx}`} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700/50">
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">{example.title}</h4>
                    <div className="bg-slate-900 dark:bg-black rounded p-2 mb-1.5 overflow-x-auto">
                      <code className="text-xs text-emerald-400 font-mono whitespace-nowrap">
                        {example.command}
                      </code>
                    </div>


                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {example.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}


        {guide?.visualExplanation && (
          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-3.5 border border-purple-200 dark:border-purple-500/20">
            <div className="flex items-start gap-3">
              <Zap size={16} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-purple-900 dark:text-purple-200 mb-2">Visual Guide</h3>
                <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {guide.visualExplanation}
                </pre>
              </div>
            </div>
          </div>
        )}


        <div data-mission-card className={`
            relative rounded-lg overflow-hidden border mt-2 transition-all duration-300
            ${isComplete && hasScrolledToBottom
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/50 shadow-sm'
            : 'bg-slate-100 dark:bg-slate-800/60 border-indigo-200 dark:border-indigo-500/30'}
        `}>
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              {isComplete && hasScrolledToBottom ? (
                <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400" />
              ) : (
                <Target size={14} className="text-amber-500 dark:text-amber-400" />
              )}
              <span className={`text-xs font-bold uppercase tracking-wider ${isComplete && hasScrolledToBottom ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {isTheoryOnly ? 'Reading Mission' : 'Your Mission'}
              </span>
            </div>

            <div className="font-bold text-sm text-slate-800 dark:text-white mb-2">
              {lesson.task || 'Read through the guide to complete this lesson'}
            </div>

            {!isTheoryOnly && lesson.hint && (
              <div className="bg-slate-900 dark:bg-black rounded p-2.5 mb-2 overflow-x-auto border border-slate-700 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-1">
                  <Terminal size={12} className="text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Command to Run</span>
                </div>
                <code className="text-xs text-emerald-400 font-mono whitespace-nowrap block">
                  {lesson.hint}
                </code>

                {onCommand && isMobile && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (scrollContainerRef.current) {
                        scrollPositionRef.current = scrollContainerRef.current.scrollTop;
                      }

                      requestAnimationFrame(() => {
                        if (onCommand && lesson.hint) {
                          onCommand(lesson.hint);
                        }

                        setTimeout(() => {
                          if (scrollContainerRef.current) {
                            scrollContainerRef.current.scrollTop = scrollPositionRef.current;
                          }
                        }, 0);
                      });
                    }}
                    className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3 rounded transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Terminal size={14} />
                    <span>Run Command</span>
                  </button>
                )}
              </div>
            )}

            {!hasScrolledToBottom && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded p-2 border border-indigo-200 dark:border-indigo-500/30">
                <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
                  <Scroll size={12} />
                  <span className="font-semibold">Scroll down to read the complete guide (required)</span>
                </div>
              </div>
            )}

            {hasScrolledToBottom && !isComplete && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2 border border-amber-200 dark:border-amber-500/30 mt-2">
                <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                  <CheckCircle2 size={12} />
                  <span className="font-semibold">Guide read! {isTheoryOnly ? 'You can now proceed.' : 'Complete the task above to finish.'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      <div className="p-3 border-t border-slate-200 dark:border-white/5 bg-white/80 dark:bg-black/40 shrink-0 backdrop-blur-sm">
        <button
          onClick={onNext}
          disabled={!isComplete || !hasScrolledToBottom}
          className={`
                w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200
                ${isComplete && hasScrolledToBottom
              ? 'bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transform hover:translate-y-[-1px]'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-70'}
            `}
        >
          {isComplete && hasScrolledToBottom ? (
            <>
              <span>COMPLETE MISSION</span>
              <ArrowRight size={14} />
            </>
          ) : (
            <span className="flex items-center gap-2">
              <Flag size={13} />
              {!hasScrolledToBottom
                ? 'SCROLL GUIDE TO CONTINUE'
                : !isComplete
                  ? 'AWAITING TASK COMPLETION'
                  : 'AWAITING COMPLETION'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {

  return (
    prevProps.lesson.id === nextProps.lesson.id &&
    prevProps.isComplete === nextProps.isComplete &&
    prevProps.onNext === nextProps.onNext &&
    prevProps.onScrollComplete === nextProps.onScrollComplete &&
    prevProps.onCommand === nextProps.onCommand
  );
});

GuidePanel.displayName = 'GuidePanel';