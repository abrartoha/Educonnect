import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import Avatar from './Avatar';
import Badge from './Badge';
import { colors, gradients, radius, shadow, spacing, typography } from '../theme';
import { postsApi } from '../api/endpoints';
import { CATEGORY_LABEL, ROLE_LABEL } from '../api/mappers';

const ROLE_VARIANT = {
  university: 'university',
  agent: 'agent',
  consultant: 'consultant',
  student: 'student',
  admin: 'primary',
};

function relativeTime(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString();
}

export default function PostCard({ post, onPress, featured = false }) {
  // Local state owns the upvote/bookmark toggle values after first mount.
  // We intentionally do NOT resync from props on later renders — the parent's
  // refetches would otherwise stomp on an optimistic update and the counter
  // would flash back to the previous value.
  const [hasUpvoted, setHasUpvoted] = useState(!!post.hasUpvoted);
  const [hasBookmarked, setHasBookmarked] = useState(!!post.hasBookmarked);
  const [upvotes, setUpvotes] = useState(post.upvotes ?? 0);

  const handleUpvote = async (e) => {
    e?.preventDefault?.();
    const next = !hasUpvoted;
    setHasUpvoted(next);
    setUpvotes((u) => u + (next ? 1 : -1));
    try {
      await postsApi.toggleUpvote(post.id);
    } catch (err) {
      setHasUpvoted(!next);
      setUpvotes((u) => u + (next ? -1 : 1));
      Alert.alert('Could not update upvote', err?.message || 'Please try again.');
    }
  };

  const handleBookmark = async (e) => {
    e?.preventDefault?.();
    const next = !hasBookmarked;
    setHasBookmarked(next);
    try {
      await postsApi.toggleBookmark(post.id);
    } catch (err) {
      setHasBookmarked(!next);
      Alert.alert('Could not save post', err?.message || 'Please try again.');
    }
  };

  // Featured cards get the full violet gradient treatment seen in the design's
  // pinned / highlighted post.
  if (featured) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.95 }}>
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, styles.featured, shadow.glow]}
        >
          <HeaderRow post={post} onLight />
          <Text style={[styles.title, { color: colors.white }]} numberOfLines={2}>
            {post.title}
          </Text>
          <Text style={[styles.content, { color: 'rgba(255,255,255,0.88)' }]} numberOfLines={3}>
            {post.content}
          </Text>
          <TagsRow tags={post.tags} onLight />
          <View style={[styles.actionsRow, { borderTopColor: 'rgba(255,255,255,0.18)' }]}>
            <ActionPill icon="ArrowUp" count={upvotes} active={hasUpvoted} onPress={handleUpvote} onLight />
            <ActionPill icon="MessageSquare" count={post.commentCount ?? 0} onLight />
            <View style={{ flex: 1 }} />
            <ActionIcon icon={hasBookmarked ? 'BookmarkCheck' : 'Bookmark'} active={hasBookmarked} onPress={handleBookmark} onLight />
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.97 }}>
      <View style={[styles.card, shadow.sm]}>
        <HeaderRow post={post} />
        <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
        <Text style={styles.content} numberOfLines={3}>{post.content}</Text>
        <TagsRow tags={post.tags} />
        <View style={styles.actionsRow}>
          <ActionPill icon="ArrowUp" count={upvotes} active={hasUpvoted} onPress={handleUpvote} />
          <ActionPill icon="MessageSquare" count={post.commentCount ?? 0} />
          <View style={{ flex: 1 }} />
          <ActionIcon icon={hasBookmarked ? 'BookmarkCheck' : 'Bookmark'} active={hasBookmarked} onPress={handleBookmark} />
        </View>
      </View>
    </Pressable>
  );
}

function HeaderRow({ post, onLight }) {
  const labelColor = onLight ? 'rgba(255,255,255,0.85)' : colors.slate500;
  return (
    <View style={styles.headerRow}>
      <Avatar uri={post.authorAvatar} name={post.authorName} size={40} />
      <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
        <Text
          style={[styles.author, onLight && { color: colors.white }]}
          numberOfLines={1}
        >
          {post.authorName}
        </Text>
        <View style={styles.metaRow}>
          <Badge variant={onLight ? 'primary' : ROLE_VARIANT[post.authorType] || 'neutral'}>
            {ROLE_LABEL[post.authorType] || post.authorType}
          </Badge>
          <Text style={[styles.metaText, { color: labelColor }]}>
            · {CATEGORY_LABEL[post.category] || ''} · {relativeTime(post.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function TagsRow({ tags, onLight }) {
  if (!tags?.length) return null;
  return (
    <View style={styles.tagsRow}>
      {tags.slice(0, 3).map((t) => (
        <View
          key={t}
          style={[
            styles.tagPill,
            onLight && { backgroundColor: 'rgba(255,255,255,0.22)' },
          ]}
        >
          <Text
            style={[
              styles.tagText,
              onLight && { color: colors.white },
            ]}
          >
            # {t}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ActionPill({ icon, count, active, onPress, onLight }) {
  const color = onLight ? colors.white : active ? colors.primary600 : colors.slate600;
  const inner = (
    <>
      <Icon name={icon} size={14} color={color} strokeWidth={2.5} />
      {typeof count === 'number' ? (
        <Text style={[styles.actionCount, { color }]}>{count}</Text>
      ) : null}
    </>
  );
  const pillStyle = [
    styles.actionPill,
    onLight && { backgroundColor: 'rgba(255,255,255,0.18)' },
    active && !onLight && { backgroundColor: colors.primary50 },
  ];
  // When no onPress is provided, render a non-interactive display so the UI
  // doesn't pretend the pill is a button.
  if (!onPress) return <View style={pillStyle}>{inner}</View>;
  return (
    <Pressable onPress={onPress} hitSlop={8} style={pillStyle}>
      {inner}
    </Pressable>
  );
}

function ActionIcon({ icon, onPress, active, onLight }) {
  const color = onLight
    ? colors.white
    : active
    ? colors.primary600
    : colors.slate500;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{ padding: 6, marginLeft: 4 }}
    >
      <Icon name={icon} size={18} color={color} strokeWidth={2.2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  featured: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  author: { ...typography.titleMd, color: colors.slate900 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
    flexWrap: 'wrap',
  },
  metaText: { ...typography.caption, color: colors.slate500 },
  title: {
    ...typography.titleLg,
    color: colors.slate900,
    marginBottom: 6,
  },
  content: {
    ...typography.body,
    color: colors.slate600,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primary50,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary700,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
    gap: spacing.xs,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    gap: 6,
  },
  actionCount: { ...typography.caption, fontWeight: '700' },
});
