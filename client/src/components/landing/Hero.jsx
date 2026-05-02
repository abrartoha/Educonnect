import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Users, Building2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const statsData = [
  { icon: Building2, value: '500+', label: 'Universities' },
  { icon: Users, value: '2,000+', label: 'Agents' },
  { icon: GraduationCap, value: '50,000+', label: 'Students' },
];

export default function Hero({ viewMode = 'visitor' }) {
  const content = {
    student: {
      badge: "Your Journey Starts Here",
      heading: <>Find Your <span className="text-gradient">Dream University</span> in Australia</>,
      subheading: "Compare courses, discover scholarships, and connect with verified agents — all in one place. Your perfect Australian education is just a search away.",
      primaryCTA: { text: "Browse Universities", link: "/universities" },
      secondaryCTA: { text: "My Dashboard", link: "/student" },
    },
    partner: {
      badge: "Australia's #1 Education Marketplace",
      heading: <>The{' '}<span className="text-gradient">Future</span>{' '}of Education<br className="hidden sm:block" />{' '}Marketing in Australia</>,
      subheading: "The post-commission-ban marketplace connecting institutions, agents, and students through transparent, compliant, and AI-powered solutions.",
      primaryCTA: { text: "Explore Universities", link: "/universities" },
      secondaryCTA: { text: "Join as Partner", link: "/signup" },
    },
    visitor: {
      badge: "Australia's #1 Education Marketplace",
      heading: <>Where <span className="text-gradient">Students</span> and <span className="text-gradient">Institutions</span> Connect</>,
      subheading: "Whether you're looking for the perfect course or the right students, EduConnect brings Australia's education ecosystem together on one transparent platform.",
      primaryCTA: { text: "I'm a Student", link: "/signup" },
      secondaryCTA: { text: "I'm a Partner", link: "/signup" },
    },
  };

  const { badge, heading, subheading, primaryCTA, secondaryCTA } = content[viewMode];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-mesh">
      {/* Decorative floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="animate-float absolute top-20 left-[10%] w-72 h-72 rounded-full bg-primary-400/10 blur-3xl" />
        <div className="animate-float-delayed absolute bottom-32 right-[10%] w-96 h-96 rounded-full bg-accent-400/10 blur-3xl" />
        <div className="animate-float absolute top-1/3 right-[20%] w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl" />

        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Small floating accent circles */}
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-[5%] w-4 h-4 rounded-full bg-primary-400/30"
        />
        <motion.div
          animate={{ y: [10, -15, 10], rotate: [360, 180, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[60%] right-[8%] w-3 h-3 rounded-full bg-accent-400/40"
        />
        <motion.div
          animate={{ y: [-8, 12, -8] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[25%] left-[15%] w-5 h-5 rounded-full bg-emerald-400/25"
        />
        <motion.div
          animate={{ y: [5, -10, 5], x: [-5, 5, -5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[15%] right-[30%] w-2 h-2 rounded-full bg-primary-300/50"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[40%] right-[25%] w-6 h-6 rounded-full border-2 border-primary-300/30"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary-700 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow" />
            {badge}
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]"
          >
            {heading}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed"
          >
            {subheading}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to={primaryCTA.link}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg gradient-primary shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              {primaryCTA.text}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to={secondaryCTA.link}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg text-primary-700 border-2 border-primary-200 bg-white/60 backdrop-blur-sm hover:border-primary-400 hover:bg-white hover:-translate-y-0.5 transition-all duration-300"
            >
              {secondaryCTA.text}
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={itemVariants}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {statsData.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl glass hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8fafc] to-transparent" />
    </section>
  );
}
