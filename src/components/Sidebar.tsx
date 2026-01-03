import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    Bot,
    Settings,
    FileText,
    PieChart,
    Zap,
    Scan
} from 'lucide-react';

export function Sidebar({ className = "", onScanClick }: { className?: string, onScanClick?: () => void }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Map current path to sidebar item ID
    const currentPath = location.pathname;
    let activeId = 'Overview';
    if (currentPath.includes('calendar')) activeId = 'Calendar';
    if (currentPath.includes('invoices')) activeId = 'Invoices';
    if (currentPath.includes('reports')) activeId = 'Reports';
    if (currentPath.includes('copilot')) activeId = 'Copilot';
    if (currentPath.includes('settings')) activeId = 'Settings';

    const sidebarItems = [
        { icon: LayoutDashboard, label: 'Overview', id: 'Overview', path: '/dashboard' },
        { icon: CalendarIcon, label: 'Calendar', id: 'Calendar', path: '/calendar' },
        { icon: FileText, label: 'Invoices', id: 'Invoices', path: '/invoices' },
        { icon: PieChart, label: 'Reports', id: 'Reports', path: '/reports' },
        { icon: Bot, label: 'Copilot', id: 'Copilot', path: '/copilot' },
        { icon: Settings, label: 'Settings', id: 'Settings', path: '/settings' },
    ];

    return (
        <aside className={`w-64 hidden lg:block sticky top-32 h-[calc(100vh-8rem)] ${className}`}>
            <nav className="space-y-1 mb-8">
                {sidebarItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${activeId === item.id
                            ? 'text-[#FACC15] bg-[#171717] border border-white/5'
                            : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <item.icon className={`w-5 h-5 ${activeId === item.id ? 'text-[#FACC15]' : 'text-[#94A3B8] group-hover:text-white'}`} />
                        <span className="ml-1">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Quick Action: Scan Receipt */}
            <div className="px-1 mb-8">
                <button
                    onClick={onScanClick}
                    className="w-full flex items-center justify-center gap-2 bg-[#FACC15] hover:bg-yellow-400 text-black font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all transform active:scale-95">
                    <Scan size={18} />
                    <span>Scan Receipt</span>
                </button>
            </div>

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
    );
}
