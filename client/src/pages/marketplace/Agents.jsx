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
  Building2,
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

const SPECIALISATIONS_AGENTS = [
  'South Asia',
  'Southeast Asia',
  'Middle East',
  'Africa',
  'India',
  'Higher Education',
  'Vocational Education',
  'IT & Engineering',
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

function AgentCard({ agent, index }) {
  const isPremium = agent.tier === 'premium';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isPremium ? 'ring-2 ring-primary-500/20' : 'border border-slate-200'
      }`}
    >
      {isPremium && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          <Sparkles size={12} />
          Premium
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <img
            src={agent.logo}
            alt={agent.name}
            className="h-16 w-16 rounded-xl border border-slate-100 object-cover shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                {agent.name}
              </h3>
              {agent.verified && <BadgeCheck size={18} className="flex-shrink-0 text-primary-500" />}
            </div>
            <p className="text-sm text-slate-600">{agent.contactPerson}</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin size={14} />
              {agent.location}
            </div>
          </div>
        </div>

        {/* Specialisation tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {agent.specialisations.map((spec) => (
            <span
              key={spec}
              className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-medium text-primary-700"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Language badges */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {agent.languages.map((lang) => (
            <span
              key={lang}
              className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700"
            >
              {lang}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Clock size={13} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-800">{agent.yearsExperience}</span>
            </div>
            <p className="text-[10px] text-slate-500">Years Exp.</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Users size={13} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-800">{agent.studentsPlaced.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-slate-500">Students</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp size={13} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-800">{agent.successRate}%</span>
            </div>
            <p className="text-[10px] text-slate-500">Success</p>
          </div>
        </div>

        {/* Rating */}
        <div className="mt-4 flex items-center gap-2">
          <StarRating rating={agent.rating} />
          <span className="text-sm font-semibold text-slate-700">{agent.rating}</span>
          <span className="text-xs text-slate-400">({agent.reviewCount} reviews)</span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link
            to={`/agents/${agent.id}`}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            View Profile
          </Link>
          <Link
            to={`/agents/${agent.id}?book=true`}
            className="flex-1 gradient-primary rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition-all hover:shadow-lg hover:brightness-110"
          >
            Book Consultation
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Agents() {
  const { data: agentData } = useApiResource(
    () => directoryApi.listAgents({ limit: 60 }),
    []
  );
  const agents = (agentData?.items || []).map(normaliseDirectoryItem);

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

  // Filtered agents
  const filteredAgents = useMemo(() => {
    let result = agents.filter((a) => a.status === 'active');

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.contactPerson?.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q)
      );
    }
    if (selectedLocations.length > 0) {
      result = result.filter((a) => selectedLocations.includes(a.location));
    }
    if (selectedSpecialisations.length > 0) {
      result = result.filter((a) =>
        selectedSpecialisations.some((s) =>
          a.specialisations.some((sp) => sp.toLowerCase().includes(s.toLowerCase()))
        )
      );
    }
    if (selectedLanguages.length > 0) {
      result = result.filter((a) =>
        selectedLanguages.some((l) => a.languages.includes(l))
      );
    }
    if (minRating) {
      result = result.filter((a) => a.rating >= parseFloat(minRating));
    }

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'experience':
        result.sort((a, b) => b.yearsExperience - a.yearsExperience);
        break;
      case 'students':
        result.sort((a, b) => b.studentsPlaced - a.studentsPlaced);
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
  }, [agents, searchQuery, selectedLocations, selectedSpecialisations, selectedLanguages, minRating, sortBy]);

  const currentCount = filteredAgents.length;

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
              placeholder="Search agents..."
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
                  {SPECIALISATIONS_AGENTS.map((spec) => (
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
              <Users size={16} />
              {agents.filter((a) => a.status === 'active').length} Verified Agents
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Connect with Trusted
              <br />
              <span className="text-primary-300">Education Agents</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
              Find experienced, verified education agents to guide your Australian education journey.
            </p>

            {/* Hero search */}
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search agents by name, location..."
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
            </button>
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-800">{currentCount}</span>{' '}
              agents
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
            {filteredAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Users size={28} className="text-slate-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">No agents found</h3>
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
                {filteredAgents.map((agent, index) => (
                  <AgentCard key={agent.id} agent={agent} index={index} />
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
