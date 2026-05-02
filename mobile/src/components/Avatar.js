import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme';

// Deterministic gradient per name so the app feels alive when logos are missing.
const GRADIENT_PALETTE = [
  gradients.primary,
  gradients.scholarships,
  gradients.visa,
  gradients.courses,
  gradients.campus,
  gradients.career,
  gradients.studentLife,
  gradients.events,
];

function hashIndex(name, mod) {
  if (!name) return 0;
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % mod;
}

export default function Avatar({ uri, name, size = 40, style, gradient }) {
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.slate200,
          },
          style,
        ]}
      />
    );
  }

  const g = gradient || GRADIENT_PALETTE[hashIndex(name, GRADIENT_PALETTE.length)];

  return (
    <LinearGradient
      colors={g}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.white, fontWeight: '700' },
});
