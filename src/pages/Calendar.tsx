import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Bell,
    RefreshCw,
    CheckCircle2,
    FileText,
    AlertCircle,
    Search,
    Filter,
    Sparkles,
    X,
    ShieldCheck,
    LogOut,
    LayoutDashboard,
    Bot
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

// --- Mock Data ---
const EVENTS = [
    { id: 1, date: '2026-01-07', title: 'TDS Payment', type: 'TDS', amount: '₹12,400', status: 'Pending', description: 'Deducted on payments to contractors.' },
    { id: 2, date: '2026-01-11', title: 'GSTR-1 Filing', type: 'GST', amount: 'N/A', status: 'Pending', description: 'Outward supplies details for Dec 2025.' },
    { id: 3, date: '2026-01-15', title: 'PF Contribution', type: 'Payroll', amount: '₹8,500', status: 'Done', description: 'Employee Provident Fund for Dec.' },
    { id: 4, date: '2026-01-20', title: 'GSTR-3B Filing', type: 'GST', amount: '₹45,200', status: 'Pending', description: 'Monthly summary return.' },
    { id: 5, date: '2026-01-30', title: 'TCS Deposit', type: 'TCS', amount: '₹2,100', status: 'Pending', description: 'Tax collected at source.' },
];

const CATEGORIES = {
    GST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    TDS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Payroll: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    TCS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Other: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

// Dot colors for calendar view
const DOT_COLORS = {
    GST: 'bg-emerald-500',
    TDS: 'bg-amber-500',
    Payroll: 'bg-purple-500',
    TCS: 'bg-blue-500',
    Other: 'bg-gray-500',
};

export function Calendar() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Jan 2026
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showSyncToast, setShowSyncToast] = useState(false);

    // User Data Recovery
    const [userDisplayName, setUserDisplayName] = useState('User');
    useEffect(() => {
        const storedData = localStorage.getItem('onboarding_data');
        if (storedData) {
            try {
                const u = JSON.parse(storedData);
                setUserDisplayName(u.fullName || u.ownerName || 'User');
            } catch (e) { }
        }
    }, []);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            setShowSyncToast(true);
            setTimeout(() => setShowSyncToast(false), 3000);
        }, 2000);
    };

    const handleLogout = () => {
        localStorage.removeItem('user_session');
        navigate('/');
        window.location.reload();
    };

    const handleReset = () => {
        if (confirm("Reset Demo data?")) {
            localStorage.clear();
            navigate('/');
            window.location.reload();
        }
    };

    const isToday = (day: number) => {
        // Mocking Jan 3rd 2026 as today
        return day === 3 && currentDate.getMonth() === 0 && currentDate.getFullYear() === 2026;
    };

    const renderCalendarDays = () => {
        const grid = [];
        // Empty cells
        for (let i = 0; i < firstDay; i++) {
            grid.push(<div key={`empty-${i}`} className="min-h-[120px] bg-[#1a1a1a]/30 border-b border-r border-white/5"></div>);
        }

        // Days
        for (let day = 1; day <= days; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daysEvents = EVENTS.filter(e => e.date === dateStr);

            grid.push(
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: day * 0.01 }}
                    key={day}
                    className={`min-h-[120px] border-b border-r border-white/5 p-3 transition-colors hover:bg-white/5 relative group cursor-pointer ${isToday(day) ? 'bg-[#FACC15]/5' : 'bg-transparent'}`}
                    onClick={() => daysEvents.length > 0 && setSelectedEvent(daysEvents[0])}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-[#FACC15] text-black shadow-lg shadow-yellow-500/20 scale-110' : 'text-gray-400 group-hover:text-white'}`}>
                            {day}
                        </span>
                        {daysEvents.length > 0 && (
                            <div className="flex -space-x-1">
                                {daysEvents.map((ev, i) => (
                                    <div key={i} className={`w-2.5 h-2.5 rounded-full border border-[#0A0A0A] ${DOT_COLORS[ev.type as keyof typeof CATEGORIES] || 'bg-gray-500'}`}></div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-3 space-y-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                        {daysEvents.map(ev => (
                            <div key={ev.id} className={`text-[10px] uppercase font-bold px-2 py-1 rounded-[4px] border truncate shadow-sm transition-all hover:scale-105 ${CATEGORIES[ev.type as keyof typeof CATEGORIES] || CATEGORIES['Other']}`}>
                                {ev.title}
                            </div>
                        ))}
                    </div>
                </motion.div>
            );
        }
        return grid;
    };

    return (
        <div className="min-h-screen w-full bg-[#0A0A0A] text-white font-sans overflow-x-hidden selection:bg-[#FACC15] selection:text-black">

            {/* --- HEADER (Identical to Dashboard) --- */}
            <header className="fixed top-0 left-0 w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5 h-20 transition-all">
                <div className="max-w-[1700px] mx-auto px-6 h-full flex items-center justify-between">

                    {/* LEFT: Logo */}
                    <div className="flex items-center gap-2 group cursor-pointer w-64" onClick={handleReset}>
                        <div className="w-10 h-10 bg-[#FACC15] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.3)] group-hover:shadow-[0_0_40px_rgba(250,204,21,0.5)] transition-all duration-300">
                            <ShieldCheck className="text-black w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">TaxAlly.</span>
                    </div>

                    {/* CENTER: Navigation Tabs */}
                    {/* Note: In Dashboard, this was <nav>. Here we implement the buttons to Route. */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/dashboard" className="relative text-sm font-medium tracking-wide text-white/70 hover:text-[#FACC15] transition-colors">
                            Dashboard
                        </Link>
                        <button className="relative text-sm font-bold tracking-wide text-white cursor-default">
                            Calendar
                            <motion.div
                                layoutId="nav-underline"
                                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FACC15] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                            />
                        </button>
                        <Link to="/copilot" className="relative text-sm font-medium tracking-wide text-white/70 hover:text-[#FACC15] transition-colors">
                            Copilot
                        </Link>
                    </nav>

                    {/* RIGHT: Status & User */}
                    <div className="flex items-center gap-6 justify-end w-64">
                        {/* Rules Live Badge */}
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
                                onClick={handleLogout}
                                className="p-2 text-[#9CA3AF] hover:text-white transition-colors rounded-full hover:bg-white/5"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-[1700px] mx-auto p-6 pt-28 space-y-8">

                {/* Page Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                            <CalendarIcon className="w-8 h-8 text-[#FACC15]" /> Tax Calendar
                        </h1>
                        <p className="text-[#94A3B8] mt-2 text-lg">Stay compliant with upcoming filing deadlines.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-[#171717] border border-white/5 rounded-full pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#FACC15]/50 focus:ring-1 focus:ring-[#FACC15]/50 transition-all w-64"
                            />
                        </div>
                        <button
                            onClick={handleSync}
                            className="flex items-center gap-2 px-5 py-3 bg-[#171717] border border-white/10 rounded-full hover:border-[#FACC15]/50 hover:text-[#FACC15]/90 text-gray-300 font-medium transition-all"
                        >
                            <RefreshCw size={18} className={isSyncing ? "animate-spin text-[#FACC15]" : ""} />
                            <span>{isSyncing ? "Syncing..." : "Sync Portal"}</span>
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-[#FACC15] hover:bg-yellow-400 text-black rounded-full font-bold shadow-[0_0_20px_rgba(250,204,21,0.2)] transition-all active:scale-95">
                            <CalendarIcon size={18} /> Add Event
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* --- SIDEBAR --- */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 flex flex-col gap-6"
                    >
                        {/* Mini Calendar Card */}
                        <div className="bg-[#171717] p-6 rounded-[2rem] border border-white/5 shadow-xl shadow-black/20">
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-bold text-white text-lg">January 2026</span>
                                <div className="flex gap-2 text-gray-500">
                                    <button onClick={prevMonth} className="hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"><ChevronLeft size={18} /></button>
                                    <button onClick={nextMonth} className="hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"><ChevronRight size={18} /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-y-4 text-center text-xs text-[#94A3B8] font-bold mb-2">
                                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                            </div>
                            <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center text-sm font-medium text-gray-400">
                                {Array.from({ length: 31 }, (_, i) => (
                                    <span key={i} className={`h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer transition-all ${i === 2 ? 'bg-[#FACC15] text-black font-bold shadow-lg shadow-yellow-500/20' : ''} ${[6, 10, 14, 19, 29].includes(i) ? 'relative' : ''}`}>
                                        {i + 1}
                                        {[6, 10, 14, 19, 29].includes(i) && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full"></span>}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Feed (Dashboard Style) */}
                        <div className="bg-[#171717] p-6 rounded-[2rem] border border-white/5 flex-1 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                <Bell size={80} />
                            </div>
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2 z-10">
                                <Bell size={18} className="text-[#FACC15]" /> Upcoming
                            </h3>
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[500px] z-10">
                                {EVENTS.map((ev) => (
                                    <div key={ev.id} onClick={() => setSelectedEvent(ev)} className="group p-4 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-[#FACC15]/30 hover:bg-[#FACC15]/5 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${CATEGORIES[ev.type as keyof typeof CATEGORIES]}`}>
                                                {ev.type}
                                            </div>
                                            <span className="text-xs font-medium text-[#94A3B8] border border-white/5 px-2 py-0.5 rounded-full bg-[#171717]">{ev.date.split('-')[2]} Jan</span>
                                        </div>
                                        <h4 className="font-bold text-gray-200 group-hover:text-white transition-colors">{ev.title}</h4>
                                        <p className="text-xs text-[#94A3B8] mt-1 line-clamp-1 group-hover:text-gray-400 transition-colors">{ev.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* --- MAIN CALENDAR GRID --- */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-3 bg-[#171717] rounded-[2rem] border border-white/5 shadow-2xl flex flex-col overflow-hidden h-[calc(100vh-250px)]"
                    >
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#171717] z-10">
                            <div className="flex items-center gap-6">
                                <h2 className="text-3xl font-bold text-white tracking-tight min-w-[200px]">
                                    {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                </h2>
                                <div className="flex items-center gap-2 bg-[#0A0A0A] p-1 rounded-full border border-white/5">
                                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={20} className="text-white" /></button>
                                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={20} className="text-white" /></button>
                                </div>
                            </div>
                            <div className="flex items-center gap-5 text-sm font-medium text-[#94A3B8]">
                                <div className="flex items-center gap-2 bg-[#0A0A0A] px-3 py-1.5 rounded-full border border-white/5"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> GST</div>
                                <div className="flex items-center gap-2 bg-[#0A0A0A] px-3 py-1.5 rounded-full border border-white/5"><span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span> TDS</div>
                                <div className="flex items-center gap-2 bg-[#0A0A0A] px-3 py-1.5 rounded-full border border-white/5"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span> TCS</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 border-b border-white/5 bg-[#0A0A0A] text-[#94A3B8] text-sm font-bold uppercase tracking-widest text-center py-5">
                            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentDate.toISOString()}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar bg-[#111]"
                            >
                                {renderCalendarDays()}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                </div>

                {/* --- COPILOT INSIGHT TOAST (Dashboard Style) --- */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="fixed bottom-8 right-8 z-40 bg-[#171717]/90 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] shadow-2xl flex items-center gap-5 max-w-sm"
                >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FACC15] to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                        <Bot size={24} className="text-black" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Copilot Update</p>
                        </div>
                        <p className="text-sm text-[#94A3B8] leading-snug">
                            3 deadlines approaching. I've drafted GSTR-3B for you.
                        </p>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors self-start -mt-2 -mr-2 text-[#94A3B8] hover:text-white"><X size={18} /></button>
                </motion.div>

            </div>

            {/* --- DETAILS OVERLAY --- */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-[100] flex justify-end" onClick={() => setSelectedEvent(null)}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md bg-[#171717] h-full shadow-2xl border-l border-white/10 p-8 flex flex-col"
                        >
                            <button onClick={() => setSelectedEvent(null)} className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>

                            <div className="mt-12 mb-8">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-6 border ${CATEGORIES[selectedEvent.type as keyof typeof CATEGORIES]}`}>
                                    <AlertCircle size={14} /> {selectedEvent.type}
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-3">{selectedEvent.title}</h2>
                                <p className="text-[#94A3B8]">Due Date: <span className="text-white font-semibold">{new Date(selectedEvent.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span></p>
                            </div>

                            <div className="bg-[#0A0A0A] rounded-3xl p-6 border border-white/10 mb-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FACC15]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[#94A3B8] text-sm font-medium">Estimated Liability</span>
                                    <span className="text-3xl font-bold text-white tracking-tight">{selectedEvent.amount}</span>
                                </div>
                                <div className="h-2 bg-[#262626] rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-[#FACC15] rounded-full shadow-[0_0_10px_#FACC15]"></div>
                                </div>
                                <div className="flex justify-between items-end mt-4">
                                    <span className="text-xs text-[#94A3B8]">Based on 42 Invoices</span>
                                    <span className="text-xs text-[#FACC15] font-bold cursor-pointer hover:underline">View Breakdown</span>
                                </div>
                            </div>

                            <div className="space-y-4 mt-auto">
                                <button className="w-full py-4 bg-[#FACC15] hover:bg-yellow-400 text-black font-bold rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.2)] transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                    <FileText size={20} /> File Now
                                </button>
                                <button className="w-full py-4 bg-transparent border border-white/10 hover:bg-white/5 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                                    <Bell size={20} /> Remind Me Later
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 5px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: #0A0A0A; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
        `}</style>

        </div>
    );
}
