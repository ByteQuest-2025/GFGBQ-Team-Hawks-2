import { useState, useRef, useEffect } from 'react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';
import type { ChatMessage } from '../types';
import { Send, Bot, FileText, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { Header } from '../components/Header';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export function Copilot() {
    const { profile, obligations, deadlines } = useStore();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: `Hello! 👋 I'm your Tax Compliance Copilot. I can help you with GST filing, Income Tax returns, upcoming deadlines, and any tax-related questions!`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            // Call real backend Gemini API
            const response = await api.chatWithCopilot(
                input,
                profile?.id || 'guest',
                messages
            );

            const assistantMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                content: response.reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Copilot chat error:', error);
            const errorMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again in a moment!",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const suggestions = [
        "What is GST and do I need it?",
        "When is my next deadline?",
        "Explain Section 44AD for me",
        "How to file ITR-4?"
    ];

    const userDisplayName = profile?.ownerName || 'User';
    const firstName = userDisplayName.split(' ')[0];

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-sans pt-20">
            <Header userDisplayName={userDisplayName} activeTab="Copilot" setActiveTab={() => { }} onLogout={() => { }} />

            <div className="max-w-7xl mx-auto px-6 py-8 h-[calc(100vh-120px)] flex gap-6">
                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-[#171717]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden">
                    {/* Chat Header */}
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#FACC15]/10 rounded-2xl flex items-center justify-center text-[#FACC15]">
                                <Bot className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Tax Compliance Copilot</h2>
                                <p className="text-sm text-[#94A3B8]">Powered by Gemini AI</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map(message => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'assistant'
                                        ? 'bg-[#FACC15]/10 text-[#FACC15]'
                                        : 'bg-blue-500/10 text-blue-400'
                                    }`}>
                                    {message.role === 'assistant' ? '🛡️' : '👤'}
                                </div>
                                <div className={`flex-1 max-w-[70%] ${message.role === 'user' ? 'text-right' : ''}`}>
                                    <div className={`inline-block p-4 rounded-2xl ${message.role === 'assistant'
                                            ? 'bg-[#0A0A0A] border border-white/5'
                                            : 'bg-[#FACC15] text-black'
                                        }`}>
                                        <div
                                            className="text-sm leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: message.content
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    .replace(/\n/g, '<br/>')
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-[#94A3B8] mt-2">
                                        {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex gap-3">
                                <div className="w-10 h-10 bg-[#FACC15]/10 rounded-full flex items-center justify-center text-[#FACC15]">
                                    🛡️
                                </div>
                                <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-2xl">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-[#FACC15] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-[#FACC15] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-[#FACC15] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length <= 1 && (
                        <div className="px-6 pb-4">
                            <p className="text-xs text-[#94A3B8] mb-2">Try asking:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map(suggestion => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="px-3 py-2 bg-[#0A0A0A] border border-white/5 rounded-lg text-sm text-[#94A3B8] hover:text-white hover:border-[#FACC15]/30 transition-all"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-6 border-t border-white/5">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                className="flex-1 bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#FACC15]/50 focus:ring-1 focus:ring-[#FACC15]/50 transition-all"
                                placeholder="Ask me anything about taxes..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isTyping}
                                className="px-6 py-3 bg-[#FACC15] text-black rounded-xl font-bold hover:bg-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Send
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="w-80 space-y-6">
                    {/* Quick Status */}
                    <div className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Quick Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#FACC15]" />
                                    <span className="text-sm text-[#94A3B8]">Obligations</span>
                                </div>
                                <span className="text-white font-bold">{obligations.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-orange-400" />
                                    <span className="text-sm text-[#94A3B8]">Deadlines</span>
                                </div>
                                <span className="text-white font-bold">{deadlines.filter(d => d.status !== 'completed').length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-[#171717]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
                        <div className="space-y-2">
                            <a
                                href="https://www.gst.gov.in"
                                target="_blank"
                                className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl hover:bg-white/5 transition-all group"
                            >
                                <span className="text-sm text-[#94A3B8] group-hover:text-white">GST Portal</span>
                                <span className="text-[#FACC15]">→</span>
                            </a>
                            <a
                                href="https://www.incometax.gov.in"
                                target="_blank"
                                className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-xl hover:bg-white/5 transition-all group"
                            >
                                <span className="text-sm text-[#94A3B8] group-hover:text-white">Income Tax Portal</span>
                                <span className="text-[#FACC15]">→</span>
                            </a>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
