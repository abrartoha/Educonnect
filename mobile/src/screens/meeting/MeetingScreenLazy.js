import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

// Defers the @livekit/react-native import to runtime so Expo Go can boot the
// rest of the app without crashing on its native module access. When LiveKit
// isn't available (Expo Go), shows a friendly "needs dev build" message.
export default function MeetingScreenLazy(props) {
  const [Comp, setComp] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('./MeetingScreen');
        if (!cancelled) setComp(() => mod.default);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'LiveKit native module unavailable');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Video meetings need a dev build</Text>
        <Text style={styles.body}>
          Expo Go can't run the native WebRTC module. Build a development client with
          {'  '}
          <Text style={styles.code}>eas build --profile development</Text>
          {'  '}
          and install it on this device to enable video calls.
        </Text>
        <Pressable onPress={() => props.navigation.goBack()} style={styles.btn}>
          <Text style={styles.btnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (!Comp) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#a78bfa" size="large" />
        <Text style={styles.loading}>Loading meeting…</Text>
      </View>
    );
  }

  return <Comp {...props} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { color: 'white', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  body: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 19,
  },
  code: {
    fontFamily: 'Menlo',
    color: '#cbd5e1',
    backgroundColor: '#1e293b',
    paddingHorizontal: 4,
  },
  btn: {
    marginTop: 24,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
  },
  btnText: { color: 'white', fontWeight: '700' },
  loading: { color: '#cbd5e1', marginTop: 12 },
});
