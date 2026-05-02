import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Send, X, Video, Phone, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';
import { bookingsApi } from '../../api/endpoints';

const initialForm = {
  subject: '',
  date: '',
  time: '',
  durationMinutes: 30,
  mode: 'video',
  notes: '',
};

// One booking modal usable from any provider detail page (agent, consultant,
// university). The current authenticated user is the booker; provider is
// passed in by the parent.
export default function BookingModal({ open, onClose, provider, onCreated }) {
  const { isAuthenticated, currentUser } = useStore();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  if (!provider) return null;

  const cantBookSelf = currentUser && currentUser.id === provider.id;
  const isAdmin = currentUser?.role === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to book');
      return;
    }
    if (cantBookSelf) {
      toast.error('You cannot book yourself');
      return;
    }
    if (isAdmin) {
      toast.error('Admins cannot create bookings');
      return;
    }
    if (form.subject.trim().length < 3) {
      toast.error('Subject must be at least 3 characters');
      return;
    }
    if (!form.date || !form.time) {
      toast.error('Pick a date and time');
      return;
    }

    const scheduledAt = new Date(`${form.date}T${form.time}:00`);
    if (Number.isNaN(scheduledAt.getTime())) {
      toast.error('Invalid date or time');
      return;
    }
    if (scheduledAt.getTime() < Date.now()) {
      toast.error('Pick a time in the future');
      return;
    }

    setSubmitting(true);
    try {
      const result = await bookingsApi.create({
        providerId: provider.id,
        subject: form.subject || 'Consultation',
        notes: form.notes || undefined,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: Number(form.durationMinutes),
        mode: form.mode,
      });
      toast.success('Booking sent — waiting for confirmation');
      setForm(initialForm);
      onClose?.();
      onCreated?.(result?.item);
    } catch (err) {
      // Server's BadRequestError includes per-field issues; surface the first
      // one so users know what to fix instead of a generic "Validation failed".
      const issue = err?.details?.issues?.[0];
      const msg = issue
        ? `${issue.path}: ${issue.message}`
        : err?.message || 'Could not create booking';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                  <Calendar size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Book a meeting</h3>
                  <p className="text-sm text-slate-500">with {provider.name}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {cantBookSelf && (
                <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  This is your own profile — you cannot book yourself.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={200}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Visa application advice (3+ chars)"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    min={new Date().toISOString().slice(0, 10)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Duration</label>
                  <select
                    value={form.durationMinutes}
                    onChange={(e) =>
                      setForm({ ...form, durationMinutes: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Mode</label>
                  <div className="mt-1 grid grid-cols-3 gap-1 rounded-lg border border-slate-200 p-1">
                    {[
                      { value: 'video', icon: Video, label: 'Video' },
                      { value: 'phone', icon: Phone, label: 'Phone' },
                      { value: 'in-person', icon: Users, label: 'In-person' },
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm({ ...form, mode: value })}
                        className={`flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                          form.mode === value
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={12} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Anything they should know in advance?"
                  className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || cantBookSelf || isAdmin}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  <Send size={16} />
                  {submitting ? 'Booking…' : 'Send request'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
