import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../Icon';
import { colors, radius, typography } from '../../theme';

const JOIN_WINDOW_BEFORE_MS = 15 * 60 * 1000;
const JOIN_WINDOW_AFTER_MS = 15 * 60 * 1000;

// Mirrors the server's join-window. Renders nothing if the meeting can't be
// joined right now (wrong status/mode, outside time window). Skips in-person.
export default function JoinMeetingButton({ booking, onJoin }) {
  if (!booking) return null;
  const status = String(booking.status || '').toLowerCase();
  const mode = String(booking.mode || 'video').toLowerCase();
  if (status !== 'confirmed' && status !== 'upcoming') return null;
  if (mode !== 'video' && mode !== 'phone') return null;
  if (!booking.scheduledAt) return null;

  const start = new Date(booking.scheduledAt).getTime();
  const durationMs = (booking.durationMinutes || 30) * 60 * 1000;
  const now = Date.now();
  const opensAt = start - JOIN_WINDOW_BEFORE_MS;
  const closesAt = start + durationMs + JOIN_WINDOW_AFTER_MS;
  if (now > closesAt) return null;

  const ready = now >= opensAt;
  const minutesUntil = Math.max(0, Math.ceil((opensAt - now) / 60000));
  const iconName = mode === 'phone' ? 'Phone' : 'Video';
  const label = ready
    ? mode === 'phone'
      ? 'Start call'
      : 'Join meeting'
    : `Opens in ${minutesUntil} min`;

  if (!ready) {
    return (
      <View style={styles.pending}>
        <Icon name={iconName} size={13} color={colors.slate500} />
        <Text style={styles.pendingText}>{label}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => onJoin?.(booking)}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
    >
      <Icon name={iconName} size={13} color={colors.white} strokeWidth={2.5} />
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.primary600,
  },
  btnText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  pending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pendingText: {
    ...typography.caption,
    color: colors.slate500,
    fontWeight: '600',
  },
});
