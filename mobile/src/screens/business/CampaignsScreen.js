import { useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Screen from '../../components/Screen';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import { campaignsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseCampaign } from '../../api/mappers';
import { colors, gradients, radius, shadow, spacing, typography } from '../../theme';

const CAMPAIGN_GRADIENTS = [
  gradients.hero,
  gradients.scholarships,
  gradients.campus,
  gradients.tileBlue,
  gradients.tileRose,
  gradients.tileAmber,
];

const AUDIENCES = [
  'International Students - South Asia',
  'International Students - Southeast Asia',
  'International Students - Middle East',
  'Domestic Undergraduates',
  'High-Achieving Students',
  'STEM Students',
];

function toDateInput(d) {
  return d.toISOString().slice(0, 10);
}

export default function CampaignsScreen({ navigation }) {
  const { data, loading, refetch } = useApiResource(() => campaignsApi.list(), []);
  const { width } = useWindowDimensions();
  const campaigns = useMemo(
    () => (data?.items || []).map(normaliseCampaign),
    [data]
  );
  const [modal, setModal] = useState(false);

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

  const toggleStatus = async (c) => {
    const next =
      c.status === 'Active'
        ? 'PAUSED'
        : c.status === 'Paused'
        ? 'ACTIVE'
        : 'ACTIVE';
    try {
      await campaignsApi.update(c.id, { status: next });
      refetch();
    } catch (err) {
      Alert.alert('Could not update', err?.message || 'Try again.');
    }
  };

  const del = (c) => {
    Alert.alert('Delete campaign?', `"${c.name}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await campaignsApi.remove(c.id);
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
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
            <Icon name="ArrowLeft" size={16} color={colors.primary600} />
            <Text style={styles.backText}>Dashboard</Text>
          </Pressable>
          <Text style={styles.title}>Campaigns</Text>
          <Text style={styles.subtitle}>
            {campaigns.filter((c) => c.status === 'Active').length} active ·{' '}
            {campaigns.length} total
          </Text>
        </View>
        <Button
          title="New"
          icon="Plus"
          size="sm"
          onPress={() => setModal(true)}
          fullWidth={false}
          style={{ minWidth: 96 }}
        />
      </View>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={campaigns}
        keyExtractor={(c) => c.id}
        contentContainerStyle={[{ paddingHorizontal: horizontalPadding, paddingBottom: spacing['4xl'] }]}
        ListHeaderComponent={ListHeader}
        renderItem={({ item: c, index }) => {
          const ctr =
            c.impressions > 0
              ? ((c.clicks / c.impressions) * 100).toFixed(1)
              : '0.0';
          const gradient = CAMPAIGN_GRADIENTS[index % CAMPAIGN_GRADIENTS.length];
          const budgetPct = Math.min(60 + ((index * 13) % 30), 92);

          return (
            <View style={[styles.card, shadow.md]}>
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
              >
                <View style={styles.heroTopRow}>
                  <View style={styles.megaphone}>
                    <Icon name="Megaphone" size={16} color={colors.white} />
                    <Text style={styles.campaignName} numberOfLines={1}>
                      {c.name}
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Icon
                      name={c.status === 'Active' ? 'PlayCircle' : c.status === 'Paused' ? 'PauseCircle' : 'Circle'}
                      size={12}
                      color={colors.white}
                    />
                    <Text style={styles.statusText}>{c.status}</Text>
                  </View>
                </View>
                <Text style={styles.audience}>
                  {c.audience} · {new Date(c.startDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – {new Date(c.endDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </Text>
              </LinearGradient>

              <View style={styles.statsRow}>
                <Stat value={c.impressions.toLocaleString()} label="Impressions" />
                <Stat value={c.clicks.toLocaleString()} label="Clicks" />
                <Stat value={`${ctr}%`} label="CTR" emphasis />
              </View>

              <View style={styles.budgetRow}>
                <View style={styles.budgetLabelRow}>
                  <Text style={styles.budgetLabel}>Budget spent</Text>
                  <Text style={styles.budgetValue}>$1,820 / $3,000</Text>
                </View>
                <View style={styles.budgetTrack}>
                  <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.budgetFill, { width: `${budgetPct}%` }]}
                  />
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable onPress={() => toggleStatus(c)} style={[styles.actionBtn, { backgroundColor: colors.slate100 }]}>
                  <Icon name={c.status === 'Active' ? 'Pause' : 'Play'} size={14} color={colors.slate700} strokeWidth={2.5} />
                  <Text style={[styles.actionText, { color: colors.slate700 }]}>
                    {c.status === 'Active' ? 'Pause' : 'Resume'}
                  </Text>
                </Pressable>
                <Pressable onPress={() => del(c)} style={[styles.actionBtn, { backgroundColor: colors.dangerSoft }]}>
                  <Icon name="Trash2" size={14} color={colors.danger} strokeWidth={2.5} />
                  <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="Megaphone"
            title="No campaigns yet"
            message="Launch one to reach prospective students."
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <CreateCampaignModal
        visible={modal}
        onClose={() => setModal(false)}
        onCreated={() => {
          setModal(false);
          refetch();
        }}
      />
    </Screen>
  );
}

function Stat({ value, label, emphasis }) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statValue, emphasis && { color: colors.success }]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CreateCampaignModal({ visible, onClose, onCreated }) {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 2);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(toDateInput(today));
  const [endDate, setEndDate] = useState(toDateInput(nextMonth));
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [status, setStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (name.trim().length < 3)
      return Alert.alert('Name too short', 'At least 3 characters.');
    const isoShape = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoShape.test(startDate) || !isoShape.test(endDate))
      return Alert.alert('Invalid date', 'Use YYYY-MM-DD for both dates.');
    if (new Date(endDate) < new Date(startDate))
      return Alert.alert('Invalid range', 'End date must be after start date.');
    setLoading(true);
    try {
      await campaignsApi.create({
        name: name.trim(),
        audience,
        startDate,
        endDate,
        status,
      });
      setName('');
      onCreated?.();
    } catch (err) {
      Alert.alert('Could not create', err?.message || 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sheetTitle}>New campaign</Text>
            <Input label="Campaign name" value={name} onChangeText={setName} icon="Megaphone" />
            <Input label="Start date (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} icon="Calendar" />
            <Input label="End date (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} icon="Calendar" />

            <Text style={styles.label}>Target audience</Text>
            <View style={styles.chips}>
              {AUDIENCES.map((a) => (
                <Pressable
                  key={a}
                  onPress={() => setAudience(a)}
                  style={[styles.chip, audience === a && styles.chipActive]}
                >
                  <Text style={[styles.chipText, audience === a && { color: colors.primary700 }]}>{a}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Launch status</Text>
            <View style={styles.chips}>
              {['ACTIVE', 'DRAFT'].map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setStatus(s)}
                  style={[styles.chip, status === s && styles.chipActive]}
                >
                  <Text style={[styles.chipText, status === s && { color: colors.primary700 }]}>
                    {s === 'ACTIVE' ? 'Launch now' : 'Save as draft'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.lg }}>
              <Button title="Cancel" variant="secondary" onPress={onClose} fullWidth={false} style={{ flex: 1 }} />
              <Button title="Create" onPress={submit} loading={loading} fullWidth={false} style={{ flex: 1 }} icon="Check" />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    marginBottom: 6,
  },
  backText: { ...typography.body, color: colors.primary600, fontWeight: '700' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: spacing.md },
  title: { ...typography.displayLg, color: colors.slate900 },
  subtitle: { ...typography.caption, color: colors.slate500, marginTop: 4 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  hero: { padding: spacing.lg },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  megaphone: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  campaignName: {
    ...typography.titleMd,
    color: colors.white,
    flexShrink: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  statusText: {
    ...typography.micro,
    color: colors.white,
    fontWeight: '700',
  },
  audience: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.titleLg, color: colors.slate900, fontWeight: '800' },
  statLabel: { ...typography.caption, color: colors.slate500, marginTop: 2 },
  budgetRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  budgetLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetLabel: { ...typography.caption, color: colors.slate500, fontWeight: '700' },
  budgetValue: { ...typography.caption, color: colors.slate700, fontWeight: '700' },
  budgetTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.slate100,
    marginTop: 6,
    overflow: 'hidden',
  },
  budgetFill: { height: 6, borderRadius: 3 },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: 8,
  },
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
  delBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    maxHeight: '90%',
    ...shadow.lg,
  },
  sheetTitle: {
    ...typography.titleLg,
    color: colors.slate900,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.slate700,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: { borderColor: colors.primary500, backgroundColor: colors.primary50 },
  chipText: { ...typography.caption, color: colors.slate700, fontWeight: '600' },
});
