import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  GraduationCap,
  MapPin,
  DollarSign,
  FileText,
  Briefcase,
  Heart,
} from 'lucide-react';

const sections = [
  {
    icon: GraduationCap,
    title: 'Why Study in Australia?',
    color: 'indigo',
    content: [
      'Australia is home to some of the world\'s most highly ranked universities, with seven institutions consistently ranked in the global top 100. An Australian degree is recognised and respected by employers and institutions worldwide.',
      'The country offers a welcoming multicultural environment, with students from over 190 countries choosing Australia as their study destination each year. You will be part of a diverse and vibrant academic community.',
      'Australia provides generous post-study work rights, allowing international graduates to gain valuable professional experience after completing their studies. Depending on your qualification level, you may be eligible for two to four years of post-study work.',
    ],
  },
  {
    icon: MapPin,
    title: 'Top Cities for Students',
    color: 'rose',
    content: [],
    cities: [
      {
        name: 'Melbourne',
        description:
          'Consistently ranked as one of the most liveable cities in the world, Melbourne is a cultural capital with thriving arts, food, and sports scenes. It is home to eight major universities and a large international student community.',
      },
      {
        name: 'Sydney',
        description:
          'Australia\'s largest city offers world-class education, iconic landmarks, and a dynamic job market. Sydney\'s universities are known for strong industry connections and career placement services.',
      },
      {
        name: 'Brisbane',
        description:
          'With a subtropical climate and affordable cost of living compared to Sydney and Melbourne, Brisbane is an increasingly popular choice. The city is growing rapidly with investment in education infrastructure.',
      },
      {
        name: 'Perth',
        description:
          'Located on the west coast, Perth offers a relaxed lifestyle, stunning natural beauty, and strong ties to the mining and resources sector. International students benefit from a lower cost of living and fewer crowds.',
      },
      {
        name: 'Adelaide',
        description:
          'Known as a city of festivals and innovation, Adelaide offers the most affordable living costs among Australia\'s major cities. The South Australian government provides additional support and incentives for international students.',
      },
    ],
  },
  {
    icon: DollarSign,
    title: 'Cost of Living',
    color: 'emerald',
    content: [
      'The Australian Government estimates that international students need approximately AUD $24,505 per year for living expenses. This covers accommodation, food, transport, and personal costs, though actual expenses vary by city and lifestyle.',
      'Accommodation is typically the largest expense. Options range from on-campus student housing (AUD $200-$500 per week) to shared rental apartments (AUD $150-$350 per week) and homestay arrangements (AUD $250-$350 per week including meals).',
      'Groceries and dining out are generally affordable, with weekly food budgets for students averaging AUD $100-$180. Public transport concession cards are available in most states, reducing commuting costs significantly.',
    ],
  },
  {
    icon: FileText,
    title: 'Student Visa (Subclass 500)',
    color: 'violet',
    content: [
      'International students require a Student Visa (subclass 500) to study in Australia. The visa allows you to live, study, and work part-time in Australia for the duration of your enrolled course.',
      'Key requirements include a Confirmation of Enrolment (CoE) from an Australian institution, proof of financial capacity, valid Overseas Student Health Cover (OSHC), and meeting the Genuine Student requirement.',
      'The visa application fee is approximately AUD $710 as of 2026. Processing times vary by country and individual circumstances, but typically range from four to eight weeks. It is recommended to apply well in advance of your course start date.',
    ],
  },
  {
    icon: Briefcase,
    title: 'Working While Studying',
    color: 'amber',
    content: [
      'Student visa holders are permitted to work up to 48 hours per fortnight during study periods and unlimited hours during scheduled course breaks. This provides valuable opportunities to gain work experience and supplement your finances.',
      'Common student jobs include retail, hospitality, tutoring, administrative roles, and campus positions. Many universities also offer career services to help students find part-time work and internships related to their field of study.',
      'Australia\'s minimum wage is one of the highest in the world, ensuring fair compensation for all workers. International students are entitled to the same workplace protections as Australian citizens.',
    ],
  },
  {
    icon: Heart,
    title: 'Health Insurance (OSHC)',
    color: 'rose',
    content: [
      'All international students on a Student Visa are required to maintain Overseas Student Health Cover (OSHC) for the duration of their stay in Australia. OSHC covers visits to the doctor, some hospital treatment, ambulance services, and limited pharmaceuticals.',
      'OSHC policies are available from approved providers and cost approximately AUD $500-$700 per year for single cover. Most universities have a preferred OSHC provider and can arrange cover as part of the enrolment process.',
      'It is important to note that OSHC does not cover dental, optical, or physiotherapy treatment. You may wish to purchase supplementary cover if these services are important to you. Pre-existing conditions may also have waiting periods.',
    ],
  },
];

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    headerBg: 'bg-indigo-100',
  },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-600', headerBg: 'bg-rose-100' },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    headerBg: 'bg-emerald-100',
  },
  violet: {
    bg: 'bg-violet-50',
    icon: 'text-violet-600',
    headerBg: 'bg-violet-100',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    headerBg: 'bg-amber-100',
  },
};

export default function StudyGuide() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Study in Australia Guide
            </h1>
            <p className="mt-3 text-lg text-slate-500">
              Everything you need to know about studying in Australia as an
              international student
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              const colors = colorMap[section.color];
              return (
                <section
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg}`}
                    >
                      <Icon className={`h-5 w-5 ${colors.icon}`} />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {section.title}
                    </h2>
                  </div>

                  {section.content.length > 0 && (
                    <div className="space-y-3">
                      {section.content.map((paragraph, pIdx) => (
                        <p
                          key={pIdx}
                          className="leading-relaxed text-slate-600"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}

                  {section.cities && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {section.cities.map((city, cIdx) => (
                        <div
                          key={cIdx}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-rose-500" />
                            <h3 className="font-semibold text-slate-900">
                              {city.name}
                            </h3>
                          </div>
                          <p className="text-sm leading-relaxed text-slate-600">
                            {city.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
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
