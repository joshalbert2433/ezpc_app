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
  X as XIcon,
  Check,
  CheckCheck,
  Search
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
  seen?: boolean;
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
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [typingName, setTypingName] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'history'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    socketRef.current = io(undefined, {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
    });

    socketRef.current.on('connect_error', (err) => {
      console.log('Socket Connection Error:', err.message);
    });

    socketRef.current.on('message-received', (message: Message) => {
      setTickets(prev => prev.map(t => {
        if (t._id === selectedTicketId) {
          const exists = t.messages.some(m => 
            (m.text === message.text && m.senderId === message.senderId && Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 2000)
          );
          if (!exists) {
            if (selectedTicketId) markAsSeen(selectedTicketId);
            return { ...t, messages: [...t.messages, message], updatedAt: new Date().toISOString() };
          }
        }
        return t;
      }));
    });

    socketRef.current.on('refresh-ticket', () => {
      fetchTickets();
    });

    socketRef.current.on('user-typing', ({ userId, userName, isTyping }: any) => {
      if (userId !== user?.id) {
        setIsOtherTyping(isTyping);
        setTypingName(userName);
      }
    });

    socketRef.current.on('messages-seen', ({ userId }: any) => {
      if (userId !== user?.id) {
        setTickets(prev => prev.map(t => {
          if (t._id === selectedTicketId) {
            return {
              ...t,
              messages: t.messages.map(m => m.senderId === user?.id ? { ...m, seen: true } : m)
            };
          }
          return t;
        }));
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [selectedTicketId, user]);

  useEffect(() => {
    if (socketRef.current && selectedTicketId) {
      socketRef.current.emit('join-ticket', selectedTicketId);
      markAsSeen(selectedTicketId);
      return () => {
        socketRef.current?.emit('leave-ticket', selectedTicketId);
      };
    }
  }, [selectedTicketId]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicketId, tickets, isOtherTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markAsSeen = async (ticketId: string) => {
    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-seen' }),
      });
      if (socketRef.current) {
        socketRef.current.emit('mark-seen', { ticketId, userId: user?.id });
      }
    } catch (error) {
      console.error('Error marking as seen:', error);
    }
  };

  const handleTypingIndicator = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyText(e.target.value);
    
    if (socketRef.current && selectedTicketId) {
      socketRef.current.emit('typing', { 
        ticketId: selectedTicketId, 
        userId: user?.id, 
        userName: user?.name, 
        isTyping: true 
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', { 
          ticketId: selectedTicketId, 
          userId: user?.id, 
          userName: user?.name, 
          isTyping: false 
        });
      }, 2000);
    }
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

    // Clear typing status immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current?.emit('typing', { 
      ticketId: selectedTicketId, 
      userId: user?.id, 
      userName: user?.name, 
      isTyping: false 
    });

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
  const closedTickets = tickets.filter(t => t.status === 'closed');
  const othersActive = tickets.filter(t => t.status === 'in-progress' && t.assignedTo !== user.id);

  const filterBySearch = (list: Ticket[]) => {
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(t => 
      t.subject.toLowerCase().includes(query) || 
      t.userName.toLowerCase().includes(query) ||
      t._id.toLowerCase().includes(query)
    );
  };

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
        <div className="w-80 flex flex-col bg-[var(--card)] border border-(--card-border) rounded-3xl overflow-hidden shadow-sm">
          {/* Search and Tabs Header */}
          <div className="p-4 space-y-4 border-b border-(--card-border) bg-[var(--input)]/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={12} />
              <input 
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--card)] border border-(--card-border) rounded-xl pl-9 pr-4 py-2 text-[10px] font-bold focus:outline-none focus:border-[var(--primary)] text-black dark:text-white"
              />
            </div>
            <div className="flex p-1 bg-[var(--input)] rounded-xl gap-1">
              <button 
                onClick={() => setActiveTab('active')}
                className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'active' ? 'bg-[var(--primary)] text-white dark:text-black shadow-sm' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
              >
                Active ({myTickets.length})
              </button>
              <button 
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'pending' ? 'bg-[var(--primary)] text-white dark:text-black shadow-sm' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
              >
                Queue ({openTickets.length})
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'history' ? 'bg-[var(--primary)] text-white dark:text-black shadow-sm' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
              >
                History ({closedTickets.length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'active' && (
              <div className="p-2 space-y-2 animate-in fade-in duration-300">
                {filterBySearch(myTickets).map(ticket => (
                  <TicketCard 
                    key={ticket._id} 
                    ticket={ticket} 
                    isSelected={selectedTicketId === ticket._id}
                    onClick={() => setSelectedTicketId(ticket._id)}
                  />
                ))}
                {othersActive.length > 0 && (
                  <>
                    <div className="px-3 pt-4 pb-2">
                      <h4 className="text-[7px] font-black uppercase tracking-[0.3em] text-[var(--muted)] opacity-50">Peer Operations</h4>
                    </div>
                    {filterBySearch(othersActive).map(ticket => (
                      <TicketCard 
                        key={ticket._id} 
                        ticket={ticket} 
                        isSelected={selectedTicketId === ticket._id}
                        onClick={() => setSelectedTicketId(ticket._id)}
                        isPeer={true}
                      />
                    ))}
                  </>
                )}
                {filterBySearch(myTickets).length === 0 && othersActive.length === 0 && (
                  <EmptyState text="No active cycles found" />
                )}
              </div>
            )}

            {activeTab === 'pending' && (
              <div className="p-2 space-y-2 animate-in fade-in duration-300">
                {filterBySearch(openTickets).map(ticket => (
                  <TicketCard 
                    key={ticket._id} 
                    ticket={ticket} 
                    isSelected={selectedTicketId === ticket._id}
                    onClick={() => setSelectedTicketId(ticket._id)}
                    statusColor="orange"
                  />
                ))}
                {filterBySearch(openTickets).length === 0 && (
                  <EmptyState text="Stream queue empty" />
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-2 space-y-2 animate-in fade-in duration-300">
                {filterBySearch(closedTickets).map(ticket => (
                  <TicketCard 
                    key={ticket._id} 
                    ticket={ticket} 
                    isSelected={selectedTicketId === ticket._id}
                    onClick={() => setSelectedTicketId(ticket._id)}
                    isArchived={true}
                  />
                ))}
                {filterBySearch(closedTickets).length === 0 && (
                  <EmptyState text="No archived history" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content: Chat View */}
        <div className="flex-1 bg-[var(--card)] border border-(--card-border) rounded-3xl flex flex-col overflow-hidden shadow-sm">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-(--card-border) bg-[var(--input)]/30">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl flex items-center justify-center font-black text-xl">
                      {selectedTicket.userName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-[var(--foreground)] tracking-tight text-black dark:text-white">{selectedTicket.subject}</h3>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mt-1">
                        <span className="flex items-center gap-1"><UserIcon size={12} /> {selectedTicket.userName}</span>
                        <span className="w-1 h-1 bg-[var(--muted)] rounded-full opacity-30"></span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                        {selectedTicket.assignedName && (
                          <>
                            <span className="w-1 h-1 bg-[var(--muted)] rounded-full opacity-30"></span>
                            <span className="flex items-center gap-1 text-[var(--primary)]"><CheckCircle2 size={12} /> Assigned to {selectedTicket.assignedName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedTicket.status === 'open' ? (
                      <button 
                        onClick={() => takeTicket(selectedTicket._id)}
                        className="px-6 py-2.5 bg-[var(--primary)] text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[var(--primary)]/20"
                      >
                        Establish Connection
                      </button>
                    ) : selectedTicket.status === 'in-progress' ? (
                      <button 
                        onClick={() => closeTicket(selectedTicket._id)}
                        className="px-6 py-2.5 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-red-500/20"
                      >
                        Terminate Cycle
                      </button>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          Archived Cycle
                        </span>
                        <span className="text-[9px] font-bold text-[var(--muted)] mt-1 uppercase tracking-widest">Closed on {new Date(selectedTicket.updatedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
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
                        <div className={`flex items-center gap-1 text-[9px] font-bold text-[var(--muted)] uppercase px-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <span>{isAdmin ? 'System Agent' : selectedTicket.userName} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          {isAdmin && (
                            msg.seen ? <CheckCheck size={10} className="text-[var(--primary)]" /> : <Check size={10} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isOtherTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--input)] text-[var(--foreground)] px-5 py-3 rounded-2xl rounded-bl-none text-xs flex items-center gap-3 border border-(--card-border)">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="font-black uppercase text-[10px] tracking-widest text-[var(--muted)]">{typingName} is typing...</span>
                    </div>
                  </div>
                )}
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
                        onChange={handleTypingIndicator}
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

// Sub-components for cleaner code
function TicketCard({ ticket, isSelected, onClick, isPeer = false, isArchived = false, statusColor = 'primary' }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
        isSelected 
        ? 'bg-[var(--primary)]/10 border-[var(--primary)] shadow-sm' 
        : `bg-[var(--card)] border-(--card-border) hover:border-[var(--muted)] ${isArchived || isPeer ? 'opacity-70 hover:opacity-100' : ''}`
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-black uppercase ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`}>
            #{ticket._id.slice(-6).toUpperCase()}
          </span>
          {ticket.messages.some((m: any) => m.senderRole === 'user' && !m.seen) && (
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50"></span>
          )}
        </div>
        <span className="text-[8px] font-bold text-[var(--muted)]">
          {isArchived ? new Date(ticket.updatedAt).toLocaleDateString() : new Date(ticket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>
      <h4 className="font-black text-xs text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors text-black dark:text-white">
        {ticket.subject}
      </h4>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[var(--input)] border border-(--card-border) rounded-lg flex items-center justify-center text-[9px] font-black">
            {ticket.userName.charAt(0)}
          </div>
          <span className="text-[9px] font-bold text-[var(--muted)] truncate max-w-[80px]">{ticket.userName}</span>
        </div>
        {isPeer && (
          <span className="text-[8px] font-black uppercase text-[var(--primary)]/60 bg-[var(--primary)]/5 px-2 py-0.5 rounded-md">
            {ticket.assignedName}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)] italic opacity-50">{text}</p>
    </div>
  );
}
