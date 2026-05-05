import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Globe,
  Phone,
  Mail,
  Star,
  Calendar,
  Users,
  GraduationCap,
  Award,
  Building2,
  ChevronRight,
  X,
  Send,
  BookOpen,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';
import { directoryApi, reviewsApi, leadsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem } from '../../api/mappers';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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
  { id: 'overview', label: 'Overview' },
  { id: 'courses', label: 'Courses' },
  { id: 'fees', label: 'Fees & Scholarships' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'reviews', label: 'Reviews' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function UniversityDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, currentUser } = useStore();

  const { data: uniData } = useApiResource(
    () => (id ? directoryApi.getUniversity(id) : null),
    [id]
  );
  const { data: reviewsData } = useApiResource(
    () => (id ? reviewsApi.listForTarget(id) : null),
    [id]
  );
  const university = uniData?.item ? normaliseDirectoryItem(uniData.item) : null;
  const universityReviews = reviewsData?.items || [];

  const [activeTab, setActiveTab] = useState('overview');
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    course: '',
  });

  // Open enquiry modal if query param is present
  useEffect(() => {
    if (searchParams.get('enquire') === 'true') {
      setShowEnquiryModal(true);
    }
  }, [searchParams]);

  /* ---- Enquiry submit ---- */
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || currentUser?.role !== 'student') {
      toast.error('Please log in as a student to send an enquiry.');
      return;
    }
    try {
      const message = [
        enquiryForm.message,
        enquiryForm.phone ? `Phone: ${enquiryForm.phone}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');
      await leadsApi.create({
        universityId: university.id,
        programme: enquiryForm.course || undefined,
        message: message || 'Enquiry submitted via marketplace page.',
      });
      toast.success('Enquiry submitted! The university will contact you soon.');
      setShowEnquiryModal(false);
      setEnquiryForm({ name: '', email: '', phone: '', message: '', course: '' });
    } catch (err) {
      toast.error(err.message || 'Could not submit enquiry');
    }
  };

  /* ---- Not found state ---- */
  if (!university) {
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
              <Building2 size={36} className="text-slate-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-slate-800">University Not Found</h1>
            <p className="mt-2 text-slate-500 max-w-md">
              The university you are looking for does not exist or has been removed.
            </p>
            <Link
              to="/universities"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <ChevronRight size={16} className="rotate-180" />
              Browse Universities
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ================================================================ */
  /*  Main render                                                      */
  /* ================================================================ */

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* ---------------------------------------------------------- */}
      {/*  Hero Section                                                */}
      {/* ---------------------------------------------------------- */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative mt-16"
      >
        {/* Cover image */}
        <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
          <img
            src={university.coverImage}
            alt={university.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        {/* University info overlay */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="-mt-20 flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Logo */}
            <img
              src={university.logo}
              alt={university.shortName}
              className="h-28 w-28 rounded-2xl border-4 border-white bg-white object-cover shadow-xl"
            />

            {/* Info block */}
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                {university.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                {/* Location */}
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-slate-400" />
                  {university.location}
                </span>

                {/* Ranking badge */}
                <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-0.5 font-semibold text-amber-700">
                  #{university.ranking} {university.rankingBody}
                </span>

                {/* Rating stars */}
                <span className="flex items-center gap-1.5">
                  <StarRating rating={university.rating} />
                  <span className="font-semibold text-slate-700">{university.rating}</span>
                  <span className="text-slate-400">({university.reviewCount} reviews)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ---------------------------------------------------------- */}
      {/*  Tab Navigation                                              */}
      {/* ---------------------------------------------------------- */}
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
                  <span className="ml-1.5 text-xs text-slate-400">
                    ({universityReviews.length})
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="uniDetailTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  Main Content Area                                           */}
      {/* ---------------------------------------------------------- */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ====== Left: Tab content ====== */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {/* ---------- Overview Tab ---------- */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Description */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">
                      About {university.name}
                    </h2>
                    <p className="mt-3 leading-relaxed text-slate-600">
                      {university.description}
                    </p>
                  </div>

                  {/* Key Facts Grid */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Key Facts</h2>
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="rounded-lg bg-primary-50 p-4 text-center">
                        <Calendar size={22} className="mx-auto text-primary-600" />
                        <p className="mt-2 text-2xl font-bold text-slate-800">
                          {university.established}
                        </p>
                        <p className="text-xs text-slate-500">Established</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-4 text-center">
                        <Building2 size={22} className="mx-auto text-emerald-600" />
                        <p className="mt-2 text-sm font-bold text-slate-800">
                          {university.type}
                        </p>
                        <p className="text-xs text-slate-500">Institution Type</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-4 text-center">
                        <Users size={22} className="mx-auto text-amber-600" />
                        <p className="mt-2 text-2xl font-bold text-slate-800">
                          {(university.studentCount / 1000).toFixed(0)}k
                        </p>
                        <p className="text-xs text-slate-500">Students</p>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-4 text-center">
                        <Globe size={22} className="mx-auto text-purple-600" />
                        <p className="mt-2 text-2xl font-bold text-slate-800">
                          {(university.internationalStudents / 1000).toFixed(0)}k
                        </p>
                        <p className="text-xs text-slate-500">International</p>
                      </div>
                    </div>
                  </div>

                  {/* Accreditations */}
                  {university.accreditations.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2 className="text-xl font-bold text-slate-900">Accreditations</h2>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {university.accreditations.map((acc) => (
                          <div
                            key={acc}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5"
                          >
                            <Award size={16} className="text-primary-500" />
                            <span className="text-sm font-medium text-slate-700">{acc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Intakes */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Intakes</h2>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {university.intakes.map((intake) => (
                        <div
                          key={intake}
                          className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2"
                        >
                          <Calendar size={14} className="text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">{intake}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ---------- Courses Tab ---------- */}
              {activeTab === 'courses' && (
                <motion.div
                  key="courses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Available Courses</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {university.courses.length} course areas available
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {university.courses.map((course, index) => (
                        <motion.div
                          key={course}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-primary-200 hover:bg-primary-50"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                            <BookOpen size={18} className="text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{course}</p>
                            <p className="text-xs text-slate-500">Multiple programs available</p>
                          </div>
                          <ChevronRight size={16} className="flex-shrink-0 text-slate-400" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ---------- Fees & Scholarships Tab ---------- */}
              {activeTab === 'fees' && (
                <motion.div
                  key="fees"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Tuition Range */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Tuition Fees</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Annual tuition fee range for international students
                    </p>

                    <div className="mt-6 rounded-xl bg-gradient-to-br from-primary-50 to-purple-50 p-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DollarSign size={16} className="text-primary-500" />
                        <span>Annual Tuition Range ({university.tuitionRange.currency})</span>
                      </div>
                      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <div className="text-center">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            From
                          </p>
                          <p className="mt-1 text-3xl font-extrabold text-primary-700">
                            ${university.tuitionRange.min.toLocaleString()}
                          </p>
                        </div>
                        <div className="hidden sm:block text-2xl text-slate-300">-</div>
                        <div className="text-center">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            To
                          </p>
                          <p className="mt-1 text-3xl font-extrabold text-primary-700">
                            ${university.tuitionRange.max.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center sm:ml-4">
                          <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
                            {university.tuitionRange.currency}/year
                          </span>
                        </div>
                      </div>
                      <p className="mt-4 text-center text-xs text-slate-500">
                        Fees vary by course and program level. Contact admissions for exact figures.
                      </p>
                    </div>
                  </div>

                  {/* Scholarships */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Scholarships</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {university.scholarships.length} scholarship
                      {university.scholarships.length !== 1 ? 's' : ''} available for eligible
                      students
                    </p>

                    {university.scholarships.length === 0 ? (
                      <div className="mt-8 text-center py-8">
                        <GraduationCap size={36} className="mx-auto text-slate-200" />
                        <p className="mt-3 text-sm text-slate-500">
                          No scholarships listed at this time. Contact the university for the latest
                          opportunities.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-6 space-y-3">
                        {university.scholarships.map((scholarship, index) => (
                          <motion.div
                            key={scholarship}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                              <Award size={18} className="text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800">{scholarship}</p>
                              <p className="text-xs text-slate-500">
                                Available for eligible international students
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ---------- Facilities Tab ---------- */}
              {activeTab === 'facilities' && (
                <motion.div
                  key="facilities"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Campus Facilities</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {university.facilities.length} facilit
                      {university.facilities.length !== 1 ? 'ies' : 'y'} available on campus
                    </p>

                    {university.facilities.length === 0 ? (
                      <div className="mt-8 text-center py-8">
                        <Building2 size={36} className="mx-auto text-slate-200" />
                        <p className="mt-3 text-sm text-slate-500">
                          No facilities listed yet. Check the university website for details.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {university.facilities.map((facility, index) => (
                          <motion.div
                            key={facility}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.06 }}
                            className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4"
                          >
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                              <CheckCircle2 size={18} className="text-emerald-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{facility}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ---------- Reviews Tab ---------- */}
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
                      <h2 className="text-xl font-bold text-slate-900">Student Reviews</h2>
                      <div className="flex items-center gap-2">
                        <StarRating rating={university.rating} size={18} />
                        <span className="text-lg font-bold text-slate-800">
                          {university.rating}
                        </span>
                      </div>
                    </div>

                    {universityReviews.length === 0 ? (
                      <div className="mt-8 text-center py-12">
                        <Star size={40} className="mx-auto text-slate-200" />
                        <p className="mt-4 text-sm text-slate-500">
                          No reviews yet for this university.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-6 space-y-4">
                        {universityReviews.map((review, index) => (
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
                                    .split(' ')
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

          {/* ====== Right Sidebar ====== */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-32 space-y-4">
              {/* Quick info card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Quick Info
                </h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin size={16} className="flex-shrink-0 text-slate-400" />
                    <span>{university.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone size={16} className="flex-shrink-0 text-slate-400" />
                    <span>{university.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail size={16} className="flex-shrink-0 text-slate-400" />
                    <span className="truncate">{university.email}</span>
                  </div>
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-primary-600 transition-colors hover:text-primary-800"
                  >
                    <Globe size={16} className="flex-shrink-0" />
                    <span className="truncate">Visit Website</span>
                    <ChevronRight size={14} />
                  </a>
                </div>
              </div>

              {/* Enquire / Book Meeting */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <button
                  onClick={() => setShowEnquiryModal(true)}
                  className="flex w-full items-center justify-center gap-2 gradient-primary rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition-all hover:shadow-lg hover:brightness-110"
                >
                  <Send size={16} />
                  Enquire Now
                </button>
              </div>

              {/* Tuition quick view */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Tuition Range
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-800">
                    ${university.tuitionRange.min.toLocaleString()}
                  </span>
                  <span className="text-slate-400">-</span>
                  <span className="text-2xl font-extrabold text-slate-800">
                    ${university.tuitionRange.max.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {university.tuitionRange.currency} per year
                </p>
              </div>

              {/* Key stats mini card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  At a Glance
                </h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500">
                      <GraduationCap size={15} className="text-slate-400" />
                      Courses
                    </span>
                    <span className="font-semibold text-slate-800">
                      {university.courses.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500">
                      <Users size={15} className="text-slate-400" />
                      Students
                    </span>
                    <span className="font-semibold text-slate-800">
                      {university.studentCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500">
                      <Calendar size={15} className="text-slate-400" />
                      Established
                    </span>
                    <span className="font-semibold text-slate-800">
                      {university.established}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500">
                      <Award size={15} className="text-slate-400" />
                      Ranking
                    </span>
                    <span className="font-semibold text-slate-800">
                      #{university.ranking}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  Enquiry Modal                                               */}
      {/* ---------------------------------------------------------- */}
      <AnimatePresence>
        {showEnquiryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowEnquiryModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Enquire Now</h3>
                  <p className="text-sm text-slate-500">{university.name}</p>
                </div>
                <button
                  onClick={() => setShowEnquiryModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal form */}
              <form onSubmit={handleEnquirySubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.name}
                    onChange={(e) =>
                      setEnquiryForm({ ...enquiryForm, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Email *</label>
                  <input
                    type="email"
                    required
                    value={enquiryForm.email}
                    onChange={(e) =>
                      setEnquiryForm({ ...enquiryForm, email: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    type="tel"
                    value={enquiryForm.phone}
                    onChange={(e) =>
                      setEnquiryForm({ ...enquiryForm, phone: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    placeholder="+61 xxx xxx xxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Interested Course
                  </label>
                  <select
                    value={enquiryForm.course}
                    onChange={(e) =>
                      setEnquiryForm({ ...enquiryForm, course: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">Select a course area</option>
                    {university.courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Message *</label>
                  <textarea
                    required
                    rows={3}
                    value={enquiryForm.message}
                    onChange={(e) =>
                      setEnquiryForm({ ...enquiryForm, message: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none resize-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    placeholder="Tell us about your study plans..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEnquiryModal(false)}
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 gradient-primary rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition-all hover:shadow-lg hover:brightness-110"
                  >
                    <Send size={15} />
                    Submit Enquiry
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
