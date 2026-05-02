import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Expo SecureStore is unavailable on web; fall back to AsyncStorage there.
// On device it uses Keychain (iOS) or EncryptedSharedPreferences (Android).
const WEB = Platform.OS === 'web';

const ACCESS_KEY = 'em.access';
const REFRESH_KEY = 'em.refresh';

async function setItem(key, value) {
  if (WEB) return AsyncStorage.setItem(key, value);
  return SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
}

async function getItem(key) {
  if (WEB) return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key) {
  if (WEB) return AsyncStorage.removeItem(key);
  return SecureStore.deleteItemAsync(key);
}

export const tokenStorage = {
  async save(tokens) {
    await Promise.all([
      tokens?.accessToken ? setItem(ACCESS_KEY, tokens.accessToken) : null,
      tokens?.refreshToken ? setItem(REFRESH_KEY, tokens.refreshToken) : null,
    ]);
  },
  async getAccess() {
    return getItem(ACCESS_KEY);
  },
  async getRefresh() {
    return getItem(REFRESH_KEY);
  },
  async clear() {
    await Promise.all([deleteItem(ACCESS_KEY), deleteItem(REFRESH_KEY)]);
  },
};
