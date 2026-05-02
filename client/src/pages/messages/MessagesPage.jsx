import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MessageSquare, Send, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';
import { messagingApi } from '../../api/endpoints';
import { getSocket } from '../../lib/socket';

const formatRelative = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diffMin = Math.round((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffMin < 1440) return `${Math.round(diffMin / 60)}h`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
};

const formatTimestamp = (iso) =>
  new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });

function ConversationList({ conversations, activeId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (!conversations.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center text-sm text-slate-500">
        <MessageSquare className="mb-3 h-10 w-10 text-slate-300" />
        No conversations yet.
        <span className="mt-1 text-xs text-slate-400">
          Open any agent, consultant, or university and tap Message.
        </span>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-slate-100">
      {conversations.map((c) => {
        const active = c.id === activeId;
        return (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                active ? 'bg-violet-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-600">
                {(c.otherUser?.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {c.otherUser?.name || 'User'}
                  </p>
                  <span className="flex-shrink-0 text-[11px] text-slate-400">
                    {formatRelative(c.lastMessageAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-slate-500">
                    {c.lastMessage?.body || 'No messages yet'}
                  </p>
                  {c.unreadCount > 0 && (
                    <span className="flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function MessageBubble({ message, mine }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
          mine
            ? 'rounded-br-sm bg-violet-600 text-white'
            : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
        }`}
      >
        <p className="whitespace-pre-wrap break-words leading-snug">{message.body}</p>
        <p
          className={`mt-1 text-right text-[10px] tabular-nums tracking-tight ${
            mine ? 'text-violet-200' : 'text-slate-400'
          }`}
        >
          {formatTimestamp(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

function ThreadView({ conversation, messages, onSend, sending, currentUserId }) {
  const [draft, setDraft] = useState('');
  const scrollerRef = useRef(null);

  // Scroll to bottom on new message.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-slate-400">
        <MessageSquare className="mb-3 h-12 w-12 text-slate-200" />
        <p className="text-sm">Select a conversation</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    setDraft('');
    await onSend(trimmed);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-600">
          {(conversation.otherUser?.name || '?').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {conversation.otherUser?.name || 'User'}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            {conversation.otherUser?.role?.toLowerCase() || 'user'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollerRef} className="flex-1 space-y-2 overflow-y-auto bg-slate-50 px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Say hello to start the conversation.
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} mine={m.senderId === currentUserId} />
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-shrink-0 items-center gap-2 border-t border-slate-200 bg-white p-3"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={4000}
          placeholder="Type a message…"
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          aria-label="Send"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}

export default function MessagesPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useStore();

  const [conversations, setConversations] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const activeIdRef = useRef(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === conversationId) || null,
    [conversations, conversationId]
  );

  // ----- Load conversations -------------------------------------------------
  const refreshConversations = useCallback(async () => {
    try {
      const data = await messagingApi.listConversations();
      setConversations(data?.items || []);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // ----- Load messages for active conversation ------------------------------
  useEffect(() => {
    activeIdRef.current = conversationId;
    if (!conversationId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await messagingApi.listMessages(conversationId, { limit: 50 });
        if (cancelled) return;
        setMessages([...(data?.items || [])].reverse());
        await messagingApi.markRead(conversationId);
        // Reset unread for this conv in the list.
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
        );
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Could not load messages');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  // ----- Socket subscription -----------------------------------------------
  useEffect(() => {
    const socket = getSocket();

    const onNewMessage = ({ conversationId: convId, message }) => {
      // Append to thread if it's the active one.
      if (convId === activeIdRef.current) {
        setMessages((prev) =>
          prev.find((m) => m.id === message.id) ? prev : [...prev, message]
        );
        // Don't bump unread; user is viewing.
        messagingApi.markRead(convId).catch(() => {});
      }
      // Update list ordering + unread + last message preview.
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === convId);
        if (idx === -1) {
          // New conversation — refetch list to pick it up properly.
          refreshConversations();
          return prev;
        }
        const next = [...prev];
        const isActive = convId === activeIdRef.current;
        const isMine = message.senderId === currentUser?.id;
        next[idx] = {
          ...next[idx],
          lastMessage: { ...message },
          lastMessageAt: message.createdAt,
          unreadCount:
            isActive || isMine ? 0 : (next[idx].unreadCount || 0) + 1,
        };
        // Bubble to top.
        const [active] = next.splice(idx, 1);
        return [active, ...next];
      });
    };

    socket.on('message:new', onNewMessage);
    return () => {
      socket.off('message:new', onNewMessage);
    };
  }, [currentUser?.id, refreshConversations]);

  // Join/leave the conversation room when active id changes.
  useEffect(() => {
    if (!conversationId) return undefined;
    const socket = getSocket();
    const join = () => socket.emit('conversation:join', conversationId);
    join();
    socket.on('connect', join);
    return () => {
      socket.emit('conversation:leave', conversationId);
      socket.off('connect', join);
    };
  }, [conversationId]);

  const handleSend = async (body) => {
    if (!conversationId) return;
    setSending(true);
    try {
      const data = await messagingApi.sendMessage(conversationId, body);
      // Optimistic append in case the socket event hasn't arrived yet.
      const msg = data?.item;
      if (msg) {
        setMessages((prev) =>
          prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]
        );
      }
    } catch (err) {
      toast.error(err.message || 'Could not send');
    } finally {
      setSending(false);
    }
  };

  const handleSelect = (id) => navigate(`/messages/${id}`);

  return (
    <div className="-m-6 grid h-[calc(100vh-4rem)] grid-cols-1 overflow-hidden bg-white md:grid-cols-[320px_1fr]">
      {/* Conversation list */}
      <aside
        className={`flex flex-col border-r border-slate-200 ${
          conversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-3">
          <MessageSquare className="h-5 w-5 text-violet-600" />
          <h2 className="text-sm font-bold text-slate-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            activeId={conversationId}
            onSelect={handleSelect}
            loading={loadingConvs}
          />
        </div>
      </aside>

      {/* Thread */}
      <section className={`flex flex-col ${conversationId ? 'flex' : 'hidden md:flex'}`}>
        {conversationId && (
          <Link
            to="/messages"
            className="flex items-center gap-1 border-b border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 md:hidden"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to conversations
          </Link>
        )}
        <div className="flex-1 overflow-hidden">
          <ThreadView
            conversation={activeConversation}
            messages={messages}
            onSend={handleSend}
            sending={sending}
            currentUserId={currentUser?.id}
          />
        </div>
      </section>
    </div>
  );
}
