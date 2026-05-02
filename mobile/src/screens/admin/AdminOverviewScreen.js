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
import Icon from '../../components/Icon';
import IconSquare from '../../components/IconSquare';
import Badge from '../../components/Badge';
import { adminApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { colors, gradients, radius, shadow, spacing, typography } from '../../theme';

const TILES = [
  { key: 'universities', label: 'Universities', icon: 'Building2', gradient: gradients.primary, delta: '+3' },
  { key: 'agents', label: 'Agents', icon: 'Waves', gradient: gradients.campus, delta: '+1' },
  { key: 'consultants', label: 'Consultants', icon: 'Briefcase', gradient: gradients.scholarships, delta: '+2' },
  { key: 'students', label: 'Students', icon: 'GraduationCap', gradient: gradients.tilePurple, delta: '+86' },
  { key: 'posts', label: 'Posts', icon: 'PenSquare', gradient: gradients.tileBlue, delta: '+12' },
  { key: 'pendingApprovals', label: 'Pending', icon: 'AlertTriangle', gradient: gradients.tileAmber, delta: '+2' },
  { key: 'bookings', label: 'Bookings', icon: 'Calendar', gradient: gradients.tileRose, delta: '+8' },
  { key: 'leads', label: 'Leads', icon: 'Mail', gradient: gradients.events, delta: '+14' },
];

export default function AdminOverviewScreen({ navigation }) {
  const { data, loading } = useApiResource(() => adminApi.overview(), []);
  const { width } = useWindowDimensions();
  const counts = data?.counts || {};

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

        <HeroCard style={{ marginTop: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="Shield" size={16} color={colors.white} />
            <Text style={styles.eyebrow}>ADMIN</Text>
          </View>
          <Text style={styles.heroTitle}>Platform Overview</Text>
          <Text style={styles.heroSub}>Live across the marketplace — updated just now</Text>

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>All systems operational</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.statusPct}>99.98%</Text>
          </View>
        </HeroCard>

        <View style={styles.grid}>
          {TILES.map((t) => (
            <View key={t.key} style={[styles.tile, shadow.sm]}>
              <View style={styles.tileHeader}>
                <IconSquare name={t.icon} gradient={t.gradient} size={38} iconSize={18} />
                <Badge variant="success">{t.delta}</Badge>
              </View>
              <Text style={styles.tileValue}>{(counts[t.key] ?? 0).toLocaleString()}</Text>
              <Text style={styles.tileLabel}>{t.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeading}>Quick actions</Text>
        <View style={{ gap: spacing.sm }}>
          <ActionRow
            icon="Users"
            gradient={gradients.campus}
            label="Manage users"
            hint="Approve, suspend or reactivate accounts"
            onPress={() => navigation.navigate('AdminUsers')}
          />
          <ActionRow
            icon="Shield"
            gradient={gradients.scholarships}
            label="Moderate posts"
            hint="Pin, hide or remove content"
            onPress={() => navigation.navigate('AdminPosts')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function ActionRow({ icon, gradient, label, hint, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, shadow.sm, pressed && { opacity: 0.96 }]}
    >
      <IconSquare name={icon} gradient={gradient} size={44} iconSize={20} />
      <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionHint}>{hint}</Text>
      </View>
      <Icon name="ChevronRight" size={18} color={colors.slate400} />
    </Pressable>
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
  eyebrow: { ...typography.label, color: 'rgba(255,255,255,0.85)' },
  heroTitle: { ...typography.displayLg, color: colors.white, marginTop: 4 },
  heroSub: { ...typography.caption, color: 'rgba(255,255,255,0.88)', marginTop: 4 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: 10,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: { ...typography.caption, color: colors.white, fontWeight: '700' },
  statusPct: { ...typography.caption, color: colors.white, fontWeight: '800' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    minHeight: 124,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileValue: {
    ...typography.displayLg,
    color: colors.slate900,
    marginTop: spacing.md,
  },
  tileLabel: { ...typography.caption, color: colors.slate500, marginTop: 2 },
  sectionHeading: {
    ...typography.titleMd,
    color: colors.slate900,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
  },
  actionLabel: { ...typography.titleMd, color: colors.slate900 },
  actionHint: { ...typography.caption, color: colors.slate500, marginTop: 2 },
});
