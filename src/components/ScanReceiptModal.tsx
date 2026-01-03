import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, CheckCircle2, Loader2, ScanLine, DollarSign, Tag, Building2, TrendingUp, Bot } from 'lucide-react';

interface ScanReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock Scenarios for "Simulate AI Scan"
const MOCK_SCENARIOS = [
    { merchant: 'Amazon Web Services', amount: '8000', category: 'Software' },
    { merchant: 'Shell Station', amount: '2500', category: 'Travel' },
    { merchant: 'WeWork India', amount: '50000', category: 'Rent' },
];

export const ScanReceiptModal = ({ isOpen, onClose }: ScanReceiptModalProps) => {
    const [step, setStep] = useState<'viewfinder' | 'scanning' | 'results' | 'success'>('viewfinder');
    const [scanText, setScanText] = useState('Detecting Merchant...');
    const [scannedImage, setScannedImage] = useState<string | null>(null);

    // Dynamic Data State
    const [merchant, setMerchant] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Office Supplies');

    const startScan = (mockData?: any) => {
        setStep('scanning');

        if (mockData) {
            // Apply mock data after delay
            setTimeout(() => {
                setMerchant(mockData.merchant);
                setAmount(mockData.amount);
                setCategory(mockData.category);
            }, 2000); // Set midway through scanning
        } else {
            // Default random if manual trigger
            const random = MOCK_SCENARIOS[0];
            setTimeout(() => {
                setMerchant(random.merchant);
                setAmount(random.amount);
                setCategory(random.category);
            }, 2000);
        }

        // Timeline of "AI Thinking"
        setTimeout(() => setScanText('Calculating GST/VAT...'), 1000);
        setTimeout(() => setScanText('Applying 2026 Compliance Rules...'), 2000);
        setTimeout(() => setStep('results'), 3000);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setScannedImage(reader.result as string);
                startScan();
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSimulate = () => {
        const randomScenario = MOCK_SCENARIOS[Math.floor(Math.random() * MOCK_SCENARIOS.length)];
        // Use a placeholder image for simulation
        setScannedImage('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800');
        startScan(randomScenario);
    };

    const handleConfirm = () => {
        setStep('success');

        // 1. Save specific scan data for Reports Analysis
        const pendingExpense = {
            id: Date.now(),
            merchant,
            amount: parseFloat(amount),
            category,
            date: new Date().toISOString()
        };
        localStorage.setItem('pendingExpense', JSON.stringify(pendingExpense));

        // 2. Update Total Tax Saved (Legacy/Dashboard support)
        const benefit = parseFloat(amount) * 0.18; // Assume 18% GST Benefit
        const currentSaved = parseInt(localStorage.getItem('taxSaved') || '45000');
        const newSaved = currentSaved + benefit;
        localStorage.setItem('taxSaved', newSaved.toString());

        // Broadcast event for Dashboard/Reports to pick up
        window.dispatchEvent(new CustomEvent('tax-update', { detail: pendingExpense }));

        setTimeout(() => {
            onClose();
            // Reset for next time after closing
            setTimeout(() => {
                setStep('viewfinder');
                setScannedImage(null);
                setMerchant('');
                setAmount('');
                setCategory('Office Supplies');
            }, 500);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-[#171717] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#171717] z-20">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ScanLine className="text-[#FACC15]" /> AI Receipt Scanner
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-8 flex-1 flex flex-col items-center justify-center min-h-[400px] relative bg-[#0A0A0A]">

                        {/* STEP 1: VIEWFINDER */}
                        {step === 'viewfinder' && (
                            <div className="w-full flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                                <div className="w-64 h-80 border-2 border-dashed border-white/20 rounded-3xl flex items-center justify-center relative bg-[#171717]">
                                    <div className="text-center p-6">
                                        <div className="w-16 h-16 bg-[#FACC15]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#FACC15]">
                                            <Camera size={32} />
                                        </div>
                                        <p className="text-sm text-[#9CA3AF] font-medium">Point camera at receipt</p>
                                    </div>

                                    {/* Corner Accents */}
                                    <div className="absolute top-[-2px] left-[-2px] w-6 h-6 border-t-4 border-l-4 border-[#FACC15] rounded-tl-xl"></div>
                                    <div className="absolute top-[-2px] right-[-2px] w-6 h-6 border-t-4 border-r-4 border-[#FACC15] rounded-tr-xl"></div>
                                    <div className="absolute bottom-[-2px] left-[-2px] w-6 h-6 border-b-4 border-l-4 border-[#FACC15] rounded-bl-xl"></div>
                                    <div className="absolute bottom-[-2px] right-[-2px] w-6 h-6 border-b-4 border-r-4 border-[#FACC15] rounded-br-xl"></div>
                                </div>

                                <div className="flex flex-col gap-3 w-full">
                                    <div className="flex gap-4 w-full">
                                        <button
                                            onClick={() => startScan()}
                                            className="flex-1 bg-[#FACC15] hover:bg-yellow-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-yellow-500/20 transition-all active:scale-95"
                                        >
                                            <Camera size={20} /> Capture
                                        </button>
                                        <label className="flex-1 bg-[#171717] border border-white/10 hover:bg-white/5 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95">
                                            <Upload size={20} /> Upload
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                        </label>
                                    </div>

                                    {/* Hackathon Demo Button */}
                                    <button
                                        onClick={handleSimulate}
                                        className="w-full bg-[#171717] border border-white/5 text-[#FACC15] text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#FACC15]/10 transition-colors"
                                    >
                                        <Bot size={14} /> Simulate AI Scan (Demo)
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: SCANNING ANIMATION */}
                        {step === 'scanning' && (
                            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center pointer-events-none">
                                {scannedImage ? (
                                    <img src={scannedImage} alt="Receipt" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                ) : (
                                    <div className="absolute inset-0 bg-[#333] opacity-40 blur-sm"></div>
                                )}

                                {/* Laser Line */}
                                <motion.div
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    className="absolute left-0 right-0 h-1 bg-[#FACC15] shadow-[0_0_20px_#FACC15] z-10"
                                />

                                <div className="relative z-20 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full border border-[#FACC15]/30 flex items-center gap-3">
                                    <Loader2 className="animate-spin text-[#FACC15]" size={20} />
                                    <span className="font-mono text-[#FACC15] font-bold tracking-widest text-sm">{scanText}</span>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: RESULTS FORM (EDITABLE) */}
                        {step === 'results' && (
                            <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-[#171717] rounded-2xl p-6 border border-white/5 space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Analysis Complete</span>
                                        <div className="flex items-center gap-1 bg-green-500/10 text-green-400 px-2 py-1 rounded-lg text-xs font-bold border border-green-500/20">
                                            <TrendingUp size={12} /> Eligible for Deductions
                                        </div>
                                    </div>

                                    {/* Fields */}
                                    <div className="space-y-4">
                                        {/* Merchant */}
                                        <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Building2 size={16} /></div>
                                                <div className="w-full">
                                                    <p className="text-xs text-[#94A3B8]">Vendor</p>
                                                    <input
                                                        type="text"
                                                        value={merchant}
                                                        onChange={(e) => setMerchant(e.target.value)}
                                                        className="bg-transparent text-sm font-bold text-white w-full focus:outline-none border-b border-transparent focus:border-[#FACC15]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="p-2 bg-[#FACC15]/10 rounded-lg text-[#FACC15]"><DollarSign size={16} /></div>
                                                <div className="w-full">
                                                    <p className="text-xs text-[#94A3B8]">Amount</p>
                                                    <input
                                                        type="number"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                        className="bg-transparent text-sm font-bold text-white w-full focus:outline-none border-b border-transparent focus:border-[#FACC15]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Category */}
                                        <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Tag size={16} /></div>
                                                <div className="w-full">
                                                    <p className="text-xs text-[#94A3B8]">Category</p>
                                                    <select
                                                        value={category}
                                                        onChange={(e) => setCategory(e.target.value)}
                                                        className="bg-[#0A0A0A] text-sm font-bold text-white w-full focus:outline-none focus:text-[#FACC15] appearance-none"
                                                    >
                                                        <option value="Office Supplies">Office Supplies</option>
                                                        <option value="Software">Software</option>
                                                        <option value="Travel">Travel</option>
                                                        <option value="Marketing">Marketing</option>
                                                        <option value="Rent">Rent</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-green-500/5 rounded-xl border border-green-500/20 flex justify-between items-center">
                                            <span className="text-sm font-medium text-green-400">Est. Tax Benefit</span>
                                            <span className="text-lg font-bold text-green-400">₹{(parseInt(amount || '0') * 0.18).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirm}
                                    className="w-full bg-[#FACC15] hover:bg-yellow-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/30 transition-all active:scale-95"
                                >
                                    Confirm & Log Expense
                                </button>
                            </div>
                        )}

                        {/* STEP 4: SUCCESS */}
                        {step === 'success' && (
                            <div className="flex flex-col items-center justify-center animate-in zoom-in duration-300">
                                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                                    <CheckCircle2 size={48} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Logged!</h3>
                                <p className="text-[#94A3B8] text-center max-w-xs">
                                    Receipt data saved. Go to <strong>Reports</strong> to analyze the impact.
                                </p>
                            </div>
                        )}

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
