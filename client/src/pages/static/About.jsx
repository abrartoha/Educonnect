import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Heart, Globe, Shield, Users, Target } from 'lucide-react';

const values = [
  {
    icon: Globe,
    title: 'Global Access',
    description:
      'We connect students from around the world with top-tier Australian educational institutions, breaking down geographic and informational barriers.',
  },
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description:
      'Every agent and consultant on our platform is verified. We maintain strict quality standards so students can make confident decisions.',
  },
  {
    icon: Heart,
    title: 'Student-First Approach',
    description:
      'Our platform is designed around student needs. From course discovery to enrolment, we prioritise the learner experience at every step.',
  },
  {
    icon: Users,
    title: 'Community & Support',
    description:
      'We foster a thriving community of students, educators, and advisors who share knowledge, experiences, and guidance throughout the journey.',
  },
];

const teamMembers = [
  { name: 'Sarah Mitchell', role: 'CEO & Co-Founder', initials: 'SM' },
  { name: 'James Chen', role: 'CTO & Co-Founder', initials: 'JC' },
  { name: 'Priya Sharma', role: 'Head of Partnerships', initials: 'PS' },
  { name: 'David Nguyen', role: 'Head of Student Success', initials: 'DN' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              About EduConnect
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              We are on a mission to make Australian education accessible to
              every international student, connecting learners with the right
              institutions, agents, and consultants to guide their journey.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Our Story */}
          <section className="py-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Our Story
            </h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                EduConnect was founded in Melbourne in 2023 by a team of
                education professionals who experienced firsthand the challenges
                international students face when navigating the Australian
                education system. From understanding visa requirements to
                choosing the right course and institution, the process can be
                overwhelming.
              </p>
              <p>
                We saw an opportunity to build a platform that brings together
                students, registered education agents, qualified consultants,
                and universities in one trusted marketplace. Today, EduConnect
                serves thousands of students from over 50 countries, partnering
                with leading Australian universities and TAFE institutions.
              </p>
              <p>
                Our platform has grown to become a trusted resource for students
                seeking quality education in Australia, with a focus on
                transparency, verified professionals, and personalised guidance
                every step of the way.
              </p>
            </div>
          </section>

          {/* Our Mission */}
          <section className="py-16 border-t border-slate-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Our Mission
                </h2>
              </div>
            </div>
            <p className="text-lg text-slate-600 leading-relaxed">
              To empower international students by providing a transparent,
              reliable, and comprehensive platform that simplifies the path to
              studying in Australia. We believe every student deserves access to
              quality education guidance, regardless of their background or
              location. By connecting students with verified agents, experienced
              consultants, and leading institutions, we aim to transform the
              international education experience.
            </p>
          </section>

          {/* Our Values */}
          <section className="py-16 border-t border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">
              Our Values
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Team Section */}
          <section className="py-16 border-t border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
              Meet Our Team
            </h2>
            <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto">
              Our diverse team brings together expertise in education,
              technology, and student support to build the best platform for
              international students.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <div key={member.name} className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">
                      {member.initials}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900">
                    {member.name}
                  </h3>
                  <p className="text-sm text-slate-500">{member.role}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
