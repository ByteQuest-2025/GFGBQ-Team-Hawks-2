import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useStore } from '../lib/store';
import { ScanReceiptModal } from './ScanReceiptModal';

interface LayoutProps {
    user?: any;
    onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
    const { profile, setProfile } = useStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Sync Store if user prop exists but store is empty (or mismatched)
    // This ensures that whether we land on Dashboard or Calendar, the store is populated.
    useEffect(() => {
        if (user && (!profile || profile.ownerName !== user.fullName)) {
            setProfile({
                id: user.uid || '1',
                name: 'My Business',
                type: 'freelancer',
                turnover: 'below_20L',
                ownerName: user.name || user.fullName || user.displayName || 'User',
                state: 'Delhi',
                email: user.email || '',
                hasGST: false,
                panNumber: '',
                photoURL: user.picture || user.photoURL,
                createdAt: new Date(),
                ...profile // Keep existing fields if we are just updating the user basic info
            });
        }
    }, [user, profile, setProfile]);

    // Determine active tab from location
    const currentPath = location.pathname;
    const navLinks = [
        { name: 'Dashboard', id: 'Overview', path: '/dashboard' },
        { name: 'Calendar', id: 'Calendar', path: '/calendar' },
        { name: 'Copilot', id: 'Copilot', path: '/copilot' },
        { name: 'Invoices', id: 'Invoices', path: '/invoices' },
        { name: 'Reports', id: 'Reports', path: '/reports' },
        { name: 'Settings', id: 'Settings', path: '/settings' }
    ];

    const activeTab = navLinks.find(link => currentPath.toLowerCase().includes(link.path.toLowerCase()))?.id || 'Overview';

    const handleTabChange = (tabId: string) => {
        const link = navLinks.find(l => l.id === tabId);
        if (link) navigate(link.path);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#FACC15] selection:text-black overflow-x-hidden pt-20">
            {/* Shared Header */}
            <Header
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                onLogout={onLogout}
            />

            <div className="max-w-7xl mx-auto px-6 flex gap-8">
                {/* Shared Sidebar */}
                <Sidebar
                    className="sticky top-32"
                    onScanClick={() => setIsScannerOpen(true)}
                />

                {/* Main Content Area */}
                <main className="flex-1 w-full min-w-0 pb-12 pt-8">
                    <Outlet />
                </main>
            </div>

            {/* Global Scan Receipt Modal */}
            <ScanReceiptModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
            />
        </div>
    );
};
