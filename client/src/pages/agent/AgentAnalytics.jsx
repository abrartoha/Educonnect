import { useState } from "react";
import {
  BarChart3,
  Users,
  FileCheck,
  TrendingUp,
  DollarSign,
} from "lucide-react";

const stats = [
  {
    label: "Total Students",
    value: "128",
    change: "+12%",
    icon: Users,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    label: "Applications Submitted",
    value: "84",
    change: "+8%",
    icon: FileCheck,
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    label: "Success Rate",
    value: "91%",
    change: "+3%",
    icon: TrendingUp,
    gradient: "from-violet-500 to-violet-600",
  },
  {
    label: "Revenue",
    value: "$12,450",
    change: "+18%",
    icon: DollarSign,
    gradient: "from-amber-500 to-amber-600",
  },
];

const monthlyPlacements = [
  { month: "Oct", value: 6 },
  { month: "Nov", value: 9 },
  { month: "Dec", value: 4 },
  { month: "Jan", value: 11 },
  { month: "Feb", value: 8 },
  { month: "Mar", value: 14 },
];

const recentActivity = [
  {
    id: 1,
    text: "Application submitted for Arjun Mehta — University of Melbourne",
    time: "2 hours ago",
    type: "application",
  },
  {
    id: 2,
    text: "Consultation completed with Li Wei",
    time: "5 hours ago",
    type: "consultation",
  },
  {
    id: 3,
    text: "Offer received — Sofia Garcia, Monash University",
    time: "1 day ago",
    type: "offer",
  },
  {
    id: 4,
    text: "New student enquiry from Daniel Okafor",
    time: "1 day ago",
    type: "enquiry",
  },
  {
    id: 5,
    text: "Visa documentation uploaded for Fatima Al-Rashid",
    time: "2 days ago",
    type: "document",
  },
];

const activityDot = {
  application: "bg-blue-500",
  consultation: "bg-emerald-500",
  offer: "bg-violet-500",
  enquiry: "bg-amber-500",
  document: "bg-slate-400",
};

export default function AgentAnalytics() {
  const [period] = useState("Last 6 months");
  const maxValue = Math.max(...monthlyPlacements.map((m) => m.value));

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="mt-1 text-base text-slate-500">
            Track your performance metrics
          </p>
        </div>

        {/* Stat Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-5 text-white shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className="rounded-lg bg-white/20 p-2">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium text-white/90">
                  <span className="inline-flex items-center gap-0.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {stat.change}
                  </span>{" "}
                  vs last period
                </p>
                {/* Decorative circle */}
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Bar Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Monthly Placements
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                {period}
              </span>
            </div>

            <div className="flex items-end gap-3 sm:gap-5">
              {monthlyPlacements.map((m) => {
                const heightPercent = (m.value / maxValue) * 100;
                return (
                  <div
                    key={m.month}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <span className="text-xs font-semibold text-slate-700">
                      {m.value}
                    </span>
                    <div className="w-full overflow-hidden rounded-t-lg bg-slate-100"
                      style={{ height: "160px" }}
                    >
                      <div
                        className="mt-auto w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
                        style={{
                          height: `${heightPercent}%`,
                          marginTop: `${100 - heightPercent}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Recent Activity
            </h2>
            <ul className="space-y-4">
              {recentActivity.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="mt-1.5 flex-shrink-0">
                    <span
                      className={`block h-2.5 w-2.5 rounded-full ${
                        activityDot[item.type] || "bg-slate-300"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 leading-snug">
                      {item.text}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
