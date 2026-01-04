import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Calculator, PieChart, ShieldCheck, CheckCircle, Mic, Paperclip, Layers, Activity } from 'lucide-react';
import { useStore } from '../../lib/store';
import { api } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export function CopilotModule() {
    const { profile } = useStore();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: "Welcome to TaxAlly Prime. I'm ready to assist with your tax compliance and financial planning." }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Tools State
    const [activeTool, setActiveTool] = useState<string>('categorize');

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (customMessage?: string) => {
        const msgToSend = customMessage || input;
        if (!msgToSend.trim() || !profile) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: msgToSend }]);
        setLoading(true);

        try {
            const response = await api.chatWithCopilot(msgToSend, profile.id);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.response || "Analysis complete. No specific output generated."
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection to Neural Core interrupted." }]);
        } finally {
            setLoading(false);
        }
    };

    // Tool Tab Component
    const ToolTab = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
        <button
            onClick={() => setActiveTool(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${activeTool === id
                    ? 'bg-[#FACC15] text-black border-[#FACC15] shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                    : 'bg-transparent text-gray-500 border-transparent hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon size={18} />
            <span className="text-xs font-semibold tracking-wide">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col gap-6 h-full font-sans w-full max-w-full">

            {/* 1. Chat Workspace (Top Card) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 bg-[#171717] rounded-[2rem] border border-white/5 flex flex-col relative overflow-hidden shadow-2xl min-h-[300px]"
            >
                {/* Header */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#171717] sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <Bot className="w-5 h-5 text-[#FACC15]" />
                        <span className="font-bold text-gray-200 tracking-wide text-sm">TAX<span className="text-[#FACC15]">ALLY</span> PRIME</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#0A0A0A] rounded-full border border-white/5">
                            <Activity size={12} className="text-[#FACC15]" />
                            <span className="text-[10px] font-mono text-[#FACC15]">LIVE</span>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent" ref={scrollRef}>
                    <AnimatePresence mode='popLayout'>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] relative px-6 py-4 text-sm leading-relaxed rounded-2xl ${msg.role === 'user'
                                            ? 'bg-[#0A0A0A] text-gray-100 border border-white/5 rounded-br-none'
                                            : 'bg-transparent text-gray-300 pl-4 border-l-2 border-[#FACC15]'
                                        }`}
                                >
                                    {msg.content.split('**').map((part, i) =>
                                        i % 2 === 1 ? <strong key={i} className="text-[#FACC15] font-medium">{part}</strong> : part
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {loading && (
                        <div className="flex items-center space-x-1 h-6 pl-6 opacity-50">
                            <div className="w-1.5 h-1.5 bg-[#FACC15] rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-[#FACC15] rounded-full animate-bounce delay-100"></div>
                            <div className="w-1.5 h-1.5 bg-[#FACC15] rounded-full animate-bounce delay-200"></div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 pt-2 pb-8 bg-[#171717]">
                    <div className="w-full relative group">
                        <div className="absolute inset-0 bg-[#FACC15]/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-[#0A0A0A] rounded-2xl border border-white/10 flex items-center p-3 pl-6 shadow-lg transition-all focus-within:border-[#FACC15]/50 hover:border-white/20">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about tax savings, rules, or analysis..."
                                className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none text-sm h-10"
                            />
                            <div className="flex items-center gap-3 pr-2">
                                <Mic size={18} className="text-gray-500 hover:text-[#FACC15] cursor-pointer transition-colors" />
                                <Paperclip size={18} className="text-gray-500 hover:text-[#FACC15] cursor-pointer transition-colors" />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() && !loading}
                                    className="p-3 bg-[#FACC15] text-black rounded-xl hover:bg-[#FFE066] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 2. Tools Module (Bottom Card) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#171717] rounded-[2rem] border border-white/5 p-8 flex flex-col gap-6 shadow-xl w-full"
            >
                {/* Horizontal Tool Selection */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                    <ToolTab id="categorize" icon={Layers} label="Classification" />
                    <ToolTab id="calc" icon={Calculator} label="Tax Calculator" />
                    <ToolTab id="trends" icon={PieChart} label="Analysis" />
                    <ToolTab id="audit" icon={ShieldCheck} label="Compliance" />
                </div>

                {/* Tool Content Area */}
                <div className="min-h-[200px]">
                    {activeTool === 'categorize' && (
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">Entry Type</label>
                                    <select className="w-full bg-[#0A0A0A] text-white text-sm p-4 rounded-xl border border-white/10 outline-none focus:border-[#FACC15] transition-colors appearance-none cursor-pointer hover:bg-[#111]">
                                        <option>Business Expense</option>
                                        <option>Capital Asset</option>
                                        <option>Income Source</option>
                                        <option>Liability</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Q4 Server Maintenance"
                                        className="w-full bg-[#0A0A0A] text-white text-sm p-4 rounded-xl border border-white/10 outline-none focus:border-[#FACC15] transition-colors placeholder-gray-700 hover:bg-[#111]"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">Amount</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-[#0A0A0A] text-white text-sm p-4 rounded-xl border border-white/10 outline-none focus:border-[#FACC15] transition-colors placeholder-gray-700 font-mono hover:bg-[#111]"
                                    />
                                </div>
                            </div>

                            <button className="w-full bg-[#FACC15] hover:bg-[#FFE066] text-black font-bold text-sm py-4 rounded-xl shadow-lg shadow-[#FACC15]/10 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]">
                                <CheckCircle size={18} />
                                Run Classification Analysis
                            </button>
                        </div>
                    )}

                    {activeTool !== 'categorize' && (
                        <div className="flex flex-col items-center justify-center h-[200px] text-gray-500 border-2 border-dashed border-white/5 rounded-2xl bg-[#0A0A0A]/50">
                            <div className="p-4 bg-[#171717] rounded-full mb-3 border border-white/5">
                                {activeTool === 'calc' && <Calculator size={24} className="text-[#FACC15]" />}
                                {activeTool === 'trends' && <PieChart size={24} className="text-[#FACC15]" />}
                                {activeTool === 'audit' && <ShieldCheck size={24} className="text-[#FACC15]" />}
                            </div>
                            <p className="text-sm font-medium">Module Active</p>
                            <p className="text-xs opacity-50 mt-1">Connect to live data stream to visualize.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
