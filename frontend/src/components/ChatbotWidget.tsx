import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "/api";

export function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load from sessionStorage on mount
    useEffect(() => {
        const saved = sessionStorage.getItem('chatbot_history');
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                // Ignore parse errors
            }
        } else {
            // Initial greeting
            setMessages([
                { role: 'assistant', content: "Hi! I'm an AI assistant trained on Aduma's portfolio. How can I help you today?" }
            ]);
        }
    }, []);

    // Save to sessionStorage when messages change
    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem('chatbot_history', JSON.stringify(messages));
        }
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        
        // Add user message immediately
        const newHistory: ChatMessage[] = [...messages, { role: 'user', content: userMsg }];
        setMessages(newHistory);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages // pass previous history
                })
            });

            if (!res.ok) throw new Error('Failed to get response');
            
            const data = await res.json();
            setMessages([...newHistory, { role: 'assistant', content: data.response }]);
        } catch (error) {
            setMessages([...newHistory, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-end max-w-[min(20rem,calc(100vw-1.5rem))]">
            {/* Chat Panel */}
            <div
                className={`fixed bottom-24 right-6 mb-4 flex flex-col w-[min(20rem,calc(100vw-2rem))] max-h-[calc(100vh-12rem)] h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden font-sans transition-all duration-300 ease-out transform origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-3 pointer-events-none'}`}
                aria-hidden={!isOpen}
            >
                {/* Header */}
                <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-cyan-400">
                        <Bot size={20} />
                        <span className="font-semibold text-slate-200 text-sm">Site Agent</span>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex-shrink-0 mt-1 flex items-center justify-center h-6 w-6 rounded-full ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                    {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                                </div>
                                <div className={`px-3 py-2 rounded-2xl text-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none whitespace-pre-wrap'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex gap-2 max-w-[85%]">
                                <div className="flex-shrink-0 mt-1 flex items-center justify-center h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400">
                                    <Bot size={12} />
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-none flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-slate-950 border-t border-slate-800">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask the Site Agent..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="p-2 rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>

            {/* FAB Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative flex items-center justify-center h-14 w-14 rounded-full bg-slate-900 border-2 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] ${isOpen ? 'border-slate-600 scale-90' : 'border-cyan-400 hover:scale-110 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]'}`}
                aria-label="Toggle Site Agent"
            >
                {isOpen ? <X className="text-slate-400" /> : <MessageSquare className="text-cyan-400" />}
            </button>
        </div>
    );
}
