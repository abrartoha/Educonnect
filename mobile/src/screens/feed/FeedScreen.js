import { useCallback, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Screen from '../../components/Screen';
import Icon from '../../components/Icon';
import PostCard from '../../components/PostCard';
import CategoryTile from '../../components/CategoryTile';
import EmptyState from '../../components/EmptyState';
import { postsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normalisePost } from '../../api/mappers';
import { useAuth } from '../../auth/AuthContext';
import { colors, gradients, radius, shadow, spacing, typography } from '../../theme';

const SORTS = [
  { id: 'hot', label: 'Hot', icon: 'Flame' },
  { id: 'new', label: 'New', icon: 'Clock' },
  { id: 'top', label: 'Top', icon: 'TrendingUp' },
];

const CATEGORIES = [
  { id: 'SCHOLARSHIPS', label: 'Scholarships', icon: 'Trophy', gradient: gradients.scholarships },
  { id: 'VISA_TIPS', label: 'Visa', icon: 'ShieldCheck', gradient: gradients.visa },
  { id: 'COURSES', label: 'Courses', icon: 'BookOpen', gradient: gradients.courses },
  { id: 'CAMPUS_LIFE', label: 'Campus', icon: 'Coffee', gradient: gradients.campus },
  { id: 'CAREER', label: 'Career', icon: 'Briefcase', gradient: gradients.career },
  { id: 'STUDENT_LIFE', label: 'Life', icon: 'Sparkles', gradient: gradients.studentLife },
  { id: 'EVENTS', label: 'Events', icon: 'CalendarDays', gradient: gradients.events },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function todayLabel() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function FeedScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const [sort, setSort] = useState('hot');
  const [category, setCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;

  const { data, refetch, loading } = useApiResource(
    () =>
      postsApi.list({
        limit: 50,
        sort,
        category: category === 'all' ? undefined : category,
      }),
    [sort, category]
  );

  const posts = useMemo(
    () => (data?.items || []).map(normalisePost),
    [data]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const ListHeader = (
    <View>
      <View style={styles.topRow}>
        <Text style={styles.date}>{todayLabel()}</Text>
        <Text style={styles.title}>Community Feed</Text>
      </View>

      {/* Sort pills */}
      <View style={styles.sortRow}>
        {SORTS.map((s) => (
          <SortPill
            key={s.id}
            label={s.label}
            icon={s.icon}
            active={sort === s.id}
            onPress={() => setSort(s.id)}
          />
        ))}
      </View>

      {/* Category tiles */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        {CATEGORIES.map((c) => (
          <CategoryTile
            key={c.id}
            label={c.label}
            icon={c.icon}
            gradient={c.gradient}
            active={category === c.id}
            onPress={() => setCategory(category === c.id ? 'all' : c.id)}
            style={{ marginRight: spacing.md }}
          />
        ))}
      </ScrollView>
    </View>
  );

  if (loading && !data) {
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
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          { paddingHorizontal: horizontalPadding, paddingBottom: spacing['5xl'] },
        ]}
        ListHeaderComponent={ListHeader}
        renderItem={({ item, index }) => (
          <PostCard
            post={item}
            featured={index === 0}
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="Inbox"
            title="No posts yet"
            message="Try a different category or be the first to post."
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary600} />
        }
        showsVerticalScrollIndicator={false}
      />
      {isAuthenticated ? (
        <Pressable
          onPress={() => navigation.navigate('CreatePost')}
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }, shadow.glow]}
        >
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabInner}
          >
            <Icon name="PenSquare" size={22} color={colors.white} strokeWidth={2.5} />
          </LinearGradient>
        </Pressable>
      ) : null}
    </Screen>
  );
}

function SortPill({ label, icon, active, onPress }) {
  if (active) {
    return (
      <Pressable onPress={onPress} style={{ marginRight: spacing.sm }}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.sortPill, styles.sortPillActive]}
        >
          <Icon name={icon} size={14} color={colors.white} strokeWidth={2.5} />
          <Text style={[styles.sortText, { color: colors.white }]}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={[styles.sortPill, { marginRight: spacing.sm }]}>
      <Icon name={icon} size={14} color={colors.slate600} strokeWidth={2.5} />
      <Text style={styles.sortText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  date: { ...typography.caption, color: colors.slate500, marginBottom: 2 },
  title: { ...typography.displayLg, color: colors.slate900 },
  sortRow: { flexDirection: 'row', marginBottom: spacing.md },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.white,
  },
  sortPillActive: {},
  sortText: { ...typography.caption, color: colors.slate700, fontWeight: '700' },
  categoriesRow: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.xl,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    borderRadius: 30,
  },
  fabInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
