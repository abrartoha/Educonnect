import {
  Alert,
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
import Icon from '../../components/Icon';
import IconSquare from '../../components/IconSquare';
import Button from '../../components/Button';
import { useAuth } from '../../auth/AuthContext';
import { colors, gradients, radius, shadow, spacing, typography } from '../../theme';
import { ROLE_LABEL } from '../../api/mappers';

function menuFor(role) {
  const base = [
    { label: 'Dashboard', emoji: 'BarChart3', tint: gradients.primary, route: 'RoleDashboard' },
    { label: 'My Posts', emoji: 'PenSquare', tint: gradients.tilePurple, route: 'MyPosts' },
    { label: 'Compare Universities', emoji: 'GitCompare', tint: gradients.visa, route: 'Compare' },
    { label: 'Edit Profile', emoji: 'Settings', tint: gradients.tileBlue, route: 'EditProfile' },
  ];
  if (role === 'university') {
    return [
      base[0],
      { label: 'Student Leads', emoji: 'Mail', tint: gradients.tileAmber, route: 'Leads' },
      { label: 'Campaigns', emoji: 'Megaphone', tint: gradients.scholarships, route: 'Campaigns' },
      ...base.slice(1),
    ];
  }
  if (role === 'agent' || role === 'consultant') {
    return [
      base[0],
      { label: 'Bookings', emoji: 'Calendar', tint: gradients.campus, route: 'Bookings' },
      ...base.slice(1),
    ];
  }
  if (role === 'student') {
    return [
      base[0],
      { label: 'My Bookings', emoji: 'Calendar', tint: gradients.campus, route: 'Bookings' },
      { label: 'Bookmarks', emoji: 'Bookmark', tint: gradients.scholarships, route: 'Bookmarks' },
      ...base.slice(1),
    ];
  }
  if (role === 'admin') {
    return [
      { label: 'Platform Overview', emoji: 'Shield', tint: gradients.primary, route: 'AdminOverview' },
      { label: 'Manage Users', emoji: 'Users', tint: gradients.campus, route: 'AdminUsers' },
      { label: 'Moderate Posts', emoji: 'AlertOctagon', tint: gradients.scholarships, route: 'AdminPosts' },
      { label: 'My Posts', emoji: 'PenSquare', tint: gradients.tilePurple, route: 'MyPosts' },
      { label: 'Edit Profile', emoji: 'Settings', tint: gradients.tileBlue, route: 'EditProfile' },
    ];
  }
  return base;
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();

  if (!user) return null;

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;
  const menu = menuFor(user.role);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[
          { paddingHorizontal: horizontalPadding, paddingBottom: spacing['4xl'] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <HeroCard style={{ marginTop: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={user.name} uri={user.avatarUrl} size={66} />
            <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
              <Text style={styles.name} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {user.email}
              </Text>
              <View style={styles.heroBadges}>
                <Badge variant="primary" icon={iconForRole(user.role)}>
                  {ROLE_LABEL[user.role] || user.role}
                </Badge>
                <Badge variant={user.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {user.status || 'ACTIVE'}
                </Badge>
              </View>
            </View>
          </View>

          <View style={styles.statsStrip}>
            <Stat value="4" label="Posts" />
            <Sep />
            <Stat value="8" label="Bookmarks" />
            <Sep />
            <Stat value="2" label="Bookings" />
          </View>
        </HeroCard>

        {/* Menu */}
        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
          {menu.map((m) => (
            <Pressable
              key={m.route}
              onPress={() => navigation.navigate(m.route)}
              style={({ pressed }) => [styles.menuItem, shadow.sm, pressed && { opacity: 0.96 }]}
            >
              <IconSquare
                name={m.emoji}
                size={44}
                iconSize={20}
                gradient={m.tint}
              />
              <Text style={styles.menuLabel}>{m.label}</Text>
              <Icon name="ChevronRight" size={18} color={colors.slate400} />
            </Pressable>
          ))}
        </View>

        <Button
          title="Sign out"
          variant="danger"
          onPress={handleLogout}
          icon="LogOut"
          style={{ marginTop: spacing.xl }}
        />

        <Text style={styles.version}>EduConnect · v1.0</Text>
      </ScrollView>
    </Screen>
  );
}

function iconForRole(role) {
  return {
    admin: 'Shield',
    university: 'Building2',
    agent: 'Waves',
    consultant: 'Briefcase',
    student: 'GraduationCap',
  }[role];
}

function Stat({ value, label }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
function Sep() {
  return (
    <View style={{ width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.22)' }} />
  );
}

const styles = StyleSheet.create({
  name: { ...typography.titleLg, color: colors.white },
  email: { ...typography.caption, color: 'rgba(255,255,255,0.82)', marginTop: 2 },
  heroBadges: { flexDirection: 'row', gap: 6, marginTop: 6 },
  statsStrip: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
  },
  statValue: { ...typography.titleLg, color: colors.white, fontWeight: '800' },
  statLabel: { ...typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
  },
  menuLabel: {
    flex: 1,
    ...typography.titleMd,
    color: colors.slate900,
  },
  version: {
    ...typography.caption,
    color: colors.slate400,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
