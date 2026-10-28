import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
}

/** null until the person picks on the welcome screen. */
export type Mode = "guest" | "account" | null;

interface AuthState {
  mode: Mode;
  token: string | null;
  user: User | null;
  /** Shown on the welcome screen, e.g. after the session expires. */
  notice: string | null;
  continueAsGuest: () => void;
  signedIn: (token: string, user: User) => void;
  /** Back to the welcome screen. Signs out of the account, if any. */
  signOut: () => void;
  expire: () => void;
}

// The session is saved to localStorage under this key.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      mode: null,
      token: null,
      user: null,
      notice: null,

      continueAsGuest: () => set({ mode: "guest", notice: null }),

      signedIn: (token, user) => set({ mode: "account", token, user, notice: null }),

      signOut: () => set({ mode: null, token: null, user: null, notice: null }),

      expire: () =>
        set({ mode: null, token: null, user: null, notice: "Your session expired. Please sign in again." }),
    }),
    {
      name: "task-manager-auth",
      partialize: ({ mode, token, user }) => ({ mode, token, user }),
    },
  ),
);
