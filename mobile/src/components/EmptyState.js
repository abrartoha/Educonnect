import { StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import { colors, radius, spacing, typography } from '../theme';

export default function EmptyState({ title, message, icon = 'Sparkles' }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconHolder}>
        <Icon name={icon} size={24} color={colors.primary600} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
  },
  iconHolder: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.titleMd, color: colors.slate800, marginBottom: 4 },
  message: {
    ...typography.body,
    color: colors.slate500,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 20,
  },
});
