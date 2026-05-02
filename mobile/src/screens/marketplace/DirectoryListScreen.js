import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Screen from '../../components/Screen';
import DirectoryCard from '../../components/DirectoryCard';
import EmptyState from '../../components/EmptyState';
import HeroCard from '../../components/HeroCard';
import Icon from '../../components/Icon';
import { directoryApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem } from '../../api/mappers';
import { colors, radius, shadow, spacing, typography } from '../../theme';

const CONFIG = {
  university: {
    fetch: (query) => directoryApi.listUniversities(query),
    eyebrow: 'EXPLORE',
    title: 'Universities',
    subtitle: 'Discover top institutions across Australia',
    detailScreen: 'UniversityDetail',
    placeholder: 'Search by name, city...',
    filters: ['All', 'Sydney', 'Melbourne', 'Brisbane'],
  },
  agent: {
    fetch: (query) => directoryApi.listAgents(query),
    eyebrow: 'VERIFIED',
    title: 'Agents',
    subtitle: 'Education agents across AU — find one who speaks your language',
    detailScreen: 'AgentDetail',
    placeholder: 'Search by name, city...',
    filters: ['All', 'South Asia', 'SE Asia', 'China'],
  },
  consultant: {
    fetch: (query) => directoryApi.listConsultants(query),
    eyebrow: '1:1 ADVICE',
    title: 'Consultants',
    subtitle: 'Experts · applications, visa, career & more',
    detailScreen: 'ConsultantDetail',
    placeholder: 'Search by name, city...',
    filters: ['All', 'Career', 'Visa', 'Applications'],
  },
};

export default function DirectoryListScreen({ route, navigation }) {
  const type = route?.params?.type || 'university';
  const cfg = CONFIG[type];
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;

  const { data, loading, refetch } = useApiResource(
    () => cfg.fetch({ limit: 40 }),
    [type]
  );

  const items = useMemo(() => {
    const all = (data?.items || []).map(normaliseDirectoryItem);
    const withSearch = !search.trim()
      ? all
      : all.filter((i) => {
          const q = search.toLowerCase();
          return (
            i.name?.toLowerCase().includes(q) ||
            i.location?.toLowerCase().includes(q) ||
            i.description?.toLowerCase().includes(q)
          );
        });
    if (filter === 'All') return withSearch;
    return withSearch.filter((i) => i.location?.toLowerCase().includes(filter.toLowerCase()));
  }, [data, search, filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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
      <HeroCard padding={spacing.xl} style={{ marginBottom: spacing.md, marginTop: spacing.sm }}>
        <Text style={styles.heroEyebrow}>{cfg.eyebrow}</Text>
        <Text style={styles.heroTitle}>{cfg.title}</Text>
        <Text style={styles.heroSub}>{cfg.subtitle}</Text>

        <View style={styles.searchInner}>
          <Icon name="Search" size={16} color={colors.slate400} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={cfg.placeholder}
            placeholderTextColor={colors.slate400}
            style={styles.searchInput}
          />
        </View>
      </HeroCard>

      {type === 'university' ? (
        <Pressable
          onPress={() => navigation.navigate('Compare')}
          style={styles.compareStrip}
        >
          <Icon name="GitCompare" size={16} color={colors.primary600} strokeWidth={2.5} />
          <Text style={styles.compareText}>Compare universities side by side</Text>
          <Icon name="ArrowRight" size={14} color={colors.primary600} />
        </Pressable>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {cfg.filters.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.chip,
              filter === f && { backgroundColor: colors.primary600, borderColor: colors.primary600 },
            ]}
          >
            <Text
              style={[styles.chipText, filter === f && { color: colors.white }]}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.countRow}>
        <Text style={styles.count}>{items.length} results</Text>
      </View>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: spacing['4xl'],
        }}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <DirectoryCard
            item={item}
            type={type}
            onPress={() =>
              navigation.navigate(cfg.detailScreen, { id: item.id, type })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="SearchX"
            title={`No ${cfg.title.toLowerCase()} found`}
            message="Try adjusting your search."
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary600} />
        }
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroEyebrow: { ...typography.label, color: 'rgba(255,255,255,0.85)' },
  heroTitle: { ...typography.displayLg, color: colors.white, marginTop: 4 },
  heroSub: {
    ...typography.body,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 6,
    lineHeight: 20,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    marginTop: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: colors.slate900,
    ...typography.body,
    height: '100%',
  },
  compareStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primary50,
    marginBottom: spacing.sm,
  },
  compareText: {
    flex: 1,
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary700,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    ...typography.caption,
    color: colors.slate700,
    fontWeight: '700',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  count: { ...typography.caption, color: colors.slate500, fontWeight: '600' },
  sortLabel: { ...typography.caption, color: colors.primary600, fontWeight: '700' },
});
