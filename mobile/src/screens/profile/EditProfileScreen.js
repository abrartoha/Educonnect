import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
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
import { directoryApi, authApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem } from '../../api/mappers';
import { useAuth } from '../../auth/AuthContext';
import { colors, gradients, radius, shadow, spacing, typography } from '../../theme';

const FETCHER = {
  university: directoryApi.getUniversity,
  agent: directoryApi.getAgent,
  consultant: directoryApi.getConsultant,
};

const UPDATER = {
  university: directoryApi.updateUniversityMe,
  agent: directoryApi.updateAgentMe,
  consultant: directoryApi.updateConsultantMe,
  student: directoryApi.updateStudentMe,
};

export default function EditProfileScreen({ navigation }) {
  const { user, setUser } = useAuth();
  const role = user?.role;
  const { width } = useWindowDimensions();

  const { data, loading } = useApiResource(
    () => (FETCHER[role] && user?.id ? FETCHER[role](user.id) : Promise.resolve(null)),
    [role, user?.id]
  );

  const profile = data?.item ? normaliseDirectoryItem(data.item) : null;

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (role === 'student') {
      setForm({ name: user.name || '', nationality: '', location: '' });
    } else if (profile) {
      setForm({
        name: profile.name || user.name || '',
        location: profile.location || '',
        description: profile.description || '',
        website: profile.website || '',
        phone: profile.phone || '',
        contactPerson: profile.contactPerson || '',
        yearsExperience: profile.yearsExperience ? String(profile.yearsExperience) : '',
        hourlyRate: profile.hourlyRate ? String(profile.hourlyRate) : '',
      });
    }
  }, [profile, user, role]);

  const save = async () => {
    setSaving(true);
    try {
      if (role === 'student') {
        await UPDATER.student({
          name: form.name,
          nationality: form.nationality || undefined,
        });
      } else if (role === 'university') {
        await UPDATER.university({
          name: form.name,
          location: form.location || undefined,
          description: form.description || undefined,
          website: form.website || undefined,
          phone: form.phone || undefined,
        });
      } else if (role === 'agent') {
        await UPDATER.agent({
          name: form.name,
          contactPerson: form.contactPerson || undefined,
          location: form.location || undefined,
          phone: form.phone || undefined,
          website: form.website || undefined,
          description: form.description || undefined,
          yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
        });
      } else if (role === 'consultant') {
        await UPDATER.consultant({
          name: form.name,
          location: form.location || undefined,
          phone: form.phone || undefined,
          website: form.website || undefined,
          description: form.description || undefined,
          yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        });
      }
      const { user: fresh } = await authApi.me();
      if (fresh) setUser({ ...fresh, role: String(fresh.role || '').toLowerCase() });
      Alert.alert('Saved', 'Profile updated.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save', err?.message || 'Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user || !UPDATER[role]) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={{ color: colors.slate500 }}>
            Editing is not available for this role.
          </Text>
        </View>
      </Screen>
    );
  }

  if (role !== 'student' && loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary600} size="large" />
        </View>
      </Screen>
    );
  }

  if (!form) return null;
  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;
  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[{ paddingHorizontal: horizontalPadding, paddingBottom: spacing['4xl'] }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
          <Icon name="ArrowLeft" size={16} color={colors.primary600} />
          <Text style={styles.backText}>Profile</Text>
        </Pressable>

        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Update what students see on your profile.</Text>

        {/* Cover card */}
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cover, shadow.md]}
        >
          <View style={styles.coverIconWrap}>
            <IconSquare
              name={role === 'university' ? 'Building2' : 'User'}
              size={48}
              iconSize={24}
              bg={colors.white}
              color={colors.primary600}
            />
          </View>
        </LinearGradient>

        <View style={[styles.formCard, shadow.sm]}>
          <Input
            label={role === 'university' ? 'Institution name' : 'Full name'}
            value={form.name}
            onChangeText={(v) => setField('name', v)}
            autoCapitalize="words"
            icon="User"
          />
          {role === 'student' ? (
            <Input
              label="Nationality"
              value={form.nationality}
              onChangeText={(v) => setField('nationality', v)}
              placeholder="e.g. India"
              icon="Globe"
            />
          ) : (
            <>
              <Input
                label="Location"
                value={form.location}
                onChangeText={(v) => setField('location', v)}
                placeholder="Melbourne, VIC"
                icon="MapPin"
              />
              <Input
                label="Phone"
                value={form.phone}
                onChangeText={(v) => setField('phone', v)}
                keyboardType="phone-pad"
                icon="Phone"
              />
              <Input
                label="Website"
                value={form.website}
                onChangeText={(v) => setField('website', v)}
                keyboardType="url"
                placeholder="https://..."
                icon="Link"
              />
              <Input
                label="About"
                value={form.description}
                onChangeText={(v) => setField('description', v)}
                multiline
                numberOfLines={4}
                icon="Text"
              />
              {role === 'agent' ? (
                <Input
                  label="Contact person"
                  value={form.contactPerson}
                  onChangeText={(v) => setField('contactPerson', v)}
                  autoCapitalize="words"
                  icon="User"
                />
              ) : null}
              {role !== 'university' ? (
                <Input
                  label="Years of experience"
                  value={form.yearsExperience}
                  onChangeText={(v) => setField('yearsExperience', v)}
                  keyboardType="numeric"
                  icon="Clock"
                />
              ) : null}
              {role === 'consultant' ? (
                <Input
                  label="Hourly rate (AUD)"
                  value={form.hourlyRate}
                  onChangeText={(v) => setField('hourlyRate', v)}
                  keyboardType="numeric"
                  icon="DollarSign"
                />
              ) : null}
            </>
          )}
        </View>

        <Button
          title="Save changes"
          onPress={save}
          loading={saving}
          icon="Check"
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backText: { ...typography.body, color: colors.primary600, fontWeight: '700' },
  title: { ...typography.displayLg, color: colors.slate900 },
  subtitle: { ...typography.body, color: colors.slate500, marginTop: 4, marginBottom: spacing.lg },
  cover: {
    height: 120,
    borderRadius: radius.xl,
    padding: spacing.md,
    justifyContent: 'flex-end',
    marginBottom: spacing.lg,
  },
  coverIconWrap: {
    position: 'absolute',
    left: spacing.md,
    bottom: -spacing.md,
  },
  changeCover: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  changeCoverText: { ...typography.caption, color: colors.primary700, fontWeight: '700' },
  formCard: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    marginTop: spacing.lg,
  },
});
