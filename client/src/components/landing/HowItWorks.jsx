import { motion } from 'framer-motion';
import { UserPlus, Search, TrendingUp } from 'lucide-react';

const stepStyles = [
  { number: '01', icon: UserPlus, color: 'from-primary-500 to-primary-600', iconBg: 'bg-primary-100 text-primary-600' },
  { number: '02', icon: Search, color: 'from-accent-500 to-accent-600', iconBg: 'bg-accent-100 text-accent-600' },
  { number: '03', icon: TrendingUp, color: 'from-emerald-500 to-emerald-600', iconBg: 'bg-emerald-100 text-emerald-600' },
];

const stepContent = {
  student: {
    subheading: 'Three simple steps to finding your perfect course in Australia.',
    steps: [
      { title: 'Create Your Profile', description: 'Tell us about your study goals, preferred locations, budget, and qualifications. It takes less than two minutes.' },
      { title: 'Explore & Compare', description: 'Browse courses, compare universities, check scholarship eligibility, and get AI-powered recommendations tailored to you.' },
      { title: 'Apply with Confidence', description: 'Connect with a verified agent, get guided through your application, and track your progress every step of the way.' },
    ],
  },
  partner: {
    subheading: 'Get started in three simple steps. Whether you are an institution, agent, or student, the process is seamless.',
    steps: [
      { title: 'Sign Up & Create Profile', description: 'Register as an institution, agent, or student. Build your profile with relevant details, certifications, and preferences in minutes.' },
      { title: 'Connect & Discover', description: 'Browse verified universities, find trusted agents, or discover ideal courses. Our AI-powered matching makes connections effortless.' },
      { title: 'Grow & Succeed', description: 'Track performance with real-time analytics, manage relationships, and scale your reach across the Australian education market.' },
    ],
  },
  visitor: {
    subheading: 'Get started in three simple steps, no matter who you are.',
    steps: [
      { title: 'Join in Minutes', description: 'Sign up as a student, institution, agent, or consultant. Set up your profile with the details that matter in minutes.' },
      { title: 'Discover & Connect', description: 'Students explore courses and find trusted advisors. Institutions and agents discover new opportunities and partnerships.' },
      { title: 'Achieve Your Goals', description: 'Students land their dream course. Partners grow their reach. The platform supports success for everyone.' },
    ],
  },
};

function getSteps(viewMode) {
  const content = stepContent[viewMode];
  return content.steps.map((step, i) => ({
    ...stepStyles[i],
    title: step.title,
    description: step.description,
  }));
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HowItWorks({ viewMode = 'visitor' }) {
  const steps = getSteps(viewMode);
  const { subheading } = stepContent[viewMode];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/80">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            How It{' '}
            <span className="text-gradient">Works</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            {subheading}
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="relative grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8"
        >
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-24 left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-gray-300" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step number circle */}
              <div className="relative mb-8">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg z-10 relative`}
                >
                  <step.icon className="w-9 h-9 text-white" />
                </div>
                {/* Number badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center z-20">
                  <span className="text-xs font-bold text-gray-700">{step.number}</span>
                </div>
                {/* Glow ring */}
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-20 blur-xl scale-150`}
                />
              </div>

              {/* Content card */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 w-full hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
