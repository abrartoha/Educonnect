import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutGrid,
  Award,
  FileCheck,
  BookOpen,
  Building2,
  Briefcase,
  Coffee,
  CalendarDays,
  PenSquare,
  Flame,
  Clock,
  TrendingUp,
  Pin,
  X,
  Users,
  GraduationCap,
  UserCheck,
  Hash,
  ChevronRight,
  MessageSquare,
  ArrowUp,
  Sparkles,
} from 'lucide-react';
import useStore from '../store/useStore';
import { postsApi } from '../api/endpoints';
import { normalisePost } from '../api/mappers';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PostCard from '../components/feed/PostCard';
import CreatePostModal from '../components/feed/CreatePostModal';

const CATEGORIES = [
  { id: 'all', label: 'All Posts', icon: LayoutGrid },
  { id: 'scholarships', label: 'Scholarships', icon: Award },
  { id: 'visa-tips', label: 'Visa Tips', icon: FileCheck },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'campus-life', label: 'Campus Life', icon: Building2 },
  { id: 'career', label: 'Career & Research', icon: Briefcase },
  { id: 'student-life', label: 'Student Life', icon: Coffee },
  { id: 'events', label: 'Events', icon: CalendarDays },
];

const AUTHOR_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'university', label: 'Universities' },
  { id: 'agent', label: 'Agents' },
  { id: 'consultant', label: 'Consultants' },
];

const SORT_OPTIONS = [
  { id: 'hot', label: 'Hot', icon: Flame },
  { id: 'new', label: 'New', icon: Clock },
  { id: 'top', label: 'Top', icon: TrendingUp },
];


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Feed() {
  const { isAuthenticated, currentUser } = useStore();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const refetchPosts = useCallback(async () => {
    try {
      setLoadingPosts(true);
      const res = await postsApi.list({ limit: 50, sort: 'hot' });
      setPosts((res.items || []).map(normalisePost));
    } catch {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    refetchPosts();
  }, [refetchPosts]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAuthorType, setSelectedAuthorType] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState('hot');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Compute top tags across all published posts
  const topTags = useMemo(() => {
    const tagCount = {};
    posts
      .filter((p) => p.status === 'published')
      .forEach((p) => {
        p.tags?.forEach((tag) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  // Compute popular tags for right sidebar (top 8)
  const popularTags = useMemo(() => {
    const tagCount = {};
    posts
      .filter((p) => p.status === 'published')
      .forEach((p) => {
        p.tags?.forEach((tag) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  // Compute top contributors
  const topContributors = useMemo(() => {
    const authorMap = {};
    posts
      .filter((p) => p.status === 'published')
      .forEach((p) => {
        if (!authorMap[p.authorId]) {
          authorMap[p.authorId] = {
            id: p.authorId,
            name: p.authorName,
            avatar: p.authorAvatar,
            type: p.authorType,
            postCount: 0,
          };
        }
        authorMap[p.authorId].postCount += 1;
      });
    return Object.values(authorMap)
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5);
  }, [posts]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let result = posts.filter((p) => p.status === 'published');

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Author type filter
    if (selectedAuthorType !== 'all') {
      result = result.filter((p) => p.authorType === selectedAuthorType);
    }

    // Tag filter
    if (selectedTag) {
      result = result.filter((p) => p.tags?.includes(selectedTag));
    }

    // Sort: pinned always first
    const pinned = result.filter((p) => p.isPinned);
    const unpinned = result.filter((p) => !p.isPinned);

    if (sortBy === 'hot') {
      unpinned.sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortBy === 'new') {
      unpinned.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'top') {
      unpinned.sort((a, b) => b.upvotes - a.upvotes);
    }

    pinned.sort((a, b) => b.upvotes - a.upvotes);

    return [...pinned, ...unpinned];
  }, [posts, searchQuery, selectedCategory, selectedAuthorType, selectedTag, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedAuthorType('all');
    setSelectedTag(null);
  };

  const hasActiveFilters =
    searchQuery.trim() ||
    selectedCategory !== 'all' ||
    selectedAuthorType !== 'all' ||
    selectedTag;

  const authorTypeBadgeColor = (type) => {
    switch (type) {
      case 'university':
        return 'bg-primary-100 text-primary-700';
      case 'agent':
        return 'bg-emerald-100 text-emerald-700';
      case 'consultant':
        return 'bg-accent-100 text-accent-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      {/* Hero Banner */}
      <section className="gradient-primary pt-24 pb-12 sm:pt-28 sm:pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Community Feed
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-primary-100 sm:text-lg">
              Knowledge, insights, and updates from Australia's education community
            </p>

            {/* Search Bar */}
            <div className="mx-auto mt-6 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search posts by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search posts"
                  className="w-full rounded-xl border-0 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-800 shadow-lg shadow-primary-900/20 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-white/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block" aria-label="Filters">
            {/* Category Filter */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">
                Categories
              </h3>
              <nav className="space-y-1" aria-label="Category filters">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      aria-label={`Filter by ${cat.label}`}
                      aria-pressed={isActive}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                        isActive
                          ? 'gradient-primary text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {cat.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Author Type Filter */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">
                Author Type
              </h3>
              <div className="space-y-1">
                {AUTHOR_TYPES.map((type) => {
                  const isActive = selectedAuthorType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedAuthorType(type.id)}
                      aria-label={`Filter by ${type.label}`}
                      aria-pressed={isActive}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags Cloud */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {topTags.map(({ tag, count }) => {
                  const isActive = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isActive ? null : tag)}
                      aria-label={`Filter by tag ${tag}`}
                      aria-pressed={isActive}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                        isActive
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Hash className="h-3 w-3" />
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <section className="min-w-0 flex-1" aria-label="Post feed">
            {/* Sort Bar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                {SORT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = sortBy === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id)}
                      aria-label={`Sort by ${option.label}`}
                      aria-pressed={isActive}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                        isActive
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {isAuthenticated && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  aria-label="Create a new post"
                  className="gradient-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition-all hover:shadow-lg hover:shadow-primary-500/30 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                >
                  <PenSquare className="h-4 w-4" />
                  Create Post
                </button>
              )}
            </div>

            {/* Active Filters Banner */}
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3"
              >
                <span className="text-xs font-medium text-slate-500">
                  Active filters:
                </span>
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
                    {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                    <button
                      onClick={() => setSelectedCategory('all')}
                      aria-label="Remove category filter"
                      className="ml-0.5 rounded-full hover:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedAuthorType !== 'all' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {AUTHOR_TYPES.find((t) => t.id === selectedAuthorType)?.label}
                    <button
                      onClick={() => setSelectedAuthorType('all')}
                      aria-label="Remove author type filter"
                      className="ml-0.5 rounded-full hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedTag && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    #{selectedTag}
                    <button
                      onClick={() => setSelectedTag(null)}
                      aria-label="Remove tag filter"
                      className="ml-0.5 rounded-full hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  aria-label="Clear all filters"
                  className="ml-auto text-xs font-medium text-primary-600 hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded"
                >
                  Clear all
                </button>
              </motion.div>
            )}

            {/* Result Count */}
            <p className="mb-4 text-sm text-slate-500">
              Showing {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
            </p>

            {/* Post List */}
            {filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div key={post.id}>
                    {post.isPinned && (
                      <div className="mb-1 flex items-center gap-1.5 pl-2 text-xs font-medium text-primary-600">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </div>
                    )}
                    <PostCard post={post} compact={true} onChanged={refetchPosts} />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-16 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Search className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">
                  No posts found
                </h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    aria-label="Clear all filters"
                    className="mt-4 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                  >
                    Clear all filters
                  </button>
                )}
              </motion.div>
            )}

            {/* Mobile Filters (shown below feed on small screens) */}
            <div className="mt-8 space-y-4 lg:hidden">
              {/* Mobile Category Filter */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        aria-label={`Filter by ${cat.label}`}
                        aria-pressed={isActive}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                          isActive
                            ? 'gradient-primary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Author Type */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Author Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  {AUTHOR_TYPES.map((type) => {
                    const isActive = selectedAuthorType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedAuthorType(type.id)}
                        aria-label={`Filter by ${type.label}`}
                        aria-pressed={isActive}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                          isActive
                            ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Tags */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topTags.map(({ tag }) => {
                    const isActive = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(isActive ? null : tag)}
                        aria-label={`Filter by tag ${tag}`}
                        aria-pressed={isActive}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                          isActive
                            ? 'bg-primary-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Hash className="h-3 w-3" />
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="hidden w-72 shrink-0 xl:block" aria-label="Sidebar">
            {/* Top Contributors */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Sparkles className="h-4 w-4 text-accent-500" />
                Top Contributors
              </h3>
              <div className="space-y-3">
                {topContributors.map((author, index) => (
                  <div
                    key={author.id}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-5 w-5 items-center justify-center text-xs font-bold text-slate-400">
                      {index + 1}
                    </span>
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {author.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${authorTypeBadgeColor(
                            author.type
                          )}`}
                        >
                          {author.type}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {author.postCount} post{author.postCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Hash className="h-4 w-4 text-primary-500" />
                Popular Tags
              </h3>
              <div className="space-y-2">
                {popularTags.map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    aria-label={`Filter by tag ${tag}`}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                      selectedTag === tag
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Hash className="h-3.5 w-3.5 text-slate-400" />
                      {tag}
                    </span>
                    <span className="text-xs text-slate-400">
                      {count} post{count !== 1 ? 's' : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Create Post CTA (if not authenticated) */}
            {!isAuthenticated && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-gradient-to-br from-primary-50 to-purple-50 p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                  <PenSquare className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-800">
                  Share your knowledge
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Join the community and share insights about studying in Australia.
                </p>
                <Link
                  to="/signup"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition-all hover:shadow-lg hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        editPost={null}
        onSaved={refetchPosts}
      />
    </div>
  );
}
