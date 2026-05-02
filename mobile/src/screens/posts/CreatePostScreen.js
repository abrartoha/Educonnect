import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../../components/Screen';
import Icon from '../../components/Icon';
import { colors, gradients, radius, shadow, spacing, typography } from '../../theme';
import { postsApi } from '../../api/endpoints';

const CATEGORIES = [
  { id: 'SCHOLARSHIPS', label: 'Scholarships', icon: 'Trophy', gradient: gradients.scholarships },
  { id: 'VISA_TIPS', label: 'Visa Tips', icon: 'ShieldCheck', gradient: gradients.visa },
  { id: 'COURSES', label: 'Courses', icon: 'BookOpen', gradient: gradients.courses },
  { id: 'CAMPUS_LIFE', label: 'Campus Life', icon: 'Coffee', gradient: gradients.campus },
  { id: 'CAREER', label: 'Career', icon: 'Briefcase', gradient: gradients.career },
  { id: 'STUDENT_LIFE', label: 'Student Life', icon: 'Sparkles', gradient: gradients.studentLife },
];

export default function CreatePostScreen({ navigation, route }) {
  const editPost = route?.params?.editPost || null;
  const isEdit = !!editPost;
  const { width } = useWindowDimensions();

  const [title, setTitle] = useState(editPost?.title || '');
  const [content, setContent] = useState(editPost?.content || '');
  const [category, setCategory] = useState(editPost?.category?.toUpperCase() || 'EVENTS');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(editPost?.tags || []);
  const [loading, setLoading] = useState(false);

  const horizontalPadding = width < 360 ? spacing.lg : spacing.xl;

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || tags.includes(t) || tags.length >= 5) return;
    setTags([...tags, t]);
    setTagInput('');
  };
  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  const submit = async () => {
    if (title.trim().length < 3) return Alert.alert('Title too short', 'At least 3 characters.');
    if (content.trim().length < 10) return Alert.alert('Content too short', 'At least 10 characters.');
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        category,
        tags,
        mediaType: 'NONE',
      };
      if (isEdit) await postsApi.update(editPost.id, payload);
      else await postsApi.create(payload);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save', err?.message || 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      {/* Sticky top bar */}
      <View style={[styles.topBar, { paddingHorizontal: horizontalPadding }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.barTitle}>{isEdit ? 'Edit post' : 'New post'}</Text>
        <Pressable
          onPress={submit}
          disabled={loading}
          style={[styles.publishBtn, loading && { opacity: 0.6 }]}
        >
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.publishInner}
          >
            <Text style={styles.publishText}>Publish</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[{ paddingHorizontal: horizontalPadding, paddingBottom: spacing['4xl'] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title card */}
        <View style={[styles.card, shadow.sm]}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="A clear, descriptive headline"
            placeholderTextColor={colors.slate400}
            style={styles.titleInput}
          />
        </View>

        {/* Content card */}
        <View style={[styles.card, shadow.sm, { marginTop: spacing.md }]}>
          <Text style={styles.label}>Content</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Share details, tips or questions…"
            placeholderTextColor={colors.slate400}
            style={styles.contentInput}
            multiline
            numberOfLines={6}
          />
        </View>

        {/* Category */}
        <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c.id}
              category={c}
              active={category === c.id}
              onPress={() => setCategory(c.id)}
            />
          ))}
        </View>

        {/* Tags */}
        <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>TAGS</Text>
        <View style={styles.tagsRow}>
          {tags.map((t) => (
            <Pressable key={t} onPress={() => removeTag(t)} style={styles.tagPill}>
              <Text style={styles.tagText}># {t}</Text>
              <Icon name="X" size={11} color={colors.primary700} strokeWidth={2.5} />
            </Pressable>
          ))}
          <View style={styles.addTagWrap}>
            <Text style={styles.hash}>+</Text>
            <TextInput
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              returnKeyType="done"
              placeholder="add tag"
              placeholderTextColor={colors.slate400}
              style={styles.addTagInput}
            />
          </View>
        </View>

      </ScrollView>
    </Screen>
  );
}

function CategoryChip({ category, active, onPress }) {
  if (active) {
    return (
      <Pressable onPress={onPress} style={styles.catTileWrap}>
        <LinearGradient
          colors={category.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.catTile, styles.catTileActive]}
        >
          <Icon name={category.icon} size={16} color={colors.white} strokeWidth={2.5} />
          <Text style={[styles.catLabel, { color: colors.white }]}>{category.label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={styles.catTileWrap}>
      <View style={styles.catTile}>
        <Icon name={category.icon} size={16} color={colors.slate700} strokeWidth={2.5} />
        <Text style={styles.catLabel}>{category.label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  cancel: { ...typography.body, color: colors.slate600, fontWeight: '600' },
  barTitle: {
    flex: 1,
    textAlign: 'center',
    ...typography.titleMd,
    color: colors.slate900,
  },
  publishBtn: { borderRadius: radius.full, overflow: 'hidden' },
  publishInner: { paddingVertical: 8, paddingHorizontal: 14 },
  publishText: { ...typography.caption, color: colors.white, fontWeight: '700' },
  card: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: radius.xl,
    marginTop: spacing.md,
  },
  label: { ...typography.caption, color: colors.slate700, fontWeight: '700' },
  titleInput: {
    ...typography.titleMd,
    color: colors.slate900,
    marginTop: 6,
    paddingVertical: 6,
  },
  contentInput: {
    ...typography.body,
    color: colors.slate900,
    marginTop: 6,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    ...typography.label,
    color: colors.slate500,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  catTileWrap: { flexBasis: '47%', flexGrow: 1 },
  catTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catTileActive: { borderWidth: 0 },
  catLabel: { ...typography.caption, color: colors.slate700, fontWeight: '700', fontSize: 13 },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primary50,
  },
  tagText: { ...typography.caption, color: colors.primary700, fontWeight: '700' },
  addTagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    minWidth: 110,
  },
  hash: { color: colors.slate400, fontSize: 16, fontWeight: '600' },
  addTagInput: {
    flex: 1,
    ...typography.caption,
    color: colors.slate800,
    fontWeight: '600',
  },
});
