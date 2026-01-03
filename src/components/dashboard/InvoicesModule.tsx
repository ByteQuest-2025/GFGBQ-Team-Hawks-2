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
    Clock,
    Upload,
    Loader2,
    Check
} from 'lucide-react';
import { api } from '../../lib/api';

interface Invoice {
    id: string;
    vendor: string;
    category: string;
    date: string;
    amount: string;
    status: string;
    isEditing?: boolean;
}

export const InvoicesModule = () => {
    // 1. STATE MANAGEMENT
    const [invoices, setInvoices] = useState<Invoice[]>([
        { id: 'INV-001', vendor: 'Amazon Web Services', category: 'Software', date: '2026-01-02', amount: '₹12,450.00', status: 'Verified' },
        { id: 'INV-002', vendor: 'WeWork India', category: 'Rent', date: '2026-01-01', amount: '₹45,000.00', status: 'Pending' },
        { id: 'INV-003', vendor: 'Uber Business', category: 'Travel', date: '2025-12-28', amount: '₹850.00', status: 'Verified' },
        { id: 'INV-004', vendor: 'Apple Store', category: 'Electronics', date: '2025-12-25', amount: '₹1,24,900.00', status: 'Flagged' },
        { id: 'INV-005', vendor: 'Zoho Books', category: 'Software', date: '2025-12-20', amount: '₹2,499.00', status: 'Verified' },
    ]);
    const [selectedTab, setSelectedTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const tabs = ['All', 'Pending', 'Verified', 'Flagged'];
    const categories = ['Software', 'Rent', 'Travel', 'Electronics', 'Marketing', 'Uncategorized'];

    // 2. SEARCH & FILTER LOGIC
    const filteredInvoices = invoices.filter(invoice => {
        const matchesTab = selectedTab === 'All' || invoice.status === selectedTab;
        const matchesSearch =
            invoice.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // 3. "ADD NEW INVOICE" FUNCTIONALITY
    const handleFileUpload = async (file: File) => {
        // Simulation only
        setUploading(true);
        setShowToast(true);

        // HACKATHON STRATEGY: Show processing toast
        setTimeout(() => {
            const newInvoice: Invoice = {
                id: `INV-${Math.floor(Math.random() * 10000)}`,
                vendor: '', // Empty initially for auto-focus typing
                category: 'Uncategorized',
                date: new Date().toISOString().split('T')[0],
                amount: '₹0.00', // In a real app this would be extracted
                status: 'Pending',
                isEditing: true // Start in edit mode
            };
            setInvoices([newInvoice, ...invoices]);
            setUploading(false);

            // Hide toast after a bit
            setTimeout(() => setShowToast(false), 2000);
        }, 2000);
    };

    // 6. HACKATHON STRATEGY (Download)
    const handleDownload = () => {
        setDownloading(true);
        setTimeout(() => {
            setDownloading(false);
            // In a real app, logic to trigger CSV download would go here
            alert("CSV Exported Successfully!");
        }, 1500);
    };

    // INLINE EDITING FUNCTIONS
    const updateInvoice = (id: string, field: keyof Invoice, value: any) => {
        setInvoices(invoices.map(inv =>
            inv.id === id ? { ...inv, [field]: value } : inv
        ));
    };

    const saveInvoice = (id: string) => {
        setInvoices(invoices.map(inv => {
            if (inv.id === id) {
                return {
                    ...inv,
                    isEditing: false,
                    vendor: inv.vendor || 'Unknown Vendor' // Fallback
                };
            }
            return inv;
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
        if (e.key === 'Enter') {
            saveInvoice(id);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Verified': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'Pending': return 'text-[#FACC15] bg-[#FACC15]/10 border-[#FACC15]/20'; // Amber/Yellow
            case 'Flagged': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full relative"
        >
            {/* TOAST NOTIFICATION */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className="fixed top-24 left-1/2 z-50 bg-[#171717] border border-[#FACC15]/20 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3"
                    >
                        <Loader2 className="w-5 h-5 text-[#FACC15] animate-spin" />
                        <span className="font-medium">Processing AI Analysis...</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Invoices</h1>
                    <p className="text-[#9CA3AF]">Manage and track your business expenses.</p>
                </div>
                <label className={`bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(250,204,21,0.2)] cursor-pointer ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                        className="hidden"
                        disabled={uploading}
                    />
                    {uploading ? (
                        <>Analyzing...</>
                    ) : (
                        <>
                            <Plus size={18} /> Add New Invoice
                        </>
                    )}
                </label>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-[#171717] p-2 rounded-2xl border border-white/5">
                <div className="flex p-1 bg-black/20 rounded-xl overflow-x-auto max-w-full">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedTab === tab
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search invoices..."
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#FACC15]/50 transition-colors"
                        />
                    </div>
                    {/* Filter Button (Visual only for now) */}
                    <button className="p-2 bg-[#0A0A0A] border border-white/10 rounded-xl text-[#9CA3AF] hover:text-white transition-colors">
                        <Filter size={18} />
                    </button>

                    {/* Download Button */}
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="p-2 bg-[#0A0A0A] border border-white/10 rounded-xl text-[#9CA3AF] hover:text-white transition-colors relative"
                    >
                        {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#171717] border border-white/5 rounded-[2rem] overflow-hidden min-h-[400px]">
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
                            <AnimatePresence>
                                {filteredInvoices.map((invoice, index) => (
                                    <motion.tr
                                        key={invoice.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`group hover:bg-white/[0.02] cursor-pointer transition-colors ${invoice.isEditing ? 'bg-white/[0.02]' : ''}`}
                                    >
                                        <td className="py-4 px-6 text-white text-sm font-medium" onClick={() => !invoice.isEditing && setSelectedInvoice(invoice)}>{invoice.date}</td>

                                        {/* EDITABLE VENDOR */}
                                        <td className="py-4 px-6">
                                            {invoice.isEditing ? (
                                                <input
                                                    type="text"
                                                    value={invoice.vendor}
                                                    onChange={(e) => updateInvoice(invoice.id, 'vendor', e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, invoice.id)}
                                                    autoFocus
                                                    placeholder="Enter Vendor Name"
                                                    className="w-full bg-transparent border-b border-[#FACC15] text-white text-sm font-bold focus:outline-none px-1 py-1"
                                                />
                                            ) : (
                                                <span className="text-white text-sm font-bold" onClick={() => setSelectedInvoice(invoice)}>{invoice.vendor}</span>
                                            )}
                                        </td>

                                        {/* EDITABLE CATEGORY */}
                                        <td className="py-4 px-6">
                                            {invoice.isEditing ? (
                                                <select
                                                    value={invoice.category}
                                                    onChange={(e) => updateInvoice(invoice.id, 'category', e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, invoice.id)}
                                                    className="bg-[#0A0A0A] border border-[#FACC15] text-white text-xs rounded-md px-2 py-1 outline-none"
                                                >
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="inline-block px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-[#9CA3AF]" onClick={() => setSelectedInvoice(invoice)}>
                                                    {invoice.category}
                                                </span>
                                            )}
                                        </td>

                                        {/* EDITABLE AMOUNT */}
                                        <td className="py-4 px-6">
                                            {invoice.isEditing ? (
                                                <input
                                                    type="text"
                                                    value={invoice.amount}
                                                    onChange={(e) => updateInvoice(invoice.id, 'amount', e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, invoice.id)}
                                                    placeholder="₹0.00"
                                                    className="w-24 bg-transparent border-b border-[#FACC15] text-white text-sm font-mono focus:outline-none px-1 py-1"
                                                />
                                            ) : (
                                                <span className="text-white text-sm font-mono" onClick={() => setSelectedInvoice(invoice)}>{invoice.amount}</span>
                                            )}
                                        </td>

                                        <td className="py-4 px-6" onClick={() => !invoice.isEditing && setSelectedInvoice(invoice)}>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(invoice.status)}`}>
                                                    {invoice.status === 'Verified' && <CheckCircle2 size={12} />}
                                                    {invoice.status === 'Pending' && <Clock size={12} />}
                                                    {invoice.status === 'Flagged' && <AlertCircle size={12} />}
                                                    {invoice.status}
                                                </span>

                                                {/* AI Tip for Flagged Items */}
                                                {invoice.status === 'Flagged' && (
                                                    <div className="group/tooltip relative">
                                                        <AlertCircle className="w-4 h-4 text-red-400 opacity-60 hover:opacity-100 transition-opacity" />
                                                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 bg-black border border-white/10 p-2 rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-10">
                                                            <p className="text-xs text-red-200">Possible duplicate found</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {invoice.isEditing ? (
                                                <button
                                                    onClick={() => saveInvoice(invoice.id)}
                                                    className="p-2 bg-[#FACC15]/20 hover:bg-[#FACC15]/30 rounded-lg text-[#FACC15] transition-colors"
                                                    title="Save"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    className="p-2 hover:bg-white/10 rounded-lg text-[#9CA3AF] hover:text-white transition-colors"
                                                    onClick={() => setSelectedInvoice(invoice)}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>

                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-[#9CA3AF]">
                                        No invoices found matching your search.
                                    </td>
                                </tr>
                            )}
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
                                                {selectedInvoice.status === 'Flagged'
                                                    ? 'This invoice has been flagged as a potential duplicate. Please review previous records.'
                                                    : 'This invoice helps reduce your GST liability by approx 18%. Ensure the GSTIN matches your profile.'}
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
