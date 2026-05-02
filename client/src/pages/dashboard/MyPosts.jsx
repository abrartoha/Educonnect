import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  FileText,
  ArrowBigUp,
  MessageSquare,
  Bookmark,
  Eye,
  PenLine,
  Trash2,
  Video,
  Tag,
  Clock,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { postsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normalisePost } from '../../api/mappers';
import CreatePostModal from '../../components/feed/CreatePostModal';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_BADGE = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  flagged: 'bg-red-50 text-red-700 border-red-200',
  removed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const CATEGORY_COLORS = {
  scholarships: 'bg-amber-100 text-amber-700',
  'visa-tips': 'bg-emerald-100 text-emerald-700',
  courses: 'bg-blue-100 text-blue-700',
  'campus-life': 'bg-violet-100 text-violet-700',
  career: 'bg-indigo-100 text-indigo-700',
  'student-life': 'bg-pink-100 text-pink-700',
  events: 'bg-orange-100 text-orange-700',
};

const CATEGORY_LABELS = {
  scholarships: 'Scholarships',
  'visa-tips': 'Visa Tips',
  courses: 'Courses',
  'campus-life': 'Campus Life',
  career: 'Career',
  'student-life': 'Student Life',
  events: 'Events',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRelativeTime(dateString) {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function truncate(str, max = 100) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '...' : str;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MyPosts() {
  const { data, refetch } = useApiResource(() => postsApi.mine(), []);
  const myPosts = useMemo(
    () => (data?.items || []).map(normalisePost),
    [data]
  );
  const deletePost = async (id) => {
    await postsApi.remove(id);
    await refetch();
  };

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);

  // Derived
  const filtered = useMemo(() => {
    let result = myPosts.filter((p) => {
      const matchSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    }

    return result;
  }, [myPosts, searchTerm, statusFilter, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const totalPosts = myPosts.length;
    const totalUpvotes = myPosts.reduce((sum, p) => sum + (p.upvotes || 0), 0);
    const totalComments = myPosts.reduce((sum, p) => sum + (p.commentCount || 0), 0);
    const totalBookmarks = myPosts.filter((p) => p.hasBookmarked).length;
    return { totalPosts, totalUpvotes, totalComments, totalBookmarks };
  }, [myPosts]);

  // Handlers
  const handleCreateNew = () => {
    setEditingPost(null);
    setShowCreateModal(true);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setShowCreateModal(true);
  };

  const handleDelete = (post) => {
    setDeletingPost(post);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingPost) {
      deletePost(deletingPost.id);
      toast.success('Post deleted successfully.');
      setShowDeleteModal(false);
      setDeletingPost(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-xl">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              My Posts
            </h1>
            <p className="text-slate-500 mt-1">
              {myPosts.length} post{myPosts.length === 1 ? '' : 's'} total
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm shadow-indigo-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create New Post
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Posts',
              value: stats.totalPosts,
              icon: FileText,
              color: 'bg-indigo-100 text-indigo-600',
            },
            {
              label: 'Total Upvotes',
              value: stats.totalUpvotes,
              icon: ArrowBigUp,
              color: 'bg-emerald-100 text-emerald-600',
            },
            {
              label: 'Total Comments',
              value: stats.totalComments,
              icon: MessageSquare,
              color: 'bg-violet-100 text-violet-600',
            },
            {
              label: 'Total Bookmarks',
              value: stats.totalBookmarks,
              icon: Bookmark,
              color: 'bg-orange-100 text-orange-600',
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                className="rounded-xl bg-white p-4 shadow-sm border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2.5 ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filter / Sort Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search your posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm outline-none transition-all"
                aria-label="Search posts"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-3 py-2.5 text-sm outline-none transition-all"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-3 py-2.5 text-sm outline-none transition-all"
                aria-label="Sort posts"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {filtered.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center"
          >
            <div className="mx-auto w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No posts yet</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Share your first update! Create posts about scholarships, visa tips, courses, or campus
              life to engage with students.
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl font-medium text-sm shadow-sm shadow-indigo-200 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Your First Post
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {filtered.map((post) => (
              <motion.div
                key={post.id}
                variants={cardVariants}
                className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group"
              >
                {/* Media / Category Header */}
                <div className="relative">
                  {post.mediaType === 'image' && post.mediaUrl ? (
                    <img
                      src={post.mediaUrl}
                      alt=""
                      className="w-full h-40 object-cover rounded-t-xl"
                    />
                  ) : post.mediaType === 'video' && post.mediaUrl ? (
                    <div className="w-full h-40 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-t-xl flex items-center justify-center">
                      <Video className="w-10 h-10 text-white/80" />
                    </div>
                  ) : (
                    <div
                      className={`w-full h-28 rounded-t-xl flex items-center justify-center ${
                        CATEGORY_COLORS[post.category]
                          ? CATEGORY_COLORS[post.category].split(' ')[0]
                          : 'bg-slate-100'
                      }`}
                    >
                      <BarChart3 className="w-8 h-8 text-white/70" />
                    </div>
                  )}

                  {/* Status badge overlay */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border capitalize backdrop-blur-sm ${
                        STATUS_BADGE[post.status] || STATUS_BADGE.draft
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  {/* Category */}
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${
                      CATEGORY_COLORS[post.category] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {CATEGORY_LABELS[post.category] || post.category}
                  </span>

                  {/* Title */}
                  <Link
                    to={`/feed/${post.id}`}
                    className="block text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors mb-1.5 line-clamp-2"
                  >
                    {post.title}
                  </Link>

                  {/* Content preview */}
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {post.content}
                  </p>

                  {/* Engagement stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1" title="Upvotes">
                      <ArrowBigUp className="w-4 h-4" />
                      {post.upvotes || 0}
                    </span>
                    <span className="flex items-center gap-1" title="Comments">
                      <MessageSquare className="w-4 h-4" />
                      {post.commentCount || 0}
                    </span>
                    <span className="flex items-center gap-1" title="Bookmarks">
                      <Bookmark className="w-4 h-4" />
                      {post.bookmarkedBy?.length || 0}
                    </span>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-slate-400">
                          +{post.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer: date + actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {getRelativeTime(post.createdAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/feed/${post.id}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View post"
                        aria-label="View post"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit post"
                        aria-label="Edit post"
                      >
                        <PenLine className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete post"
                        aria-label="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Create / Edit Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingPost(null);
        }}
        editPost={editingPost}
        onSaved={refetch}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              variants={backdropVariants}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              variants={modalVariants}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Post</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Are you sure you want to delete "{truncate(deletingPost?.title, 40)}"? This action
                  cannot be undone.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
