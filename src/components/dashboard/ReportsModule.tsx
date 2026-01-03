import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart as PieChartIcon,
    Download,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    IndianRupee, // Changed from DollarSign
    RefreshCw,
    Scan,
    Bot,
    CheckCircle2,
    Loader2,
    AlertCircle
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart as RePieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { db, auth } from '../../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ScanReceiptModal } from '../ScanReceiptModal';

// --- INTERFACES ---
interface AreaData {
    name: string;
    tax: number;
    income: number;
    [key: string]: any;
}

interface ExpenseItem {
    name: string;
    value: number;
    [key: string]: any;
}

// --- INITIAL DATA (STATIC SOURCE OF TRUTH) ---
const INITIAL_AREA_DATA: AreaData[] = [
    { name: 'Jan', tax: 4000, income: 24000 },
    { name: 'Feb', tax: 3000, income: 13980 },
    { name: 'Mar', tax: 2000, income: 9800 },
    { name: 'Apr', tax: 2780, income: 39080 },
    { name: 'May', tax: 1890, income: 4800 },
    { name: 'Jun', tax: 2390, income: 3800 },
    { name: 'Jul', tax: 3490, income: 4300 },
];

const INITIAL_EXPENSE_DATA: ExpenseItem[] = [
    { name: 'Office Supplies', value: 15000 },
    { name: 'Software', value: 25000 },
    { name: 'Travel', value: 12000 },
    { name: 'Marketing', value: 18000 },
    { name: 'Rent', value: 0 },
];

const COLORS = ['#FACC15', '#10B981', '#3B82F6', '#EF4444', '#A855F7'];

export const ReportsModule = () => {
    // --- STATE ---
    const [quarter, setQuarter] = useState('Q1 2026');

    // Static Data
    const areaChartData = INITIAL_AREA_DATA;
    const expenseData = INITIAL_EXPENSE_DATA;

    // Filter data once to reuse
    const filteredExpenses = expenseData.filter((e) => e.value > 0);

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [lastExported, setLastExported] = useState<Date | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Financial Metrics (Static)
    const totalExpenses = 420000;
    const estimatedTax = 115400;

    // --- EFFECT: Check for Last Export on Mount ---
    useEffect(() => {
        const fetchLastExport = async () => {
            try {
                // Determine user (or use global 'demo' doc for hackathon if no auth)
                const userId = auth.currentUser?.uid || 'demo_user';
                const docRef = doc(db, 'user_reports', userId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().lastExported) {
                    setLastExported(docSnap.data().lastExported.toDate());
                }
            } catch (e) {
                console.log("Firestore fetch ignored (Hackathon mode)", e);
            }
        };
        fetchLastExport();
    }, []);

    // --- HANDLER: Export to Sheets ---
    const handleExport = async () => {
        setIsExporting(true);
        setToastMessage("Syncing to Google Sheets...");

        try {
            // Call Backend
            const response = await fetch('http://localhost:3001/api/v1/reports/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quarter,
                    reportData: areaChartData
                })
            });

            const result = await response.json();

            if (result.success && result.sheetUrl) {
                window.open(result.sheetUrl, '_blank');

                const userId = auth.currentUser?.uid || 'demo_user';
                await setDoc(doc(db, 'user_reports', userId), {
                    lastExported: new Date(),
                    quarter
                }, { merge: true });

                setLastExported(new Date());
                setToastMessage("Sync Complete! 🚀");
            } else {
                throw new Error(result.error || 'Export failed');
            }

        } catch (error) {
            console.error(error);
            setToastMessage("Export Failed. Check console.");
        } finally {
            setIsExporting(false);
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    // --- HANDLER: Analyze Expenses (Simplified) ---
    const handleAnalyze = () => {
        setIsLoading(true);
        setToastMessage(null);

        // Simulate AI Processing Delay without data mutation
        setTimeout(() => {
            setIsLoading(false);
            setToastMessage("AI Audit Complete. No new anomalies found.");

            // Auto hide toast
            setTimeout(() => setToastMessage(null), 4000);
        }, 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full h-full relative"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Financial Reports</h1>
                    <p className="text-[#9CA3AF]">Deep dive into your tax liabilities and spending.</p>
                    {lastExported && (
                        <p className="text-xs text-green-500/80 mt-1 font-mono flex items-center gap-1">
                            <CheckCircle2 size={10} />
                            Last Audit Sync: {lastExported.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {/* SCAN BUTTON */}
                    <button
                        onClick={() => setIsScannerOpen(true)}
                        className="bg-[#171717] border border-[#FACC15] text-[#FACC15] font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#FACC15]/10 transition-colors"
                    >
                        <Scan size={16} /> Scan Receipt
                    </button>

                    {/* ANALYZE BUTTON */}
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="bg-[#FACC15] text-black font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-yellow-300 transition-colors disabled:opacity-80 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(250,204,21,0.3)] relative overflow-hidden"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        {isLoading ? 'AI Analyzing...' : 'Analyze Expenses'}
                    </button>

                    <button className="bg-[#171717] border border-white/10 text-white font-medium px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/5 transition-colors">
                        <Calendar size={16} /> {quarter}
                    </button>

                    {/* Report Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-transparent border border-[#262626] text-white font-medium px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#262626]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        {isExporting ? 'Securing...' : 'Export'}
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="bg-[#171717] border border-white/5 p-6 rounded-[2rem]">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-400"><TrendingUp size={24} /></div>
                        <p className="text-[#9CA3AF] text-sm font-medium">Total Income</p>
                    </div>
                    <h3 className="text-3xl font-bold text-white">₹12,45,000</h3>
                </div>

                {/* Metric 2: Static Total Expenses */}
                <div className="bg-[#171717] border border-white/5 p-6 rounded-[2rem]">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-400"><IndianRupee size={24} /></div>
                        <p className="text-[#9CA3AF] text-sm font-medium">Total Expenses</p>
                    </div>
                    <h3 className="text-3xl font-bold text-white">
                        ₹{totalExpenses.toLocaleString('en-IN')}
                    </h3>
                </div>

                {/* Metric 3: Static Estimated Tax */}
                <div className="bg-[#171717] border border-white/5 p-6 rounded-[2rem]">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-[#FACC15]/10 rounded-xl text-[#FACC15]"><PieChartIcon size={24} /></div>
                        <p className="text-[#9CA3AF] text-sm font-medium">Estimated Tax</p>
                    </div>
                    <h3 className="text-3xl font-bold text-white">
                        ₹{estimatedTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </h3>
                </div>
            </div>

            {/* CHARTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                {/* Tax Liability Chart */}
                <div className="bg-[#171717] border border-white/5 p-8 rounded-[2rem] relative overflow-hidden">
                    <h3 className="text-xl font-bold text-white mb-6">Tax Liability Trends</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaChartData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                    width={80}
                                />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, ""]}
                                />
                                <Area type="monotone" dataKey="tax" stroke="#FACC15" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" animationDuration={1500} isAnimationActive={true} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-[#171717] border border-white/5 p-8 rounded-[2rem] relative overflow-hidden">
                    <h3 className="text-xl font-bold text-white mb-6">Expense Distribution</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={filteredExpenses}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    animationDuration={1500}
                                    isAnimationActive={true}
                                >
                                    {filteredExpenses.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, ""]}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* SCANNER MODAL */}
            <ScanReceiptModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
            />

            {/* FLOATING TOAST */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -50, x: '-50%' }}
                        className="fixed top-24 left-1/2 z-50 bg-[#FACC15] text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2"
                    >
                        <AlertCircle size={18} />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                /* Removed Dynamic Shimmer Animations */
            `}</style>
        </motion.div>
    );
};
