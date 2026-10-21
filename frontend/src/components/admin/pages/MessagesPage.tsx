import { useState, useEffect } from 'react';
import { adminGetMessages, adminReplyMessage, type ContactMessage } from '../../../lib/adminApi';
import { useToast } from '../components/ToastContext';
import { ChevronDown, ChevronRight, Mail, Reply, Calendar } from 'lucide-react';

export function MessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
    const [sendingId, setSendingId] = useState<string | null>(null);
    const toast = useToast();

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = await adminGetMessages();
            setMessages(data);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleReplyChange = (id: string, text: string) => {
        setReplyTexts(prev => ({ ...prev, [id]: text }));
    };

    const handleSendReply = async (id: string) => {
        const text = replyTexts[id];
        if (!text || text.trim() === '') {
            toast.error('Reply text cannot be empty');
            return;
        }

        try {
            setSendingId(id);
            const updatedMessage = await adminReplyMessage(id, text);
            setMessages(messages.map(msg => msg.id === id ? updatedMessage : msg));
            toast.success('Reply sent successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reply');
        } finally {
            setSendingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading && messages.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Messages</h1>
                <p className="text-slate-400">Manage inquiries from the contact form.</p>
            </div>

            {messages.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
                    <Mail className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No messages</h3>
                    <p className="text-slate-400">You haven't received any contact messages yet.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                    {messages.map((msg) => {
                        const isExpanded = expandedId === msg.id;
                        const isUnread = !msg.reply_text;
                        
                        return (
                            <div key={msg.id} className="group flex flex-col">
                                {/* Compact Row */}
                                <div 
                                    className={`flex h-14 cursor-pointer items-center gap-4 px-4 transition-colors hover:bg-slate-800/50 ${isExpanded ? 'bg-slate-800/30' : ''}`}
                                    onClick={() => toggleExpand(msg.id!)}
                                >
                                    <div className="flex-shrink-0 w-4 flex justify-center">
                                        {isUnread ? (
                                            <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div>
                                        ) : (
                                            <div className="h-2 w-2 rounded-full bg-slate-700"></div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 flex items-center min-w-0 gap-4">
                                        <div className="truncate font-medium text-slate-200 w-32 shrink-0">
                                            {msg.name}
                                        </div>
                                        <div className="truncate text-sm text-slate-500 w-48 shrink-0 hidden sm:block">
                                            {msg.email}
                                        </div>
                                        <div className="truncate text-sm text-slate-400 flex-1">
                                            {msg.message}
                                        </div>
                                    </div>
                                    
                                    <div className="text-xs text-slate-500 whitespace-nowrap hidden md:block">
                                        {formatDate(msg.submitted_at)}
                                    </div>
                                    
                                    <div className="text-slate-600">
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </div>
                                </div>
                                
                                {/* Expanded Panel */}
                                {isExpanded && (
                                    <div className="bg-slate-950/50 border-t border-slate-800/50 p-6 space-y-6">
                                        {/* Message Details */}
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                                <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                                                    <Mail size={14} className="text-slate-500" />
                                                    <a href={`mailto:${msg.email}`} className="text-cyan-400 hover:underline">{msg.email}</a>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                                                    <Calendar size={14} className="text-slate-500" />
                                                    {formatDate(msg.submitted_at)}
                                                </div>
                                            </div>
                                            
                                            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                                                {msg.message}
                                            </div>
                                        </div>
                                        
                                        {/* Reply Section */}
                                        {msg.reply_text ? (
                                            <div className="bg-cyan-950/20 border border-cyan-900/50 rounded-xl p-5 space-y-3 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                                                <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
                                                    <Reply size={16} />
                                                    <span>Replied on {formatDate(msg.replied_at!)}</span>
                                                </div>
                                                <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                                                    {msg.reply_text}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <label className="block text-sm font-medium text-slate-300">
                                                    Draft Reply
                                                </label>
                                                <textarea 
                                                    value={replyTexts[msg.id!] || ''}
                                                    onChange={(e) => handleReplyChange(msg.id!, e.target.value)}
                                                    placeholder="Type your reply here..."
                                                    className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                                                />
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleSendReply(msg.id!)}
                                                        disabled={sendingId === msg.id}
                                                        className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {sendingId === msg.id ? (
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent mr-2"></div>
                                                        ) : (
                                                            <Reply size={16} className="mr-2" />
                                                        )}
                                                        Send Reply
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
