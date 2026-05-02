import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  UserCheck,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  DollarSign,
  Clock,
  FileText,
  BookOpen,
  Languages,
  Tag,
  User,
  CheckCircle2,
  Sparkles,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';

/* ------------------------------------------------------------------ */
/*  Role cards for Step 1                                              */
/* ------------------------------------------------------------------ */
const roleCards = [
  {
    id: 'university',
    label: 'University',
    icon: Building2,
    color: 'from-blue-600 to-cyan-600',
    bgLight: 'bg-blue-50',
    borderActive: 'border-blue-500 ring-2 ring-blue-200',
    textColor: 'text-blue-700',
    accentBg: 'bg-blue-600',
    description: 'List your institution, manage courses, and attract international students.',
  },
  {
    id: 'agent',
    label: 'Education Agent',
    icon: Users,
    color: 'from-emerald-600 to-teal-600',
    bgLight: 'bg-emerald-50',
    borderActive: 'border-emerald-500 ring-2 ring-emerald-200',
    textColor: 'text-emerald-700',
    accentBg: 'bg-emerald-600',
    description: 'Connect students with universities and manage placements at scale.',
  },
  {
    id: 'consultant',
    label: 'Consultant',
    icon: UserCheck,
    color: 'from-orange-500 to-amber-500',
    bgLight: 'bg-orange-50',
    borderActive: 'border-orange-500 ring-2 ring-orange-200',
    textColor: 'text-orange-700',
    accentBg: 'bg-orange-500',
    description: 'Offer expert guidance on admissions, visas, and education pathways.',
  },
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    color: 'from-purple-600 to-indigo-600',
    bgLight: 'bg-purple-50',
    borderActive: 'border-purple-500 ring-2 ring-purple-200',
    textColor: 'text-purple-700',
    accentBg: 'bg-purple-600',
    description: 'Discover universities, find agents, and plan your study journey.',
  },
];

const dashboardRoutes = {
  university: '/university',
  agent: '/agent',
  consultant: '/consultant',
  student: '/student',
};

/* ------------------------------------------------------------------ */
/*  Course / specialisation / field options for multi-select           */
/* ------------------------------------------------------------------ */
const courseOptions = [
  'Business & Economics',
  'Engineering',
  'IT & Computer Science',
  'Medicine & Health',
  'Arts & Humanities',
  'Science',
  'Law',
  'Education',
  'Architecture & Design',
  'Nursing',
  'Pharmacy',
  'Media & Communication',
];

const specialisationOptions = [
  'South Asia',
  'Southeast Asia',
  'East Asia',
  'Middle East',
  'Africa',
  'Europe',
  'Higher Education',
  'Vocational Education',
  'Postgraduate Research',
  'Undergraduate',
  'Student Visa',
  'Migration Pathways',
  'Scholarship Strategy',
  'English Language',
];

const languageOptions = [
  'English',
  'Mandarin',
  'Hindi',
  'Arabic',
  'French',
  'Vietnamese',
  'Thai',
  'Nepali',
  'Tamil',
  'German',
  'Spanish',
  'Korean',
  'Japanese',
  'Indonesian',
];

const locationOptions = [
  'Melbourne, VIC',
  'Sydney, NSW',
  'Brisbane, QLD',
  'Perth, WA',
  'Adelaide, SA',
  'Canberra, ACT',
  'Hobart, TAS',
  'Darwin, NT',
  'Gold Coast, QLD',
];

const universityTypes = [
  'Public Research University',
  'Public University',
  'Private University',
  'Institute of Technology',
  'TAFE / Vocational',
];

/* ------------------------------------------------------------------ */
/*  Reusable components                                                */
/* ------------------------------------------------------------------ */

function InputField({ label, icon: Icon, required, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <input
          {...props}
          className={`block w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
        />
      </div>
    </div>
  );
}

function TextAreaField({ label, icon: Icon, required, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <textarea
        {...props}
        className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
      />
    </div>
  );
}

function SelectField({ label, icon: Icon, options, required, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <select
          {...props}
          className={`block w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none`}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function TagSelector({ label, options, selected, onChange, required }) {
  const toggle = (item) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-lg"
            >
              {item}
              <button
                type="button"
                onClick={() => toggle(item)}
                className="hover:text-primary-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* Options */}
      <div className="flex flex-wrap gap-1.5">
        {options
          .filter((opt) => !selected.includes(opt))
          .map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              + {opt}
            </button>
          ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step transition animation variants                                 */
/* ------------------------------------------------------------------ */
const stepVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

/* ------------------------------------------------------------------ */
/*  Main Signup Component                                              */
/* ------------------------------------------------------------------ */
export default function Signup() {
  const navigate = useNavigate();
  const signup = useStore((s) => s.signup);
  const [searchParams] = useSearchParams();

  const initialRole = roleCards.some((r) => r.id === searchParams.get('role'))
    ? searchParams.get('role')
    : '';

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(false);

  // ---- Form state ----
  const [form, setForm] = useState({
    // Common
    password: '',
    // University
    name: '',
    shortName: '',
    email: '',
    phone: '',
    location: '',
    type: '',
    description: '',
    website: '',
    tuitionMin: '',
    tuitionMax: '',
    courses: [],
    // Agent
    contactPerson: '',
    specialisations: [],
    languages: [],
    yearsExperience: '',
    // Consultant
    qualifications: '',
    hourlyRate: '',
    // Student
    nationality: '',
    interestedIn: [],
    preferredLocations: [],
    budgetMin: '',
    budgetMax: '',
  });

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const activeRoleCard = roleCards.find((r) => r.id === selectedRole);

  /* ---- Navigation helpers ---- */
  const goNext = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };
  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  /* ---- Step 1 validation ---- */
  const handleStep1 = () => {
    if (!selectedRole) {
      toast.error('Please select a role to continue');
      return;
    }
    goNext();
  };

  /* ---- Step 2 validation + submit ---- */
  const validateStep2 = () => {
    if (!form.name && selectedRole !== 'agent') {
      toast.error('Please enter a name');
      return false;
    }
    if (selectedRole === 'agent' && !form.name) {
      toast.error('Please enter a company name');
      return false;
    }
    if (!form.email) {
      toast.error('Please enter an email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    if (!form.password || form.password.length < 8) {
      toast.error('Password must be at least 8 characters (with upper, lower, digit)');
      return;
    }

    setIsLoading(true);

    const base = {
      role: selectedRole.toUpperCase(),
      email: form.email,
      password: form.password,
      name: form.name,
    };

    let payload;
    if (selectedRole === 'university') {
      payload = {
        ...base,
        shortName: form.shortName || undefined,
        phone: form.phone || undefined,
        location: form.location || undefined,
        type: form.type || undefined,
        description: form.description || undefined,
        website: form.website || undefined,
      };
    } else if (selectedRole === 'agent') {
      payload = {
        ...base,
        contactPerson: form.contactPerson || undefined,
        phone: form.phone || undefined,
        location: form.location || undefined,
        description: form.description || undefined,
        yearsExperience: form.yearsExperience
          ? parseInt(form.yearsExperience)
          : undefined,
      };
    } else if (selectedRole === 'consultant') {
      payload = {
        ...base,
        phone: form.phone || undefined,
        location: form.location || undefined,
        description: form.description || undefined,
        yearsExperience: form.yearsExperience
          ? parseInt(form.yearsExperience)
          : undefined,
        hourlyRate: form.hourlyRate ? parseInt(form.hourlyRate) : undefined,
      };
    } else {
      // student
      payload = {
        ...base,
        nationality: form.nationality || undefined,
        interestedIn: form.interestedIn?.length ? form.interestedIn : undefined,
        preferredLocations: form.preferredLocations?.length
          ? form.preferredLocations
          : undefined,
        budgetMin: form.budgetMin ? parseInt(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? parseInt(form.budgetMax) : undefined,
      };
    }

    const result = await signup(payload);
    setIsLoading(false);

    if (result.success) {
      toast.success('Account created successfully!');
      goNext();
    } else {
      toast.error(result.error || 'Signup failed. Please try again.');
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Step renderers                                                     */
  /* ------------------------------------------------------------------ */

  const renderStep1 = () => (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your role</h2>
        <p className="text-gray-500">Select how you'd like to use EduConnect</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roleCards.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          return (
            <motion.button
              key={role.id}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole(role.id)}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? `${role.borderActive} ${role.bgLight}`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="role-check"
                  className={`absolute top-3 right-3 w-6 h-6 ${role.accentBg} rounded-full flex items-center justify-center`}
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </motion.div>
              )}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-3`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{role.label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{role.description}</p>
            </motion.button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleStep1}
        className="mt-8 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-medium text-sm gradient-primary hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const renderUniversityForm = () => (
    <div className="space-y-5">
      <div className="pb-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          Institution Details
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="University Name"
          icon={Building2}
          required
          placeholder="e.g. University of Melbourne"
          value={form.name}
          onChange={(e) => updateForm('name', e.target.value)}
        />
        <InputField
          label="Short Name / Abbreviation"
          placeholder="e.g. UniMelb"
          value={form.shortName}
          onChange={(e) => updateForm('shortName', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Email"
          icon={Mail}
          required
          type="email"
          placeholder="admissions@university.edu.au"
          value={form.email}
          onChange={(e) => updateForm('email', e.target.value)}
        />
        <InputField
          label="Password"
          icon={User}
          required
          type="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(e) => updateForm('password', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Phone"
          icon={Phone}
          placeholder="+61 3 XXXX XXXX"
          value={form.phone}
          onChange={(e) => updateForm('phone', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Location"
          icon={MapPin}
          required
          options={locationOptions}
          value={form.location}
          onChange={(e) => updateForm('location', e.target.value)}
        />
        <SelectField
          label="Institution Type"
          icon={FileText}
          required
          options={universityTypes}
          value={form.type}
          onChange={(e) => updateForm('type', e.target.value)}
        />
      </div>

      <InputField
        label="Website"
        icon={Globe}
        type="url"
        placeholder="https://www.university.edu.au"
        value={form.website}
        onChange={(e) => updateForm('website', e.target.value)}
      />

      <TextAreaField
        label="Description"
        placeholder="Tell prospective students about your institution, its strengths, campus, and community..."
        rows={3}
        value={form.description}
        onChange={(e) => updateForm('description', e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Annual Tuition Range (AUD)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="number"
              placeholder="Min e.g. 28000"
              value={form.tuitionMin}
              onChange={(e) => updateForm('tuitionMin', e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="number"
              placeholder="Max e.g. 48000"
              value={form.tuitionMax}
              onChange={(e) => updateForm('tuitionMax', e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <TagSelector
        label="Courses Offered"
        options={courseOptions}
        selected={form.courses}
        onChange={(val) => updateForm('courses', val)}
      />
    </div>
  );

  const renderAgentForm = () => (
    <div className="space-y-5">
      <div className="pb-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          Agency Details
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Company Name"
          icon={Briefcase}
          required
          placeholder="e.g. Pacific Education Group"
          value={form.name}
          onChange={(e) => updateForm('name', e.target.value)}
        />
        <InputField
          label="Contact Person"
          icon={User}
          required
          placeholder="Full name"
          value={form.contactPerson}
          onChange={(e) => updateForm('contactPerson', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Email"
          icon={Mail}
          required
          type="email"
          placeholder="hello@agency.com.au"
          value={form.email}
          onChange={(e) => updateForm('email', e.target.value)}
        />
        <InputField
          label="Password"
          icon={User}
          required
          type="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(e) => updateForm('password', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Phone"
          icon={Phone}
          placeholder="+61 3 XXXX XXXX"
          value={form.phone}
          onChange={(e) => updateForm('phone', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Location"
          icon={MapPin}
          required
          options={locationOptions}
          value={form.location}
          onChange={(e) => updateForm('location', e.target.value)}
        />
        <InputField
          label="Years of Experience"
          icon={Clock}
          type="number"
          placeholder="e.g. 10"
          value={form.yearsExperience}
          onChange={(e) => updateForm('yearsExperience', e.target.value)}
        />
      </div>

      <TextAreaField
        label="Description"
        placeholder="Describe your agency, its mission, and what makes you unique..."
        rows={3}
        value={form.description}
        onChange={(e) => updateForm('description', e.target.value)}
      />

      <TagSelector
        label="Specialisations"
        options={specialisationOptions}
        selected={form.specialisations}
        onChange={(val) => updateForm('specialisations', val)}
      />

      <TagSelector
        label="Languages"
        options={languageOptions}
        selected={form.languages}
        onChange={(val) => updateForm('languages', val)}
      />
    </div>
  );

  const renderConsultantForm = () => (
    <div className="space-y-5">
      <div className="pb-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-orange-600" />
          Consultant Profile
        </h3>
      </div>

      <InputField
        label="Full Name"
        icon={User}
        required
        placeholder="e.g. Dr. Emma Thompson"
        value={form.name}
        onChange={(e) => updateForm('name', e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Email"
          icon={Mail}
          required
          type="email"
          placeholder="you@consulting.com.au"
          value={form.email}
          onChange={(e) => updateForm('email', e.target.value)}
        />
        <InputField
          label="Password"
          icon={User}
          required
          type="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(e) => updateForm('password', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Phone"
          icon={Phone}
          placeholder="+61 3 XXXX XXXX"
          value={form.phone}
          onChange={(e) => updateForm('phone', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Location"
          icon={MapPin}
          required
          options={locationOptions}
          value={form.location}
          onChange={(e) => updateForm('location', e.target.value)}
        />
        <InputField
          label="Years of Experience"
          icon={Clock}
          type="number"
          placeholder="e.g. 12"
          value={form.yearsExperience}
          onChange={(e) => updateForm('yearsExperience', e.target.value)}
        />
      </div>

      <InputField
        label="Hourly Rate (AUD)"
        icon={DollarSign}
        type="number"
        placeholder="e.g. 120"
        value={form.hourlyRate}
        onChange={(e) => updateForm('hourlyRate', e.target.value)}
      />

      <InputField
        label="Qualifications (comma-separated)"
        icon={BookOpen}
        placeholder="e.g. PhD Education, MEd Oxford, QEAC Certified"
        value={form.qualifications}
        onChange={(e) => updateForm('qualifications', e.target.value)}
      />

      <TextAreaField
        label="Description"
        placeholder="Describe your expertise, approach, and how you help students..."
        rows={3}
        value={form.description}
        onChange={(e) => updateForm('description', e.target.value)}
      />

      <TagSelector
        label="Specialisations"
        options={specialisationOptions}
        selected={form.specialisations}
        onChange={(val) => updateForm('specialisations', val)}
      />

      <TagSelector
        label="Languages"
        options={languageOptions}
        selected={form.languages}
        onChange={(val) => updateForm('languages', val)}
      />
    </div>
  );

  const renderStudentForm = () => (
    <div className="space-y-5">
      <div className="pb-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-purple-600" />
          Student Profile
        </h3>
      </div>

      <InputField
        label="Full Name"
        icon={User}
        required
        placeholder="e.g. Arun Kumar"
        value={form.name}
        onChange={(e) => updateForm('name', e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Email"
          icon={Mail}
          required
          type="email"
          placeholder="you@email.com"
          value={form.email}
          onChange={(e) => updateForm('email', e.target.value)}
        />
        <InputField
          label="Password"
          icon={User}
          required
          type="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(e) => updateForm('password', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Nationality"
          icon={Globe}
          required
          placeholder="e.g. Indian"
          value={form.nationality}
          onChange={(e) => updateForm('nationality', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Budget Range (AUD per year)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="number"
              placeholder="Min e.g. 25000"
              value={form.budgetMin}
              onChange={(e) => updateForm('budgetMin', e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="number"
              placeholder="Max e.g. 45000"
              value={form.budgetMax}
              onChange={(e) => updateForm('budgetMax', e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <TagSelector
        label="Interested Fields"
        options={courseOptions}
        selected={form.interestedIn}
        onChange={(val) => updateForm('interestedIn', val)}
      />

      <TagSelector
        label="Preferred Locations"
        options={locationOptions}
        selected={form.preferredLocations}
        onChange={(val) => updateForm('preferredLocations', val)}
      />
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {selectedRole === 'university' && 'Set up your institution'}
          {selectedRole === 'agent' && 'Set up your agency'}
          {selectedRole === 'consultant' && 'Create your profile'}
          {selectedRole === 'student' && 'Tell us about yourself'}
        </h2>
        <p className="text-gray-500 text-sm">
          Fill in the details below. Fields marked with * are required.
        </p>
      </div>

      {selectedRole === 'university' && renderUniversityForm()}
      {selectedRole === 'agent' && renderAgentForm()}
      {selectedRole === 'consultant' && renderConsultantForm()}
      {selectedRole === 'student' && renderStudentForm()}

      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-2 py-2.5 px-5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-medium text-sm transition-all duration-200 bg-gradient-to-r ${activeRoleCard?.color || 'from-primary-600 to-primary-500'} hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${activeRoleCard?.color || 'from-primary-600 to-primary-500'} flex items-center justify-center`}
      >
        <CheckCircle2 className="w-12 h-12 text-white" />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to EduConnect!</h2>
        <p className="text-gray-500 mb-2">Your account has been created successfully.</p>
        <p className="text-sm text-gray-400 mb-8">
          {selectedRole === 'student'
            ? 'Start exploring universities, agents, and consultants.'
            : 'Your profile is pending review. You can start setting up your dashboard in the meantime.'}
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="space-y-3"
      >
        <button
          type="button"
          onClick={() => navigate(dashboardRoutes[selectedRole] || '/')}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-medium text-sm bg-gradient-to-r ${activeRoleCard?.color || 'from-primary-600 to-primary-500'} hover:shadow-lg transition-all duration-200`}
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
        <Link
          to="/"
          className="block text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Return to Home
        </Link>
      </motion.div>

      {/* Confetti-like decorative elements */}
      <div className="relative mt-8">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: -40 - Math.random() * 40,
              x: (Math.random() - 0.5) * 120,
            }}
            transition={{
              duration: 1.5,
              delay: 0.1 + i * 0.15,
              ease: 'easeOut',
            }}
            className="absolute left-1/2 bottom-0"
          >
            <Sparkles className="w-4 h-4 text-primary-400" />
          </motion.div>
        ))}
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /*  Main render                                                        */
  /* ------------------------------------------------------------------ */

  const stepLabels = ['Choose Role', 'Your Details', 'All Set'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      {/* Top nav bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">EduConnect</span>
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Already have an account? <span className="text-primary-600">Sign in</span>
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      isCompleted
                        ? 'bg-primary-600 text-white'
                        : isActive
                        ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:block ${
                      isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress track */}
          <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
              initial={false}
              animate={{ width: `${((step - 1) / (stepLabels.length - 1)) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
