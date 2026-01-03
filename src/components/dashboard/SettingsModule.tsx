import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Briefcase,
    CreditCard,
    Shield,
    Save,
    Building2,
    Landmark,
    Loader2,
    Camera,
    Check,
    X,
    Smartphone,
    Plus
} from 'lucide-react';
import { useStore } from '../../lib/store';
import type { BusinessType } from '../../types';

export const SettingsModule = () => {
    const { profile, updateProfile } = useStore();
    const [activeTab, setActiveTab] = useState('profile');

    // --- 1. MY PROFILE STATE ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        photoURL: ''
    });
    const [profileSaving, setProfileSaving] = useState(false);

    // --- 2. BUSINESS DETAILS STATE ---
    const [businessForm, setBusinessForm] = useState({
        businessName: 'TechFlow Solutions',
        businessType: 'freelancer' as BusinessType,
        gstin: '',
        pan: '',
        address: '123, Innovation Park, Sector 45, Gurgaon, Haryana - 122003'
    });
    const [businessErrors, setBusinessErrors] = useState<Record<string, string>>({});
    const [businessSaving, setBusinessSaving] = useState(false);
    const [businessSaved, setBusinessSaved] = useState(false);

    // --- 3. INTEGRATIONS STATE ---
    const [accounts, setAccounts] = useState([
        { id: 1, bankName: 'HDFC Bank', maskedNumber: '8892', status: 'Connected' }
    ]);
    const [showBankModal, setShowBankModal] = useState(false);
    const [newBankForm, setNewBankForm] = useState({ bankName: 'HDFC Bank', accountNumber: '', ifsc: '' });

    // --- 4. SECURITY STATE ---
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [sessions, setSessions] = useState([
        { id: 1, device: 'Chrome on MacOS', location: 'Mumbai, India', active: true },
        { id: 2, device: 'Safari on iPhone 15', location: 'Delhi, India', active: false }
    ]);

    // LOAD PROFILE ON MOUNT
    useEffect(() => {
        if (profile) {
            setProfileForm({
                name: profile.ownerName || '', // Map to ownerName (User Name)
                email: profile.email || 'user@example.com',
                photoURL: profile.photoURL || ''
            });
            // Also preload business form if available in profile
            setBusinessForm(prev => ({
                ...prev,
                businessName: profile.businessName || prev.businessName,
                businessType: profile.type || prev.businessType,
                gstin: profile.gstNumber || '',
                pan: profile.panNumber || '',
                address: profile.address || prev.address
            }));
        }
    }, [profile]);

    // --- HANDLERS ---

    // 1. MY PROFILE HANDLERS
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileForm(prev => ({ ...prev, photoURL: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = () => {
        setProfileSaving(true);
        setTimeout(() => {
            updateProfile({
                ownerName: profileForm.name, // Update ownerName
                photoURL: profileForm.photoURL
            });
            setProfileSaving(false);
        }, 1500);
    };

    // 2. BUSINESS DETAILS HANDLERS
    const validateBusiness = () => {
        const errors: Record<string, string> = {};
        if (businessForm.gstin.length !== 15) errors.gstin = "GSTIN must be 15 alphanumeric characters";

        if (businessForm.pan.length !== 10) errors.pan = "PAN must be 10 characters";
        setBusinessErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleBusinessSave = () => {
        if (!validateBusiness()) return;

        setBusinessSaving(true);
        // Simulate API call
        setTimeout(() => {
            updateProfile({
                businessName: businessForm.businessName,
                type: businessForm.businessType,
                gstNumber: businessForm.gstin,
                panNumber: businessForm.pan,
                address: businessForm.address
            });
            setBusinessSaving(false);
            setBusinessSaved(true);
            setTimeout(() => setBusinessSaved(false), 3000);
        }, 1000);
    };

    // 3. INTEGRATIONS HANDLERS
    const handleAddAccount = () => {
        if (!newBankForm.accountNumber) return;
        setAccounts([...accounts, {
            id: Date.now(),
            bankName: newBankForm.bankName,
            maskedNumber: newBankForm.accountNumber.slice(-4),
            status: 'Connected'
        }]);
        setShowBankModal(false);
        setNewBankForm({ bankName: 'HDFC Bank', accountNumber: '', ifsc: '' });
    };

    // 4. SECURITY HANDLERS
    const handleRevokeSession = (id: number) => {
        setSessions(sessions.filter(s => s.id !== id));
    };

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
            className="flex flex-col lg:flex-row gap-8 min-h-[600px] text-white"
        >
            {/* --- LEFT SIDEBAR NAV --- */}
            <div className="w-full lg:w-64 bg-[#171717] border border-white/5 rounded-[2rem] p-4 h-fit sticky top-6">
                <nav className="space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-[#FACC15] text-black shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                                : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 bg-[#171717] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden">
                <AnimatePresence mode='wait'>

                    {/* 1. MY PROFILE VIEW */}
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-2xl font-bold mb-8">My Profile</h2>
                            <div className="flex flex-col gap-8 max-w-xl">
                                {/* Avatar Upload */}
                                <div className="flex items-center gap-6">
                                    <div
                                        onClick={handleAvatarClick}
                                        className="relative group cursor-pointer"
                                    >
                                        <div className="w-24 h-24 rounded-full bg-[#262626] border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden group-hover:border-[#FACC15] transition-colors">
                                            {profileForm.photoURL ? (
                                                <img src={profileForm.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl font-bold text-[#9CA3AF]">{profileForm.name.charAt(0) || 'U'}</span>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={20} className="text-white" />
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">Profile Photo</h3>
                                        <p className="text-sm text-[#9CA3AF]">Click to upload a new avatar.</p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#9CA3AF] uppercase mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FACC15] transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#9CA3AF] uppercase mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            value={profileForm.email}
                                            disabled
                                            className="w-full bg-[#0A0A0A]/50 border border-white/5 rounded-xl px-4 py-3 text-[#6B7280] cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleProfileUpdate}
                                    disabled={profileSaving}
                                    className="bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(250,204,21,0.15)] flex items-center justify-center gap-2 w-fit px-8"
                                >
                                    {profileSaving && <Loader2 size={18} className="animate-spin" />}
                                    {profileSaving ? 'Updating...' : 'Update Profile'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* 2. BUSINESS DETAILS VIEW */}
                    {activeTab === 'business' && (
                        <motion.div
                            key="business"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold">Business Details</h2>
                                <button
                                    onClick={handleBusinessSave}
                                    disabled={businessSaving}
                                    className={`
                                        flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all
                                        ${businessSaved
                                            ? 'bg-green-500 text-black'
                                            : 'bg-white text-black hover:bg-gray-200'
                                        }
                                    `}
                                >
                                    {businessSaving ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Saving...
                                        </>
                                    ) : businessSaved ? (
                                        <>
                                            <Check size={18} /> Saved
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                                <div>
                                    <label className="block text-xs font-bold text-[#9CA3AF] uppercase mb-1.5">Business Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                                        <input
                                            type="text"
                                            value={businessForm.businessName}
                                            onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#FACC15] transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#9CA3AF] uppercase mb-1.5">Business Type</label>
                                    <select
                                        value={businessForm.businessType}
                                        onChange={(e) => setBusinessForm({ ...businessForm, businessType: e.target.value as BusinessType })}
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FACC15] transition-colors appearance-none"
                                    >
                                        <option value="freelancer">Freelancer</option>
                                        <option value="gig_worker">Gig Worker</option>
                                        <option value="micro_trader">Micro Trader</option>
                                        <option value="small_retailer">Small Retailer</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-[#9CA3AF] uppercase mb-1.5">GSTIN</label>
                                    <input
                                        type="text"
                                        value={businessForm.gstin}
                                        onChange={(e) => setBusinessForm({ ...businessForm, gstin: e.target.value.toUpperCase() })}
                                        className={`w-full bg-[#0A0A0A] border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors ${businessErrors.gstin ? 'border-red-500' : 'border-white/10 focus:border-[#FACC15]'}`}
                                        placeholder="15-digit GSTIN"
                                        maxLength={15}
                                    />
                                    {businessErrors.gstin && <p className="text-xs text-red-500">{businessErrors.gstin}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-[#9CA3AF] uppercase mb-1.5">PAN Number</label>
                                    <input
                                        type="text"
                                        value={businessForm.pan}
                                        onChange={(e) => setBusinessForm({ ...businessForm, pan: e.target.value.toUpperCase() })}
                                        className={`w-full bg-[#0A0A0A] border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors ${businessErrors.pan ? 'border-red-500' : 'border-white/10 focus:border-[#FACC15]'}`}
                                        placeholder="10-digit PAN"
                                        maxLength={10}
                                    />
                                    {businessErrors.pan && <p className="text-xs text-red-500">{businessErrors.pan}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-[#9CA3AF] uppercase mb-1.5">Registered Address</label>
                                    <textarea
                                        rows={3}
                                        value={businessForm.address}
                                        onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FACC15] transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* 3. INTEGRATIONS VIEW */}
                    {activeTab === 'integrations' && (
                        <motion.div
                            key="integrations"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-2xl font-bold mb-8">Connected Accounts</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Existing Accounts */}
                                {accounts.map(acc => (
                                    <div key={acc.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-48 group hover:border-[#FACC15]/50 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                                                <Landmark size={24} />
                                            </div>
                                            <div className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">
                                                {acc.status.toUpperCase()}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-1">{acc.bankName}</h4>
                                            <p className="text-[#9CA3AF] text-sm font-mono tracking-wider">**** **** **** {acc.maskedNumber}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Card */}
                                <button
                                    onClick={() => setShowBankModal(true)}
                                    className="bg-[#0A0A0A] border border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center h-48 hover:bg-white/5 transition-all text-[#9CA3AF] hover:text-white"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                        <Plus size={24} />
                                    </div>
                                    <h4 className="font-bold">Connect New Account</h4>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* 4. SECURITY VIEW */}
                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-2xl font-bold mb-8">Security & Privacy</h2>

                            <div className="max-w-xl space-y-10">
                                {/* Password Change */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Shield size={18} className="text-[#FACC15]" /> Change Password
                                    </h3>
                                    <div className="space-y-4">
                                        <input type="password" placeholder="Current Password" className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FACC15]" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="password" placeholder="New Password" className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FACC15]" />
                                            <input type="password" placeholder="Confirm Password" className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FACC15]" />
                                        </div>
                                        <button className="text-sm font-bold text-[#FACC15] hover:text-[#EAB308]">Update Password</button>
                                    </div>
                                </div>

                                <div className="h-px bg-white/10" />

                                {/* 2FA Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold mb-1">Two-Factor Authentication</h3>
                                        <p className="text-[#9CA3AF] text-sm">Add an extra layer of security to your account.</p>
                                    </div>
                                    <button
                                        onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                                        className={`w-14 h-8 rounded-full p-1 transition-colors ${is2FAEnabled ? 'bg-[#FACC15]' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-6 h-6 bg-black rounded-full transition-transform ${is2FAEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="h-px bg-white/10" />

                                {/* Active Sessions */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold">Active Sessions</h3>
                                    {sessions.map(session => (
                                        <div key={session.id} className="flex items-center justify-between bg-[#0A0A0A] p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-white/5 rounded-lg">
                                                    <Smartphone size={20} className="text-[#9CA3AF]" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm">{session.device}</h4>
                                                    <p className="text-xs text-[#9CA3AF]">{session.location} • {session.active ? <span className="text-emerald-400">Active Now</span> : 'Last seen 2h ago'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRevokeSession(session.id)}
                                                className="text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                            >
                                                Revoke
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* MODAL FOR ADDING BANK */}
                <AnimatePresence>
                    {showBankModal && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                                onClick={() => setShowBankModal(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#171717] border border-white/10 p-8 rounded-3xl w-full max-w-md z-50 shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold">Connect Bank Account</h2>
                                    <button onClick={() => setShowBankModal(false)} className="text-[#9CA3AF] hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-[#9CA3AF] uppercase mb-1">Bank Name</label>
                                        <select
                                            value={newBankForm.bankName}
                                            onChange={(e) => setNewBankForm({ ...newBankForm, bankName: e.target.value })}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FACC15]"
                                        >
                                            <option>HDFC Bank</option>
                                            <option>ICICI Bank</option>
                                            <option>SBI</option>
                                            <option>Axis Bank</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[#9CA3AF] uppercase mb-1">Account Number</label>
                                        <input
                                            type="text"
                                            value={newBankForm.accountNumber}
                                            onChange={(e) => setNewBankForm({ ...newBankForm, accountNumber: e.target.value })}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FACC15]"
                                            placeholder="Enter account number"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[#9CA3AF] uppercase mb-1">IFSC Code</label>
                                        <input
                                            type="text"
                                            value={newBankForm.ifsc}
                                            onChange={(e) => setNewBankForm({ ...newBankForm, ifsc: e.target.value })}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FACC15]"
                                            placeholder="e.g. HDFC0001234"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddAccount}
                                        className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold py-3.5 rounded-xl mt-4 transition-colors"
                                    >
                                        Connect Account
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
