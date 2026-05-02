import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  CalendarCheck,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Video,
  Phone,
  Users as UsersIcon,
} from 'lucide-react';
import { bookingsApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseBooking } from '../../api/mappers';
import JoinMeetingButton from '../../components/meeting/JoinMeetingButton';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const statusConfig = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

const modeIcon = {
  video: Video,
  phone: Phone,
  'in-person': UsersIcon,
};

export default function StudentBookings() {
  const [activeTab, setActiveTab] = useState('all');
  const { data, refetch } = useApiResource(() => bookingsApi.list(), []);
  const bookings = (data?.items || []).map(normaliseBooking);

  const filtered = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming')
      return b.status === 'pending' || b.status === 'confirmed';
    return b.status === activeTab;
  });

  const handleCancel = async (id) => {
    try {
      await bookingsApi.updateStatus(id, 'CANCELLED');
      toast.success('Booking cancelled');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not cancel');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        <p className="mt-1 text-slate-500">
          Meetings with universities, agents, and consultants
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const count =
            tab.key === 'all'
              ? bookings.length
              : tab.key === 'upcoming'
              ? bookings.filter(
                  (b) => b.status === 'pending' || b.status === 'confirmed'
                ).length
              : bookings.filter((b) => b.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  activeTab === tab.key
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
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
          const ModeIcon = modeIcon[booking.mode] || Video;
          return (
            <div
              key={booking.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {booking.provider?.name || 'Provider'}
                      </p>
                      <p className="text-sm text-slate-500">{booking.subject}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <CalendarCheck className="h-4 w-4 text-slate-400" />
                      {dt.toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {dt.toLocaleTimeString('en-AU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      ({booking.durationMinutes} min)
                    </span>
                    <span className="flex items-center gap-1.5 capitalize">
                      <ModeIcon className="h-4 w-4 text-slate-400" />
                      {booking.mode || 'video'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}
                  >
                    {booking.status === 'completed' && (
                      <CheckCircle className="h-3.5 w-3.5" />
                    )}
                    {booking.status === 'cancelled' && (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    {cfg.label}
                  </span>

                  {(booking.status === 'pending' ||
                    booking.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  )}

                  {booking.status === 'confirmed' && (
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
