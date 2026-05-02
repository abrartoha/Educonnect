import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Megaphone,
  Plus,
  Calendar,
  Eye,
  MousePointer,
  TrendingUp,
  X,
  Pause,
  Play,
  Trash2,
} from 'lucide-react';
import { campaignsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseCampaign } from '../../api/mappers';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

const statusStyles = {
  Active: 'bg-emerald-50 text-emerald-700',
  Paused: 'bg-amber-50 text-amber-700',
  Draft: 'bg-slate-100 text-slate-600',
};

const statusDot = {
  Active: 'bg-emerald-500',
  Paused: 'bg-amber-500',
  Draft: 'bg-slate-400',
};

const AUDIENCE_PRESETS = [
  'International Students - South Asia',
  'International Students - Southeast Asia',
  'International Students - Middle East',
  'International Students - Africa',
  'Domestic Undergraduates',
  'Domestic Graduates',
  'High-Achieving Students',
  'STEM Students',
  'Business & Finance Students',
  'Arts & Humanities Students',
];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function UniCampaigns() {
  const { data, refetch } = useApiResource(() => campaignsApi.list(), []);
  const campaigns = (data?.items || []).map(normaliseCampaign);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreate = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        audience: formData.audience,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status === 'Active' ? 'ACTIVE' : 'DRAFT',
      };
      await campaignsApi.create(payload);
      toast.success(`Campaign "${formData.name}" created.`);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not create campaign');
    }
  };

  const toggleStatus = async (id) => {
    const target = campaigns.find((c) => c.id === id);
    if (!target) return;
    const next =
      target.status === 'Active'
        ? 'PAUSED'
        : target.status === 'Paused'
        ? 'ACTIVE'
        : 'ACTIVE';
    try {
      await campaignsApi.update(id, { status: next });
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not update status');
    }
  };

  const deleteCampaign = async (id) => {
    const target = campaigns.find((c) => c.id === id);
    try {
      await campaignsApi.remove(id);
      if (target) toast.success(`Deleted "${target.name}".`);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not delete');
    }
  };

  return (
    <>
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and manage promotional campaigns
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="gradient-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </motion.div>

      {/* Campaign Cards */}
      {campaigns.length === 0 ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="rounded-2xl border border-slate-200 bg-white p-12 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Megaphone className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            No campaigns yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Create your first campaign to start reaching prospective students.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="gradient-primary mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Create your first campaign
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {campaigns.map((campaign, i) => {
            const ctr =
              campaign.impressions > 0
                ? ((campaign.clicks / campaign.impressions) * 100).toFixed(1)
                : '0.0';

            return (
              <motion.div
                key={campaign.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i + 1}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {campaign.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[campaign.status]}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusDot[campaign.status]}`}
                        />
                        {campaign.status}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(campaign.startDate)} &ndash;{' '}
                        {formatDate(campaign.endDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Megaphone className="w-3.5 h-3.5" />
                        {campaign.audience}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleStatus(campaign.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      {campaign.status === 'Active' ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          {campaign.status === 'Draft' ? 'Activate' : 'Resume'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCampaign(campaign.id)}
                      aria-label="Delete campaign"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-50 p-2">
                      <Eye className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {campaign.impressions.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">Impressions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-50 p-2">
                      <MousePointer className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {campaign.clicks.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">Clicks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-violet-50 p-2">
                      <TrendingUp className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {ctr}%
                      </p>
                      <p className="text-xs text-slate-500">CTR</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <CreateCampaignModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}

/* ---------------------------------------------------------------- */
/*  Create Campaign Modal                                            */
/* ---------------------------------------------------------------- */

function CreateCampaignModal({ isOpen, onClose, onCreate }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <CreateCampaignModalBody onClose={onClose} onCreate={onCreate} />
      )}
    </AnimatePresence>
  );
}

function CreateCampaignModalBody({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState('');
  const [audience, setAudience] = useState(AUDIENCE_PRESETS[0]);
  const [status, setStatus] = useState('Active');

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a campaign name');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please set both start and end dates');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    onCreate({
      name: name.trim(),
      startDate,
      endDate,
      audience,
      status,
    });
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="w-full max-w-lg rounded-2xl bg-white shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Create campaign
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Launch a promotion to reach prospective students
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                <div>
                  <label
                    htmlFor="campaign-name"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Campaign name
                  </label>
                  <input
                    id="campaign-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Spring Intake 2026"
                    autoFocus
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="campaign-start"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Start date
                    </label>
                    <input
                      id="campaign-start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="campaign-end"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      End date
                    </label>
                    <input
                      id="campaign-end"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="campaign-audience"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Target audience
                  </label>
                  <select
                    id="campaign-audience"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
                  >
                    {AUDIENCE_PRESETS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Launch status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Active', 'Draft'].map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setStatus(opt)}
                        className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                          status === opt
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt === 'Active'
                          ? 'Launch immediately'
                          : 'Save as draft'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 -mx-6 px-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gradient-primary inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                  >
                    <Plus className="w-4 h-4" />
                    Create campaign
                  </button>
                </div>
              </form>
        </motion.div>
      </div>
    </>
  );
}
