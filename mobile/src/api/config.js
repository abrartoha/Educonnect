import Constants from 'expo-constants';
import { Platform } from 'react-native';

// The backend URL. Priority:
//   1) EXPO_PUBLIC_API_URL env var (for production / explicit override)
//   2) app.json extra.apiBaseUrl
//   3) Auto-derive from Metro host (works on a real device via LAN)
function resolveApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  const configUrl = Constants.expoConfig?.extra?.apiBaseUrl;

  // When running on a physical device via Expo Go, `localhost` refers to
  // the phone itself, not your laptop. Derive the host from the Metro
  // bundler URI and point at port 5050 instead.
  const hostUri =
    Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  const host = hostUri?.split(':')?.[0];

  if (host && Platform.OS !== 'web') {
    return `http://${host}:5050`;
  }
  return (configUrl || 'http://localhost:5050').replace(/\/$/, '');
}

export const API_BASE_URL = resolveApiBaseUrl();
