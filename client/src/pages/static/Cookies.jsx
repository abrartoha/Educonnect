import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Settings, Info, Shield } from 'lucide-react';

const cookieTypes = [
  {
    name: 'Essential Cookies',
    description:
      'These cookies are necessary for EduConnect to function properly. They enable core features such as user authentication, session management, and security. Essential cookies cannot be disabled as the platform will not work without them.',
    examples: [
      'Session identifiers to keep you logged in',
      'Security tokens to protect against cross-site request forgery',
      'Load-balancing cookies to ensure platform stability',
    ],
  },
  {
    name: 'Analytics Cookies',
    description:
      'We use analytics cookies to understand how visitors interact with EduConnect. This data helps us improve platform performance, identify popular content, and fix usability issues. All analytics data is aggregated and anonymised.',
    examples: [
      'Pages visited and time spent on each page',
      'Navigation paths through the platform',
      'Error tracking to identify and resolve technical issues',
    ],
  },
  {
    name: 'Preference Cookies',
    description:
      'Preference cookies remember your settings and choices to provide a more personalised experience. These are not strictly necessary but enhance your use of the platform.',
    examples: [
      'Language and region preferences',
      'Display settings and layout choices',
      'Recently viewed universities and saved searches',
    ],
  },
];

const sections = [
  {
    icon: Info,
    title: 'What Are Cookies?',
    content: [
      'Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give site owners useful information about how their site is used.',
      'EduConnect uses cookies and similar tracking technologies (such as local storage and pixel tags) to operate our platform, analyse usage, and personalise your experience.',
    ],
  },
  {
    icon: Settings,
    title: 'Managing Your Cookie Preferences',
    content: [
      'Most web browsers allow you to control cookies through their settings. You can typically set your browser to refuse all cookies, accept only first-party cookies, or delete cookies when you close your browser.',
      'Please note that if you disable essential cookies, some features of EduConnect may not function correctly. Disabling analytics or preference cookies will not affect core functionality but may result in a less personalised experience.',
      'To manage cookies in popular browsers, visit your browser settings under "Privacy" or "Cookies." You can also use browser extensions that provide more granular control over cookie acceptance.',
    ],
  },
  {
    icon: Shield,
    title: 'Contact Us',
    content: [
      'If you have questions about our use of cookies or wish to learn more about how we handle your data, please refer to our Privacy Policy or contact us at privacy@educonnect.au.',
      'EduConnect Pty Ltd, Level 12, 200 Collins Street, Melbourne VIC 3000, Australia.',
    ],
  },
];

export default function Cookies() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
              <Settings className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Cookie Policy
            </h1>
            <p className="mt-3 text-lg text-slate-500">
              Last updated: 1 March 2026
            </p>
            <p className="mt-4 text-slate-600">
              This policy explains how EduConnect uses cookies and similar
              technologies when you visit our platform.
            </p>
          </div>

          {/* What Are Cookies section */}
          <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <Info className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                What Are Cookies?
              </h2>
            </div>
            <div className="space-y-3">
              {sections[0].content.map((p, i) => (
                <p key={i} className="leading-relaxed text-slate-600">
                  {p}
                </p>
              ))}
            </div>
          </section>

          {/* Cookie Types */}
          <section className="mb-10">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">
              Types of Cookies We Use
            </h2>
            <div className="space-y-6">
              {cookieTypes.map((type, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  <h3 className="mb-3 text-lg font-semibold text-slate-900">
                    {type.name}
                  </h3>
                  <p className="mb-4 leading-relaxed text-slate-600">
                    {type.description}
                  </p>
                  <ul className="space-y-2">
                    {type.examples.map((example, eIdx) => (
                      <li
                        key={eIdx}
                        className="flex items-start gap-2 text-slate-600"
                      >
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Remaining sections */}
          <div className="space-y-10">
            {sections.slice(1).map((section, idx) => {
              const Icon = section.icon;
              return (
                <section
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                      <Icon className="h-5 w-5 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {section.title}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {section.content.map((paragraph, pIdx) => (
                      <p key={pIdx} className="leading-relaxed text-slate-600">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
