import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Shield, Eye, Lock } from 'lucide-react';

const sections = [
  {
    icon: Eye,
    title: 'Information We Collect',
    content: [
      'We collect information you provide directly when creating an account, such as your name, email address, phone number, and educational preferences.',
      'When you browse EduConnect, we automatically collect certain technical data including your IP address, browser type, device information, and pages visited. This helps us improve your experience on our platform.',
      'If you apply to universities or engage with education agents through our platform, we may collect additional details such as academic transcripts, test scores, and visa-related documentation that you choose to share.',
    ],
  },
  {
    icon: Shield,
    title: 'How We Use Your Information',
    content: [
      'We use your personal information to operate, maintain, and improve EduConnect, including matching you with relevant universities, programs, and education agents.',
      'Your data helps us personalise recommendations, process applications, facilitate communication between students and institutions, and provide customer support.',
      'We may use aggregated and anonymised data for research, analytics, and reporting purposes to enhance our services and the broader education community.',
    ],
  },
  {
    icon: Lock,
    title: 'Data Sharing and Disclosure',
    content: [
      'We share your information with universities and education agents only when you initiate contact or submit an application through our platform. We will always notify you before sharing your data with third parties.',
      'We may engage trusted service providers to assist with hosting, analytics, email delivery, and payment processing. These providers are bound by strict confidentiality agreements.',
      'We will disclose your information if required by law, regulation, legal process, or governmental request, or to protect the rights, safety, and property of EduConnect and its users.',
    ],
  },
  {
    icon: Shield,
    title: 'Your Rights',
    content: [
      'Under the Australian Privacy Act 1988 and applicable data protection laws, you have the right to access, correct, or delete your personal information held by EduConnect at any time.',
      'You may opt out of marketing communications by clicking the unsubscribe link in any promotional email or updating your notification preferences in your account settings.',
      'If you believe your data has been handled inappropriately, you have the right to lodge a complaint with the Office of the Australian Information Commissioner (OAIC).',
    ],
  },
  {
    icon: Eye,
    title: 'Cookies and Tracking Technologies',
    content: [
      'EduConnect uses cookies and similar technologies to remember your preferences, analyse site traffic, and deliver a personalised browsing experience. For full details, please see our Cookie Policy.',
      'You can manage your cookie preferences through your browser settings. Please note that disabling certain cookies may affect the functionality of our platform.',
    ],
  },
  {
    icon: Lock,
    title: 'Contact Us',
    content: [
      'If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Privacy Officer at privacy@educonnect.au.',
      'You can also write to us at: EduConnect Pty Ltd, Level 12, 200 Collins Street, Melbourne VIC 3000, Australia.',
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
              <Shield className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Privacy Policy
            </h1>
            <p className="mt-3 text-lg text-slate-500">
              Last updated: 1 March 2026
            </p>
            <p className="mt-4 text-slate-600">
              At EduConnect, we are committed to protecting your privacy and
              handling your personal information with care. This policy explains
              how we collect, use, and safeguard your data when you use our
              platform.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <section
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                      <Icon className="h-5 w-5 text-indigo-600" />
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
