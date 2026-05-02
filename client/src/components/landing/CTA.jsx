import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const content = {
  student: {
    badge: "100% free for students",
    heading: "Ready to Find Your Perfect Course?",
    subtext: "Create your free profile and start exploring universities, courses, and scholarships across Australia. Your verified agent is just a click away.",
    primaryCTA: { text: "Start Exploring", link: "/universities" },
    secondaryCTA: { text: "Go to Dashboard", link: "/student" },
  },
  partner: {
    badge: "Free to get started",
    heading: "Ready to Transform Education Marketing?",
    subtext: "Join Australia's fastest-growing education marketplace. Connect with verified institutions, agents, and thousands of students — all on one transparent, compliant platform.",
    primaryCTA: { text: "Get Started Free", link: "/signup" },
    secondaryCTA: { text: "Book a Demo", link: "/contact" },
  },
  visitor: {
    badge: "Free to get started",
    heading: "Ready to Get Started?",
    subtext: "Join thousands of students, institutions, and agents already on Australia's most transparent education marketplace.",
    primaryCTA: { text: "Sign Up Free", link: "/signup" },
    secondaryCTA: { text: "Learn More", link: "/universities" },
  },
};

export default function CTA({ viewMode = 'visitor' }) {
  const { badge, heading, subtext, primaryCTA, secondaryCTA } = content[viewMode];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating orbs */}
        <motion.div
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 left-[10%] w-64 h-64 rounded-full bg-white/5 blur-2xl"
        />
        <motion.div
          animate={{ y: [15, -25, 15] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-10 right-[10%] w-80 h-80 rounded-full bg-accent-500/10 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary-400/10 blur-3xl"
        />

        {/* Small floating dots */}
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] right-[20%] w-3 h-3 rounded-full bg-white/20"
        />
        <motion.div
          animate={{ y: [6, -10, 6] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[30%] left-[15%] w-2 h-2 rounded-full bg-white/15"
        />
        <motion.div
          animate={{ y: [-5, 12, -5], x: [3, -3, 3] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[40%] left-[30%] w-4 h-4 rounded-full border border-white/10"
        />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Sparkle badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-white/90 mb-8">
            <Sparkles className="w-4 h-4" />
            {badge}
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            {heading}
          </h2>

          <p className="mt-6 text-lg sm:text-xl text-primary-100/80 max-w-2xl mx-auto leading-relaxed">
            {subtext}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={primaryCTA.link}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-primary-700 font-semibold text-lg shadow-xl shadow-primary-900/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              {primaryCTA.text}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to={secondaryCTA.link}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg text-white border-2 border-white/30 hover:bg-white/10 hover:border-white/50 hover:-translate-y-0.5 transition-all duration-300"
            >
              {secondaryCTA.text}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
