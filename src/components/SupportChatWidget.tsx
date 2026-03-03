'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  ChevronDown, 
  Plus, 
  HeadphonesIcon,
  Minimize2,
  ExternalLink,
  ImageIcon,
  Paperclip
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id?: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  text?: string;
  image?: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  messages: Message[];
  updatedAt: string;
}

export default function SupportChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'list' | 'chat' | 'create'>('list');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newIntro, setNewIntro] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection with explicit config
    socketRef.current = io(undefined, {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
    });

    socketRef.current.on('connect_error', (err) => {
      console.log('Socket Connection Error:', err.message);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    const handleMessage = (message: Message) => {
      console.log('Socket message received:', message);
      setTickets(prev => prev.map(t => {
        if (t._id === selectedTicketId) {
          // Check if message already exists to avoid duplicates
          const exists = t.messages.some(m => 
            (m._id && m._id === message._id) || 
            (m.text === message.text && m.senderId === message.senderId && Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 2000)
          );
          
          if (!exists) {
            return { ...t, messages: [...t.messages, message], updatedAt: new Date().toISOString() };
          }
        }
        return t;
      }));
    };

    const handleRefresh = () => {
      console.log('Socket refresh triggered');
      fetchSelectedTicket();
      fetchTickets();
    };

    socket.on('message-received', handleMessage);
    socket.on('refresh-ticket', handleRefresh);

    return () => {
      socket.off('message-received', handleMessage);
      socket.off('refresh-ticket', handleRefresh);
    };
  }, [selectedTicketId]);

  useEffect(() => {
    if (socketRef.current && selectedTicketId) {
      socketRef.current.emit('join-ticket', selectedTicketId);
      return () => {
        socketRef.current?.emit('leave-ticket', selectedTicketId);
      };
    }
  }, [selectedTicketId]);

  useEffect(() => {
    if (user && isOpen && view === 'list') {
      fetchTickets();
    }
  }, [user, isOpen, view]);

  // Polling for new messages when chat is open
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && view === 'chat' && selectedTicketId) {
      interval = setInterval(fetchSelectedTicket, 5000);
    }
    return () => clearInterval(interval);
  }, [isOpen, view, selectedTicketId]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicketId, tickets]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchSelectedTicket = async () => {
    if (!selectedTicketId) return;
    try {
      const res = await fetch(`/api/tickets/${selectedTicketId}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(prev => prev.map(t => t._id === data._id ? data : t));
      }
    } catch (error) {
      console.error('Error fetching selected ticket:', error);
    }
  };

  const handleOpenChat = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setView('chat');
  };

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newIntro.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newSubject, message: newIntro }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewSubject('');
        setNewIntro('');
        fetchTickets();
        setSelectedTicketId(data._id);
        setView('chat');
      } else {
        toast.error('Failed to start chat');
      }
    } catch (error) {
      toast.error('Error starting chat');
    } finally {
      setCreating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: local preview
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
        // Assuming your upload API returns the URL in data.url or data.path
        setPreviewImage(data.url || data.path);
      } else {
        toast.error('Image upload failed');
        setPreviewImage(null);
      }
    } catch (error) {
      toast.error('Error uploading image');
      setPreviewImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || (!chatMessage.trim() && !previewImage)) return;

    const text = chatMessage;
    const image = previewImage;
    setChatMessage('');
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
        // Update local state immediately
        setTickets(prev => prev.map(t => t._id === selectedTicketId ? updatedTicket : t));
        // Also emit socket for other participants if needed, 
        // but the API route already does global.io.emit
      } else {
        toast.error('Message failed');
        setChatMessage(text);
        setPreviewImage(image);
      }
    } catch (error) {
      toast.error('Connection error');
      setChatMessage(text);
      setPreviewImage(image);
    } finally {
      setSending(false);
    }
  };

  if (!user || user.role === 'admin') return null;

  const selectedTicket = tickets.find(t => t._id === selectedTicketId);

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-sans">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-[var(--primary)] text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 animate-in fade-in zoom-in group"
        >
          <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[var(--background)] animate-pulse"></span>
        </button>
      ) : (
        <div className="w-[360px] h-[520px] bg-[var(--card)] border border-(--card-border) rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 backdrop-blur-xl">
          {/* Header */}
          <div className="p-5 bg-[var(--primary)] text-white dark:text-black flex justify-between items-center shrink-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <HeadphonesIcon size={20} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest leading-none">Support Uplink</h3>
                <p className="text-[10px] font-bold opacity-80 mt-1 uppercase">Technical Division</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <Minimize2 size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-[var(--background)]/50">
            {view === 'list' ? (
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Active Streams</h4>
                  <button 
                    onClick={() => setView('create')}
                    className="flex items-center gap-1 text-[10px] font-black text-[var(--primary)] uppercase tracking-widest hover:underline"
                  >
                    <Plus size={12} /> New Request
                  </button>
                </div>
                
                {tickets.length === 0 ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-[var(--input)] rounded-3xl mx-auto flex items-center justify-center text-[var(--muted)]/50">
                      <MessageSquare size={32} />
                    </div>
                    <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">No communication history</p>
                    <button 
                      onClick={() => setView('create')}
                      className="px-6 py-2.5 bg-[var(--input)] hover:bg-[var(--card-border)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-black dark:text-white"
                    >
                      Initialize Link
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tickets.map(ticket => (
                      <div 
                        key={ticket._id}
                        onClick={() => handleOpenChat(ticket._id)}
                        className="p-4 bg-[var(--card)] border border-(--card-border) rounded-2xl hover:border-[var(--primary)] transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`px-1.5 py-0.5 rounded-[4px] text-[7px] font-black uppercase tracking-widest ${
                            ticket.status === 'open' ? 'bg-orange-500/10 text-orange-500' :
                            ticket.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-green-500/10 text-green-500'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className="text-[8px] font-bold text-[var(--muted)]">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <h5 className="text-xs font-black text-[var(--foreground)] truncate group-hover:text-[var(--primary)] text-black dark:text-white">{ticket.subject}</h5>
                      </div>
                    ))}
                  </div>
                )}
                
                <Link 
                  href="/tickets" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest hover:text-[var(--primary)] transition-colors border-t border-(--card-border) mt-4"
                >
                  <ExternalLink size={12} /> View Full Dashboard
                </Link>
              </div>
            ) : view === 'chat' && selectedTicket ? (
              <div className="flex flex-col h-full">
                <div className="px-4 py-2 border-b border-(--card-border) bg-[var(--input)]/30 flex items-center gap-2">
                  <button onClick={() => setView('list')} className="p-1 text-[var(--muted)] hover:text-[var(--primary)]"><ChevronDown size={18} className="rotate-90" /></button>
                  <span className="text-[10px] font-black text-[var(--foreground)] uppercase truncate text-black dark:text-white">{selectedTicket.subject}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {selectedTicket.messages.map((msg, idx) => {
                    const isAdmin = msg.senderRole === 'admin';
                    return (
                      <div key={idx} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-snug ${
                          isAdmin 
                            ? 'bg-[var(--input)] text-[var(--foreground)] rounded-bl-none text-black dark:text-white' 
                            : 'bg-[var(--primary)] text-white dark:text-black rounded-br-none shadow-sm'
                        }`}>
                          {msg.image && (
                            <div className="mb-2 overflow-hidden rounded-lg border border-black/10">
                              <img src={msg.image} alt="Sent image" className="max-w-full h-auto object-cover cursor-zoom-in" onClick={() => window.open(msg.image, '_blank')} />
                            </div>
                          )}
                          {msg.text && <div>{msg.text}</div>}
                          <div className={`text-[8px] font-bold mt-1 uppercase opacity-60 ${isAdmin ? 'text-left' : 'text-right'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {selectedTicket.status !== 'closed' ? (
                  <div className="p-4 border-t border-(--card-border) bg-[var(--card)] flex flex-col gap-3">
                    {previewImage && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-(--card-border) group">
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setPreviewImage(null)}
                          className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    <form onSubmit={sendMessage} className="flex gap-2">
                      <div className="relative">
                        <label className="w-10 h-10 bg-[var(--input)] border border-(--card-border) rounded-xl flex items-center justify-center cursor-pointer hover:border-[var(--primary)] transition-all">
                          {isUploading ? <Loader2 size={16} className="animate-spin text-[var(--muted)]" /> : <ImageIcon size={16} className="text-[var(--muted)]" />}
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
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type message..."
                        className="flex-1 bg-[var(--input)] border border-(--card-border) rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[var(--primary)] text-black dark:text-white"
                        disabled={sending || isUploading}
                      />
                      <button 
                        type="submit"
                        disabled={sending || isUploading || (!chatMessage.trim() && !previewImage)}
                        className="w-10 h-10 bg-[var(--primary)] text-white dark:text-black rounded-xl flex items-center justify-center disabled:opacity-50"
                      >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-4 text-center bg-green-500/5 border-t border-(--card-border)">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Cycle Completed</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <button onClick={() => setView('list')} className="p-1 text-[var(--muted)] hover:text-[var(--primary)]"><ChevronDown size={18} className="rotate-90" /></button>
                  <h4 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-[0.2em] text-black dark:text-white">Initialize Stream</h4>
                </div>
                
                <form onSubmit={createTicket} className="space-y-5 flex-1">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Subject</label>
                    <input 
                      required
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Issue title..."
                      className="w-full bg-[var(--input)] border border-(--card-border) rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[var(--primary)] text-black dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Description</label>
                    <textarea 
                      required
                      rows={4}
                      value={newIntro}
                      onChange={(e) => setNewIntro(e.target.value)}
                      placeholder="How can we help you?"
                      className="w-full bg-[var(--input)] border border-(--card-border) rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[var(--primary)] resize-none text-black dark:text-white"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={creating}
                    className="w-full py-4 bg-[var(--primary)] text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[var(--primary)]/20 disabled:opacity-50"
                  >
                    {creating ? <Loader2 size={16} className="mx-auto animate-spin" /> : 'Establish Uplink'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
