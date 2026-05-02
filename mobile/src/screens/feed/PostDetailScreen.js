import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Screen from '../../components/Screen';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import { postsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normalisePost, CATEGORY_LABEL, ROLE_LABEL } from '../../api/mappers';
import { useAuth } from '../../auth/AuthContext';
import { colors, gradients, radius, shadow, spacing, typography } from '../../theme';

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params || {};
  const { isAuthenticated, user } = useAuth();
  const { width } = useWindowDimensions();

  const { data, loading, setData } = useApiResource(
    () => (postId ? postsApi.get(postId) : null),
    [postId]
  );
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;

  // Show the spinner only on the FIRST load. After that, optimistic updates
  // keep the screen alive and we never refetch on toggles.
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

  const post = normalisePost(data.item);
  const comments = (data.item.comments || []).map((c) => ({
    id: c.id,
    authorName: c.author?.name,
    authorAvatar: c.author?.avatarUrl,
    text: c.text,
    createdAt: c.createdAt,
  }));

  // Optimistic upvote — flip locally first, hit the API in the background.
  const toggleUpvote = async () => {
    const prevHas = !!data.item.hasUpvoted;
    setData((d) => ({
      ...d,
      item: {
        ...d.item,
        hasUpvoted: !prevHas,
        upvoteCount: (d.item.upvoteCount ?? 0) + (prevHas ? -1 : 1),
      },
    }));
    try {
      await postsApi.toggleUpvote(post.id);
    } catch (err) {
      // Revert
      setData((d) => ({
        ...d,
        item: {
          ...d.item,
          hasUpvoted: prevHas,
          upvoteCount: (d.item.upvoteCount ?? 0) + (prevHas ? 1 : -1),
        },
      }));
      Alert.alert('Could not update upvote', err?.message || 'Please try again.');
    }
  };

  const toggleBookmark = async () => {
    const prevHas = !!data.item.hasBookmarked;
    setData((d) => ({
      ...d,
      item: { ...d.item, hasBookmarked: !prevHas },
    }));
    try {
      await postsApi.toggleBookmark(post.id);
    } catch (err) {
      setData((d) => ({
        ...d,
        item: { ...d.item, hasBookmarked: prevHas },
      }));
      Alert.alert('Could not save post', err?.message || 'Please try again.');
    }
  };

  const submitComment = async () => {
    if (!comment.trim() || !isAuthenticated) return;
    const text = comment.trim();
    setComment('');
    setPosting(true);
    // Insert a temp comment immediately so the list updates without a flash.
    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      text,
      createdAt: new Date().toISOString(),
      author: {
        id: user?.id,
        name: user?.name,
        avatarUrl: user?.avatarUrl,
      },
    };
    setData((d) => ({
      ...d,
      item: {
        ...d.item,
        comments: [...(d.item.comments || []), optimistic],
        commentCount: (d.item.commentCount ?? 0) + 1,
      },
    }));
    try {
      const res = await postsApi.addComment(post.id, text);
      const real = res?.item;
      if (real) {
        // Swap the temp entry for the server-returned one.
        setData((d) => ({
          ...d,
          item: {
            ...d.item,
            comments: (d.item.comments || []).map((c) =>
              c.id === tempId ? real : c
            ),
          },
        }));
      }
    } catch (err) {
      setData((d) => ({
        ...d,
        item: {
          ...d.item,
          comments: (d.item.comments || []).filter((c) => c.id !== tempId),
          commentCount: Math.max(0, (d.item.commentCount ?? 1) - 1),
        },
      }));
      setComment(text);
      Alert.alert('Could not post comment', err?.message || 'Please try again.');
    }
    setPosting(false);
  };

  const Header = (
    <View>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
          <Icon name="ArrowLeft" size={16} color={colors.primary600} />
          <Text style={styles.backText}>Feed</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.iconBtn} onPress={toggleBookmark} hitSlop={6}>
          <Icon
            name={post.hasBookmarked ? 'BookmarkCheck' : 'Bookmark'}
            size={18}
            color={post.hasBookmarked ? colors.primary600 : colors.slate600}
          />
        </Pressable>
      </View>

      {/* Author card (gradient for university posts, plain for others) */}
      {post.authorType === 'university' ? (
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.authorCard, shadow.glow]}
        >
          <Avatar uri={post.authorAvatar} name={post.authorName} size={52} />
          <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
            <Text style={[styles.authorName, { color: colors.white }]} numberOfLines={1}>
              {post.authorName}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              <Badge variant="primary">{ROLE_LABEL[post.authorType]}</Badge>
              <Text style={styles.authorMeta}>2h ago</Text>
            </View>
          </View>
        </LinearGradient>
      ) : (
        <View style={[styles.authorCardLight, shadow.sm]}>
          <Avatar uri={post.authorAvatar} name={post.authorName} size={44} />
          <View style={{ flex: 1, marginLeft: spacing.md, minWidth: 0 }}>
            <Text style={styles.authorName} numberOfLines={1}>{post.authorName}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
              <Badge
                variant={
                  post.authorType === 'agent'
                    ? 'agent'
                    : post.authorType === 'consultant'
                    ? 'consultant'
                    : 'student'
                }
              >
                {ROLE_LABEL[post.authorType]}
              </Badge>
            </View>
          </View>
        </View>
      )}

      {/* Badges row */}
      <View style={styles.badgesRow}>
        {post.isPinned ? <Badge variant="warning" icon="Pin">Pinned</Badge> : null}
        <Badge variant="primary" icon="BookOpen">
          {CATEGORY_LABEL[post.category] || post.category}
        </Badge>
      </View>

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.body}>{post.content}</Text>

      {post.tags?.length ? (
        <View style={styles.tagsRow}>
          {post.tags.map((t) => (
            <View key={t} style={styles.tagPill}>
              <Text style={styles.tagText}># {t}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Action row */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={toggleUpvote}
          style={[styles.actionCell, post.hasUpvoted && { backgroundColor: colors.primary50 }]}
        >
          <Icon
            name="ArrowUp"
            size={16}
            color={post.hasUpvoted ? colors.primary600 : colors.slate700}
            strokeWidth={2.5}
          />
          <Text style={[styles.actionText, post.hasUpvoted && { color: colors.primary700 }]}>
            {post.upvotes}
          </Text>
        </Pressable>
        <View style={styles.actionCell}>
          <Icon name="MessageSquare" size={16} color={colors.slate700} strokeWidth={2.5} />
          <Text style={styles.actionText}>{post.commentCount}</Text>
        </View>
        <Pressable
          onPress={toggleBookmark}
          style={[styles.actionCell, post.hasBookmarked && { backgroundColor: colors.primary50 }]}
        >
          <Icon
            name={post.hasBookmarked ? 'BookmarkCheck' : 'Bookmark'}
            size={16}
            color={post.hasBookmarked ? colors.primary600 : colors.slate700}
            strokeWidth={2.5}
          />
          <Text style={[styles.actionText, post.hasBookmarked && { color: colors.primary700 }]}>Save</Text>
        </Pressable>
      </View>

      <Text style={styles.commentsHeading}>
        Comments ({comments.length})
      </Text>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={comments}
        keyExtractor={(c) => c.id}
        contentContainerStyle={[{ paddingHorizontal: horizontalPadding, paddingBottom: spacing['5xl'] }]}
        ListHeaderComponent={Header}
        ListEmptyComponent={
          <EmptyState
            icon="MessageSquare"
            title="No comments yet"
            message="Be the first to share your thoughts."
          />
        }
        renderItem={({ item: c }) => (
          <View style={styles.comment}>
            <Avatar uri={c.authorAvatar} name={c.authorName} size={32} />
            <View style={styles.commentBody}>
              <Text style={styles.commentAuthor}>{c.authorName}</Text>
              <Text style={styles.commentText}>{c.text}</Text>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {isAuthenticated ? (
        <View style={[styles.composer, { paddingHorizontal: horizontalPadding }]}>
          <Avatar name={user?.name || '?'} size={36} />
          <View style={styles.composerField}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Add a comment..."
              placeholderTextColor={colors.slate400}
              style={styles.composerInput}
            />
          </View>
          <Pressable
            onPress={submitComment}
            disabled={!comment.trim() || posting}
            style={[styles.sendBtn, (!comment.trim() || posting) && { opacity: 0.5 }]}
          >
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendInner}
            >
              <Icon name="Send" size={16} color={colors.white} strokeWidth={2.5} />
            </LinearGradient>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { ...typography.body, color: colors.primary600, fontWeight: '700' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    ...shadow.sm,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
  },
  authorCardLight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
  },
  authorName: { ...typography.titleMd, color: colors.slate900 },
  authorMeta: { ...typography.caption, color: 'rgba(255,255,255,0.85)' },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.white,
  },
  followText: { ...typography.caption, color: colors.primary700, fontWeight: '700' },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  title: { ...typography.displayMd, color: colors.slate900, marginBottom: 8 },
  body: { ...typography.bodyLg, color: colors.slate700, lineHeight: 24 },
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
  tagText: { ...typography.caption, color: colors.primary700, fontWeight: '700' },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  actionCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  actionText: { ...typography.caption, color: colors.slate700, fontWeight: '700' },
  commentsHeading: {
    ...typography.titleMd,
    color: colors.slate900,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  comment: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  commentBody: { flex: 1, marginLeft: spacing.sm },
  commentAuthor: { ...typography.caption, color: colors.slate900, fontWeight: '700' },
  commentText: { ...typography.body, color: colors.slate700, marginTop: 2 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  composerField: {
    flex: 1,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  composerInput: {
    ...typography.body,
    color: colors.slate900,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  sendInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
