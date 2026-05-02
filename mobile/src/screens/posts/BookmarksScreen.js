import { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Screen from '../../components/Screen';
import PostCard from '../../components/PostCard';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import { postsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normalisePost } from '../../api/mappers';
import { colors, spacing, typography } from '../../theme';

export default function BookmarksScreen({ navigation }) {
  const { data, loading, refetch } = useApiResource(() => postsApi.bookmarks(), []);
  const { width } = useWindowDimensions();
  const posts = useMemo(
    () => (data?.items || []).map((p) => ({ ...normalisePost(p), hasBookmarked: true })),
    [data]
  );

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;

  if (loading && !data) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary600} size="large" />
        </View>
      </Screen>
    );
  }

  const Header = (
    <View>
      <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
        <Icon name="ArrowLeft" size={16} color={colors.primary600} />
        <Text style={styles.backText}>Profile</Text>
      </Pressable>
      <Text style={styles.title}>Bookmarks</Text>
      <Text style={styles.subtitle}>Saved posts · {posts.length}</Text>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={[{ paddingHorizontal: horizontalPadding, paddingBottom: spacing['4xl'] }]}
        ListHeaderComponent={Header}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="Bookmark"
            title="No bookmarks yet"
            message="Tap the bookmark icon on any post to save it for later."
          />
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
  subtitle: { ...typography.caption, color: colors.slate500, marginTop: 4, marginBottom: spacing.md },
});
