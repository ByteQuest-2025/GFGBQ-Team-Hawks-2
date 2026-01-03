import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Briefcase,
    CreditCard,
    Bell,
    Shield,
    Save,
    Building2,
    Landmark,
    Loader2
} from 'lucide-react';
import { api } from '../../lib/api';
import { useStore } from '../../lib/store';

// ... (imports)

// Helper to check profile completeness
const isProfileComplete = (data: any) => {
    return !!(data.name && data.type && data.gstNumber && data.panNumber && data.state);
};

export const SettingsModule = () => {
    // ...
    const { profile } = useStore();
    const [activeTab, setActiveTab] = useState('business');
    const [formData, setFormData] = useState<any>({
        name: '',
        type: 'freelancer',
        ownerName: '',
        email: '',
        panNumber: '',
        hasGST: false,
        gstNumber: '',
        address: '',
        state: 'Delhi',
        turnover: '< ₹20L'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'business', label: 'Business Details', icon: Briefcase },
        { id: 'integrations', label: 'Integrations', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    // Load user profile on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const userId = profile?.id || 'guest';
                const result = await api.getUserProfile(userId);
                if (result.profile) {
                    setFormData({
                        name: result.profile.name || '',
                        type: result.profile.type || 'freelancer',
                        ownerName: result.profile.ownerName || '',
                        email: result.profile.email || '',
                        panNumber: result.profile.panNumber || '',
                        hasGST: result.profile.hasGST || false,
                        gstNumber: result.profile.gstNumber || '',
                        address: result.profile.address || '',
                        state: result.profile.state || 'Delhi',
                        turnover: result.profile.turnover || '< ₹20L'
                    });
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [profile]);

    const handleInputChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const userId = profile?.id || 'guest';

            // Calculate completeness
            const complete = isProfileComplete(formData);
            const dataToSave = { ...formData, profileCompleted: complete };

            await api.updateUserProfile(userId, dataToSave);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Failed to save profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col lg:flex-row gap-8 min-h-[600px]"
        >
            {/* Sidebar Tabs */}
            <div className="w-full lg:w-64 bg-[#171717] border border-white/5 rounded-[2rem] p-4 h-fit">
                <h3 className="text-[#9CA3AF] text-xs font-bold uppercase tracking-wider px-4 py-3 mb-2">Settings</h3>
                <nav className="space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-[#FACC15] text-black shadow-lg shadow-[#FACC15]/20'
                                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content Form */}
            <div className="flex-1 bg-[#171717] border border-white/5 rounded-[2rem] p-8">
                {activeTab === 'profile' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">My Profile</h2>
                        <div className="space-y-6 max-w-xl">
                            <div className="flex items-center gap-6 mb-8">
                                {profile?.photoURL ? (
                                    <img src={profile.photoURL} alt="Profile" className="w-24 h-24 rounded-full border-4 border-[#FACC15]/20 object-cover" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-[#FACC15] flex items-center justify-center text-black text-3xl font-bold">
                                        {formData.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-xl font-bold text-white">{formData.name}</h3>
                                    <p className="text-gray-400">{formData.email}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#9CA3AF] uppercase">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#FACC15]/50 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#9CA3AF] uppercase">Email Address</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-5 h-5 flex items-center justify-center">@</div>
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        disabled
                                        className="w-full bg-[#171717] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <button onClick={handleSave} className="bg-[#FACC15] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#EAB308] transition-colors mt-4">
                                {saving ? 'Saving...' : 'Update Profile'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'business' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Business Details</h2>
                                <p className="text-[#9CA3AF] text-sm">Manage your tax identity and registered address.</p>
                            </div>
                            <button className="bg-white text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition-colors">
                                <Save size={18} /> Save Changes
                            </button>
                        </div>

                        <div className="space-y-6 max-w-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#9CA3AF] uppercase">Business Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
                                        <input
                                            type="text"
                                            defaultValue="TechFlow Solutions"
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#FACC15]/50 transition-all focus:shadow-[0_0_20px_rgba(250,204,21,0.1)]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#9CA3AF] uppercase">Business Type</label>
                                    <select className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FACC15]/50 appearance-none">
                                        <option>Freelancer / Consultant</option>
                                        <option>Sole Proprietorship</option>
                                        <option>Private Limited</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#9CA3AF] uppercase">GSTIN</label>
                                    <input
                                        type="text"
                                        placeholder="22AAAAA0000A1Z5"
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FACC15]/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#9CA3AF] uppercase">PAN Number</label>
                                    <input
                                        type="text"
                                        placeholder="ABCDE1234F"
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FACC15]/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#9CA3AF] uppercase">Registered Address</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FACC15]/50 transition-all resize-none"
                                    defaultValue="123, Innovation Park, Sector 45, Gurgaon, Haryana - 122003"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'integrations' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">Connected Accounts</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-48 group hover:border-[#FACC15]/50 transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl">
                                        <Landmark size={24} />
                                    </div>
                                    <div className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg border border-green-500/20">
                                        CONNECTED
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white">HDFC Bank</h4>
                                    <p className="text-[#9CA3AF] text-sm">**** **** **** 8892</p>
                                </div>
                            </div>

                            <div className="bg-[#0A0A0A] border border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center h-48 hover:bg-white/5 transition-all cursor-pointer">
                                <div className="p-4 bg-white/5 rounded-full mb-3 text-white">
                                    <CreditCard size={24} />
                                </div>
                                <h4 className="font-bold text-white">Connect New Account</h4>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};
