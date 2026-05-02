import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Save,
  Eye,
  EyeOff,
  Building2,
  GraduationCap,
  DollarSign,
  Award,
  Landmark,
  CalendarDays,
  Image,
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

function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState('');

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
            className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
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
          className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2.5 text-white hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function UniProfile() {
  const { currentUser } = useStore();
  const [preview, setPreview] = useState(false);

  const { data: uniData, refetch } = useApiResource(
    () => (currentUser?.id ? directoryApi.getUniversity(currentUser.id) : null),
    [currentUser?.id]
  );
  const uni = uniData?.item ? normaliseDirectoryItem(uniData.item) : {};

  const [form, setForm] = useState({
    name: '',
    shortName: '',
    location: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    type: '',
    ranking: '',
    rankingBody: '',
    established: '',
    studentCount: '',
    internationalStudents: '',
    logo: '',
    coverImage: '',
    courses: [],
    tuitionRange: { min: '', max: '', currency: 'AUD' },
    scholarships: [],
    intakes: [],
    facilities: [],
    accreditations: [],
  });

  useEffect(() => {
    if (uni && uni.id) {
      setForm({
        name: uni.name || '',
        shortName: uni.shortName || '',
        location: uni.location || '',
        description: uni.description || '',
        website: uni.website || '',
        email: uni.email || '',
        phone: uni.phone || '',
        type: uni.type || '',
        ranking: uni.ranking || '',
        rankingBody: uni.rankingBody || '',
        established: uni.established || '',
        studentCount: uni.studentCount || '',
        internationalStudents: uni.internationalStudents || '',
        logo: uni.logo || '',
        coverImage: uni.coverImage || '',
        courses: uni.courses || [],
        tuitionRange: uni.tuitionRange || { min: '', max: '', currency: 'AUD' },
        scholarships: uni.scholarships || [],
        intakes: uni.intakes || [],
        facilities: uni.facilities || [],
        accreditations: uni.accreditations || [],
      });
    }
  }, [uni?.id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTuitionChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      tuitionRange: { ...prev.tuitionRange, [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!currentUser?.id) return;
    const patch = {
      name: form.name,
      shortName: form.shortName || undefined,
      location: form.location || undefined,
      description: form.description || undefined,
      website: form.website || undefined,
      phone: form.phone || undefined,
      type: form.type || undefined,
      ranking: form.ranking ? Number(form.ranking) : undefined,
      foundedYear: form.established ? Number(form.established) : undefined,
      studentCount: form.studentCount ? Number(form.studentCount) : undefined,
      internationalPct: form.internationalStudents
        ? Number(form.internationalStudents)
        : undefined,
      logoUrl: form.logo || undefined,
      coverImageUrl: form.coverImage || undefined,
      tuitionMin: form.tuitionRange.min === '' ? undefined : Number(form.tuitionRange.min),
      tuitionMax: form.tuitionRange.max === '' ? undefined : Number(form.tuitionRange.max),
      tuitionCurrency: form.tuitionRange.currency || undefined,
      courses: form.courses,
      scholarships: form.scholarships,
      intakes: form.intakes,
      facilities: form.facilities,
      accreditations: form.accreditations,
    };
    try {
      await directoryApi.updateUniversityMe(patch);
      toast.success('Profile updated successfully!');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not save');
    }
  };

  if (preview) {
    return (
      <>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-4 flex items-center justify-between"
        >
          <h1 className="text-2xl font-bold text-slate-900">Profile Preview</h1>
          <button
            onClick={() => setPreview(false)}
            className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
          >
            <EyeOff className="w-4 h-4" />
            Exit Preview
          </button>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100"
        >
          <div
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${form.coverImage})` }}
          />
          <div className="p-6 -mt-12 relative">
            <img
              src={form.logo}
              alt={form.name}
              className="w-24 h-24 rounded-xl border-4 border-white shadow-lg object-cover"
            />
            <h2 className="mt-3 text-2xl font-bold text-slate-900">{form.name}</h2>
            <p className="text-slate-500">{form.location}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
                #{form.ranking} {form.rankingBody}
              </span>
              <span className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">
                Est. {form.established}
              </span>
              <span className="text-sm bg-violet-50 text-violet-700 px-3 py-1 rounded-full font-medium">
                {form.type}
              </span>
            </div>
            <p className="mt-4 text-slate-600 leading-relaxed">{form.description}</p>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-slate-900">
                  {Number(form.studentCount).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">Total Students</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-slate-900">
                  {Number(form.internationalStudents).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">International</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-slate-900">{form.courses.length}</p>
                <p className="text-xs text-slate-500">Programs</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-slate-900">
                  ${Number(form.tuitionRange.min).toLocaleString()} - $
                  {Number(form.tuitionRange.max).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">Tuition ({form.tuitionRange.currency})</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-slate-900 mb-2">Courses</h3>
              <div className="flex flex-wrap gap-2">
                {form.courses.map((c) => (
                  <span
                    key={c}
                    className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-slate-900 mb-2">Scholarships</h3>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {form.scholarships.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-slate-900 mb-2">Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {form.facilities.map((f) => (
                  <span
                    key={f}
                    className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

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
          <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Update your institution's information to attract more students.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPreview(true)}
            className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Cover Image & Logo */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Images</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Logo URL
              </label>
              <input
                className={inputClass}
                value={form.logo}
                onChange={(e) => handleChange('logo', e.target.value)}
                placeholder="https://..."
              />
              {form.logo && (
                <img
                  src={form.logo}
                  alt="Logo preview"
                  className="mt-2 w-20 h-20 rounded-lg object-cover border"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cover Image URL
              </label>
              <input
                className={inputClass}
                value={form.coverImage}
                onChange={(e) => handleChange('coverImage', e.target.value)}
                placeholder="https://..."
              />
              {form.coverImage && (
                <img
                  src={form.coverImage}
                  alt="Cover preview"
                  className="mt-2 w-full h-24 rounded-lg object-cover border"
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Basic Info */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                University Name
              </label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Short Name
              </label>
              <input
                className={inputClass}
                value={form.shortName}
                onChange={(e) => handleChange('shortName', e.target.value)}
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
                Type
              </label>
              <input
                className={inputClass}
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Website
              </label>
              <input
                className={inputClass}
                value={form.website}
                onChange={(e) => handleChange('website', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                className={inputClass}
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
                Established
              </label>
              <input
                className={inputClass}
                type="number"
                value={form.established}
                onChange={(e) => handleChange('established', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ranking
              </label>
              <input
                className={inputClass}
                type="number"
                value={form.ranking}
                onChange={(e) => handleChange('ranking', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ranking Body
              </label>
              <input
                className={inputClass}
                value={form.rankingBody}
                onChange={(e) => handleChange('rankingBody', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Total Students
              </label>
              <input
                className={inputClass}
                type="number"
                value={form.studentCount}
                onChange={(e) => handleChange('studentCount', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                International Students
              </label>
              <input
                className={inputClass}
                type="number"
                value={form.internationalStudents}
                onChange={(e) =>
                  handleChange('internationalStudents', e.target.value)
                }
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

        {/* Courses */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Courses</h2>
          </div>
          <TagInput
            tags={form.courses}
            onChange={(val) => handleChange('courses', val)}
            placeholder="Add a course program..."
          />
        </motion.div>

        {/* Tuition */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-slate-900">Tuition Fees</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Minimum (per year)
              </label>
              <input
                className={inputClass}
                type="number"
                value={form.tuitionRange.min}
                onChange={(e) => handleTuitionChange('min', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Maximum (per year)
              </label>
              <input
                className={inputClass}
                type="number"
                value={form.tuitionRange.max}
                onChange={(e) => handleTuitionChange('max', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Currency
              </label>
              <input
                className={inputClass}
                value={form.tuitionRange.currency}
                onChange={(e) => handleTuitionChange('currency', e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        {/* Scholarships */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-violet-600" />
            <h2 className="text-lg font-semibold text-slate-900">Scholarships</h2>
          </div>
          <TagInput
            tags={form.scholarships}
            onChange={(val) => handleChange('scholarships', val)}
            placeholder="Add a scholarship..."
          />
        </motion.div>

        {/* Facilities */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={6}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Landmark className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Facilities</h2>
          </div>
          <TagInput
            tags={form.facilities}
            onChange={(val) => handleChange('facilities', val)}
            placeholder="Add a facility..."
          />
        </motion.div>

        {/* Intakes */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={7}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Intakes</h2>
          </div>
          <TagInput
            tags={form.intakes}
            onChange={(val) => handleChange('intakes', val)}
            placeholder="Add an intake period..."
          />
        </motion.div>

        {/* Accreditations */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={8}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-slate-900">Accreditations</h2>
          </div>
          <TagInput
            tags={form.accreditations}
            onChange={(val) => handleChange('accreditations', val)}
            placeholder="Add an accreditation..."
          />
        </motion.div>

        {/* Bottom Save */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={9}
          className="flex justify-end gap-3 pb-4"
        >
          <button
            onClick={() => setPreview(true)}
            className="flex items-center gap-2 rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </motion.div>
      </div>
    </>
  );
}
