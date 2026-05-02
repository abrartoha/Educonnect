import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  Share2,
  Pin,
  Play,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';
import { postsApi } from '../../api/endpoints';

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
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

function getAuthorLink(authorId, authorType) {
  if (authorType === 'university') return `/universities/${authorId}`;
  if (authorType === 'agent') return `/agents/${authorId}`;
  if (authorType === 'consultant') return `/consultants/${authorId}`;
  return '#';
}

const AUTHOR_BADGE_STYLES = {
  university: 'bg-indigo-100 text-indigo-700',
  agent: 'bg-emerald-100 text-emerald-700',
  consultant: 'bg-orange-100 text-orange-700',
};

const AUTHOR_BADGE_LABELS = {
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

/** Render basic **bold** markdown in content strings. */
function renderContent(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ---------------------------------------------------------------------------
// PostCard
// ---------------------------------------------------------------------------

export default function PostCard({ post, compact = false, onChanged }) {
  const { isAuthenticated } = useStore();

  const [hasUpvoted, setHasUpvoted] = useState(!!post.hasUpvoted);
  const [hasBookmarked, setHasBookmarked] = useState(!!post.hasBookmarked);
  const [upvotes, setUpvotes] = useState(post.upvotes ?? 0);

  useEffect(() => {
    setHasUpvoted(!!post.hasUpvoted);
    setHasBookmarked(!!post.hasBookmarked);
    setUpvotes(post.upvotes ?? 0);
  }, [post.hasUpvoted, post.hasBookmarked, post.upvotes]);

  // ---- handlers ----

  async function handleUpvote(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to interact');
      return;
    }
    // Optimistic update, revert on failure.
    const nextUpvoted = !hasUpvoted;
    setHasUpvoted(nextUpvoted);
    setUpvotes((u) => u + (nextUpvoted ? 1 : -1));
    try {
      await postsApi.toggleUpvote(post.id);
      onChanged?.();
    } catch {
      setHasUpvoted(!nextUpvoted);
      setUpvotes((u) => u + (nextUpvoted ? -1 : 1));
      toast.error('Could not update upvote');
    }
  }

  async function handleDownvote(e) {
    // Downvote just removes an existing upvote.
    if (!hasUpvoted) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    await handleUpvote(e);
  }

  async function handleBookmark(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to interact');
      return;
    }
    const next = !hasBookmarked;
    setHasBookmarked(next);
    try {
      await postsApi.toggleBookmark(post.id);
      onChanged?.();
    } catch {
      setHasBookmarked(!next);
      toast.error('Could not update bookmark');
    }
  }

  function handleShare(e) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/feed/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!');
    });
  }

  // ---- content truncation for compact mode ----

  const contentPreview =
    compact && post.content && post.content.length > 200
      ? post.content.slice(0, 200).trimEnd() + '...'
      : post.content;

  // ---- render ----

  return (
    <motion.article
      role="article"
      aria-label={`Post: ${post.title}`}
      whileHover={{ scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden"
    >
      <div className="flex">
        {/* ============ Left vote column (desktop only) ============ */}
        <div className="hidden md:flex flex-col items-center gap-1 py-4 px-3 bg-slate-50 border-r border-slate-100">
          <button
            onClick={handleUpvote}
            aria-label="Upvote"
            className={`p-1 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
              hasUpvoted
                ? 'text-primary-600'
                : 'text-slate-400 hover:text-primary-500'
            }`}
          >
            <ArrowBigUp
              className="w-6 h-6"
              fill={hasUpvoted ? 'currentColor' : 'none'}
            />
          </button>

          <span
            className={`text-sm font-semibold tabular-nums ${
              hasUpvoted ? 'text-primary-600' : 'text-slate-600'
            }`}
          >
            {upvotes}
          </span>

          <button
            onClick={handleDownvote}
            aria-label="Downvote"
            className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <ArrowBigDown className="w-6 h-6" />
          </button>
        </div>

        {/* ============ Main content area ============ */}
        <div className="flex-1 min-w-0 p-4 sm:p-5">
          {/* ---- Top bar ---- */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {/* Author avatar */}
            <Link
              to={getAuthorLink(post.authorId, post.authorType)}
              aria-label={`View ${post.authorName}'s profile`}
              className="shrink-0"
            >
              <img
                src={post.authorAvatar}
                alt=""
                className="w-7 h-7 rounded-full object-cover"
              />
            </Link>

            {/* Author name */}
            <Link
              to={getAuthorLink(post.authorId, post.authorType)}
              className="font-semibold text-slate-800 hover:text-primary-600 transition-colors truncate max-w-[180px]"
            >
              {post.authorName}
            </Link>

            {/* Author type badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                AUTHOR_BADGE_STYLES[post.authorType] || 'bg-slate-100 text-slate-600'
              }`}
            >
              {AUTHOR_BADGE_LABELS[post.authorType] || post.authorType}
            </span>

            <span className="text-slate-300">·</span>

            {/* Relative time */}
            <time
              dateTime={post.createdAt}
              className="text-slate-400 whitespace-nowrap"
            >
              {getRelativeTime(post.createdAt)}
            </time>

            {/* Category badge */}
            {post.category && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                {CATEGORY_LABELS[post.category] || post.category}
              </span>
            )}

            {/* Pinned badge */}
            {post.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            )}
          </div>

          {/* ---- Title ---- */}
          <Link
            to={`/feed/${post.id}`}
            className="block mt-2"
          >
            <h2 className="text-lg font-bold text-slate-900 hover:text-primary-600 transition-colors leading-snug">
              {post.title}
            </h2>
          </Link>

          {/* ---- Content preview ---- */}
          {post.content && (
            <div className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {compact ? (
                <>
                  {renderContent(contentPreview)}
                  {post.content.length > 200 && (
                    <Link
                      to={`/feed/${post.id}`}
                      className="ml-1 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Read more
                    </Link>
                  )}
                </>
              ) : (
                renderContent(post.content)
              )}
            </div>
          )}

          {/* ---- Media ---- */}
          {post.mediaType === 'image' && post.mediaUrl && (
            <div className="mt-3">
              <img
                src={post.mediaUrl}
                alt={post.title}
                className="w-full max-h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {post.mediaType === 'video' && post.mediaUrl && (
            <div className="mt-3 relative group cursor-pointer">
              <img
                src={post.mediaUrl}
                alt={`Video thumbnail for ${post.title}`}
                className="w-full max-h-96 object-cover rounded-lg brightness-90"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-primary-600 ml-0.5" fill="currentColor" />
                </div>
              </div>
            </div>
          )}

          {/* ---- Tags ---- */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ---- Bottom action bar ---- */}
          <div className="mt-4 flex items-center gap-1 sm:gap-2 -ml-2">
            {/* Upvote — visible on mobile */}
            <button
              onClick={handleUpvote}
              aria-label={`Upvote (${upvotes})`}
              className={`md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
                hasUpvoted
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-primary-500'
              }`}
            >
              <ArrowBigUp
                className="w-5 h-5"
                fill={hasUpvoted ? 'currentColor' : 'none'}
              />
              <span className="tabular-nums">{upvotes}</span>
            </button>

            {/* Comment count */}
            <Link
              to={`/feed/${post.id}`}
              aria-label={`${(post.commentCount ?? 0)} comments`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              <MessageSquare className="w-4.5 h-4.5" />
              <span className="tabular-nums">{(post.commentCount ?? 0)}</span>
              <span className="hidden sm:inline">
                {(post.commentCount ?? 0) === 1 ? 'Comment' : 'Comments'}
              </span>
            </Link>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              aria-label={hasBookmarked ? 'Remove bookmark' : 'Bookmark'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
                hasBookmarked
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {hasBookmarked ? (
                <BookmarkCheck className="w-4.5 h-4.5" fill="currentColor" />
              ) : (
                <Bookmark className="w-4.5 h-4.5" />
              )}
              <span className="hidden sm:inline">
                {hasBookmarked ? 'Saved' : 'Save'}
              </span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              aria-label="Share post"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              <Share2 className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
