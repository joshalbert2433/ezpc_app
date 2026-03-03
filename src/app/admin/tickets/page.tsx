'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { 
  MessageSquare, 
  User as UserIcon, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Loader2,
  RefreshCw,
  Send,
  Lock,
  Unlock,
  ImageIcon,
  Paperclip,
  X as XIcon
} from 'lucide-react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  text?: string;
  image?: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  userId: string;
  userName: string;
  assignedTo?: string;
  assignedName?: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export default function CSTicketsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(undefined, {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
    });

    socketRef.current.on('connect_error', (err) => {
      console.log('Socket Connection Error:', err.message);
    });

    socketRef.current.on('message-received', () => {
      fetchTickets();
    });

    socketRef.current.on('refresh-ticket', () => {
      fetchTickets();
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socketRef.current && selectedTicketId) {
      socketRef.current.emit('join-ticket', selectedTicketId);
      return () => {
        socketRef.current?.emit('leave-ticket', selectedTicketId);
      };
    }
  }, [selectedTicketId]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicketId, tickets]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== 'admin') {
        toast.error('Access Denied');
      } else {
        fetchTickets();
        const interval = setInterval(fetchTickets, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
      }
    }
  }, [user, authLoading]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const takeTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'take' }),
      });

      if (res.ok) {
        toast.success('Ticket assigned to you');
        fetchTickets();
        setSelectedTicketId(ticketId);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to take ticket');
      }
    } catch (error) {
      toast.error('Error taking ticket');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPreviewImage(data.url || data.path);
      } else {
        toast.error('Upload failed');
        setPreviewImage(null);
      }
    } catch (error) {
      toast.error('Error uploading');
      setPreviewImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || (!replyText.trim() && !previewImage)) return;

    const text = replyText;
    const image = previewImage;
    setReplyText('');
    setPreviewImage(null);
    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', text, image }),
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(prev => prev.map(t => t._id === selectedTicketId ? updatedTicket : t));
      } else {
        toast.error('Failed to send message');
        setReplyText(text);
        setPreviewImage(image);
      }
    } catch (error) {
      toast.error('Error sending message');
      setReplyText(text);
      setPreviewImage(image);
    } finally {
      setSending(false);
    }
  };

  const closeTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', status: 'closed' }),
      });

      if (res.ok) {
        toast.success('Ticket closed');
        fetchTickets();
      } else {
        toast.error('Failed to close ticket');
      }
    } catch (error) {
      toast.error('Error closing ticket');
    }
  };

  const selectedTicket = tickets.find(t => t._id === selectedTicketId);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
        <p className="animate-pulse text-[var(--muted)] font-black uppercase tracking-widest text-xs text-black dark:text-white">Connecting to Support Hub...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black mb-4 text-[var(--foreground)] uppercase tracking-tighter">Support Access Required</h2>
        <Link href="/login" className="bg-[var(--primary)] text-white dark:text-black px-8 py-3 rounded-xl font-black transition-all">SIGN IN</Link>
      </div>
    );
  }

  const openTickets = tickets.filter(t => t.status === 'open');
  const myTickets = tickets.filter(t => t.status === 'in-progress' && t.assignedTo === user.id);
  const otherTickets = tickets.filter(t => (t.status === 'in-progress' && t.assignedTo !== user.id) || t.status === 'closed');

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tighter text-black dark:text-white">Support Terminal<span className="text-[var(--primary)]">_</span></h1>
          <p className="text-[var(--muted)] mt-1 font-medium">Manage incoming communication streams and user requests</p>
        </div>
        <button 
          onClick={fetchTickets}
          className="p-3 bg-[var(--input)] hover:bg-[var(--card-border)] rounded-xl transition-all text-black dark:text-white"
          title="Refresh Streams"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Sidebar: Ticket Lists */}
        <div className="w-80 flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* Open Tickets */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] flex items-center gap-2 px-2 text-black dark:text-white">
              <Unlock size={12} className="text-orange-500" /> Incoming Stream ({openTickets.length})
            </h3>
            <div className="space-y-2">
              {openTickets.map(ticket => (
                <div 
                  key={ticket._id}
                  onClick={() => setSelectedTicketId(ticket._id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                    selectedTicketId === ticket._id 
                    ? 'bg-[var(--primary)]/10 border-[var(--primary)]' 
                    : 'bg-[var(--card)] border-(--card-border) hover:border-[var(--muted)]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-black uppercase text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors">#{ticket._id.slice(-6).toUpperCase()}</span>
                    <span className="text-[9px] font-bold text-[var(--muted)]">{new Date(ticket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <h4 className="font-black text-sm text-[var(--foreground)] truncate text-black dark:text-white">{ticket.subject}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-5 h-5 bg-[var(--input)] rounded-full flex items-center justify-center text-[10px] font-bold text-black dark:text-white">
                      {ticket.userName.charAt(0)}
                    </div>
                    <span className="text-[10px] font-bold text-[var(--muted)] truncate">{ticket.userName}</span>
                  </div>
                </div>
              ))}
              {openTickets.length === 0 && <p className="text-[10px] text-center py-4 text-[var(--muted)] italic">No pending requests</p>}
            </div>
          </section>

          {/* My Tickets */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] flex items-center gap-2 px-2 text-black dark:text-white">
              <Lock size={12} className="text-[var(--primary)]" /> My Active Cycles ({myTickets.length})
            </h3>
            <div className="space-y-2">
              {myTickets.map(ticket => (
                <div 
                  key={ticket._id}
                  onClick={() => setSelectedTicketId(ticket._id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                    selectedTicketId === ticket._id 
                    ? 'bg-[var(--primary)]/10 border-[var(--primary)]' 
                    : 'bg-[var(--card)] border-(--card-border) hover:border-[var(--muted)]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-black uppercase text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors">#{ticket._id.slice(-6).toUpperCase()}</span>
                    <span className="text-[9px] font-bold text-[var(--muted)] text-black dark:text-white">Active</span>
                  </div>
                  <h4 className="font-black text-sm text-[var(--foreground)] truncate text-black dark:text-white">{ticket.subject}</h4>
                  <p className="text-[10px] font-bold text-[var(--muted)] mt-1 truncate">{ticket.userName}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Main Content: Chat View */}
        <div className="flex-1 bg-[var(--card)] border border-(--card-border) rounded-3xl flex flex-col overflow-hidden shadow-sm">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-(--card-border) flex justify-between items-center bg-[var(--input)]/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center font-black">
                    {selectedTicket.userName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-[var(--foreground)] tracking-tight text-black dark:text-white">{selectedTicket.subject}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                      <UserIcon size={10} /> {selectedTicket.userName} 
                      <span className="mx-1">•</span>
                      <Clock size={10} /> Started {new Date(selectedTicket.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {selectedTicket.status === 'open' ? (
                    <button 
                      onClick={() => takeTicket(selectedTicket._id)}
                      className="px-4 py-2 bg-[var(--primary)] text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                    >
                      Establish Connection
                    </button>
                  ) : selectedTicket.status === 'in-progress' ? (
                    <button 
                      onClick={() => closeTicket(selectedTicket._id)}
                      className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                    >
                      Terminate Cycle
                    </button>
                  ) : (
                    <span className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      Closed
                    </span>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {selectedTicket.messages.map((msg, idx) => {
                  const isAdmin = msg.senderRole === 'admin';
                  return (
                    <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${isAdmin ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                          isAdmin 
                            ? 'bg-[var(--primary)] text-white dark:text-black rounded-br-none' 
                            : 'bg-[var(--input)] text-[var(--foreground)] rounded-bl-none text-black dark:text-white'
                        }`}>
                          {msg.image && (
                            <div className="mb-2 rounded-lg overflow-hidden border border-black/5 max-w-[300px]">
                              <img src={msg.image} alt="Message attachment" className="w-full h-auto cursor-zoom-in" onClick={() => window.open(msg.image, '_blank')} />
                            </div>
                          )}
                          {msg.text && <div>{msg.text}</div>}
                        </div>
                        <span className="text-[9px] font-bold text-[var(--muted)] uppercase px-1">
                          {isAdmin ? 'System Agent' : selectedTicket.userName} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {selectedTicket.status !== 'closed' && (
                <div className="p-6 border-t border-(--card-border) bg-[var(--input)]/10 flex flex-col gap-4">
                  {previewImage && (
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-(--card-border) shadow-xl group">
                      <img src={previewImage} alt="Attachment preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setPreviewImage(null)}
                        className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon size={20} />
                      </button>
                    </div>
                  )}
                  {selectedTicket.assignedTo === user.id ? (
                    <form onSubmit={sendMessage} className="flex gap-3">
                      <div className="relative">
                        <label className="w-12 h-12 bg-[var(--card)] border border-(--card-border) rounded-2xl flex items-center justify-center cursor-pointer hover:border-[var(--primary)] transition-all">
                          {isUploading ? <Loader2 size={18} className="animate-spin text-[var(--muted)]" /> : <ImageIcon size={18} className="text-[var(--muted)]" />}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                      <input 
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your response..."
                        className="flex-1 bg-[var(--card)] border border-(--card-border) rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-[var(--primary)] transition-all text-black dark:text-white"
                        disabled={sending || isUploading}
                      />
                      <button 
                        type="submit"
                        disabled={sending || isUploading || (!replyText.trim() && !previewImage)}
                        className="p-3 bg-[var(--primary)] text-white dark:text-black rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 flex-shrink-0"
                      >
                        {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                      </button>
                    </form>
                  ) : (
                    <div className="bg-[var(--input)]/50 rounded-2xl p-4 text-center border border-(--card-border) border-dashed">
                      <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Establish connection to enable uplink</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-40">
              <MessageSquare size={64} className="mb-6 text-[var(--muted)]" />
              <h2 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tight text-black dark:text-white">Communication Terminal Offline</h2>
              <p className="text-[var(--muted)] max-w-xs mt-2 text-sm font-medium">Select an incoming stream from the sidebar to begin processing user requests.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
