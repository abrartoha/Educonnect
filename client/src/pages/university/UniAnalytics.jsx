import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Users,
  Clock,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import useStore from '../../store/useStore';
import { directoryApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem } from '../../api/mappers';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

const CHART_COLORS = ['#6366f1', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4'];

// Generate mock time-series data
function generateViewsData(range) {
  const counts = { '7d': 7, '30d': 30, '90d': 12, '1y': 12 };
  const n = counts[range] || 30;

  if (range === '7d') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((d) => ({
      label: d,
      views: Math.floor(Math.random() * 300) + 150,
    }));
  }
  if (range === '30d') {
    return Array.from({ length: 30 }, (_, i) => ({
      label: `${i + 1}`,
      views: Math.floor(Math.random() * 400) + 100,
    }));
  }
  if (range === '90d') {
    const weeks = Array.from({ length: 12 }, (_, i) => ({
      label: `W${i + 1}`,
      views: Math.floor(Math.random() * 2000) + 800,
    }));
    return weeks;
  }
  // 1y
  const months = [
    'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar',
  ];
  return months.map((m) => ({
    label: m,
    views: Math.floor(Math.random() * 3500) + 1000,
  }));
}

const courseInquiries = [
  { course: 'Business', inquiries: 245 },
  { course: 'Engineering', inquiries: 198 },
  { course: 'IT', inquiries: 176 },
  { course: 'Medicine', inquiries: 142 },
  { course: 'Arts', inquiries: 89 },
  { course: 'Science', inquiries: 112 },
  { course: 'Law', inquiries: 78 },
];

const demographicsData = [
  { name: 'India', value: 32 },
  { name: 'China', value: 24 },
  { name: 'Vietnam', value: 12 },
  { name: 'Nepal', value: 9 },
  { name: 'Sri Lanka', value: 7 },
  { name: 'Others', value: 16 },
];

const topCourses = [
  { name: 'Master of Business Administration', views: 3240, inquiries: 186, conversion: '5.7%' },
  { name: 'Bachelor of Engineering (Honours)', views: 2890, inquiries: 162, conversion: '5.6%' },
  { name: 'Master of Information Technology', views: 2650, inquiries: 154, conversion: '5.8%' },
  { name: 'Bachelor of Commerce', views: 2100, inquiries: 112, conversion: '5.3%' },
  { name: 'Doctor of Medicine', views: 1890, inquiries: 98, conversion: '5.2%' },
  { name: 'Master of Data Science', views: 1760, inquiries: 104, conversion: '5.9%' },
];

export default function UniAnalytics() {
  const { currentUser } = useStore();
  const { data: profileData } = useApiResource(
    () => (currentUser?.id ? directoryApi.getUniversity(currentUser.id) : null),
    [currentUser?.id]
  );
  const profile = profileData?.item ? normaliseDirectoryItem(profileData.item) : null;
  const [range, setRange] = useState('30d');
  const [viewsData] = useState(() => ({
    '7d': generateViewsData('7d'),
    '30d': generateViewsData('30d'),
    '90d': generateViewsData('90d'),
    '1y': generateViewsData('1y'),
  }));

  const ranges = ['7d', '30d', '90d', '1y'];

  const metrics = [
    {
      label: 'Total Views',
      value: (profile?.views || 15420).toLocaleString(),
      icon: Eye,
      color: 'bg-indigo-100 text-indigo-600',
      trend: '+14.2%',
      up: true,
      prev: '13,502',
    },
    {
      label: 'Unique Visitors',
      value: '8,734',
      icon: Users,
      color: 'bg-emerald-100 text-emerald-600',
      trend: '+9.8%',
      up: true,
      prev: '7,954',
    },
    {
      label: 'Avg Time on Profile',
      value: '3m 42s',
      icon: Clock,
      color: 'bg-violet-100 text-violet-600',
      trend: '+5.1%',
      up: true,
      prev: '3m 31s',
    },
    {
      label: 'Bounce Rate',
      value: '34.2%',
      icon: ArrowDownRight,
      color: 'bg-orange-100 text-orange-600',
      trend: '-2.3%',
      up: true,
      prev: '36.5%',
    },
  ];

  return (
    <>
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Detailed insights into your profile performance.
          </p>
        </div>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 text-sm font-medium transition ${
                range === r
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i + 1}
              className="rounded-xl bg-white p-5 shadow-sm border border-slate-100"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2.5 ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`flex items-center gap-1 text-xs font-medium ${
                    m.up ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {m.up ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {m.trend}
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{m.value}</p>
              <p className="mt-1 text-sm text-slate-500">{m.label}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Previous period: {m.prev}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Area Chart */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={5}
        className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-slate-100"
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Views Over Time
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={viewsData[range]}>
            <defs>
              <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#viewsGrad)"
              name="Views"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Charts Row */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={6}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Inquiries by Course
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseInquiries} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis
                dataKey="course"
                type="category"
                stroke="#94a3b8"
                fontSize={12}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar
                dataKey="inquiries"
                fill="#6366f1"
                radius={[0, 6, 6, 0]}
                name="Inquiries"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Donut Chart */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={7}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Student Demographics
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={demographicsData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                dataKey="value"
                paddingAngle={3}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
                fontSize={11}
              >
                {demographicsData.map((_, idx) => (
                  <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Performing Courses */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={8}
        className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-slate-100"
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Top Performing Courses
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium text-right">Views</th>
                <th className="pb-3 font-medium text-right">Inquiries</th>
                <th className="pb-3 font-medium text-right">Conversion</th>
                <th className="pb-3 font-medium text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {topCourses.map((course, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="py-3 font-medium text-slate-900">
                    {course.name}
                  </td>
                  <td className="py-3 text-right text-slate-600">
                    {course.views.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-slate-600">
                    {course.inquiries}
                  </td>
                  <td className="py-3 text-right text-slate-600">
                    {course.conversion}
                  </td>
                  <td className="py-3 text-right">
                    {idx % 3 !== 2 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                        <TrendingUp className="w-3 h-3" />
                        +{(Math.random() * 5 + 1).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
                        <TrendingDown className="w-3 h-3" />
                        -{(Math.random() * 3 + 0.5).toFixed(1)}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
}
