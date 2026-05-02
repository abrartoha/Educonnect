import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';
import Icon from './Icon';
import { colors, radius, shadow, spacing, typography } from '../theme';

// Colourful square tile with icon + label used on the Feed category strip.
export default function CategoryTile({
  label,
  icon,
  gradient,
  onPress,
  active = false,
  style,
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, style]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.tile,
          active && { transform: [{ scale: 1.02 }] },
          shadow.sm,
        ]}
      >
        <Icon name={icon} size={22} color={colors.white} />
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 86,
    height: 90,
    borderRadius: radius.lg,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  label: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
});
