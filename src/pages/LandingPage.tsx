import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Calculator, X, ArrowRight, ShieldCheck, Zap, Heart, TrendingUp, BarChart3, PieChart, Activity, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface LandingPageProps {
    isLoggedIn: boolean;
    user: any;
    onSignInClick: () => void;
    onLogoutClick: () => void;
    onResetDemo: () => void;
}

export function LandingPage({ isLoggedIn, user, onSignInClick, onLogoutClick, onResetDemo }: LandingPageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [income, setIncome] = useState('');
    const [tax, setTax] = useState<number | null>(null);
    const navigate = useNavigate();

    const calculateTax = () => {
        const inc = parseFloat(income);
        if (!isNaN(inc)) {
            setTax(inc * 0.08);
        }
    };

    const userName = user?.fullName?.split(' ')[0] || 'User';

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden font-sans">

            {/* NAVIGATION */}
            <nav className="fixed w-full z-50 top-0 left-0 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button onClick={onResetDemo} className="flex items-center gap-2 group cursor-pointer z-50">
                        <div className="w-10 h-10 bg-[#FACC15] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.3)] group-hover:shadow-[0_0_40px_rgba(250,204,21,0.5)] transition-all duration-300">
                            <ShieldCheck className="text-black w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">TaxAlly</span>
                    </button>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#" className="text-[#94A3B8] hover:text-white transition-colors text-sm font-medium">Compliance AI</a>
                        <a href="#" className="text-[#94A3B8] hover:text-white transition-colors text-sm font-medium">Tax Health</a>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-semibold text-green-400">2026 Rules Live</span>
                        </div>

                        <div className="flex items-center gap-4">
                            {isLoggedIn ? (
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-[#94A3B8]">Signed in as</p>
                                        <p className="text-sm font-bold text-white">{userName}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-[#262626] border border-white/10 flex items-center justify-center text-[#FACC15] font-bold text-lg">
                                        {userName.charAt(0)}
                                    </div>
                                    <button onClick={onLogoutClick} className="text-[#94A3B8] hover:text-white transition-colors cursor-pointer z-50">
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={onSignInClick}
                                        className="text-[#94A3B8] hover:text-white text-sm font-medium transition-colors cursor-pointer z-50"
                                    >
                                        Sign In
                                    </button>
                                    {/* SIGN UP BUTTON - Uses Link to navigate to /onboard */}
                                    <Link to="/onboard">
                                        <button className="bg-[#FACC15] text-black px-6 py-2.5 rounded-full font-semibold hover:bg-yellow-300 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.3)] cursor-pointer z-50">
                                            Sign Up
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-80px)]">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FACC15]/10 rounded-full blur-[128px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />

                <AnimatePresence mode="wait">
                    {/* VISUALS */}
                    <motion.div
                        key={isLoggedIn ? "auth-visual" : "public-visual"}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative order-2 lg:order-1"
                    >
                        <div className="relative mx-auto border-gray-800 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-[0_0_40px_rgba(250,204,21,0.25)] overflow-hidden flex flex-col">
                            <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>

                            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-[#171717] relative flex flex-col">
                                {isLoggedIn ? (
                                    <div className="flex-1 bg-[#0A0A0A] p-6 relative">
                                        <div className="flex items-center justify-between mb-8 mt-8">
                                            <div className="text-white font-bold text-lg">My Tax Health</div>
                                            <Activity className="text-green-500 w-5 h-5 animate-pulse" />
                                        </div>
                                        <div className="flex justify-center mb-8">
                                            <div className="w-40 h-40 rounded-full border-8 border-[#262626] flex items-center justify-center relative">
                                                <div className="absolute inset-0 rounded-full border-8 border-t-green-500 border-r-green-500 border-b-transparent border-l-transparent rotate-45"></div>
                                                <div className="text-center">
                                                    <div className="text-4xl font-bold text-white">96%</div>
                                                    <div className="text-xs text-green-400 font-medium">EXCELLENT</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="bg-[#262626] p-4 rounded-xl border border-white/5 flex items-center gap-4">
                                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><PieChart size={20} /></div>
                                                <div>
                                                    <div className="text-xs text-[#94A3B8]">GST Filed</div>
                                                    <div className="text-sm font-bold text-white">Q3 Pending</div>
                                                </div>
                                            </div>
                                            <div className="bg-[#262626] p-4 rounded-xl border border-white/5 flex items-center gap-4">
                                                <div className="p-2 bg-[#FACC15]/20 rounded-lg text-[#FACC15]"><BarChart3 size={20} /></div>
                                                <div>
                                                    <div className="text-xs text-[#94A3B8]">Tax Saved</div>
                                                    <div className="text-sm font-bold text-white">₹ 42,000</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <video
                                            className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-lighten"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            src="https://cdn.pixabay.com/video/2021/04/12/70860-537449767_large.mp4"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A]/80"></div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* CONTENT */}
                    <motion.div
                        key={isLoggedIn ? "auth-text" : "public-text"}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="order-1 lg:order-2 text-center lg:text-left"
                    >
                        {isLoggedIn ? (
                            <>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold mb-6">
                                    <Check size={14} /> Profile Verified
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
                                    Welcome back, <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] to-white">{userName}! 👋</span>
                                </h1>
                                <p className="text-xl text-[#94A3B8] max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed">
                                    Your tax health score is optimal. You have <span className="text-white font-bold">2 pending actions</span> for this quarter.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                    <Link to="/dashboard" className="w-full sm:w-auto">
                                        <button className="w-full sm:w-auto bg-[#FACC15] text-black px-8 py-4 rounded-full font-bold hover:bg-yellow-300 transition-all hover:scale-105 shadow-[0_0_20px_rgba(250,204,21,0.3)] flex items-center justify-center gap-2 z-50 cursor-pointer">
                                            Go to Dashboard <ArrowRight size={18} />
                                        </button>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/20 text-[#FACC15] text-xs font-semibold mb-6">
                                    <Zap size={14} className="fill-[#FACC15]" />
                                    Zero Penalties, Guaranteed.
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
                                    Tax Compliance <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] to-white">on Autopilot.</span>
                                </h1>
                                <p className="text-xl text-[#94A3B8] max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed">
                                    The intelligent copilot for micro-businesses. We handle the complexity so you can focus on building your empire.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                    {/* GET STARTED BUTTON - Link to Onboard */}
                                    <Link to="/onboard" className="w-full sm:w-auto">
                                        <button className="w-full sm:w-auto bg-[#FACC15] text-black px-8 py-4 rounded-full font-bold hover:bg-yellow-300 transition-all hover:scale-105 shadow-[0_0_20px_rgba(250,204,21,0.3)] flex items-center justify-center gap-2 z-50 cursor-pointer">
                                            Get Started <ArrowRight size={18} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full sm:w-auto px-8 py-4 rounded-full font-bold border border-[#FACC15] text-[#FACC15] hover:bg-[#FACC15]/10 transition-all flex items-center justify-center gap-2 z-50 cursor-pointer"
                                    >
                                        <Calculator size={18} /> Check Tax Rate
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* WHY TAXALLY */}
            {!isLoggedIn && (
                <section className="py-24 bg-[#171717]/30 border-y border-white/5">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why TaxAlly?</h2>
                            <p className="text-[#94A3B8] max-w-2xl mx-auto">We built this specifically for the creators, the coders, and the solopreneurs who hate paperwork.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:border-[#FACC15]/50 transition-colors group">
                                <div className="w-14 h-14 bg-[#FACC15]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Heart className="text-[#FACC15] w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Ditch the Jargon</h3>
                                <p className="text-[#94A3B8] leading-relaxed">We translate scary tax laws into simple, actionable steps like "Upload Invoice" or "Pay Now".</p>
                            </div>
                            <div className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:border-[#FACC15]/50 transition-colors group">
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="text-blue-400 w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Zero-Penalty Promise</h3>
                                <p className="text-[#94A3B8] leading-relaxed">Our real-time copilot monitors your deadlines 24/7. Never pay a late fee again.</p>
                            </div>
                            <div className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:border-[#FACC15]/50 transition-colors group">
                                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="text-green-400 w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Freelancer Friendly</h3>
                                <p className="text-[#94A3B8] leading-relaxed">No expensive accountants needed. Built for micro-businesses and gig workers from day one.</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* TAX MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#171717] border border-white/10 w-full max-w-md rounded-3xl p-8 relative shadow-2xl"
                        >
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-[#94A3B8] hover:text-white">
                                <X size={24} />
                            </button>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-[#FACC15]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#FACC15]">
                                    <Calculator size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Simulate Your Tax</h3>
                                <p className="text-[#94A3B8] text-sm">See how presumptive taxation saves you money.</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">Annual Turnover (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">₹</span>
                                        <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] outline-none transition-all" placeholder="e.g. 1500000" />
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {tax !== null && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-xl p-4">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm text-[#94A3B8]">Presumptive Profit (8%)</span>
                                                <span className="text-lg font-bold text-white">₹{tax.toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-[#94A3B8]">*You only pay tax on this amount, not your total turnover!*</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <button onClick={calculateTax} className="w-full bg-[#FACC15] text-black font-bold py-4 rounded-xl hover:bg-yellow-300 transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                                    {tax !== null ? 'Recalculate' : 'Calculate Profit'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
