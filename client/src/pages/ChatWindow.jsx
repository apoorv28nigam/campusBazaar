import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Check, CheckCheck, Phone, ExternalLink } from 'lucide-react';
import { messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatDistanceToNow, format } from 'date-fns';
import { SkeletonChat } from '../components/Loader';

export default function ChatWindow() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getSocket, isOnline } = useSocket();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const inputRef = useRef(null);

  const other = conversation?.participants?.find(p => p._id !== user?._id);

  useEffect(() => {
    messagesAPI.getMessages(id)
      .then(res => {
        setConversation(res.data);
        setMessages(res.data.messages || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('joinConversation', id);

    socket.on('newMessage', (data) => {
      if (data.conversationId === id) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    socket.on('typing', ({ userId, isTyping }) => {
      if (userId !== user?._id) setOtherTyping(isTyping);
    });

    return () => {
      socket.emit('leaveConversation', id);
      socket.off('newMessage');
      socket.off('typing');
    };
  }, [id, getSocket, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput('');

    // Optimistic
    const optimistic = { _id: Date.now(), sender: { _id: user._id, name: user.name, avatar: user.avatar }, content, createdAt: new Date().toISOString(), seen: false };
    setMessages(prev => [...prev, optimistic]);

    try {
      await messagesAPI.send(id, content);
    } catch (e) {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
    } finally {
      setSending(false);
    }

    // Stop typing
    const socket = getSocket();
    if (socket) socket.emit('typing', { conversationId: id, userId: user._id, isTyping: false });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    const socket = getSocket();
    if (!socket) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', { conversationId: id, userId: user._id, isTyping: true });
    }

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit('typing', { conversationId: id, userId: user._id, isTyping: false });
    }, 1500);
  };

  if (loading) return <SkeletonChat />;

  return (
    <div style={{ paddingTop: 64, height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <Link to="/messages" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none' }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ position: 'relative' }}>
          <img src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=6B4F3A&color=fff&size=40`} 
            alt={other?.name} style={{ width: 42, height: 42, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)' }} />
          {other && isOnline(other._id) && (
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: 'var(--success)', border: '2px solid white' }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>{other?.name}</div>
          <div style={{ fontSize: 12, color: other && isOnline(other._id) ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
            {otherTyping ? '✍️ typing...' : other && isOnline(other._id) ? 'Online' : 'Offline'}
          </div>
        </div>
        {conversation?.itemRef && (
          <Link to={`/buy/${conversation.itemRef._id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, background: 'var(--primary-light)', border: '1px solid rgba(107, 79, 58, 0.1)', color: 'var(--primary)', fontSize: 12, fontWeight: 700, textDecoration: 'none', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <ExternalLink size={12} /> {conversation.itemRef.title}
          </Link>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px dashed var(--border)' }}>
              <Send size={24} color="var(--text-muted)" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 500 }}>No messages yet. Say hi to {other?.name}!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
          const showDate = i === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[i - 1]?.createdAt).toDateString();

          return (
            <div key={msg._id || i}>
              {showDate && (
                <div style={{ textAlign: 'center', margin: '24px 0' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(107, 79, 58, 0.05)', padding: '4px 14px', borderRadius: 99, border: '1px solid rgba(107, 79, 58, 0.1)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 12, alignItems: 'flex-end' }}>
                {!isMe && (
                  <img src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.name || 'U')}&background=6B4F3A&color=fff&size=32`} 
                    alt="" style={{ width: 32, height: 32, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
                )}
                <div style={{ maxWidth: '80%' }}>
                  <div style={{ 
                    padding: '12px 16px', 
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMe ? 'var(--primary)' : 'white',
                    color: isMe ? 'white' : 'var(--text)',
                    border: isMe ? 'none' : '1px solid var(--border)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    fontSize: 14,
                    lineHeight: 1.5,
                    fontWeight: isMe ? 500 : 400
                  }}>
                    {msg.content}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{format(new Date(msg.createdAt), 'h:mm a')}</span>
                    {isMe && (
                      msg.seen ? <CheckCheck size={12} color="var(--primary)" /> : <Check size={12} color="var(--text-muted)" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {otherTyping && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <img src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=6B4F3A&color=fff&size=32`} 
              alt="" style={{ width: 32, height: 32, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border)' }} />
            <div style={{ background: 'white', borderRadius: '14px 14px 14px 4px', border: '1px solid var(--border)', padding: '12px 18px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 0.3, 0.6].map(d => (
                <div key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', opacity: 0.6, animation: `bounce 1.4s ease-in-out ${d}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 20px 32px', background: 'white', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 12, alignItems: 'center', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={handleTyping}
              placeholder="Type your message..."
              style={{ 
                width: '100%', 
                padding: '16px 20px', 
                background: 'var(--bg)', 
                border: '1px solid var(--border)', 
                borderRadius: 16, 
                color: 'var(--text)', 
                fontSize: 15, 
                outline: 'none', 
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s'
              }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
            />
          </div>
          <button 
            type="submit" 
            disabled={!input.trim() || sending} 
            style={{
              width: 52, 
              height: 52, 
              borderRadius: 16, 
              flexShrink: 0,
              background: input.trim() ? 'var(--primary)' : 'var(--bg)',
              border: input.trim() ? 'none' : '1px solid var(--border)', 
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: input.trim() ? '0 8px 20px rgba(107, 79, 58, 0.2)' : 'none'
            }}
          >
            <Send size={20} color={input.trim() ? 'white' : 'var(--text-muted)'} />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
