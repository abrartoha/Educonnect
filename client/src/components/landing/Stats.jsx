import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Building2, Users, GraduationCap, Star } from 'lucide-react';

const stats = [
  { icon: Building2, value: 500, suffix: '+', label: 'Partner Institutions' },
  { icon: Users, value: 2400, suffix: '+', label: 'Verified Agents' },
  { icon: GraduationCap, value: 50000, suffix: '+', label: 'Students Connected' },
  { icon: Star, value: 98, suffix: '%', label: 'Satisfaction Rate' },
];

function formatNumber(num) {
  if (num >= 1000) {
    return num.toLocaleString();
  }
  return num.toString();
}

function AnimatedCounter({ target, suffix, inView }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [inView, target]);

  return (
    <span className="text-4xl sm:text-5xl font-extrabold text-white tabular-nums">
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

const sectionContent = {
  student: {
    heading: 'Trusted by Students Everywhere',
    subheading: 'Join thousands of students who found their path through EduConnect.',
  },
  partner: {
    heading: 'Trusted by the Industry',
    subheading: 'Numbers that reflect our commitment to transforming education marketing.',
  },
  visitor: {
    heading: 'Trusted by the Industry',
    subheading: 'Numbers that reflect our commitment to transforming education marketing.',
  },
};

export default function Stats({ viewMode = 'visitor' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { heading, subheading } = sectionContent[viewMode];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900" />

      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full bg-primary-400/5 blur-3xl" />
      </div>

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #a5b4fc 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
            {heading}
          </h2>
          <p className="mt-4 text-lg text-primary-200/80 max-w-xl mx-auto">
            {subheading}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-dark rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-5">
                <stat.icon className="w-7 h-7 text-primary-300" />
              </div>
              <AnimatedCounter
                target={stat.value}
                suffix={stat.suffix}
                inView={isInView}
              />
              <p className="mt-2 text-sm text-primary-200/70 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
