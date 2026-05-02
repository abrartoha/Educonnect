import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
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
import Icon from '../../components/Icon';
import IconSquare from '../../components/IconSquare';
import { colors, gradients, radius, shadow, spacing, typography } from '../../theme';
import { useAuth } from '../../auth/AuthContext';

const ROLES = [
  {
    key: 'STUDENT',
    label: 'Student',
    blurb: 'Explore programs & book consults',
    icon: 'GraduationCap',
  },
  {
    key: 'UNIVERSITY',
    label: 'University',
    blurb: 'Manage your listing',
    icon: 'Building2',
  },
  {
    key: 'AGENT',
    label: 'Agent',
    blurb: 'Represent universities',
    icon: 'Waves',
  },
  {
    key: 'CONSULTANT',
    label: 'Consultant',
    blurb: 'Offer advisory services',
    icon: 'Briefcase',
  },
];

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const { width } = useWindowDimensions();
  const [role, setRole] = useState('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [nationality, setNationality] = useState('');
  const [loading, setLoading] = useState(false);

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;

  const submit = async () => {
    if (!name.trim()) return Alert.alert('Name required');
    if (!email.trim()) return Alert.alert('Email required');
    if (password.length < 8)
      return Alert.alert('Password too short', '≥ 8 chars with upper, lower, digit.');
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return Alert.alert('Weak password', 'Include an uppercase, lowercase, and digit.');
    }

    setLoading(true);
    const payload = {
      role,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    };
    if (role === 'STUDENT' && nationality) payload.nationality = nationality.trim();
    if (role !== 'STUDENT' && location) payload.location = location.trim();

    const res = await signup(payload);
    setLoading(false);
    if (!res.success) Alert.alert('Signup failed', res.error);
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
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.back}
          hitSlop={8}
        >
          <Icon name="ArrowLeft" size={16} color={colors.primary600} />
          <Text style={styles.backText}>Back to sign in</Text>
        </Pressable>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Pick the role that matches you best — we'll tailor your experience.
        </Text>

        {/* Role grid */}
        <View style={styles.roleGrid}>
          {ROLES.map((r) => (
            <RoleCard
              key={r.key}
              role={r}
              active={role === r.key}
              onPress={() => setRole(r.key)}
            />
          ))}
        </View>

        {/* Form card */}
        <View style={[styles.formCard, shadow.sm]}>
          <Input
            label="Full name"
            value={name}
            onChangeText={setName}
            placeholder={role === 'UNIVERSITY' ? 'e.g. Acme University' : 'e.g. Arun Kumar'}
            autoCapitalize="words"
            icon="User"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            keyboardType="email-address"
            icon="Mail"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            icon="Lock"
          />
          {role === 'STUDENT' ? (
            <Input
              label="Nationality"
              value={nationality}
              onChangeText={setNationality}
              placeholder="e.g. India"
              icon="Globe"
            />
          ) : (
            <Input
              label="Location"
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Melbourne, VIC"
              icon="MapPin"
            />
          )}
        </View>

        <Button
          title="Create account"
          onPress={submit}
          loading={loading}
          icon="ArrowRight"
          iconPosition="right"
          size="lg"
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </Screen>
  );
}

function RoleCard({ role, active, onPress }) {
  if (active) {
    return (
      <Pressable onPress={onPress} style={styles.roleTile}>
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.roleInner, shadow.glow]}
        >
          <View style={styles.roleIconActive}>
            <Icon name={role.icon} size={22} color={colors.white} />
          </View>
          <View style={styles.check}>
            <Icon name="Check" size={14} color={colors.primary700} strokeWidth={3} />
          </View>
          <Text style={[styles.roleLabel, { color: colors.white }]}>{role.label}</Text>
          <Text style={[styles.roleBlurb, { color: 'rgba(255,255,255,0.88)' }]}>
            {role.blurb}
          </Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={[styles.roleTile]}>
      <View style={[styles.roleInner, { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }]}>
        <IconSquare name={role.icon} size={40} iconSize={20} bg={colors.primary50} color={colors.primary600} />
        <Text style={styles.roleLabel}>{role.label}</Text>
        <Text style={styles.roleBlurb}>{role.blurb}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.md, paddingBottom: spacing['4xl'] },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.md,
  },
  backText: { ...typography.body, color: colors.primary600, fontWeight: '700' },
  title: { ...typography.displayLg, color: colors.slate900 },
  subtitle: {
    ...typography.body,
    color: colors.slate500,
    marginTop: 4,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  roleTile: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  roleInner: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    minHeight: 140,
  },
  roleIconActive: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleLabel: {
    ...typography.titleMd,
    color: colors.slate900,
    marginTop: spacing.md,
  },
  roleBlurb: {
    ...typography.caption,
    color: colors.slate500,
    marginTop: 2,
  },
  formCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
  },
});
