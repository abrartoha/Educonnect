import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUp,
  ArrowDown,
  Bookmark,
  BookmarkCheck,
  Share2,
  Flag,
  MessageSquare,
  ChevronRight,
  Clock,
  Tag,
  ArrowLeft,
  Send,
  User,
  ExternalLink,
  Play,
  Hash,
} from 'lucide-react';
import useStore from '../store/useStore';
import { postsApi } from '../api/endpoints';
import { useApiResource } from '../hooks/useApiResource';
import { normalisePost } from '../api/mappers';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import toast from 'react-hot-toast';

function formatRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
}

function renderFormattedContent(content) {
  if (!content) return null;

  const paragraphs = content.split('\n\n');

  return paragraphs.map((para, pIdx) => {
    const lines = para.split('\n');
    return (
      <div key={pIdx} className="mb-4 last:mb-0">
        {lines.map((line, lIdx) => {
          // Process bold markers
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          const rendered = parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={i} className="font-semibold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={i}>{part}</span>;
          });

          return (
            <p key={lIdx} className="text-slate-700 leading-relaxed">
              {rendered}
            </p>
          );
        })}
      </div>
    );
  });
}

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

const categoryBadgeColor = (category) => {
  switch (category) {
    case 'scholarships':
      return 'bg-amber-100 text-amber-700';
    case 'visa-tips':
      return 'bg-blue-100 text-blue-700';
    case 'courses':
      return 'bg-purple-100 text-purple-700';
    case 'campus-life':
      return 'bg-green-100 text-green-700';
    case 'career':
      return 'bg-rose-100 text-rose-700';
    case 'student-life':
      return 'bg-orange-100 text-orange-700';
    case 'events':
      return 'bg-cyan-100 text-cyan-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const categoryLabels = {
  scholarships: 'Scholarships',
  'visa-tips': 'Visa Tips',
  courses: 'Courses',
  'campus-life': 'Campus Life',
  career: 'Career & Research',
  'student-life': 'Student Life',
  events: 'Events',
};

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useStore();

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: postData, refetch } = useApiResource(
    () => (postId ? postsApi.get(postId) : null),
    [postId]
  );
  const { data: relatedData } = useApiResource(
    () => postsApi.list({ limit: 10, sort: 'top' }),
    []
  );

  const post = postData?.item
    ? {
        ...normalisePost(postData.item),
        comments: (postData.item.comments || []).map((c) => ({
          id: c.id,
          authorName: c.author?.name,
          avatar: c.author?.avatarUrl,
          content: c.text,
          createdAt: c.createdAt,
        })),
      }
    : null;

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return (relatedData?.items || [])
      .map(normalisePost)
      .filter(
        (p) =>
          p.id !== post.id &&
          (p.authorId === post.authorId || p.category === post.category)
      )
      .slice(0, 3);
  }, [relatedData, post]);

  const sortedComments = useMemo(() => {
    if (!post) return [];
    return [...(post.comments || [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <MessageSquare className="h-9 w-9 text-slate-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-slate-800">
              Post not found
            </h1>
            <p className="mt-2 text-slate-500">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/feed"
              className="mt-6 inline-flex items-center gap-2 rounded-lg gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition-all hover:shadow-lg hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Feed
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  const isUpvoted = !!post.hasUpvoted;
  const isBookmarked = !!post.hasBookmarked;

  const handleUpvote = async () => {
    if (!isAuthenticated || !currentUser) {
      toast.error('Please log in to upvote posts');
      return;
    }
    try {
      await postsApi.toggleUpvote(post.id);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not upvote');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated || !currentUser) {
      toast.error('Please log in to bookmark posts');
      return;
    }
    try {
      await postsApi.toggleBookmark(post.id);
      toast.success(isBookmarked ? 'Bookmark removed' : 'Post bookmarked');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not bookmark');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleReport = () => {
    toast.success('Post reported. Our team will review it.');
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await postsApi.addComment(post.id, commentText.trim());
      setCommentText('');
      toast.success('Comment posted!');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm text-slate-500">
            <li>
              <Link
                to="/feed"
                className="rounded hover:text-primary-600 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                Feed
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4" />
            </li>
            <li className="truncate max-w-xs font-medium text-slate-700">
              {post.title}
            </li>
          </ol>
        </nav>

        <div className="flex gap-8">
          {/* Main Content */}
          <article className="min-w-0 flex-1 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Post Header */}
              <header className="p-6 pb-0 sm:p-8 sm:pb-0">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {post.authorName}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${authorTypeBadgeColor(
                          post.authorType
                        )}`}
                      >
                        {post.authorType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      <time dateTime={post.createdAt}>
                        {formatRelativeTime(post.createdAt)}
                      </time>
                      <span className="text-slate-300">|</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryBadgeColor(
                          post.category
                        )}`}
                      >
                        {categoryLabels[post.category] || post.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-3xl">
                  {post.title}
                </h1>
              </header>

              {/* Content */}
              <div className="px-6 pt-5 sm:px-8">
                <div className="prose-like">{renderFormattedContent(post.content)}</div>
              </div>

              {/* Media */}
              {post.mediaType && post.mediaType !== 'none' && post.mediaUrl && (
                <div className="mt-6 px-6 sm:px-8">
                  {post.mediaType === 'image' ? (
                    <img
                      src={post.mediaUrl}
                      alt={post.title}
                      className="w-full rounded-lg object-cover"
                    />
                  ) : post.mediaType === 'video' ? (
                    <div className="relative overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={post.mediaUrl}
                        alt={post.title}
                        className="w-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                          <Play className="h-7 w-7 text-primary-600 ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 px-6 sm:px-8">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/feed?tag=${tag}`}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                    >
                      <Hash className="h-3 w-3" />
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 px-6 py-4 sm:px-8">
                {/* Upvote / Downvote */}
                <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50">
                  <button
                    onClick={handleUpvote}
                    aria-label={isUpvoted ? 'Remove upvote' : 'Upvote this post'}
                    className={`rounded-l-full p-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                      isUpvoted
                        ? 'text-primary-600 hover:bg-primary-50'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-primary-600'
                    }`}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </button>
                  <span
                    className={`min-w-[2rem] text-center text-sm font-semibold ${
                      isUpvoted ? 'text-primary-600' : 'text-slate-700'
                    }`}
                  >
                    {post.upvotes}
                  </span>
                  <button
                    onClick={handleUpvote}
                    aria-label="Downvote this post"
                    className="rounded-r-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                  >
                    <ArrowDown className="h-5 w-5" />
                  </button>
                </div>

                {/* Bookmark */}
                <button
                  onClick={handleBookmark}
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                    isBookmarked
                      ? 'border-primary-200 bg-primary-50 text-primary-600'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  {isBookmarked ? 'Saved' : 'Save'}
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  aria-label="Share this post"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>

                {/* Report */}
                <button
                  onClick={handleReport}
                  aria-label="Report this post"
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 hover:border-red-200 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                >
                  <Flag className="h-4 w-4" />
                  Report
                </button>
              </div>
            </motion.div>

            {/* Comments Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              aria-label="Comments"
              className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <header className="border-b border-slate-100 px-6 py-4 sm:px-8">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <MessageSquare className="h-5 w-5 text-primary-500" />
                  Comments ({post.comments.length})
                </h2>
              </header>

              {/* Add Comment Form */}
              <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
                {isAuthenticated && currentUser ? (
                  <form onSubmit={handleSubmitComment} className="flex gap-3">
                    <img
                      src={
                        currentUser.avatar ||
                        currentUser.logo ||
                        `https://placehold.co/40x40/818cf8/white?text=${(
                          currentUser.name ||
                          currentUser.contactPerson ||
                          'U'
                        )
                          .charAt(0)
                          .toUpperCase()}`
                      }
                      alt="Your avatar"
                      className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div className="min-w-0 flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your thoughts..."
                        rows={3}
                        aria-label="Write a comment"
                        className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-primary-300 focus:bg-white focus-visible:ring-2 focus-visible:ring-primary-500"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={!commentText.trim() || isSubmitting}
                          aria-label="Post comment"
                          className="gradient-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                        >
                          <Send className="h-4 w-4" />
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
                    <User className="h-5 w-5 text-slate-400" />
                    <p className="text-sm text-slate-500">
                      <Link
                        to="/login"
                        className="font-medium text-primary-600 hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded"
                      >
                        Log in
                      </Link>{' '}
                      to join the discussion.
                    </p>
                  </div>
                )}
              </div>

              {/* Comment List */}
              <div className="divide-y divide-slate-100">
                {sortedComments.length > 0 ? (
                  sortedComments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`px-6 py-4 sm:px-8 ${
                        index % 2 === 1 ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={
                            comment.avatar ||
                            `https://placehold.co/40x40/818cf8/white?text=${comment.authorName
                              .charAt(0)
                              .toUpperCase()}`
                          }
                          alt={comment.authorName}
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">
                              {comment.authorName}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                            {comment.content}
                          </p>
                          {comment.upvotes > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                              <ArrowUp className="h-3 w-3" />
                              {comment.upvotes}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center sm:px-8">
                    <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-400">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  </div>
                )}
              </div>
            </motion.section>
          </article>

          {/* Right Sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block" aria-label="Post sidebar">
            {/* About the Author */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="mb-4 text-sm font-semibold text-slate-800">
                About the Author
              </h3>
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800">
                    {post.authorName}
                  </p>
                  <span
                    className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${authorTypeBadgeColor(
                      post.authorType
                    )}`}
                  >
                    {post.authorType}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-3">
                Sharing knowledge and insights about studying in Australia. Follow for more
                updates on {categoryLabels[post.category]?.toLowerCase() || 'education'}.
              </p>
              <Link
                to={
                  post.authorType === 'university'
                    ? `/universities/${post.authorId}`
                    : post.authorType === 'agent'
                    ? `/agents/${post.authorId}`
                    : `/consultants/${post.authorId}`
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                <ExternalLink className="h-4 w-4" />
                View Profile
              </Link>
            </motion.div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="mb-4 text-sm font-semibold text-slate-800">
                  Related Posts
                </h3>
                <div className="space-y-3">
                  {relatedPosts.map((rp) => (
                    <Link
                      key={rp.id}
                      to={`/feed/${rp.id}`}
                      className="group block rounded-lg border border-slate-100 p-3 transition-colors hover:border-primary-100 hover:bg-primary-50/30 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                    >
                      <h4 className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-primary-700">
                        {rp.title}
                      </h4>
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <ArrowUp className="h-3 w-3" />
                          {rp.upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {rp.comments.length}
                        </span>
                        <span>{formatRelativeTime(rp.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
