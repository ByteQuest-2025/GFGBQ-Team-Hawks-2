import { useState } from 'react';
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
    GST: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    TDS: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Payroll: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    TCS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export function Calendar() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Jan 2026
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showSyncToast, setShowSyncToast] = useState(false);

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
        return day === 3 && currentDate.getMonth() === 0 && currentDate.getFullYear() === 2026;
    };

    const renderCalendarDays = () => {
        const grid = [];
        for (let i = 0; i < firstDay; i++) {
            grid.push(<div key={`empty-${i}`} className="h-32 bg-[#1a1a1a]/50 border-b border-r border-[#262626]"></div>);
        }

        for (let day = 1; day <= days; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daysEvents = EVENTS.filter(e => e.date === dateStr);

            grid.push(
                <div
                    key={day}
                    className={`h-32 border-b border-r border-[#262626] p-2 transition-colors hover:bg-[#262626]/50 relative group ${isToday(day) ? 'bg-[#FACC15]/5' : 'bg-transparent'}`}
                    onClick={() => daysEvents.length > 0 && setSelectedEvent(daysEvents[0])}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-[#FACC15] text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400'}`}>
                            {day}
                        </span>
                        {daysEvents.length > 0 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-pulse shadow-[0_0_8px_#FACC15]"></div>
                        )}
                    </div>

                    <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                        {daysEvents.map(ev => (
                            <div key={ev.id} className={`text-[10px] font-semibold px-2 py-1 rounded border truncate cursor-pointer shadow-sm hover:brightness-110 transition-all ${CATEGORIES[ev.type as keyof typeof CATEGORIES] || CATEGORIES['Other']}`}>
                                {ev.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return grid;
    };

    return (
        <div className="min-h-screen w-full bg-[#0A0A0A] text-white font-sans overflow-x-hidden">

            {/* --- HEADER --- */}
            <nav className="fixed w-full z-50 top-0 left-0 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-[1700px] mx-auto px-6 h-20 flex items-center justify-between">

                    {/* Left: Logo */}
                    <button onClick={handleReset} className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-10 h-10 bg-[#FACC15] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.2)] group-hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all">
                            <ShieldCheck className="text-black w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">TaxAlly.</span>
                    </button>

                    {/* Center: Navigation */}
                    <div className="hidden md:flex items-center bg-[#171717] rounded-full p-1 border border-white/10">
                        <Link to="/dashboard" className="px-6 py-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium flex items-center gap-2">
                            <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <div className="px-6 py-2 rounded-full text-[#FACC15] bg-[#FACC15]/10 border border-[#FACC15]/20 transition-all text-sm font-bold flex items-center gap-2 relative">
                            <CalendarIcon size={16} /> Calendar
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#FACC15] rounded-full shadow-[0_0_10px_#FACC15]"></div>
                        </div>
                        <Link to="/copilot" className="px-6 py-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium flex items-center gap-2">
                            <Bot size={16} /> Copilot
                        </Link>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-semibold text-green-400">Rules Live</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 flex items-center gap-2 text-sm font-medium"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-[1700px] mx-auto p-6 pt-28 space-y-8">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Tax Calendar</h1>
                        <p className="text-gray-400 mt-1">Manage your compliance timeline.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-3 bg-[#171717] border border-white/10 rounded-xl hover:bg-[#262626] text-gray-400 hover:text-white transition-all">
                            <Filter size={18} />
                        </button>
                        <button className="p-3 bg-[#171717] border border-white/10 rounded-xl hover:bg-[#262626] text-gray-400 hover:text-white transition-all">
                            <Search size={18} />
                        </button>
                        <button
                            onClick={handleSync}
                            className="flex items-center gap-2 px-4 py-3 bg-[#171717] border border-white/10 rounded-xl hover:border-[#FACC15]/50 hover:text-[#FACC15] text-gray-300 font-medium transition-all"
                        >
                            <RefreshCw size={18} className={isSyncing ? "animate-spin text-[#FACC15]" : ""} />
                            <span>{isSyncing ? "Syncing..." : "Sync Portal"}</span>
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-[#FACC15] hover:bg-yellow-400 text-black rounded-xl font-bold shadow-[0_0_20px_rgba(250,204,21,0.2)] transition-all active:scale-95">
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
                        {/* Mini Calendar */}
                        <div className="bg-[#171717] p-6 rounded-3xl border border-[#262626] shadow-xl shadow-black/20">
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-bold text-white">January 2026</span>
                                <div className="flex gap-2 text-gray-500">
                                    <ChevronLeft size={16} className="hover:text-white cursor-pointer" />
                                    <ChevronRight size={16} className="hover:text-white cursor-pointer" />
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-y-4 text-center text-xs text-gray-500 mb-2">
                                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                            </div>
                            <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center text-sm font-medium text-gray-300">
                                {Array.from({ length: 31 }, (_, i) => (
                                    <span key={i} className={`h-7 w-7 flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer ${i === 2 ? 'bg-[#FACC15] text-black shadow-lg shadow-yellow-500/20' : ''} ${[6, 10, 14, 19, 29].includes(i) ? 'relative' : ''}`}>
                                        {i + 1}
                                        {[6, 10, 14, 19, 29].includes(i) && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full"></span>}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming List */}
                        <div className="bg-[#171717] p-6 rounded-3xl border border-[#262626] shadow-xl shadow-black/20 flex-1 flex flex-col">
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                <Bell size={16} className="text-[#FACC15]" /> Upcoming
                            </h3>
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                                {EVENTS.map((ev) => (
                                    <div key={ev.id} onClick={() => setSelectedEvent(ev)} className="group p-4 rounded-2xl bg-[#0A0A0A] border border-[#262626] hover:border-[#FACC15]/50 hover:bg-[#FACC15]/5 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${CATEGORIES[ev.type as keyof typeof CATEGORIES]}`}>
                                                {ev.type}
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">{ev.date.split('-')[2]} Jan</span>
                                        </div>
                                        <h4 className="font-bold text-gray-200 group-hover:text-white transition-colors">{ev.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ev.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* --- MAIN CALENDAR GRID --- */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-3 bg-[#171717] rounded-3xl border border-[#262626] shadow-xl shadow-black/20 flex flex-col overflow-hidden h-[calc(100vh-220px)]"
                    >
                        <div className="p-6 border-b border-[#262626] flex items-center justify-between bg-[#171717] z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={24} className="text-white" /></button>
                                <h2 className="text-2xl font-bold text-white min-w-[200px] text-center">
                                    {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                </h2>
                                <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={24} className="text-white" /></button>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span> GST</div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span> TDS</div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]"></span> TCS</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 border-b border-[#262626] bg-[#0A0A0A] text-gray-500 text-sm font-bold uppercase tracking-widest text-center py-4">
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

                {/* --- COPILOT INSIGHT --- */}
                <div className="fixed bottom-8 right-8 z-40">
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-[#171717]/90 backdrop-blur-xl text-white p-5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 max-w-md ring-1 ring-white/5"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                            <Sparkles size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Copilot Active</p>
                            <p className="text-sm text-gray-300 leading-snug">
                                3 filings this month. I've prepared drafts for <span className="text-white font-bold">GSTR-3B</span>.
                            </p>
                        </div>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors self-start -mt-2 -mr-2"><X size={16} className="text-gray-500 hover:text-white" /></button>
                    </motion.div>
                </div>

            </div>

            {/* --- DRAWER --- */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-[100] flex justify-end" onClick={() => setSelectedEvent(null)}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md bg-[#171717] h-full shadow-2xl border-l border-white/10 p-8 flex flex-col"
                        >
                            <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>

                            <div className="mt-8 mb-8">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4 border ${CATEGORIES[selectedEvent.type as keyof typeof CATEGORIES]}`}>
                                    <AlertCircle size={14} /> {selectedEvent.type}
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">{selectedEvent.title}</h2>
                                <p className="text-gray-400">Due Date: <span className="text-white font-semibold">{new Date(selectedEvent.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span></p>
                            </div>

                            <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-white/10 mb-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FACC15]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-400 text-sm font-medium">Estimated Liability</span>
                                    <span className="text-2xl font-bold text-white tracking-tight">{selectedEvent.amount}</span>
                                </div>
                                <div className="h-2 bg-[#262626] rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-[#FACC15] rounded-full shadow-[0_0_10px_#FACC15]"></div>
                                </div>
                                <div className="flex justify-between items-end mt-4">
                                    <span className="text-xs text-gray-500">Calculated from 42 Invoices</span>
                                    <span className="text-xs text-[#FACC15] font-bold cursor-pointer hover:underline">View Breakdown</span>
                                </div>
                            </div>

                            <div className="space-y-4 mt-auto">
                                <button className="w-full py-4 bg-[#FACC15] hover:bg-yellow-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.2)] transition-all flex items-center justify-center gap-2">
                                    <FileText size={20} /> File Now
                                </button>
                                <button className="w-full py-4 bg-transparent border border-white/10 hover:bg-white/5 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                                    <Bell size={20} /> Remind Me Later
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
        `}</style>

        </div>
    );
}
