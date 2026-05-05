import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  MapPin,
  Calendar,
  Users,
  Award,
  Globe,
  Phone,
  Mail,
  Shield,
  CheckCircle2,
  Clock,
  DollarSign,
  Languages,
  Briefcase,
  ArrowLeft,
  BadgeCheck,
  Sparkles,
  TrendingUp,
  Building2,
  MessageSquare,
  Send,
  Share2,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';
import { directoryApi, reviewsApi, leadsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem } from '../../api/mappers';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StarRating({ rating, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-200 text-slate-200'
          }
        />
      ))}
    </div>
  );
}

const TABS = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'reviews', label: 'Reviews' },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AgentDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { isAuthenticated, currentUser } = useStore();

  const pathIsConsultant = location.pathname.startsWith('/consultants');

  // Try the URL-indicated type first; fall back to the other on 404.
  const { data: primaryData } = useApiResource(
    () =>
      id
        ? pathIsConsultant
          ? directoryApi.getConsultant(id).catch(() => null)
          : directoryApi.getAgent(id).catch(() => null)
        : null,
    [id, pathIsConsultant]
  );
  const { data: fallbackData } = useApiResource(
    () =>
      id
        ? pathIsConsultant
          ? directoryApi.getAgent(id).catch(() => null)
          : directoryApi.getConsultant(id).catch(() => null)
        : null,
    [id, pathIsConsultant]
  );
  const raw = primaryData?.item || fallbackData?.item || null;
  const entityType = raw?.agent
    ? 'agent'
    : raw?.consultant
    ? 'consultant'
    : null;
  const entity = raw ? normaliseDirectoryItem(raw) : null;

  const { data: reviewsData } = useApiResource(
    () => (id ? reviewsApi.listForTarget(id) : null),
    [id]
  );
  const entityReviews = reviewsData?.items || [];

  // State
  const [activeTab, setActiveTab] = useState('about');
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  useEffect(() => {
    // ?book=true was the legacy query — keep it working as "open the enquiry".
    if (searchParams.get('enquire') === 'true' || searchParams.get('book') === 'true') {
      setShowEnquiryModal(true);
    }
  }, [searchParams]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const isSelf = currentUser?.id === entity?.id;

  const handleSubmitEnquiry = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || currentUser?.role !== 'student') {
      toast.error('Sign in as a student to send an enquiry');
      return;
    }
    if (enquiryMessage.trim().length < 10) {
      toast.error('Add a bit more detail (at least 10 characters)');
      return;
    }
    setSubmittingEnquiry(true);
    try {
      await leadsApi.create({
        targetId: entity.id,
        message: enquiryMessage.trim(),
      });
      toast.success('Enquiry sent — they will be in touch by email.');
      setShowEnquiryModal(false);
      setEnquiryMessage('');
    } catch (err) {
      const issue = err?.details?.issues?.[0];
      toast.error(issue ? `${issue.path}: ${issue.message}` : err?.message || 'Could not send enquiry');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  // -------------------------------------------------------------------------
  // Not found
  // -------------------------------------------------------------------------
  if (!entity) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex flex-1 items-center justify-center pt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center px-4"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <Users size={36} className="text-slate-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-slate-800">Not Found</h1>
            <p className="mt-2 text-slate-500">
              The agent or consultant you are looking for does not exist or has been removed.
            </p>
            <Link
              to="/agents"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <ArrowLeft size={16} />
              Browse Agents
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------
  const isAgent = entityType === 'agent';
  const isPremium = entity.tier === 'premium';
  const displayImage = isAgent ? entity.logo : entity.avatar;
  const contactPerson = isAgent ? entity.contactPerson : null;
  const studentsCount = isAgent ? entity.studentsPlaced : entity.studentsAssisted;
  const certifications = isAgent ? entity.certifications : entity.qualifications;
  const hourlyRate = !isAgent ? entity.hourlyRate : null;
  const availability = !isAgent ? entity.availability : null;

  // Stats config — 4 stat cards
  const stats = isAgent
    ? [
        { icon: Clock, label: 'Years Experience', value: entity.yearsExperience, color: 'primary' },
        { icon: Users, label: 'Students Placed', value: entity.studentsPlaced?.toLocaleString(), color: 'emerald' },
        { icon: TrendingUp, label: 'Success Rate', value: `${entity.successRate}%`, color: 'amber' },
        { icon: Building2, label: 'Partner Institutions', value: entity.partnerInstitutions, color: 'purple' },
      ]
    : [
        { icon: Clock, label: 'Years Experience', value: entity.yearsExperience, color: 'primary' },
        { icon: Users, label: 'Students Assisted', value: entity.studentsAssisted?.toLocaleString(), color: 'emerald' },
        { icon: TrendingUp, label: 'Success Rate', value: `${entity.successRate}%`, color: 'amber' },
        { icon: DollarSign, label: 'Hourly Rate', value: `$${entity.hourlyRate}`, color: 'purple' },
      ];

  const colorMap = {
    primary: { bg: 'bg-primary-50', icon: 'text-primary-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* ================================================================= */}
      {/* Hero Section                                                       */}
      {/* ================================================================= */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative mt-16 bg-gradient-to-br from-primary-900 via-primary-800 to-purple-900"
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <pattern id="hero-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link
            to={isAgent ? '/agents' : '/agents'}
            className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-sm font-medium text-white/80 transition-all hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to {isAgent ? 'Agents' : 'Consultants'}
          </Link>

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar / Logo */}
            <img
              src={displayImage}
              alt={entity.name}
              className={`h-28 w-28 border-4 border-white/20 object-cover shadow-xl ${
                !isAgent ? 'rounded-full' : 'rounded-2xl'
              }`}
            />

            <div className="text-center sm:text-left">
              {/* Name row */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                  {entity.name}
                </h1>
                {entity.verified && <BadgeCheck size={24} className="text-primary-300" />}
                {isPremium && (
                  <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    <Sparkles size={12} />
                    Premium Partner
                  </span>
                )}
              </div>

              {/* Contact person (agents only) */}
              {contactPerson && (
                <p className="mt-1 text-sm text-white/70">
                  <UserCheck size={14} className="mr-1 inline" />
                  Contact: {contactPerson}
                </p>
              )}

              {/* Meta row */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-white/70 sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} />
                  {entity.location}
                </span>
                {entity.verified && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                    <Shield size={13} />
                    Verified
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <StarRating rating={entity.rating} />
                  <span className="font-semibold text-white">{entity.rating}</span>
                  <span>({entity.reviewCount} reviews)</span>
                </span>
              </div>

              {/* Stat chips */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm"
                    >
                      <Icon size={16} className="text-primary-300" />
                      <div>
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                        <p className="text-[10px] text-white/60">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* Tab Navigation                                                     */}
      {/* ================================================================= */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative whitespace-nowrap px-5 py-4 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-700'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {tab.id === 'reviews' && (
                  <span className="ml-1.5 text-xs text-slate-400">({entityReviews.length})</span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="agentDetailTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Main Content                                                       */}
      {/* ================================================================= */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ---- Left column ---- */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {/* ========== About Tab ========== */}
              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Description */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">About {entity.name}</h2>
                    <p className="mt-3 leading-relaxed text-slate-600">{entity.description}</p>
                  </div>

                  {/* Specialisations */}
                  {entity.specialisations?.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                        <Globe size={20} className="text-primary-500" />
                        Specialisations
                      </h2>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {entity.specialisations.map((spec) => (
                          <span
                            key={spec}
                            className="rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {entity.languages?.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                        <Languages size={20} className="text-emerald-500" />
                        Languages
                      </h2>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {entity.languages.map((lang) => (
                          <span
                            key={lang}
                            className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700"
                          >
                            <Globe size={14} />
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications (agents) / Qualifications (consultants) */}
                  {certifications?.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                        <Award size={20} className="text-amber-500" />
                        {isAgent ? 'Certifications' : 'Qualifications'}
                      </h2>
                      <div className="mt-4 space-y-3">
                        {certifications.map((cert, index) => (
                          <motion.div
                            key={cert}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.06 }}
                            className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100">
                              <Award size={16} className="text-primary-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{cert}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Availability (consultants only) */}
                  {availability && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                        <Calendar size={20} className="text-primary-500" />
                        Availability
                      </h2>
                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                        <Clock size={16} className="text-emerald-500" />
                        {availability}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ========== Services Tab ========== */}
              {activeTab === 'services' && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                      <Briefcase size={20} className="text-primary-500" />
                      Services Offered
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {entity.services?.length || 0} services available
                    </p>

                    {entity.services?.length > 0 ? (
                      <div className="mt-6 space-y-3">
                        {entity.services.map((service, index) => (
                          <motion.div
                            key={service}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.06 }}
                            className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-primary-200 hover:bg-primary-50"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                              <Briefcase size={18} className="text-primary-600" />
                            </div>
                            <p className="flex-1 text-sm font-semibold text-slate-800">{service}</p>
                            <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-500" />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">No services listed yet.</p>
                    )}

                    {/* Consultation rate card for consultants */}
                    {hourlyRate && (
                      <div className="mt-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600">Consultation Rate</p>
                            <div className="mt-1 flex items-baseline gap-1">
                              <span className="text-3xl font-extrabold text-emerald-700">${hourlyRate}</span>
                              <span className="text-sm text-emerald-600">AUD / hour</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowEnquiryModal(true)}
                            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-700 hover:shadow-lg"
                          >
                            Send enquiry
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ========== Reviews Tab ========== */}
              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                        <MessageSquare size={20} className="text-primary-500" />
                        Reviews
                      </h2>
                      <div className="flex items-center gap-2">
                        <StarRating rating={entity.rating} size={18} />
                        <span className="text-lg font-bold text-slate-800">{entity.rating}</span>
                      </div>
                    </div>

                    {entityReviews.length === 0 ? (
                      <div className="mt-8 text-center py-12">
                        <MessageSquare size={40} className="mx-auto text-slate-200" />
                        <p className="mt-4 text-sm text-slate-500">No reviews yet.</p>
                      </div>
                    ) : (
                      <div className="mt-6 space-y-4">
                        {entityReviews.map((review, index) => (
                          <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                                  {review.studentName
                                    ?.split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {review.studentName}
                                  </p>
                                  <p className="text-xs text-slate-400">{review.date}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <StarRating rating={review.rating} size={14} />
                                {review.verified && (
                                  <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                              {review.comment}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ---- Right sidebar ---- */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-32 space-y-4">
              {/* Contact card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Contact Information
                </h3>
                <div className="mt-4 space-y-3">
                  {contactPerson && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                        <UserCheck size={16} className="text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">Contact Person</p>
                        <p className="font-medium text-slate-700">{contactPerson}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
                      <Mail size={16} className="text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="truncate font-medium text-slate-700">{entity.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                      <Phone size={16} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Phone</p>
                      <p className="font-medium text-slate-700">{entity.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                      <MapPin size={16} className="text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Location</p>
                      <p className="font-medium text-slate-700">{entity.location}</p>
                    </div>
                  </div>
                  {availability && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                        <Calendar size={16} className="text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">Availability</p>
                        <p className="font-medium text-slate-700">{availability}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
              >
                <button
                  onClick={() => !isSelf && setShowEnquiryModal(true)}
                  disabled={isSelf}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  <Send size={16} />
                  {isSelf ? 'This is your profile' : 'Send enquiry'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Share2 size={16} />
                  Share Profile
                </button>
              </motion.div>

              {/* Certifications / Credentials quick view */}
              {certifications?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    {isAgent ? 'Certifications' : 'Credentials'}
                  </h3>
                  <div className="mt-3 space-y-2">
                    {certifications.slice(0, 3).map((cert) => (
                      <div
                        key={cert}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <Award size={14} className="flex-shrink-0 text-primary-500" />
                        <span>{cert}</span>
                      </div>
                    ))}
                    {certifications.length > 3 && (
                      <button
                        onClick={() => setActiveTab('about')}
                        className="text-xs font-medium text-primary-600 hover:text-primary-700"
                      >
                        +{certifications.length - 3} more
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer />

      {/* Enquiry modal — sends a Lead which the server emails to the target. */}
      <AnimatePresence>
        {showEnquiryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submittingEnquiry && setShowEnquiryModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                    <Send size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Send enquiry</h3>
                    <p className="text-sm text-slate-500">to {entity.name}</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmitEnquiry} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Your message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    minLength={10}
                    maxLength={2000}
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    placeholder="Tell them what you're looking for, your timeline, and any specific questions…"
                    className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Sent as an email to {entity.name}. They'll reply directly to your inbox.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEnquiryModal(false)}
                    disabled={submittingEnquiry}
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEnquiry}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <Send size={16} />
                    {submittingEnquiry ? 'Sending…' : 'Send enquiry'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
