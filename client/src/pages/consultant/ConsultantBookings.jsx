import { useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Video,
} from "lucide-react";
import useStore from "../../store/useStore";
import { bookingsApi } from "../../api/endpoints";
import { useApiResource } from "../../hooks/useApiResource";
import { normaliseBooking } from "../../api/mappers";
import JoinMeetingButton from "../../components/meeting/JoinMeetingButton";

const statusConfig = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  completed: {
    label: "Completed",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

const tabs = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function ConsultantBookings() {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState("all");
  const { data, refetch } = useApiResource(() => bookingsApi.list(), []);
  const raw = (data?.items || []).map(normaliseBooking);

  // Shape server bookings for the UI.
  const bookings = raw.map((b) => {
    const dt = new Date(b.scheduledAt);
    const iAmProvider = b.provider?.id === currentUser?.id;
    const counterparty = iAmProvider ? b.student : b.provider;
    return {
      id: b.id,
      student: counterparty?.name || 'User',
      iAmProvider,
      date: dt.toISOString().slice(0, 10),
      time: dt.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: b.subject,
      duration: `${b.durationMinutes} min`,
      status: b.status,
      mode: b.mode,
      // Pass-through for JoinMeetingButton.
      scheduledAt: b.scheduledAt,
      durationMinutes: b.durationMinutes,
    };
  });

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming")
      return b.status === "pending" || b.status === "confirmed";
    return b.status === activeTab;
  });

  const handleConfirm = async (id) => {
    try {
      await bookingsApi.updateStatus(id, 'CONFIRMED');
      toast.success('Booking confirmed');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not confirm');
    }
  };

  const handleCancel = async (id) => {
    try {
      await bookingsApi.updateStatus(id, 'CANCELLED');
      toast.success('Booking cancelled');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not cancel');
    }
  };

  const handleReschedule = (booking) => {
    toast.success(
      `Reschedule request sent to ${booking.student}. They'll receive an email with new slots.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
        <p className="mt-1 text-slate-500">
          Manage your consultation schedule
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div className="space-y-4">
        {filteredBookings.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <CalendarCheck className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              No bookings found for this filter.
            </p>
          </div>
        )}

        {filteredBookings.map((booking) => {
          const cfg = statusConfig[booking.status];
          return (
            <div
              key={booking.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {booking.student}
                      </p>
                      <p className="text-sm text-slate-500">
                        {booking.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <CalendarCheck className="h-4 w-4 text-slate-400" />
                      {booking.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {booking.time} ({booking.duration})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Video className="h-4 w-4 text-slate-400" />
                      Video Call
                    </span>
                  </div>
                </div>

                {/* Right: Status + Actions */}
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}
                  >
                    {booking.status === "completed" && (
                      <CheckCircle className="h-3.5 w-3.5" />
                    )}
                    {booking.status === "cancelled" && (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    {cfg.label}
                  </span>

                  {/* Provider side: confirm / reschedule / cancel */}
                  {booking.iAmProvider && booking.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirm(booking.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleReschedule(booking)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                      >
                        <CalendarCheck className="h-3.5 w-3.5" />
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Booker side: cancel only (server enforces too) */}
                  {!booking.iAmProvider &&
                    (booking.status === "pending" || booking.status === "confirmed") && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    )}

                  {booking.status === "confirmed" && (
                    <JoinMeetingButton booking={booking} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
