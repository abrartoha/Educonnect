import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Screen from '../../components/Screen';
import HeroCard from '../../components/HeroCard';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import StatTile from '../../components/StatTile';
import Icon from '../../components/Icon';
import IconSquare from '../../components/IconSquare';
import {
  directoryApi,
  bookingsApi,
  leadsApi,
  postsApi,
} from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import {
  normaliseBooking,
  normaliseDirectoryItem,
  normaliseLead,
  normalisePost,
  ROLE_LABEL,
} from '../../api/mappers';
import { useAuth } from '../../auth/AuthContext';
import { colors, gradients, radius, shadow, spacing, typography } from '../../theme';

const FETCH_PROFILE = {
  university: directoryApi.getUniversity,
  agent: directoryApi.getAgent,
  consultant: directoryApi.getConsultant,
};

export default function RoleDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const role = user?.role;

  const { data: profileData, loading: profileLoading } = useApiResource(
    () =>
      FETCH_PROFILE[role] && user?.id
        ? FETCH_PROFILE[role](user.id)
        : Promise.resolve(null),
    [role, user?.id]
  );
  const profile = profileData?.item
    ? normaliseDirectoryItem(profileData.item)
    : null;

  const { data: leadsData } = useApiResource(
    () => (role === 'university' ? leadsApi.list() : Promise.resolve(null)),
    [role]
  );
  const { data: bookingsData } = useApiResource(
    () =>
      role === 'agent' || role === 'consultant' || role === 'student'
        ? bookingsApi.list()
        : Promise.resolve(null),
    [role]
  );
  const { data: myPostsData } = useApiResource(() => postsApi.mine(), []);

  if (profileLoading && role !== 'student' && role !== 'admin') {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary600} size="large" />
        </View>
      </Screen>
    );
  }

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;
  const leads = (leadsData?.items || []).map(normaliseLead);
  const bookings = (bookingsData?.items || []).map(normaliseBooking);
  const posts = (myPostsData?.items || []).map(normalisePost);

  const stats = buildStats({ role, profile, leads, bookings, posts });
  const quick = buildQuickActions(role);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[{ paddingHorizontal: horizontalPadding, paddingBottom: spacing['4xl'] }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
          <Icon name="ArrowLeft" size={16} color={colors.primary600} />
          <Text style={styles.backText}>Profile</Text>
        </Pressable>

        {/* Greeting hero */}
        <HeroCard style={{ marginTop: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={user?.name} uri={user?.avatarUrl} size={56} />
            <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
              <Text style={styles.greeting} numberOfLines={1}>
                Hi, {user?.name?.split(' ')[0] || 'there'} 👋
              </Text>
              <Text style={styles.sub}>Here's what's happening today</Text>
            </View>
          </View>

          {/* Weekly profile views inset card (design's hero-inside-hero) */}
          <View style={styles.insetCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="TrendingUp" size={18} color={colors.primary600} />
              <Text style={styles.insetLabel}>Weekly profile views</Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.insetDelta}>+24%</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={gradients.scholarships}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: '62%' }]}
              />
            </View>
          </View>
        </HeroCard>

        {/* Stat grid */}
        {stats.length ? (
          <View style={styles.statsGrid}>
            {stats.map((s) => (
              <StatTile
                key={s.label}
                label={s.label}
                value={s.value}
                icon={s.icon}
                delta={s.delta}
                tint={s.tint}
              />
            ))}
          </View>
        ) : null}

        {/* Quick actions */}
        <Text style={styles.sectionHeading}>Quick actions</Text>
        <View style={{ gap: spacing.sm }}>
          {quick.map((q) => (
            <Pressable
              key={q.route}
              onPress={() => navigation.navigate(q.route)}
              style={({ pressed }) => [styles.qa, shadow.sm, pressed && { opacity: 0.96 }]}
            >
              <IconSquare
                name={q.icon}
                size={40}
                iconSize={18}
                gradient={q.gradient}
              />
              <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
                <Text style={styles.qaLabel}>{q.label}</Text>
                {q.hint ? <Text style={styles.qaHint}>{q.hint}</Text> : null}
              </View>
              <Icon name="ChevronRight" size={18} color={colors.slate400} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function buildStats({ role, profile, leads, bookings, posts }) {
  if (role === 'university') {
    return [
      { label: 'Profile views', icon: 'Eye', value: (profile?.views || 0).toLocaleString(), delta: '+18%', tint: 'purple' },
      { label: 'Inquiries', icon: 'Mail', value: (profile?.inquiries || 0).toLocaleString(), delta: '+7%', tint: 'yellow' },
      { label: 'Active leads', icon: 'Flame', value: leads.filter((l) => l.status !== 'closed').length, delta: '+3', tint: 'orange' },
      { label: 'Avg rating', icon: 'Star', value: (profile?.rating || 0).toFixed(1), delta: '+0.1', tint: 'green' },
    ];
  }
  if (role === 'agent') {
    return [
      { label: 'Placed', icon: 'GraduationCap', value: profile?.studentsPlaced || 0, delta: '+4', tint: 'purple' },
      { label: 'Partners', icon: 'Building2', value: profile?.partnerInstitutions || 0, delta: '+1', tint: 'blue' },
      { label: 'Bookings', icon: 'Calendar', value: bookings.length, tint: 'orange' },
      { label: 'Success %', icon: 'TrendingUp', value: `${profile?.successRate || 0}%`, delta: '+2%', tint: 'green' },
    ];
  }
  if (role === 'consultant') {
    return [
      { label: 'Helped', icon: 'Users', value: profile?.studentsAssisted || 0, delta: '+3', tint: 'purple' },
      { label: 'Rate', icon: 'DollarSign', value: profile?.hourlyRate ? `$${profile.hourlyRate}` : '—', tint: 'yellow' },
      { label: 'Bookings', icon: 'Calendar', value: bookings.length, tint: 'orange' },
      { label: 'Rating', icon: 'Star', value: (profile?.rating || 0).toFixed(1), tint: 'green' },
    ];
  }
  if (role === 'student') {
    return [
      { label: 'Bookings', icon: 'Calendar', value: bookings.length, tint: 'purple' },
      { label: 'Posts', icon: 'PenSquare', value: posts.length, tint: 'blue' },
      {
        label: 'Upcoming',
        icon: 'Clock',
        value: bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length,
        tint: 'orange',
      },
    ];
  }
  return [];
}

function buildQuickActions(role) {
  if (role === 'university') {
    return [
      { label: 'Student leads', icon: 'Mail', gradient: gradients.tileBlue, route: 'Leads', hint: '12 new this week' },
      { label: 'Campaigns', icon: 'Megaphone', gradient: gradients.scholarships, route: 'Campaigns', hint: '2 active' },
      { label: 'My posts', icon: 'PenSquare', gradient: gradients.tilePurple, route: 'MyPosts' },
    ];
  }
  if (role === 'agent' || role === 'consultant') {
    return [
      { label: 'Bookings', icon: 'Calendar', gradient: gradients.campus, route: 'Bookings' },
      { label: 'My posts', icon: 'PenSquare', gradient: gradients.tilePurple, route: 'MyPosts' },
      { label: 'Edit profile', icon: 'Settings', gradient: gradients.tileBlue, route: 'EditProfile' },
    ];
  }
  if (role === 'student') {
    return [
      { label: 'My bookings', icon: 'Calendar', gradient: gradients.campus, route: 'Bookings' },
      { label: 'Bookmarks', icon: 'Bookmark', gradient: gradients.scholarships, route: 'Bookmarks' },
      { label: 'Compare universities', icon: 'GitCompare', gradient: gradients.visa, route: 'Compare' },
    ];
  }
  return [
    { label: 'Manage users', icon: 'Users', gradient: gradients.campus, route: 'AdminUsers' },
    { label: 'Moderate posts', icon: 'AlertOctagon', gradient: gradients.scholarships, route: 'AdminPosts' },
  ];
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
  greeting: { ...typography.titleLg, color: colors.white, fontWeight: '800' },
  sub: { ...typography.caption, color: 'rgba(255,255,255,0.88)', marginTop: 2 },
  insetCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  insetLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.slate700,
    marginLeft: 8,
  },
  insetDelta: { ...typography.caption, color: colors.success, fontWeight: '700' },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.slate100,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 4 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  sectionHeading: {
    ...typography.titleMd,
    color: colors.slate900,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  qa: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
  },
  qaLabel: { ...typography.titleMd, color: colors.slate900 },
  qaHint: { ...typography.caption, color: colors.slate500, marginTop: 2 },
});
