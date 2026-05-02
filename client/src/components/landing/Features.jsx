import { motion } from 'framer-motion';
import {
  Bot,
  Megaphone,
  ShieldCheck,
  BarChart3,
  Globe,
  FileCheck,
  Search,
  DollarSign,
  UserCheck,
  GitCompareArrows,
} from 'lucide-react';

/* ── Partner features (original set) ── */
const partnerFeatures = [
  {
    icon: Bot,
    title: 'AI-Powered Matching',
    description: 'Smart algorithms connect students with ideal institutions based on goals, budget, and preferences.',
    color: 'bg-primary-100 text-primary-600',
    borderHover: 'hover:border-primary-300',
  },
  {
    icon: Megaphone,
    title: 'Marketing Hub',
    description: 'Comprehensive campaign tools for institutions to reach prospective students across channels.',
    color: 'bg-accent-100 text-accent-600',
    borderHover: 'hover:border-accent-300',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Network',
    description: 'Every agent and consultant is vetted and verified, ensuring trust and quality at every step.',
    color: 'bg-emerald-100 text-emerald-600',
    borderHover: 'hover:border-emerald-300',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Data-driven insights on student engagement, conversion rates, and campaign performance.',
    color: 'bg-blue-100 text-blue-600',
    borderHover: 'hover:border-blue-300',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Reach international students in 20+ languages with localised content and support.',
    color: 'bg-purple-100 text-purple-600',
    borderHover: 'hover:border-purple-300',
  },
  {
    icon: FileCheck,
    title: 'Compliance Ready',
    description: 'Fully compliant with post-April 2025 regulations. No commissions, just transparent partnerships.',
    color: 'bg-rose-100 text-rose-600',
    borderHover: 'hover:border-rose-300',
  },
];

/* ── Student features ── */
const studentFeatures = [
  {
    icon: Search,
    title: 'Course Finder',
    description: 'Search and filter thousands of courses across Australian universities by subject, location, fees, and intake dates.',
    color: 'bg-indigo-100 text-indigo-600',
    borderHover: 'hover:border-indigo-300',
  },
  {
    icon: Bot,
    title: 'AI Recommendations',
    description: 'Get personalised university and course suggestions based on your academic background, budget, and career goals.',
    color: 'bg-purple-100 text-purple-600',
    borderHover: 'hover:border-purple-300',
  },
  {
    icon: DollarSign,
    title: 'Scholarship Alerts',
    description: 'Discover scholarships you qualify for. We match your profile to available funding opportunities automatically.',
    color: 'bg-emerald-100 text-emerald-600',
    borderHover: 'hover:border-emerald-300',
  },
  {
    icon: UserCheck,
    title: 'Verified Agents',
    description: 'Connect with vetted, licensed education agents who provide genuine guidance without conflicts of interest.',
    color: 'bg-blue-100 text-blue-600',
    borderHover: 'hover:border-blue-300',
  },
  {
    icon: GitCompareArrows,
    title: 'Course Comparison',
    description: 'Compare universities side by side on fees, rankings, graduate outcomes, and campus facilities.',
    color: 'bg-accent-100 text-accent-600',
    borderHover: 'hover:border-accent-300',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Access the platform in 20+ languages with localised guidance tailored to international students.',
    color: 'bg-rose-100 text-rose-600',
    borderHover: 'hover:border-rose-300',
  },
];

/* ── Visitor features ── */
const visitorFeatures = [
  {
    icon: Search,
    title: 'Smart Course Discovery',
    description: 'Students find their perfect course. Institutions reach their ideal candidates. AI powers the match.',
    color: 'bg-indigo-100 text-indigo-600',
    borderHover: 'hover:border-indigo-300',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted & Verified',
    description: 'Every agent, consultant, and institution is vetted. Transparency and trust are built into the platform.',
    color: 'bg-emerald-100 text-emerald-600',
    borderHover: 'hover:border-emerald-300',
  },
  {
    icon: Bot,
    title: 'AI-Powered Platform',
    description: 'From personalised recommendations to campaign analytics, AI drives better outcomes for everyone.',
    color: 'bg-purple-100 text-purple-600',
    borderHover: 'hover:border-purple-300',
  },
  {
    icon: BarChart3,
    title: 'Data-Driven Insights',
    description: 'Students track applications. Institutions measure engagement. Everyone makes informed decisions.',
    color: 'bg-blue-100 text-blue-600',
    borderHover: 'hover:border-blue-300',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Reach and serve international students in 20+ languages with localised content and support.',
    color: 'bg-accent-100 text-accent-600',
    borderHover: 'hover:border-accent-300',
  },
  {
    icon: FileCheck,
    title: 'Post-Commission Compliant',
    description: 'Built for the new regulatory era. No commissions, just transparent value for students and partners alike.',
    color: 'bg-rose-100 text-rose-600',
    borderHover: 'hover:border-rose-300',
  },
];

/* ── Lookup maps ── */
const featureSets = {
  student: studentFeatures,
  partner: partnerFeatures,
  visitor: visitorFeatures,
};

const headings = {
  student: {
    title: 'Everything You Need to Study in Australia',
    sub: 'Tools to find the right course, compare options, and connect with trusted advisors — all designed around your journey.',
  },
  partner: {
    title: 'Everything You Need',
    sub: 'A complete platform designed for the modern Australian education ecosystem. Tools, insights, and connections — all in one place.',
  },
  visitor: {
    title: 'Built for Everyone in Education',
    sub: 'Whether you\'re a student searching for courses or an institution reaching new markets, EduConnect has the tools you need.',
  },
};

/* ── Animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Features({ viewMode = 'visitor' }) {
  const features = featureSets[viewMode];
  const heading = headings[viewMode];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            {heading.title.includes('Need') ? (
              <>
                Everything You{' '}
                <span className="text-gradient">Need</span>
              </>
            ) : heading.title.includes('Study') ? (
              <>
                Everything You Need to{' '}
                <span className="text-gradient">Study in Australia</span>
              </>
            ) : (
              <>
                Built for{' '}
                <span className="text-gradient">Everyone in Education</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            {heading.sub}
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className={`group relative p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${feature.borderHover}`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.color} mb-6`}>
                <feature.icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Subtle hover accent */}
              <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r from-primary-500 to-primary-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
