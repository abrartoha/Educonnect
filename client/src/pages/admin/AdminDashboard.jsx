import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  UserCheck,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Activity,
  Eye,
  ArrowUpRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import useStore from '../../store/useStore';
import { adminApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';

const revenueData = [
  { month: 'Jan', revenue: 42000, users: 120 },
  { month: 'Feb', revenue: 48000, users: 145 },
  { month: 'Mar', revenue: 55000, users: 162 },
  { month: 'Apr', revenue: 51000, users: 178 },
  { month: 'May', revenue: 63000, users: 195 },
  { month: 'Jun', revenue: 59000, users: 210 },
  { month: 'Jul', revenue: 72000, users: 248 },
  { month: 'Aug', revenue: 78000, users: 276 },
  { month: 'Sep', revenue: 85000, users: 305 },
  { month: 'Oct', revenue: 82000, users: 328 },
  { month: 'Nov', revenue: 91000, users: 356 },
  { month: 'Dec', revenue: 98000, users: 390 },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useStore();

  const { data: overviewData } = useApiResource(() => adminApi.overview(), []);
  const { data: usersData } = useApiResource(
    () => adminApi.listUsers({ limit: 100 }),
    []
  );

  const allUsers = usersData?.items || [];
  const counts = overviewData?.counts || {
    universities: 0,
    agents: 0,
    consultants: 0,
    students: 0,
  };

  // Re-derive role-specific arrays client-side for the detail panels.
  const universities = allUsers.filter((u) => u.role === 'UNIVERSITY');
  const agents = allUsers.filter((u) => u.role === 'AGENT');
  const consultants = allUsers.filter((u) => u.role === 'CONSULTANT');
  const students = allUsers.filter((u) => u.role === 'STUDENT');

  const stats = useMemo(() => {
    const totalUnis = counts.universities;
    const totalAgents = counts.agents;
    const totalConsultants = counts.consultants;
    const totalStudents = counts.students;

    return [
      {
        label: 'Total Universities',
        value: totalUnis,
        change: '+12%',
        trending: 'up',
        icon: Building2,
        bgColor: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        borderColor: 'border-indigo-200',
      },
      {
        label: 'Total Agents',
        value: totalAgents,
        change: '+8%',
        trending: 'up',
        icon: Users,
        bgColor: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        borderColor: 'border-emerald-200',
      },
      {
        label: 'Total Consultants',
        value: totalConsultants,
        change: '+15%',
        trending: 'up',
        icon: UserCheck,
        bgColor: 'bg-orange-100',
        iconColor: 'text-orange-600',
        borderColor: 'border-orange-200',
      },
      {
        label: 'Total Students',
        value: totalStudents,
        change: '+22%',
        trending: 'up',
        icon: GraduationCap,
        bgColor: 'bg-violet-100',
        iconColor: 'text-violet-600',
        borderColor: 'border-violet-200',
      },
    ];
  }, [counts]);

  const recentActivity = useMemo(() => {
    const allEntities = [
      ...universities.map((u) => ({
        id: u.id,
        name: u.name,
        type: 'University',
        status: u.status,
        createdAt: u.createdAt,
        icon: Building2,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
      })),
      ...agents.map((a) => ({
        id: a.id,
        name: a.name,
        type: 'Agent',
        status: a.status,
        createdAt: a.createdAt,
        icon: Users,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
      })),
      ...consultants.map((c) => ({
        id: c.id,
        name: c.name,
        type: 'Consultant',
        status: c.status,
        createdAt: c.createdAt,
        icon: UserCheck,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      })),
      ...students.map((s) => ({
        id: s.id,
        name: s.name,
        type: 'Student',
        status: s.status,
        createdAt: s.createdAt,
        icon: GraduationCap,
        color: 'text-violet-600',
        bgColor: 'bg-violet-50',
      })),
    ];

    return allEntities
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [universities, agents, consultants, students]);

  const pendingApprovals = useMemo(() => {
    const pending = [
      ...universities
        .filter((u) => u.status === 'PENDING')
        .map((u) => ({ ...u, entityType: 'university', icon: Building2 })),
      ...agents
        .filter((a) => a.status === 'PENDING')
        .map((a) => ({ ...a, entityType: 'agent', icon: Users })),
      ...consultants
        .filter((c) => c.status === 'PENDING')
        .map((c) => ({ ...c, entityType: 'consultant', icon: UserCheck })),
    ];
    return pending.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [universities, agents, consultants]);

  const platformHealth = useMemo(() => {
    const allEntities = [...universities, ...agents, ...consultants];
    const activeCount = allEntities.filter((e) => e.status === 'ACTIVE').length;
    const verifiedCount = allEntities.filter(
      (e) => e.university?.verified || e.agent?.verified || e.consultant?.verified
    ).length;
    const totalCount = allEntities.length;

    return {
      activeEntities: activeCount,
      totalEntities: totalCount,
      activePercent: totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0,
      verifiedPercent: totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0,
      pendingCount: pendingApprovals.length,
      avgRating:
        totalCount > 0
          ? (
              allEntities.reduce(
                (sum, e) =>
                  sum +
                  (e.university?.rating ?? e.agent?.rating ?? e.consultant?.rating ?? 0),
                0
              ) / totalCount
            ).toFixed(1)
          : 0,
    };
  }, [universities, agents, consultants, pendingApprovals]);

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Welcome Header */}
        <motion.div variants={fadeInUp} custom={0}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back, {currentUser?.name || 'Admin'}
              </h1>
              <p className="text-slate-500 mt-1">
                Here&apos;s what&apos;s happening with your platform today.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              {new Date().toLocaleDateString('en-AU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              custom={i + 1}
              className={`bg-white rounded-xl border ${stat.borderColor} p-5 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {stat.trending === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    stat.trending === 'up' ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-slate-400 ml-1">vs last month</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <motion.div
            variants={fadeInUp}
            custom={5}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Revenue Overview</h2>
                <p className="text-sm text-slate-500 mt-0.5">Monthly revenue for 2024</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">$824K</p>
                <p className="text-sm text-emerald-600 font-medium">+18.2% YoY</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* User Growth Chart */}
          <motion.div
            variants={fadeInUp}
            custom={6}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">User Growth</h2>
                <p className="text-sm text-slate-500 mt-0.5">Monthly new registrations</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">2,913</p>
                <p className="text-sm text-emerald-600 font-medium">+225% growth</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value) => [value, 'New Users']}
                  />
                  <Bar
                    dataKey="users"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Middle Row: Activity + Pending + Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            variants={fadeInUp}
            custom={7}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No recent activity</p>
              ) : (
                recentActivity.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`${item.bgColor} p-2 rounded-lg shrink-0`}>
                        <IconComp className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">{item.type}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-xs text-slate-400">{item.createdAt}</span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          item.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Pending Approvals */}
          <motion.div
            variants={fadeInUp}
            custom={8}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Pending Approvals</h2>
              {pendingApprovals.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {pendingApprovals.length}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">All caught up! No pending approvals.</p>
                </div>
              ) : (
                pendingApprovals.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100"
                    >
                      <IconComp className="w-5 h-5 text-amber-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">{item.entityType}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (item.entityType === 'university') navigate('/admin/universities');
                          else if (item.entityType === 'agent') navigate('/admin/agents');
                          else navigate('/admin/consultants');
                        }}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 shrink-0"
                      >
                        Review
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Platform Health */}
          <motion.div
            variants={fadeInUp}
            custom={9}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Platform Health</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-slate-600">Active Entities</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {platformHealth.activeEntities}/{platformHealth.totalEntities}
                </span>
              </div>
              <div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${platformHealth.activePercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{platformHealth.activePercent}% active</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm text-slate-600">Verified Rate</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {platformHealth.verifiedPercent}%
                </span>
              </div>
              <div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${platformHealth.verifiedPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-slate-600">Pending Items</span>
                </div>
                <span className="text-sm font-semibold text-amber-600">
                  {platformHealth.pendingCount}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-violet-500" />
                  <span className="text-sm text-slate-600">Avg. Rating</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {platformHealth.avgRating} / 5.0
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          variants={fadeInUp}
          custom={10}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/universities', { state: { openAdd: true } })}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 hover:border-indigo-300 transition-all group"
            >
              <div className="bg-indigo-100 p-2.5 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Plus className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Add University</p>
                <p className="text-xs text-slate-500">Register new institution</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-indigo-500 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/admin/agents', { state: { openAdd: true } })}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 hover:border-emerald-300 transition-all group"
            >
              <div className="bg-emerald-100 p-2.5 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <Plus className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Add Agent</p>
                <p className="text-xs text-slate-500">Register new agent</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-emerald-500 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/admin/consultants', { state: { openAdd: true } })}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/50 hover:bg-orange-100/60 hover:border-orange-300 transition-all group"
            >
              <div className="bg-orange-100 p-2.5 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Plus className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Add Consultant</p>
                <p className="text-xs text-slate-500">Register new consultant</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-orange-500 transition-colors" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
