import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  PenLine,
  Pin,
  PinOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowBigUp,
  MessageSquare,
  Image,
  Video,
  ArrowUpDown,
  CheckSquare,
  Square,
  MinusSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { postsApi, adminApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normalisePost, CATEGORY_TO_API } from '../../api/mappers';
import CreatePostModal from '../../components/feed/CreatePostModal';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = ['published', 'draft', 'flagged', 'removed'];

const STATUS_BADGE = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  flagged: 'bg-red-50 text-red-700 border-red-200',
  removed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const AUTHOR_TYPE_BADGE = {
  university: 'bg-indigo-100 text-indigo-700',
  agent: 'bg-emerald-100 text-emerald-700',
  consultant: 'bg-orange-100 text-orange-700',
};

const AUTHOR_TYPE_LABEL = {
  university: 'University',
  agent: 'Agent',
  consultant: 'Consultant',
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
  { value: 'upvotes', label: 'Most Upvoted' },
  { value: 'comments', label: 'Most Commented' },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
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

function truncate(str, max = 50) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '...' : str;
}

function formatDate(dateString) {
  if (!dateString) return '---';
  return new Date(dateString).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function MediaThumb({ post }) {
  if (post.mediaType === 'image' && post.mediaUrl) {
    return (
      <img
        src={post.mediaUrl}
        alt=""
        className="w-10 h-10 rounded-lg object-cover"
      />
    );
  }
  if (post.mediaType === 'video') {
    return (
      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
        <Video className="w-5 h-5 text-violet-600" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
      <Image className="w-5 h-5 text-slate-400" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ManagePosts() {
  const { data: postsData, refetch } = useApiResource(
    () => postsApi.list({ limit: 100, sort: 'new' }),
    []
  );
  const posts = (postsData?.items || []).map(normalisePost);

  const updatePost = async (id, patch) => {
    if (patch.status) {
      const apiStatus =
        patch.status === 'published'
          ? 'PUBLISHED'
          : patch.status === 'hidden'
          ? 'HIDDEN'
          : patch.status === 'removed' || patch.status === 'flagged'
          ? 'REMOVED'
          : 'PUBLISHED';
      await adminApi.setPostStatus(id, apiStatus);
    } else {
      const body = { ...patch };
      if (body.category) body.category = CATEGORY_TO_API[body.category] || body.category;
      await postsApi.update(id, body);
    }
    await refetch();
  };
  const deletePost = async (id) => {
    await postsApi.remove(id);
    await refetch();
  };
  const togglePinPost = async (id) => {
    await adminApi.togglePostPin(id);
    await refetch();
  };

  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [authorTypeFilter, setAuthorTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkStatusValue, setBulkStatusValue] = useState('');

  // Status change dropdown
  const [statusDropdownId, setStatusDropdownId] = useState(null);

  // Derived data
  const categories = useMemo(() => {
    const cats = [...new Set(posts.map((p) => p.category).filter(Boolean))];
    return cats.sort();
  }, [posts]);

  const filtered = useMemo(() => {
    let result = posts.filter((p) => {
      const matchSearch =
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.authorName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchAuthorType = authorTypeFilter === 'all' || p.authorType === authorTypeFilter;
      return matchSearch && matchStatus && matchCategory && matchAuthorType;
    });

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'upvotes') {
      result.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (sortBy === 'comments') {
      result.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
    }

    return result;
  }, [posts, searchTerm, statusFilter, categoryFilter, authorTypeFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [searchTerm, statusFilter, categoryFilter, authorTypeFilter, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.status === 'published').length;
    const drafts = posts.filter((p) => p.status === 'draft').length;
    const flagged = posts.filter((p) => p.status === 'flagged').length;
    return { total, published, drafts, flagged };
  }, [posts]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleEdit = (post) => {
    setEditingPost(post);
    setShowCreateModal(true);
  };

  const handleCreateNew = () => {
    setEditingPost(null);
    setShowCreateModal(true);
  };

  const handleDelete = (post) => {
    setDeletingPost(post);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingPost) {
      deletePost(deletingPost.id);
      toast.success(`Post "${truncate(deletingPost.title, 30)}" has been deleted.`);
      setShowDeleteModal(false);
      setDeletingPost(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deletingPost.id);
        return next;
      });
    }
  };

  const handleStatusChange = (postId, newStatus) => {
    updatePost(postId, { status: newStatus });
    toast.success(`Post status changed to "${newStatus}".`);
    setStatusDropdownId(null);
  };

  const handlePinToggle = (post) => {
    togglePinPost(post.id);
    toast.success(post.isPinned ? 'Post unpinned.' : 'Post pinned.');
  };

  // Bulk
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pageIds = paginated.map((p) => p.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const pageIds = paginated.map((p) => p.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someOnPageSelected = pageIds.some((id) => selectedIds.has(id));

  const handleBulkDelete = () => {
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = () => {
    selectedIds.forEach((id) => deletePost(id));
    toast.success(`${selectedIds.size} post(s) deleted.`);
    setSelectedIds(new Set());
    setShowBulkDeleteModal(false);
  };

  const handleBulkStatusChange = (newStatus) => {
    selectedIds.forEach((id) => updatePost(id, { status: newStatus }));
    toast.success(`${selectedIds.size} post(s) status changed to "${newStatus}".`);
    setSelectedIds(new Set());
    setBulkStatusValue('');
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!statusDropdownId) return;
    const handler = () => setStatusDropdownId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [statusDropdownId]);

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
              Manage Posts
            </h1>
            <p className="text-slate-500 mt-1">
              {filtered.length} post{filtered.length === 1 ? '' : 's'} found
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm shadow-indigo-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Post
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Posts', value: stats.total, color: 'bg-indigo-100 text-indigo-600' },
            { label: 'Published', value: stats.published, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Drafts', value: stats.drafts, color: 'bg-amber-100 text-amber-600' },
            { label: 'Flagged', value: stats.flagged, color: 'bg-red-100 text-red-600' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 flex items-center gap-3"
            >
              <div className={`rounded-lg p-2.5 ${stat.color}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm outline-none transition-all"
                aria-label="Search posts"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-3 py-2.5 text-sm outline-none transition-all"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="flagged">Flagged</option>
                  <option value="removed">Removed</option>
                </select>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-3 py-2.5 text-sm outline-none transition-all"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] || cat}
                  </option>
                ))}
              </select>
              <select
                value={authorTypeFilter}
                onChange={(e) => setAuthorTypeFilter(e.target.value)}
                className="rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-3 py-2.5 text-sm outline-none transition-all"
                aria-label="Filter by author type"
              >
                <option value="all">All Authors</option>
                <option value="university">University</option>
                <option value="agent">Agent</option>
                <option value="consultant">Consultant</option>
              </select>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
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
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-wrap items-center gap-4"
          >
            <span className="text-sm font-medium text-indigo-700">
              {selectedIds.size} post{selectedIds.size === 1 ? '' : 's'} selected
            </span>
            <div className="flex items-center gap-3">
              <select
                value={bulkStatusValue}
                onChange={(e) => {
                  if (e.target.value) handleBulkStatusChange(e.target.value);
                }}
                className="rounded-lg border border-indigo-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                aria-label="Bulk change status"
              >
                <option value="">Change Status...</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-2 rounded-lg border border-indigo-300 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}

        {/* Posts Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3.5 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="p-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      aria-label={allOnPageSelected ? 'Deselect all' : 'Select all'}
                    >
                      {allOnPageSelected ? (
                        <CheckSquare className="w-5 h-5 text-indigo-600" />
                      ) : someOnPageSelected ? (
                        <MinusSquare className="w-5 h-5 text-indigo-400" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Post
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Author
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Category
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Status
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Engagement
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Date
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-400">
                      <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                      <p className="text-sm">No posts found matching your criteria.</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((post, i) => (
                    <motion.tr
                      key={post.id}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={i}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleSelect(post.id)}
                          className="p-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                          aria-label={selectedIds.has(post.id) ? 'Deselect post' : 'Select post'}
                        >
                          {selectedIds.has(post.id) ? (
                            <CheckSquare className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>

                      {/* Post title + media */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <MediaThumb post={post} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate max-w-[220px]">
                              {post.isPinned && (
                                <Pin className="w-3.5 h-3.5 inline-block mr-1 text-indigo-500" />
                              )}
                              {post.title}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700 truncate max-w-[140px]">
                            {post.authorName}
                          </p>
                          <span
                            className={`inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                              AUTHOR_TYPE_BADGE[post.authorType] || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {AUTHOR_TYPE_LABEL[post.authorType] || post.authorType}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {CATEGORY_LABELS[post.category] || post.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${
                            STATUS_BADGE[post.status] || STATUS_BADGE.draft
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>

                      {/* Engagement */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1" title="Upvotes">
                            <ArrowBigUp className="w-4 h-4" />
                            {post.upvotes || 0}
                          </span>
                          <span className="flex items-center gap-1" title="Comments">
                            <MessageSquare className="w-4 h-4" />
                            {post.comments?.length || 0}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-500">{formatDate(post.createdAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/feed/${post.id}`}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View post"
                            aria-label="View post"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit post"
                            aria-label="Edit post"
                          >
                            <PenLine className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePinToggle(post)}
                            className={`p-2 rounded-lg transition-colors ${
                              post.isPinned
                                ? 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                                : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                            }`}
                            title={post.isPinned ? 'Unpin post' : 'Pin post'}
                            aria-label={post.isPinned ? 'Unpin post' : 'Pin post'}
                          >
                            {post.isPinned ? (
                              <PinOff className="w-4 h-4" />
                            ) : (
                              <Pin className="w-4 h-4" />
                            )}
                          </button>
                          {/* Status dropdown */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusDropdownId(
                                  statusDropdownId === post.id ? null : post.id
                                );
                              }}
                              className={`p-2 rounded-lg transition-colors text-xs font-medium border ${
                                STATUS_BADGE[post.status] || STATUS_BADGE.draft
                              }`}
                              title="Change status"
                              aria-label="Change status"
                            >
                              {post.status?.charAt(0).toUpperCase() + post.status?.slice(1)}
                            </button>
                            {statusDropdownId === post.id && (
                              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                                {STATUS_OPTIONS.filter((s) => s !== post.status).map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => handleStatusChange(post.id, s)}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors capitalize"
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(post)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete post"
                            aria-label="Delete post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <p className="text-sm text-slate-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, current, and neighbors
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .reduce((acc, page, idx, arr) => {
                    if (idx > 0 && page - arr[idx - 1] > 1) {
                      acc.push('ellipsis-' + page);
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item) =>
                    typeof item === 'string' ? (
                      <span key={item} className="px-1 text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === item
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'border border-slate-200 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Create / Edit Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingPost(null);
        }}
        editPost={editingPost}
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

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showBulkDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              variants={backdropVariants}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowBulkDeleteModal(false)}
            />
            <motion.div
              variants={modalVariants}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Delete {selectedIds.size} Post{selectedIds.size === 1 ? '' : 's'}
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Are you sure you want to delete {selectedIds.size} selected post
                  {selectedIds.size === 1 ? '' : 's'}? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowBulkDeleteModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmBulkDelete}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-sm transition-colors"
                  >
                    Delete All
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
