import React, { useState, useEffect, useMemo, memo } from 'react';
import { Terminal, GitBranch, ChevronRight, Star, Users, Sun, Moon, Gamepad2, Cpu, Trophy, Shield, LogIn, UserPlus, BookOpen, Clock, Code } from 'lucide-react';
import { Logo } from './Logo';
import { signUp, signIn, getCurrentUser } from '../utils/auth';
import ColorBends from './ColorBends';

interface LandingPageProps {
    onLogin: () => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
}

const LandingPageComponent: React.FC<LandingPageProps> = ({ onLogin, isDarkMode, onToggleTheme }) => {
    const [email, setEmail] = useState('');
    const [avatarName, setAvatarName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentUser = getCurrentUser();


    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    });


    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        };


        checkMobile();
        window.addEventListener('resize', checkMobile);


        window.addEventListener('orientationchange', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('orientationchange', checkMobile);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                signUp(email, avatarName.trim() || undefined);
            } else {
                const user = signIn(email);
                if (!user) {
                    setError('User not found. Please sign up first.');
                    setIsLoading(false);
                    return;
                }
            }


            setTimeout(() => {
                setIsLoading(false);
                onLogin();
            }, 500);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setIsLoading(false);
        }
    };


    const colorBendsColors = useMemo(() => isDarkMode
        ? ['#3b82f6', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
        : ['#60a5fa', '#818cf8', '#22d3ee', '#34d399', '#fbbf24', '#f472b6'], [isDarkMode]);


    useEffect(() => {
        if (currentUser) {
            onLogin();
        }
    }, [currentUser, onLogin]);

    return (
        <div className="flex flex-col min-h-screen relative z-10 overflow-y-auto hide-scrollbar text-slate-800 dark:text-slate-200 transition-colors duration-500 p-4" style={{ fontFamily: "'Josefin Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>


            <div className="fixed inset-0 z-0" style={{ width: '100vw', height: '100vh' }}>
                {!isMobile && (
                    <ColorBends
                        className="w-full h-full"
                        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                        colors={colorBendsColors}
                        transparent={true}
                        speed={0.12}
                        scale={1.2}
                        frequency={1.5}
                        warpStrength={1.0}
                        mouseInfluence={0.8}
                        parallax={0.4}
                        noise={0.08}
                        autoRotate={1.5}
                    />
                )}

                {isMobile && (
                    <div
                        className="absolute inset-0"
                        style={{
                            background: isDarkMode
                                ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.12) 0%, transparent 50%), linear-gradient(135deg, rgba(5, 11, 20, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
                                : 'radial-gradient(circle at 20% 50%, rgba(96, 165, 250, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(129, 140, 248, 0.15) 0%, transparent 50%), linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.9) 100%)',
                            zIndex: 1
                        }}
                    />
                )}

                <div
                    className="absolute inset-0"
                    style={{
                        zIndex: 2,
                        backdropFilter: isMobile ? 'blur(2px) saturate(120%)' : 'blur(6px) saturate(140%)',
                        WebkitBackdropFilter: isMobile ? 'blur(2px) saturate(120%)' : 'blur(6px) saturate(140%)',
                        willChange: isMobile ? 'auto' : 'transform',
                        transform: 'translateZ(0)',
                        background: isDarkMode
                            ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), linear-gradient(135deg, rgba(5, 11, 20, 0.55) 0%, rgba(15, 23, 42, 0.45) 100%), linear-gradient(180deg, rgba(59, 130, 246, 0.015) 0%, transparent 30%, transparent 70%, rgba(99, 102, 241, 0.015) 100%)'
                            : 'radial-gradient(circle at 20% 50%, rgba(96, 165, 250, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(129, 140, 248, 0.06) 0%, transparent 50%), linear-gradient(135deg, rgba(248, 250, 252, 0.28) 0%, rgba(241, 245, 249, 0.22) 100%), linear-gradient(180deg, rgba(96, 165, 250, 0.025) 0%, transparent 30%, transparent 70%, rgba(129, 140, 248, 0.025) 100%)'
                    }}
                ></div>
            </div>


            <nav className={`relative z-50 flex items-center justify-between px-5 py-3 border border-slate-200 dark:border-white/10 ${isMobile ? 'bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-sm' : 'bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md'} rounded-2xl mx-4 mt-2 animate-fade-in-up`} style={{ opacity: 0 }}>
                <div className="flex items-center gap-4 select-none group cursor-pointer">
                    <div className="relative">
                        <Logo className="rounded-xl rotate-0 scale-90 border-2 border-indigo-500" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-500 animate-ping rounded-full"></div>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl tracking-tighter text-slate-900 dark:text-white uppercase" style={{ fontFamily: "'Josefin Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", fontWeight: 600 }}>Git<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Journey</span></h1>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-indigo-400 tracking-widest uppercase">v2.4.0 // SYSTEM READY</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        SERVER: ONLINE
                    </div>

                    <button
                        onClick={onToggleTheme}
                        className="p-2 border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors rounded-xl"
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {currentUser && (
                        <button
                            onClick={onLogin}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)] hover:shadow-[0_0_25px_rgba(79,70,229,0.8)] rounded-xl"
                            style={{ fontFamily: "'Josefin Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", fontWeight: 600 }}
                        >
                            Continue
                        </button>
                    )}
                </div>
            </nav>


            <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-12 gap-6 md:gap-8 lg:gap-12 min-h-[calc(100vh-200px)]">


                <div className="flex-1 text-center lg:text-left space-y-4 md:space-y-6 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-2.5 md:px-3 py-1 md:py-1.5 bg-slate-100 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-indigo-500/30 rounded-lg text-indigo-600 dark:text-indigo-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest animate-fade-in-up" style={{ opacity: 0 }}>
                        <Gamepad2 size={10} md:size={12} />
                        <span>Mission: Master Version Control</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight" style={{ fontFamily: "'Josefin Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", fontWeight: 600, letterSpacing: '-0.02em' }}>
                        <span
                            className="animate-fade-in-up inline-block"
                            style={isDarkMode ? {
                                color: '#ffffff',
                                textShadow: isMobile ? '0 0 3px rgba(255, 255, 255, 0.3)' : '0 0 6px rgba(255, 255, 255, 0.4), 0 0 12px rgba(255, 255, 255, 0.3), 0 0 18px rgba(255, 255, 255, 0.2)',
                                filter: isMobile ? 'none' : 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
                            } : {
                                color: '#1e293b',
                                textShadow: isMobile ? '0 0 2px rgba(30, 41, 59, 0.2)' : '0 0 3px rgba(30, 41, 59, 0.3), 0 0 6px rgba(30, 41, 59, 0.2)',
                                filter: isMobile ? 'none' : 'drop-shadow(0 0 4px rgba(30, 41, 59, 0.25))'
                            }}
                        >
                            Level Up Your
                        </span> <br className="hidden sm:block" />
                        <span
                            className="inline-block animate-fade-in-up-delay relative"
                            style={{
                                background: isDarkMode
                                    ? 'linear-gradient(90deg, #f97316 0%, #fb923c 25%, #fbbf24 45%, #fcd34d 55%, #fbbf24 70%, #fb923c 85%, #f97316 100%)'
                                    : 'linear-gradient(90deg, #ea580c 0%, #f97316 25%, #f59e0b 45%, #eab308 55%, #f59e0b 70%, #f97316 85%, #ea580c 100%)',
                                backgroundSize: '200% 100%',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                color: 'transparent',
                                animation: isMobile ? 'fadeInUp 0.8s ease-out 0.3s forwards' : 'fadeInUp 0.8s ease-out 0.3s forwards, gradient-flow 5s linear infinite 1.1s',
                                filter: isMobile
                                    ? (isDarkMode ? 'drop-shadow(0 0 4px rgba(249, 115, 22, 0.3))' : 'drop-shadow(0 0 2px rgba(234, 88, 12, 0.2))')
                                    : (isDarkMode
                                        ? 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.4)) drop-shadow(0 0 16px rgba(251, 146, 60, 0.35)) drop-shadow(0 0 24px rgba(251, 191, 36, 0.3)) drop-shadow(0 0 32px rgba(252, 211, 77, 0.2))'
                                        : 'drop-shadow(0 0 4px rgba(234, 88, 12, 0.3)) drop-shadow(0 0 8px rgba(249, 115, 22, 0.25)) drop-shadow(0 0 12px rgba(245, 158, 11, 0.2)) drop-shadow(0 0 16px rgba(234, 179, 8, 0.15))'),
                                display: 'inline-block',
                                opacity: 0,
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            Dev Skills
                        </span>
                    </h1>

                    <p className="text-xs sm:text-sm md:text-base text-slate-800 dark:text-slate-200 leading-relaxed max-w-xl mx-auto lg:mx-0 border-l-2 border-indigo-500/50 dark:border-indigo-500/30 pl-3 md:pl-4 rounded-sm animate-fade-in-up-delay" style={{ fontFamily: "'Josefin Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", fontWeight: 400, opacity: 0 }}>
                        Forget boring tutorials. Enter the simulation. Visualize branches, command the terminal, and unlock achievements in the ultimate Git sandbox.
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start animate-fade-in-up-delay" style={{ opacity: 0 }}>
                        <StatBadge label="Lessons" value="23" icon={<BookOpen size={12} />} />
                        <StatBadge label="Commands" value="20+" icon={<Code size={12} />} />
                        <StatBadge label="Time" value="~2h" icon={<Clock size={12} />} />
                    </div>
                </div>


                <div className="flex-1 w-full max-w-md relative group perspective-1000 animate-fade-in-up-delay" style={{ opacity: 0 }}>

                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl animate-pulse delay-75"></div>


                    <div
                        className={`relative overflow-hidden border border-slate-300/50 dark:border-indigo-500/30 p-1 shadow-2xl transform transition-transform duration-500 ${isMobile ? '' : 'hover:scale-[1.02]'} rounded-3xl`}
                        style={{
                            background: isDarkMode
                                ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.5) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.7) 100%)',
                            backdropFilter: isMobile ? 'blur(8px) saturate(120%)' : 'blur(30px) saturate(150%)',
                            WebkitBackdropFilter: isMobile ? 'blur(8px) saturate(120%)' : 'blur(30px) saturate(150%)',
                            willChange: isMobile ? 'auto' : 'transform',
                            transform: 'translateZ(0)',
                            boxShadow: isDarkMode
                                ? '0 8px 32px 0 rgba(99, 102, 241, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
                                : '0 8px 32px 0 rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)'
                        }}
                    >

                        <div
                            className="absolute inset-0 rounded-3xl"
                            style={{
                                background: isDarkMode
                                    ? 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)'
                                    : 'radial-gradient(circle at 50% 0%, rgba(129, 140, 248, 0.2) 0%, transparent 50%)',
                                pointerEvents: 'none'
                            }}
                        ></div>

                        <div
                            className="relative p-5 h-full rounded-[20px]"
                            style={{
                                background: isDarkMode
                                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.4) 100%)'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(248, 250, 252, 0.5) 100%)',
                                backdropFilter: isMobile ? 'blur(4px)' : 'blur(8px)',
                                WebkitBackdropFilter: isMobile ? 'blur(4px)' : 'blur(8px)',
                                willChange: isMobile ? 'auto' : 'transform',
                                transform: 'translateZ(0)'
                            }}
                        >
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                                <div>
                                    <h3 className="text-lg uppercase text-slate-900 dark:text-white" style={{ fontFamily: "'Josefin Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", fontWeight: 600 }}>
                                        {isSignUp ? 'New Game' : 'Load Save'}
                                    </h3>
                                    <p className="text-[10px] font-mono text-indigo-500" style={{ fontFamily: "'Josefin Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
                                        {isSignUp ? 'CREATE_CHARACTER_PROFILE' : 'RESUME_MISSION'}
                                    </p>
                                </div>
                                {isSignUp ? (
                                    <UserPlus className="text-slate-300 dark:text-slate-700" size={24} />
                                ) : (
                                    <LogIn className="text-slate-300 dark:text-slate-700" size={24} />
                                )}
                            </div>


                            <div
                                className="flex gap-1.5 mb-4 p-0.5 rounded-lg"
                                style={{
                                    background: isDarkMode
                                        ? 'rgba(30, 41, 59, 0.5)'
                                        : 'rgba(241, 245, 249, 0.7)',
                                    backdropFilter: isMobile ? 'blur(4px)' : 'blur(10px)',
                                    WebkitBackdropFilter: isMobile ? 'blur(4px)' : 'blur(10px)',
                                    border: `1px solid ${isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(148, 163, 184, 0.3)'}`
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSignUp(true);
                                        setError(null);
                                    }}
                                    className={`flex-1 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase transition-all ${isSignUp
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    Sign Up
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSignUp(false);
                                        setError(null);
                                    }}
                                    className={`flex-1 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase transition-all ${!isSignUp
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    Sign In
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="email-input" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                                        Pilot Email Identifier
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email-input"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError(null);
                                            }}
                                            className={`w-full px-3 py-2 text-slate-900 dark:text-white font-mono text-sm focus:ring-0 outline-none transition-all placeholder-slate-400 rounded-lg ${isMobile ? '' : 'backdrop-blur-sm'} ${error
                                                ? 'border-2 border-red-500 dark:border-red-500'
                                                : 'border-2 border-slate-200/50 dark:border-slate-700/50 focus:border-indigo-500 dark:focus:border-indigo-400'
                                                }`}
                                            style={{
                                                background: isDarkMode
                                                    ? 'rgba(30, 41, 59, 0.6)'
                                                    : 'rgba(255, 255, 255, 0.7)',
                                                backdropFilter: isMobile ? 'none' : 'blur(10px)',
                                                WebkitBackdropFilter: isMobile ? 'none' : 'blur(10px)'
                                            }}
                                            placeholder="pilot@base.com"
                                        />
                                        <div className={`absolute right-2 top-2 bottom-2 w-0.5 rounded-full ${error ? 'bg-red-500' : 'bg-indigo-500 animate-pulse'
                                            }`}></div>
                                    </div>
                                    {error && (
                                        <p className="text-[10px] text-red-500 font-semibold mt-0.5">{error}</p>
                                    )}
                                </div>

                                {isSignUp && (
                                    <div className="space-y-1.5">
                                        <label htmlFor="avatar-input" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                                            Pilot Call Sign (Optional)
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="avatar-input"
                                                type="text"
                                                value={avatarName}
                                                onChange={(e) => {
                                                    setAvatarName(e.target.value);
                                                    setError(null);
                                                }}
                                                className={`w-full border-2 border-slate-200/50 dark:border-slate-700/50 focus:border-indigo-500 dark:focus:border-indigo-400 px-3 py-2 text-slate-900 dark:text-white font-mono text-sm focus:ring-0 outline-none transition-all placeholder-slate-400 rounded-lg ${isMobile ? '' : 'backdrop-blur-sm'}`}
                                                style={{
                                                    background: isDarkMode
                                                        ? 'rgba(30, 41, 59, 0.6)'
                                                        : 'rgba(255, 255, 255, 0.7)',
                                                    backdropFilter: isMobile ? 'none' : 'blur(10px)',
                                                    WebkitBackdropFilter: isMobile ? 'none' : 'blur(10px)'
                                                }}
                                                placeholder="Your display name"
                                                maxLength={20}
                                            />
                                            <div className="absolute right-2 top-2 bottom-2 w-0.5 bg-indigo-500/50 rounded-full"></div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                                            This will be displayed in your profile
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full group relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white uppercase tracking-widest py-2.5 text-sm transition-all active:translate-y-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ fontFamily: "'Josefin Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", fontWeight: 600 }}
                                >

                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>

                                    <div className="flex items-center justify-center gap-2 relative z-10">
                                        {isLoading ? (
                                            <span className="font-mono text-xs animate-pulse">
                                                {isSignUp ? 'INITIALIZING...' : 'AUTHENTICATING...'}
                                            </span>
                                        ) : (
                                            <>
                                                <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                                                {isSignUp ? (
                                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                ) : (
                                                    <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
                                                )}
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>

                            <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
                                <span>Secure Connection</span>
                                <span className="text-emerald-500">Encrypted</span>
                            </div>
                        </div>
                    </div>


                    <div className="absolute -bottom-4 left-10 right-10 h-1.5 bg-indigo-500/30 rounded-full"></div>
                    <div className="absolute -bottom-4 left-1/2 w-20 h-1.5 bg-indigo-500 -translate-x-1/2 rounded-full"></div>
                </div>
            </main>


            {!isMobile && (
                <div className="relative z-10 py-12 animate-fade-in-up-delay" style={{ opacity: 0 }}>
                    <div className="max-w-7xl mx-auto px-6">
                        <h4 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">
                            System Modules Installed
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <ModuleCard
                                title="Visual Cortex"
                                subtitle="Real-time Graph Engine"
                                icon={<GitBranch className="text-pink-400" />}
                                color="pink"
                            />
                            <ModuleCard
                                title="Command Link"
                                subtitle="Terminal Simulator"
                                icon={<Terminal className="text-emerald-400" />}
                                color="emerald"
                            />
                            <ModuleCard
                                title="Mission Log"
                                subtitle="23 Campaign Levels"
                                icon={<Shield className="text-amber-400" />}
                                color="amber"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatBadge = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-indigo-500/30 rounded-lg" style={{ fontFamily: "'Josefin Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
        <div className="text-indigo-500 dark:text-indigo-400">
            {icon}
        </div>
        <div className="flex flex-col">
            <span className="text-xl text-slate-900 dark:text-white leading-tight" style={{ fontFamily: "'Josefin Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", fontWeight: 600 }}>{value}</span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight" style={{ fontFamily: "'Josefin Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", fontWeight: 400 }}>{label}</span>
        </div>
    </div>
);

const ModuleCard = ({ title, subtitle, icon, color = "indigo" }: { title: string, subtitle: string, icon: React.ReactNode, color?: "pink" | "emerald" | "amber" | "indigo" }) => {
    const colorClasses = {
        pink: {
            bg: "from-pink-500/10 via-pink-500/5 to-pink-500/10",
            border: "border-pink-400/20",
            text: "text-pink-300",
            iconBg: "bg-pink-500/10 border-pink-400/20",
            hover: "hover:border-pink-400/40",
            line: "bg-pink-400/30 group-hover:bg-pink-400/50"
        },
        emerald: {
            bg: "from-emerald-500/10 via-emerald-500/5 to-emerald-500/10",
            border: "border-emerald-400/20",
            text: "text-emerald-300",
            iconBg: "bg-emerald-500/10 border-emerald-400/20",
            hover: "hover:border-emerald-400/40",
            line: "bg-emerald-400/30 group-hover:bg-emerald-400/50"
        },
        amber: {
            bg: "from-amber-500/10 via-amber-500/5 to-amber-500/10",
            border: "border-amber-400/20",
            text: "text-amber-300",
            iconBg: "bg-amber-500/10 border-amber-400/20",
            hover: "hover:border-amber-400/40",
            line: "bg-amber-400/30 group-hover:bg-amber-400/50"
        }
    };

    const colors = colorClasses[color];

    return (
        <div className={`
            group p-6 transition-all cursor-default relative overflow-hidden rounded-2xl
            backdrop-blur-xl border ${colors.border} ${colors.hover}
            bg-gradient-to-br ${colors.bg}
            shadow-lg shadow-black/10
        `}>

            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>


            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity scale-150 group-hover:scale-125 duration-500 ${colors.text}`}>
                {icon}
            </div>

            <div className="flex items-center gap-4 mb-3 relative z-10">
                <div className={`p-2 rounded-lg border ${colors.iconBg} backdrop-blur-sm`}>
                    {icon}
                </div>
                <div className={`h-px flex-1 ${colors.line} transition-colors`}></div>
            </div>
            <h3 className={`font-bold text-lg ${colors.text} uppercase relative z-10`}>{title}</h3>
            <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-1 relative z-10">{subtitle}</p>
        </div>
    );
};

export const LandingPage = memo(LandingPageComponent);