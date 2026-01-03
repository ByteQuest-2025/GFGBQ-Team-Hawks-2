import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
    userDisplayName: string;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userDisplayName, activeTab, setActiveTab, onLogout }) => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Dashboard', id: 'Overview' },
        { name: 'Calendar', id: 'Calendar' },
        { name: 'Copilot', id: 'Copilot' }
    ];

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5 h-20 transition-all">
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

                {/* LEFT: Logo - Fixed Width for Zero Shift */}
                <div className="flex items-center gap-2 group cursor-pointer w-64" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-[#FACC15] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.3)] group-hover:shadow-[0_0_40px_rgba(250,204,21,0.5)] transition-all duration-300">
                        <ShieldCheck className="text-black w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">TaxAlly.</span>
                </div>

                {/* CENTER: Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <button
                            key={link.name}
                            onClick={() => setActiveTab(link.id)}
                            className={`relative text-sm font-medium transition-all duration-200 tracking-wide hover:opacity-100 ${activeTab === link.id
                                ? 'text-white opacity-100 font-semibold'
                                : 'text-white/70 hover:text-[#FACC15]'
                                }`}
                        >
                            {link.name}
                            {activeTab === link.id && (
                                <motion.div
                                    layoutId="nav-underline"
                                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FACC15] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </nav>

                {/* RIGHT: Status & User */}
                <div className="flex items-center gap-6 justify-end w-64">
                    {/* Rules Live Pill - Updated Styling */}
                    <div className="hidden lg:flex items-center gap-2 bg-[#171717] px-3 py-1.5 rounded-full border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-white">2026 Rules Live</span>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-[#9CA3AF] leading-tight font-medium">Signed in as</p>
                            <p className="text-sm font-bold text-white leading-tight truncate max-w-[100px]">{userDisplayName.split(' ')[0]}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#FACC15] flex items-center justify-center text-black font-extrabold text-lg shadow-[0_0_10px_rgba(250,204,21,0.2)] shrink-0">
                            {userDisplayName.charAt(0)}
                        </div>

                        <button
                            onClick={onLogout}
                            className="p-2 text-[#9CA3AF] hover:text-white transition-colors rounded-full hover:bg-white/5"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>

                        <button className="md:hidden text-white ml-2" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-lg flex flex-col p-6"
                    >
                        <div className="flex justify-end mb-8">
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white">
                                <X className="w-8 h-8" />
                            </button>
                        </div>
                        <nav className="flex flex-col gap-8 text-center mt-10">
                            {navLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => { setActiveTab(link.id); setMobileMenuOpen(false); }}
                                    className="text-2xl font-bold text-white hover:text-[#FACC15] transition-colors"
                                >
                                    {link.name}
                                </button>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
