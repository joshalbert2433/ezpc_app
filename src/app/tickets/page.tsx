'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Loader2, 
  X, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  HeadphonesIcon,
  ImageIcon,
  Paperclip
} from 'lucide-react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';

interface Message {
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  text?: string;
  image?: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export default function UserTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newOrderId, setNewOrderId] = useState('');
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
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
      fetchUserTickets();
    });

    socketRef.current.on('refresh-ticket', () => {
      fetchUserTickets();
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
    if (!authLoading && user) {
      fetchUserTickets();
      const interval = setInterval(fetchUserTickets, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user, authLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicketId, tickets]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserTickets = async () => {
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

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newSubject, message: newMessage }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Ticket created successfully');
        setShowCreateModal(false);
        setNewSubject('');
        setNewMessage('');
        setTickets(prev => [data, ...prev]);
        setSelectedTicketId(data._id);
      } else {
        toast.error('Failed to create ticket');
      }
    } catch (error) {
      toast.error('Error creating ticket');
    } finally {
      setCreating(false);
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
        setTickets(prev => prev.map(t => t._id === selectedTicketId ? updatedTicket : t));
      } else {
        toast.error('Failed to send message');
        setChatMessage(text);
        setPreviewImage(image);
      }
    } catch (error) {
      toast.error('Error sending message');
      setChatMessage(text);
      setPreviewImage(image);
    } finally {
      setSending(false);
    }
  };

  const selectedTicket = tickets.find(t => t._id === selectedTicketId);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
        <p className="animate-pulse text-[var(--muted)] font-black uppercase tracking-widest text-xs">Accessing Support Channels...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black mb-4 text-[var(--foreground)] uppercase tracking-tighter">Login Required</h2>
        <p className="text-[var(--muted)] max-w-md mx-auto mb-8">Please login to access our support system and tickets.</p>
        <Link href="/login" className="bg-[var(--primary)] text-white dark:text-black px-8 py-3 rounded-xl font-black transition-all">SIGN IN</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 min-h-[70vh]">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[var(--foreground)] uppercase tracking-tighter text-black dark:text-white">Customer Support<span className="text-[var(--primary)]">_</span></h1>
          <p className="text-[var(--muted)] mt-2 font-medium">Get assistance from our system agents and technical specialists</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-[var(--primary)] text-white dark:text-black px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[var(--primary)]/10"
        >
          <Plus size={20} /> Open New Ticket
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-[var(--card)] border border-(--card-border) rounded-3xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-5 border-b border-(--card-border) bg-[var(--input)]/30">
            <h3 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Active Streams</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {tickets.length === 0 ? (
              <div className="p-12 text-center opacity-40">
                <MessageSquare size={48} className="mx-auto mb-4 text-[var(--muted)]" />
                <p className="text-xs font-bold uppercase tracking-widest">No Active Tickets</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div 
                  key={ticket._id}
                  onClick={() => setSelectedTicketId(ticket._id)}
                  className={`p-5 border-b border-(--card-border) transition-all cursor-pointer group hover:bg-[var(--input)]/20 ${
                    selectedTicketId === ticket._id ? 'bg-[var(--primary)]/10 border-l-4 border-l-[var(--primary)]' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                      ticket.status === 'open' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      ticket.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                      'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}>
                      {ticket.status}
                    </span>
                    <span className="text-[9px] font-bold text-[var(--muted)]">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-black text-sm text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors text-black dark:text-white">{ticket.subject}</h4>
                  <p className="text-[10px] font-medium text-[var(--muted)] mt-1 truncate">
                    {ticket.messages[ticket.messages.length - 1]?.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-[var(--card)] border border-(--card-border) rounded-3xl overflow-hidden flex flex-col shadow-sm relative">
          {selectedTicket ? (
            <>
              <div className="p-6 border-b border-(--card-border) flex items-center gap-4 bg-[var(--input)]/30">
                <div className="w-10 h-10 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center font-black">
                  <HeadphonesIcon size={20} />
                </div>
                <div>
                  <h3 className="font-black text-[var(--foreground)] text-black dark:text-white tracking-tight">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                    Ticket #{selectedTicket._id.slice(-6).toUpperCase()} • Last updated {new Date(selectedTicket.updatedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[var(--input)]/5">
                {selectedTicket.messages.map((msg, idx) => {
                  const isAdmin = msg.senderRole === 'admin';
                  return (
                    <div key={idx} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[85%] ${isAdmin ? 'items-start' : 'items-end'} flex flex-col gap-1`}>
                        <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                          isAdmin 
                            ? 'bg-[var(--input)] text-[var(--foreground)] rounded-bl-none text-black dark:text-white' 
                            : 'bg-[var(--primary)] text-white dark:text-black rounded-br-none shadow-md shadow-[var(--primary)]/5'
                        }`}>
                          {msg.image && (
                            <div className="mb-2 rounded-lg overflow-hidden border border-black/5 max-w-[300px]">
                              <img src={msg.image} alt="Sent image" className="w-full h-auto cursor-zoom-in" onClick={() => window.open(msg.image, '_blank')} />
                            </div>
                          )}
                          {msg.text && <div>{msg.text}</div>}
                        </div>
                        <span className="text-[9px] font-bold text-[var(--muted)] uppercase px-1">
                          {isAdmin ? 'System Support' : 'You'} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {selectedTicket.status !== 'closed' ? (
                <div className="p-6 border-t border-(--card-border) bg-[var(--card)] flex flex-col gap-4">
                  {previewImage && (
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-(--card-border) shadow-xl group">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setPreviewImage(null)}
                        className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
                  <form onSubmit={sendMessage} className="flex gap-4">
                    <div className="relative">
                      <label className="w-14 h-14 bg-[var(--input)]/50 border border-(--card-border) rounded-2xl flex items-center justify-center cursor-pointer hover:border-[var(--primary)] transition-all">
                        {isUploading ? <Loader2 size={24} className="animate-spin text-[var(--muted)]" /> : <ImageIcon size={24} className="text-[var(--muted)]" />}
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
                      placeholder="Type your message..."
                      className="flex-1 bg-[var(--input)]/50 border border-(--card-border) rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[var(--primary)] transition-all text-black dark:text-white"
                      disabled={sending || isUploading}
                    />
                    <button 
                      type="submit"
                      disabled={sending || isUploading || (!chatMessage.trim() && !previewImage)}
                      className="w-14 h-14 bg-[var(--primary)] text-white dark:text-black rounded-2xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50 flex-shrink-0 shadow-lg shadow-[var(--primary)]/20"
                    >
                      {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-8 bg-green-500/5 text-center border-t border-(--card-border)">
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-black text-xs uppercase tracking-[0.2em]">
                    <CheckCircle2 size={16} /> Transmission Cycle Completed
                  </div>
                  <p className="text-[10px] text-[var(--muted)] mt-1 font-bold">This ticket is now closed. Open a new ticket if you need further assistance.</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
              <div className="w-20 h-20 bg-[var(--input)] rounded-3xl flex items-center justify-center text-[var(--muted)] animate-bounce">
                <MessageSquare size={40} />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tight text-black dark:text-white">Uplink Interface</h3>
                <p className="text-[var(--muted)] max-w-xs mx-auto mt-2 text-sm font-medium">Select a ticket from the sidebar to view the communication stream or open a new one.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--card)] w-full max-w-lg rounded-3xl border border-(--card-border) shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-(--card-border) flex justify-between items-center bg-[var(--input)]/30">
              <h3 className="text-lg font-black text-[var(--foreground)] uppercase tracking-tight text-black dark:text-white">Initialize Ticket</h3>
              <button onClick={() => !creating && setShowCreateModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={createTicket} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-1">Subject Matter</label>
                <input 
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g., Technical issue with order #12345"
                  className="w-full bg-[var(--input)] border border-(--card-border) rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[var(--primary)] transition-all text-black dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-1">Detailed Inquiry</label>
                <textarea 
                  required
                  rows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full bg-[var(--input)] border border-(--card-border) rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[var(--primary)] transition-all resize-none text-black dark:text-white"
                />
              </div>
              <button 
                type="submit"
                disabled={creating}
                className="w-full bg-[var(--primary)] text-white dark:text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20"
              >
                {creating ? <Loader2 size={18} className="animate-spin" /> : 'Open Communication Stream'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
