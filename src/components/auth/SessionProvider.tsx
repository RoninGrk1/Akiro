"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: "github" | "guest";
};

type SessionContextValue = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  githubConfigured: boolean | null;
  signInWithGitHub: () => Promise<void>;
  signInGuest: (name?: string) => void;
  /** @deprecated use signInGuest */
  signInStub: (name?: string) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);
const GUEST_KEY = "akiro.session.guest.v1";

function readGuest(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readGuest());
  const [isLoading, setIsLoading] = useState(false);
  const [githubConfigured, setGithubConfigured] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/config/status")
      .then((r) => r.json())
      .then((d: { githubConfigured?: boolean }) => {
        if (!cancelled) setGithubConfigured(Boolean(d.githubConfigured));
      })
      .catch(() => {
        if (!cancelled) setGithubConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signInWithGitHub = useCallback(async () => {
    if (!githubConfigured) {
      throw new Error(
        "GitHub OAuth Needs configuration — set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET",
      );
    }
    setIsLoading(true);
    try {
      // Full navigation required for OAuth redirect away from the SPA shell
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- OAuth must leave the app shell
      window.location.href = `${window.location.origin}/api/auth/signin/github`;
    } finally {
      setIsLoading(false);
    }
  }, [githubConfigured]);

  const signInGuest = useCallback((name = "Local Developer") => {
    const guest: SessionUser = {
      id: "guest-local",
      name: `${name} (guest)`,
      email: "guest@localhost",
      provider: "guest",
    };
    setUser(guest);
    window.localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(GUEST_KEY);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      githubConfigured,
      signInWithGitHub,
      signInGuest,
      signInStub: signInGuest,
      signOut,
    }),
    [user, isLoading, githubConfigured, signInWithGitHub, signInGuest, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
