import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Save,
  User,
  GraduationCap,
  MapPin,
  DollarSign,
  Globe,
  Heart,
  Calendar,
  X,
  Plus,
} from 'lucide-react';
import useStore from '../../store/useStore';
import { directoryApi, authApi } from '../../api/endpoints';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

const inputClass =
  'w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition text-sm';

function TagInput({ tags, onChange, placeholder, color = 'violet' }) {
  const [input, setInput] = useState('');

  const colorMap = {
    violet: 'bg-violet-50 text-violet-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  const btnColorMap = {
    violet: 'bg-violet-600 hover:bg-violet-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
  };

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  };

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 ${colorMap[color]} px-3 py-1 rounded-full text-sm font-medium`}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-500 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className={inputClass}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={addTag}
          className={`shrink-0 rounded-lg ${btnColorMap[color]} px-3 py-2.5 text-white transition`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const { currentUser } = useStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    nationality: '',
    interestedIn: [],
    preferredLocations: [],
    budgetMin: 0,
    budgetMax: 50000,
  });

  useEffect(() => {
    if (currentUser?.id) {
      setForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        nationality: currentUser.nationality || '',
        interestedIn: currentUser.interestedIn || [],
        preferredLocations: currentUser.preferredLocations || [],
        budgetMin: currentUser.budget?.min ?? 0,
        budgetMax: currentUser.budget?.max ?? 50000,
      });
    }
  }, [currentUser?.id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await directoryApi.updateStudentMe({
        name: form.name,
        nationality: form.nationality || undefined,
        interestedIn: form.interestedIn,
        preferredLocations: form.preferredLocations,
        budgetMin: Number(form.budgetMin) || undefined,
        budgetMax: Number(form.budgetMax) || undefined,
      });
      const { user } = await authApi.me();
      useStore.getState().setCurrentUser?.(user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Could not save');
    }
  };

  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

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
          <h1 className="text-2xl font-bold text-slate-900">Edit Student Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Keep your preferences up to date so we can find the best matches for you.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left: Form ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-violet-600" />
              <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  className={inputClass}
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
                <input
                  className={inputClass}
                  value={form.nationality}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  placeholder="e.g. Indian, Chinese, Vietnamese"
                />
              </div>
            </div>
          </motion.div>

          {/* Interests */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-900">Fields of Interest</h2>
            </div>
            <p className="text-sm text-slate-500 mb-3">
              Add the courses or fields you are interested in studying. This helps us recommend matching universities.
            </p>
            <TagInput
              tags={form.interestedIn}
              onChange={(val) => handleChange('interestedIn', val)}
              placeholder="e.g. IT & Computer Science, Engineering..."
              color="indigo"
            />
          </motion.div>

          {/* Preferred Locations */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Preferred Locations</h2>
            </div>
            <p className="text-sm text-slate-500 mb-3">
              Which Australian cities or regions do you prefer?
            </p>
            <TagInput
              tags={form.preferredLocations}
              onChange={(val) => handleChange('preferredLocations', val)}
              placeholder="e.g. Melbourne, Sydney, Brisbane..."
              color="emerald"
            />
          </motion.div>

          {/* Budget */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-slate-900">Budget Range (AUD / year)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Minimum</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  <input
                    className={`${inputClass} pl-7`}
                    type="number"
                    min={0}
                    value={form.budgetMin}
                    onChange={(e) => handleChange('budgetMin', Number(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Maximum</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  <input
                    className={`${inputClass} pl-7`}
                    type="number"
                    min={0}
                    value={form.budgetMax}
                    onChange={(e) => handleChange('budgetMax', Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Save */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className="flex justify-end pb-4"
          >
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </motion.div>
        </div>

        {/* ─── Right: Profile Preview Card ─── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="lg:col-span-1"
        >
          <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden sticky top-6">
            {/* Card header gradient */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white text-center">
              {currentUser?.avatar && (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-full mx-auto ring-4 ring-white/30 object-cover mb-3"
                />
              )}
              <h3 className="text-lg font-bold">{form.name || 'Student Name'}</h3>
              <p className="text-sm text-violet-200 mt-0.5">{form.email || 'email@example.com'}</p>
            </div>

            <div className="p-5 space-y-4">
              {/* Nationality */}
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-violet-100 p-2">
                  <Globe className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Nationality</p>
                  <p className="text-sm font-medium text-slate-900">{form.nationality || 'Not set'}</p>
                </div>
              </div>

              {/* Interests */}
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-indigo-100 p-2 mt-0.5">
                  <Heart className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Interested In</p>
                  {form.interestedIn.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.interestedIn.map((item) => (
                        <span
                          key={item}
                          className="text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">None added</p>
                  )}
                </div>
              </div>

              {/* Locations */}
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-emerald-100 p-2 mt-0.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Preferred Locations</p>
                  {form.preferredLocations.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.preferredLocations.map((loc) => (
                        <span
                          key={loc}
                          className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full"
                        >
                          {loc}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">None added</p>
                  )}
                </div>
              </div>

              {/* Budget */}
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Budget (AUD/yr)</p>
                  <p className="text-sm font-medium text-slate-900">
                    ${form.budgetMin.toLocaleString()} &ndash; ${form.budgetMax.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-slate-100 p-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Member Since</p>
                  <p className="text-sm font-medium text-slate-900">{memberSince}</p>
                </div>
              </div>

              {/* Status */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  {currentUser?.status || 'browsing'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
