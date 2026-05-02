import { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'What is EduConnect and how does it work?',
    answer:
      'EduConnect is an Australian education marketplace that connects international students with verified education agents, qualified consultants, and leading universities. You can browse institutions, compare courses, and get personalised guidance from professionals who specialise in international student enrolment.',
  },
  {
    question: 'How do I apply to an Australian university through EduConnect?',
    answer:
      'Start by browsing our university listings and finding courses that match your interests. You can then connect with a verified education agent or consultant who will guide you through the application process, including document preparation, course selection, and visa requirements. Agents can submit applications on your behalf directly to institutions.',
  },
  {
    question: 'Are there any fees for using EduConnect as a student?',
    answer:
      'Creating an account and browsing universities, agents, and consultants on EduConnect is completely free for students. Some consultants may charge a fee for premium advisory services, which will be clearly displayed on their profile. Education agents are generally paid by the institutions they represent, so their services are typically free for students.',
  },
  {
    question: 'What is the difference between an agent and a consultant?',
    answer:
      'Education agents are authorised representatives of specific universities and can process applications on their behalf. Their services are usually free for students as they are paid by the institutions. Consultants are independent advisors who provide broader guidance on study options, career planning, and visa strategies. Some consultants may charge a fee for their personalised services.',
  },
  {
    question: 'How are agents and consultants verified on the platform?',
    answer:
      'All agents and consultants undergo a rigorous verification process before being listed on EduConnect. Agents must hold valid MARA registration or institutional authorisation. Consultants must demonstrate relevant qualifications and experience. We also collect and display genuine student reviews to help you make informed decisions.',
  },
  {
    question: 'Can I get help with my student visa application?',
    answer:
      'Yes. Many of our agents and consultants are qualified to provide visa guidance. Registered migration agents (MARA-registered) can assist with visa applications directly. Others can help you prepare the necessary documents and understand the requirements. Always ensure your advisor holds appropriate registration for migration advice.',
  },
  {
    question: 'What types of courses and institutions are listed?',
    answer:
      'EduConnect features a wide range of Australian educational institutions including Group of Eight universities, other leading universities, TAFE colleges, and registered training organisations (RTOs). You can find courses across all levels from English language programs and vocational training through to undergraduate, postgraduate, and research degrees.',
  },
  {
    question: 'How can I compare different universities and courses?',
    answer:
      'Use our comparison feature to evaluate universities side by side based on factors like location, tuition fees, course duration, entry requirements, and student ratings. You can save courses to your shortlist and share them with your agent or consultant for personalised recommendations.',
  },
  {
    question: 'Is my personal information safe on EduConnect?',
    answer:
      'We take data privacy very seriously. Your personal information is encrypted and stored securely in compliance with the Australian Privacy Act. We never share your details with third parties without your explicit consent. You control who can access your profile and application information.',
  },
  {
    question: 'How do I contact EduConnect support?',
    answer:
      'You can reach our support team through the Contact page, by emailing hello@educonnect.com.au, or by calling +61 3 9000 1234 during business hours (Monday to Friday, 9 AM to 6 PM AEST). We also have a Support Centre with helpful articles and guides to answer common questions.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Header */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Find answers to common questions about EduConnect and studying in
              Australia.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition"
                >
                  <span className="text-lg font-medium text-slate-900 pr-4">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5">
                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-12 bg-blue-50 rounded-2xl p-8 text-center border border-blue-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-slate-600 mb-6">
              Can not find what you are looking for? Our support team is happy to
              help.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
