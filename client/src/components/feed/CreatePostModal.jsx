import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Image as ImageIcon,
  Video,
  Ban,
  Award,
  FileCheck,
  BookOpen,
  Building2,
  Briefcase,
  Coffee,
  CalendarDays,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';
import { postsApi } from '../../api/endpoints';

const CATEGORY_TO_API = {
  scholarships: 'SCHOLARSHIPS',
  'visa-tips': 'VISA_TIPS',
  courses: 'COURSES',
  'campus-life': 'CAMPUS_LIFE',
  career: 'CAREER',
  'student-life': 'STUDENT_LIFE',
  events: 'EVENTS',
};
const MEDIA_TO_API = { none: 'NONE', image: 'IMAGE', video: 'VIDEO' };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { id: 'scholarships', label: 'Scholarships', Icon: Award },
  { id: 'visa-tips', label: 'Visa Tips', Icon: FileCheck },
  { id: 'courses', label: 'Courses', Icon: BookOpen },
  { id: 'campus-life', label: 'Campus Life', Icon: Building2 },
  { id: 'career', label: 'Career', Icon: Briefcase },
  { id: 'student-life', label: 'Student Life', Icon: Coffee },
  { id: 'events', label: 'Events', Icon: CalendarDays },
];

const MEDIA_OPTIONS = [
  { value: 'none', label: 'No Media', Icon: Ban },
  { value: 'image', label: 'Image', Icon: ImageIcon },
  { value: 'video', label: 'Video', Icon: Video },
];

const MAX_TAGS = 5;

const INPUT_CLASS =
  'w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition';

// ---------------------------------------------------------------------------
// Backdrop + modal animation variants
// ---------------------------------------------------------------------------

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 28 },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

// ---------------------------------------------------------------------------
// CreatePostModal
// ---------------------------------------------------------------------------

export default function CreatePostModal({ isOpen, onClose, editPost = null, onSaved }) {
  const { currentUser } = useStore();
  const titleRef = useRef(null);

  // ---- form state ----

  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState('none');
  const [mediaUrl, setMediaUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [status, setStatus] = useState('published');
  const [errors, setErrors] = useState({});

  // Pre-fill when editing
  useEffect(() => {
    if (editPost) {
      setCategory(editPost.category || '');
      setTitle(editPost.title || '');
      setContent(editPost.content || '');
      setMediaType(editPost.mediaType || 'none');
      setMediaUrl(editPost.mediaUrl || '');
      setTags(editPost.tags || []);
      setStatus(editPost.status || 'published');
    } else {
      setCategory('');
      setTitle('');
      setContent('');
      setMediaType('none');
      setMediaUrl('');
      setTags([]);
      setTagInput('');
      setStatus('published');
      setErrors({});
    }
  }, [editPost, isOpen]);

  // Auto-focus title on open
  useEffect(() => {
    if (isOpen && titleRef.current) {
      const timer = setTimeout(() => titleRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // ---- tag helpers ----

  function handleTagKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  }

  function addTag() {
    const cleaned = tagInput.trim().replace(/,/g, '').toLowerCase();
    if (!cleaned) return;
    if (tags.includes(cleaned)) {
      setTagInput('');
      return;
    }
    if (tags.length >= MAX_TAGS) {
      toast.error(`Maximum ${MAX_TAGS} tags allowed`);
      return;
    }
    setTags((prev) => [...prev, cleaned]);
    setTagInput('');
  }

  function removeTag(tag) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  // Process comma-separated tags on blur
  function handleTagBlur() {
    if (tagInput.trim()) addTag();
  }

  // ---- auto-expanding textarea ----

  const textareaRef = useRef(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [content, autoResize]);

  // ---- validation + submit ----

  function validate() {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!category) newErrors.category = 'Please select a category';
    if (!content.trim()) newErrors.content = 'Content is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      content: content.trim(),
      category: CATEGORY_TO_API[category] || 'EVENTS',
      mediaType: MEDIA_TO_API[mediaType] || 'NONE',
      mediaUrl: mediaType !== 'none' ? mediaUrl.trim() || undefined : undefined,
      tags,
    };

    try {
      if (editPost) {
        await postsApi.update(editPost.id, payload);
        toast.success('Post updated successfully!');
      } else {
        await postsApi.create(payload);
        toast.success('Post published successfully!');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Could not save post');
    }
  }

  // ---- whether to show status toggle ----

  const canToggleStatus =
    currentUser?.role === 'admin' ||
    (editPost && editPost.authorId === currentUser?.id);

  // ---- render ----

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label={editPost ? 'Edit Post' : 'Create Post'}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* ---- Header ---- */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/95 backdrop-blur-sm rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-900">
                {editPost ? 'Edit Post' : 'Create Post'}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ---- Form ---- */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {/* 1. Category selector */}
              <fieldset>
                <legend className="text-sm font-medium text-slate-700 mb-2">
                  Category
                </legend>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {CATEGORIES.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setCategory(id);
                        setErrors((prev) => ({ ...prev, category: undefined }));
                      }}
                      aria-pressed={category === id}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
                        category === id
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-500">{errors.category}</p>
                )}
              </fieldset>

              {/* 2. Title */}
              <div>
                <label htmlFor="post-title" className="text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  ref={titleRef}
                  id="post-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  placeholder="What's your headline?"
                  className={`${INPUT_CLASS} mt-1 text-base font-medium ${
                    errors.title ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                )}
              </div>

              {/* 3. Content textarea */}
              <div>
                <label htmlFor="post-content" className="text-sm font-medium text-slate-700">
                  Content
                </label>
                <textarea
                  ref={textareaRef}
                  id="post-content"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setErrors((prev) => ({ ...prev, content: undefined }));
                  }}
                  placeholder="Share your knowledge, news, or updates..."
                  rows={4}
                  className={`${INPUT_CLASS} mt-1 resize-none ${
                    errors.content ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''
                  }`}
                />
                {errors.content && (
                  <p className="mt-1 text-xs text-red-500">{errors.content}</p>
                )}
              </div>

              {/* 4. Media section */}
              <div>
                <span className="text-sm font-medium text-slate-700">Media</span>
                <div className="flex gap-2 mt-2">
                  {MEDIA_OPTIONS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setMediaType(value);
                        if (value === 'none') setMediaUrl('');
                      }}
                      aria-pressed={mediaType === value}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
                        mediaType === value
                          ? 'bg-primary-50 text-primary-700 border border-primary-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {mediaType !== 'none' && (
                  <div className="mt-3 space-y-3">
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder={
                        mediaType === 'image'
                          ? 'Paste image URL...'
                          : 'Paste video URL...'
                      }
                      aria-label={`${mediaType === 'image' ? 'Image' : 'Video'} URL`}
                      className={INPUT_CLASS}
                    />

                    {/* Image preview */}
                    {mediaType === 'image' && mediaUrl && (
                      <img
                        src={mediaUrl}
                        alt="Preview"
                        className="w-full max-h-48 object-cover rounded-lg border border-slate-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}

                    {/* Video placeholder */}
                    {mediaType === 'video' && mediaUrl && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600">
                        <Video className="w-5 h-5 text-primary-500" />
                        <span className="truncate">{mediaUrl}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 5. Tags input */}
              <div>
                <label htmlFor="post-tags" className="text-sm font-medium text-slate-700">
                  Tags{' '}
                  <span className="font-normal text-slate-400">
                    ({tags.length}/{MAX_TAGS} — comma separated)
                  </span>
                </label>
                <input
                  id="post-tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={handleTagBlur}
                  placeholder="e.g. scholarships, melbourne, visa"
                  disabled={tags.length >= MAX_TAGS}
                  className={`${INPUT_CLASS} mt-1 ${
                    tags.length >= MAX_TAGS ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          aria-label={`Remove tag ${tag}`}
                          className="ml-0.5 p-0.5 rounded-full hover:bg-primary-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Status toggle */}
              {canToggleStatus && (
                <fieldset>
                  <legend className="text-sm font-medium text-slate-700 mb-2">
                    Status
                  </legend>
                  <div className="flex gap-3">
                    {['published', 'draft'].map((s) => (
                      <label
                        key={s}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition border focus-within:ring-2 focus-within:ring-primary-400 ${
                          status === s
                            ? 'bg-primary-50 text-primary-700 border-primary-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="post-status"
                          value={s}
                          checked={status === s}
                          onChange={() => setStatus(s)}
                          className="sr-only"
                        />
                        {s === 'published' ? 'Published' : 'Draft'}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
            </form>

            {/* ---- Footer ---- */}
            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-white/95 backdrop-blur-sm rounded-b-2xl">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white gradient-primary shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                {editPost ? 'Save Changes' : 'Publish Post'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
