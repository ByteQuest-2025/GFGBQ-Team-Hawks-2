import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Plus, 
    FileText, 
    MoreVertical, 
    Filter,
    Download,
    Eye,
    X, 
    CheckCircle2, 
    AlertCircle,
    Clock
} from 'lucide-react';

export const InvoicesModule = () => {
    const [selectedTab, setSelectedTab] = useState('All');
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    const tabs = ['All', 'Pending', 'Verified', 'Flagged'];

    // Mock Data
    const invoices = [
        { id: 'INV-001', vendor: 'Amazon Web Services', category: 'Software', date: '2026-01-02', amount: '₹12,450.00', status: 'Verified' },
        { id: 'INV-002', vendor: 'WeWork India', category: 'Rent', date: '2026-01-01', amount: '₹45,000.00', status: 'Pending' },
        { id: 'INV-003', vendor: 'Uber Business', category: 'Travel', date: '2025-12-28', amount: '₹850.00', status: 'Verified' },
        { id: 'INV-004', vendor: 'Apple Store', category: 'Electronics', date: '2025-12-25', amount: '₹1,24,900.00', status: 'Flagged' },
        { id: 'INV-005', vendor: 'Zoho Books', category: 'Software', date: '2025-12-20', amount: '₹2,499.00', status: 'Verified' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Verified': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'Pending': return 'text-[#FACC15] bg-[#FACC15]/10 border-[#FACC15]/20';
            case 'Flagged': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Invoices</h1>
                    <p className="text-[#9CA3AF]">Manage and track your business expenses.</p>
                </div>
                <button className="bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                    <Plus size={18} /> Add New Invoice
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-[#171717] p-2 rounded-2xl border border-white/5">
                <div className="flex p-1 bg-black/20 rounded-xl">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedTab === tab 
                                ? 'bg-[#FACC15] text-black shadow-lg' 
                                : 'text-[#9CA3AF] hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search invoices..." 
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#FACC15]/50"
                        />
                    </div>
                    <button className="p-2 bg-[#0A0A0A] border border-white/10 rounded-xl text-[#9CA3AF] hover:text-white transition-colors">
                        <Filter size={18} />
                    </button>
                    <button className="p-2 bg-[#0A0A0A] border border-white/10 rounded-xl text-[#9CA3AF] hover:text-white transition-colors">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#171717] border border-white/5 rounded-[2rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-black/20 border-b border-white/5">
                            <tr>
                                <th className="text-left py-5 px-6 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Date</th>
                                <th className="text-left py-5 px-6 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Vendor</th>
                                <th className="text-left py-5 px-6 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Category</th>
                                <th className="text-left py-5 px-6 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Amount</th>
                                <th className="text-left py-5 px-6 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Status</th>
                                <th className="text-right py-5 px-6 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {invoices.map((invoice, index) => (
                                <motion.tr 
                                    key={invoice.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedInvoice(invoice)}
                                    className="group hover:bg-white/[0.02] cursor-pointer transition-colors"
                                >
                                    <td className="py-4 px-6 text-white text-sm font-medium">{invoice.date}</td>
                                    <td className="py-4 px-6 text-white text-sm font-bold">{invoice.vendor}</td>
                                    <td className="py-4 px-6">
                                        <span className="inline-block px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-[#9CA3AF]">
                                            {invoice.category}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-white text-sm font-mono">{invoice.amount}</td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(invoice.status)}`}>
                                            {invoice.status === 'Verified' && <CheckCircle2 size={12} />}
                                            {invoice.status === 'Pending' && <Clock size={12} />}
                                            {invoice.status === 'Flagged' && <AlertCircle size={12} />}
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-[#9CA3AF] hover:text-white transition-colors">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick View Side Panel */}
            <AnimatePresence>
                {selectedInvoice && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedInvoice(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-[#171717] border-l border-white/10 z-[70] p-6 shadow-2xl overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold text-white">Invoice Details</h2>
                                <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-white/10 rounded-full text-[#9CA3AF] transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-10 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center border-dashed">
                                    <FileText className="w-16 h-16 text-[#9CA3AF]" />
                                </div>

                                <div>
                                    <p className="text-sm text-[#9CA3AF] mb-1">Vendor</p>
                                    <h3 className="text-lg font-bold text-white">{selectedInvoice.vendor}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-[#9CA3AF] mb-1">Date</p>
                                        <p className="text-white">{selectedInvoice.date}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#9CA3AF] mb-1">Amount</p>
                                        <p className="text-white font-mono">{selectedInvoice.amount}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-[#FACC15]/5 border border-[#FACC15]/20 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <Eye className="w-5 h-5 text-[#FACC15] shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-[#FACC15] font-bold text-sm mb-1">AI Insight</h4>
                                            <p className="text-xs text-[#FACC15]/80 leading-relaxed">
                                                This invoice helps reduce your GST liability by approx ₹2,240. Ensure the GSTIN matches your profile.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                                        View PDF
                                    </button>
                                    <button className="flex-1 bg-transparent border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/5 transition-colors">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
