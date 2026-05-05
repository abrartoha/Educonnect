import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  TrendingUp,
  TrendingDown,
  Users,
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const placementData = [
  { month: 'Oct', placements: 18 },
  { month: 'Nov', placements: 24 },
  { month: 'Dec', placements: 12 },
  { month: 'Jan', placements: 32 },
  { month: 'Feb', placements: 28 },
  { month: 'Mar', placements: 35 },
];

const mockStudents = [
  { name: 'Arun Kumar', nationality: 'Indian', course: 'IT', university: 'UniMelb', status: 'enrolled' },
  { name: 'Wei Zhang', nationality: 'Chinese', course: 'Business', university: 'USYD', status: 'applied' },
  { name: 'Mai Nguyen', nationality: 'Vietnamese', course: 'Nursing', university: 'Monash', status: 'browsing' },
  { name: 'Sanjay Patel', nationality: 'Indian', course: 'Engineering', university: 'UNSW', status: 'applied' },
  { name: 'Yuki Tanaka', nationality: 'Japanese', course: 'Arts', university: 'ANU', status: 'enrolled' },
];

const mockBookings = [
  { student: 'Rahul Verma', date: '2026-04-02', time: '10:00 AM', type: 'Visa Consultation' },
  { student: 'Li Wei', date: '2026-04-03', time: '2:00 PM', type: 'University Selection' },
  { student: 'Priya Singh', date: '2026-04-04', time: '11:30 AM', type: 'Application Review' },
];

export default function AgentDashboard() {
  const { currentUser } = useStore();
  const { data: profileData } = useApiResource(
    () => (currentUser?.id ? directoryApi.getAgent(currentUser.id) : null),
    [currentUser?.id]
  );
  const profile = profileData?.item ? normaliseDirectoryItem(profileData.item) : null;
  const p = profile;

  const stats = [
    {
      label: 'Students Placed',
      value: (p?.studentsPlaced || 0).toLocaleString(),
      icon: GraduationCap,
      color: 'bg-indigo-100 text-indigo-600',
      trend: '+15.3%',
      up: true,
    },
    {
      label: 'Partner Institutions',
      value: p?.partnerInstitutions || 0,
      icon: Building2,
      color: 'bg-emerald-100 text-emerald-600',
      trend: '+2',
      up: true,
    },
    {
      label: 'Success Rate',
      value: `${p?.successRate || 0}%`,
      icon: TrendingUp,
      color: 'bg-violet-100 text-violet-600',
      trend: '+1.2%',
      up: true,
    },
    {
      label: 'Active Students',
      value: '47',
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      trend: '+8',
      up: true,
    },
  ];

  const statusConfig = {
    browsing: { color: 'bg-slate-100 text-slate-700', label: 'Browsing' },
    applied: { color: 'bg-blue-100 text-blue-700', label: 'Applied' },
    enrolled: { color: 'bg-green-100 text-green-700', label: 'Enrolled' },
  };

  const quickActions = [
    { label: 'View Students', icon: Users, to: '/dashboard', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { label: 'Partner Universities', icon: Building2, to: '/dashboard', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Update Profile', icon: CheckCircle2, to: '/dashboard/profile', color: 'bg-violet-600 hover:bg-violet-700' },
  ];

  return (
    <>
      {/* Welcome Card */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 md:p-8 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {p?.contactPerson || currentUser?.name || 'Agent'}
            </h1>
            <p className="mt-1 text-emerald-100">
              {currentUser?.name} &mdash; {p?.location || '—'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-emerald-100">
            <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
              {(p?.tier || 'free').toUpperCase()} Plan
            </span>
            {p?.verified && (
              <span className="bg-white/20 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            )}
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

      {/* Chart + Quick Actions */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Monthly Placements
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={placementData}>
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
              <Bar
                dataKey="placements"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                name="Placements"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={6}
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
              Performance
            </h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Rating</span>
                <span className="font-medium text-slate-900">
                  {p?.rating || 0} / 5
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reviews</span>
                <span className="font-medium text-slate-900">
                  {p?.reviewCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Experience</span>
                <span className="font-medium text-slate-900">
                  {p?.yearsExperience || 0} years
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={7}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Students</h2>
            <Link
              to="/dashboard"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {mockStudents.map((student, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900 text-sm">{student.name}</p>
                  <p className="text-xs text-slate-500">
                    {student.nationality} &middot; {student.course} &middot;{' '}
                    {student.university}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    statusConfig[student.status]?.color
                  }`}
                >
                  {statusConfig[student.status]?.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Bookings */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={8}
          className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Upcoming Bookings
            </h2>
            <Link
              to="/dashboard"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {mockBookings.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No upcoming bookings.
            </p>
          ) : (
            <div className="space-y-3">
              {mockBookings.map((booking, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-3 rounded-lg bg-slate-50"
                >
                  <div className="shrink-0 rounded-lg bg-emerald-100 p-2.5 text-emerald-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">
                      {booking.type}
                    </p>
                    <p className="text-xs text-slate-500">
                      with {booking.student}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {booking.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
