import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Bell,
    RefreshCw,
    AlertCircle,
    Search,
    X,
    Bot,
    FileText,
    Plus,
    CheckCircle2,
    Clock,
    DollarSign,
    Tag,
    Type,
    Shield,
    Lock,
    Check,
    Loader
} from 'lucide-react';

// --- Mock Data ---
const MOCK_EVENTS = [
    { id: 1, date: '2026-01-07', title: 'TDS Payment', type: 'TDS', amount: '₹12,400', status: 'Pending', description: 'Deducted on payments to contractors.', priority: 'High' },
    { id: 2, date: '2026-01-11', title: 'GSTR-1 Filing', type: 'GST', amount: 'N/A', status: 'Pending', description: 'Outward supplies details for Dec 2025.', priority: 'High' },
    { id: 3, date: '2026-01-15', title: 'PF Contribution', type: 'Payroll', amount: '₹8,500', status: 'Done', description: 'Employee Provident Fund for Dec.', priority: 'Medium' },
    { id: 4, date: '2026-01-20', title: 'GSTR-3B Filing', type: 'GST', amount: '₹45,200', status: 'Pending', description: 'Monthly summary return.', priority: 'High' },
    { id: 5, date: '2026-01-30', title: 'TCS Deposit', type: 'TCS', amount: '₹2,100', status: 'Pending', description: 'Tax collected at source.', priority: 'Medium' },
];

const CATEGORIES: any = {
    GST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    TDS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Payroll: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    TCS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Vendor Payment': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'Business Meeting': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Other: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const DOT_COLORS: any = {
    GST: 'bg-emerald-500',
    TDS: 'bg-amber-500',
    Payroll: 'bg-purple-500',
    TCS: 'bg-blue-500',
    'Vendor Payment': 'bg-pink-500',
    'Business Meeting': 'bg-cyan-500',
    Other: 'bg-gray-500',
};

interface CalendarEvent {
    id: number;
    date: string;
    title: string;
    type: string;
    amount: string;
    status: string;
    description: string;
    priority: string;
}

export function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Jan 2026
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    // Sync Portal State
    const [syncStatus, setSyncStatus] = useState<'idle' | 'connecting' | 'authenticating' | 'fetching' | 'success' | 'failed'>('idle');
    const [lastSynced, setLastSynced] = useState<string | null>(null);
    const [syncToastMessage, setSyncToastMessage] = useState('');

    // Add Event Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        type: 'GST',
        date: '',
        amount: '',
        description: '',
        priority: 'Medium',
        reminder: false
    });

    // Load events from LocalStorage or fallback to Mock
    useEffect(() => {
        const storedEvents = localStorage.getItem('calendar_events');
        if (storedEvents) {
            setEvents(JSON.parse(storedEvents));
        } else {
            setEvents(MOCK_EVENTS);
            localStorage.setItem('calendar_events', JSON.stringify(MOCK_EVENTS));
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

    // --- Search Logic ---
    const filteredEvents = events.filter(ev => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            ev.title.toLowerCase().includes(query) ||
            ev.type.toLowerCase().includes(query) ||
            ev.date.includes(query)
        );
    });

    // --- Sync Portal Logic ---
    const handleSync = () => {
        if (syncStatus !== 'idle') return;

        // Phase 1: Connecting
        setSyncStatus('connecting');

        // Phase 2: Authenticating
        setTimeout(() => {
            setSyncStatus('authenticating');
        }, 1200);

        // Phase 3: Fetching
        setTimeout(() => {
            setSyncStatus('fetching');
        }, 2500);

        // Phase 4: Success & Data Update
        setTimeout(() => {
            setSyncStatus('success');
            setLastSynced('Just Now');
            setSyncToastMessage('✅ Sync Successful! 1 New Deadline synchronized from GST Portal.');

            // Add Mock "Synced" Event
            const newSyncedEvent: CalendarEvent = {
                id: Date.now(),
                date: '2026-01-25',
                title: 'Special Audit Task',
                type: 'Other',
                amount: 'TBD',
                status: 'Pending',
                description: 'Automatically imported from Government Portal.',
                priority: 'High'
            };

            const updated = [...events, newSyncedEvent];
            setEvents(updated);
            localStorage.setItem('calendar_events', JSON.stringify(updated));

            // Reset to Idle after showing success state
            setTimeout(() => {
                setSyncStatus('idle');
                setSyncToastMessage('');
            }, 4000);

        }, 4500);
    };

    const isToday = (day: number) => {
        return day === 3 && currentDate.getMonth() === 0 && currentDate.getFullYear() === 2026;
    };

    // --- Add Event Logic ---
    const handleAddEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewEvent(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEvent = () => {
        if (!newEvent.title || !newEvent.date) {
            alert("Please fill in at least Title and Date.");
            return;
        }

        const eventToSave: CalendarEvent = {
            id: Date.now(),
            title: newEvent.title,
            type: newEvent.type,
            date: newEvent.date,
            amount: newEvent.amount ? `₹${newEvent.amount}` : 'N/A',
            status: 'Pending',
            description: newEvent.description || 'No additional notes',
            priority: newEvent.priority
        };

        const updatedEvents = [...events, eventToSave];
        setEvents(updatedEvents);
        localStorage.setItem('calendar_events', JSON.stringify(updatedEvents));

        setShowAddModal(false);
        setNewEvent({ title: '', type: 'GST', date: '', amount: '', description: '', priority: 'Medium', reminder: false });

        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
    };

    const applyQuickPreset = (preset: string) => {
        const today = new Date().toISOString().split('T')[0];
        if (preset === 'Monthly GST') {
            setNewEvent({ ...newEvent, title: 'Monthly GST Filing', type: 'GST', priority: 'High', description: 'Regular monthly GSTR-3B filing.', date: today });
        } else if (preset === 'Quarterly Tax') {
            setNewEvent({ ...newEvent, title: 'Advance Tax Q4', type: 'TDS', priority: 'High', description: 'Quarterly advance tax payment.', date: today });
        } else if (preset === 'Rent') {
            setNewEvent({ ...newEvent, title: 'Office Rent Payment', type: 'Vendor Payment', priority: 'Medium', description: 'Monthly office rent.', date: today });
        }
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
            // Filter events for this day based on search query
            const daysEvents = filteredEvents.filter(e => e.date === dateStr);
            const isMatch = daysEvents.length > 0;
            const isFaded = searchQuery && !isMatch; // Fade out days that don't match query

            grid.push(
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isFaded ? 0.3 : 1 }}
                    transition={{ delay: day * 0.01 }}
                    key={day}
                    className={`min-h-[120px] border-b border-r border-white/5 p-3 transition-colors hover:bg-white/5 relative group cursor-pointer 
                        ${isToday(day) ? 'bg-[#FACC15]/5' : 'bg-transparent'}
                        ${(syncStatus === 'success' && day === 25) ? 'animate-pulse bg-green-500/10' : ''} 
                    `}
                    onClick={() => {
                        if (daysEvents.length > 0) setSelectedEvent(daysEvents[0]);
                    }}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-[#FACC15] text-black shadow-lg shadow-yellow-500/20 scale-110' : 'text-gray-400 group-hover:text-white'}`}>
                            {day}
                        </span>
                        {daysEvents.length > 0 && (
                            <div className="flex -space-x-1">
                                {daysEvents.map((ev, i) => (
                                    <div key={i} className={`w-2.5 h-2.5 rounded-full border border-[#0A0A0A] ${DOT_COLORS[ev.type] || 'bg-gray-500'}`}></div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-3 space-y-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                        {daysEvents.map(ev => (
                            <div key={ev.id} className={`text-[10px] uppercase font-bold px-2 py-1 rounded-[4px] border truncate shadow-sm transition-all hover:scale-105 ${CATEGORIES[ev.type] || CATEGORIES['Other']}`}>
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
        <div className="w-full text-white font-sans overflow-x-hidden selection:bg-[#FACC15] selection:text-black">

            <div className="space-y-8">

                {/* Page Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                            <CalendarIcon className="w-8 h-8 text-[#FACC15]" /> Tax Calendar
                        </h1>
                        <p className="text-[#94A3B8] mt-2 text-lg">Stay compliant with upcoming filing deadlines.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="bg-[#171717] border border-white/5 rounded-full pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#FACC15]/50 focus:ring-1 focus:ring-[#FACC15]/50 transition-all w-64"
                            />
                        </div>

                        {/* Sync Portal Button */}
                        <div className="relative group">
                            <button
                                onClick={handleSync}
                                disabled={syncStatus !== 'idle'}
                                className={`flex items-center gap-2 px-5 py-3 bg-[#171717] border rounded-full font-medium transition-all w-[180px] justify-center
                                    ${syncStatus === 'success' ? 'border-emerald-500/50 text-emerald-400' : 'border-white/10 hover:border-[#FACC15]/50 hover:text-[#FACC15]/90 text-gray-300'}
                                    ${syncStatus !== 'idle' ? 'opacity-90 cursor-not-allowed' : ''}
                                `}
                            >
                                {syncStatus === 'idle' && <><RefreshCw size={18} /> Sync Portal</>}
                                {syncStatus === 'connecting' && <><Shield size={18} className="animate-pulse text-blue-500" /> Connecting...</>}
                                {syncStatus === 'authenticating' && <><Lock size={18} className="text-amber-500" /> Verifying...</>}
                                {syncStatus === 'fetching' && <><Loader size={18} className="animate-spin text-[#FACC15]" /> Fetching...</>}
                                {syncStatus === 'success' && <><Check size={18} /> Synced</>}
                            </button>

                            {/* Security Tooltip */}
                            {syncStatus !== 'idle' && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-[10px] font-medium text-[#94A3B8] bg-black/80 px-2 py-1 rounded border border-white/5 backdrop-blur-sm">
                                    <Lock size={8} className="inline mr-1" /> Secured via 256-bit Encryption
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-[#FACC15] hover:bg-yellow-400 text-black rounded-full font-bold shadow-[0_0_20px_rgba(250,204,21,0.2)] transition-all active:scale-95"
                        >
                            <Plus size={18} /> Add Event
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* --- SIDEBAR (Mini Calendar) --- */}
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

                        {/* Upcoming Feed (Filtered by Search) */}
                        <div className="bg-[#171717] p-6 rounded-[2rem] border border-white/5 flex-1 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                <Bell size={80} />
                            </div>
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2 z-10">
                                <Bell size={18} className="text-[#FACC15]" />
                                {searchQuery ? 'Search Results' : 'Upcoming'}
                            </h3>
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[500px] z-10">
                                {filteredEvents.length === 0 ? (
                                    <p className="text-sm text-[#94A3B8] italic">No events found.</p>
                                ) : (
                                    filteredEvents.filter(e => new Date(e.date) >= new Date('2026-01-01')).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5).map((ev) => (
                                        <div key={ev.id} onClick={() => setSelectedEvent(ev)} className="group p-4 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-[#FACC15]/30 hover:bg-[#FACC15]/5 transition-all cursor-pointer">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${CATEGORIES[ev.type] || CATEGORIES.Other}`}>
                                                    {ev.type}
                                                </div>
                                                <span className="text-xs font-medium text-[#94A3B8] border border-white/5 px-2 py-0.5 rounded-full bg-[#171717]">{ev.date.split('-')[2]} Jan</span>
                                            </div>
                                            <h4 className="font-bold text-gray-200 group-hover:text-white transition-colors">{ev.title}</h4>
                                            <p className="text-xs text-[#94A3B8] mt-1 line-clamp-1 group-hover:text-gray-400 transition-colors">{ev.description}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* --- MAIN CALENDAR GRID --- */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-3 bg-[#171717] rounded-[2rem] border border-white/5 shadow-2xl flex flex-col overflow-hidden h-[calc(100vh-250px)] relative"
                    >
                        {/* Shimmer Overlay during Sync */}
                        {syncStatus === 'fetching' && (
                            <div className="absolute inset-0 z-50 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
                        )}

                        {/* Calendar Header inside Grid */}
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
                                {lastSynced && (
                                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                                        <RefreshCw size={10} /> Synced: {lastSynced}
                                    </span>
                                )}
                                <div className="flex items-center gap-2 bg-[#0A0A0A] px-3 py-1.5 rounded-full border border-white/5"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> GST</div>
                                <div className="flex items-center gap-2 bg-[#0A0A0A] px-3 py-1.5 rounded-full border border-white/5"><span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span> TDS</div>
                                <div className="flex items-center gap-2 bg-[#0A0A0A] px-3 py-1.5 rounded-full border border-white/5"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span> TCS</div>
                            </div>
                        </div>

                        {/* Days Header */}
                        <div className="grid grid-cols-7 border-b border-white/5 bg-[#0A0A0A] text-[#94A3B8] text-sm font-bold uppercase tracking-widest text-center py-5">
                            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                        </div>

                        {/* Days Grid */}
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

                {/* --- ADD EVENT MODAL --- */}
                <AnimatePresence>
                    {showAddModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAddModal(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                className="relative w-full max-w-2xl bg-[#171717] rounded-[2rem] border border-[#FACC15] shadow-2xl p-8 overflow-hidden"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <CalendarIcon className="text-[#FACC15]" /> Add New Event
                                        </h2>
                                        <p className="text-[#94A3B8] text-sm mt-1">Schedule a compliance task or payment.</p>
                                    </div>
                                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Quick Presets */}
                                <div className="flex gap-3 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                                    {['Monthly GST', 'Quarterly Tax', 'Rent'].map((preset) => (
                                        <button
                                            key={preset}
                                            onClick={() => applyQuickPreset(preset)}
                                            className="whitespace-nowrap px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-xl text-xs font-bold text-[#94A3B8] hover:text-white hover:border-[#FACC15]/50 transition-all flex items-center gap-2"
                                        >
                                            <Bot size={14} className="text-[#FACC15]" /> {preset}
                                        </button>
                                    ))}
                                </div>

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Title */}
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-2">Event Title</label>
                                        <div className="relative">
                                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
                                            <input
                                                type="text"
                                                name="title"
                                                value={newEvent.title}
                                                onChange={handleAddEventChange}
                                                placeholder="e.g. GST Filing for January"
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#FACC15] transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-2 flex items-center justify-between">
                                            Category
                                            <span className="flex items-center gap-1 text-[10px] text-[#FACC15] lowercase font-normal"><Bot size={10} /> ai suggestions on</span>
                                        </label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
                                            <select
                                                name="type"
                                                value={newEvent.type}
                                                onChange={handleAddEventChange}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#FACC15] transition-all appearance-none"
                                            >
                                                {Object.keys(CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-2">Date</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
                                            <input
                                                type="date"
                                                name="date"
                                                value={newEvent.date}
                                                onChange={handleAddEventChange}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#FACC15] transition-all scheme-dark"
                                            />
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-2">Amount (Optional)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
                                            <input
                                                type="number"
                                                name="amount"
                                                value={newEvent.amount}
                                                onChange={handleAddEventChange}
                                                placeholder="0.00"
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#FACC15] transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-2">Priority</label>
                                        <div className="flex gap-2">
                                            {['High', 'Medium', 'Low'].map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => setNewEvent({ ...newEvent, priority: p })}
                                                    className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${newEvent.priority === p ? 'bg-[#FACC15] text-black border-[#FACC15]' : 'bg-[#0A0A0A] text-[#94A3B8] border-white/10 hover:border-white/30'}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-2">Notes</label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-4 text-[#94A3B8] w-5 h-5" />
                                            <textarea
                                                name="description"
                                                value={newEvent.description}
                                                onChange={handleAddEventChange}
                                                rows={3}
                                                placeholder="Add details..."
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#FACC15] transition-all resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Toggle */}
                                    <div className="col-span-2 flex items-center gap-3 p-4 bg-[#0A0A0A] rounded-xl border border-white/5">
                                        <div
                                            onClick={() => setNewEvent({ ...newEvent, reminder: !newEvent.reminder })}
                                            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${newEvent.reminder ? 'bg-[#FACC15]' : 'bg-[#333]'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${newEvent.reminder ? 'left-7' : 'left-1'}`} />
                                        </div>
                                        <span className="text-sm font-medium text-white">Notify me via Copilot 24 hours before</span>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-4">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-4 bg-transparent border border-white/10 rounded-xl text-white font-bold hover:bg-white/5 transition-all outline-none"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEvent}
                                        className="flex-1 py-4 bg-[#FACC15] rounded-xl text-black font-bold hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                                    >
                                        Create Event
                                    </button>
                                </div>

                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* --- SUCCESS TOAST (Strategy 2) --- */}
                <AnimatePresence>
                    {showSuccessToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] bg-[#171717] border border-[#10B981] px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center gap-4"
                        >
                            <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center">
                                <CheckCircle2 className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white leading-tight">Success!</h4>
                                <p className="text-xs text-[#94A3B8]">Event successfully added to your calendar.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- SYNC TOAST (Strategy 3) --- */}
                <AnimatePresence>
                    {syncToastMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] bg-[#171717] border border-blue-500/30 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.15)] flex items-center gap-4"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <RefreshCw className="text-blue-400 w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white leading-tight">Sync Complete</h4>
                                <p className="text-xs text-[#94A3B8]">1 New Deadline synchronized from GST Portal.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- COPILOT INSIGHT TOAST (Existing) --- */}
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
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-6 border ${CATEGORIES[selectedEvent.type] || CATEGORIES['Other']}`}>
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

                            <div className="mb-8">
                                <h4 className="text-sm font-bold text-white mb-2">Notes</h4>
                                <p className="text-sm text-[#94A3B8] leading-relaxed">{selectedEvent.description}</p>
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
            
            @keyframes shimmer {
                0% { transform: translateX(-100%) skewX(-12deg); }
                100% { transform: translateX(200%) skewX(-12deg); }
            }
            .animate-shimmer {
                animation: shimmer 1.5s infinite;
            }
        `}</style>
        </div>
    );
}
