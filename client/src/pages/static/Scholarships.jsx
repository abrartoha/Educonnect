import { useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  Award,
  DollarSign,
  Calendar,
  GraduationCap,
  Filter,
} from 'lucide-react';

const scholarships = [
  {
    id: 1,
    name: 'Australia Awards Scholarships',
    university: 'Multiple Australian Universities',
    amount: 'Full tuition + living allowance',
    deadline: '30 April 2026',
    type: 'International',
    eligibility:
      'International students from participating countries with strong academic records and leadership potential.',
  },
  {
    id: 2,
    name: 'Melbourne International Undergraduate Scholarship',
    university: 'University of Melbourne',
    amount: 'AUD $10,000 - $50,000 (fee remission)',
    deadline: '15 May 2026',
    type: 'Merit',
    eligibility:
      'High-achieving international students commencing an undergraduate degree. Based on academic merit.',
  },
  {
    id: 3,
    name: 'Monash International Leadership Scholarship',
    university: 'Monash University',
    amount: 'AUD $10,000/year (up to 4 years)',
    deadline: '31 July 2026',
    type: 'Merit',
    eligibility:
      'Outstanding international students demonstrating academic excellence and community leadership.',
  },
  {
    id: 4,
    name: 'UNSW Equity Scholarship',
    university: 'University of New South Wales',
    amount: 'AUD $5,000 - $15,000',
    deadline: '1 June 2026',
    type: 'Need-based',
    eligibility:
      'Students experiencing financial hardship. Must demonstrate genuine need and maintain satisfactory academic progress.',
  },
  {
    id: 5,
    name: 'Swinburne Research Excellence Scholarship',
    university: 'Swinburne University of Technology',
    amount: 'AUD $35,000/year stipend + tuition',
    deadline: '30 September 2026',
    type: 'Research',
    eligibility:
      'Postgraduate research candidates with a first-class honours degree or equivalent. Open to domestic and international students.',
  },
  {
    id: 6,
    name: 'UQ Global Leaders Scholarship',
    university: 'University of Queensland',
    amount: '25% tuition fee reduction',
    deadline: '15 August 2026',
    type: 'International',
    eligibility:
      'International students with a strong academic record applying for undergraduate or postgraduate coursework programs.',
  },
  {
    id: 7,
    name: 'Sydney Scholars Award',
    university: 'University of Sydney',
    amount: 'AUD $6,000 + mentoring program',
    deadline: '20 March 2026',
    type: 'Merit',
    eligibility:
      'Australian and international high achievers commencing their first year of undergraduate study.',
  },
  {
    id: 8,
    name: 'ANU College of Science Research Scholarship',
    university: 'Australian National University',
    amount: 'AUD $32,000/year stipend + tuition waiver',
    deadline: '31 October 2026',
    type: 'Research',
    eligibility:
      'Exceptional candidates pursuing a PhD in the College of Science. Prior research experience required.',
  },
];

const filterTypes = ['All', 'Merit', 'Need-based', 'International', 'Research'];

export default function Scholarships() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered =
    activeFilter === 'All'
      ? scholarships
      : scholarships.filter((s) => s.type === activeFilter);

  const handleApply = (scholarship) => {
    toast.success(
      `Application link for "${scholarship.name}" sent to your inbox.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
              <Award className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Scholarships
            </h1>
            <p className="mt-3 text-lg text-slate-500">
              Explore scholarship opportunities at top Australian universities
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Filter className="h-4 w-4" />
              Filter by type:
            </div>
            {filterTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === type
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Scholarship Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            {filtered.map((scholarship) => (
              <div
                key={scholarship.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                      {scholarship.type}
                    </span>
                  </div>
                  <Award className="h-5 w-5 flex-shrink-0 text-amber-500" />
                </div>

                <h3 className="mb-1 text-lg font-semibold text-slate-900">
                  {scholarship.name}
                </h3>

                <p className="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
                  <GraduationCap className="h-4 w-4" />
                  {scholarship.university}
                </p>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <DollarSign className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <span className="font-medium">{scholarship.amount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-rose-500" />
                    <span>Deadline: {scholarship.deadline}</span>
                  </div>
                </div>

                <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">
                  {scholarship.eligibility}
                </p>

                <button
                  type="button"
                  onClick={() => handleApply(scholarship)}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
              <Award className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-600">
                No scholarships found
              </h3>
              <p className="mt-2 text-slate-400">
                Try selecting a different filter to see available scholarships.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
