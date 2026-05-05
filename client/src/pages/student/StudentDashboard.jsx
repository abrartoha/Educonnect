import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  Users,
  Newspaper,
  UserCircle,
  MapPin,
  DollarSign,
  Star,
  Calendar,
  ArrowRight,
  Bookmark,
  Clock,
  TrendingUp,
  Heart,
} from 'lucide-react';
import useStore from '../../store/useStore';
import { directoryApi, postsApi, leadsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem, normalisePost, normaliseLead } from '../../api/mappers';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function StudentDashboard() {
  const { currentUser } = useStore();

  const { data: uniData } = useApiResource(
    () => directoryApi.listUniversities({ limit: 20 }),
    []
  );
  const { data: agentData } = useApiResource(
    () => directoryApi.listAgents({ limit: 20 }),
    []
  );
  const { data: consultantData } = useApiResource(
    () => directoryApi.listConsultants({ limit: 20 }),
    []
  );
  const { data: postsData } = useApiResource(
    () => postsApi.list({ limit: 20, sort: 'new' }),
    []
  );
  const { data: bookmarksData } = useApiResource(() => postsApi.bookmarks(), []);
  const { data: enquiriesData } = useApiResource(() => leadsApi.listMine(), []);

  const universities = (uniData?.items || []).map(normaliseDirectoryItem);
  const agents = (agentData?.items || []).map(normaliseDirectoryItem);
  const consultants = (consultantData?.items || []).map(normaliseDirectoryItem);
  const posts = (postsData?.items || []).map(normalisePost);
  const bookmarkedPosts = (bookmarksData?.items || []).map(normalisePost);
  const enquiries = (enquiriesData?.items || []).map(normaliseLead);

  // Derive member-since year
  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
    : 'N/A';

  // Bookmarked posts count comes straight from the API.
  const bookmarkedPostsCount = bookmarkedPosts.length;

  // Recommended universities
  const recommendedUniversities = useMemo(() => {
    const interests = currentUser?.interestedIn || [];
    const locations = currentUser?.preferredLocations || [];

    if (interests.length === 0 && locations.length === 0) {
      return [...universities]
        .filter((u) => u.status === 'active')
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);
    }

    const scored = universities
      .filter((u) => u.status === 'active')
      .map((uni) => {
        let score = 0;
        const matchingCourses = (uni.courses || []).filter((c) =>
          interests.some(
            (interest) =>
              c.toLowerCase().includes(interest.toLowerCase()) ||
              interest.toLowerCase().includes(c.toLowerCase()),
          ),
        );
        score += matchingCourses.length * 2;

        const locationMatch = locations.some(
          (loc) => uni.location?.toLowerCase().includes(loc.toLowerCase()),
        );
        if (locationMatch) score += 3;

        return { ...uni, score, matchingCourses };
      })
      .filter((u) => u.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    if (scored.length === 0) {
      return [...universities]
        .filter((u) => u.status === 'active')
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);
    }

    return scored;
  }, [universities, currentUser?.interestedIn, currentUser?.preferredLocations]);

  // Recent feed posts
  const recentPosts = useMemo(
    () =>
      [...posts]
        .filter((p) => p.status === 'published')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4),
    [posts],
  );

  // Universities within budget
  const budgetMin = currentUser?.budget?.min ?? 0;
  const budgetMax = currentUser?.budget?.max ?? 50000;
  const universitiesInBudget = useMemo(
    () =>
      universities.filter(
        (u) => u.status === 'active' && u.tuitionRange && u.tuitionRange.min <= budgetMax,
      ),
    [universities, budgetMax],
  );

  // Quick actions
  const quickActions = [
    {
      label: 'Browse Universities',
      icon: Building2,
      to: '/universities',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      ringColor: 'ring-indigo-200',
    },
    {
      label: 'Find an Agent',
      icon: Users,
      to: '/agents',
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600',
      ringColor: 'ring-emerald-200',
    },
    {
      label: 'Community Feed',
      icon: Newspaper,
      to: '/feed',
      color: 'bg-violet-500',
      hoverColor: 'hover:bg-violet-600',
      ringColor: 'ring-violet-200',
    },
    {
      label: 'Edit Profile',
      icon: UserCircle,
      to: '/student/profile',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      ringColor: 'ring-orange-200',
    },
  ];

  // Enquiry status styling
  const leadStatusConfig = {
    new: 'bg-amber-100 text-amber-700',
    contacted: 'bg-blue-100 text-blue-700',
    converted: 'bg-green-100 text-green-700',
    closed: 'bg-slate-100 text-slate-600',
  };

  // Category badge colours
  const categoryColors = {
    scholarships: 'bg-amber-100 text-amber-700',
    'visa-tips': 'bg-blue-100 text-blue-700',
    'campus-life': 'bg-green-100 text-green-700',
    career: 'bg-violet-100 text-violet-700',
    courses: 'bg-indigo-100 text-indigo-700',
    'student-life': 'bg-pink-100 text-pink-700',
  };

  return (
    <>
      {/* ─── Welcome Banner ─── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 p-6 md:p-8 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {currentUser?.avatar && (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full ring-2 ring-white/40 object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {currentUser?.name || 'Student'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-violet-100 text-sm">
                {currentUser?.nationality && (
                  <span className="bg-white/20 px-3 py-0.5 rounded-full font-medium">
                    {currentUser.nationality}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{bookmarkedPostsCount}</p>
              <p className="text-xs text-violet-200">Saved Posts</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">{enquiries.length}</p>
              <p className="text-xs text-violet-200">Enquiries</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">{recommendedUniversities.length}</p>
              <p className="text-xs text-violet-200">Matches</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Recommended Universities ─── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
        className="mt-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-violet-600" />
            Recommended Universities
          </h2>
          <Link
            to="/universities"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
          {recommendedUniversities.map((uni) => (
            <Link
              key={uni.id}
              to={`/universities/${uni.id}`}
              className="min-w-[280px] max-w-[320px] snap-start rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex-shrink-0"
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <img
                    src={uni.logo}
                    alt={uni.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate">
                      {uni.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {uni.location}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-medium text-slate-700">{uni.rating}</span>
                  <span>({uni.reviewCount} reviews)</span>
                </div>

                {/* Matching Courses */}
                {uni.matchingCourses && uni.matchingCourses.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {uni.matchingCourses.slice(0, 2).map((course) => (
                      <span
                        key={course}
                        className="text-[11px] font-medium bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full"
                      >
                        {course}
                      </span>
                    ))}
                    {uni.matchingCourses.length > 2 && (
                      <span className="text-[11px] text-slate-400">
                        +{uni.matchingCourses.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                {/* Tuition */}
                {uni.tuitionRange && (
                  <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {uni.tuitionRange.min?.toLocaleString()} &ndash;{' '}
                    {uni.tuitionRange.max?.toLocaleString()} {uni.tuitionRange.currency}/yr
                  </p>
                )}

                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-indigo-600">
                  View Details <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ─── Recent Feed Posts ─── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={2}
        className="mt-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-violet-600" />
            Recent Feed Posts
          </h2>
          <Link
            to="/feed"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recentPosts.map((post) => (
            <Link
              key={post.id}
              to={`/feed/${post.id}`}
              className="rounded-xl bg-white border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
                {post.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                {post.authorAvatar && (
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <span className="text-xs text-slate-500">{post.authorName}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    categoryColors[post.category] || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {post.category?.replace(/-/g, ' ')}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Heart className="w-3 h-3" /> {post.upvotes}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ─── Your Enquiries + Budget Overview ─── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enquiries */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-600" />
              Your Enquiries
            </h2>
          </div>

          {enquiries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                    <th className="pb-2 font-medium">To</th>
                    <th className="pb-2 font-medium">Sent</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {enquiries.slice(0, 5).map((lead) => (
                    <tr key={lead.id}>
                      <td className="py-2.5 text-slate-900 font-medium">
                        {lead.target?.name || 'N/A'}
                        {lead.targetRole ? (
                          <span className="ml-1 text-xs text-slate-400 capitalize">
                            · {lead.targetRole}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2.5 text-slate-500">
                        {lead.createdAt
                          ? new Date(lead.createdAt).toLocaleDateString('en-AU', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${
                            leadStatusConfig[lead.status] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {lead.status || 'new'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-3">No enquiries yet</p>
              <Link
                to="/universities"
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Browse Universities <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </motion.div>

        {/* Budget Overview */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-violet-600" />
            Budget Overview
          </h2>

          <div className="rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 p-4 mb-4">
            <p className="text-sm text-slate-600">Your budget range</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              ${budgetMin.toLocaleString()} &ndash; ${budgetMax.toLocaleString()}{' '}
              <span className="text-sm font-normal text-slate-500">AUD / year</span>
            </p>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-full bg-emerald-100 p-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-emerald-600">{universitiesInBudget.length}</span>{' '}
              {universitiesInBudget.length === 1 ? 'university' : 'universities'} within your budget
            </p>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {universitiesInBudget.slice(0, 5).map((uni) => (
              <Link
                key={uni.id}
                to={`/universities/${uni.id}`}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={uni.logo}
                    alt={uni.name}
                    className="w-7 h-7 rounded object-cover"
                  />
                  <span className="font-medium text-slate-900 truncate">{uni.shortName || uni.name}</span>
                </div>
                <span className="text-xs text-slate-500 shrink-0 ml-2">
                  ${uni.tuitionRange?.min?.toLocaleString()}&ndash;${uni.tuitionRange?.max?.toLocaleString()}
                </span>
              </Link>
            ))}
            {universitiesInBudget.length > 5 && (
              <Link
                to="/universities"
                className="block text-center text-xs text-indigo-600 font-medium pt-1"
              >
                +{universitiesInBudget.length - 5} more
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      {/* ─── Quick Actions ─── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={5}
        className="mt-6"
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.to}
                className="group rounded-xl bg-white border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div
                  className={`w-11 h-11 rounded-full ${action.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium text-slate-900 text-sm">{action.label}</p>
                <ArrowRight className="w-4 h-4 text-slate-400 mt-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
