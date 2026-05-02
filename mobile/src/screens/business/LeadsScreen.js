import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Screen from '../../components/Screen';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import { leadsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseLead } from '../../api/mappers';
import { colors, radius, shadow, spacing, typography } from '../../theme';

const STATUS_VARIANT = {
  new: 'info',
  contacted: 'warning',
  converted: 'success',
  closed: 'neutral',
};

const STATUS_EDGE = {
  new: colors.info,
  contacted: colors.warning,
  converted: colors.success,
  closed: colors.slate400,
};

const NEXT_STATUS = {
  new: 'CONTACTED',
  contacted: 'CONVERTED',
  converted: 'CLOSED',
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'converted', label: 'Converted' },
];

function relativeTime(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function LeadsScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState('all');
  const { data, loading, refetch } = useApiResource(() => leadsApi.list(), []);

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;

  const leads = useMemo(() => {
    const all = (data?.items || []).map(normaliseLead);
    if (filter === 'all') return all;
    return all.filter((l) => l.status === filter);
  }, [data, filter]);

  const advance = async (lead) => {
    const next = NEXT_STATUS[lead.status];
    if (!next) return;
    try {
      await leadsApi.updateStatus(lead.id, next);
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

  const converted = leads.filter((l) => l.status === 'converted').length;
  const active = leads.filter((l) => l.status !== 'closed').length;

  const ListHeader = (
    <View>
      <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
        <Icon name="ArrowLeft" size={16} color={colors.primary600} />
        <Text style={styles.backText}>Dashboard</Text>
      </Pressable>
      <Text style={styles.title}>Student Leads</Text>
      <Text style={styles.subtitle}>
        {active} active · {converted} converted this month
      </Text>
      <View style={styles.filterRow}>
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
      </View>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={leads}
        keyExtractor={(l) => l.id}
        contentContainerStyle={[{ paddingHorizontal: horizontalPadding, paddingBottom: spacing['4xl'] }]}
        ListHeaderComponent={ListHeader}
        renderItem={({ item: l }) => (
          <View style={[styles.card, { borderLeftColor: STATUS_EDGE[l.status] || colors.slate300 }]}>
            <View style={styles.row}>
              <Avatar uri={l.student?.avatarUrl} name={l.student?.name} size={38} />
              <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {l.student?.name || 'Student'}
                  </Text>
                  <Text style={styles.time}>· {relativeTime(l.createdAt)}</Text>
                </View>
                <Text style={styles.email} numberOfLines={1}>
                  {l.student?.email}
                </Text>
              </View>
              <Badge variant={STATUS_VARIANT[l.status] || 'neutral'}>{l.status}</Badge>
            </View>
            {l.programme ? (
              <View style={styles.progRow}>
                <Icon name="GraduationCap" size={12} color={colors.primary600} />
                <Text style={styles.prog} numberOfLines={1}>
                  {l.programme}
                </Text>
              </View>
            ) : null}
            <View style={styles.quote}>
              <Text style={styles.quoteText} numberOfLines={3}>"{l.message}"</Text>
            </View>
            {NEXT_STATUS[l.status] ? (
              <View style={styles.actions}>
                <Button
                  title={`Mark ${NEXT_STATUS[l.status].toLowerCase()}`}
                  icon="ArrowRight"
                  iconPosition="right"
                  size="sm"
                  onPress={() => advance(l)}
                />
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="Mail"
            title="No leads yet"
            message="Enquiries will show up here the moment they come in."
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
  subtitle: { ...typography.caption, color: colors.slate500, marginTop: 4 },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
    marginBottom: spacing.md,
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
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  name: { ...typography.titleMd, color: colors.slate900, flexShrink: 1 },
  time: { ...typography.caption, color: colors.slate500 },
  email: { ...typography.caption, color: colors.slate500, marginTop: 2 },
  progRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  prog: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary700,
    flex: 1,
  },
  quote: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.bg,
  },
  quoteText: { ...typography.body, color: colors.slate700, fontStyle: 'italic', lineHeight: 20 },
  actions: { flexDirection: 'row', marginTop: spacing.md },
});
