import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ParticipantTile,
  TrackToggle,
  DisconnectButton,
  Chat,
  useTracks,
  useLocalParticipant,
  useRoomContext,
  ConnectionStateToast,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import './meeting.css';
import toast from 'react-hot-toast';
import {
  Loader2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Users,
  MessageSquare,
  X,
} from 'lucide-react';
import { meetingsApi } from '../../api/endpoints';

// ---------------------------------------------------------------------------
// Theme — match the app's violet/slate palette by overriding LiveKit's CSS vars.
// Applied inline to the wrapper so it scopes to this page only.
// ---------------------------------------------------------------------------
const livekitTheme = {
  '--lk-bg': '#0f172a',                  // slate-900
  '--lk-bg2': '#1e293b',                 // slate-800
  '--lk-fg': '#f8fafc',                  // slate-50
  '--lk-fg-secondary': '#94a3b8',        // slate-400
  '--lk-border-color': 'rgba(124, 58, 237, 0.25)',
  '--lk-accent-bg': '#7c3aed',           // violet-600
  '--lk-accent-fg': '#ffffff',
  '--lk-control-bg': 'rgba(30, 41, 59, 0.8)',
  '--lk-control-fg': '#f8fafc',
  '--lk-control-hover-bg': '#334155',    // slate-700
  '--lk-control-active-bg': '#7c3aed',
  '--lk-danger-bg': '#dc2626',           // red-600
  '--lk-danger-fg': '#ffffff',
};

// ---------------------------------------------------------------------------
// Themed control button — used for mic/camera/screen-share. LiveKit's
// `TrackToggle` exposes its state via render-prop children.
// ---------------------------------------------------------------------------
function ControlButton({ source, OnIcon, OffIcon, label }) {
  return (
    <TrackToggle
      source={source}
      className="lk-button group inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-slate-100 backdrop-blur-md transition-all hover:bg-slate-700 data-[lk-enabled=false]:bg-rose-600 data-[lk-enabled=false]:hover:bg-rose-700"
      title={label}
    >
      {({ enabled }) =>
        enabled ? (
          <OnIcon className="h-5 w-5" />
        ) : (
          <OffIcon className="h-5 w-5" />
        )
      }
    </TrackToggle>
  );
}

function ControlBar({ chatOpen, onToggleChat }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-3 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent px-4 pt-12 pb-6">
      <ControlButton
        source={Track.Source.Microphone}
        OnIcon={Mic}
        OffIcon={MicOff}
        label="Toggle microphone"
      />
      <ControlButton
        source={Track.Source.Camera}
        OnIcon={Video}
        OffIcon={VideoOff}
        label="Toggle camera"
      />
      <ControlButton
        source={Track.Source.ScreenShare}
        OnIcon={ScreenShare}
        OffIcon={ScreenShare}
        label="Share screen"
      />
      <button
        type="button"
        onClick={onToggleChat}
        title="Toggle chat"
        className={`inline-flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md transition-all ${
          chatOpen
            ? 'bg-violet-600 text-white hover:bg-violet-700'
            : 'bg-slate-800/80 text-slate-100 hover:bg-slate-700'
        }`}
      >
        <MessageSquare className="h-5 w-5" />
      </button>
      <DisconnectButton className="ml-2 inline-flex h-12 items-center gap-2 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white shadow-lg shadow-rose-600/30 transition-all hover:bg-rose-700 hover:shadow-rose-700/40">
        <PhoneOff className="h-4 w-4" />
        Leave
      </DisconnectButton>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The actual stage. Renders a "focused" participant full-screen + the others
// as small clickable tiles in the bottom-right. Click a tile to swap focus.
// ---------------------------------------------------------------------------
function MeetingStage() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [chatOpen, setChatOpen] = useState(false);

  // Camera + screen-share tracks. `onlySubscribed:false` keeps placeholders
  // when a participant is camera-off so we still see their tile.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  // Focused participant SID — null means "auto: prefer first remote".
  const [focusedSid, setFocusedSid] = useState(null);

  // Pick the focused track. Priority: explicit user choice → any screen share →
  // first remote camera → local (when alone).
  const { focused, others } = useMemo(() => {
    if (tracks.length === 0) return { focused: null, others: [] };

    const screenShare = tracks.find(
      (t) => t.publication?.source === Track.Source.ScreenShare
    );

    let focusedTrack;
    if (focusedSid) {
      focusedTrack = tracks.find((t) => t.participant.sid === focusedSid);
    }
    if (!focusedTrack && screenShare) {
      focusedTrack = screenShare;
    }
    if (!focusedTrack) {
      const remote = tracks.find(
        (t) => t.participant.sid !== localParticipant.sid
      );
      focusedTrack = remote || tracks[0];
    }

    const focusedKey = `${focusedTrack.participant.sid}-${focusedTrack.publication?.source ?? 'placeholder'}`;
    const otherTiles = tracks.filter(
      (t) =>
        `${t.participant.sid}-${t.publication?.source ?? 'placeholder'}` !==
        focusedKey
    );

    return { focused: focusedTrack, others: otherTiles };
  }, [tracks, focusedSid, localParticipant.sid]);

  // Connection state banner.
  const isAlone =
    room.numParticipants === 1 ||
    tracks.every((t) => t.participant.sid === localParticipant.sid);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      {/* Main stage */}
      <div className="absolute inset-0">
        {focused ? (
          <div className="lk-focus-stage relative h-full w-full">
            <ParticipantTile
              trackRef={focused}
              className="!h-full !w-full !rounded-none"
            />
            {/* Subtle gradient mask so name overlay is readable */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/60 to-transparent" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>

      {/* "Waiting" hint when the other party hasn't joined yet */}
      {isAlone && (
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-violet-500/30 bg-slate-900/80 px-6 py-4 text-center shadow-xl backdrop-blur-md">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/20">
            <Users className="h-5 w-5 text-violet-300" />
          </div>
          <p className="text-sm font-semibold text-white">Waiting for the other party</p>
          <p className="mt-1 text-xs text-slate-400">They'll join any moment now…</p>
        </div>
      )}

      {/* PiP rail — clickable tiles to swap focus */}
      {others.length > 0 && (
        <div className="absolute right-4 top-4 z-20 flex flex-col gap-3 sm:right-6 sm:top-6">
          {others.map((track) => {
            const key = `${track.participant.sid}-${track.publication?.source ?? 'placeholder'}`;
            const isMe = track.participant.sid === localParticipant.sid;
            return (
              <button
                key={key}
                onClick={() => setFocusedSid(track.participant.sid)}
                className="group relative h-32 w-48 overflow-hidden rounded-2xl border-2 border-violet-500/40 bg-slate-900 shadow-2xl shadow-black/50 ring-0 transition-all hover:border-violet-400 hover:scale-105 sm:h-36 sm:w-56"
                title={isMe ? 'Click to focus your video' : 'Click to focus this participant'}
              >
                <ParticipantTile
                  trackRef={track}
                  className="!h-full !w-full !rounded-none"
                />
                {isMe && (
                  <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-violet-600/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-md">
                    You
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <ControlBar chatOpen={chatOpen} onToggleChat={() => setChatOpen((v) => !v)} />

      {/* Chat side panel — slides in from the right when toggled */}
      <div
        className={`absolute inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col border-l border-slate-800/80 bg-slate-900/95 backdrop-blur-md transition-transform duration-200 sm:w-96 ${
          chatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!chatOpen}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-semibold text-white">In-meeting chat</span>
          </div>
          <button
            type="button"
            onClick={() => setChatOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="lk-chat-host flex-1 overflow-hidden">
          <Chat />
        </div>
      </div>

      <ConnectionStateToast />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper — fetches the join token, then mounts <LiveKitRoom> + stage.
// ---------------------------------------------------------------------------
export default function MeetingRoom() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await meetingsApi.joinToken(bookingId);
        if (!cancelled) setCredentials(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not join meeting');
          toast.error(err.message || 'Could not join meeting');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const handleDisconnect = () => navigate(-1);

  if (error) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white"
        style={livekitTheme}
      >
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold">Unable to join</p>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-colors hover:bg-violet-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!credentials) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-950 text-white"
        style={livekitTheme}
      >
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
          <span className="text-sm font-medium text-slate-200">Connecting…</span>
        </div>
      </div>
    );
  }

  const cameraDefault = credentials.mode !== 'phone';

  return (
    <div
      data-lk-theme="default"
      style={livekitTheme}
      className="h-screen w-screen overflow-hidden bg-slate-950"
    >
      <LiveKitRoom
        token={credentials.token}
        serverUrl={credentials.wsUrl}
        connect
        video={cameraDefault}
        audio
        onDisconnected={handleDisconnect}
        style={{ height: '100vh' }}
      >
        <MeetingStage />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
