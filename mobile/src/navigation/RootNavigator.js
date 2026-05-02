import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { useAuth } from '../auth/AuthContext';
import { colors } from '../theme';

// Theme for React Navigation's default light mode. Matches brand colours.
const navTheme = {
  dark: false,
  colors: {
    primary: colors.primary600,
    background: colors.background,
    card: colors.white,
    text: colors.slate900,
    border: colors.border,
    notification: colors.danger,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

function Bootstrap() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator size="large" color={colors.primary600} />
    </View>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, ready } = useAuth();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        {!ready ? <Bootstrap /> : isAuthenticated ? <MainTabs /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
