import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Screen from '../../components/Screen';
import EmptyState from '../../components/EmptyState';
import Avatar from '../../components/Avatar';
import { messagingApi } from '../../api/endpoints';
import { getSocket } from '../../lib/socket';
import { colors, radius, shadow, spacing, typography } from '../../theme';

const formatRelative = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diffMin = Math.round((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffMin < 1440) return `${Math.round(diffMin / 60)}h`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
};

export default function MessagesListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await messagingApi.listConversations();
      setItems(data?.items || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Refetch every time the screen regains focus.
  useEffect(() => {
    const unsub = navigation.addListener('focus', refresh);
    return unsub;
  }, [navigation, refresh]);

  // Live update on new messages.
  useEffect(() => {
    let socket;
    let detached = false;
    (async () => {
      socket = await getSocket();
      if (!socket || detached) return;
      socket.on('message:new', refresh);
    })();
    return () => {
      detached = true;
      if (socket) socket.off('message:new', refresh);
    };
  }, [refresh]);

  const onRefresh = () => {
    setRefreshing(true);
    refresh();
  };

  // Show the spinner only on first load — focus refreshes and socket-driven
  // updates keep the existing list on screen.
  if (loading && items.length === 0) {
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
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>
          {items.length === 0
            ? 'No conversations yet'
            : `${items.length} conversation${items.length === 1 ? '' : 's'}`}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing['4xl'],
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('Conversation', {
                conversationId: item.id,
                otherUserName: item.otherUser?.name,
              })
            }
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
          >
            <Avatar
              name={item.otherUser?.name}
              uri={item.otherUser?.avatarUrl}
              size={44}
            />
            <View style={styles.rowMid}>
              <View style={styles.rowTop}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.otherUser?.name || 'User'}
                </Text>
                <Text style={styles.time}>{formatRelative(item.lastMessageAt)}</Text>
              </View>
              <View style={styles.rowBottom}>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.lastMessage?.body || 'No messages yet'}
                </Text>
                {item.unreadCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unreadCount}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={
          <EmptyState
            icon="MessageSquare"
            title="No messages yet"
            message="Open any agent, university, or consultant and tap Message."
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: { ...typography.displayLg, color: colors.slate900 },
  subtitle: { ...typography.caption, color: colors.slate500, marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    ...shadow.sm,
  },
  rowMid: { flex: 1, minWidth: 0 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { ...typography.body, color: colors.slate900, fontWeight: '700', flex: 1 },
  time: { ...typography.micro, color: colors.slate400 },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  preview: { ...typography.caption, color: colors.slate500, flex: 1 },
  badge: {
    backgroundColor: colors.primary600,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.micro,
    color: colors.white,
    fontWeight: '800',
    fontSize: 10,
  },
  sep: { height: spacing.sm },
});
