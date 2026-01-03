import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Maximize2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';

export function SidebarCopilot() {
    const { isCopilotOpen, toggleCopilot, profile, obligations } = useStore();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: "Hello! I'm your Tax Copilot. How can I help you today? (Try asking about 'GST' or '44ADA')" }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isCopilotOpen]);

    // If not open, render nothing (or a minimized trigger if designed that way, 
    // but App.tsx handles the overlay logic usually, here we just control visibility)
    // Actually, better to keep it mounted but hidden off-screen or use conditional rendering in App.tsx
    // Based on my App.tsx change, it is always rendered but maybe we use css to hide.
    // Let's use the className approach in App.tsx and here just style the drawer.

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

    return (
        <div
            className={`fixed top-0 right-0 h-full w-96 bg-[#1a1b21] border-l border-gray-800 shadow-2xl transform transition-transform duration-300 z-50 ${isCopilotOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            {/* Header */}
            <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#15161a]">
                <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-indigo-500" />
                    <span className="font-semibold text-white">Tax Copilot</span>
                </div>
                <button onClick={toggleCopilot} className="text-gray-400 hover:text-white">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-128px)]" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-[#23242a] text-gray-200 rounded-bl-none border border-gray-800'
                                }`}
                        >
                            {// Simple markdown-like bold handling
                                msg.content.split('**').map((part, i) =>
                                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                                )
                            }
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-[#23242a] rounded-2xl px-4 py-3 border border-gray-800">
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
            <div className="absolute bottom-0 w-full p-4 bg-[#15161a] border-t border-gray-800">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about GST, TDS, or Planning..."
                        className="w-full bg-[#0f1014] text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-800 placeholder-gray-600"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="absolute right-2 top-2 p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
