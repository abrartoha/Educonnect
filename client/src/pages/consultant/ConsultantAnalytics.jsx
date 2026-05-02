import { BarChart3, Users, Star, Clock, DollarSign } from "lucide-react";

const stats = [
  {
    label: "Total Consultations",
    value: "148",
    icon: Users,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    label: "Hours This Month",
    value: "36.5",
    icon: Clock,
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    label: "Average Rating",
    value: "4.8",
    icon: Star,
    gradient: "from-amber-500 to-amber-600",
  },
  {
    label: "Revenue",
    value: "$4,320",
    icon: DollarSign,
    gradient: "from-violet-500 to-violet-600",
  },
];

const weeklyData = [
  { day: "Mon", count: 5, max: 8 },
  { day: "Tue", count: 7, max: 8 },
  { day: "Wed", count: 3, max: 8 },
  { day: "Thu", count: 8, max: 8 },
  { day: "Fri", count: 6, max: 8 },
  { day: "Sat", count: 2, max: 8 },
  { day: "Sun", count: 1, max: 8 },
];

const satisfactionData = [
  { label: "Excellent", percent: 58, color: "bg-emerald-500" },
  { label: "Good", percent: 28, color: "bg-blue-500" },
  { label: "Average", percent: 10, color: "bg-amber-500" },
  { label: "Below Average", percent: 4, color: "bg-red-500" },
];

export default function ConsultantAnalytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-slate-500">Track your consulting metrics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-5 text-white shadow-md`}
            >
              <div className="absolute -right-3 -top-3 opacity-15">
                <Icon className="h-20 w-20" />
              </div>
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-2xl font-bold">{stat.value}</p>
                <p className="mt-0.5 text-sm text-white/80">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Consultations Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Weekly Consultations
            </h2>
          </div>

          <div className="flex items-end justify-between gap-3" style={{ height: 180 }}>
            {weeklyData.map((item) => {
              const heightPercent = (item.count / item.max) * 100;
              return (
                <div
                  key={item.day}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="text-xs font-medium text-slate-600">
                    {item.count}
                  </span>
                  <div className="relative w-full" style={{ height: 140 }}>
                    <div
                      className="absolute bottom-0 w-full rounded-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Client Satisfaction */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-900">
              Client Satisfaction
            </h2>
          </div>

          <div className="space-y-5">
            {satisfactionData.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {item.label}
                  </span>
                  <span className="text-slate-500">{item.percent}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center">
            <p className="text-sm text-slate-500">Overall Satisfaction</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">86%</p>
            <p className="text-xs text-emerald-600">+3.2% from last month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
