import { useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";
import useStore from "../../store/useStore";
import { bookingsApi } from "../../api/endpoints";
import { useApiResource } from "../../hooks/useApiResource";
import { normaliseBooking } from "../../api/mappers";
import JoinMeetingButton from "../../components/meeting/JoinMeetingButton";

const tabs = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const statusConfig = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  upcoming: {
    label: "Upcoming",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

export default function AgentBookings() {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState("all");
  const { data, refetch } = useApiResource(() => bookingsApi.list(), []);
  const raw = (data?.items || []).map(normaliseBooking);

  // Map server statuses to the UI's statusConfig keys (confirmed → upcoming).
  const bookings = raw.map((b) => {
    const dt = new Date(b.scheduledAt);
    const iAmProvider = b.provider?.id === currentUser?.id;
    const counterparty = iAmProvider ? b.student : b.provider;
    return {
      id: b.id,
      student: counterparty?.name || "User",
      iAmProvider,
      date: dt.toISOString().slice(0, 10),
      time: dt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }),
      service: b.subject,
      status: b.status === 'confirmed' ? 'upcoming' : b.status,
      // Pass-through for JoinMeetingButton — server still expects raw values.
      scheduledAt: b.scheduledAt,
      durationMinutes: b.durationMinutes,
      mode: b.mode,
    };
  });

  const filtered =
    activeTab === "all"
      ? bookings
      : bookings.filter((b) => b.status === activeTab);

  const handleAccept = async (id) => {
    try {
      await bookingsApi.updateStatus(id, 'CONFIRMED');
      toast.success('Booking accepted');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not accept');
    }
  };

  const handleDecline = async (id) => {
    try {
      await bookingsApi.updateStatus(id, 'CANCELLED');
      toast.success('Booking declined');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not decline');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Bookings
          </h1>
          <p className="mt-1 text-base text-slate-500">
            Manage your student consultations
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto">
          <Filter className="mr-1 h-4 w-4 flex-shrink-0 text-slate-400" />
          {tabs.map((tab) => {
            const count =
              tab.key === "all"
                ? bookings.length
                : bookings.filter((b) => b.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                    activeTab === tab.key
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Booking Cards */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
              <CalendarCheck className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                No bookings found for this filter.
              </p>
            </div>
          )}

          {filtered.map((booking) => {
            const cfg = statusConfig[booking.status];
            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-base font-semibold text-slate-900">
                        {booking.student}
                      </span>
                      <span
                        className={`ml-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="h-3.5 w-3.5" />
                        {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {booking.time} ({booking.durationMinutes} min)
                      </span>
                    </div>

                    <p className="text-sm text-slate-600">{booking.service}</p>
                  </div>

                  {/* Right: Actions */}
                  {/* Provider side: accept or decline a pending booking. */}
                  {booking.iAmProvider && booking.status === "pending" && (
                    <div className="flex gap-2 sm:flex-shrink-0">
                      <button
                        onClick={() => handleAccept(booking.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(booking.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Decline
                      </button>
                    </div>
                  )}

                  {/* Booker side: only cancel allowed (server enforces too). */}
                  {!booking.iAmProvider &&
                    (booking.status === "pending" || booking.status === "upcoming") && (
                      <button
                        onClick={() => handleDecline(booking.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 sm:flex-shrink-0"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel
                      </button>
                    )}

                  {booking.status === "upcoming" && (
                    <div className="sm:flex-shrink-0">
                      <JoinMeetingButton booking={booking} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
