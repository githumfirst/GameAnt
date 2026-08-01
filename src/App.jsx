import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Play, Smartphone, Globe, Gamepad2, FileCode2, Gamepad } from 'lucide-react';
import GamePlayer from './pages/GamePlayer';
import DevLogList from './pages/DevLogList';
import DevLogDetail from './pages/DevLogDetail';

import initialGames from '../public/data/games.json';

function Home() {
    const [games, setGames] = useState(initialGames || []);
    const [mainTab, setMainTab] = useState('itlog'); // 'itlog' (default) | 'game'
    const [gameFilter, setGameFilter] = useState('all'); // 'all', 'android', 'unique'
    const [visitorStats, setVisitorStats] = useState({ total: 1280, today: 35 });
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/data/games.json')
            .then(res => res.json())
            .then(data => setGames(data))
            .catch(err => console.error("Failed to load games:", err));

        // Track and fetch Visitor stats
        const loadVisitors = async () => {
            try {
                const res = await fetch('/api/visitors');
                if (res.ok) {
                    const data = await res.json();
                    if (data.total) {
                        setVisitorStats({ total: data.total, today: data.today });
                        localStorage.setItem('visitor_stats', JSON.stringify({ total: data.total, today: data.today }));
                        return;
                    }
                }
            } catch (e) { }

            // Local fallback & counter increment
            try {
                const local = localStorage.getItem('visitor_stats');
                const lastVisit = localStorage.getItem('last_visit_date');
                const todayStr = new Date().toISOString().substring(0, 10);
                
                let stats = local ? JSON.parse(local) : { total: 1280, today: 35 };

                if (lastVisit !== todayStr) {
                    stats.total += 1;
                    stats.today = (lastVisit ? stats.today : 35) + 1;
                    localStorage.setItem('last_visit_date', todayStr);
                    localStorage.setItem('visitor_stats', JSON.stringify(stats));
                }
                setVisitorStats(stats);
            } catch (e) { }
        };

        loadVisitors();
    }, []);

    const handlePlay = (game) => {
        navigate(`/play/${game.id}`);
    };

    const filteredGames = games.filter(game => {
        if (gameFilter === 'all') return true;
        if (gameFilter === 'android') return game.type === 'android';
        if (gameFilter === 'unique') return game.type === 'Unique';
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-brand-accent selection:text-white pb-20">

            {/* Hero Section */}
            <header className="relative overflow-hidden bg-slate-900 py-16 sm:py-24">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-accent to-brand-highlight opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                </div>

                <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
                    <div className="mx-auto max-w-2xl">
                        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-brand-highlight to-brand-accent mb-4">
                            ant@IT
                        </h1>
                        <p className="mt-4 text-lg leading-8 text-slate-300">
                            IT 정보, 개발 지식, 코딩, AI 지식을 의미있게
                        </p>

                        {/* Visitor Counter Badge */}
                        <div className="mt-6 inline-flex items-center gap-4 px-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg">
                            <span className="flex items-center gap-1.5 text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                오늘 방문자 <strong className="text-emerald-400 font-mono">{visitorStats.today}</strong> 명
                            </span>
                            <span className="text-slate-600">|</span>
                            <span className="text-slate-400">
                                누적 방문자 <strong className="text-brand-highlight font-mono">{visitorStats.total.toLocaleString()}</strong> 명
                            </span>
                        </div>
                    </div>
                </div>
            </header>



            {/* Top Level Main Category Tabs (IT Log vs Game) */}
            <div className="flex justify-center gap-4 mb-10 border-b border-slate-800 pb-8 px-6">
                <button
                    onClick={() => setMainTab('itlog')}
                    className={`px-8 py-3.5 rounded-2xl font-extrabold text-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2.5 ${mainTab === 'itlog'
                        ? 'bg-brand-accent text-white shadow-xl shadow-brand-accent/40 ring-2 ring-brand-highlight'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                        }`}
                >
                    <FileCode2 size={24} />
                    IT Log (IT 기술)
                </button>
                <button
                    onClick={() => setMainTab('game')}
                    className={`px-8 py-3.5 rounded-2xl font-extrabold text-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2.5 ${mainTab === 'game'
                        ? 'bg-brand-accent text-white shadow-xl shadow-brand-accent/40 ring-2 ring-brand-highlight'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                        }`}
                >
                    <Gamepad size={24} />
                    Game (게임)
                </button>
            </div>

            {/* Content Area Based on Main Tab */}
            {mainTab === 'itlog' ? (
                /* IT Log Tab View (Default Main View) */
                <main className="mx-auto max-w-7xl px-6 lg:px-8">
                    <DevLogList />
                </main>
            ) : (
                /* Game Tab View */
                <main className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Game Sub-filters */}
                    <div className="flex justify-center gap-3 mb-10 flex-wrap">
                        <button
                            onClick={() => setGameFilter('all')}
                            className={`px-6 py-2.5 rounded-full font-bold text-base transition-all duration-300 ${gameFilter === 'all'
                                ? 'bg-brand-accent text-white ring-2 ring-brand-highlight shadow-md'
                                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                                }`}
                        >
                            ALL
                        </button>
                        <button
                            onClick={() => setGameFilter('android')}
                            className={`px-6 py-2.5 rounded-full font-bold text-base transition-all duration-300 ${gameFilter === 'android'
                                ? 'bg-brand-accent text-white ring-2 ring-brand-highlight shadow-md'
                                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                                }`}
                        >
                            Mobile
                        </button>
                        <button
                            onClick={() => setGameFilter('unique')}
                            className={`px-6 py-2.5 rounded-full font-bold text-base transition-all duration-300 ${gameFilter === 'unique'
                                ? 'bg-brand-accent text-white ring-2 ring-brand-highlight shadow-md'
                                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                                }`}
                        >
                            Unique(잼난것)
                        </button>
                    </div>

                    {/* Game Grid */}
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                        {filteredGames.map((game) => (
                            <div key={game.id} className="group relative bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-brand-accent/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_theme(colors.brand.accent)] hover:-translate-y-1">
                                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200 lg:aspect-none group-hover:opacity-100 lg:h-48 relative">
                                    <img
                                        src={game.thumbnail}
                                        alt={game.title}
                                        className="h-full w-full object-cover object-center lg:h-full lg:w-full transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                                        <button
                                            onClick={() => handlePlay(game)}
                                            className="bg-brand-accent hover:bg-brand-highlight text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-brand-accent/20 text-sm"
                                        >
                                            <Play fill="currentColor" size={16} />
                                            Play Now
                                        </button>
                                    </div>
                                    <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
                                        {game.isNew && (
                                            <span className="inline-flex items-center rounded-full bg-brand-highlight px-2.5 py-1 text-xs font-bold text-white shadow-lg shadow-brand-highlight/40 ring-1 ring-white/20 animate-pulse">
                                                NEW
                                            </span>
                                        )}
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset backdrop-blur-md ${game.type === 'android'
                                            ? 'bg-green-500/10 text-green-400 ring-green-500/20'
                                            : game.type === 'Unique'
                                                ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20'
                                                : 'bg-blue-500/10 text-blue-400 ring-blue-500/20'
                                            }`}>
                                            {game.type === 'android' ? <Smartphone size={10} /> : <Globe size={10} />}
                                            {game.type === 'android' ? 'Android' : game.type === 'Unique' ? 'Unique' : 'Desktop/Mobile'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-brand-accent transition-colors">
                                                <a href="#" onClick={(e) => { e.preventDefault(); handlePlay(game); }}>
                                                    <span aria-hidden="true" className="absolute inset-0" />
                                                    {game.title}
                                                </a>
                                            </h3>
                                            <p className="mt-1 text-xs text-gray-400 line-clamp-2">{game.description}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                        <Gamepad2 size={12} />
                                        <span>{game.type === 'android' ? 'Store Download' : 'Instant Play'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            )}

            <footer className="mt-20 border-t border-slate-800 py-10">
                <div className="text-center text-slate-500 text-sm flex flex-col items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} ant@IT. All rights reserved.</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <a href="/about.html" target="_blank" className="hover:text-brand-accent transition-colors">About Us</a>
                        <a href="/privacy.html" target="_blank" className="hover:text-brand-accent transition-colors">Privacy Policy</a>
                        <a href="/terms.html" target="_blank" className="hover:text-brand-accent transition-colors">Terms of Service</a>
                        <span className="text-slate-500">Contact Us: WeListenToCustomer@gmail.com</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play/:id" element={<GamePlayer />} />
            <Route path="/devlog" element={<Home />} />
            <Route path="/devlog/:slug" element={<DevLogDetail />} />
            <Route path="/post/:id" element={<Home />} />
        </Routes>
    );
}

export default App;
