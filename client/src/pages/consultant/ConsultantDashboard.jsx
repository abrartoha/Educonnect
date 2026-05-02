import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Star,
  MessageSquare,
  ArrowRight,
  Calendar,
  Clock,
  Pencil,
  CheckCircle2,
} from 'lucide-react';
import useStore from '../../store/useStore';
import { directoryApi, reviewsApi } from '../../api/endpoints';
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

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const timeSlots = ['9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00'];

const mockSchedule = {
  Mon: ['9:00', '11:00', '2:00'],
  Tue: ['10:00', '3:00'],
  Wed: ['9:00', '10:00', '11:00', '1:00'],
  Thu: ['2:00', '3:00', '4:00'],
  Fri: ['9:00', '1:00'],
};

const mockReviews = [
  {
    student: 'Sophie Mueller',
    rating: 5,
    comment: 'Incredibly helpful with my PhD application strategy. Highly recommend!',
    date: '2026-03-28',
  },
  {
    student: 'Arun Kumar',
    rating: 5,
    comment: 'Amazing guidance on scholarship applications. Got a full scholarship!',
    date: '2026-03-22',
  },
  {
    student: 'Li Wei',
    rating: 4,
    comment: 'Very knowledgeable and professional. Great interview preparation sessions.',
    date: '2026-03-18',
  },
  {
    student: 'Priya Singh',
    rating: 5,
    comment: 'Helped me refine my research proposal. The feedback was detailed and actionable.',
    date: '2026-03-12',
  },
];

export default function ConsultantDashboard() {
  const { currentUser } = useStore();
  const { data: profileData } = useApiResource(
    () => (currentUser?.id ? directoryApi.getConsultant(currentUser.id) : null),
    [currentUser?.id]
  );
  const { data: reviewsData } = useApiResource(
    () => (currentUser?.id ? reviewsApi.listForTarget(currentUser.id) : null),
    [currentUser?.id]
  );
  const profile = profileData?.item ? normaliseDirectoryItem(profileData.item) : null;
  const p = profile;
  const consultantReviews = (reviewsData?.items || []).filter(
    () => true

  );

  const displayReviews =
    consultantReviews.length > 0
      ? consultantReviews.map((r) => ({
          student: r.studentName,
          rating: r.rating,
          comment: r.comment,
          date: r.date,
        }))
      : mockReviews;

  const stats = [
    {
      label: 'Students Assisted',
      value: p?.studentsAssisted?.toLocaleString() || '0',
      icon: Users,
      color: 'bg-indigo-100 text-indigo-600',
      trend: '+12',
      up: true,
    },
    {
      label: 'Success Rate',
      value: `${p?.successRate || 0}%`,
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-600',
      trend: '+0.8%',
      up: true,
    },
    {
      label: 'Total Reviews',
      value: p?.reviewCount || displayReviews.length,
      icon: MessageSquare,
      color: 'bg-orange-100 text-orange-600',
      trend: '+4',
      up: true,
    },
    {
      label: 'Avg Rating',
      value: p?.rating || '4.8',
      icon: Star,
      color: 'bg-violet-100 text-violet-600',
      trend: '+0.1',
      up: true,
    },
  ];

  const quickActions = [
    { label: 'View Students', icon: Users, to: '/dashboard', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { label: 'Update Availability', icon: Calendar, to: '/dashboard', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Update Profile', icon: Pencil, to: '/dashboard/profile', color: 'bg-violet-600 hover:bg-violet-700' },
  ];

  return (
    <>
      {/* Welcome Card */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 p-6 md:p-8 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {currentUser?.name || 'Consultant'}
            </h1>
            <p className="mt-1 text-violet-200">
              {p?.location} &middot; {p?.yearsExperience || 0}{' '}
              years experience
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-violet-100">
            <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
              ${p?.hourlyRate || 0}/hr
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

      {/* Schedule + Quick Actions */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Weekly Schedule
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="pb-3 text-left text-slate-500 font-medium w-16">
                    Time
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day}
                      className="pb-3 text-center text-slate-500 font-medium"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="border-t border-slate-50">
                    <td className="py-2 text-xs text-slate-400 font-medium">
                      {time}
                    </td>
                    {weekDays.map((day) => {
                      const isBooked = mockSchedule[day]?.includes(time);
                      return (
                        <td key={`${day}-${time}`} className="py-2 text-center">
                          {isBooked ? (
                            <span className="inline-block w-full max-w-[80px] rounded-md bg-violet-100 text-violet-700 text-xs font-medium py-1.5">
                              Booked
                            </span>
                          ) : (
                            <span className="inline-block w-full max-w-[80px] rounded-md bg-slate-50 text-slate-400 text-xs py-1.5">
                              Free
                            </span>
                          )}
                        </td>
                      );
                    })}
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
              Specialisations
            </h3>
            <div className="flex flex-wrap gap-2">
              {(p?.specialisations || []).map((s) => (
                <span
                  key={s}
                  className="bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full text-xs font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              Availability
            </h3>
            <p className="text-sm text-slate-600 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              {'Not set'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Recent Reviews */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={7}
        className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-slate-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Reviews</h2>
          <Link
            to="/dashboard"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayReviews.slice(0, 4).map((review, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-slate-900 text-sm">
                  {review.student}
                </p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {review.comment}
              </p>
              <p className="mt-2 text-xs text-slate-400">{review.date}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
