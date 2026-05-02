import { StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import { colors, radius, spacing, typography } from '../theme';

// Dashboard stat tile: soft coloured background, icon top-left, delta top-right,
// big number, small label.
export default function StatTile({ label, value, icon, delta, deltaTone = 'success', tint = 'purple' }) {
  const tintStyles = TINTS[tint] || TINTS.purple;
  const deltaColor = deltaTone === 'success' ? colors.success : deltaTone === 'warning' ? colors.warning : colors.danger;

  return (
    <View style={[styles.tile, { backgroundColor: tintStyles.bg }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
          <Icon name={icon} size={18} color={tintStyles.fg} />
        </View>
        {delta ? (
          <Text style={[styles.delta, { color: deltaColor }]}>{delta}</Text>
        ) : null}
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const TINTS = {
  purple: { bg: '#EDE9FE', fg: '#7C3AED' },
  yellow: { bg: '#FEF9C3', fg: '#B45309' },
  orange: { bg: '#FFEDD5', fg: '#C2410C' },
  green: { bg: '#D1FAE5', fg: '#047857' },
  blue: { bg: '#DBEAFE', fg: '#1D4ED8' },
  rose: { bg: '#FFE4E6', fg: '#BE185D' },
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    minWidth: 140,
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delta: { ...typography.caption, fontWeight: '700' },
  value: {
    ...typography.displayLg,
    fontSize: 24,
    color: colors.slate900,
    marginTop: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.slate600,
    marginTop: 2,
  },
});
