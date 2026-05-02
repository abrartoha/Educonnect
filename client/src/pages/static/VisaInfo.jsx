import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  Plane,
} from 'lucide-react';

const requirements = [
  'Confirmation of Enrolment (CoE) from a CRICOS-registered Australian institution',
  'Valid passport with at least six months remaining validity',
  'Proof of financial capacity (tuition fees, living costs, return travel)',
  'Overseas Student Health Cover (OSHC) for the duration of your visa',
  'Evidence meeting the Genuine Student (GS) requirement',
  'English language proficiency test results (IELTS, TOEFL, PTE, or equivalent)',
  'Police clearance certificates from countries where you have lived for 12 months or more',
  'Health examination results if required based on your country of origin',
];

const applicationSteps = [
  {
    step: 1,
    title: 'Receive Your CoE',
    description:
      'After accepting an offer from an Australian institution and paying your deposit, you will receive a Confirmation of Enrolment (CoE). This is the primary document needed for your visa application.',
  },
  {
    step: 2,
    title: 'Arrange OSHC',
    description:
      'Purchase Overseas Student Health Cover from an approved provider. Your cover must begin on or before your course start date and extend for the duration of your visa.',
  },
  {
    step: 3,
    title: 'Gather Supporting Documents',
    description:
      'Collect all required documentation including financial evidence, English test scores, identity documents, and police clearances. Ensure all documents are certified or translated as needed.',
  },
  {
    step: 4,
    title: 'Create an ImmiAccount',
    description:
      'Register for an ImmiAccount on the Department of Home Affairs website. This online portal is where you will submit your application and upload supporting documents.',
  },
  {
    step: 5,
    title: 'Submit Your Application Online',
    description:
      'Complete the student visa application form (Form 157A) online through your ImmiAccount. Upload all supporting documents and pay the visa application charge.',
  },
  {
    step: 6,
    title: 'Complete Biometrics and Health Checks',
    description:
      'If required, attend a biometrics collection appointment and complete health examinations at an approved panel physician. You will be notified through your ImmiAccount if these are needed.',
  },
  {
    step: 7,
    title: 'Wait for a Decision',
    description:
      'Monitor your ImmiAccount for updates. You may be asked to provide additional information. Once approved, your visa grant notification will be sent electronically.',
  },
];

const tips = [
  {
    title: 'Apply Early',
    description:
      'Submit your visa application at least 8 to 12 weeks before your course start date to allow for processing time and any unexpected delays.',
  },
  {
    title: 'Be Honest and Accurate',
    description:
      'Provide truthful and consistent information in your application. Discrepancies between your application and supporting documents can lead to delays or refusal.',
  },
  {
    title: 'Prepare for the GS Requirement',
    description:
      'Write a genuine and detailed statement explaining your reasons for choosing Australia, your chosen course, and how it connects to your future career plans.',
  },
  {
    title: 'Keep Digital Copies',
    description:
      'Maintain digital copies of all documents submitted. If originals are requested or additional evidence is needed, you will have them readily available.',
  },
  {
    title: 'Understand Your Visa Conditions',
    description:
      'Familiarise yourself with the conditions attached to your visa, including study requirements, work limitations, and the obligation to maintain your OSHC.',
  },
  {
    title: 'Use a Registered Agent',
    description:
      'Consider using a registered migration agent or education agent to help with your application. EduConnect can connect you with verified and qualified agents.',
  },
];

export default function VisaInfo() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100">
              <Plane className="h-8 w-8 text-sky-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Visa Information
            </h1>
            <p className="mt-3 text-lg text-slate-500">
              Your guide to the Australian Student Visa (subclass 500)
            </p>
          </div>

          {/* Overview */}
          <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
                <FileText className="h-5 w-5 text-sky-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Student Visa (Subclass 500)
              </h2>
            </div>
            <div className="space-y-3">
              <p className="leading-relaxed text-slate-600">
                The Student Visa (subclass 500) allows international students to
                stay in Australia to study full-time at an eligible educational
                institution. This visa covers all education sectors including
                primary and secondary school, higher education, vocational
                education, English language courses, and postgraduate research.
              </p>
              <p className="leading-relaxed text-slate-600">
                The visa is typically granted for the duration of your enrolled
                course plus additional time before and after. You can work up to
                48 hours per fortnight while your course is in session, and
                unlimited hours during scheduled breaks.
              </p>
            </div>
          </section>

          {/* Requirements */}
          <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Requirements
              </h2>
            </div>
            <p className="mb-4 leading-relaxed text-slate-600">
              To be eligible for a Student Visa (subclass 500), you must meet
              the following requirements:
            </p>
            <ul className="space-y-3">
              {requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Application Process */}
          <section className="mb-10">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">
              Application Process
            </h2>
            <div className="space-y-4">
              {applicationSteps.map((item) => (
                <div
                  key={item.step}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Processing Times and Costs */}
          <div className="mb-10 grid gap-6 sm:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Processing Times
                </h2>
              </div>
              <div className="space-y-3 text-slate-600">
                <p className="leading-relaxed">
                  Processing times vary depending on your country of passport
                  and individual circumstances. As a general guide:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    <span>75% of applications: 29 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    <span>90% of applications: 42 days</span>
                  </li>
                </ul>
                <p className="text-sm text-slate-500">
                  Check the Department of Home Affairs website for the most
                  current processing times.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Visa Costs
                </h2>
              </div>
              <div className="space-y-3 text-slate-600">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    <span>
                      <strong>Application charge:</strong> AUD $710 (primary
                      applicant)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    <span>
                      <strong>Subsequent applicant (18+):</strong> AUD $530
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    <span>
                      <strong>Subsequent applicant (under 18):</strong> AUD $175
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-slate-500">
                  Additional costs may include health examinations, police
                  clearances, and English testing fees.
                </p>
              </div>
            </section>
          </div>

          {/* Tips */}
          <section className="mb-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Tips for a Successful Application
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="mb-2 font-semibold text-slate-900">
                    {tip.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {tip.description}
                  </p>
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
