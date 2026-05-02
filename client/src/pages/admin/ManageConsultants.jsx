import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
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
  Mail,
  Phone,
  DollarSign,
  Award,
  Globe2,
  Clock,
  Briefcase,
  GraduationCap,
  CalendarDays,
  BadgeCheck,
  Users,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem } from '../../api/mappers';

const ITEMS_PER_PAGE = 8;

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  avatar: '',
  location: '',
  description: '',
  yearsExperience: '',
  hourlyRate: '',
  availability: '',
  specialisations: [],
  languages: [],
  qualifications: [],
  services: [],
  tier: 'basic',
};

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
              className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full border border-orange-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="hover:text-orange-900 transition-colors"
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

export default function ManageConsultants() {
  const location = useLocation();
  const { data: usersData, refetch } = useApiResource(
    () => adminApi.listUsers({ role: 'CONSULTANT', limit: 100 }),
    []
  );
  const consultants = (usersData?.items || []).map(normaliseDirectoryItem);
  const notSupported = () =>
    toast.error(
      'Consultants create their own accounts via /signup. Admins can approve or suspend them here.'
    );
  const addConsultant = notSupported;
  const updateConsultant = notSupported;
  const deleteConsultant = notSupported;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState(null);
  const [deletingConsultant, setDeletingConsultant] = useState(null);
  const [viewingConsultant, setViewingConsultant] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (location.state?.openAdd) {
      handleAdd();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filtered = useMemo(() => {
    return consultants.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.specialisations?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchTier = tierFilter === 'all' || c.tier === tierFilter;
      return matchSearch && matchStatus && matchTier;
    });
  }, [consultants, searchTerm, statusFilter, tierFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tierFilter]);

  const handleAdd = () => {
    setEditingConsultant(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (consultant) => {
    setEditingConsultant(consultant);
    setForm({
      name: consultant.name || '',
      email: consultant.email || '',
      phone: consultant.phone || '',
      avatar: consultant.avatar || '',
      location: consultant.location || '',
      description: consultant.description || '',
      yearsExperience: consultant.yearsExperience || '',
      hourlyRate: consultant.hourlyRate || '',
      availability: consultant.availability || '',
      specialisations: consultant.specialisations || [],
      languages: consultant.languages || [],
      qualifications: consultant.qualifications || [],
      services: consultant.services || [],
      tier: consultant.tier || 'basic',
    });
    setShowModal(true);
  };

  const handleView = (consultant) => {
    setViewingConsultant(consultant);
    setShowViewModal(true);
  };

  const handleDelete = (consultant) => {
    setDeletingConsultant(consultant);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingConsultant) {
      deleteConsultant(deletingConsultant.id);
      toast.success(`"${deletingConsultant.name}" has been deleted.`);
      setShowDeleteModal(false);
      setDeletingConsultant(null);
    }
  };

  const handleToggleStatus = (consultant) => {
    if (consultant.status === 'active') {
      suspendEntity('consultant', consultant.id);
      toast.success(`"${consultant.name}" has been suspended.`);
    } else {
      approveEntity('consultant', consultant.id);
      toast.success(`"${consultant.name}" has been approved.`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Consultant name is required.');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Email is required.');
      return;
    }

    const data = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      avatar: form.avatar,
      location: form.location,
      description: form.description,
      yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : 0,
      hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : 0,
      availability: form.availability,
      specialisations: form.specialisations,
      languages: form.languages,
      qualifications: form.qualifications,
      services: form.services,
      tier: form.tier,
    };

    if (editingConsultant) {
      updateConsultant(editingConsultant.id, data);
      toast.success(`"${form.name}" has been updated.`);
    } else {
      addConsultant(data);
      toast.success(`"${form.name}" has been added.`);
    }

    setShowModal(false);
    setEditingConsultant(null);
    setForm(emptyForm);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
              <div className="bg-orange-100 p-2 rounded-xl">
                <UserCheck className="w-6 h-6 text-orange-600" />
              </div>
              Manage Consultants
            </h1>
            <p className="text-slate-500 mt-1">
              {filtered.length} consultant{filtered.length === 1 ? '' : 's'} found
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm shadow-orange-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Consultant
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search consultants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm outline-none transition-all"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 px-3 py-2.5 text-sm outline-none transition-all"
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
                className="rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 px-3 py-2.5 text-sm outline-none transition-all"
              >
                <option value="all">All Tiers</option>
                <option value="premium">Premium</option>
                <option value="standard">Standard</option>
                <option value="basic">Basic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">
                    Consultant
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Location
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Specialisations
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Hourly Rate
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
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No consultants found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginated.map((consultant, i) => (
                    <motion.tr
                      key={consultant.id}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={i}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={consultant.avatar}
                            alt={consultant.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-slate-900">{consultant.name}</p>
                              {consultant.verified && (
                                <BadgeCheck className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                            <div className="flex gap-1.5 mt-0.5">
                              <TierBadge tier={consultant.tier} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {consultant.location}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {consultant.specialisations?.slice(0, 2).map((s, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full"
                            >
                              {s}
                            </span>
                          ))}
                          {consultant.specialisations?.length > 2 && (
                            <span className="text-xs text-slate-400">
                              +{consultant.specialisations.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          {consultant.hourlyRate}/hr
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={consultant.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-medium text-slate-700">
                            {consultant.rating || '---'}
                          </span>
                          {consultant.reviewCount > 0 && (
                            <span className="text-xs text-slate-400">
                              ({consultant.reviewCount})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(consultant)}
                            className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(consultant)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(consultant)}
                            className={`p-2 rounded-lg transition-colors ${
                              consultant.status === 'active'
                                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={consultant.status === 'active' ? 'Suspend' : 'Approve'}
                          >
                            {consultant.status === 'active' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(consultant)}
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
                        ? 'bg-orange-600 text-white shadow-sm'
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
                  {editingConsultant ? 'Edit Consultant' : 'Add New Consultant'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      placeholder="e.g. Dr. Emma Thompson"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      placeholder="consultant@example.com"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Avatar URL</label>
                    <input
                      type="text"
                      value={form.avatar}
                      onChange={(e) => updateForm('avatar', e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
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
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Availability
                    </label>
                    <input
                      type="text"
                      value={form.availability}
                      onChange={(e) => updateForm('availability', e.target.value)}
                      placeholder="e.g. Mon-Fri, 9am-5pm AEST"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={form.yearsExperience}
                      onChange={(e) => updateForm('yearsExperience', e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Hourly Rate (AUD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.hourlyRate}
                      onChange={(e) => updateForm('hourlyRate', e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    rows={3}
                    placeholder="Brief description of the consultant's expertise and background..."
                    className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Specialisations</label>
                  <TagInput
                    value={form.specialisations}
                    onChange={(val) => updateForm('specialisations', val)}
                    placeholder="Type specialisations, comma-separated..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Languages</label>
                  <TagInput
                    value={form.languages}
                    onChange={(val) => updateForm('languages', val)}
                    placeholder="Type languages, comma-separated..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Qualifications</label>
                  <TagInput
                    value={form.qualifications}
                    onChange={(val) => updateForm('qualifications', val)}
                    placeholder="Type qualifications, comma-separated..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Services</label>
                  <TagInput
                    value={form.services}
                    onChange={(val) => updateForm('services', val)}
                    placeholder="Type services, comma-separated..."
                  />
                </div>

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
                    className="px-5 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition-colors"
                  >
                    {editingConsultant ? 'Save Changes' : 'Add Consultant'}
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
                <h2 className="text-lg font-semibold text-slate-900">Delete Consultant</h2>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete <strong>{deletingConsultant?.name}</strong>? This
                action cannot be undone.
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
        {showViewModal && viewingConsultant && (
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
                <h2 className="text-lg font-semibold text-slate-900">Consultant Details</h2>
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
                    src={viewingConsultant.avatar}
                    alt={viewingConsultant.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">{viewingConsultant.name}</h3>
                      {viewingConsultant.verified && (
                        <BadgeCheck className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{viewingConsultant.email}</p>
                    <div className="flex gap-2 mt-1">
                      <StatusBadge status={viewingConsultant.status} />
                      <TierBadge tier={viewingConsultant.tier} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {viewingConsultant.location}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {viewingConsultant.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {viewingConsultant.phone}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {viewingConsultant.yearsExperience} years experience
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    ${viewingConsultant.hourlyRate}/hr AUD
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {viewingConsultant.rating} ({viewingConsultant.reviewCount} reviews)
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    {viewingConsultant.studentsAssisted} students assisted
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    {viewingConsultant.successRate}% success rate
                  </div>
                </div>

                {viewingConsultant.availability && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-3 rounded-lg">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">Availability:</span> {viewingConsultant.availability}
                  </div>
                )}

                {viewingConsultant.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    Joined {new Date(viewingConsultant.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                )}

                <div>
                  <p className="text-sm text-slate-600">{viewingConsultant.description}</p>
                </div>

                {viewingConsultant.specialisations?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Globe2 className="w-4 h-4" /> Specialisations
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingConsultant.specialisations.map((s, i) => (
                        <span
                          key={i}
                          className="bg-orange-50 text-orange-700 text-xs px-2.5 py-1 rounded-full border border-orange-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingConsultant.languages?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingConsultant.languages.map((l, i) => (
                        <span
                          key={i}
                          className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-200"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingConsultant.qualifications?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" /> Qualifications
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingConsultant.qualifications.map((q, i) => (
                        <span
                          key={i}
                          className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full border border-indigo-200"
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingConsultant.services?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" /> Services
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingConsultant.services.map((s, i) => (
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
