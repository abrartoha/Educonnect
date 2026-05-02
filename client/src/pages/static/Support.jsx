import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  LifeBuoy,
  Search,
  MessageCircle,
  CreditCard,
  Settings,
  HelpCircle,
} from 'lucide-react';

const categories = [
  {
    icon: HelpCircle,
    title: 'Getting Started',
    description:
      'New to EduConnect? Learn how to create your account, browse universities, and connect with agents.',
    articles: 12,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Settings,
    title: 'Account & Profile',
    description:
      'Manage your account settings, update your profile, and control your notification preferences.',
    articles: 8,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: CreditCard,
    title: 'Payments & Billing',
    description:
      'Information about consultant fees, payment methods, refund policies, and billing enquiries.',
    articles: 6,
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: MessageCircle,
    title: 'Communication',
    description:
      'Learn how to message agents, schedule consultations, and manage your conversations.',
    articles: 9,
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: LifeBuoy,
    title: 'Technical Support',
    description:
      'Troubleshoot technical issues, browser compatibility, and report bugs or errors.',
    articles: 7,
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: Settings,
    title: 'For Agents & Consultants',
    description:
      'Resources for education professionals including profile setup, verification, and best practices.',
    articles: 10,
    color: 'bg-cyan-100 text-cyan-600',
  },
];

const popularArticles = [
  'How to create your EduConnect student account',
  'Understanding the difference between agents and consultants',
  'How to submit a university application through an agent',
  'Updating your personal information and documents',
  'How to leave a review for an agent or consultant',
];

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Header with Search */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LifeBuoy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Support Centre</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              How can we help you today? Search our knowledge base or browse
              categories below.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-900 bg-white shadow-lg focus:ring-2 focus:ring-blue-300 outline-none text-lg"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          {/* Categories */}
          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cat.color}`}
                >
                  <cat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  {cat.description}
                </p>
                <span className="text-xs font-medium text-slate-400">
                  {cat.articles} articles
                </span>
              </div>
            ))}
          </div>

          {/* Popular Articles */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Popular Articles
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {popularArticles.map((article, index) => (
                <div
                  key={index}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">
                      {article}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Still Need Help CTA */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border border-blue-100">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Still need help?
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Our support team is available Monday to Friday, 9 AM - 6 PM AEST.
              We typically respond within 24 hours.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
