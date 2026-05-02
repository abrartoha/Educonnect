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
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import IconSquare from '../../components/IconSquare';
import { adminApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { ROLE_LABEL } from '../../api/mappers';
import { colors, gradients, radius, shadow, spacing, typography } from '../../theme';

const ROLE_FILTERS = [
  { id: null, label: 'All' },
  { id: 'UNIVERSITY', label: 'Universities' },
  { id: 'AGENT', label: 'Agents' },
  { id: 'STUDENT', label: 'Students' },
];

const STATUS_VARIANT = {
  ACTIVE: 'success',
  PENDING: 'warning',
  SUSPENDED: 'danger',
};

const ROLE_EDGE = {
  UNIVERSITY: colors.roleUniversity,
  AGENT: colors.roleAgent,
  CONSULTANT: colors.roleConsultant,
  STUDENT: colors.roleStudent,
  ADMIN: colors.primary600,
};

const ROLE_ICON = {
  UNIVERSITY: 'Building2',
  AGENT: 'Waves',
  CONSULTANT: 'Briefcase',
  STUDENT: 'GraduationCap',
  ADMIN: 'Shield',
};

export default function AdminUsersScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [roleFilter, setRoleFilter] = useState(null);
  const [search, setSearch] = useState('');

  const { data, loading, refetch } = useApiResource(
    () => adminApi.listUsers({ role: roleFilter || undefined, limit: 100 }),
    [roleFilter]
  );

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;

  const users = useMemo(() => {
    const all = data?.items || [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const act = async (fn) => {
    try {
      await fn();
      refetch();
    } catch (err) {
      Alert.alert('Could not update', err?.message || 'Try again.');
    }
  };

  if (loading && !data) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary600} size="large" />
        </View>
      </Screen>
    );
  }

  const ListHeader = (
    <View>
      <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
        <Icon name="ArrowLeft" size={16} color={colors.primary600} />
        <Text style={styles.backText}>Admin</Text>
      </Pressable>
      <Text style={styles.title}>Users</Text>
      <Text style={styles.subtitle}>Approve, suspend or reactivate accounts.</Text>

      <View style={styles.searchWrap}>
        <Icon name="Search" size={16} color={colors.slate400} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or email..."
          placeholderTextColor={colors.slate400}
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {ROLE_FILTERS.map((r) => (
          <Pressable
            key={r.label}
            onPress={() => setRoleFilter(r.id)}
            style={[styles.filterChip, roleFilter === r.id && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, roleFilter === r.id && { color: colors.white }]}>
              {r.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={[{ paddingHorizontal: horizontalPadding, paddingBottom: spacing['4xl'] }]}
        ListHeaderComponent={ListHeader}
        renderItem={({ item: u }) => (
          <View style={[styles.card, { borderLeftColor: ROLE_EDGE[u.role] || colors.slate300 }, shadow.sm]}>
            <View style={styles.row}>
              <Avatar uri={u.avatarUrl} name={u.name} size={44} />
              <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
                <Text style={styles.name} numberOfLines={1}>{u.name}</Text>
                <Text style={styles.email} numberOfLines={1}>{u.email}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                  <Badge variant="primary" icon={ROLE_ICON[u.role]}>
                    {ROLE_LABEL[String(u.role).toLowerCase()] || u.role}
                  </Badge>
                  <Badge variant={STATUS_VARIANT[u.status] || 'neutral'}>
                    {u.status}
                  </Badge>
                </View>
              </View>
            </View>
            <View style={styles.actions}>
              {u.status === 'PENDING' ? (
                <Pressable onPress={() => act(() => adminApi.approve(u.id))} style={[styles.actionBtn, { backgroundColor: colors.successSoft }]}>
                  <Icon name="Check" size={14} color={colors.success} strokeWidth={2.5} />
                  <Text style={[styles.actionText, { color: colors.success }]}>Approve</Text>
                </Pressable>
              ) : null}
              {u.status === 'ACTIVE' ? (
                <Pressable onPress={() => act(() => adminApi.suspend(u.id))} style={[styles.actionBtn, { backgroundColor: colors.dangerSoft }]}>
                  <Icon name="Pause" size={14} color={colors.danger} strokeWidth={2.5} />
                  <Text style={[styles.actionText, { color: colors.danger }]}>Suspend</Text>
                </Pressable>
              ) : null}
              {u.status === 'SUSPENDED' ? (
                <Pressable onPress={() => act(() => adminApi.reactivate(u.id))} style={[styles.actionBtn, { backgroundColor: colors.successSoft }]}>
                  <Icon name="RotateCw" size={14} color={colors.success} strokeWidth={2.5} />
                  <Text style={[styles.actionText, { color: colors.success }]}>Reactivate</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState icon="Users" title="No users match" message="Try a different filter." />
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
  filterRow: {
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
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { ...typography.titleMd, color: colors.slate900 },
  email: { ...typography.caption, color: colors.slate500, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  actionText: { ...typography.caption, fontWeight: '700' },
});
