import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
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
  Briefcase,
  Award,
  Globe2,
  Clock,
  UserCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem } from '../../api/mappers';

const ITEMS_PER_PAGE = 8;

const emptyForm = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  location: '',
  description: '',
  yearsExperience: '',
  specialisations: [],
  languages: [],
  certifications: [],
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
              className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="hover:text-emerald-900 transition-colors"
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

export default function ManageAgents() {
  const location = useLocation();
  const { data: usersData, refetch } = useApiResource(
    () => adminApi.listUsers({ role: 'AGENT', limit: 100 }),
    []
  );
  const agents = (usersData?.items || []).map(normaliseDirectoryItem);
  const notSupported = () =>
    toast.error(
      'Agents create their own accounts via /signup. Admins can approve or suspend them here.'
    );
  const addAgent = notSupported;
  const updateAgent = notSupported;
  const deleteAgent = notSupported;
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
  const [editingAgent, setEditingAgent] = useState(null);
  const [deletingAgent, setDeletingAgent] = useState(null);
  const [viewingAgent, setViewingAgent] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (location.state?.openAdd) {
      handleAdd();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchTier = tierFilter === 'all' || a.tier === tierFilter;
      return matchSearch && matchStatus && matchTier;
    });
  }, [agents, searchTerm, statusFilter, tierFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tierFilter]);

  const handleAdd = () => {
    setEditingAgent(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setForm({
      name: agent.name || '',
      contactPerson: agent.contactPerson || '',
      email: agent.email || '',
      phone: agent.phone || '',
      location: agent.location || '',
      description: agent.description || '',
      yearsExperience: agent.yearsExperience || '',
      specialisations: agent.specialisations || [],
      languages: agent.languages || [],
      certifications: agent.certifications || [],
      services: agent.services || [],
      tier: agent.tier || 'basic',
    });
    setShowModal(true);
  };

  const handleView = (agent) => {
    setViewingAgent(agent);
    setShowViewModal(true);
  };

  const handleDelete = (agent) => {
    setDeletingAgent(agent);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingAgent) {
      deleteAgent(deletingAgent.id);
      toast.success(`"${deletingAgent.name}" has been deleted.`);
      setShowDeleteModal(false);
      setDeletingAgent(null);
    }
  };

  const handleToggleStatus = (agent) => {
    if (agent.status === 'active') {
      suspendEntity('agent', agent.id);
      toast.success(`"${agent.name}" has been suspended.`);
    } else {
      approveEntity('agent', agent.id);
      toast.success(`"${agent.name}" has been approved.`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Agent name is required.');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Email is required.');
      return;
    }

    const data = {
      name: form.name,
      contactPerson: form.contactPerson,
      email: form.email,
      phone: form.phone,
      location: form.location,
      description: form.description,
      yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : 0,
      specialisations: form.specialisations,
      languages: form.languages,
      certifications: form.certifications,
      services: form.services,
      tier: form.tier,
    };

    if (editingAgent) {
      updateAgent(editingAgent.id, data);
      toast.success(`"${form.name}" has been updated.`);
    } else {
      addAgent(data);
      toast.success(`"${form.name}" has been added.`);
    }

    setShowModal(false);
    setEditingAgent(null);
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
              <div className="bg-emerald-100 p-2 rounded-xl">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              Manage Agents
            </h1>
            <p className="text-slate-500 mt-1">
              {filtered.length} agent{filtered.length === 1 ? '' : 's'} found
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm shadow-emerald-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Agent
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none transition-all"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 px-3 py-2.5 text-sm outline-none transition-all"
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
                className="rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 px-3 py-2.5 text-sm outline-none transition-all"
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
                    Agent
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Contact Person
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Location
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">
                    Specialisations
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
                      No agents found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginated.map((agent, i) => (
                    <motion.tr
                      key={agent.id}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={i}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={agent.logo || agent.avatar}
                            alt={agent.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                            <div className="flex gap-1.5 mt-0.5">
                              <TierBadge tier={agent.tier} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {agent.contactPerson}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {agent.location}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {agent.specialisations?.slice(0, 2).map((s, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full"
                            >
                              {s}
                            </span>
                          ))}
                          {agent.specialisations?.length > 2 && (
                            <span className="text-xs text-slate-400">
                              +{agent.specialisations.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={agent.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-medium text-slate-700">
                            {agent.rating || '---'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(agent)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(agent)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(agent)}
                            className={`p-2 rounded-lg transition-colors ${
                              agent.status === 'active'
                                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={agent.status === 'active' ? 'Suspend' : 'Approve'}
                          >
                            {agent.status === 'active' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(agent)}
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
                        ? 'bg-emerald-600 text-white shadow-sm'
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
                  {editingAgent ? 'Edit Agent' : 'Add New Agent'}
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
                      Agency Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      placeholder="e.g. Pacific Education Group"
                      className="w-full rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={form.contactPerson}
                      onChange={(e) => updateForm('contactPerson', e.target.value)}
                      placeholder="e.g. Sarah Chen"
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
                      placeholder="agent@example.com"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    rows={3}
                    placeholder="Brief description of the agency..."
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
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Certifications</label>
                  <TagInput
                    value={form.certifications}
                    onChange={(val) => updateForm('certifications', val)}
                    placeholder="Type certifications, comma-separated..."
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
                    className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
                  >
                    {editingAgent ? 'Save Changes' : 'Add Agent'}
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
                <h2 className="text-lg font-semibold text-slate-900">Delete Agent</h2>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete <strong>{deletingAgent?.name}</strong>? This action
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
        {showViewModal && viewingAgent && (
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
                <h2 className="text-lg font-semibold text-slate-900">Agent Details</h2>
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
                    src={viewingAgent.logo || viewingAgent.avatar}
                    alt={viewingAgent.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{viewingAgent.name}</h3>
                    <p className="text-sm text-slate-500">{viewingAgent.contactPerson}</p>
                    <div className="flex gap-2 mt-1">
                      <StatusBadge status={viewingAgent.status} />
                      <TierBadge tier={viewingAgent.tier} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {viewingAgent.location}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {viewingAgent.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {viewingAgent.phone}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {viewingAgent.yearsExperience} years experience
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {viewingAgent.rating} ({viewingAgent.reviewCount} reviews)
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <UserCircle className="w-4 h-4 text-slate-400" />
                    {viewingAgent.studentsPlaced} students placed
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    {viewingAgent.partnerInstitutions} partner institutions
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Award className="w-4 h-4 text-slate-400" />
                    {viewingAgent.successRate}% success rate
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600">{viewingAgent.description}</p>
                </div>

                {viewingAgent.specialisations?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Globe2 className="w-4 h-4" /> Specialisations
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingAgent.specialisations.map((s, i) => (
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

                {viewingAgent.languages?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingAgent.languages.map((l, i) => (
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

                {viewingAgent.certifications?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Award className="w-4 h-4" /> Certifications
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingAgent.certifications.map((c, i) => (
                        <span
                          key={i}
                          className="bg-violet-50 text-violet-700 text-xs px-2.5 py-1 rounded-full border border-violet-200"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingAgent.services?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" /> Services
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingAgent.services.map((s, i) => (
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
