import React, { useState, useEffect } from 'react';
import { Play, Smartphone, Globe, Gamepad2, ExternalLink } from 'lucide-react';

function App() {
    const [games, setGames] = useState([]);

    useEffect(() => {
        fetch('/data/games.json')
            .then(res => res.json())
            .then(data => setGames(data))
            .catch(err => console.error("Failed to load games:", err));
    }, []);

    const handlePlay = (game) => {
        window.open(game.url, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-brand-accent selection:text-white pb-20">

            {/* Hero Section */}
            <header className="relative overflow-hidden bg-slate-900 py-20 sm:py-32">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-accent to-brand-highlight opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                </div>

                <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
                    <div className="mx-auto max-w-2xl">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-brand-highlight to-brand-accent mb-4">
                            GameAnt's PlayGround
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-300">
                            Infinite Fun, One Place. Play instant games or clear missions on your phone.
                        </p>
                    </div>
                </div>
            </header>

            {/* Game Grid */}
            <main className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {games.map((game) => (
                        <div key={game.id} className="group relative bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-brand-accent/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_theme(colors.brand.accent)] hover:-translate-y-1">

                            {/* Thumbnail Container */}
                            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200 lg:aspect-none group-hover:opacity-100 lg:h-60 relative">
                                <img
                                    src={game.thumbnail}
                                    alt={game.title}
                                    className="h-full w-full object-cover object-center lg:h-full lg:w-full transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                                    <button
                                        onClick={() => handlePlay(game)}
                                        className="bg-brand-accent hover:bg-brand-highlight text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-brand-accent/20"
                                    >
                                        <Play fill="currentColor" size={20} />
                                        Play Now
                                    </button>
                                </div>

                                {/* Type Badge */}
                                <div className="absolute top-4 right-4">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset backdrop-blur-md ${game.type === 'android'
                                            ? 'bg-green-500/10 text-green-400 ring-green-500/20'
                                            : 'bg-blue-500/10 text-blue-400 ring-blue-500/20'
                                        }`}>
                                        {game.type === 'android' ? <Smartphone size={12} /> : <Globe size={12} />}
                                        {game.type === 'android' ? 'Android' : 'Web Browser'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-brand-accent transition-colors">
                                            <a href="#" onClick={(e) => { e.preventDefault(); handlePlay(game); }}>
                                                <span aria-hidden="true" className="absolute inset-0" />
                                                {game.title}
                                            </a>
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-400 line-clamp-2">{game.description}</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-mono">
                                    <Gamepad2 size={14} />
                                    <span>{game.type === 'html' ? 'Instant Play' : 'Store Download'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="mt-20 border-t border-slate-800 py-10">
                <div className="text-center text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} GameAnt's PlayGround. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

export default App;
