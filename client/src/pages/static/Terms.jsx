import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { FileText, Scale, AlertTriangle } from 'lucide-react';

const sections = [
  {
    icon: FileText,
    title: '1. Acceptance of Terms',
    content: [
      'By accessing or using EduConnect, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you must not use our platform.',
      'We reserve the right to modify these terms at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms. We will notify registered users of material changes via email.',
    ],
  },
  {
    icon: FileText,
    title: '2. User Accounts',
    content: [
      'To access certain features of EduConnect, you must create an account and provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your login credentials.',
      'You must be at least 16 years of age to create an account. If you are under 18, you represent that you have parental or guardian consent to use the platform.',
      'EduConnect reserves the right to suspend or terminate accounts that violate these terms, provide false information, or engage in fraudulent activity.',
    ],
  },
  {
    icon: Scale,
    title: '3. Platform Use',
    content: [
      'EduConnect provides a marketplace connecting prospective students with Australian universities, education agents, and consultants. We facilitate introductions and information sharing but do not guarantee admission to any institution.',
      'You agree not to use the platform to post misleading content, impersonate others, harvest user data, distribute spam or malware, or engage in any unlawful activity.',
      'Education agents and consultants listed on the platform operate independently. EduConnect does not endorse or guarantee the services of any third-party provider.',
    ],
  },
  {
    icon: FileText,
    title: '4. Intellectual Property',
    content: [
      'All content on EduConnect, including text, graphics, logos, icons, images, and software, is the property of EduConnect Pty Ltd or its content suppliers and is protected by Australian and international intellectual property laws.',
      'You may not reproduce, distribute, modify, or create derivative works from any content on the platform without our prior written consent.',
      'By submitting content to EduConnect (such as reviews or forum posts), you grant us a non-exclusive, worldwide, royalty-free licence to use, display, and distribute that content in connection with our services.',
    ],
  },
  {
    icon: AlertTriangle,
    title: '5. Limitation of Liability',
    content: [
      'EduConnect is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the accuracy, reliability, or availability of the platform or the information provided.',
      'To the maximum extent permitted by Australian law, EduConnect shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of or inability to use the platform.',
      'Our total liability to you for any claims arising from your use of the platform shall not exceed the amount you have paid to EduConnect, if any, in the twelve months preceding the claim.',
    ],
  },
  {
    icon: Scale,
    title: '6. Governing Law',
    content: [
      'These Terms of Service are governed by and construed in accordance with the laws of the State of Victoria, Australia, without regard to its conflict of law provisions.',
      'Any disputes arising from these terms or your use of EduConnect shall be subject to the exclusive jurisdiction of the courts of Victoria, Australia.',
      'Nothing in these terms excludes, restricts, or modifies any consumer guarantee, right, or remedy conferred by the Australian Consumer Law (Schedule 2 of the Competition and Consumer Act 2010) that cannot be excluded, restricted, or modified by agreement.',
    ],
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
              <FileText className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Terms of Service
            </h1>
            <p className="mt-3 text-lg text-slate-500">
              Last updated: 1 March 2026
            </p>
            <p className="mt-4 text-slate-600">
              Please read these Terms of Service carefully before using
              EduConnect. These terms govern your access to and use of our
              education marketplace platform.
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
