import { useState } from 'react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';
import { TrendingUp, Briefcase, DollarSign, ArrowRight, CheckCircle2, XCircle, Loader, Sparkles } from 'lucide-react';
import { Header } from '../components/Header';

interface ExpenseAnalysis {
    categorizedExpenses: {
        description: string;
        category: 'Business' | 'Personal';
        reason: string;
    }[];
    totalDeductible: number;
    taxSaved: number;
}

export function Reports() {
    const { profile } = useStore();
    const [expenseData, setExpenseData] = useState<ExpenseAnalysis | null>(null);
    const [loading, setLoading] = useState(false);

    const analyzeExpenses = async () => {
        setLoading(true);
        try {
            // Uses mock bank statement (no Google credentials needed)
            const result = await api.analyzeExpensesFromSheet();
            setExpenseData(result.analysis);
        } catch (error) {
            console.error('Expense analysis failed:', error);
            alert('Failed to analyze expenses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const userDisplayName = profile?.ownerName || 'User';

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pt-20">
            <Header userDisplayName={userDisplayName} activeTab="Reports" setActiveTab={() => { }} onLogout={() => { }} />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">
                        AI Expense Analyzer <span className="text-[#FACC15]">🧠</span>
                    </h1>
                    <p className="text-[#94A3B8] text-lg">Let AI categorize your expenses and calculate tax savings</p>
                </div>

                {!expenseData ? (
                    /* CTA Section */
                    <div className="bg-gradient-to-b from-[#FACC15] to-orange-500 rounded-[2rem] p-12 text-black text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-12 -mt-12"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-black/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Discover Hidden Tax Savings</h2>
                            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                                Our AI analyzes your bank transactions and tells you which are tax-deductible.
                                See instant savings!
                            </p>
                            <button
                                onClick={analyzeExpenses}
                                disabled={loading}
                                className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-black/80 transition-all shadow-xl inline-flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Analyze My Expenses
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                            <p className="text-sm mt-4 opacity-75">Uses sample bank statement (no credentials needed)</p>
                        </div>
                    </div>
                ) : (
                    /* Results Section */
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-[#171717]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div className="text-green-400 flex items-center gap-1 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full">
                                        <TrendingUp className="w-3 h-3" /> Tax Deductible
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1">
                                    ₹{expenseData.totalDeductible.toLocaleString('en-IN')}
                                </h3>
                                <p className="text-[#94A3B8] text-sm font-medium">Business Expenses</p>
                            </div>

                            <div className="bg-[#171717]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-[#FACC15]/10 rounded-2xl text-[#FACC15]">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-[#FACC15] mb-1">
                                    ₹{expenseData.taxSaved.toLocaleString('en-IN')}
                                </h3>
                                <p className="text-[#94A3B8] text-sm font-medium">Tax Saved (30% slab)</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-[2rem] p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-5 h-5 text-white" />
                                    <span className="text-xs font-bold text-white uppercase">AI Powered</span>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1">{expenseData.categorizedExpenses.length}</h3>
                                <p className="text-white/80 text-sm font-medium">Transactions Analyzed</p>
                            </div>
                        </div>

                        {/* Categorized Table */}
                        <div className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Expense Breakdown</h2>
                            <div className="space-y-3">
                                {expenseData.categorizedExpenses.map((expense, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-[#0A0A0A] rounded-xl border border-white/5 hover:border-[#FACC15]/30 transition-all"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${expense.category === 'Business'
                                                    ? 'bg-green-500/10 text-green-400'
                                                    : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {expense.category === 'Business' ? (
                                                    <CheckCircle2 className="w-5 h-5" />
                                                ) : (
                                                    <XCircle className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="text-white font-semibold">{expense.description}</h4>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${expense.category === 'Business'
                                                            ? 'bg-green-500/10 text-green-400'
                                                            : 'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {expense.category}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[#94A3B8]">{expense.reason}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setExpenseData(null)}
                                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                            >
                                Analyze Again
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
