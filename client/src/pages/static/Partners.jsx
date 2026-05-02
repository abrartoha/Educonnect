import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Handshake, CheckCircle, ArrowRight, Users } from 'lucide-react';

const benefits = [
  {
    title: 'Reach Thousands of Students',
    description:
      'Access a growing network of international students actively seeking Australian education opportunities. Our platform attracts students from over 50 countries.',
  },
  {
    title: 'Verified Professional Profile',
    description:
      'Stand out with a verified badge that builds trust with prospective students. Showcase your credentials, specialisations, and student reviews.',
  },
  {
    title: 'Streamlined Communication',
    description:
      'Connect directly with students through our messaging system. Schedule consultations, share documents, and manage applications all in one place.',
  },
  {
    title: 'Data-Driven Insights',
    description:
      'Access analytics about your profile performance, student engagement, and market trends to optimise your services and grow your business.',
  },
  {
    title: 'Marketing & Visibility',
    description:
      'Benefit from our marketing efforts across social media, search engines, and education fairs. Your profile appears in relevant student searches automatically.',
  },
  {
    title: 'Dedicated Partner Support',
    description:
      'Our partner success team provides onboarding assistance, technical support, and ongoing guidance to help you make the most of the platform.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Submit Your Application',
    description:
      'Fill out our partner application form with your professional details, qualifications, and areas of specialisation.',
  },
  {
    number: '02',
    title: 'Verification Process',
    description:
      'Our team reviews your credentials including MARA registration (for agents), qualifications, and professional references.',
  },
  {
    number: '03',
    title: 'Set Up Your Profile',
    description:
      'Create a compelling profile showcasing your expertise, services offered, fees (if applicable), and languages spoken.',
  },
  {
    number: '04',
    title: 'Start Connecting',
    description:
      'Once approved, your profile goes live and you can start connecting with students seeking your expertise.',
  },
];

export default function Partners() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Handshake className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Partner With EduConnect
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Join Australia's growing education marketplace. Whether you are an
              education agent, consultant, or institution, we provide the
              platform and tools to connect you with international students.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Benefits */}
          <section className="py-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
              Why Partner With Us?
            </h2>
            <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto">
              EduConnect provides the tools, visibility, and support you need to
              grow your education advisory practice.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Steps */}
          <section className="py-16 border-t border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
              How to Get Started
            </h2>
            <p className="text-slate-600 text-center mb-10">
              Becoming an EduConnect partner is straightforward. Here is how it
              works.
            </p>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-start gap-5"
                >
                  <div className="flex-shrink-0 w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {step.number}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-1">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0 mt-4 hidden lg:block" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Partner Types */}
          <section className="py-16 border-t border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">
              Who Can Partner With Us?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                <Users className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Education Agents
                </h3>
                <p className="text-slate-600 mb-4">
                  MARA-registered or institutionally authorised agents who
                  represent Australian universities and help students with
                  applications and enrolment.
                </p>
                <Link
                  to="/signup?role=agent"
                  className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition"
                >
                  Register as Agent
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
                <Handshake className="w-10 h-10 text-emerald-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Education Consultants
                </h3>
                <p className="text-slate-600 mb-4">
                  Independent advisors who provide personalised guidance on
                  course selection, career planning, and the broader study
                  abroad experience.
                </p>
                <Link
                  to="/signup?role=consultant"
                  className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition"
                >
                  Register as Consultant
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 border-t border-slate-200">
            <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-2">
                Ready to grow your practice?
              </h3>
              <p className="text-blue-100 mb-6 max-w-md mx-auto">
                Join hundreds of education professionals already connecting with
                students on EduConnect.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
              >
                Get Started Today
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
