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
  BadgeCheck,
  Sparkles,
  ArrowUpDown,
  Globe2,
  Award,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  DollarSign,
  UserCheck,
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
];

const LANGUAGES = ['English', 'Mandarin', 'Hindi', 'Arabic', 'French', 'Vietnamese', 'Thai', 'Nepali', 'Tamil', 'Gujarati', 'Cantonese', 'German'];

const SPECIALISATIONS_CONSULTANTS = [
  'Postgraduate Research',
  'PhD Applications',
  'Scholarship Strategy',
  'Student Visa Strategy',
  'Migration Pathways',
  'Undergraduate Admissions',
  'Pathway Programs',
  'English Language',
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'experience', label: 'Experience' },
  { value: 'students', label: 'Students Helped' },
  { value: 'name', label: 'Name' },
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

function ConsultantCard({ consultant, index }) {
  const isPremium = consultant.tier === 'premium';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isPremium ? 'ring-2 ring-accent-500/20' : 'border border-slate-200'
      }`}
    >
      {isPremium && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent-500 to-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          <Sparkles size={12} />
          Premium
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <img
            src={consultant.avatar}
            alt={consultant.name}
            className="h-16 w-16 rounded-full border-2 border-slate-100 object-cover shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                {consultant.name}
              </h3>
              {consultant.verified && <BadgeCheck size={18} className="flex-shrink-0 text-primary-500" />}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin size={14} />
              {consultant.location}
            </div>
          </div>
        </div>

        {/* Qualifications */}
        <div className="mt-3">
          {consultant.qualifications.slice(0, 2).map((qual) => (
            <div key={qual} className="flex items-start gap-1.5 text-xs text-slate-600">
              <Award size={12} className="mt-0.5 flex-shrink-0 text-accent-500" />
              {qual}
            </div>
          ))}
        </div>

        {/* Specialisation tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {consultant.specialisations.map((spec) => (
            <span
              key={spec}
              className="rounded-full bg-accent-50 px-2.5 py-0.5 text-[11px] font-medium text-accent-700"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Languages */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {consultant.languages.map((lang) => (
            <span
              key={lang}
              className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700"
            >
              {lang}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Clock size={13} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-800">{consultant.yearsExperience}</span>
            </div>
            <p className="text-[10px] text-slate-500">Years Exp.</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Users size={13} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-800">{consultant.studentsAssisted}</span>
            </div>
            <p className="text-[10px] text-slate-500">Assisted</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp size={13} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-800">{consultant.successRate}%</span>
            </div>
            <p className="text-[10px] text-slate-500">Success</p>
          </div>
        </div>

        {/* Hourly rate + Rating */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StarRating rating={consultant.rating} />
            <span className="text-sm font-semibold text-slate-700">{consultant.rating}</span>
            <span className="text-xs text-slate-400">({consultant.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1">
            <DollarSign size={14} className="text-emerald-600" />
            <span className="text-sm font-bold text-emerald-700">{consultant.hourlyRate}</span>
            <span className="text-[10px] text-emerald-600">/hr</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link
            to={`/consultants/${consultant.id}`}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            View Profile
          </Link>
          <Link
            to={`/consultants/${consultant.id}?book=true`}
            className="flex-1 gradient-primary rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition-all hover:shadow-lg hover:brightness-110"
          >
            Book Consultation
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Consultants() {
  const { data: consultantData } = useApiResource(
    () => directoryApi.listConsultants({ limit: 60 }),
    []
  );
  const consultants = (consultantData?.items || []).map(normaliseDirectoryItem);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedSpecialisations, setSelectedSpecialisations] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [expandedSections, setExpandedSections] = useState({
    location: true,
    specialisation: true,
    language: true,
    rating: true,
  });

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleLocation = (loc) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const toggleSpecialisation = (spec) => {
    setSelectedSpecialisations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLocations([]);
    setSelectedSpecialisations([]);
    setSelectedLanguages([]);
    setMinRating('');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedLocations.length > 0 ||
    selectedSpecialisations.length > 0 ||
    selectedLanguages.length > 0 ||
    minRating;

  // Filtered consultants
  const filteredConsultants = useMemo(() => {
    let result = consultants.filter((c) => c.status === 'active');

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }
    if (selectedLocations.length > 0) {
      result = result.filter((c) => selectedLocations.includes(c.location));
    }
    if (selectedSpecialisations.length > 0) {
      result = result.filter((c) =>
        selectedSpecialisations.some((s) =>
          c.specialisations.some((sp) => sp.toLowerCase().includes(s.toLowerCase()))
        )
      );
    }
    if (selectedLanguages.length > 0) {
      result = result.filter((c) =>
        selectedLanguages.some((l) => c.languages.includes(l))
      );
    }
    if (minRating) {
      result = result.filter((c) => c.rating >= parseFloat(minRating));
    }

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'experience':
        result.sort((a, b) => b.yearsExperience - a.yearsExperience);
        break;
      case 'students':
        result.sort((a, b) => (b.studentsAssisted || 0) - (a.studentsAssisted || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    result.sort((a, b) => {
      if (a.tier === 'premium' && b.tier !== 'premium') return -1;
      if (a.tier !== 'premium' && b.tier === 'premium') return 1;
      return 0;
    });

    return result;
  }, [consultants, searchQuery, selectedLocations, selectedSpecialisations, selectedLanguages, minRating, sortBy]);

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

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search consultants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>

        {/* Location */}
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

        {/* Specialisation */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <button
            onClick={() => toggleSection('specialisation')}
            className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
          >
            Specialisation
            {expandedSections.specialisation ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {expandedSections.specialisation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  {SPECIALISATIONS_CONSULTANTS.map((spec) => (
                    <label
                      key={spec}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSpecialisations.includes(spec)}
                        onChange={() => toggleSpecialisation(spec)}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 accent-primary-600 focus:ring-primary-500"
                      />
                      {spec}
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Languages */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <button
            onClick={() => toggleSection('language')}
            className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
          >
            Languages
            {expandedSections.language ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {expandedSections.language && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <label
                      key={lang}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(lang)}
                        onChange={() => toggleLanguage(lang)}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 accent-primary-600 focus:ring-primary-500"
                      />
                      {lang}
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rating */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <button
            onClick={() => toggleSection('rating')}
            className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
          >
            Minimum Rating
            {expandedSections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {expandedSections.rating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex gap-2">
                  {[4, 4.5, 4.8].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(minRating === String(r) ? '' : String(r))}
                      className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        minRating === String(r)
                          ? 'bg-primary-600 text-white'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Star size={12} className={minRating === String(r) ? 'fill-white' : 'fill-amber-400 text-amber-400'} />
                      {r}+
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative mt-16 overflow-hidden bg-gradient-to-br from-accent-700 via-accent-600 to-orange-600"
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
              <UserCheck size={16} />
              {consultants.filter((c) => c.status === 'active').length} Verified Consultants
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Connect with Expert
              <br />
              <span className="text-orange-200">Education Consultants</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
              Find verified education consultants to guide you through visa applications, university admissions, and career pathways in Australia.
            </p>

            {/* Hero search */}
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search consultants by name, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border-0 bg-white py-4 pl-12 pr-6 text-base text-slate-800 shadow-2xl outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-accent-300/30"
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
            </button>
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-800">{filteredConsultants.length}</span>{' '}
              consultants
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

          {/* Cards grid */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key="consultants"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {filteredConsultants.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-20 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <UserCheck size={28} className="text-slate-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-800">No consultants found</h3>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                      Try adjusting your filters to find what you are looking for.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                    {filteredConsultants.map((consultant, index) => (
                      <ConsultantCard key={consultant.id} consultant={consultant} index={index} />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
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
