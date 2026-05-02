import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  Award,
  DollarSign,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem } from '../../api/mappers';

const ITEMS_PER_PAGE = 8;

const emptyForm = {
  name: '',
  shortName: '',
  email: '',
  phone: '',
  location: '',
  type: '',
  description: '',
  website: '',
  ranking: '',
  rankingBody: '',
  established: '',
  tuitionMin: '',
  tuitionMax: '',
  coursesInput: '',
  scholarshipsInput: '',
  intakes: [],
  tier: 'basic',
};

const intakeOptions = ['February', 'July', 'August', 'October'];

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
};

function StatusBadge({ status }) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    suspended: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

function TierBadge({ tier }) {
  const styles = {
    premium: 'bg-violet-50 text-violet-700 border-violet-200',
    standard: 'bg-blue-50 text-blue-700 border-blue-200',
    basic: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles[tier] || styles.basic}`}>
      {tier}
    </span>
  );
}

function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState('');

  const tags = value || [];

  const addTags = () => {
    if (!input.trim()) return;
    const newTags = input
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t && !tags.includes(t));
    if (newTags.length > 0) {
      onChange([...tags, ...newTags]);
    }
    setInput('');
  };

  const removeTag = (idx) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTags();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
        />
        <button
          type="button"
          onClick={addTags}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="hover:text-indigo-900 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ManageUniversities() {
  const location = useLocation();
  const { data: usersData, refetch } = useApiResource(
    () => adminApi.listUsers({ role: 'UNIVERSITY', limit: 100 }),
    []
  );
  const universities = (usersData?.items || []).map(normaliseDirectoryItem);

  const notSupported = () =>
    toast.error(
      'Universities create their own accounts via /signup. Admins can approve or suspend them here.'
    );
  const addUniversity = notSupported;
  const updateUniversity = notSupported;
  const deleteUniversity = notSupported;
  const approveEntity = async (_type, id) => {
    await adminApi.approve(id);
    refetch();
  };
  const suspendEntity = async (_type, id) => {
    await adminApi.suspend(id);
    refetch();
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingUni, setEditingUni] = useState(null);
  const [deletingUni, setDeletingUni] = useState(null);
  const [viewingUni, setViewingUni] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Open add modal from dashboard quick action
  useEffect(() => {
    if (location.state?.openAdd) {
      handleAdd();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const locations = useMemo(() => {
    const locs = [...new Set(universities.map((u) => u.location))];
    return locs.sort();
  }, [universities]);

  const filtered = useMemo(() => {
    return universities.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchTier = tierFilter === 'all' || u.tier === tierFilter;
      const matchLocation = locationFilter === 'all' || u.location === locationFilter;
      return matchSearch && matchStatus && matchTier && matchLocation;
    });
  }, [universities, searchTerm, statusFilter, tierFilter, locationFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tierFilter, locationFilter]);

  const handleAdd = () => {
    setEditingUni(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (uni) => {
    setEditingUni(uni);
    setForm({
      name: uni.name || '',
      shortName: uni.shortName || '',
      email: uni.email || '',
      phone: uni.phone || '',
      location: uni.location || '',
      type: uni.type || '',
      description: uni.description || '',
      website: uni.website || '',
      ranking: uni.ranking || '',
      rankingBody: uni.rankingBody || '',
      established: uni.established || '',
      tuitionMin: uni.tuitionRange?.min || '',
      tuitionMax: uni.tuitionRange?.max || '',
      courses: uni.courses || [],
      scholarships: uni.scholarships || [],
      intakes: uni.intakes || [],
      tier: uni.tier || 'basic',
    });
    setShowModal(true);
  };

  const handleView = (uni) => {
    setViewingUni(uni);
    setShowViewModal(true);
  };

  const handleDelete = (uni) => {
    setDeletingUni(uni);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingUni) {
      deleteUniversity(deletingUni.id);
      toast.success(`"${deletingUni.name}" has been deleted.`);
      setShowDeleteModal(false);
      setDeletingUni(null);
    }
  };

  const handleToggleStatus = (uni) => {
    if (uni.status === 'active') {
      suspendEntity('university', uni.id);
      toast.success(`"${uni.name}" has been suspended.`);
    } else {
      approveEntity('university', uni.id);
      toast.success(`"${uni.name}" has been approved.`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('University name is required.');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Email is required.');
      return;
    }

    const data = {
      name: form.name,
      shortName: form.shortName,
      email: form.email,
      phone: form.phone,
      location: form.location,
      type: form.type,
      description: form.description,
      website: form.website,
      ranking: form.ranking ? parseInt(form.ranking) : null,
      rankingBody: form.rankingBody,
      established: form.established ? parseInt(form.established) : null,
      tuitionRange: {
        min: form.tuitionMin ? parseInt(form.tuitionMin) : 0,
        max: form.tuitionMax ? parseInt(form.tuitionMax) : 0,
        currency: 'AUD',
      },
      courses: form.courses || [],
      scholarships: form.scholarships || [],
      intakes: form.intakes || [],
      tier: form.tier,
    };

    if (editingUni) {
      updateUniversity(editingUni.id, data);
      toast.success(`"${form.name}" has been updated.`);
    } else {
      addUniversity(data);
      toast.success(`"${form.name}" has been added.`);
    }

    setShowModal(false);
    setEditingUni(null);
    setForm(emptyForm);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleIntake = (intake) => {
    setForm((prev) => ({
      ...prev,
      intakes: prev.intakes.includes(intake)
        ? prev.intakes.filter((i) => i !== intake)
        : [...prev.intakes, intake],
    }));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-xl">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
              Manage Universities
            </h1>
            <p className="text-slate-500 mt-1">
              {filtered.length} universit{filtered.length === 1 ? 'y' : 'ies'} found
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm shadow-indigo-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add University
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm outline-none transition-all"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-3 py-2.5 text-sm outline-none transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-3 py-2.5 text-sm outline-none transition-all"
              >
                <option value="all">All Tiers</option>
                <option value="premium">Premium</option>
                <option value="standard">Standard</option>
                <option value="basic">Basic</option>
              </select>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-3 py-2.5 text-sm outline-none transition-all"
              >
                <option value="all">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">
                    University
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Location
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Tier
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Rating
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No universities found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginated.map((uni, i) => (
                    <motion.tr
                      key={uni.id}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={i}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={uni.logo}
                            alt={uni.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{uni.name}</p>
                            <p className="text-xs text-slate-500">{uni.shortName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {uni.location}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <TierBadge tier={uni.tier} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={uni.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-medium text-slate-700">
                            {uni.rating || '---'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(uni)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(uni)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(uni)}
                            className={`p-2 rounded-lg transition-colors ${
                              uni.status === 'active'
                                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={uni.status === 'active' ? 'Suspend' : 'Approve'}
                          >
                            {uni.status === 'active' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(uni)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
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
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === i + 1
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'border border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 pb-10 overflow-y-auto"
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              variants={backdropVariants}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              variants={modalVariants}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingUni ? 'Edit University' : 'Add New University'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      University Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      placeholder="e.g. University of Melbourne"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Short Name
                    </label>
                    <input
                      type="text"
                      value={form.shortName}
                      onChange={(e) => updateForm('shortName', e.target.value)}
                      placeholder="e.g. UniMelb"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      placeholder="admissions@university.edu.au"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      placeholder="+61 3 XXXX XXXX"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => updateForm('location', e.target.value)}
                      placeholder="Melbourne, VIC"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                    <input
                      type="text"
                      value={form.type}
                      onChange={(e) => updateForm('type', e.target.value)}
                      placeholder="Public Research University"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    rows={3}
                    placeholder="Brief description of the university..."
                    className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => updateForm('website', e.target.value)}
                    placeholder="https://www.university.edu.au"
                    className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                  />
                </div>

                {/* Rankings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Ranking</label>
                    <input
                      type="number"
                      value={form.ranking}
                      onChange={(e) => updateForm('ranking', e.target.value)}
                      placeholder="e.g. 14"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Ranking Body</label>
                    <input
                      type="text"
                      value={form.rankingBody}
                      onChange={(e) => updateForm('rankingBody', e.target.value)}
                      placeholder="QS World"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Established</label>
                    <input
                      type="number"
                      value={form.established}
                      onChange={(e) => updateForm('established', e.target.value)}
                      placeholder="e.g. 1853"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Tuition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Tuition Min (AUD)
                    </label>
                    <input
                      type="number"
                      value={form.tuitionMin}
                      onChange={(e) => updateForm('tuitionMin', e.target.value)}
                      placeholder="e.g. 32000"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Tuition Max (AUD)
                    </label>
                    <input
                      type="number"
                      value={form.tuitionMax}
                      onChange={(e) => updateForm('tuitionMax', e.target.value)}
                      placeholder="e.g. 48000"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Tags: Courses */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Courses</label>
                  <TagInput
                    value={form.courses}
                    onChange={(val) => updateForm('courses', val)}
                    placeholder="Type courses, comma-separated..."
                  />
                </div>

                {/* Tags: Scholarships */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Scholarships
                  </label>
                  <TagInput
                    value={form.scholarships}
                    onChange={(val) => updateForm('scholarships', val)}
                    placeholder="Type scholarships, comma-separated..."
                  />
                </div>

                {/* Intakes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Intakes</label>
                  <div className="flex flex-wrap gap-3">
                    {intakeOptions.map((intake) => (
                      <label
                        key={intake}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.intakes?.includes(intake)}
                          onChange={() => toggleIntake(intake)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
                        />
                        <span className="text-sm text-slate-700">{intake}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tier */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tier</label>
                  <select
                    value={form.tier}
                    onChange={(e) => updateForm('tier', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
                  >
                    {editingUni ? 'Save Changes' : 'Add University'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2.5 rounded-xl">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Delete University</h2>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete <strong>{deletingUni?.name}</strong>? This action
                cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && viewingUni && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 pb-10 overflow-y-auto"
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              variants={backdropVariants}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowViewModal(false)}
            />
            <motion.div
              variants={modalVariants}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">University Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center gap-4">
                  <img
                    src={viewingUni.logo}
                    alt={viewingUni.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{viewingUni.name}</h3>
                    <p className="text-sm text-slate-500">{viewingUni.shortName}</p>
                    <div className="flex gap-2 mt-1">
                      <StatusBadge status={viewingUni.status} />
                      <TierBadge tier={viewingUni.tier} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {viewingUni.location}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <a href={viewingUni.website} className="text-indigo-600 hover:underline truncate">
                      {viewingUni.website}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {viewingUni.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {viewingUni.phone}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Award className="w-4 h-4 text-slate-400" />
                    Rank #{viewingUni.ranking} ({viewingUni.rankingBody})
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Est. {viewingUni.established}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {viewingUni.rating} ({viewingUni.reviewCount} reviews)
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    ${viewingUni.tuitionRange?.min?.toLocaleString()} - $
                    {viewingUni.tuitionRange?.max?.toLocaleString()} AUD
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600">{viewingUni.description}</p>
                </div>

                {viewingUni.courses?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> Courses
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingUni.courses.map((c, i) => (
                        <span
                          key={i}
                          className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full border border-indigo-200"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingUni.scholarships?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" /> Scholarships
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingUni.scholarships.map((s, i) => (
                        <span
                          key={i}
                          className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full border border-emerald-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingUni.intakes?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Intakes</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingUni.intakes.map((intake, i) => (
                        <span
                          key={i}
                          className="bg-violet-50 text-violet-700 text-xs px-2.5 py-1 rounded-full border border-violet-200"
                        >
                          {intake}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
