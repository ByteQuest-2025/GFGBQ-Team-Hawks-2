import { useState } from 'react';
import { Calculator, FileText, Calendar, Banknote, Tag, ChevronUp, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

type ToolType = 'tax' | 'gst' | 'presumptive' | 'deadlines' | 'categorize';

interface ToolResult {
    success: boolean;
    data: any;
}

export function MCPToolsPanel() {
    const [activeTool, setActiveTool] = useState<ToolType | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ToolResult | null>(null);

    // Form states
    const [income, setIncome] = useState('');
    const [deductions80C, setDeductions80C] = useState('');
    const [deductions80D, setDeductions80D] = useState('');

    const [turnover, setTurnover] = useState('');
    const [state, setState] = useState('Maharashtra');
    const [isService, setIsService] = useState(true);

    const [grossReceipts, setGrossReceipts] = useState('');
    const [businessType, setBusinessType] = useState<'professional' | 'trader'>('professional');

    const [txnDescription, setTxnDescription] = useState('');
    const [txnAmount, setTxnAmount] = useState('');
    const [txnType, setTxnType] = useState<'credit' | 'debit'>('credit');

    const tools = [
        { id: 'tax' as ToolType, name: 'Tax Calculator', icon: Calculator, desc: 'Old vs New regime comparison' },
        { id: 'gst' as ToolType, name: 'GST Check', icon: FileText, desc: 'Registration requirement' },
        { id: 'presumptive' as ToolType, name: '44AD/44ADA', icon: Banknote, desc: 'Presumptive taxation' },
        { id: 'deadlines' as ToolType, name: 'Deadlines', icon: Calendar, desc: 'Upcoming due dates' },
        { id: 'categorize' as ToolType, name: 'Categorize', icon: Tag, desc: 'Transaction classification' }
    ];

    const parseAmount = (val: string): number => {
        const num = parseFloat(val.replace(/,/g, ''));
        return isNaN(num) ? 0 : num;
    };

    const formatCurrency = (num: number): string => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
    };

    const handleExecute = async () => {
        if (!activeTool) return;
        setLoading(true);
        setResult(null);

        try {
            let response;
            switch (activeTool) {
                case 'tax':
                    response = await api.calculateIncomeTax(parseAmount(income), {
                        d80c: parseAmount(deductions80C),
                        d80d: parseAmount(deductions80D)
                    });
                    break;
                case 'gst':
                    response = await api.checkGSTCompliance(parseAmount(turnover), isService, state);
                    break;
                case 'presumptive':
                    response = await api.checkPresumptiveTax(parseAmount(grossReceipts), businessType);
                    break;
                case 'deadlines':
                    response = await api.getTaxDeadlines('individual', false);
                    break;
                case 'categorize':
                    response = await api.categorizeTransaction(txnDescription, parseAmount(txnAmount), txnType);
                    break;
            }
            setResult({ success: true, data: response });
        } catch (err) {
            setResult({ success: false, data: { error: 'Tool execution failed' } });
        } finally {
            setLoading(false);
        }
    };

    const renderToolForm = () => {
        switch (activeTool) {
            case 'tax':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Annual Income</label>
                            <input
                                type="text"
                                value={income}
                                onChange={(e) => setIncome(e.target.value)}
                                placeholder="e.g., 1200000"
                                className="w-full bg-[#1a1b1e] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">80C Deductions</label>
                                <input
                                    type="text"
                                    value={deductions80C}
                                    onChange={(e) => setDeductions80C(e.target.value)}
                                    placeholder="Max 1,50,000"
                                    className="w-full bg-[#1a1b1e] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">80D Deductions</label>
                                <input
                                    type="text"
                                    value={deductions80D}
                                    onChange={(e) => setDeductions80D(e.target.value)}
                                    placeholder="Health Insurance"
                                    className="w-full bg-[#1a1b1e] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'gst':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Annual Turnover</label>
                            <input
                                type="text"
                                value={turnover}
                                onChange={(e) => setTurnover(e.target.value)}
                                placeholder="e.g., 2500000"
                                className="w-full bg-[#1a1b1e] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">State</label>
                            <select
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="w-full bg-[#1a1b1e] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                            >
                                <option>Maharashtra</option>
                                <option>Delhi</option>
                                <option>Karnataka</option>
                                <option>Tamil Nadu</option>
                                <option>Gujarat</option>
                                <option>West Bengal</option>
                                <option>Manipur</option>
                                <option>Mizoram</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={isService}
                                onChange={(e) => setIsService(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600"
                            />
                            <label className="text-sm text-gray-300">Service Provider</label>
                        </div>
                    </div>
                );

            case 'presumptive':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Gross Receipts</label>
                            <input
                                type="text"
                                value={grossReceipts}
                                onChange={(e) => setGrossReceipts(e.target.value)}
                                placeholder="e.g., 5000000"
                                className="w-full bg-[#1a1b1e] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Business Type</label>
                            <select
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value as 'professional' | 'trader')}
                                className="w-full bg-[#1a1b1e] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                            >
                                <option value="professional">Professional (Doctor, CA, etc.)</option>
                                <option value="trader">Trader / Manufacturer</option>
                            </select>
                        </div>
                    </div>
                );

            case 'deadlines':
                return (
                    <div className="text-gray-400 text-sm">
                        Click "Run Tool" to fetch upcoming tax deadlines based on your profile.
                    </div>
                );

            case 'categorize':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Transaction Description</label>
                            <input
                                type="text"
                                value={txnDescription}
                                onChange={(e) => setTxnDescription(e.target.value)}
                                placeholder="e.g., Consulting fees from ABC Corp"
                                className="w-full bg-[#1a1b1e] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Amount</label>
                                <input
                                    type="text"
                                    value={txnAmount}
                                    onChange={(e) => setTxnAmount(e.target.value)}
                                    placeholder="50000"
                                    className="w-full bg-[#1a1b1e] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Type</label>
                                <select
                                    value={txnType}
                                    onChange={(e) => setTxnType(e.target.value as 'credit' | 'debit')}
                                    className="w-full bg-[#1a1b1e] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                                >
                                    <option value="credit">Credit (Income)</option>
                                    <option value="debit">Debit (Expense)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const renderResult = () => {
        if (!result) return null;

        if (!result.success) {
            return (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    Error: {result.data.error}
                </div>
            );
        }

        const data = result.data;

        if (activeTool === 'tax') {
            return (
                <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                            <div className="text-orange-400 text-sm font-medium mb-1">Old Regime</div>
                            <div className="text-2xl font-bold text-white">{formatCurrency(data.old_regime?.totalTax || 0)}</div>
                            <div className="text-xs text-gray-400 mt-1">Effective: {(data.old_regime?.effectiveRate || 0).toFixed(1)}%</div>
                        </div>
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                            <div className="text-emerald-400 text-sm font-medium mb-1">New Regime</div>
                            <div className="text-2xl font-bold text-white">{formatCurrency(data.new_regime?.totalTax || 0)}</div>
                            <div className="text-xs text-gray-400 mt-1">Effective: {(data.new_regime?.effectiveRate || 0).toFixed(1)}%</div>
                        </div>
                    </div>
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-300 text-sm">
                        {data.recommendation}
                    </div>
                </div>
            );
        }

        if (activeTool === 'gst') {
            return (
                <div className="mt-4 p-4 bg-[#1a1b1e] rounded-lg border border-gray-700">
                    <div className={`text-lg font-bold mb-2 ${data.registrationRequired ? 'text-red-400' : 'text-emerald-400'}`}>
                        GST Registration: {data.registrationRequired ? 'REQUIRED' : 'NOT REQUIRED'}
                    </div>
                    <div className="text-sm text-gray-300 space-y-1">
                        <p>Threshold: {data.limitDescription}</p>
                        <p className="text-indigo-300">{data.recommendedAction}</p>
                    </div>
                </div>
            );
        }

        if (activeTool === 'presumptive') {
            return (
                <div className="mt-4 p-4 bg-[#1a1b1e] rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-white">Section {data.section}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${data.eligible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {data.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                        </span>
                    </div>
                    <div className="text-sm text-gray-300 space-y-2">
                        <p>Deemed Income: {formatCurrency(data.deemedIncome)}</p>
                        <p>Estimated Tax: {formatCurrency(data.taxOnDeemedIncome)}</p>
                        <p className="text-gray-400 text-xs">{data.explanation}</p>
                    </div>
                </div>
            );
        }

        if (activeTool === 'deadlines') {
            return (
                <div className="mt-4 space-y-2">
                    {(data.upcoming_deadlines || []).slice(0, 6).map((d: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-[#1a1b1e] rounded-lg border border-gray-700">
                            <div>
                                <div className="text-white font-medium">{d.name}</div>
                                <div className="text-xs text-gray-400">{d.description}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-300">{d.date}</div>
                                <div className={`text-xs font-medium ${d.urgency === 'CRITICAL' ? 'text-red-400' : d.urgency === 'WARNING' ? 'text-yellow-400' : 'text-gray-400'}`}>
                                    {d.daysUntil < 0 ? 'OVERDUE' : `${d.daysUntil} days`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (activeTool === 'categorize') {
            return (
                <div className="mt-4 p-4 bg-[#1a1b1e] rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium">
                            {data.category}
                        </span>
                        {data.gstApplicable && <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">GST</span>}
                        {data.tdsApplicable && <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">TDS</span>}
                    </div>
                    <div className="text-sm text-gray-300 space-y-2">
                        <p>{data.taxImplication}</p>
                        <p className="text-indigo-300">{data.suggestedAction}</p>
                    </div>
                </div>
            );
        }

        return (
            <pre className="mt-4 p-4 bg-[#1a1b1e] rounded-lg text-xs text-gray-300 overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>
        );
    };

    return (
        <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="h-14 border-b border-gray-800 flex items-center justify-between px-5 bg-[#15161a]">
                <div className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5 text-indigo-500" />
                    <span className="font-semibold text-white">TaxAlly Tools</span>
                </div>
                <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">MCP</span>
            </div>

            {/* Tool Selector */}
            <div className="p-4 grid grid-cols-5 gap-2">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => {
                            setActiveTool(activeTool === tool.id ? null : tool.id);
                            setResult(null);
                        }}
                        className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${activeTool === tool.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[#1a1b1e] text-gray-400 hover:text-white hover:bg-[#232428]'
                            }`}
                    >
                        <tool.icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{tool.name}</span>
                    </button>
                ))}
            </div>

            {/* Active Tool Panel */}
            {activeTool && (
                <div className="px-4 pb-4">
                    <div className="p-4 bg-[#15161a] rounded-xl border border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-medium">{tools.find(t => t.id === activeTool)?.name}</h3>
                            <button onClick={() => setActiveTool(null)} className="text-gray-500 hover:text-white">
                                <ChevronUp className="h-4 w-4" />
                            </button>
                        </div>

                        {renderToolForm()}

                        <button
                            onClick={handleExecute}
                            disabled={loading}
                            className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Run Tool'
                            )}
                        </button>

                        {renderResult()}
                    </div>
                </div>
            )}
        </div>
    );
}
