import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Screen from '../../components/Screen';
import HeroCard from '../../components/HeroCard';
import Icon from '../../components/Icon';
import IconSquare from '../../components/IconSquare';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { colors, gradients, radius, shadow, spacing, typography } from '../../theme';
import { directoryApi, leadsApi, messagingApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem } from '../../api/mappers';
import { useAuth } from '../../auth/AuthContext';

const FETCHERS = {
  university: directoryApi.getUniversity,
  agent: directoryApi.getAgent,
  consultant: directoryApi.getConsultant,
};

const ICON_FOR_TYPE = {
  university: { icon: 'Building2', gradient: gradients.primary },
  agent: { icon: 'Waves', gradient: gradients.campus },
  consultant: { icon: 'Briefcase', gradient: gradients.scholarships },
};

const TABS = ['About', 'Programs', 'Fees', 'Reviews'];

export default function DirectoryDetailScreen({ route, navigation }) {
  const { id, type = 'university' } = route.params || {};
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('About');

  const { data, loading } = useApiResource(
    () => (id ? FETCHERS[type](id) : null),
    [id, type]
  );

  if (loading && !data) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary600} size="large" />
        </View>
      </Screen>
    );
  }
  if (!data) return null;

  const item = normaliseDirectoryItem(data.item);
  const meta = ICON_FOR_TYPE[type];

  const isSelf = user?.id === item.id;

  const handleSendEnquiry = async () => {
    if (user?.role !== 'student') {
      return Alert.alert('Sign in as student', 'Only students can enquire.');
    }
    try {
      await leadsApi.create({
        universityId: item.id,
        message: `I'm interested in programs at ${item.name}.`,
      });
      Alert.alert('Sent', 'Your enquiry has been sent.');
    } catch (err) {
      Alert.alert('Error', err?.message || 'Could not send.');
    }
  };

  const handleBook = () => {
    if (isSelf) return Alert.alert('Cannot book yourself');
    navigation.navigate('CreateBooking', {
      providerId: item.id,
      providerName: item.name,
    });
  };

  const handleMessage = async () => {
    if (isSelf) return Alert.alert('Cannot message yourself');
    try {
      const res = await messagingApi.startConversation(item.id);
      const conversationId = res?.item?.id;
      if (conversationId) {
        navigation.navigate('Conversation', {
          conversationId,
          otherUserName: item.name,
        });
      }
    } catch (err) {
      Alert.alert('Error', err?.message || 'Could not start conversation.');
    }
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <HeroCard style={{ marginTop: spacing.sm }}>
          <View style={styles.heroTop}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.heroBtn}
              hitSlop={8}
            >
              <Icon name="ArrowLeft" size={16} color={colors.white} />
              <Text style={styles.heroBtnText}>Back</Text>
            </Pressable>
          </View>

          <View style={styles.heroBadges}>
            {item.tier && item.tier !== 'free' ? (
              <Badge variant="premium">★ PREMIUM</Badge>
            ) : null}
            {item.verified ? <Badge variant="success" icon="CheckCircle2">VERIFIED</Badge> : null}
          </View>

          <View style={{ flexDirection: 'row', marginTop: spacing.md, alignItems: 'center' }}>
            <IconSquare
              name={meta.icon}
              size={70}
              iconSize={32}
              bg="rgba(255,255,255,0.18)"
              color={colors.white}
            />
            <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
              <Text style={styles.heroName} numberOfLines={2}>
                {item.name}
              </Text>
              {item.location ? (
                <View style={styles.locRow}>
                  <Icon name="MapPin" size={12} color="rgba(255,255,255,0.88)" />
                  <Text style={styles.locText}>
                    {item.location}
                    {item.foundedYear ? ` · est. ${item.foundedYear}` : ''}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.heroStats}>
            <HeroStat value={Number(item.rating || 0).toFixed(1)} label="Rating" />
            <HeroStat value={`${item.reviewCount || 0}`} label="Reviews" />
            {type === 'university' ? (
              <>
                <HeroStat
                  value={item.studentCount ? `${Math.round(item.studentCount / 1000)}k` : '—'}
                  label="Students"
                />
                {item.ranking ? (
                  <HeroStat value={`#${item.ranking}`} label="Rank" />
                ) : null}
              </>
            ) : null}
            {type === 'agent' ? (
              <>
                <HeroStat value={`${item.studentsPlaced || 0}`} label="Placed" />
                <HeroStat value={`${item.partnerInstitutions || 0}`} label="Partners" />
              </>
            ) : null}
            {type === 'consultant' ? (
              <>
                <HeroStat value={`${item.studentsAssisted || 0}`} label="Helped" />
                {item.hourlyRate ? (
                  <HeroStat value={`$${item.hourlyRate}`} label="/30min" />
                ) : null}
              </>
            ) : null}
          </View>
        </HeroCard>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {TABS.map((t) => (
            <Pressable key={t} onPress={() => setActiveTab(t)} style={styles.tab}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === t && { color: colors.primary700 },
                ]}
              >
                {t}
              </Text>
              {activeTab === t ? <View style={styles.tabIndicator} /> : null}
            </Pressable>
          ))}
        </View>

        {activeTab === 'About' ? (
          <>
            {item.description ? (
              <Text style={styles.body}>{item.description}</Text>
            ) : null}

            {type === 'university' && item.tuitionRange?.min ? (
              <View style={styles.twoCol}>
                <InfoCard
                  tint="yellow"
                  icon="DollarSign"
                  value={`$${Math.round(item.tuitionRange.min / 1000)}k/yr`}
                  label="Tuition (intl)"
                />
                <InfoCard
                  tint="purple"
                  icon="Target"
                  value="28%"
                  label="Acceptance"
                  delta="+2%"
                />
              </View>
            ) : null}

            {item.courses?.length ? (
              <Section title="Popular programs">
                <View style={styles.pillsRow}>
                  {item.courses.slice(0, 6).map((c) => (
                    <View key={c} style={styles.outlinePill}>
                      <Text style={styles.outlinePillText}>{c}</Text>
                    </View>
                  ))}
                </View>
              </Section>
            ) : null}

            {item.services?.length ? (
              <Section title="Services">
                <View style={styles.pillsRow}>
                  {item.services.map((s) => (
                    <Badge key={s} variant="neutral">
                      {s}
                    </Badge>
                  ))}
                </View>
              </Section>
            ) : null}

            {item.languages?.length ? (
              <Section title="Languages">
                <View style={styles.pillsRow}>
                  {item.languages.map((l) => (
                    <Badge key={l} variant="info">
                      {l}
                    </Badge>
                  ))}
                </View>
              </Section>
            ) : null}
          </>
        ) : (
          <View style={styles.tabPlaceholder}>
            <Icon name="Sparkles" size={22} color={colors.primary600} />
            <Text style={{ color: colors.slate500, marginTop: 8 }}>
              {activeTab} coming soon.
            </Text>
          </View>
        )}

        {/* Action stack — universities get Enquire too; bookings + message
            apply to all three provider types. */}
        {type === 'university' ? (
          <Button
            title="Send enquiry"
            onPress={handleSendEnquiry}
            icon="Send"
            variant="soft"
            style={{ marginTop: spacing.xl }}
          />
        ) : null}
        {!isSelf ? (
          <Button
            title="Book a meeting"
            onPress={handleBook}
            icon="Calendar"
            style={{ marginTop: type === 'university' ? spacing.md : spacing.xl }}
          />
        ) : null}
        {!isSelf ? (
          <Button
            title="Message"
            onPress={handleMessage}
            icon="MessageSquare"
            variant="secondary"
            style={{ marginTop: spacing.md }}
          />
        ) : null}

      </ScrollView>
    </Screen>
  );
}

function HeroStat({ value, label }) {
  return (
    <View style={styles.heroStatCell}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ marginTop: spacing.sm }}>{children}</View>
    </View>
  );
}

function InfoCard({ tint, icon, value, label, delta }) {
  const palette = {
    yellow: { bg: '#FEF9C3', fg: '#B45309' },
    purple: { bg: '#EDE9FE', fg: '#6D28D9' },
  }[tint] || { bg: colors.primary100, fg: colors.primary700 };

  return (
    <View style={[styles.infoCard, { backgroundColor: palette.bg }]}>
      <View style={styles.infoHeader}>
        <View style={[styles.infoIcon, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
          <Icon name={icon} size={16} color={palette.fg} />
        </View>
        {delta ? (
          <Text style={[styles.delta, { color: colors.success }]}>{delta}</Text>
        ) : null}
      </View>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  heroBtnText: { ...typography.body, color: colors.white, fontWeight: '700' },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadges: { flexDirection: 'row', gap: 6 },
  heroName: { ...typography.displayMd, color: colors.white },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locText: { ...typography.caption, color: 'rgba(255,255,255,0.88)' },
  heroStats: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.22)',
  },
  heroStatCell: { flex: 1, alignItems: 'center' },
  heroStatValue: { ...typography.titleLg, color: colors.white, fontWeight: '800' },
  heroStatLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    padding: 4,
    marginTop: spacing.lg,
    ...shadow.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: { ...typography.caption, color: colors.slate600, fontWeight: '700' },
  tabIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary600,
  },
  body: {
    ...typography.body,
    color: colors.slate700,
    lineHeight: 22,
    marginTop: spacing.lg,
  },
  twoCol: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  infoCard: {
    flex: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    minHeight: 120,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delta: { ...typography.caption, fontWeight: '700' },
  infoValue: {
    ...typography.displayMd,
    fontSize: 24,
    color: colors.slate900,
    marginTop: spacing.md,
  },
  infoLabel: { ...typography.caption, color: colors.slate600, marginTop: 2 },
  sectionTitle: {
    ...typography.titleMd,
    color: colors.slate900,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  outlinePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  outlinePillText: {
    ...typography.caption,
    color: colors.slate700,
    fontWeight: '600',
  },
  tabPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    ...shadow.sm,
  },
  footer: {
    flexDirection: 'row',
    marginTop: spacing['2xl'],
  },
});
