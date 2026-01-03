import { useState } from 'react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { Header } from '../components/Header';

interface InvoiceData {
    id: string;
    fileName: string;
    timestamp: Date;
    extractedData: {
        vendorName?: string;
        invoiceNumber?: string;
        invoiceDate?: string;
        totalAmount?: string;
        gstNumber?: string;
        items?: string[];
    };
}

export function Invoices() {
    const { profile } = useStore();
    const [uploads, setUploads] = useState<InvoiceData[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        setAnalyzing(true);

        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const base64 = reader.result as string;
                const result = await api.analyzeDocument(base64);

                const newUpload: InvoiceData = {
                    id: Date.now().toString(),
                    fileName: file.name,
                    timestamp: new Date(),
                    extractedData: result.extractedData || {}
                };

                setUploads([newUpload, ...uploads]);
            } catch (error) {
                console.error('Document analysis failed:', error);
                alert('Failed to analyze document. Please try again.');
            } finally {
                setAnalyzing(false);
            }
        };

        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const userDisplayName = profile?.ownerName || 'User';

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pt-20">
            <Header userDisplayName={userDisplayName} activeTab="Invoices" setActiveTab={() => { }} onLogout={() => { }} />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">
                        Invoice Scanner <span className="text-[#FACC15]">✨</span>
                    </h1>
                    <p className="text-[#94A3B8] text-lg">Upload invoices and let AI extract all the details</p>
                </div>

                {/* Upload Zone */}
                <div
                    className={`mb-8 bg-[#171717]/60 backdrop-blur-xl border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${dragActive
                            ? 'border-[#FACC15] bg-[#FACC15]/5'
                            : 'border-white/10 hover:border-[#FACC15]/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    {analyzing ? (
                        <div className="py-8">
                            <Loader className="w-12 h-12 text-[#FACC15] mx-auto mb-4 animate-spin" />
                            <p className="text-white font-bold">Analyzing invoice with AI...</p>
                            <p className="text-[#94A3B8] text-sm mt-2">This takes about 3-5 seconds</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-[#FACC15]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-8 h-8 text-[#FACC15]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Drop your invoice here</h3>
                            <p className="text-[#94A3B8] mb-6">or click to browse files</p>
                            <label className="inline-block">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                                    className="hidden"
                                />
                                <span className="bg-[#FACC15] text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition-all cursor-pointer inline-flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Choose File
                                </span>
                            </label>
                            <p className="text-xs text-[#94A3B8] mt-4">Supports: JPG, PNG, PDF</p>
                        </>
                    )}
                </div>

                {/* Recent Uploads */}
                {uploads.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Recent Scans</h2>
                        <div className="space-y-4">
                            {uploads.map((upload) => (
                                <div
                                    key={upload.id}
                                    className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 hover:border-[#FACC15]/30 transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-lg font-bold text-white">{upload.fileName}</h3>
                                                <span className="text-xs text-[#94A3B8]">
                                                    {upload.timestamp.toLocaleString('en-IN')}
                                                </span>
                                            </div>

                                            {/* Extracted Data */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {upload.extractedData.vendorName && (
                                                    <div className="p-3 bg-[#0A0A0A] rounded-xl">
                                                        <p className="text-xs text-[#94A3B8] mb-1">Vendor</p>
                                                        <p className="text-white font-semibold">{upload.extractedData.vendorName}</p>
                                                    </div>
                                                )}
                                                {upload.extractedData.totalAmount && (
                                                    <div className="p-3 bg-[#0A0A0A] rounded-xl">
                                                        <p className="text-xs text-[#94A3B8] mb-1">Amount</p>
                                                        <p className="text-[#FACC15] font-bold">{upload.extractedData.totalAmount}</p>
                                                    </div>
                                                )}
                                                {upload.extractedData.invoiceDate && (
                                                    <div className="p-3 bg-[#0A0A0A] rounded-xl">
                                                        <p className="text-xs text-[#94A3B8] mb-1">Date</p>
                                                        <p className="text-white font-semibold">{upload.extractedData.invoiceDate}</p>
                                                    </div>
                                                )}
                                                {upload.extractedData.gstNumber && (
                                                    <div className="p-3 bg-[#0A0A0A] rounded-xl">
                                                        <p className="text-xs text-[#94A3B8] mb-1">GST Number</p>
                                                        <p className="text-white font-mono text-sm">{upload.extractedData.gstNumber}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {uploads.length === 0 && !analyzing && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-10 h-10 text-[#94A3B8]" />
                        </div>
                        <p className="text-[#94A3B8]">No invoices scanned yet. Upload one to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
