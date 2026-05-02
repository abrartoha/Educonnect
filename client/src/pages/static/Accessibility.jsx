import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Eye, CheckCircle, MessageCircle } from 'lucide-react';

const commitments = [
  'All images and media include descriptive alternative text',
  'Full keyboard navigation support across the platform',
  'Sufficient colour contrast ratios meeting WCAG AA standards',
  'Semantic HTML structure with proper heading hierarchy',
  'ARIA labels and landmarks for assistive technology compatibility',
  'Responsive design that adapts to various screen sizes and zoom levels',
  'Form inputs with clear labels, instructions, and error messages',
  'Skip navigation links for efficient keyboard-based browsing',
];

const ongoingEfforts = [
  {
    title: 'Regular Audits',
    description:
      'We conduct quarterly accessibility audits using both automated tools and manual testing with assistive technologies to identify and address issues.',
  },
  {
    title: 'Team Training',
    description:
      'Our development and content teams receive regular training on accessibility best practices and inclusive design principles.',
  },
  {
    title: 'User Testing',
    description:
      'We include people with disabilities in our user testing process to ensure real-world usability and gather valuable feedback.',
  },
  {
    title: 'Continuous Improvement',
    description:
      'Accessibility is an ongoing effort. We continuously monitor new features and content updates to maintain compliance with evolving standards.',
  },
];

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <Eye className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Accessibility Statement
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              EduConnect is committed to ensuring digital accessibility for
              people of all abilities. We strive to provide an inclusive
              experience that meets the Web Content Accessibility Guidelines
              (WCAG) 2.1 at the AA level.
            </p>
          </div>

          {/* Our Commitment */}
          <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                What We Do
              </h2>
            </div>
            <p className="mb-6 leading-relaxed text-slate-600">
              We believe that everyone deserves equal access to educational
              opportunities. Our platform is designed and developed with
              accessibility at its core. Here are the measures we have
              implemented:
            </p>
            <ul className="space-y-3">
              {commitments.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Ongoing Efforts */}
          <section className="mb-10">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">
              Our Ongoing Efforts
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {ongoingEfforts.map((effort, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    {effort.title}
                  </h3>
                  <p className="leading-relaxed text-slate-600">
                    {effort.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Report Issues */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Report an Accessibility Issue
              </h2>
            </div>
            <div className="space-y-3">
              <p className="leading-relaxed text-slate-600">
                We welcome your feedback on the accessibility of EduConnect. If
                you encounter any barriers or have suggestions for improvement,
                please let us know.
              </p>
              <p className="leading-relaxed text-slate-600">
                You can reach our accessibility team by emailing{' '}
                <a
                  href="mailto:accessibility@educonnect.au"
                  className="font-medium text-indigo-600 underline hover:text-indigo-700"
                >
                  accessibility@educonnect.au
                </a>
                . Please include a description of the issue, the page URL, and
                your browser or assistive technology details. We aim to respond
                within two business days.
              </p>
              <p className="leading-relaxed text-slate-600">
                If you are not satisfied with our response, you may escalate
                your concern to the Australian Human Rights Commission.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
