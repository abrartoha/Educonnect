import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Screen from '../../components/Screen';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import Avatar from '../../components/Avatar';
import Icon from '../../components/Icon';
import { adminApi, postsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normalisePost, ROLE_LABEL, CATEGORY_LABEL } from '../../api/mappers';
import { colors, gradients, radius, shadow, spacing, typography } from '../../theme';

const STATUS_VARIANT = {
  published: 'success',
  hidden: 'warning',
  removed: 'danger',
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'flagged', label: 'Flagged' },
  { id: 'hidden', label: 'Hidden' },
];

export default function AdminPostsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { width } = useWindowDimensions();

  const { data, loading, refetch } = useApiResource(
    () => postsApi.list({ limit: 100, sort: 'new' }),
    []
  );

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;

  const posts = useMemo(() => {
    const all = (data?.items || []).map(normalisePost);
    const withSearch = !search.trim()
      ? all
      : all.filter(
          (p) =>
            p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.authorName?.toLowerCase().includes(search.toLowerCase())
        );
    if (filter === 'hidden') return withSearch.filter((p) => p.status === 'hidden');
    return withSearch;
  }, [data, search, filter]);

  if (loading && !data) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary600} size="large" />
        </View>
      </Screen>
    );
  }

  const togglePin = async (p) => {
    try {
      await adminApi.togglePostPin(p.id);
      refetch();
    } catch (err) {
      Alert.alert('Could not pin', err?.message || 'Try again.');
    }
  };

  const hidePost = async (p) => {
    const next = p.status === 'published' ? 'HIDDEN' : 'PUBLISHED';
    try {
      await adminApi.setPostStatus(p.id, next);
      refetch();
    } catch (err) {
      Alert.alert('Could not update', err?.message || 'Try again.');
    }
  };

  const removePost = (p) => {
    Alert.alert('Remove post?', 'This hides the post from the feed permanently.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await postsApi.remove(p.id);
            refetch();
          } catch (err) {
            Alert.alert('Could not remove', err?.message || 'Try again.');
          }
        },
      },
    ]);
  };

  const ListHeader = (
    <View>
      <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
        <Icon name="ArrowLeft" size={16} color={colors.primary600} />
        <Text style={styles.backText}>Admin</Text>
      </Pressable>
      <Text style={styles.title}>Moderate Posts</Text>
      <Text style={styles.subtitle}>Pin, hide or remove community content.</Text>

      <View style={styles.searchWrap}>
        <Icon name="Search" size={16} color={colors.slate400} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search posts..."
          placeholderTextColor={colors.slate400}
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChips}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f.id && { color: colors.white }]}>{f.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={[{ paddingHorizontal: horizontalPadding, paddingBottom: spacing['4xl'] }]}
        ListHeaderComponent={ListHeader}
        renderItem={({ item: p }) => (
          <View style={[styles.card, shadow.sm]}>
            <View style={styles.row}>
              <Avatar uri={p.authorAvatar} name={p.authorName} size={36} />
              <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
                <Text style={styles.authorName} numberOfLines={1}>{p.authorName}</Text>
                <View style={{ flexDirection: 'row', gap: 4, marginTop: 2, flexWrap: 'wrap' }}>
                  <Badge variant={p.authorType === 'university' ? 'university' : p.authorType === 'agent' ? 'agent' : 'primary'}>
                    {ROLE_LABEL[p.authorType] || p.authorType}
                  </Badge>
                  <Badge variant={STATUS_VARIANT[p.status] || 'neutral'}>{p.status}</Badge>
                  {p.isPinned ? <Badge variant="warning" icon="Pin">pinned</Badge> : null}
                </View>
              </View>
            </View>
            <Pressable onPress={() => navigation.navigate('PostDetail', { postId: p.id })}>
              <Text style={styles.postTitle}>{p.title}</Text>
              <Text style={styles.content} numberOfLines={2}>{p.content}</Text>
              <Text style={styles.meta}>
                # {CATEGORY_LABEL[p.category] || p.category} · ↑ {p.upvotes} · 💬 {p.commentCount}
              </Text>
            </Pressable>

            <View style={styles.actions}>
              <Pressable onPress={() => togglePin(p)} style={[styles.actionBtn, { backgroundColor: colors.slate100 }]}>
                <Icon name={p.isPinned ? 'PinOff' : 'Pin'} size={14} color={colors.slate700} strokeWidth={2.5} />
                <Text style={[styles.actionText, { color: colors.slate700 }]}>
                  {p.isPinned ? 'Unpin' : 'Pin'}
                </Text>
              </Pressable>
              <Pressable onPress={() => hidePost(p)} style={[styles.actionBtn, { backgroundColor: colors.slate100 }]}>
                <Icon name={p.status === 'published' ? 'EyeOff' : 'Eye'} size={14} color={colors.slate700} strokeWidth={2.5} />
                <Text style={[styles.actionText, { color: colors.slate700 }]}>
                  {p.status === 'published' ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
              <Pressable onPress={() => removePost(p)} style={[styles.actionBtn, { backgroundColor: colors.dangerSoft }]}>
                <Icon name="Trash2" size={14} color={colors.danger} strokeWidth={2.5} />
                <Text style={[styles.actionText, { color: colors.danger }]}>Remove</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState icon="Shield" title="No posts found" message="Try a different search." />
        }
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backText: { ...typography.body, color: colors.primary600, fontWeight: '700' },
  title: { ...typography.displayLg, color: colors.slate900 },
  subtitle: { ...typography.caption, color: colors.slate500, marginTop: 4 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, color: colors.slate900, ...typography.body, height: '100%' },
  filterChips: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary600,
    borderColor: colors.primary600,
  },
  filterText: { ...typography.caption, color: colors.slate700, fontWeight: '700' },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  authorName: { ...typography.titleMd, color: colors.slate900 },
  postTitle: { ...typography.titleMd, color: colors.slate900, marginTop: spacing.sm },
  content: { ...typography.body, color: colors.slate600, marginTop: 4, lineHeight: 20 },
  meta: { ...typography.caption, color: colors.slate500, marginTop: 6 },
  actions: { flexDirection: 'row', gap: 6, marginTop: spacing.md },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  actionText: { ...typography.caption, fontWeight: '700' },
});
