import { Animated, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { colors } from '../theme';

// Wrapper with safe-area, keyboard avoidance AND a soft fade+slide-in so every
// screen feels intentional when it mounts.
export default function Screen({ children, style, bg, statusBarStyle = 'dark', animate = true }) {
  const background = bg || colors.bg;
  const opacity = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const translate = useRef(new Animated.Value(animate ? 8 : 0)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [animate, opacity, translate]);

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: background }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={statusBarStyle} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <Animated.View
          style={[
            styles.flex,
            { opacity, transform: [{ translateY: translate }] },
            style,
          ]}
        >
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
});
