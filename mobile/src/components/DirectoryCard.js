import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import IconSquare from './IconSquare';
import Badge from './Badge';
import { colors, gradients, radius, shadow, spacing, typography } from '../theme';

const ICON_FOR_TYPE = {
  university: { icon: 'Building2', gradient: gradients.primary },
  agent: { icon: 'Waves', gradient: gradients.campus },
  consultant: { icon: 'Briefcase', gradient: gradients.scholarships },
};

export default function DirectoryCard({ item, onPress, type }) {
  const meta = ICON_FOR_TYPE[type] || ICON_FOR_TYPE.university;
  const stats = getStats(type, item);
  const badges = getBadges(type, item);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, shadow.sm, pressed && { opacity: 0.97 }]}
    >
      <View style={styles.row}>
        <IconSquare
          name={meta.icon}
          size={56}
          iconSize={26}
          gradient={meta.gradient}
        />
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            {item.verified ? (
              <Icon
                name="BadgeCheck"
                size={16}
                color={colors.primary600}
                style={{ marginLeft: 4 }}
                strokeWidth={2.5}
              />
            ) : null}
          </View>
          {item.location ? (
            <View style={styles.locationRow}>
              <Icon name="MapPin" size={12} color={colors.slate500} />
              <Text style={styles.location} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          ) : null}
          {badges.length ? (
            <View style={styles.badgeRow}>
              {badges.slice(0, 3).map((b, i) => (
                <Badge key={i} variant={b.variant}>
                  {b.label}
                </Badge>
              ))}
            </View>
          ) : null}
        </View>
      </View>

      {stats.length ? (
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statChip}>
              <Icon name={s.icon} size={12} color={s.color || colors.slate500} />
              <Text style={styles.statText}>
                <Text style={{ fontWeight: '700', color: colors.slate800 }}>
                  {s.value}
                </Text>
                {s.suffix ? ` ${s.suffix}` : ''}
              </Text>
            </View>
          ))}
          <View style={{ flex: 1 }} />
          <Icon name="ArrowRight" size={16} color={colors.primary600} />
        </View>
      ) : null}
    </Pressable>
  );
}

function getBadges(type, item) {
  const list = [];
  if (item.tier && item.tier !== 'free') {
    list.push({ label: `★ ${item.tier.toUpperCase()}`, variant: 'premium' });
  }
  if (type === 'university' && item.courses?.length) {
    item.courses.slice(0, 2).forEach((c) =>
      list.push({ label: c, variant: 'neutral' })
    );
  } else if ((type === 'agent' || type === 'consultant') && item.specialisations?.length) {
    item.specialisations.slice(0, 2).forEach((s) =>
      list.push({ label: s, variant: 'neutral' })
    );
  }
  return list;
}

function getStats(type, item) {
  const rating = {
    icon: 'Star',
    color: colors.warning,
    value: `★ ${Number(item.rating || 0).toFixed(1)}`,
    suffix: `(${item.reviewCount || 0})`,
  };
  if (type === 'university') {
    return [
      rating,
      item.studentCount
        ? {
            icon: 'Users',
            value: `${Math.round(item.studentCount / 1000)}k`,
          }
        : null,
      item.tuitionRange?.min
        ? {
            icon: 'DollarSign',
            value: `$${Math.round(item.tuitionRange.min / 1000)}k/yr`,
          }
        : null,
    ].filter(Boolean);
  }
  if (type === 'agent') {
    return [
      rating,
      item.studentsPlaced
        ? { icon: 'UserCheck', value: `${(item.studentsPlaced).toLocaleString()}`, suffix: 'placed' }
        : null,
    ].filter(Boolean);
  }
  return [
    rating,
    item.hourlyRate
      ? { icon: 'Clock', value: `$${item.hourlyRate}`, suffix: '/30min' }
      : null,
  ].filter(Boolean);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row' },
  body: { flex: 1, marginLeft: spacing.md, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  name: { ...typography.titleMd, color: colors.slate900, flexShrink: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  location: {
    ...typography.caption,
    color: colors.slate500,
    marginLeft: 4,
    flexShrink: 1,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
    gap: spacing.md,
  },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { ...typography.caption, color: colors.slate500 },
});
