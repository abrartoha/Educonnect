import { create } from 'zustand';
import { authApi } from '../api/endpoints.js';
import { api } from '../api/client.js';

// ---------------------------------------------------------------------------
// Auth-only store. ALL domain data lives on the server — pages fetch via api/.
// Cookies (httpOnly) hold the session; we never store tokens in JS.
// Role is normalised to lowercase for the existing UI (admin/university/etc).
// ---------------------------------------------------------------------------

const normaliseUser = (user) =>
  user
    ? {
        ...user,
        role: String(user.role || '').toLowerCase(),
      }
    : null;

const mapApiError = (err) => {
  if (!err) return 'Unexpected error';
  // Zod validation errors carry a structured "details.issues" array.
  if (err.code === 'BAD_REQUEST' && err.details?.issues?.length) {
    return err.details.issues[0].message || 'Validation failed';
  }
  return err.message || 'Request failed';
};

const useStore = create((set) => ({
  currentUser: null,
  isAuthenticated: false,
  authReady: false, // becomes true after the initial /auth/me call resolves

  // Called once on app mount. Fetches the current user if a valid cookie exists.
  hydrate: async () => {
    try {
      const { user } = await authApi.me();
      const u = normaliseUser(user);
      set({ currentUser: u, isAuthenticated: !!u, authReady: true });
    } catch {
      set({ currentUser: null, isAuthenticated: false, authReady: true });
    }
  },

  login: async (email, password) => {
    try {
      const { user } = await authApi.login(email, password);
      // Session identifier changes after login → old CSRF cookie no longer
      // matches. Drop the cached token so the next mutating call refetches.
      api.resetCsrf();
      const u = normaliseUser(user);
      set({ currentUser: u, isAuthenticated: true });
      return { success: true, user: u };
    } catch (err) {
      return { success: false, error: mapApiError(err) };
    }
  },

  signup: async (payload) => {
    try {
      const { user } = await authApi.signup(payload);
      api.resetCsrf();
      const u = normaliseUser(user);
      set({ currentUser: u, isAuthenticated: true });
      return { success: true, user: u };
    } catch (err) {
      return { success: false, error: mapApiError(err) };
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // best-effort — we still clear local state
    }
    api.resetCsrf();
    set({ currentUser: null, isAuthenticated: false });
  },

  // Used by profile pages after updating data server-side.
  setCurrentUser: (user) => set({ currentUser: normaliseUser(user) }),
}));

export default useStore;
