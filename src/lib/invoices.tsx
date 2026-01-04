import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Invoice } from '../types';

interface InvoicesContextType {
    invoices: Invoice[];
    loading: boolean;
    totalExpenses: number;
    categoryTotals: Record<string, number>;
    monthlyTrends: { month: string; amount: number }[];
    addInvoice: (file: File, metadata?: Partial<Invoice>) => Promise<string> | string;
    updateInvoice: (id: string, updates: Partial<Invoice>) => void;
    deleteInvoice: (id: string) => void;
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined);

const STORAGE_KEY = 'taxally_invoices';

// Initial dummy data for demo purposes
const INITIAL_INVOICES: Invoice[] = [
    {
        id: 'INV-001',
        vendor: 'Amazon Web Services',
        category: 'Software',
        amount: 12450,
        date: new Date('2026-01-02'),
        status: 'Verified',
        fileURL: 'https://cdn-icons-png.flaticon.com/512/337/337946.png',
        fileName: 'aws_invoice.pdf',
        ownerId: 'demo',
        createdAt: new Date('2026-01-02')
    },
    {
        id: 'INV-002',
        vendor: 'WeWork India',
        category: 'Rent',
        amount: 45000,
        date: new Date('2026-01-01'),
        status: 'Pending',
        fileURL: 'https://cdn-icons-png.flaticon.com/512/337/337946.png',
        fileName: 'wework_jan.pdf',
        ownerId: 'demo',
        createdAt: new Date('2026-01-01')
    },
    {
        id: 'INV-003',
        vendor: 'Uber Business',
        category: 'Travel',
        amount: 850,
        date: new Date('2025-12-28'),
        status: 'Verified',
        fileURL: 'https://cdn-icons-png.flaticon.com/512/337/337946.png',
        fileName: 'uber_dec.pdf',
        ownerId: 'demo',
        createdAt: new Date('2025-12-28')
    },
    {
        id: 'INV-004',
        vendor: 'Apple Store',
        category: 'Electronics',
        amount: 124900,
        date: new Date('2025-12-25'),
        status: 'Flagged',
        fileURL: 'https://cdn-icons-png.flaticon.com/512/337/337946.png',
        fileName: 'apple_receipt.pdf',
        ownerId: 'demo',
        createdAt: new Date('2025-12-25')
    },
    {
        id: 'INV-005',
        vendor: 'Zoho Books',
        category: 'Software',
        amount: 2499,
        date: new Date('2025-12-20'),
        status: 'Verified',
        fileURL: 'https://cdn-icons-png.flaticon.com/512/337/337946.png',
        fileName: 'zoho_subscription.pdf',
        ownerId: 'demo',
        createdAt: new Date('2025-12-20')
    }
];

export function InvoicesProvider({ children }: { children: ReactNode }) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    // 📦 LOAD FROM LOCALSTORAGE ON MOUNT
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Convert date strings back to Date objects
                const withDates = parsed.map((inv: any) => ({
                    ...inv,
                    date: new Date(inv.date),
                    createdAt: new Date(inv.createdAt)
                }));
                setInvoices(withDates);
            } else {
                // First time - use initial dummy data
                setInvoices(INITIAL_INVOICES);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVOICES));
            }
        } catch (error) {
            console.error('Error loading invoices from localStorage:', error);
            setInvoices(INITIAL_INVOICES);
        } finally {
            setLoading(false);
        }
    }, []);

    // 💾 AUTO-SAVE TO LOCALSTORAGE WHENEVER INVOICES CHANGE
    useEffect(() => {
        if (!loading && invoices.length > 0) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
                console.log('✅ Invoices saved to localStorage');
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
        }
    }, [invoices, loading]);

    // 📊 ANALYTICS CALCULATIONS (For Reports)
    const { totalExpenses, categoryTotals, monthlyTrends } = useMemo(() => {
        let total = 0;
        const cats: Record<string, number> = {};
        const trends: Record<string, number> = {};

        invoices.forEach(invoice => {
            const val = Number(invoice.amount) || 0;
            total += val;

            // Category totals
            const cat = invoice.category || 'Uncategorized';
            cats[cat] = (cats[cat] || 0) + val;

            // Monthly trends
            if (invoice.date) {
                const finalDate = invoice.date instanceof Date ? invoice.date : new Date(invoice.date);
                const monthKey = finalDate.toLocaleString('default', { month: 'short', year: 'numeric' });
                trends[monthKey] = (trends[monthKey] || 0) + val;
            }
        });

        const sortedMonths = Object.keys(trends).map(key => ({
            month: key,
            amount: trends[key]
        }));

        return { totalExpenses: total, categoryTotals: cats, monthlyTrends: sortedMonths };
    }, [invoices]);

    // ➕ ADD NEW INVOICE (File picker triggered)
    const addInvoice = async (file: File, metadata?: Partial<Invoice>): Promise<string> => {
        const newId = crypto.randomUUID();

        const newInvoice: Invoice = {
            id: newId,
            vendor: metadata?.vendor || 'New Vendor',
            category: metadata?.category || 'Uncategorized',
            amount: Number(metadata?.amount) || 0,
            date: metadata?.date ? new Date(metadata.date) : new Date(),
            status: (metadata?.status as any) || 'Pending',
            fileURL: 'https://cdn-icons-png.flaticon.com/512/337/337946.png',
            fileName: file.name,
            ownerId: 'local',
            createdAt: new Date()
        };

        // Add to beginning of array (newest first)
        setInvoices(prev => [newInvoice, ...prev]);
        console.log('✅ New invoice created:', newId);

        return newId;
    };

    // ✏️ UPDATE INVOICE
    const updateInvoice = (id: string, updates: Partial<Invoice>) => {
        setInvoices(prev => prev.map(inv =>
            inv.id === id ? { ...inv, ...updates } : inv
        ));
        console.log('✅ Invoice updated:', id);
    };

    // 🗑️ DELETE INVOICE
    const deleteInvoice = (id: string) => {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
        console.log('✅ Invoice deleted:', id);
    };

    return (
        <InvoicesContext.Provider value={{
            invoices,
            loading,
            totalExpenses,
            categoryTotals,
            monthlyTrends,
            addInvoice,
            updateInvoice,
            deleteInvoice
        }}>
            {children}
        </InvoicesContext.Provider>
    );
}

export function useInvoices() {
    const context = useContext(InvoicesContext);
    if (!context) {
        throw new Error('useInvoices must be used within InvoicesProvider');
    }
    return context;
}
