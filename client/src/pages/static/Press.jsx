import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Newspaper, Download, Mail, ExternalLink } from 'lucide-react';

const pressReleases = [
  {
    date: 'March 10, 2025',
    title: 'EduConnect Surpasses 10,000 Student Registrations in First Year',
    summary:
      'The Melbourne-based education marketplace celebrates a major milestone as international student sign-ups exceed expectations, with users from over 50 countries.',
  },
  {
    date: 'February 5, 2025',
    title: 'EduConnect Partners with Three Group of Eight Universities',
    summary:
      'Strategic partnerships with leading Australian research universities expand course offerings and strengthen the platform\'s institutional network.',
  },
  {
    date: 'January 15, 2025',
    title: 'EduConnect Raises $5M in Series A to Expand Across Asia-Pacific',
    summary:
      'Funding round led by EduVentures Capital will support platform development, team expansion, and marketing efforts across key student markets in Asia.',
  },
  {
    date: 'November 20, 2024',
    title: 'EduConnect Launches Verified Agent and Consultant Program',
    summary:
      'New verification framework ensures all education professionals on the platform meet strict quality and credential standards, boosting student trust.',
  },
];

const mediaKit = [
  { name: 'EduConnect Logo Pack', format: 'ZIP', size: '2.4 MB' },
  { name: 'Brand Guidelines', format: 'PDF', size: '1.8 MB' },
  { name: 'Executive Headshots', format: 'ZIP', size: '5.1 MB' },
  { name: 'Product Screenshots', format: 'ZIP', size: '8.3 MB' },
  { name: 'Fact Sheet 2025', format: 'PDF', size: '420 KB' },
];

const coverage = [
  {
    outlet: 'The Australian Financial Review',
    title: 'EdTech startup simplifies international student recruitment',
    date: 'March 2025',
  },
  {
    outlet: 'SmartCompany',
    title: 'Melbourne startup EduConnect bridges the gap for international students',
    date: 'February 2025',
  },
  {
    outlet: 'The PIE News',
    title: 'How digital marketplaces are reshaping education agent services',
    date: 'January 2025',
  },
];

export default function Press() {
  const handleDownload = (file) => {
    toast.success(`Preparing ${file.name} (${file.format}, ${file.size})…`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Newspaper className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Press & Media</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              The latest news, press releases, and media resources from
              EduConnect.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Press Releases */}
          <section className="py-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Press Releases
            </h2>
            <div className="space-y-4">
              {pressReleases.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-sm text-slate-500 font-medium">
                        {item.date}
                      </span>
                      <h3 className="text-xl font-semibold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 mt-2 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Media Coverage */}
          <section className="py-16 border-t border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Media Coverage
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {coverage.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {item.outlet}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900 mt-2 group-hover:text-blue-600 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <span className="text-xs text-slate-500 mt-2 block">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Media Kit */}
          <section className="py-16 border-t border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Media Kit
            </h2>
            <p className="text-slate-600 mb-8">
              Download our brand assets, logos, and press materials for use in
              your coverage.
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {mediaKit.map((file, index) => (
                <div
                  key={index}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-blue-500" />
                    <div>
                      <span className="font-medium text-slate-900">
                        {file.name}
                      </span>
                      <span className="text-sm text-slate-500 ml-2">
                        {file.format} - {file.size}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(file)}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700 transition"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Press Contact */}
          <section className="py-16 border-t border-slate-200">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Press Enquiries
                  </h3>
                  <p className="text-slate-600 mb-4">
                    For media enquiries, interview requests, or additional
                    information, please contact our communications team.
                  </p>
                  <a
                    href="mailto:press@educonnect.com.au"
                    className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition"
                  >
                    <Mail className="w-4 h-4" />
                    press@educonnect.com.au
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
