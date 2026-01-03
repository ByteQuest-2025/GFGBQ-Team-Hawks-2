import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Calendar, Lock, User, Briefcase, CreditCard, Mail, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

// --- Types ---
type FormData = {
    fullName: string;
    email: string;
    password: string;
    dob: string;
    age: string;
    mobile: string;
    businessName: string;
    businessType: string;
    turnover: string;
    state: string;
    aadhaar: string;
    pan: string;
    gst: boolean;
};

// --- Utils ---
const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    if (pass.length < 6) return 1;
    if (pass.length < 10) return 2;
    return 3;
};

// --- Validation ---
const isValidStep1 = (data: FormData) => {
    return data.fullName.length > 2 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
        data.password.length >= 6 &&
        data.dob !== '' &&
        data.mobile.length === 10;
};

const isValidStep2 = (data: FormData) => {
    return data.businessName.length > 2 &&
        data.businessType !== '' &&
        data.turnover !== '' &&
        data.state !== '' &&
        data.aadhaar.length === 12;
};

const isValidStep3 = (data: FormData) => {
    return data.pan.length === 10;
};

export function OnboardingPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [completed, setCompleted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // --- Safe Initial State ---
    const [formData, setFormData] = useState<FormData>(() => {
        try {
            const saved = localStorage.getItem('onboarding_data');
            return saved ? JSON.parse(saved) : {
                fullName: '',
                email: '',
                password: '',
                dob: '',
                age: '',
                mobile: '',
                businessName: '',
                businessType: '',
                turnover: '',
                state: '',
                aadhaar: '',
                pan: '',
                gst: false,
            };
        } catch (e) {
            console.error("Error parsing onboarding data, resetting form", e);
            return {
                fullName: '',
                email: '',
                password: '',
                dob: '',
                age: '',
                mobile: '',
                businessName: '',
                businessType: '',
                turnover: '',
                state: '',
                aadhaar: '',
                pan: '',
                gst: false,
            };
        }
    });

    useEffect(() => {
        localStorage.setItem('onboarding_data', JSON.stringify(formData));
    }, [formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (name === 'pan') {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
            return;
        }

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'dob') {
            const birthDate = new Date(value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            setFormData(prev => ({ ...prev, age: age.toString() }));
        }
    };

    const nextStep = () => {
        if (step < 3) {
            setStep(prev => prev + 1);
        } else {
            handleSuccess();
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
        }
    };

    const handleSuccess = () => {
        setCompleted(true);

        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FACC15', '#ffffff', '#22c55e']
            });
        }

        localStorage.setItem('user_session', 'active');

        setTimeout(() => {
            navigate('/');
        }, 2500);
    };

    const isStepValid = () => {
        if (step === 1) return isValidStep1(formData);
        if (step === 2) return isValidStep2(formData);
        if (step === 3) return isValidStep3(formData);
        return false;
    };

    const renderStep = () => {
        if (completed) return null;

        switch (step) {
            case 1:
                const strength = getPasswordStrength(formData.password);
                return (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white mb-1">Create Account</h3>
                        <p className="text-sm text-gray-400 mb-6">Let's secure your financial future.</p>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                    <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="input-field pl-12" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="input-field pl-12" />
                                </div>
                            </div>
                            {/* Password Field */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a strong password"
                                        className="input-field pl-12 pr-12"
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {/* Strength */}
                                <div className="flex gap-1 h-1 mt-2">
                                    <div className={`flex-1 rounded-full transition-all duration-500 ${strength >= 1 ? 'bg-red-500' : 'bg-white/10'}`}></div>
                                    <div className={`flex-1 rounded-full transition-all duration-500 ${strength >= 2 ? 'bg-yellow-500' : 'bg-white/10'}`}></div>
                                    <div className={`flex-1 rounded-full transition-all duration-500 ${strength >= 3 ? 'bg-green-500' : 'bg-white/10'}`}></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 pt-2">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date of Birth</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                    <input name="dob" type="date" value={formData.dob} onChange={handleChange} className="input-field pl-12 text-white scheme-dark" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile Number</label>
                                <div className="flex">
                                    <span className="bg-[#262626] border border-r-0 border-white/10 rounded-l-xl px-3 flex items-center text-gray-400 text-sm pl-4">+91</span>
                                    <input name="mobile" type="tel" maxLength={10} value={formData.mobile} onChange={handleChange} placeholder="9876543210" className="input-field rounded-l-none pl-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-5">
                        <h3 className="text-2xl font-bold text-white mb-1">Business Details</h3>
                        <p className="text-sm text-gray-400 mb-6">Help us customize your tax compliance.</p>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Name</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                <input name="businessName" value={formData.businessName} onChange={handleChange} placeholder="Studio X" className="input-field pl-12" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
                                <select name="businessType" value={formData.businessType} onChange={handleChange} className="input-field appearance-none pl-4">
                                    <option value="">Select Type</option>
                                    <option value="freelancer">Freelancer</option>
                                    <option value="gig">Gig Worker</option>
                                    <option value="trader">Small Trader</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Turnover</label>
                                <select name="turnover" value={formData.turnover} onChange={handleChange} className="input-field appearance-none pl-4">
                                    <option value="">Annual Income</option>
                                    <option value="low">Below 20L</option>
                                    <option value="mid">20L - 1Cr</option>
                                    <option value="high">Above 1Cr</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">State</label>
                            <select name="state" value={formData.state} onChange={handleChange} className="input-field appearance-none pl-4">
                                <option value="">Select State</option>
                                <option value="DL">Delhi</option>
                                <option value="MH">Maharashtra</option>
                                <option value="KA">Karnataka</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aadhaar Number</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm pointer-events-none">UID</div>
                                <input name="aadhaar" maxLength={12} value={formData.aadhaar} onChange={handleChange} placeholder="12 Digit UID" className={`input-field pl-12 pr-10 ${formData.aadhaar.length === 12 ? 'border-green-500/50 focus:border-green-500' : ''}`} />
                                {formData.aadhaar.length === 12 && (
                                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5 pointer-events-none" />
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-5">
                        <h3 className="text-2xl font-bold text-white mb-1">Tax Setup</h3>
                        <p className="text-sm text-gray-400 mb-6">Securely linking your PAN for compliance.</p>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">PAN Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                <input name="pan" maxLength={10} value={formData.pan} onChange={handleChange} placeholder="ABCDE1234F" className="input-field pl-12 uppercase tracking-widest font-mono" />
                            </div>
                            <p className="text-xs text-gray-600 pl-1">Format: 5 Letters, 4 Digits, 1 Letter</p>
                        </div>

                        <div className="pt-4 flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                                <h4 className="text-sm font-bold text-white">GST Registered?</h4>
                                <p className="text-xs text-gray-400">Toggle if you have a GSTIN.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="gst" checked={formData.gst} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FACC15]"></div>
                            </label>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Backgrounds */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FACC15]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Card */}
            <div className="w-full max-w-lg bg-[#171717]/80 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2rem] shadow-2xl relative z-10">

                <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                        <Lock className="w-3 h-3" />
                        <span>End-to-End Encrypted & Secure</span>
                    </div>
                </div>

                {/* Progress */}
                {!completed && (
                    <div className="absolute top-8 right-8 w-12 h-12">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="#333" strokeWidth="4" fill="transparent" />
                            <circle cx="24" cy="24" r="20" stroke="#FACC15" strokeWidth="4" fill="transparent" strokeDasharray={126} strokeDashoffset={126 - (126 * step) / 3} className="transition-all duration-500" />
                        </svg>
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white">{step}/3</span>
                    </div>
                )}

                <div className="min-h-[440px] flex flex-col justify-center">
                    {completed ? (
                        <div className="text-center space-y-6 py-10">
                            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/30">
                                <Check className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">All Set!</h2>
                            <p className="text-gray-400">Your profile is ready. Redirecting...</p>
                        </div>
                    ) : (
                        renderStep()
                    )}
                </div>

                {!completed && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                        <button
                            onClick={prevStep}
                            disabled={step === 1}
                            className={`flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </button>

                        <button
                            onClick={nextStep}
                            disabled={!isStepValid()}
                            className="group bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all active:scale-[0.98] flex items-center space-x-2 cursor-pointer"
                        >
                            <span>{step === 3 ? 'Get Started' : 'Continue'}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}

            </div>

            <style>{`
        .input-field {
            width: 100%;
            background-color: #0A0A0A;
            border: 1px solid #333;
            border-radius: 0.75rem;
            padding: 0.875rem 1rem;
            color: white;
            transition: all 0.2s;
        }
        .input-field:focus {
            border-color: #FACC15;
            outline: none;
            box-shadow: 0 0 0 1px #FACC15;
        }
        .input-field:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
      `}</style>
        </div>
    );
}
