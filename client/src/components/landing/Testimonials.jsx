import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote:
      'EduConnect transformed how we recruit international students. The transparency and compliance tools give us confidence in every partnership we form.',
    name: 'Dr. Sarah Mitchell',
    role: 'Director of International Admissions',
    organisation: 'University of Melbourne',
    avatar: 'https://placehold.co/80x80/4f46e5/white?text=SM',
    rating: 5,
  },
  {
    quote:
      'As an international student from India, finding the right university was overwhelming. EduConnect matched me with the perfect course and a verified agent who guided me through every step.',
    name: 'Arjun Patel',
    role: 'International Student from India',
    organisation: 'Monash University',
    avatar: 'https://placehold.co/80x80/059669/white?text=AP',
    rating: 5,
  },
  {
    quote:
      'The post-commission model is exactly what our industry needed. We can now focus on providing genuine value to students without conflicts of interest.',
    name: 'Jennifer Nguyen',
    role: 'Licensed Education Agent',
    organisation: 'EduPath Consulting',
    avatar: 'https://placehold.co/80x80/f97316/white?text=JN',
    rating: 5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Testimonials() {
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
            Trusted by{' '}
            <span className="text-gradient">Thousands</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from institutions, agents, and students who have experienced the EduConnect difference.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={cardVariants}
              className="relative group p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Quote icon */}
              <div className="mb-6">
                <Quote className="w-10 h-10 text-primary-200 fill-primary-100" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-gray-700 leading-relaxed mb-8 min-h-[96px]">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow"
                />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                  <p className="text-xs text-primary-600 font-medium">
                    {testimonial.organisation}
                  </p>
                </div>
              </div>

              {/* Subtle hover gradient at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r from-primary-500 via-accent-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
