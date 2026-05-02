import { useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
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
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import Avatar from '../../components/Avatar';
import JoinMeetingButton from '../../components/meeting/JoinMeetingButton';
import { bookingsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseBooking } from '../../api/mappers';
import { useAuth } from '../../auth/AuthContext';
import { colors, gradients, radius, shadow, spacing, typography } from '../../theme';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Done' },
];

// Different gradient per booking status for the date tile
const STATUS_GRADIENT = {
  pending: gradients.scholarships,
  confirmed: gradients.campus,
  completed: gradients.tileBlue,
  cancelled: ['#CBD5E1', '#94A3B8'],
};

const STATUS_VARIANT = {
  pending: 'warning',
  confirmed: 'success',
  completed: 'info',
  cancelled: 'danger',
};

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function BookingsScreen({ navigation }) {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  // Whether THIS row's caller is on the provider side is now decided per-row,
  // not by role — agents/unis/consultants can be either booker or provider.
  const isStudent = user?.role === 'student';

  const [filter, setFilter] = useState('all');
  const { data, loading, refetch } = useApiResource(() => bookingsApi.list(), []);

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;

  const bookings = useMemo(() => {
    const all = (data?.items || []).map(normaliseBooking);
    if (filter === 'all') return all;
    return all.filter((b) => b.status === filter);
  }, [data, filter]);

  if (loading && !data) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary600} size="large" />
        </View>
      </Screen>
    );
  }

  const updateStatus = async (id, status) => {
    try {
      await bookingsApi.updateStatus(id, status);
      refetch();
    } catch (err) {
      Alert.alert('Could not update', err?.message || 'Try again.');
    }
  };

  const ListHeader = (
    <View>
      <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
        <Icon name="ArrowLeft" size={16} color={colors.primary600} />
        <Text style={styles.backText}>Dashboard</Text>
      </Pressable>
      <Text style={styles.title}>{isStudent ? 'My Bookings' : 'Bookings'}</Text>
      <Text style={styles.subtitle}>
        {bookings.filter((b) => b.status === 'pending').length} pending ·{' '}
        {bookings.filter((b) => b.status === 'confirmed').length} confirmed ·{' '}
        {bookings.length} total
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
        data={bookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={[{ paddingHorizontal: horizontalPadding, paddingBottom: spacing['4xl'] }]}
        ListHeaderComponent={ListHeader}
        renderItem={({ item: b }) => {
          const dt = new Date(b.scheduledAt);
          const iAmProvider = b.provider?.id === user?.id;
          const counterpart = iAmProvider ? b.student : b.provider;
          const gradient = STATUS_GRADIENT[b.status] || gradients.tileBlue;
          const canCancel = b.status === 'pending' || b.status === 'confirmed';

          return (
            <View style={[styles.card, shadow.sm]}>
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dateTile}
              >
                <Badge variant="premium" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
                  {iAmProvider ? 'in' : 'out'}
                </Badge>
                <Text style={styles.dayName}>{DAYS[dt.getDay()]}</Text>
                <Text style={styles.dayNum}>{dt.getDate()}</Text>
                <Text style={styles.monthName}>{MONTHS[dt.getMonth()]}</Text>
                <View style={styles.timeRow}>
                  <Icon name="Clock" size={11} color={colors.white} />
                  <Text style={styles.timeText}>
                    {dt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </LinearGradient>

              <View style={styles.body}>
                <View style={styles.bodyTopRow}>
                  <Badge variant={STATUS_VARIANT[b.status] || 'neutral'}>{b.status}</Badge>
                  <Text style={styles.duration}>· {b.durationMinutes} min</Text>
                </View>
                <Text style={styles.subject} numberOfLines={2}>{b.subject}</Text>
                <View style={styles.counterpartRow}>
                  <Avatar name={counterpart?.name} uri={counterpart?.avatarUrl} size={26} />
                  <Text style={styles.counterpart}>{counterpart?.name || 'User'}</Text>
                </View>
                {b.notes ? (
                  <View style={styles.quote}>
                    <Text style={styles.quoteText} numberOfLines={3}>
                      "{b.notes}"
                    </Text>
                  </View>
                ) : null}

                {/* Provider-side actions on PENDING bookings: Accept / Decline */}
                {iAmProvider && b.status === 'pending' ? (
                  <View style={styles.actions}>
                    <Pressable onPress={() => updateStatus(b.id, 'CONFIRMED')} style={[styles.actionBtn, styles.confirm]}>
                      <Icon name="Check" size={14} color={colors.success} strokeWidth={2.5} />
                      <Text style={[styles.actionText, { color: colors.success }]}>Confirm</Text>
                    </Pressable>
                    <Pressable onPress={() => updateStatus(b.id, 'CANCELLED')} style={[styles.actionBtn, styles.decline]}>
                      <Icon name="X" size={14} color={colors.danger} strokeWidth={2.5} />
                      <Text style={[styles.actionText, { color: colors.danger }]}>Decline</Text>
                    </Pressable>
                  </View>
                ) : null}

                {/* Booker-side: only cancel allowed (server enforces too). */}
                {!iAmProvider && canCancel ? (
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => updateStatus(b.id, 'CANCELLED')}
                      style={[styles.actionBtn, styles.decline]}
                    >
                      <Icon name="X" size={14} color={colors.danger} strokeWidth={2.5} />
                      <Text style={[styles.actionText, { color: colors.danger }]}>Cancel</Text>
                    </Pressable>
                  </View>
                ) : null}

                {/* Join meeting (mounts inside the join window only) */}
                {b.status === 'confirmed' ? (
                  <View style={{ marginTop: spacing.md }}>
                    <JoinMeetingButton
                      booking={b}
                      onJoin={() =>
                        navigation.navigate('Meeting', {
                          bookingId: b.id,
                          mode: b.mode,
                        })
                      }
                    />
                  </View>
                ) : null}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="CalendarX"
            title="No bookings yet"
            message={isProvider ? 'Students will book here when you go live.' : 'Book a session with an agent or consultant.'}
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
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    minHeight: 140,
  },
  dateTile: {
    width: 110,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  dayName: {
    ...typography.micro,
    color: 'rgba(255,255,255,0.88)',
    marginTop: spacing.sm,
  },
  dayNum: {
    ...typography.displayLg,
    color: colors.white,
    fontSize: 32,
    lineHeight: 36,
  },
  monthName: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
  },
  timeText: { ...typography.caption, color: colors.white, fontWeight: '600' },
  body: { flex: 1, padding: spacing.md },
  bodyTopRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  duration: { ...typography.caption, color: colors.slate500 },
  subject: {
    ...typography.titleMd,
    color: colors.slate900,
    marginTop: 4,
  },
  counterpartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  counterpart: { ...typography.caption, color: colors.slate700, fontWeight: '600' },
  quote: {
    marginTop: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary300,
    backgroundColor: colors.bg,
    borderRadius: 8,
  },
  quoteText: { ...typography.caption, color: colors.slate600, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  confirm: { backgroundColor: colors.successSoft, borderColor: colors.successSoft },
  decline: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft },
  actionText: { ...typography.caption, fontWeight: '700' },
});
