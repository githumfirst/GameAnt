import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize2, Minimize2, Smartphone, Download, Calendar, User, Info } from 'lucide-react';

const GamePlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, []);

    useEffect(() => {
        fetch('/data/games.json')
            .then(res => res.json())
            .then(data => {
                const foundGame = data.find(g => g.id === id);
                if (foundGame) {
                    setGame(foundGame);
                } else {
                    console.error("Game not found");
                    navigate('/'); // Redirect to home if game not found
                }
            })
            .catch(err => console.error("Failed to load games:", err));
    }, [id, navigate]);

    const toggleFullScreen = async () => {
        if (!document.fullscreenElement) {
            try {
                await document.documentElement.requestFullscreen();
                // Lock to portrait on mobile (if supported)
                if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
                    await window.screen.orientation.lock("portrait").catch(err => {
                        // Consistently ignore errors - desktop browsers or unsupported devices 
                        // will reject this promise, which is expected behavior.
                        console.log("Orientation lock not supported or failed:", err);
                    });
                }
            } catch (err) {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            }
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                // Unlock orientation when exiting
                if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
                    try {
                        window.screen.orientation.unlock();
                    } catch (e) {
                        // Ignore unlock errors
                    }
                }
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    };

    const scrollToInfo = () => {
        const infoSection = document.getElementById('game-info');
        if (infoSection) {
            infoSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (!game) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col text-slate-100 font-sans">
            {/* Header / Controls (Hidden in Full Screen) */}
            {!isFullScreen && (
                <div className="bg-slate-900 p-4 flex justify-between items-center text-white border-b border-slate-800">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 hover:text-brand-accent transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Hub
                    </button>
                    <h1 className="text-lg font-bold hidden sm:block text-brand-accent">{game.title}</h1>
                    <button
                        onClick={scrollToInfo}
                        className="flex items-center gap-2 hover:text-brand-accent transition-colors mr-4"
                    >
                        <Info size={20} />
                        <span className="hidden sm:inline">Game Info</span>
                    </button>
                    {game.type === 'html' && (
                        <button
                            onClick={toggleFullScreen}
                            className="flex items-center gap-2 hover:text-brand-accent transition-colors"
                        >
                            {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                            <span className="hidden sm:inline">Full Screen</span>
                        </button>
                    )}
                </div>
            )}

            {/* Game Container (The "Hero" Content) */}
            <div className={`relative w-full bg-black ${isFullScreen ? 'h-screen' : 'aspect-video max-h-[80vh] mx-auto max-w-7xl'}`}>

                {game.type === 'html' ? (
                    // HTML5 Game Iframe
                    <iframe
                        src={game.url}
                        title={game.title}
                        className="w-full h-full border-0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                ) : (
                    // Android Game "Download" Call-to-Action
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-center p-8 relative overflow-hidden">
                        {/* Background Effect */}
                        <div className="absolute inset-0 opacity-20 bg-cover bg-center blur-sm" style={{ backgroundImage: `url(${game.thumbnail})` }}></div>

                        <div className="relative z-10 max-w-lg bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-2xl">
                            <img src={game.thumbnail} alt={game.title} className="w-24 h-24 rounded-2xl mx-auto mb-6 shadow-lg" />
                            <h2 className="text-2xl font-bold mb-2">{game.title}</h2>
                            <p className="text-slate-300 mb-8">{game.description}</p>

                            <a
                                href={game.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                            >
                                <Smartphone size={24} />
                                Download on Play Store
                            </a>
                            <p className="mt-4 text-xs text-slate-500">Android Device Required</p>
                        </div>
                    </div>
                )}

                {/* Mobile Floating Full Screen Button (HTML only) */}
                {!isFullScreen && game.type === 'html' && (
                    <button
                        onClick={toggleFullScreen}
                        className="absolute bottom-4 right-4 bg-black/60 text-white p-2 rounded-full sm:hidden z-50 backdrop-blur-md border border-white/20"
                    >
                        <Maximize2 size={24} />
                    </button>
                )}
            </div>

            {/* Rich Content Section (CrazyGames Style) - Only visible when NOT full screen */}
            {!isFullScreen && (
                <div id="game-info" className="max-w-4xl mx-auto w-full px-6 py-12 space-y-12">

                    {/* AdSense Placeholder */}
                    <div className="w-full h-24 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 border border-slate-700 border-dashed">
                        <span>Advertisement Space</span>
                    </div>

                    {/* Main Description */}
                    <section className="prose prose-invert max-w-none">
                        <h2 className="text-3xl font-bold text-white mb-6 border-b border-slate-800 pb-4">About {game.title}</h2>
                        <div className="flex flex-col md:flex-row gap-8 mb-8">
                            <div className="flex-1">
                                <p className="text-slate-300 text-lg leading-relaxed">{game.long_description || game.description}</p>
                            </div>

                            {/* Meta Data Box */}
                            <div className="w-full md:w-64 bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Game Info</h3>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-center gap-3">
                                        <User size={16} className="text-brand-accent" />
                                        <span className="text-slate-300">{game.author || 'GameAnt Studio'}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Calendar size={16} className="text-brand-accent" />
                                        <span className="text-slate-300">{game.last_updated || '2024'}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Smartphone size={16} className="text-brand-accent" />
                                        <span className="text-slate-300">{game.type === 'html' ? 'Browser (HTML5)' : 'Android App'}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* How to Play & Controls */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-brand-accent rounded-full inline-block"></span>
                                How to Play
                            </h3>
                            <p className="text-slate-300 leading-relaxed mb-4">
                                {game.instructions || "Follow the on-screen instructions to play."}
                            </p>
                            {game.controls && (
                                <div className="mt-4 bg-slate-900 p-4 rounded-lg">
                                    <h4 className="text-sm font-bold text-slate-400 mb-2">Controls</h4>
                                    <p className="text-slate-300 font-mono text-sm">{game.controls}</p>
                                </div>
                            )}
                        </section>

                        <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-brand-highlight rounded-full inline-block"></span>
                                Game Features
                            </h3>
                            <ul className="space-y-2">
                                {(game.features || ["Fun gameplay", "Challenging levels", "High score tracking"]).map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    {/* Bottom AdSense Placeholder */}
                    <div className="w-full h-24 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 border border-slate-700 border-dashed">
                        <span>Advertisement Space</span>
                    </div>

                </div>
            )}
        </div>
    );
};

export default GamePlayer;
