import React, { useState, useEffect, useRef } from 'react';
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
    Loader2,
    Check
} from 'lucide-react';
import { useInvoices } from '../../lib/invoices';
import type { Invoice } from '../../types';

export const InvoicesModule = () => {
    // 1. STATE MANAGEMENT
    const { invoices, loading, addInvoice, updateInvoice } = useInvoices();

    const [selectedTab, setSelectedTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [uploading, setUploading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Invoice>>({});

    const tabs = ['All', 'Pending', 'Verified', 'Flagged'];
    const categories = ['Software', 'Rent', 'Travel', 'Electronics', 'Marketing', 'Uncategorized'];

    // 2. SEARCH & FILTER LOGIC
    const filteredInvoices = invoices.filter(invoice => {
        const matchesTab = selectedTab === 'All' || invoice.status === selectedTab;
        const matchesSearch =
            (invoice.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (invoice.category || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // 3. WORKFLOW: UPLOAD -> INSTANT ROW -> AUTO-FOCUS EDIT
    const handleFileUpload = async (file: File) => {
        setUploading(true);
        setShowToast(true);

        try {
            // Simulate AI Analysis Delay for "Vibe"
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create placeholder entry in local state/storage
            const newId = await addInvoice(file, {
                vendor: '', // Empty for user to fill
                amount: 0,
                category: 'Uncategorized',
                status: 'Pending',
                date: new Date()
            });

            // Immediately enter editing mode for the new row
            setEditingId(newId);
            setEditForm({
                vendor: '',
                category: 'Uncategorized',
                amount: 0
            });

        } catch (e) {
            console.error("Upload simulation failed", e);
        } finally {
            setUploading(false);
            setShowToast(false);
        }
    };

    // 4. INLINE EDITING LOGIC
    const startEditing = (invoice: Invoice) => {
        setEditingId(invoice.id);
        setEditForm({
            vendor: invoice.vendor,
            category: invoice.category,
            amount: invoice.amount
        });
    };

    const handleEditChange = (field: keyof Invoice, value: any) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const saveEdit = async (id: string) => {
        try {
            // Ensure amount is saved as a number for Reports calculations
            const amountVal = editForm.amount as any;
            const finalAmount = typeof amountVal === 'string'
                ? parseFloat(amountVal.replace(/[^0-9.]/g, ''))
                : amountVal;

            await updateInvoice(id, {
                ...editForm,
                amount: isNaN(finalAmount as number) ? 0 : finalAmount
            });
            setEditingId(null);
            setEditForm({});
        } catch (error) {
            console.error("Failed to save", error);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
        if (e.key === 'Enter') saveEdit(id);
        if (e.key === 'Escape') cancelEdit();
    };

    // 5. COLOR LOGIC: Green (Verified), Red (Pending), Orange (Flagged)
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Verified': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'Pending': return 'text-red-400 bg-red-500/10 border-red-500/20'; // RED as requested
            case 'Flagged': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'; // ORANGE as requested
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    const formatDate = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        return isNaN(d.getTime()) ? String(date) : d.toLocaleDateString('en-IN');
    };

    const formatAmount = (amount: number | string) => {
        const val = typeof amount === 'string' ? parseFloat(amount) : amount;
        return `₹${(val || 0).toLocaleString('en-IN')}`;
    };

    if (loading) return <div className="text-white p-10 font-medium">Synchronizing Invoices...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full relative"
        >
            {/* AI PROCESSING TOAST */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className="fixed top-24 left-1/2 z-50 bg-[#1A1A1A] border border-[#FACC15]/30 text-white px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center gap-4"
                    >
                        <div className="bg-[#FACC15]/10 p-2 rounded-lg">
                            <Loader2 className="w-5 h-5 text-[#FACC15] animate-spin" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">AI Analysis in progress...</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Extracting Metadata</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Invoices</h1>
                    <p className="text-[#9CA3AF] text-sm">Manage and track your business expenses.</p>
                </div>
                <label className={`bg-[#FACC15] hover:bg-yellow-300 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(250,204,21,0.2)] active:scale-95 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                        type="file"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                        className="hidden"
                        disabled={uploading}
                    />
                    <Plus size={20} /> Add New Invoice
                </label>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-[#111111] p-2 rounded-2xl border border-white/5">
                <div className="flex p-1 bg-black/40 rounded-xl">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${selectedTab === tab
                                ? 'bg-[#FACC15] text-black shadow-lg'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search records..."
                            className="w-full bg-[#080808] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FACC15]/40 transition-all"
                        />
                    </div>
                    <button className="p-2.5 bg-[#080808] border border-white/10 rounded-xl text-gray-500 hover:text-white transition-colors">
                        <Filter size={18} />
                    </button>
                    <button onClick={() => alert("Exporting Local Data...")} className="p-2.5 bg-[#080808] border border-white/10 rounded-xl text-gray-500 hover:text-white transition-colors">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#0F0F0F] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Date</th>
                                <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Vendor</th>
                                <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Category</th>
                                <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Amount</th>
                                <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Status</th>
                                <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {filteredInvoices.map((invoice) => {
                                    const isEditing = editingId === invoice.id;
                                    return (
                                        <motion.tr
                                            layout
                                            key={invoice.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={`group hover:bg-white/[0.01] transition-colors ${isEditing ? 'bg-white/[0.03]' : ''}`}
                                        >
                                            <td className="py-4 px-6 text-gray-400 text-sm font-medium">{formatDate(invoice.date)}</td>

                                            <td className="py-4 px-6">
                                                {isEditing ? (
                                                    <input
                                                        autoFocus
                                                        value={editForm.vendor || ''}
                                                        onChange={(e) => handleEditChange('vendor', e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(e, invoice.id)}
                                                        className="bg-transparent border-b-2 border-[#FACC15] text-white font-bold outline-none py-1 w-full"
                                                        placeholder="Vendor Name"
                                                    />
                                                ) : (
                                                    <span className="text-white font-bold tracking-tight">{invoice.vendor}</span>
                                                )}
                                            </td>

                                            <td className="py-4 px-6">
                                                {isEditing ? (
                                                    <select
                                                        value={editForm.category || ''}
                                                        onChange={(e) => handleEditChange('category', e.target.value)}
                                                        className="bg-[#080808] border border-white/20 text-white text-xs rounded-lg px-2 py-1 outline-none focus:border-[#FACC15]"
                                                    >
                                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                        {invoice.category}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-4 px-6">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editForm.amount || ''}
                                                        onChange={(e) => handleEditChange('amount', e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(e, invoice.id)}
                                                        className="bg-transparent border-b-2 border-[#FACC15] text-white font-mono outline-none py-1 w-24"
                                                        placeholder="0.00"
                                                    />
                                                ) : (
                                                    <span className="text-white font-mono font-bold">{formatAmount(invoice.amount)}</span>
                                                )}
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(invoice.status)}`}>
                                                    {invoice.status === 'Verified' ? <CheckCircle2 size={12} /> : invoice.status === 'Pending' ? <Clock size={12} /> : <AlertCircle size={12} />}
                                                    {invoice.status}
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 text-right">
                                                {isEditing ? (
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => saveEdit(invoice.id)} className="p-2 bg-[#FACC15] rounded-lg text-black hover:scale-110 transition-transform">
                                                            <Check size={16} strokeWidth={3} />
                                                        </button>
                                                        <button onClick={cancelEdit} className="p-2 bg-red-500/20 rounded-lg text-red-500">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => startEditing(invoice)} className="p-2 text-gray-600 hover:text-white transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};