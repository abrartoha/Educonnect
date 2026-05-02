import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
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
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import IconSquare from '../../components/IconSquare';
import { directoryApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem } from '../../api/mappers';
import { colors, gradients, radius, shadow, spacing, typography } from '../../theme';

const MAX_SLOTS = 3;

const fmt = (v, fallback = '—') =>
  v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
    ? fallback
    : v;

const ROWS = [
  { label: 'Location', get: (u) => fmt(u.location) },
  { label: 'Type', get: (u) => fmt(u.type) },
  { label: 'Founded', get: (u) => fmt(u.foundedYear) },
  { label: 'Ranking', get: (u) => (u.ranking ? `#${u.ranking}` : '—') },
  {
    label: 'Students',
    get: (u) => (u.studentCount ? `${Math.round(u.studentCount / 1000)}k` : '—'),
  },
  {
    label: 'International',
    get: (u) => (u.internationalPct ? `${u.internationalPct}%` : '—'),
  },
  {
    label: 'Tuition / yr',
    get: (u) =>
      u.tuitionRange?.min
        ? `$${u.tuitionRange.min.toLocaleString()} – $${u.tuitionRange.max.toLocaleString()}`
        : '—',
  },
  {
    label: 'Rating',
    get: (u) =>
      u.rating ? `★ ${Number(u.rating).toFixed(1)} (${u.reviewCount})` : '—',
  },
  { label: 'Intakes', get: (u) => fmt(u.intakes?.slice(0, 3).join(', ')) },
  { label: 'Programs', get: (u) => fmt(u.courses?.slice(0, 3).join(', ')) },
];

export default function CompareScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [slots, setSlots] = useState(['', '', '']);
  const [pickerIndex, setPickerIndex] = useState(null);

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;
  const cardWidth = Math.max(Math.round((width - horizontalPadding * 2) * 0.82), 240);

  const { data: listData } = useApiResource(
    () => directoryApi.listUniversities({ limit: 60 }),
    []
  );
  const allUnis = useMemo(
    () => (listData?.items || []).map(normaliseDirectoryItem),
    [listData]
  );

  const selectedIds = slots.filter(Boolean);
  const { data: compareData, loading: compareLoading } = useApiResource(
    () =>
      selectedIds.length >= 2
        ? directoryApi.compareUniversities(selectedIds)
        : Promise.resolve({ items: [] }),
    [selectedIds.join(',')]
  );
  const selectedUnis = useMemo(() => {
    const items = (compareData?.items || []).map(normaliseDirectoryItem);
    const byId = new Map(items.map((u) => [u.id, u]));
    return slots.map((id) => (id ? byId.get(id) || null : null));
  }, [compareData, slots]);

  const setSlot = (index, id) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = id;
      return next;
    });
    setPickerIndex(null);
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[{ paddingBottom: spacing['4xl'] }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: horizontalPadding }}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
            <Icon name="ArrowLeft" size={16} color={colors.primary600} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Compare Universities</Text>
          <Text style={styles.subtitle}>
            Pick up to {MAX_SLOTS} universities to see them side by side.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            gap: spacing.md,
            marginTop: spacing.lg,
          }}
        >
          {slots.map((id, i) => {
            const uni = selectedUnis[i];
            if (!uni) {
              return (
                <Pressable
                  key={i}
                  onPress={() => setPickerIndex(i)}
                  style={[styles.slotCard, styles.slotEmpty, { width: cardWidth }]}
                >
                  <IconSquare name="Plus" size={48} iconSize={20} bg={colors.primary100} color={colors.primary600} />
                  <Text style={styles.slotEmptyLabel}>Add university</Text>
                  <Text style={styles.slotEmptyIndex}>Slot {i + 1}</Text>
                </Pressable>
              );
            }
            return (
              <View key={uni.id} style={[styles.slotCard, { width: cardWidth }, shadow.sm]}>
                <Pressable
                  onPress={() => setSlot(i, '')}
                  style={styles.slotRemove}
                  hitSlop={10}
                >
                  <Icon name="X" size={14} color={colors.slate600} strokeWidth={2.5} />
                </Pressable>
                <Avatar uri={uni.logo || uni.avatar} name={uni.name} size={64} />
                <Text style={styles.slotName} numberOfLines={2}>{uni.name}</Text>
                <Text style={styles.slotLocation} numberOfLines={1}>
                  {uni.shortName || uni.location}
                </Text>
                {uni.verified ? <Badge variant="success" icon="CheckCircle2">Verified</Badge> : null}
              </View>
            );
          })}
        </ScrollView>

        {selectedIds.length >= 2 ? (
          <View style={[{ paddingHorizontal: horizontalPadding, marginTop: spacing.lg }]}>
            {compareLoading ? (
              <ActivityIndicator color={colors.primary600} />
            ) : (
              <View style={[styles.table, shadow.sm]}>
                {ROWS.map((row) => (
                  <View key={row.label} style={styles.row}>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.valuesRow}
                    >
                      {selectedUnis.map((uni, i) => (
                        <View key={i} style={styles.valueCell}>
                          <Text style={styles.valueHeader} numberOfLines={1}>
                            {uni?.shortName || uni?.name || '—'}
                          </Text>
                          <Text style={styles.valueText} numberOfLines={3}>
                            {uni ? row.get(uni) : '—'}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={{ marginTop: spacing.xl }}>
            <EmptyState
              icon="GitCompare"
              title="Pick at least two"
              message="Tap the empty slots to add universities."
            />
          </View>
        )}

        {selectedUnis.filter(Boolean).length ? (
          <View style={{ paddingHorizontal: horizontalPadding, marginTop: spacing.lg, gap: spacing.sm }}>
            {selectedUnis.filter(Boolean).map((uni, i) => (
              <Button
                key={uni.id}
                title={`View ${uni.shortName || uni.name}`}
                icon="ArrowRight"
                iconPosition="right"
                variant={i === 0 ? 'primary' : 'secondary'}
                onPress={() =>
                  navigation.navigate('UniversityDetail', { id: uni.id, type: 'university' })
                }
              />
            ))}
          </View>
        ) : null}
      </ScrollView>

      <PickerModal
        visible={pickerIndex !== null}
        universities={allUnis}
        excludeIds={slots.filter(Boolean)}
        onClose={() => setPickerIndex(null)}
        onSelect={(uni) => setSlot(pickerIndex, uni.id)}
      />
    </Screen>
  );
}

function PickerModal({ visible, universities, excludeIds, onClose, onSelect }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const available = universities.filter((u) => !excludeIds.includes(u.id));
    if (!q.trim()) return available;
    const needle = q.toLowerCase();
    return available.filter(
      (u) =>
        u.name.toLowerCase().includes(needle) ||
        u.location?.toLowerCase().includes(needle)
    );
  }, [universities, excludeIds, q]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalSheet, shadow.lg]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pick a university</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Icon name="X" size={22} color={colors.slate600} />
            </Pressable>
          </View>
          <View style={styles.modalSearchWrap}>
            <Icon name="Search" size={16} color={colors.slate400} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search by name or location..."
              placeholderTextColor={colors.slate400}
              style={styles.modalSearch}
            />
          </View>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {filtered.length === 0 ? (
              <Text style={styles.empty}>No matching universities.</Text>
            ) : (
              filtered.map((u) => (
                <Pressable key={u.id} onPress={() => onSelect(u)} style={styles.pickerRow}>
                  <Avatar uri={u.logo || u.avatar} name={u.name} size={40} />
                  <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
                    <Text style={styles.pickerName} numberOfLines={1}>{u.name}</Text>
                    <Text style={styles.pickerSub} numberOfLines={1}>{u.location}</Text>
                  </View>
                  {u.verified ? <Icon name="BadgeCheck" size={18} color={colors.primary600} /> : null}
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backText: { ...typography.body, color: colors.primary600, fontWeight: '700' },
  title: { ...typography.displayLg, color: colors.slate900 },
  subtitle: { ...typography.body, color: colors.slate500, marginTop: 4 },
  slotCard: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  slotEmpty: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary200,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  slotEmptyLabel: { ...typography.titleMd, color: colors.slate700, marginTop: 10 },
  slotEmptyIndex: { ...typography.caption, color: colors.slate400, marginTop: 2 },
  slotRemove: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotName: { ...typography.titleMd, color: colors.slate900, marginTop: spacing.sm, textAlign: 'center' },
  slotLocation: { ...typography.caption, color: colors.slate500, marginTop: 2, marginBottom: 8 },
  table: {
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
    paddingVertical: spacing.md,
  },
  rowLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.slate700,
    paddingHorizontal: spacing.md,
    width: 110,
    alignSelf: 'center',
  },
  valuesRow: { gap: spacing.md, paddingRight: spacing.md },
  valueCell: { width: 140, paddingVertical: 2 },
  valueHeader: { ...typography.caption, color: colors.primary700, fontWeight: '700', marginBottom: 2 },
  valueText: { ...typography.body, color: colors.slate800 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    paddingBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { ...typography.titleMd, color: colors.slate900 },
  modalSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    height: 44,
  },
  modalSearch: { flex: 1, ...typography.body, color: colors.slate900, height: '100%' },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
  },
  pickerName: { ...typography.body, color: colors.slate900, fontWeight: '600' },
  pickerSub: { ...typography.caption, color: colors.slate500, marginTop: 2 },
  empty: { ...typography.body, color: colors.slate500, textAlign: 'center', padding: spacing.xl },
});
