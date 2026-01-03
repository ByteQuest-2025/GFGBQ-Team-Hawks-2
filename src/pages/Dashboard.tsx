import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    Bot,
    Settings,
    Zap,
    FileText,
    PieChart
} from 'lucide-react';
import { Header } from '../components/Header';
import { OverviewModule } from '../components/dashboard/OverviewModule';
import { InvoicesModule } from '../components/dashboard/InvoicesModule';
import { ReportsModule } from '../components/dashboard/ReportsModule';
import { CopilotModule } from '../components/dashboard/CopilotModule';
import { SettingsModule } from '../components/dashboard/SettingsModule';
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
                photoURL: user.picture || user.photoURL,
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



    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#FACC15] selection:text-black overflow-x-hidden pt-20">

            {/* Shared Header Component */}
            {/* Shared Header Component */}
            <Header
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
                    <AnimatePresence mode="wait">
                        {(() => {
                            switch (activeTab) {
                                case 'Overview':
                                    return (
                                        <OverviewModule
                                            key="overview"
                                            firstName={firstName}
                                            complianceScore={complianceScore}
                                            nextDeadline={nextDeadline}
                                            upcomingDeadlines={upcomingDeadlines}
                                        />
                                    );
                                case 'Invoices':
                                    return <InvoicesModule key="invoices" />;
                                case 'Reports':
                                    return <ReportsModule key="reports" />;
                                case 'Copilot':
                                    return <CopilotModule key="copilot" />;
                                case 'Settings':
                                    return <SettingsModule key="settings" />;
                                case 'Calendar':
                                    return (
                                        <motion.div
                                            key="calendar"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="flex items-center justify-center h-full text-[#9CA3AF]"
                                        >
                                            Calendar Module Coming Soon
                                        </motion.div>
                                    );
                                default:
                                    return null;
                            }
                        })()}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
