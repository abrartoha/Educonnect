import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Save,
  User,
  GraduationCap,
  Briefcase,
  Languages,
  Wrench,
  DollarSign,
  Clock,
  X,
  Plus,
} from 'lucide-react';
import useStore from '../../store/useStore';
import { directoryApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem } from '../../api/mappers';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

const inputClass =
  'w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm';

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
          className={`shrink-0 rounded-lg px-3 py-2.5 text-white transition ${btnColorMap[color]}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ConsultantProfile() {
  const { currentUser } = useStore();

  const { data: consultantData, refetch } = useApiResource(
    () => (currentUser?.id ? directoryApi.getConsultant(currentUser.id) : null),
    [currentUser?.id]
  );
  const consultant = consultantData?.item
    ? normaliseDirectoryItem(consultantData.item)
    : {};

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    description: '',
    yearsExperience: '',
    hourlyRate: '',
    availability: '',
    qualifications: [],
    specialisations: [],
    services: [],
    languages: [],
  });

  useEffect(() => {
    if (consultant && consultant.id) {
      setForm({
        name: consultant.name || '',
        email: consultant.email || '',
        phone: consultant.phone || '',
        location: consultant.location || '',
        description: consultant.description || '',
        yearsExperience: consultant.yearsExperience || '',
        hourlyRate: consultant.hourlyRate || '',
        availability: consultant.availability || '',
        qualifications: consultant.qualifications || [],
        specialisations: consultant.specialisations || [],
        services: consultant.services || [],
        languages: consultant.languages || [],
      });
    }
  }, [consultant?.id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!currentUser?.id) return;
    try {
      await directoryApi.updateConsultantMe({
        name: form.name,
        phone: form.phone || undefined,
        location: form.location || undefined,
        description: form.description || undefined,
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        qualifications: form.qualifications,
        specialisations: form.specialisations,
        services: form.services,
        languages: form.languages,
      });
      toast.success('Profile updated successfully!');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not save');
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
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Consultant Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update your professional information and services.
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

      <div className="space-y-6">
        {/* Personal Info */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-violet-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Personal Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                className={inputClass}
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Location
              </label>
              <input
                className={inputClass}
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Years of Experience
              </label>
              <input
                className={inputClass}
                type="number"
                value={form.yearsExperience}
                onChange={(e) => handleChange('yearsExperience', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              className={`${inputClass} min-h-[100px] resize-y`}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
            />
          </div>
        </motion.div>

        {/* Rate & Availability */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Rate & Availability
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hourly Rate (AUD)
              </label>
              <input
                className={inputClass}
                type="number"
                value={form.hourlyRate}
                onChange={(e) => handleChange('hourlyRate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Availability
              </label>
              <input
                className={inputClass}
                value={form.availability}
                onChange={(e) => handleChange('availability', e.target.value)}
                placeholder="e.g. Mon-Fri, 9am-5pm AEST"
              />
            </div>
          </div>
        </motion.div>

        {/* Qualifications */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Qualifications</h2>
          </div>
          <TagInput
            tags={form.qualifications}
            onChange={(val) => handleChange('qualifications', val)}
            placeholder="Add a qualification..."
            color="indigo"
          />
        </motion.div>

        {/* Specialisations */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-violet-600" />
            <h2 className="text-lg font-semibold text-slate-900">Specialisations</h2>
          </div>
          <TagInput
            tags={form.specialisations}
            onChange={(val) => handleChange('specialisations', val)}
            placeholder="Add a specialisation..."
            color="violet"
          />
        </motion.div>

        {/* Services */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Services</h2>
          </div>
          <TagInput
            tags={form.services}
            onChange={(val) => handleChange('services', val)}
            placeholder="Add a service..."
            color="emerald"
          />
        </motion.div>

        {/* Languages */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={6}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Languages className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-slate-900">Languages</h2>
          </div>
          <TagInput
            tags={form.languages}
            onChange={(val) => handleChange('languages', val)}
            placeholder="Add a language..."
            color="orange"
          />
        </motion.div>

        {/* Bottom Save */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={7}
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
    </>
  );
}
