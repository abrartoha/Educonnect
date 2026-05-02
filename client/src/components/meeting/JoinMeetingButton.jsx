import { Link } from 'react-router-dom';
import { Video, Phone } from 'lucide-react';

const JOIN_WINDOW_BEFORE_MS = 15 * 60 * 1000;
const JOIN_WINDOW_AFTER_MS = 15 * 60 * 1000;

// Mirrors the server's join-window rule. Renders nothing if the meeting
// can't be joined right now (wrong status/mode, outside time window).
// Both video and phone bookings get an in-app call (LiveKit handles audio
// for phone too); in-person bookings have no in-app action.
export default function JoinMeetingButton({ booking, className = '' }) {
  if (!booking) return null;

  const status = String(booking.status || '').toLowerCase();
  const mode = String(booking.mode || 'video').toLowerCase();
  if (status !== 'confirmed' && status !== 'upcoming') return null;
  if (mode !== 'video' && mode !== 'phone') return null;

  const scheduledAt = booking.scheduledAt || booking.date;
  if (!scheduledAt) return null;

  const start = new Date(scheduledAt).getTime();
  const durationMs = (booking.durationMinutes || 30) * 60 * 1000;
  const now = Date.now();

  const opensAt = start - JOIN_WINDOW_BEFORE_MS;
  const closesAt = start + durationMs + JOIN_WINDOW_AFTER_MS;
  if (now > closesAt) return null;

  const ready = now >= opensAt;
  const minutesUntil = Math.max(0, Math.ceil((opensAt - now) / 60000));
  const Icon = mode === 'phone' ? Phone : Video;
  const readyLabel = mode === 'phone' ? 'Start call' : 'Join meeting';

  if (!ready) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 ${className}`}
        title={`Opens 15 min before the meeting`}
      >
        <Icon className="h-3.5 w-3.5" />
        Opens in {minutesUntil} min
      </span>
    );
  }

  return (
    <Link
      to={`/meeting/${booking.id}`}
      className={`inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-violet-700 ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {readyLabel}
    </Link>
  );
}
