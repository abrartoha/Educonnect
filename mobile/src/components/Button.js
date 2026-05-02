import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from './Icon';
import { colors, gradients, radius, shadow, spacing, typography } from '../theme';

// Variants — primary is the violet gradient seen across the design.
const VARIANTS = {
  primary: { text: colors.white },
  secondary: { bg: colors.white, text: colors.slate800, border: colors.slate200 },
  ghost: { bg: 'transparent', text: colors.primary600, border: 'transparent' },
  danger: { bg: colors.danger, text: colors.white, border: 'transparent' },
  soft: { bg: colors.primary50, text: colors.primary700, border: 'transparent' },
};

const SIZES = {
  sm: { h: 38, px: spacing.md, font: 13 },
  md: { h: 48, px: spacing.lg, font: 14 },
  lg: { h: 54, px: spacing.xl, font: 15 },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  fullWidth = true,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isPrimary = variant === 'primary';

  const iconEl =
    icon && !loading ? (
      <Icon name={icon} size={18} color={v.text} strokeWidth={2.5} />
    ) : null;

  const inner = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <>
          {iconEl && iconPosition === 'left' ? (
            <View style={{ marginRight: 8 }}>{iconEl}</View>
          ) : null}
          <Text
            style={[
              styles.text,
              { color: v.text, fontSize: s.font },
            ]}
          >
            {title}
          </Text>
          {iconEl && iconPosition === 'right' ? (
            <View style={{ marginLeft: 8 }}>{iconEl}</View>
          ) : null}
        </>
      )}
    </View>
  );

  if (isPrimary) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          {
            borderRadius: radius.lg,
            overflow: 'hidden',
            opacity: disabled || loading ? 0.6 : pressed ? 0.9 : 1,
            width: fullWidth ? '100%' : undefined,
          },
          shadow.glow,
          style,
        ]}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            {
              height: s.h,
              paddingHorizontal: s.px,
              borderWidth: 0,
            },
          ]}
        >
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1 : 0,
          height: s.h,
          paddingHorizontal: s.px,
          opacity: disabled || loading ? 0.6 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { fontWeight: '700' },
});
