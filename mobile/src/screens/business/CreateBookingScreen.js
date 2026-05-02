import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { bookingsApi } from '../../api/endpoints';

const DURATIONS = [15, 30, 45, 60, 90];
const MODES = [
  { id: 'video', icon: 'Video', label: 'Video' },
  { id: 'phone', icon: 'Phone', label: 'Phone' },
  { id: 'in-person', icon: 'Users', label: 'In-person' },
];

export default function CreateBookingScreen({ route, navigation }) {
  const { providerId, providerName } = route.params || {};

  const [subject, setSubject] = useState('');
  const [scheduledAt, setScheduledAt] = useState(() => {
    // Default: tomorrow at 10:00
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d;
  });
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [duration, setDuration] = useState(30);
  const [mode, setMode] = useState('video');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!subject.trim()) return Alert.alert('Subject required', 'Add a brief subject.');
    if (scheduledAt.getTime() < Date.now()) {
      return Alert.alert('Pick a future time', 'The selected time is in the past.');
    }
    setSubmitting(true);
    try {
      await bookingsApi.create({
        providerId,
        subject: subject.trim(),
        notes: notes.trim() || undefined,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: duration,
        mode,
      });
      Alert.alert('Booked', 'Your booking request was sent.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not book', err?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const dateLabel = scheduledAt.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeLabel = scheduledAt.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
            <Icon name="ArrowLeft" size={16} color={colors.primary600} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <Text style={styles.title}>Book a meeting</Text>
          {providerName ? (
            <Text style={styles.subtitle}>with {providerName}</Text>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g. Visa application advice"
              placeholderTextColor={colors.slate400}
              maxLength={200}
              style={styles.input}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Date</Text>
              <Pressable onPress={() => setShowDate(true)} style={styles.input}>
                <Text style={styles.inputText}>{dateLabel}</Text>
              </Pressable>
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Time</Text>
              <Pressable onPress={() => setShowTime(true)} style={styles.input}>
                <Text style={styles.inputText}>{timeLabel}</Text>
              </Pressable>
            </View>
          </View>

          {showDate && (
            <DateTimePicker
              value={scheduledAt}
              mode="date"
              minimumDate={new Date()}
              onChange={(event, d) => {
                setShowDate(Platform.OS === 'ios');
                if (d) {
                  const next = new Date(scheduledAt);
                  next.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
                  setScheduledAt(next);
                }
              }}
            />
          )}
          {showTime && (
            <DateTimePicker
              value={scheduledAt}
              mode="time"
              onChange={(event, d) => {
                setShowTime(Platform.OS === 'ios');
                if (d) {
                  const next = new Date(scheduledAt);
                  next.setHours(d.getHours(), d.getMinutes(), 0, 0);
                  setScheduledAt(next);
                }
              }}
            />
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.chipRow}>
              {DURATIONS.map((d) => {
                const active = duration === d;
                return (
                  <Pressable
                    key={d}
                    onPress={() => setDuration(d)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {d} min
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mode</Text>
            <View style={styles.chipRow}>
              {MODES.map((m) => {
                const active = mode === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => setMode(m.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Icon
                      name={m.icon}
                      size={13}
                      color={active ? colors.white : colors.slate600}
                    />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything they should know in advance?"
              placeholderTextColor={colors.slate400}
              multiline
              numberOfLines={4}
              maxLength={2000}
              style={[styles.input, styles.textarea]}
            />
          </View>

          <Button
            title={submitting ? 'Sending…' : 'Send request'}
            onPress={onSubmit}
            disabled={submitting}
            loading={submitting}
            icon="Send"
            style={{ marginTop: spacing.lg }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backText: { ...typography.body, color: colors.primary600, fontWeight: '700' },
  title: { ...typography.displayLg, color: colors.slate900 },
  subtitle: { ...typography.body, color: colors.slate500, marginTop: 2 },
  row: { flexDirection: 'row', gap: spacing.md },
  field: { marginTop: spacing.lg },
  label: {
    ...typography.caption,
    color: colors.slate700,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.slate900,
    fontSize: 14,
    ...shadow.sm,
  },
  inputText: { color: colors.slate900, fontSize: 14 },
  textarea: { minHeight: 96, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary600,
    borderColor: colors.primary600,
  },
  chipText: { ...typography.caption, color: colors.slate700, fontWeight: '700' },
  chipTextActive: { color: colors.white },
});
