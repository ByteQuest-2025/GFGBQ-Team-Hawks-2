import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: any) => void;
}

export function SignInModal({ isOpen, onClose, onLoginSuccess }: SignInModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');

    const handleLogin = () => {
        const storedData = localStorage.getItem('onboarding_data');
        if (!storedData) {
            setError("No account found. Please Sign Up.");
            return;
        }

        try {
            const user = JSON.parse(storedData);
            if (user.email === email && user.password === password) {
                onLoginSuccess(user);
                onClose();
            } else {
                setError("Invalid email or password.");
            }
        } catch (e) {
            setError("Data error. Please reset.");
        }
    };

    const handleForgotPassword = () => {
        setToast("Reset link sent to your email!");
        setTimeout(() => setToast(''), 3000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#171717] border border-white/10 w-full max-w-md rounded-3xl p-8 relative shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Sign In</h3>
                            <button onClick={onClose} className="text-[#94A3B8] hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] outline-none transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] outline-none transition-all"
                                        placeholder="Enter password"
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button onClick={handleForgotPassword} className="text-xs text-[#FACC15] hover:underline">
                                    Forgot Password?
                                </button>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-400 text-sm font-medium">
                                        {error}
                                    </motion.p>
                                )}
                                {toast && (
                                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-green-400 text-sm font-medium">
                                        {toast}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={handleLogin}
                                className="w-full bg-[#FACC15] text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] mt-4"
                            >
                                Sign In
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
