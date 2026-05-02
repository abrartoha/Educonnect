import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';
import { messagingApi } from '../../api/endpoints';

// Starts (or reuses) a 1:1 conversation with the given user, then navigates
// to /messages/<id>. Hidden when the user is viewing their own profile.
export default function MessageUserButton({ targetUser, className = '' }) {
  const { isAuthenticated, currentUser } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!targetUser?.id) return null;
  if (currentUser?.id === targetUser.id) return null;

  const handleClick = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to message');
      return;
    }
    setLoading(true);
    try {
      const res = await messagingApi.startConversation(targetUser.id);
      const id = res?.item?.id;
      if (id) navigate(`/messages/${id}`);
    } catch (err) {
      toast.error(err.message || 'Could not start conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageSquare className="h-4 w-4" />
      )}
      Message
    </button>
  );
}
