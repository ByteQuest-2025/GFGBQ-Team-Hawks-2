import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    PieChart,
    Download,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    DollarSign,
    RefreshCw
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart as RePieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { api } from '../../lib/api';

const data = [
    { name: 'Jan', tax: 4000, income: 24000 },
    { name: 'Feb', tax: 3000, income: 13980 },
    { name: 'Mar', tax: 2000, income: 9800 },
    { name: 'Apr', tax: 2780, income: 39080 },
    { name: 'May', tax: 1890, income: 4800 },
    { name: 'Jun', tax: 2390, income: 3800 },
    { name: 'Jul', tax: 3490, income: 4300 },
];

const COLORS = ['#FACC15', '#10B981', '#3B82F6', '#EF4444'];

export const ReportsModule = () => {
    const [quarter, setQuarter] = useState('Q1 2026');
    const [expenseData, setExpenseData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const analyzeExpenses = async () => {
        setLoading(true);
        try {
            const result = await api.analyzeExpensesFromSheet();
            setExpenseData(result.analysis);
        } catch (error) {
            console.error('Expense analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full h-full"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Financial Reports</h1>
                    <p className="text-[#9CA3AF]">Deep dive into your tax liabilities and spending.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={analyzeExpenses}
                        disabled={loading}
                        className="bg-[#FACC15] text-black font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-yellow-300 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Analyzing...' : 'Analyze Expenses'}
                    </button>
                    <button className="bg-[#171717] border border-white/10 text-white font-medium px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/5 transition-colors">
                        <Calendar size={16} /> {quarter}
                    </button>
                    <button className="bg-white/10 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/20 transition-colors">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="bg-[#171717] border border-white/5 p-6 rounded-[2rem]">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                            <TrendingUp size={24} />
                        </div>
                        <p className="text-[#9CA3AF] text-sm font-medium">Total Income</p>
                    </div>
                    <h3 className="text-3xl font-bold text-white">₹12,45,000</h3>
                    <p className="text-green-400 text-sm mt-2 font-medium flex items-center gap-1">
                        <ArrowUpRight size={14} /> +12% from last quarter
                    </p>
                </div>
                <div className="bg-[#171717] border border-white/5 p-6 rounded-[2rem]">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                            <DollarSign size={24} />
                        </div>
                        <p className="text-[#9CA3AF] text-sm font-medium">Total Expenses</p>
                    </div>
                    <h3 className="text-3xl font-bold text-white">₹4,20,000</h3>
                    <p className="text-red-400 text-sm mt-2 font-medium flex items-center gap-1">
                        <ArrowUpRight size={14} /> +5% from last quarter
                    </p>
                </div>
                <div className="bg-[#171717] border border-white/5 p-6 rounded-[2rem]">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-[#FACC15]/10 rounded-xl text-[#FACC15]">
                            <PieChart size={24} />
                        </div>
                        <p className="text-[#9CA3AF] text-sm font-medium">Estimated Tax</p>
                    </div>
                    <h3 className="text-3xl font-bold text-white">₹1,15,400</h3>
                    <p className="text-[#FACC15] text-sm mt-2 font-medium">
                        Due by Mar 15
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tax Liability Chart */}
                <div className="bg-[#171717] border border-white/5 p-8 rounded-[2rem]">
                    <h3 className="text-xl font-bold text-white mb-6">Tax Liability Trends</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#FACC15" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-[#171717] border border-white/5 p-8 rounded-[2rem]">
                    <h3 className="text-xl font-bold text-white mb-6">Expense Distribution</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={expenseData}
                                    innerRadius={50}
                                    outerRadius={100}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {expenseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
