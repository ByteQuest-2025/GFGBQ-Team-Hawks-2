import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Briefcase, 
    CreditCard, 
    Bell, 
    Shield, 
    Save,
    Building2,
    Landmark
} from 'lucide-react';

export const SettingsModule = () => {
    const [activeTab, setActiveTab] = useState('business');

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'business', label: 'Business Details', icon: Briefcase },
        { id: 'integrations', label: 'Integrations', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Shield },
    ];

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
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                activeTab === tab.id 
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
