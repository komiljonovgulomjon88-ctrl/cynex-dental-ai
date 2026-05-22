import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./types";

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// ── Auth store ────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  token: string | null;
  setUser:  (user: User)    => void;
  setToken: (token: string) => void;
  logout:   ()              => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:  null,
      token: null,
      setUser:  (user)  => set({ user }),
      setToken: (token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("cynex_token", token);
          setCookie("cynex_token", token, 7); // 7 days — matches middleware
        }
        set({ token });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("cynex_token");
          deleteCookie("cynex_token");
        }
        set({ user: null, token: null });
      },
    }),
    {
      name:        "cynex_user",
      partialize:  (s) => ({ user: s.user, token: s.token }),
    }
  )
);

// ── Scan store ────────────────────────────────────────────────────────────────
interface ScanState {
  currentScanId: string | null;
  setCurrentScanId: (id: string) => void;
  clearScan:        ()           => void;
}

export const useScanStore = create<ScanState>()((set) => ({
  currentScanId:    null,
  setCurrentScanId: (id) => set({ currentScanId: id }),
  clearScan:        ()   => set({ currentScanId: null }),
}));
