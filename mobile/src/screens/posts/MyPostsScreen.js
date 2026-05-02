import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Screen from '../../components/Screen';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import { postsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normalisePost, CATEGORY_LABEL } from '../../api/mappers';
import { colors, radius, shadow, spacing, typography } from '../../theme';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'hidden', label: 'Hidden' },
];

export default function MyPostsScreen({ navigation }) {
  const { data, loading, refetch } = useApiResource(() => postsApi.mine(), []);
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState('all');

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;

  const posts = useMemo(() => {
    const all = (data?.items || []).map(normalisePost);
    if (filter === 'all') return all;
    return all.filter((p) => p.status === filter);
  }, [data, filter]);

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

  if (loading && !data) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary600} size="large" />
        </View>
      </Screen>
    );
  }

  const confirmDelete = (post) => {
    Alert.alert('Delete post?', `"${post.title}" will be removed permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await postsApi.remove(post.id);
            refetch();
          } catch (err) {
            Alert.alert('Could not delete', err?.message || 'Try again.');
          }
        },
      },
    ]);
  };

  const ListHeader = (
    <View>
      <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
        <Icon name="ArrowLeft" size={16} color={colors.primary600} />
        <Text style={styles.backText}>Profile</Text>
      </Pressable>
      <Text style={styles.title}>My Posts</Text>
      <Text style={styles.subtitle}>
        {posts.length} posts · {totalViews.toLocaleString()} total views
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f.id && { color: colors.white }]}>
              {f.label}
            </Text>
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
        renderItem={({ item }) => (
          <View style={[styles.card, shadow.sm]}>
            <View style={styles.cardTop}>
              <Badge variant="primary">{CATEGORY_LABEL[item.category] || item.category}</Badge>
            </View>
            <Pressable onPress={() => navigation.navigate('PostDetail', { postId: item.id })}>
              <Text style={styles.titleText} numberOfLines={2}>{item.title}</Text>
            </Pressable>
            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Icon name="ArrowUp" size={12} color={colors.slate600} strokeWidth={2.5} />
                <Text style={styles.statText}>{item.upvotes}</Text>
              </View>
              <View style={styles.statPill}>
                <Icon name="MessageSquare" size={12} color={colors.slate600} />
                <Text style={styles.statText}>{item.commentCount}</Text>
              </View>
              <View style={styles.statPill}>
                <Icon name="Eye" size={12} color={colors.slate600} />
                <Text style={styles.statText}>{(item.views || 0).toLocaleString()}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <Pressable
                onPress={() => navigation.navigate('CreatePost', { editPost: item })}
                style={styles.miniBtn}
              >
                <Icon name="Pencil" size={12} color={colors.primary600} strokeWidth={2.5} />
                <Text style={[styles.miniBtnText, { color: colors.primary600 }]}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => confirmDelete(item)} style={styles.miniBtn}>
                <Icon name="Trash2" size={12} color={colors.danger} strokeWidth={2.5} />
                <Text style={[styles.miniBtnText, { color: colors.danger }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState icon="PenSquare" title="No posts yet" message="Tap the edit FAB on Feed to create one." />
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
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
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
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleText: { ...typography.titleMd, color: colors.slate900, marginTop: 8, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { ...typography.caption, color: colors.slate600, fontWeight: '600' },
  miniBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6 },
  miniBtnText: { ...typography.caption, fontWeight: '700' },
});
