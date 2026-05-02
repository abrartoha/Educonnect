import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { colors, gradients, radius, shadow, spacing } from '../theme';

// Purple gradient hero used at the top of auth, dashboards, marketplace, etc.
// Adds the decorative soft "light spot" seen in the reference.
export default function HeroCard({
  children,
  gradient = gradients.hero,
  style,
  showGlow = true,
  decorative = true,
  padding = spacing.xl,
}) {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        showGlow && shadow.glow,
        { padding },
        style,
      ]}
    >
      {decorative ? (
        <>
          <View style={styles.blob1} />
          <View style={styles.blob2} />
        </>
      ) : null}
      <View style={{ position: 'relative', zIndex: 1 }}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  blob2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
