import { useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Video,
  ArrowRightLeft,
} from "lucide-react";
import useStore from "../../store/useStore";
import { bookingsApi } from "../../api/endpoints";
import { useApiResource } from "../../hooks/useApiResource";
import { normaliseBooking } from "../../api/mappers";
import JoinMeetingButton from "../../components/meeting/JoinMeetingButton";

const tabs = [
  { key: "all", label: "All" },
  { key: "incoming", label: "Incoming" },
  { key: "outgoing", label: "Outgoing" },
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

export default function UniBookings() {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState("all");
  const { data, refetch } = useApiResource(() => bookingsApi.list(), []);

  // Decorate each booking with whether the uni is the booker or the provider.
  const bookings = (data?.items || [])
    .map(normaliseBooking)
    .map((b) => ({
      ...b,
      iAmProvider: b.provider?.id === currentUser?.id,
      counterparty: b.provider?.id === currentUser?.id ? b.student : b.provider,
    }));

  const filtered = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "incoming") return b.iAmProvider;
    if (activeTab === "outgoing") return !b.iAmProvider;
    if (activeTab === "upcoming") return b.status === "pending" || b.status === "confirmed";
    return b.status === activeTab;
  });

  const handleConfirm = async (id) => {
    try {
      await bookingsApi.updateStatus(id, "CONFIRMED");
      toast.success("Booking confirmed");
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not confirm");
    }
  };

  const handleCancel = async (id) => {
    try {
      await bookingsApi.updateStatus(id, "CANCELLED");
      toast.success("Booking cancelled");
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not cancel");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
        <p className="mt-1 text-slate-500">
          Meetings with students, agents, and consultants
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
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

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <CalendarCheck className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              No bookings found for this filter.
            </p>
          </div>
        )}

        {filtered.map((booking) => {
          const cfg = statusConfig[booking.status] || statusConfig.pending;
          const dt = new Date(booking.scheduledAt);
          return (
            <div
              key={booking.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {booking.counterparty?.name || "User"}
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          <ArrowRightLeft className="h-3 w-3" />
                          {booking.iAmProvider ? "Incoming" : "Outgoing"}
                        </span>
                      </p>
                      <p className="text-sm text-slate-500">{booking.subject}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <CalendarCheck className="h-4 w-4 text-slate-400" />
                      {dt.toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {dt.toLocaleTimeString("en-AU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      ({booking.durationMinutes} min)
                    </span>
                    {booking.mode === "video" && (
                      <span className="flex items-center gap-1.5">
                        <Video className="h-4 w-4 text-slate-400" />
                        Video Call
                      </span>
                    )}
                  </div>
                </div>

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

                  {/* Provider-side: confirm/cancel a pending booking */}
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
                        onClick={() => handleCancel(booking.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Booker-side: only cancel allowed */}
                  {!booking.iAmProvider &&
                    (booking.status === "pending" ||
                      booking.status === "confirmed") && (
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
