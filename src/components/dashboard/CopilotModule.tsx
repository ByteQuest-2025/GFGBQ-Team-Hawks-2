import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Link as LinkIcon, Save, FileText, Sheet } from 'lucide-react';
import { useStore } from '../../lib/store';
import { api } from '../../lib/api';

export function CopilotModule() {
    const { profile, setProfile } = useStore();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: "Hello! I'm your Tax Copilot. How can I help you today? (Try asking about 'GST' or '44ADA')" }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Link Data Modal State
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [sheetId, setSheetId] = useState('');
    const [docId, setDocId] = useState('');

    useEffect(() => {
        if (profile) {
            setSheetId(profile.linkedSheetId || '');
            setDocId(profile.linkedDocId || '');
        }
    }, [profile]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !profile) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            // Use the API wrapper
            const response = await api.chatWithCopilot(userMsg, profile.id);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.response || "Sorry, I couldn't process that."
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to AI service." }]);
        } finally {
            setLoading(false);
        }
    };

    // Helper to extract IDs from URLs
    const extractId = (input: string, type: 'sheet' | 'doc') => {
        if (!input) return '';
        // If it looks like a URL, try to parse
        if (input.includes('google.com')) {
            const regex = type === 'sheet'
                ? /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/
                : /\/document\/d\/([a-zA-Z0-9-_]+)/;
            const match = input.match(regex);
            return match ? match[1] : input; // Fallback to input if regex fails
        }
        return input; // Assume it's already an ID
    };

    const handleLinkSave = async () => {
        if (!profile) return;

        // Smart Extract
        const cleanSheetId = extractId(sheetId, 'sheet');
        const cleanDocId = extractId(docId, 'doc');

        try {
            await api.updateUserProfile(profile.id, {
                linkedSheetId: cleanSheetId,
                linkedDocId: cleanDocId
            });
            // Update local store
            setProfile({ ...profile, linkedSheetId: cleanSheetId, linkedDocId: cleanDocId });
            setShowLinkModal(false);
            setMessages(prev => [...prev, { role: 'assistant', content: "✅ MCP Connected! I'm now synced with your Finance Sheet and Contracts." }]);
        } catch (error) {
            console.error('Failed to link data', error);
        }
    };

    const loadDemoData = () => {
        setSheetId('mock-sheet-id');
        setDocId('mock-doc-id');
    };

    return (
        <div className="flex flex-col h-full bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#15161a]">
                <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-indigo-500" />
                    <span className="font-semibold text-white">Tax Copilot Workspace</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowLinkModal(!showLinkModal)}
                        className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${showLinkModal ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white bg-[#222]'}`}
                        title="Link Data"
                    >
                        <LinkIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Connect MCP</span>
                    </button>
                </div>
            </div>

            {/* Link Data Overlay */}
            {showLinkModal && (
                <div className="p-6 bg-[#23242a] border-b border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-200">
                    <div className="md:col-span-2 flex justify-between items-center mb-2">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-indigo-400" /> Connect Master Control Program (MCP)
                        </h3>
                        <button onClick={loadDemoData} className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full hover:bg-emerald-500/20 transition-colors border border-emerald-500/20 flex items-center gap-1.5">
                            <span>🪄</span> Auto-fill Demo Data
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Sheet size={14} className="text-green-500" /> Financial Data Source
                        </label>
                        <input
                            value={sheetId}
                            onChange={(e) => setSheetId(e.target.value)}
                            className="w-full bg-[#15161a] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none placeholder-gray-600 transition-all focus:ring-1 focus:ring-indigo-500"
                            placeholder="Paste Google Sheet Link (https://docs.google...)"
                        />
                        <p className="text-[10px] text-gray-500">Paste the full URL, we'll extract the ID.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <FileText size={14} className="text-blue-500" /> Contract/Notice Source
                        </label>
                        <input
                            value={docId}
                            onChange={(e) => setDocId(e.target.value)}
                            className="w-full bg-[#15161a] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none placeholder-gray-600 transition-all focus:ring-1 focus:ring-indigo-500"
                            placeholder="Paste Google Doc Link (https://docs.google...)"
                        />
                        <p className="text-[10px] text-gray-500">Paste the full URL, we'll extract the ID.</p>
                    </div>
                    <div className="md:col-span-2 pt-2">
                        <button
                            onClick={handleLinkSave}
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Save size={16} /> Save & Sync MCP
                        </button>
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[70%] rounded-2xl px-6 py-4 text-base leading-relaxed ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-[#23242a] text-gray-200 rounded-bl-none border border-gray-800'
                                }`}
                        >
                            {// Simple markdown-like bold handling
                                msg.content.split('**').map((part, i) =>
                                    i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
                                )
                            }
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-[#23242a] rounded-2xl px-6 py-4 border border-gray-800">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-[#15161a] border-t border-gray-800">
                <div className="relative max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about GST, TDS, or Planning..."
                        className="w-full bg-[#0f1014] text-white rounded-xl pl-6 pr-14 py-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-800 placeholder-gray-600 shadow-lg"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="absolute right-3 top-3 p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
