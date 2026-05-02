import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Video, Phone } from 'lucide-react';
import useStore from '../../store/useStore';
import { getSocket } from '../../lib/socket';

// Mounted at the app root for any authenticated user. Listens to the user's
// personal socket room and surfaces in-app toasts for cross-cutting events
// (meeting started, etc.). Renders nothing.
export default function GlobalNotifications() {
  const { isAuthenticated, currentUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const socket = getSocket();

    const handleMeetingStarted = ({ bookingId, startedBy, mode, subject }) => {
      // The user who clicked Join also receives this — ignore self.
      if (startedBy?.id === currentUser?.id) return;

      const Icon = mode === 'phone' ? Phone : Video;
      const callType = mode === 'phone' ? 'call' : 'meeting';

      toast.custom(
        (t) => (
          <div
            className={`pointer-events-auto flex w-[360px] items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg ${
              t.visible ? 'animate-in slide-in-from-top-2' : 'animate-out fade-out'
            }`}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {startedBy?.name || 'Someone'} started the {callType}
              </p>
              {subject && (
                <p className="truncate text-xs text-slate-500">{subject}</p>
              )}
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
              >
                Later
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate(`/meeting/${bookingId}`);
                }}
                className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
              >
                Join now
              </button>
            </div>
          </div>
        ),
        { duration: 30000 } // 30s — long enough to react, short enough to clear
      );
    };

    socket.on('meeting:started', handleMeetingStarted);
    return () => {
      socket.off('meeting:started', handleMeetingStarted);
    };
  }, [isAuthenticated, currentUser?.id, navigate]);

  return null;
}
