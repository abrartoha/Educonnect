import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  LiveKitRoom,
  AudioSession,
  VideoTrack,
  registerGlobals,
  useTracks,
  useLocalParticipant,
  useRoomContext,
  useTrackToggle,
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import Icon from '../../components/Icon';
import { meetingsApi } from '../../api/endpoints';
import { colors, radius, typography } from '../../theme';

// Required once for the WebRTC peer to plug into RN globals. Wrapped so
// importing this module doesn't crash Expo Go — the call only runs when
// MeetingScreen mounts (which only happens after the user runs an EAS dev
// build that includes the native module).
let globalsRegistered = false;
const ensureGlobals = () => {
  if (globalsRegistered) return;
  try {
    registerGlobals();
    globalsRegistered = true;
  } catch {
    // Native modules absent — caller will show the error fallback.
  }
};

// ---------------------------------------------------------------------------
// Themed control button — wraps useTrackToggle so we keep the violet/slate UX.
// ---------------------------------------------------------------------------
function ControlButton({ source, OnIconName, OffIconName }) {
  const { enabled, toggle } = useTrackToggle({ source });
  const IconName = enabled ? OnIconName : OffIconName;
  return (
    <Pressable
      onPress={toggle}
      style={({ pressed }) => [
        styles.ctrlBtn,
        !enabled && styles.ctrlBtnOff,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Icon name={IconName} size={20} color={colors.white} strokeWidth={2.2} />
    </Pressable>
  );
}

function LeaveButton({ onLeave }) {
  return (
    <Pressable
      onPress={onLeave}
      style={({ pressed }) => [
        styles.leaveBtn,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Icon name="PhoneOff" size={18} color={colors.white} strokeWidth={2.5} />
      <Text style={styles.leaveText}>Leave</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Stage — main video + small "you" tile in the corner. Tap the small tile to
// swap focus.
// ---------------------------------------------------------------------------
function Stage({ onLeave }) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const [focusedSid, setFocusedSid] = useState(null);

  const screenShare = tracks.find(
    (t) => t.publication?.source === Track.Source.ScreenShare
  );

  let focused;
  if (focusedSid) {
    focused = tracks.find((t) => t.participant.sid === focusedSid);
  }
  if (!focused && screenShare) focused = screenShare;
  if (!focused) {
    focused =
      tracks.find((t) => t.participant.sid !== localParticipant?.sid) ||
      tracks[0];
  }

  const focusedKey = focused
    ? `${focused.participant.sid}-${focused.publication?.source ?? 'placeholder'}`
    : null;
  const others = tracks.filter(
    (t) =>
      `${t.participant.sid}-${t.publication?.source ?? 'placeholder'}` !==
      focusedKey
  );

  const isAlone =
    room.numParticipants === 1 ||
    tracks.every((t) => t.participant.sid === localParticipant?.sid);

  return (
    <View style={styles.stage}>
      {/* Main video */}
      <View style={styles.mainVideo}>
        {focused ? (
          <VideoTrack
            trackRef={focused}
            objectFit="cover"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <ActivityIndicator color={colors.primary300} size="large" />
          </View>
        )}

        {/* Waiting state */}
        {isAlone ? (
          <View style={styles.waitingOverlay}>
            <View style={styles.waitingCard}>
              <View style={styles.waitingIconWrap}>
                <Icon name="Users" size={20} color={colors.primary300} />
              </View>
              <Text style={styles.waitingTitle}>Waiting for the other party</Text>
              <Text style={styles.waitingSub}>They'll join any moment now…</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* PiP tiles */}
      {others.length > 0 ? (
        <View style={styles.pipRail}>
          {others.map((t) => {
            const key = `${t.participant.sid}-${t.publication?.source ?? 'placeholder'}`;
            const isMe = t.participant.sid === localParticipant?.sid;
            return (
              <Pressable
                key={key}
                onPress={() => setFocusedSid(t.participant.sid)}
                style={({ pressed }) => [
                  styles.pipTile,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <VideoTrack
                  trackRef={t}
                  objectFit="cover"
                  style={StyleSheet.absoluteFill}
                />
                {isMe ? (
                  <View style={styles.youBadge}>
                    <Text style={styles.youBadgeText}>YOU</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {/* Controls */}
      <View style={styles.controls}>
        <ControlButton
          source={Track.Source.Microphone}
          OnIconName="Mic"
          OffIconName="MicOff"
        />
        <ControlButton
          source={Track.Source.Camera}
          OnIconName="Video"
          OffIconName="VideoOff"
        />
        <LeaveButton onLeave={onLeave} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper — fetches the join token, then mounts <LiveKitRoom>.
// ---------------------------------------------------------------------------
export default function MeetingScreen({ route, navigation }) {
  const { bookingId } = route.params || {};
  const [credentials, setCredentials] = useState(null);
  const [error, setError] = useState(null);

  // One-time globals registration for native WebRTC.
  useEffect(() => {
    ensureGlobals();
  }, []);

  // Start the iOS audio session for proper in-call audio.
  useEffect(() => {
    if (Platform.OS === 'ios') {
      AudioSession.startAudioSession?.();
      return () => {
        AudioSession.stopAudioSession?.();
      };
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await meetingsApi.joinToken(bookingId);
        if (!cancelled) setCredentials(data);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Could not join meeting');
          Alert.alert('Could not join', err?.message || 'Try again.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const handleDisconnect = () => navigation.goBack();

  if (error) {
    return (
      <View style={styles.fullDark}>
        <Text style={styles.errorTitle}>Unable to join</Text>
        <Text style={styles.errorBody}>{error}</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.errorBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.errorBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (!credentials) {
    return (
      <View style={styles.fullDark}>
        <ActivityIndicator color={colors.primary300} size="large" />
        <Text style={styles.loadingText}>Connecting…</Text>
      </View>
    );
  }

  const cameraDefault = credentials.mode !== 'phone';

  return (
    <LiveKitRoom
      serverUrl={credentials.wsUrl}
      token={credentials.token}
      connect
      audio
      video={cameraDefault}
      onDisconnected={handleDisconnect}
      style={styles.fullDark}
    >
      <Stage onLeave={() => navigation.goBack()} />
    </LiveKitRoom>
  );
}

const styles = StyleSheet.create({
  fullDark: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  stage: { flex: 1, backgroundColor: '#0f172a' },
  mainVideo: { flex: 1, backgroundColor: '#0f172a', position: 'relative' },
  center: { alignItems: 'center', justifyContent: 'center' },
  pipRail: {
    position: 'absolute',
    top: 60,
    right: 16,
    gap: 10,
  },
  pipTile: {
    width: 110,
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.5)',
    backgroundColor: '#1e293b',
  },
  youBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  youBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  waitingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: 'rgba(124, 58, 237, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  waitingIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  waitingTitle: { color: 'white', fontWeight: '700', fontSize: 14 },
  waitingSub: { color: 'rgba(148, 163, 184, 1)', fontSize: 12, marginTop: 2 },
  controls: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  ctrlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlBtnOff: { backgroundColor: '#dc2626' },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#dc2626',
    marginLeft: 8,
  },
  leaveText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  errorTitle: { color: 'white', fontWeight: '700', fontSize: 18 },
  errorBody: {
    color: 'rgba(148, 163, 184, 1)',
    marginTop: 8,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  errorBtn: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#7c3aed',
    borderRadius: radius.lg,
  },
  errorBtnText: { color: 'white', fontWeight: '700' },
  loadingText: { color: '#cbd5e1', marginTop: 12 },
});
