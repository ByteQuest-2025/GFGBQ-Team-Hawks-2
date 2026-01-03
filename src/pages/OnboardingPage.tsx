import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, User, Mail, Lock, Briefcase, CreditCard, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../lib/api';
import { useStore } from '../lib/store';

// --- Types ---
type FormData = {
    fullName: string;
    email: string;
    password: string;
    dob: string;
    mobile: string;
    businessName: string;
    businessType: string;
    turnover: string;
    state: string;
    aadhaar: string;
    pan: string;
    gst: boolean;
};

// --- Password Strength ---
const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    if (pass.length < 6) return 1;
    if (pass.length < 10) return 2;
    return 3;
};

export function OnboardingPage() {
    const navigate = useNavigate();
    const { profile } = useStore(); // Access global store for user
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ... (state)

    const handleSuccess = async () => {
        setIsCompleted(true);

        try {
            if (profile?.id) {
                // Save to backend
                await api.updateUserProfile(profile.id, {
                    name: formData.fullName,
                    email: formData.email,
                    businessType: formData.businessType,
                    turnover: formData.turnover,
                    panNumber: formData.pan,
                    gstNumber: formData.gst ? 'YES' : 'NO',
                    state: formData.state,
                    profileCompleted: true
                });
            }
        } catch (error) {
            console.error('Onboarding Save Failed', error);
        }

        // Trigger Flutters and Redirect
        triggerConfetti();

        setTimeout(() => navigate('/dashboard'), 2000);
    };

    const triggerConfetti = () => {
        // ... existing confetti code ...
        const duration = 3000;
        const end = Date.now() + duration;
        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#FACC15', '#ffffff']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#FACC15', '#ffffff']
            });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    };

    // --- Initial Data Load ---
    const [formData, setFormData] = useState<FormData>(() => {
        try {
            const saved = localStorage.getItem('onboarding_data');
            return saved ? JSON.parse(saved) : {
                fullName: '', email: '', password: '', dob: '', mobile: '',
                businessName: '', businessType: '', turnover: '', state: '',
                aadhaar: '', pan: '', gst: false
            };
        } catch {
            return {
                fullName: '', email: '', password: '', dob: '', mobile: '',
                businessName: '', businessType: '', turnover: '', state: '',
                aadhaar: '', pan: '', gst: false
            };
        }
    });

    // --- Persistence ---
    useEffect(() => {
        localStorage.setItem('onboarding_data', JSON.stringify(formData));
    }, [formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === 'pan') {
            setFormData(p => ({ ...p, [name]: value.toUpperCase() }));
            return;
        }
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(p => ({ ...p, [name]: checked }));
            return;
        }
        setFormData(p => ({ ...p, [name]: value }));
    };

    const handleNext = () => {
        if (step < 3) {
            setDirection(1);
            setStep(s => s + 1);
        } else {
            handleSuccess();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setDirection(-1);
            setStep(s => s - 1);
        }

    };
    // ... (confetti code) ...

    // Save & Login
    try {
        // Get current user from firebase/auth if available, or assume flow passed it? 
        // In a real app we'd access the auth context. 
        // For now, let's assume the token is in local storage or we can rely on `api` if it handles it.
        // Actually, OnboardingPage should probably be protected or have access to `user`.
        // Let's assume we can get the uid from the previous step which set the session.

        // Wait, Onboarding is typically after login.
        // Let's look at `handleFirebaseLogin` in `App.tsx` -> it sets user state.
        // We need to access that user. Ideally useStore or passed prop.
        // I'll add useStore here.

        // Assuming "guest" for now if not found, but this should be real.
        // FIX: We need to ensure we have the UID.
    } catch (e) { console.error(e); }

    // MOCK for now to match pattern, but realistically we need the UID
    // Disabling the localStorage setItem for 'onboarding_data' since we want backend truth.
    localStorage.setItem('user_session', 'active');
    window.dispatchEvent(new Event('auth-update'));

    setTimeout(() => navigate('/dashboard'), 2500);
};

// --- Step Content ---
const renderStepContent = () => {
    switch (step) {
        case 1:
            const strength = getPasswordStrength(formData.password);
            return (
                <div className="space-y-5">
                    <div className="grid gap-5">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Sakshi Sharma" className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#FACC15] rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="sakshi@example.com" className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#FACC15] rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Create Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#FACC15] rounded-xl py-3 pl-12 pr-12 text-white outline-none transition-all"
                                />
                                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {/* Strength Meter */}
                            <div className="flex gap-1 h-1 mt-2">
                                <div className={`flex-1 rounded-full transition-colors ${strength > 0 ? 'bg-red-500' : 'bg-white/10'}`} />
                                <div className={`flex-1 rounded-full transition-colors ${strength > 1 ? 'bg-yellow-500' : 'bg-white/10'}`} />
                                <div className={`flex-1 rounded-full transition-colors ${strength > 2 ? 'bg-green-500' : 'bg-white/10'}`} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 2:
            return (
                <div className="space-y-5">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Business Name</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            <input name="businessName" value={formData.businessName} onChange={handleChange} placeholder="Design Studio" className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#FACC15] rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-all" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Type</label>
                            <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#FACC15] rounded-xl py-3 pl-4 pr-4 text-white outline-none appearance-none">
                                <option value="">Select</option>
                                <option value="freelance">Freelance</option>
                                <option value="business">Business</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Turnover</label>
                            <select name="turnover" value={formData.turnover} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#FACC15] rounded-xl py-3 pl-4 pr-4 text-white outline-none appearance-none">
                                <option value="">Annual</option>
                                <option value="<20L">Below 20L</option>
                                <option value=">20L">Above 20L</option>
                            </select>
                        </div>
                    </div>
                </div>
            );
        case 3:
            return (
                <div className="space-y-5">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">PAN Number</label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            <input name="pan" value={formData.pan} onChange={handleChange} placeholder="ABCDE1234F" className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#FACC15] rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-all uppercase font-mono tracking-widest" maxLength={10} />
                        </div>
                    </div>
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <h4 className="text-sm font-bold text-white mb-1">Almost Done!</h4>
                        <p className="text-xs text-gray-400">By clicking "Get Started", you agree to our Terms and authorize TaxAlly to fetch your tax details.</p>
                    </div>
                </div>
            );
        default: return null;
    }
};

return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Vibe Background */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#FACC15]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-lg relative z-10">
            {/* Header Badge */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#171717] border border-white/10 shadow-lg">
                    <User size={14} className="text-[#FACC15]" />
                    <span className="text-xs font-bold text-gray-300 tracking-wide">ACCOUNT SETUP</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isCompleted ? (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#171717] border border-white/10 rounded-3xl p-10 text-center shadow-2xl"
                    >
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            <Check className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome, {formData.fullName.split(' ')[0]}!</h2>
                        <p className="text-gray-400">Setting up your dashboard...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#171717]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl"
                    >
                        {/* Progress Header */}
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {step === 1 ? "Create Account" : step === 2 ? "Business Info" : "Final Step"}
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">
                                    {step === 1 ? "Let's get you on the grid." : step === 2 ? "Tell us about your work." : "Secure your tax profile."}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full border-4 border-[#262626] flex items-center justify-center relative">
                                <span className="text-sm font-bold text-white relative z-10">{step}/3</span>
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="20" cy="20" r="18" fill="transparent" stroke="#FACC15" strokeWidth="2" strokeDasharray="113" strokeDashoffset={113 - (113 * step) / 3} className="transition-all duration-500" />
                                </svg>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="min-h-[300px]">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={step}
                                    custom={direction}
                                    initial={{ opacity: 0, x: direction * 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: direction * -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {renderStepContent()}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                            <button
                                onClick={handleBack}
                                disabled={step === 1}
                                className={`flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-white transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                            >
                                <ArrowLeft size={16} /> <span>Back</span>
                            </button>
                            <button
                                onClick={handleNext}
                                className="bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all flex items-center space-x-2"
                            >
                                <span>{step === 3 ? "Get Started" : "Continue"}</span>
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
);
}
