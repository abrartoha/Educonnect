import { StyleSheet, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme';

export default function Card({ children, style, padded = true }) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  padded: {
    padding: spacing.lg,
  },
});
