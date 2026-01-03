import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Bot,
    Sparkles,
    History,
    ChevronRight,
    Lightbulb
} from 'lucide-react';
import { api } from '../../lib/api';
import { useStore } from '../../lib/store';

export const CopilotModule = () => {
    const { profile } = useStore();
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', content: "Hello! I'm TaxAlly Copilot. I can help you with tax strategies, deduction rules, or financial planning. How can I assist you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMsg = { id: Date.now(), role: 'user', content: input };
        setMessages([...messages, newMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Call real backend Gemini API
            const response = await api.chatWithCopilot(
                input,
                profile?.id || 'guest',
                messages
            );

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: response.reply
            }]);
        } catch (error) {
            console.error('Copilot error:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again in a moment!"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedActions = [
        "How can I save tax on rent?",
        "Analyze my Q4 expenses",
        "Am I eligible for 44ADA?",
        "GST filing dates jan 2026"
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex h-[calc(100vh-140px)] gap-6"
        >
            {/* Left History Panel */}
            <div className="w-80 hidden lg:flex flex-col bg-[#171717] border border-white/5 rounded-[2rem] p-6">
                <div className="flex items-center gap-2 mb-6 text-[#FACC15]">
                    <History size={20} />
                    <h3 className="font-bold">Session History</h3>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {['GST Savings Strategy', 'Depreciation Audit', 'FY25 Planning', 'Invoice Verification'].map((item, i) => (
                        <button key={i} className="w-full text-left p-3 rounded-xl hover:bg-white/5 text-[#9CA3AF] hover:text-white transition-colors group flex items-center justify-between">
                            <span className="text-sm font-medium truncate">{item}</span>
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>

                <div className="pt-4 border-t border-white/5">
                    <button className="w-full bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl text-sm font-bold transition-colors">
                        + New Chat
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[#171717] border border-white/5 rounded-[2rem] relative overflow-hidden">
                {/* Chat Header */}
                <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-[#0A0A0A]/50 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FACC15] to-orange-500 flex items-center justify-center text-black shadow-lg">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">TaxAlly Copilot</h2>
                        <p className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.map((msg) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] p-4 rounded-2xl leading-relaxed ${msg.role === 'user'
                                    ? 'bg-[#FACC15] text-black font-medium rounded-tr-none'
                                    : 'bg-[#262626] text-white border border-white/5 rounded-tl-none'
                                }`}>
                                {msg.role === 'assistant' && (
                                    <div className="flex items-center gap-2 mb-2 text-[#FACC15] text-xs font-bold uppercase tracking-wide">
                                        <Sparkles size={12} /> AI Strategy
                                    </div>
                                )}
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-[#0A0A0A]/80 backdrop-blur-md">
                    {/* Suggested Actions */}
                    {messages.length < 3 && (
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                            {suggestedActions.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(action)}
                                    className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-[#FACC15]/20 hover:text-[#FACC15] border border-white/10 rounded-full text-xs font-medium text-[#9CA3AF] transition-all"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FACC15] to-orange-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                        <div className="relative flex items-center bg-[#0A0A0A] rounded-xl border border-white/10 focus-within:border-[#FACC15]/50 transition-colors">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about tax savings, invoices, or audit risks..."
                                className="w-full bg-transparent p-4 text-white focus:outline-none placeholder:text-[#525252]"
                            />
                            <button
                                onClick={handleSend}
                                className="p-2 mr-2 bg-[#FACC15] hover:bg-[#EAB308] rounded-lg text-black transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                    <p className="text-center text-[#525252] text-[10px] mt-2">
                        TaxAlly Copilot can make mistakes. Verify important tax info.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
