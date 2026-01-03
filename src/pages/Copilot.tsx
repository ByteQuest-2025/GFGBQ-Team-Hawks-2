import { useState, useRef, useEffect } from 'react';
import { useStore } from '../lib/store';
import type { ChatMessage } from '../types';
import './Copilot.css';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Mock AI responses (replace with Gemini API integration)
function getMockResponse(question: string, context: { obligations: string[], deadlines: string[] }): string {
    const q = question.toLowerCase();

    if (q.includes('gst') || q.includes('gstr')) {
        return `Great question! 📋 Based on your profile:

**GST Filing:**
${context.obligations.filter(o => o.includes('GST')).map(o => `• ${o}`).join('\n') || '• No GST obligations detected'}

Don't worry - GST filing is simpler than it sounds! You basically report your sales and purchases, and pay the difference. The GST portal at gst.gov.in has a step-by-step wizard.

Would you like me to explain any specific form in detail?`;
    }

    if (q.includes('income tax') || q.includes('itr') || q.includes('tax return')) {
        return `Here's what you need to know about Income Tax! 💰

**Your ITR Deadline:** July 31st each year

For freelancers and small businesses, you'll likely use:
• **ITR-4 (Sugam)** - If using presumptive taxation (simpler!)
• **ITR-3** - If maintaining full books of accounts

**Pro Tip:** Under Section 44AD, if your turnover is below ₹2 Cr, you can declare 8% of turnover as profit and avoid detailed bookkeeping!

Need help choosing the right ITR form?`;
    }

    if (q.includes('deadline') || q.includes('due') || q.includes('when')) {
        return `Here are your upcoming deadlines! ⏰

${context.deadlines.slice(0, 5).map(d => `📅 ${d}`).join('\n')}

I'd recommend setting calendar reminders at least a week before each deadline. Missing them can result in late fees and interest!

Want me to explain any specific filing?`;
    }

    if (q.includes('penalty') || q.includes('late') || q.includes('miss')) {
        return `Let's talk about penalties - but don't worry, awareness is the first step! 😊

**Common Penalties:**
• **Late GST Return:** ₹50/day (₹20 for nil returns) up to ₹5,000
• **Late ITR Filing:** Up to ₹5,000 if filed after July 31
• **Late Advance Tax:** Interest under Sections 234B & 234C

**Good News:** As long as you file before the deadline, there's no penalty! That's why I'm here - to make sure you never miss one.

Is there a specific deadline you're concerned about?`;
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
        return `Hello! 👋 I'm your Tax Compliance Copilot!

I'm here to help you understand and manage your tax obligations without the stress. You can ask me about:

• 📋 GST filing and requirements
• 💰 Income tax returns and forms
• ⏰ Upcoming deadlines
• ⚠️ How to avoid penalties
• 📊 TDS obligations

What would you like to know?`;
    }

    // Default response
    return `Thanks for your question! 🤔

Based on your business profile, here's what I'd suggest:

${context.obligations.slice(0, 3).map(o => `• ${o}`).join('\n')}

Remember, compliance doesn't have to be scary - take it one step at a time!

Could you be more specific about what you'd like help with? I can explain:
• Any specific form or filing
• Deadlines and due dates
• Penalty avoidance
• Step-by-step filing guides`;
}

export function Copilot() {
    const { profile, obligations, deadlines, alerts } = useStore();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: `Hi ${profile?.ownerName?.split(' ')[0]}! 👋 I'm your Tax Compliance Copilot.

I can see you have **${obligations.length} compliance obligations** and **${alerts.filter(a => a.level === 'critical' || a.level === 'warning').length} items needing attention**.

How can I help you today? Ask me anything about GST, Income Tax, or your upcoming deadlines!`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

        // Simulate AI thinking
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        // Get mock response (replace with actual Gemini API call)
        const context = {
            obligations: obligations.map(o => o.name),
            deadlines: deadlines.map(d => `${d.obligationName} - ${d.dueDate.toLocaleDateString('en-IN')}`)
        };
        const response = getMockResponse(input, context);

        const assistantMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: response,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Suggested questions
    const suggestions = [
        "What is GST and do I need it?",
        "When is my next deadline?",
        "How do I file ITR-4?",
        "What happens if I miss a deadline?"
    ];

    return (
        <div className="container">
            <div className="copilot-page">
                {/* Chat Container */}
                <div className="chat-container">
                    <div className="chat-messages">
                        {messages.map(message => (
                            <div key={message.id} className={`message ${message.role}`}>
                                <div className="message-avatar">
                                    {message.role === 'assistant' ? '🛡️' : '👤'}
                                </div>
                                <div className="message-content">
                                    <div className="message-text" dangerouslySetInnerHTML={{
                                        __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
                                    }} />
                                    <span className="message-time">
                                        {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="message assistant">
                                <div className="message-avatar">🛡️</div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length <= 2 && (
                        <div className="suggestions">
                            <p>Try asking:</p>
                            <div className="suggestion-chips">
                                {suggestions.map(suggestion => (
                                    <button
                                        key={suggestion}
                                        className="suggestion-chip"
                                        onClick={() => setInput(suggestion)}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="chat-input-container">
                        <textarea
                            className="chat-input"
                            placeholder="Ask me anything about taxes..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            rows={1}
                        />
                        <button
                            className="btn btn-primary send-btn"
                            onClick={sendMessage}
                            disabled={!input.trim() || isTyping}
                        >
                            Send
                        </button>
                    </div>
                </div>

                {/* Sidebar - Quick Info */}
                <aside className="copilot-sidebar">
                    <div className="sidebar-card">
                        <h3>⚡ Quick Status</h3>
                        <div className="status-items">
                            <div className="status-item">
                                <span className="status-label">Obligations</span>
                                <span className="status-value">{obligations.length}</span>
                            </div>
                            <div className="status-item">
                                <span className="status-label">Due This Week</span>
                                <span className="status-value text-warning">
                                    {deadlines.filter(d => d.daysRemaining <= 7 && d.daysRemaining >= 0).length}
                                </span>
                            </div>
                            <div className="status-item">
                                <span className="status-label">Overdue</span>
                                <span className="status-value text-danger">
                                    {deadlines.filter(d => d.status === 'overdue').length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-card">
                        <h3>📚 Quick Links</h3>
                        <ul className="quick-links">
                            <li><a href="https://gst.gov.in" target="_blank" rel="noopener noreferrer">GST Portal →</a></li>
                            <li><a href="https://incometax.gov.in" target="_blank" rel="noopener noreferrer">Income Tax Portal →</a></li>
                            <li><a href="https://tin.tin.nsdl.com" target="_blank" rel="noopener noreferrer">TDS/TCS Portal →</a></li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
