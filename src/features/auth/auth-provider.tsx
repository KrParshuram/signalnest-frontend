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
import { apiRequest, restoreAccessToken, setAccessToken } from "@/lib/api/client";

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  role: "OWNER" | "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  organizations?: OrganizationSummary[];
};

type MeResponse = {
  user: AuthUser;
  organizations: OrganizationSummary[];
};

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  user: AuthUser | null;
  organizations: OrganizationSummary[];
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refreshProfile = useCallback(async () => {
    const profile = await apiRequest<MeResponse>("/auth/me", { retryOnUnauthorized: false });
    setUser(profile.user);
    setOrganizations(profile.organizations);
    setStatus("authenticated");
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = await restoreAccessToken();
      if (!active) return;
      if (!token) {
        setStatus("anonymous");
        return;
      }

      try {
        const profile = await apiRequest<MeResponse>("/auth/me", { retryOnUnauthorized: false });
        if (!active) return;
        setUser(profile.user);
        setOrganizations(profile.organizations);
        setStatus("authenticated");
      } catch {
        setAccessToken(null);
        if (active) setStatus("anonymous");
      }
    }

    void restoreSession();
    return () => { active = false; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      retryOnUnauthorized: false,
    });
    setAccessToken(result.accessToken);
    setUser(result.user);
    setOrganizations(result.organizations ?? []);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: { name, email, password },
      retryOnUnauthorized: false,
    });
    setAccessToken(result.accessToken);
    setUser(result.user);
    await refreshProfile();
  }, [refreshProfile]);

  const logout = useCallback(async () => {
    try {
      await apiRequest<void>("/auth/logout", {
        method: "POST",
        retryOnUnauthorized: false,
      });
    } finally {
      setAccessToken(null);
      setUser(null);
      setOrganizations([]);
      setStatus("anonymous");
    }
  }, []);

  const value = useMemo(() => ({
    user, organizations, status, login, register, logout, refreshProfile,
  }), [user, organizations, status, login, register, logout, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
