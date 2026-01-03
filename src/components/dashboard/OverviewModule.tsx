import React from 'react';
import { 
    Search, 
    CheckCircle2, 
    ShieldCheck, 
    TrendingUp, 
    Calendar as CalendarIcon, 
    AlertCircle, 
    Wallet, 
    ArrowRight, 
    Bot 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface OverviewModuleProps {
    firstName: string;
    complianceScore: number;
    nextDeadline: any; // Using any for now to match rapid prop passing, ideally strictly typed
    upcomingDeadlines: any[];
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({ 
    firstName, 
    complianceScore, 
    nextDeadline, 
    upcomingDeadlines 
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
        >
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
                    <div className="bg-[#171717]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 relative overflow-hidden shadow-[0_0_20px_rgba(250,204,21,0.1)] hover:shadow-[0_0_30px_rgba(250,204,21,0.2)] transition-all duration-500 group">
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
                    </div>

                    {/* Cards with consistent design */}
                    <div className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                                <CalendarIcon className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 truncate">{nextDeadline ? nextDeadline.daysRemaining : 0} Days</h3>
                        <p className="text-[#94A3B8] text-sm font-medium">Next Filing</p>
                    </div>

                    <div className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{upcomingDeadlines.length}</h3>
                        <p className="text-[#94A3B8] text-sm font-medium">Pending Actions</p>
                    </div>

                    <div className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
                                <Wallet className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">₹45k</h3>
                        <p className="text-[#94A3B8] text-sm font-medium">Est. Tax Saved</p>
                    </div>
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
        </motion.div>
    );
};
