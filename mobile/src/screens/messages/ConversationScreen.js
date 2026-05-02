import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Screen from '../../components/Screen';
import Icon from '../../components/Icon';
import { messagingApi } from '../../api/endpoints';
import { getSocket } from '../../lib/socket';
import { useAuth } from '../../auth/AuthContext';
import { colors, radius, shadow, spacing, typography } from '../../theme';

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });

export default function ConversationScreen({ route, navigation }) {
  const { conversationId, otherUserName } = route.params || {};
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);
  const socketRef = useRef(null);

  // Initial load + mark as read
  const loadMessages = useCallback(async () => {
    try {
      const data = await messagingApi.listMessages(conversationId, { limit: 50 });
      const items = [...(data?.items || [])].reverse();
      setMessages(items);
      await messagingApi.markRead(conversationId).catch(() => {});
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Subscribe to live messages.
  useEffect(() => {
    let detached = false;
    (async () => {
      const socket = await getSocket();
      if (!socket || detached) return;
      socketRef.current = socket;

      const onJoinAck = () => {};
      socket.emit('conversation:join', conversationId, onJoinAck);

      const onMessage = ({ conversationId: cid, message }) => {
        if (cid !== conversationId) return;
        setMessages((prev) =>
          prev.find((m) => m.id === message.id) ? prev : [...prev, message]
        );
        messagingApi.markRead(conversationId).catch(() => {});
      };
      socket.on('message:new', onMessage);

      // Re-join on reconnect.
      const onConnect = () => socket.emit('conversation:join', conversationId);
      socket.on('connect', onConnect);

      socketRef.current._handlers = { onMessage, onConnect };
    })();

    return () => {
      detached = true;
      const socket = socketRef.current;
      if (socket) {
        socket.emit('conversation:leave', conversationId);
        const h = socket._handlers;
        if (h) {
          socket.off('message:new', h.onMessage);
          socket.off('connect', h.onConnect);
        }
      }
    };
  }, [conversationId]);

  const send = async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    setDraft('');
    setSending(true);
    try {
      const res = await messagingApi.sendMessage(conversationId, trimmed);
      const msg = res?.item;
      if (msg) {
        setMessages((prev) =>
          prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]
        );
      }
    } catch {
      // restore draft if send failed
      setDraft(trimmed);
    } finally {
      setSending(false);
    }
  };

  // First-load spinner only — incoming live messages replace the empty state
  // smoothly so we never blank the thread mid-conversation.
  if (loading && messages.length === 0) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary600} size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
          <Icon name="ArrowLeft" size={18} color={colors.primary600} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={styles.headerName} numberOfLines={1}>
            {otherUserName || 'Conversation'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.md,
          }}
          renderItem={({ item }) => {
            const mine = item.senderId === user?.id;
            return (
              <View
                style={[
                  styles.bubbleWrap,
                  { alignItems: mine ? 'flex-end' : 'flex-start' },
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    mine ? styles.bubbleMine : styles.bubbleTheirs,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      { color: mine ? colors.white : colors.slate900 },
                    ]}
                  >
                    {item.body}
                  </Text>
                  <Text
                    style={[
                      styles.bubbleTime,
                      {
                        color: mine
                          ? 'rgba(255,255,255,0.75)'
                          : colors.slate400,
                      },
                    ]}
                  >
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Say hello to start the conversation.</Text>
            </View>
          }
        />

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message…"
            placeholderTextColor={colors.slate400}
            maxLength={4000}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={send}
            disabled={!draft.trim() || sending}
            style={({ pressed }) => [
              styles.sendBtn,
              (!draft.trim() || sending) && { backgroundColor: colors.slate300 },
              pressed && { opacity: 0.85 },
            ]}
          >
            {sending ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Icon name="Send" size={16} color={colors.white} strokeWidth={2.5} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: { ...typography.titleMd, color: colors.slate900, fontWeight: '700' },
  bubbleWrap: { marginVertical: 4 },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: colors.primary600,
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: { ...typography.body, lineHeight: 20 },
  bubbleTime: {
    ...typography.micro,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'right',
  },
  empty: { paddingVertical: spacing['2xl'], alignItems: 'center' },
  emptyText: { ...typography.caption, color: colors.slate400 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.slate900,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
