import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    Bot,
    Settings,
    Search,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    Zap,
    FileText,
    PieChart,
    Wallet,
    ArrowRight
} from 'lucide-react';
import { Header } from '../components/Header';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
    user?: any;
}

export function Dashboard({ user }: DashboardProps) {
    const { profile, obligations, deadlines, clearProfile, setProfile } = useStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');


    // 1. Dynamic Personalization (User Aspect)
    // Priority: Prop User > Store Profile > Fallback
    const userDisplayName = user?.fullName || profile?.ownerName || 'User';
    const firstName = userDisplayName.split(' ')[0];

    // Sync Store if user prop exists but store is empty (or mismatched)
    useEffect(() => {
        if (user && (!profile || profile.ownerName !== user.fullName)) {
            // Simplified profile init if missing
            setProfile({
                id: '1',
                name: 'My Business',
                type: 'freelancer',
                turnover: 'below_20L',
                ownerName: user.fullName,
                state: 'Delhi',
                email: user.email || '',
                hasGST: false,
                panNumber: '',
                createdAt: new Date()
            });
        }
    }, [user, profile, setProfile]);

    // Filter deadlines
    const upcomingDeadlines = deadlines.filter(d => d.status !== 'completed');
    const nextDeadline = upcomingDeadlines[0];

    // Stats
    const totalObligations = obligations.length;
    const completedObligations = obligations.filter(o =>
        deadlines.some(d => d.obligationId === o.id && d.status === 'completed')
    ).length;
    const complianceScore = Math.round((completedObligations / (totalObligations || 1)) * 100) || 85;

    const handleLogout = () => {
        clearProfile();
        // Force full reload or clear local storage if needed
        localStorage.removeItem('user_session');
        navigate('/');
        window.location.reload();
    };

    const sidebarItems = [
        { icon: LayoutDashboard, label: 'Overview', id: 'Overview' },
        { icon: CalendarIcon, label: 'Calendar', id: 'Calendar' },
        { icon: FileText, label: 'Invoices', id: 'Invoices' },
        { icon: PieChart, label: 'Reports', id: 'Reports' },
        { icon: Bot, label: 'Copilot', id: 'Copilot' },
        { icon: Settings, label: 'Settings', id: 'Settings' },
    ];

    const navLinks = [
        { name: 'Dashboard', id: 'Overview' },
        { name: 'Calendar', id: 'Calendar' },
        { name: 'Copilot', id: 'Copilot' }
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#FACC15] selection:text-black overflow-x-hidden pt-20">

            {/* Shared Header Component */}
            <Header
                userDisplayName={userDisplayName}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
            />

            <div className="max-w-7xl mx-auto px-6 flex gap-8">
                {/* 3. Sidebar-Header Structural Alignment */}
                {/* Logo top-left is aligned with content top-left via container px-6 */}
                {/* Added 'top-32' to push sidebar down slightly for breathing room */}
                <aside className="w-64 hidden lg:block sticky top-32 h-[calc(100vh-8rem)]">
                    <nav className="space-y-1 mb-12">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${activeTab === item.id
                                    ? 'text-[#FACC15] bg-[#171717] border border-white/5'
                                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#FACC15]' : 'text-[#94A3B8] group-hover:text-white'}`} />
                                <span className="ml-1">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="bg-[#171717] rounded-2xl p-5 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FACC15]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 text-[#FACC15]">
                                <Zap className="w-4 h-4 fill-current" />
                                <span className="text-xs font-bold uppercase tracking-wider">Pro Plan</span>
                            </div>
                            <h3 className="text-white font-bold mb-1">Upgrade to AI</h3>
                            <button className="w-full bg-white text-black text-xs font-bold py-2.5 rounded-lg hover:bg-gray-200 transition-colors mt-3">
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 w-full min-w-0 pb-12 pt-8">

                    {/* Hero Section */}
                    <div className="mb-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                            <div>
                                {/* 4. Component Refinement - Status Pill */}
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold mb-3">
                                    <CheckCircle2 size={12} /> Profile Verified
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-2 text-white">
                                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] to-white">{firstName}</span>
                                    <span className="ml-2 inline-block animate-wave text-4xl">👋</span>
                                </h1>
                                <p className="text-[#9CA3AF]">Here's what's happening today.</p>
                            </div>

                            <div className="relative w-full md:w-auto max-w-sm">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full bg-[#171717] border border-white/5 rounded-full pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#FACC15]/50 focus:ring-1 focus:ring-[#FACC15]/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Top Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Compliance Score */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-[#171717]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 relative overflow-hidden shadow-[0_0_20px_rgba(250,204,21,0.1)] hover:shadow-[0_0_30px_rgba(250,204,21,0.2)] transition-all duration-500"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-[#FACC15]/10 rounded-2xl text-[#FACC15]">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div className="text-green-400 flex items-center gap-1 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full">
                                        <TrendingUp className="w-3 h-3" /> +2.4%
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1">{complianceScore}%</h3>
                                <p className="text-[#94A3B8] text-sm font-medium">Tax Health Score</p>
                                <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${complianceScore}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-[#FACC15]"
                                    ></motion.div>
                                </div>
                            </motion.div>

                            {/* Cards with consistent design */}
                            <motion.div whileHover={{ scale: 1.02 }} className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                                        <CalendarIcon className="w-6 h-6" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1 truncate">{nextDeadline ? nextDeadline.daysRemaining : 0} Days</h3>
                                <p className="text-[#94A3B8] text-sm font-medium">Next Filing</p>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.02 }} className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{upcomingDeadlines.length}</h3>
                                <p className="text-[#94A3B8] text-sm font-medium">Pending Actions</p>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.02 }} className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">₹45k</h3>
                                <p className="text-[#94A3B8] text-sm font-medium">Est. Tax Saved</p>
                            </motion.div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-gradient-to-b from-[#FACC15] to-orange-500 rounded-[2rem] p-8 relative overflow-hidden text-black shadow-lg">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 bg-black/10 backdrop-blur-md px-3 py-1 rounded-full border border-black/5 text-xs font-bold mb-4">
                                        <AlertCircle size={14} /> ACTION REQUIRED
                                    </div>
                                    <h2 className="text-3xl font-bold mb-4 max-w-lg leading-tight">Advance Tax for Q4 is due.</h2>
                                    <div className="flex gap-4">
                                        <button className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-black/80 transition-all flex items-center gap-2 shadow-xl">
                                            Pay Now <ArrowRight size={16} />
                                        </button>
                                        <button className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl font-bold border border-black/5 hover:bg-white/30 transition-all">
                                            Ignore
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-white">Your Timeline</h3>
                                    <button className="text-sm text-[#FACC15] font-medium hover:underline">View Calendar</button>
                                </div>
                                <div className="relative pl-4 space-y-8 border-l border-white/10 ml-2">
                                    {upcomingDeadlines.slice(0, 3).map((deadline, index) => (
                                        <div key={deadline.id} className="relative pl-6">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#171717] border-2 border-[#FACC15]"></div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-[#FACC15]/30 transition-all group">
                                                <div>
                                                    <h4 className="font-bold text-white group-hover:text-[#FACC15] transition-colors">{deadline.obligationName}</h4>
                                                    <p className="text-sm text-[#94A3B8]">{deadline.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-white font-bold text-sm">
                                                        {new Date(deadline.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <span className="text-xs text-red-400 font-medium">Due soon</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Bot size={64} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <Bot className="w-5 h-5 text-[#FACC15]" /> Copilot Says
                                </h3>
                                <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/5">
                                    <p className="text-sm text-white italic leading-relaxed mb-4">
                                        "Hey {firstName}, based on your cash flow, I recommend paying your GST by the 18th to avoid any last-minute server busy issues."
                                    </p>
                                    <button className="text-xs font-bold text-[#FACC15] uppercase tracking-wider hover:underline">
                                        Ask Follow-up
                                    </button>
                                </div>
                            </div>

                            <div className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
                                <div className="space-y-2">
                                    {['Upload Invoice', 'Generate Rent Receipt', 'Check Refund Status'].map((action) => (
                                        <button key={action} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-sm text-[#94A3B8] hover:text-white transition-all group">
                                            {action}
                                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#FACC15]" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
