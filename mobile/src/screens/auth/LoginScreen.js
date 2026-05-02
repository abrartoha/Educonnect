import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import HeroCard from '../../components/HeroCard';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../../auth/AuthContext';

const DEMO = {
  admin: { email: 'admin@educonnect.com.au', password: 'Admin12345' },
  university: { email: 'admissions@unimelb.edu.au', password: 'Password123' },
  agent: { email: 'sarah@pacificedu.com.au', password: 'Password123' },
  consultant: { email: 'emma.thompson@educonsult.com.au', password: 'Password123' },
  student: { email: 'arun.kumar@gmail.com', password: 'Password123' },
};

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;

  const submit = async () => {
    if (!email.trim()) return Alert.alert('Email required');
    if (!password) return Alert.alert('Password required');
    setLoading(true);
    const res = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (!res.success) Alert.alert('Login failed', res.error);
  };

  const fillDemo = (role) => {
    setEmail(DEMO[role].email);
    setPassword(DEMO[role].password);
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: horizontalPadding },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HeroCard padding={spacing.xl} style={{ marginBottom: spacing.xl }}>
          <Text style={styles.heroEyebrow}>EDUCONNECT</Text>
          <Text style={styles.heroTitle}>
            Your journey to{'\n'}study in Australia
          </Text>
        </HeroCard>

        {/* Welcome */}
        <Text style={styles.welcome}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to pick up where you left off.</Text>

        <Input
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          icon="Mail"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          icon="Lock"
        />

        <Button
          title="Sign in"
          onPress={submit}
          loading={loading}
          icon="ArrowRight"
          iconPosition="right"
          size="lg"
          style={{ marginTop: spacing.sm }}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerMuted}>New to EduConnect? </Text>
          <Pressable onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.footerLink}>Create account</Text>
          </Pressable>
        </View>

        {/* Quick demo login — kept as a dev affordance */}
        <View style={styles.demoCard}>
          <Text style={styles.demoTitle}>Demo accounts</Text>
          <View style={styles.demoRow}>
            {Object.keys(DEMO).map((role) => (
              <Pressable
                key={role}
                onPress={() => fillDemo(role)}
                style={styles.demoChip}
              >
                <Text style={styles.demoChipText}>{role}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  heroEyebrow: {
    ...typography.label,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.sm,
  },
  heroTitle: {
    ...typography.displayLg,
    color: colors.white,
    lineHeight: 34,
  },
  welcome: {
    ...typography.displayMd,
    color: colors.slate900,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.slate500,
    marginBottom: spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerMuted: { ...typography.body, color: colors.slate500 },
  footerLink: { ...typography.body, color: colors.primary600, fontWeight: '700' },
  demoCard: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primary50,
  },
  demoTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary700,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  demoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  demoChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.white,
  },
  demoChipText: {
    ...typography.caption,
    color: colors.primary700,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
