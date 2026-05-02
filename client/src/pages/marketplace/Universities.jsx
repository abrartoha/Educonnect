import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  MapPin,
  Users,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  Sparkles,
  ArrowUpDown,
  Globe,
  BookOpen,
} from 'lucide-react';
import { directoryApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem } from '../../api/mappers';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const LOCATIONS = [
  'Melbourne, VIC',
  'Sydney, NSW',
  'Brisbane, QLD',
  'Canberra, ACT',
  'Perth, WA',
  'Adelaide, SA',
  'Hobart, TAS',
];

const COURSE_FIELDS = [
  'Business',
  'Engineering',
  'IT',
  'Medicine',
  'Science',
  'Law',
  'Arts',
  'Education',
  'Design',
  'Architecture',
];

const SORT_OPTIONS = [
  { value: 'ranking', label: 'Ranking' },
  { value: 'rating', label: 'Rating' },
  { value: 'name', label: 'Name' },
  { value: 'newest', label: 'Newest' },
];

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

function UniversityCard({ university, index }) {
  const isPremium = university.tier === 'premium';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isPremium ? 'ring-2 ring-primary-500/20' : 'border border-slate-200'
      }`}
    >
      {/* Premium badge */}
      {isPremium && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          <Sparkles size={12} />
          Featured
        </div>
      )}

      {/* Cover image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={university.coverImage}
          alt={university.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Ranking badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-white/90 backdrop-blur-sm px-2.5 py-1.5 shadow-sm">
          <span className="text-xs font-medium text-slate-500">#{university.ranking}</span>
          <span className="text-[10px] text-slate-400">{university.rankingBody}</span>
        </div>
      </div>

      {/* Logo overlay */}
      <div className="relative px-5 pb-5">
        <div className="-mt-8 mb-3 flex items-end gap-3">
          <img
            src={university.logo}
            alt={university.shortName}
            className="h-16 w-16 rounded-xl border-4 border-white bg-white object-cover shadow-md"
          />
          <div className="mb-1 flex items-center gap-1.5">
            {university.verified && (
              <BadgeCheck size={18} className="text-primary-500" />
            )}
          </div>
        </div>

        {/* Name and location */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
          {university.name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin size={14} />
          {university.location}
        </div>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">
          <StarRating rating={university.rating} />
          <span className="text-sm font-semibold text-slate-700">{university.rating}</span>
          <span className="text-xs text-slate-400">({university.reviewCount} reviews)</span>
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users size={13} className="text-slate-400" />
            <span>{(university.studentCount / 1000).toFixed(0)}k Students</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Globe size={13} className="text-slate-400" />
            <span>{(university.internationalStudents / 1000).toFixed(0)}k International</span>
          </div>
        </div>

        {/* Course tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {university.courses.slice(0, 4).map((course) => (
            <span
              key={course}
              className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-medium text-primary-700"
            >
              {course}
            </span>
          ))}
          {university.courses.length > 4 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
              +{university.courses.length - 4} more
            </span>
          )}
        </div>

        {/* Tuition */}
        <div className="mt-3 flex items-center gap-1 text-sm">
          <span className="text-slate-500">Tuition:</span>
          <span className="font-semibold text-slate-800">
            ${university.tuitionRange.min.toLocaleString()} - ${university.tuitionRange.max.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">{university.tuitionRange.currency}/yr</span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link
            to={`/universities/${university.id}`}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-center text-xs font-semibold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            View Details
          </Link>
          <Link
            to={`/compare?ids=${university.id}`}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-center text-xs font-semibold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
            aria-label="Add to comparison"
          >
            ⇄ Compare
          </Link>
          <Link
            to={`/universities/${university.id}?enquire=true`}
            className="flex-1 gradient-primary rounded-lg px-3 py-2.5 text-center text-xs font-semibold text-white shadow-md shadow-primary-500/25 transition-all hover:shadow-lg hover:brightness-110"
          >
            Enquire
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Universities() {
  const { data: uniData } = useApiResource(
    () => directoryApi.listUniversities({ limit: 60 }),
    []
  );
  const universities = (uniData?.items || []).map(normaliseDirectoryItem);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [tuitionMin, setTuitionMin] = useState('');
  const [tuitionMax, setTuitionMax] = useState('');
  const [rankingMax, setRankingMax] = useState('');
  const [sortBy, setSortBy] = useState('ranking');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Collapsible filter sections
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    courses: true,
    tuition: true,
    ranking: true,
  });

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleLocation = (loc) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const toggleCourse = (course) => {
    setSelectedCourses((prev) =>
      prev.includes(course) ? prev.filter((c) => c !== course) : [...prev, course]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLocations([]);
    setSelectedCourses([]);
    setTuitionMin('');
    setTuitionMax('');
    setRankingMax('');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedLocations.length > 0 ||
    selectedCourses.length > 0 ||
    tuitionMin ||
    tuitionMax ||
    rankingMax;

  // Filtered and sorted universities
  const filteredUniversities = useMemo(() => {
    let result = universities.filter((u) => u.status === 'active');

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.shortName?.toLowerCase().includes(q) ||
          u.location.toLowerCase().includes(q)
      );
    }

    // Location filter
    if (selectedLocations.length > 0) {
      result = result.filter((u) => selectedLocations.includes(u.location));
    }

    // Course filter
    if (selectedCourses.length > 0) {
      result = result.filter((u) =>
        selectedCourses.some((course) =>
          u.courses.some((c) => c.toLowerCase().includes(course.toLowerCase()))
        )
      );
    }

    // Tuition filter
    if (tuitionMin) {
      result = result.filter((u) => u.tuitionRange.max >= parseInt(tuitionMin));
    }
    if (tuitionMax) {
      result = result.filter((u) => u.tuitionRange.min <= parseInt(tuitionMax));
    }

    // Ranking filter
    if (rankingMax) {
      result = result.filter((u) => u.ranking <= parseInt(rankingMax));
    }

    // Sort
    switch (sortBy) {
      case 'ranking':
        result.sort((a, b) => a.ranking - b.ranking);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    // Premium universities first
    result.sort((a, b) => {
      if (a.tier === 'premium' && b.tier !== 'premium') return -1;
      if (a.tier !== 'premium' && b.tier === 'premium') return 1;
      return 0;
    });

    return result;
  }, [universities, searchQuery, selectedLocations, selectedCourses, tuitionMin, tuitionMax, rankingMax, sortBy]);

  const FilterSidebar = ({ isMobile = false }) => (
    <div className={isMobile ? '' : 'sticky top-24'}>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Search by name */}
        <div className="mt-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>

        {/* Location filter */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <button
            onClick={() => toggleSection('location')}
            className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
          >
            Location
            {expandedSections.location ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {expandedSections.location && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  {LOCATIONS.map((loc) => (
                    <label
                      key={loc}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(loc)}
                        onChange={() => toggleLocation(loc)}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 accent-primary-600 focus:ring-primary-500"
                      />
                      {loc}
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Course field filter */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <button
            onClick={() => toggleSection('courses')}
            className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
          >
            Course Field
            {expandedSections.courses ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {expandedSections.courses && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  {COURSE_FIELDS.map((field) => (
                    <label
                      key={field}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(field)}
                        onChange={() => toggleCourse(field)}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 accent-primary-600 focus:ring-primary-500"
                      />
                      {field}
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tuition range */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <button
            onClick={() => toggleSection('tuition')}
            className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
          >
            Tuition Range (AUD)
            {expandedSections.tuition ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {expandedSections.tuition && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={tuitionMin}
                    onChange={(e) => setTuitionMin(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={tuitionMax}
                    onChange={(e) => setTuitionMax(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ranking filter */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <button
            onClick={() => toggleSection('ranking')}
            className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
          >
            Max Ranking
            {expandedSections.ranking ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {expandedSections.ranking && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3">
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={rankingMax}
                    onChange={(e) => setRankingMax(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                  <p className="mt-1.5 text-xs text-slate-400">Show universities ranked up to this number</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero banner */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative mt-16 overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-purple-900"
      >
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm">
              <GraduationCap size={16} />
              {universities.filter((u) => u.status === 'active').length} Universities Listed
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Find Your Perfect University
              <br />
              <span className="text-primary-300">in Australia</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
              Explore top-ranked Australian universities, compare programs, and connect directly with admissions teams.
            </p>

            {/* Hero search bar */}
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search universities by name, location, or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border-0 bg-white py-4 pl-12 pr-6 text-base text-slate-800 shadow-2xl outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-primary-300/30"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Main content */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 lg:hidden"
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                  {selectedLocations.length + selectedCourses.length + (tuitionMin ? 1 : 0) + (tuitionMax ? 1 : 0) + (rankingMax ? 1 : 0)}
                </span>
              )}
            </button>
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-800">{filteredUniversities.length}</span> universities
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-slate-400" />
            <span className="text-sm text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-72 flex-shrink-0 lg:block">
            <FilterSidebar />
          </aside>

          {/* University grid */}
          <div className="flex-1">
            {filteredUniversities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-20 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <BookOpen size={28} className="text-slate-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">No universities found</h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Try adjusting your filters or search terms to find what you are looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                {filteredUniversities.map((uni, index) => (
                  <UniversityCard key={uni.id} university={uni} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-slate-50 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4">
                <FilterSidebar isMobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
