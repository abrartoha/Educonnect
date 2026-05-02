import { StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import { colors, radius } from '../theme';

const VARIANTS = {
  neutral: { bg: colors.slate100, fg: colors.slate700 },
  primary: { bg: colors.primary50, fg: colors.primary700 },
  success: { bg: colors.successSoft, fg: '#065F46' },
  warning: { bg: colors.warningSoft, fg: '#92400E' },
  danger: { bg: colors.dangerSoft, fg: '#991B1B' },
  info: { bg: colors.infoSoft, fg: '#1E40AF' },
  // Role flavours lifted straight from the design
  university: { bg: '#EDE9FE', fg: '#6D28D9' },
  agent: { bg: '#ECFDF5', fg: '#047857' },
  consultant: { bg: '#FFEDD5', fg: '#C2410C' },
  student: { bg: '#F3E8FF', fg: '#7E22CE' },
  premium: { bg: '#FEF3C7', fg: '#B45309' },
};

export default function Badge({ children, variant = 'neutral', icon, style }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  return (
    <View style={[styles.base, { backgroundColor: v.bg }, style]}>
      {icon ? <Icon name={icon} size={11} color={v.fg} strokeWidth={2.5} /> : null}
      <Text style={[styles.text, { color: v.fg }]} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '700' },
});
