import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Briefcase, Heart, Globe, Zap, Users } from 'lucide-react';

const perks = [
  {
    icon: Globe,
    title: 'Remote-Friendly',
    description:
      'Work from anywhere in Australia with flexible remote and hybrid options. We trust you to do your best work wherever you are.',
  },
  {
    icon: Heart,
    title: 'Health & Wellbeing',
    description:
      'Comprehensive health insurance, mental health support, and a generous wellness allowance to keep you at your best.',
  },
  {
    icon: Zap,
    title: 'Growth & Learning',
    description:
      'Annual learning budget of $2,000, conference attendance, and internal mentorship programs to fuel your career development.',
  },
  {
    icon: Users,
    title: 'Inclusive Culture',
    description:
      'Join a diverse team from over 15 countries. We celebrate different perspectives and foster an environment where everyone belongs.',
  },
  {
    icon: Briefcase,
    title: 'Competitive Package',
    description:
      'Market-leading salary, equity options, 25 days annual leave, and superannuation above the standard rate.',
  },
];

const positions = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Melbourne / Remote',
    type: 'Full-time',
    description:
      'Help build and scale our marketplace platform using React, Node.js, and cloud technologies. You will work across the entire stack to deliver features that impact thousands of students.',
  },
  {
    title: 'Partnerships Manager - Education',
    department: 'Business Development',
    location: 'Sydney / Melbourne',
    type: 'Full-time',
    description:
      'Grow our network of university and institutional partners across Australia. You will build relationships, negotiate agreements, and drive strategic growth.',
  },
  {
    title: 'UX Designer',
    department: 'Design',
    location: 'Melbourne / Remote',
    type: 'Full-time',
    description:
      'Design intuitive, accessible experiences for our diverse user base. You will conduct user research, create prototypes, and collaborate closely with engineers.',
  },
  {
    title: 'Student Success Coordinator',
    department: 'Operations',
    location: 'Melbourne',
    type: 'Full-time',
    description:
      'Support international students throughout their journey on EduConnect. You will handle enquiries, coordinate with agents, and ensure a seamless experience.',
  },
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Join Our Team
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Help us transform international education in Australia. We are
              building a platform that makes studying abroad accessible,
              transparent, and rewarding for everyone involved.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Why Work With Us */}
          <section className="py-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
              Why Work at EduConnect?
            </h2>
            <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto">
              We believe great work happens when people feel valued, supported,
              and inspired. Here is what you can expect when you join us.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {perks.map((perk) => (
                <div
                  key={perk.title}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <perk.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {perk.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {perk.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Open Positions */}
          <section className="py-16 border-t border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
              Open Positions
            </h2>
            <p className="text-slate-600 text-center mb-10">
              We are currently hiring for the following roles. Don not see a fit?
              Send us your CV anyway.
            </p>
            <div className="space-y-4">
              {positions.map((pos) => (
                <div
                  key={pos.title}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {pos.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-sm text-slate-500">
                          {pos.department}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-sm text-slate-500">
                          {pos.location}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-sm text-slate-500">
                          {pos.type}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`mailto:careers@educonnect.com.au?subject=${encodeURIComponent(
                        `Application: ${pos.title}`
                      )}&body=${encodeURIComponent(
                        `Hi EduConnect team,\n\nI would like to apply for the ${pos.title} position (${pos.department}, ${pos.location}).\n\nMy CV is attached.\n\nThanks,`
                      )}`}
                      className="self-start bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                    >
                      Apply Now
                    </a>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {pos.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Speculative CTA */}
          <section className="py-16 border-t border-slate-200">
            <div className="bg-blue-50 rounded-2xl p-8 text-center border border-blue-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Don not see your role?
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                We are always looking for talented people. Send us your CV and
                tell us how you would like to contribute to EduConnect.
              </p>
              <a
                href="mailto:careers@educonnect.com.au"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                <Briefcase className="w-5 h-5" />
                Send Your CV
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
