import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Eye,
  MessageSquare,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Pencil,
  Megaphone,
  BarChart3,
  ArrowRight,
  Globe,
  Mail,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import useStore from '../../store/useStore';
import { directoryApi, leadsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem, normaliseLead } from '../../api/mappers';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const monthlyData = [
  { month: 'Oct', views: 1820, inquiries: 102 },
  { month: 'Nov', views: 2140, inquiries: 128 },
  { month: 'Dec', views: 1760, inquiries: 95 },
  { month: 'Jan', views: 2580, inquiries: 156 },
  { month: 'Feb', views: 3120, inquiries: 198 },
  { month: 'Mar', views: 3450, inquiries: 213 },
];

const nationalityData = [
  { name: 'India', value: 340 },
  { name: 'China', value: 280 },
  { name: 'Vietnam', value: 120 },
  { name: 'Nepal', value: 85 },
  { name: 'Pakistan', value: 67 },
];

const PIE_COLORS = ['#6366f1', '#10b981', '#f97316', '#8b5cf6', '#ec4899'];

export default function UniDashboard() {
  const { currentUser } = useStore();

  const { data: profileData } = useApiResource(
    () => (currentUser?.id ? directoryApi.getUniversity(currentUser.id) : null),
    [currentUser?.id]
  );
  const { data: leadsData } = useApiResource(() => leadsApi.list(), []);

  const profile = profileData?.item ? normaliseDirectoryItem(profileData.item) : null;
  const uniLeads = (leadsData?.items || []).map(normaliseLead);

  const views = profile?.views || 0;
  const inquiries = profile?.inquiries || 0;
  const conversionRate =
    views > 0 ? ((inquiries / views) * 100).toFixed(1) : '0.0';

  const stats = [
    {
      label: 'Total Views',
      value: views.toLocaleString(),
      icon: Eye,
      color: 'bg-indigo-100 text-indigo-600',
      trend: '+12.5%',
      up: true,
    },
    {
      label: 'Total Inquiries',
      value: inquiries.toLocaleString(),
      icon: MessageSquare,
      color: 'bg-emerald-100 text-emerald-600',
      trend: '+8.3%',
      up: true,
    },
    {
      label: 'Active Leads',
      value: uniLeads.length,
      icon: UserCheck,
      color: 'bg-orange-100 text-orange-600',
      trend: '+3.1%',
      up: true,
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: 'bg-violet-100 text-violet-600',
      trend: '-0.4%',
      up: false,
    },
  ];

  const mockLeads = [
    { name: 'Arun Kumar', email: 'arun@email.com', course: 'IT & Computer Science', status: 'New', date: '2026-03-28' },
    { name: 'Wei Zhang', email: 'wei@email.com', course: 'Business & Economics', status: 'Contacted', date: '2026-03-27' },
    { name: 'Mai Nguyen', email: 'mai@email.com', course: 'Engineering', status: 'Applied', date: '2026-03-25' },
    { name: 'Sanjay Patel', email: 'sanjay@email.com', course: 'Medicine', status: 'New', date: '2026-03-24' },
    { name: 'Yuki Tanaka', email: 'yuki@email.com', course: 'Arts & Humanities', status: 'Contacted', date: '2026-03-22' },
  ];

  const quickActions = [
    { label: 'Edit Profile', icon: Pencil, to: '/dashboard/profile', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { label: 'Create Campaign', icon: Megaphone, to: '/dashboard', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'View Analytics', icon: BarChart3, to: '/dashboard/analytics', color: 'bg-violet-600 hover:bg-violet-700' },
  ];

  const statusColor = {
    New: 'bg-blue-100 text-blue-700',
    Contacted: 'bg-yellow-100 text-yellow-700',
    Applied: 'bg-green-100 text-green-700',
  };

  return (
    <>
      {/* Welcome Banner */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 md:p-8 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {currentUser?.name || 'University'}
            </h1>
            <p className="mt-1 text-indigo-100">
              Here is an overview of your institution's performance and activity.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-indigo-100">
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              {profile?.location || '—'}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {inquiries} inquiries
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i + 1}
              className="rounded-xl bg-white p-5 shadow-sm border border-slate-100"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2.5 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.up ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {stat.up ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stat.trend}
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Monthly Views & Inquiries
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4 }}
                name="Views"
              />
              <Line
                type="monotone"
                dataKey="inquiries"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: '#10b981', r: 4 }}
                name="Inquiries"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={6}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Inquiries by Nationality
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={nationalityData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                paddingAngle={4}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
                fontSize={11}
              >
                {nationalityData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={7}
          className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Leads</h2>
            <Link
              to="/dashboard"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium">Course Interest</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {mockLeads.map((lead, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-3">
                      <p className="font-medium text-slate-900">{lead.name}</p>
                      <p className="text-xs text-slate-400">{lead.email}</p>
                    </td>
                    <td className="py-3 text-slate-600">{lead.course}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColor[lead.status]
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{lead.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={8}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`flex items-center gap-3 w-full rounded-lg px-4 py-3 text-white font-medium text-sm transition ${action.color}`}
                >
                  <Icon className="w-5 h-5" />
                  {action.label}
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Link>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              At a Glance
            </h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Ranking</span>
                <span className="font-medium text-slate-900">
                  #{profile?.ranking || '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Courses</span>
                <span className="font-medium text-slate-900">
                  {profile?.courses?.length || 0} programs
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reviews</span>
                <span className="font-medium text-slate-900">
                  {profile?.reviewCount || 0} ({profile?.rating || 0} avg)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tier</span>
                <span className="font-medium capitalize text-slate-900">
                  {profile?.tier || 'free'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
