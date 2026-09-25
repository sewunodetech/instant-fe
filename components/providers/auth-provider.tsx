"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  PrivyProvider,
  useLogin,
  useLogout,
  usePrivy,
  type LoginModalOptions,
  type User as PrivyUser,
} from "@privy-io/react-auth";
import { patchMe, verifyPrivyToken } from "@/lib/api-client";
import { appChain } from "@/lib/chain";
import type { AppUser, AppUserWithStats } from "@/lib/types";

type AuthContextValue = {
  /** Privy SDK finished initializing — safe to read `authenticated` / `user`. */
  ready: boolean;
  authenticated: boolean;
  /** App user provisioned in our DB via `POST /api/auth/verify`. */
  user: AppUserWithStats | null;
  privyUser: PrivyUser | null;
  /** Signed in with Privy but our app user has no username yet (first-time register). */
  needsProfile: boolean;
  /** Waiting on Privy init or backend verify sync. */
  isSyncing: boolean;
  error: string | null;
  login: (options?: LoginModalOptions) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AppUserWithStats | null>;
  updateProfile: (
    data: Partial<Pick<AppUser, "username" | "displayName" | "avatarUrl" | "bio" | "isPrivate">>
  ) => Promise<AppUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!APP_ID) {
    throw new Error("Missing NEXT_PUBLIC_PRIVY_APP_ID environment variable");
  }

  return (
    <PrivyProvider
      appId={APP_ID}
      config={{
        loginMethods: ["email", "google", "apple", "discord", "twitter", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#106df4",
          logo: "/brand/logo.png",
          landingHeader: "Welcome to instant.fun",
          loginMessage: "Snap. Join. Get Voted.",
          showWalletLoginFirst: false,
          walletChainType: "ethereum-only",
        },
        defaultChain: appChain,
        supportedChains: [appChain],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          showWalletUIs: true,
        },
      }}
    >
      <AuthStateProvider>{children}</AuthStateProvider>
    </PrivyProvider>
  );
}

function AuthStateProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user: privyUser, getAccessToken } = usePrivy();
  const [user, setUser] = useState<AppUserWithStats | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncInFlight = useRef(false);

  const refreshUser = useCallback(async () => {
    if (!authenticated) {
      setUser(null);
      return null;
    }

    syncInFlight.current = true;
    setIsSyncing(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("No access token");
      const { user: verified } = await verifyPrivyToken(token);
      setUser(verified);
      return verified;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to sync session");
      return null;
    } finally {
      syncInFlight.current = false;
      setIsSyncing(false);
    }
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    if (!ready) return;
    // Signed-out state is derived below (`user` is masked when !authenticated).
    if (authenticated && !syncInFlight.current) void refreshUser();
  }, [ready, authenticated, refreshUser]);

  // The embedded wallet is created right after login, often after our first
  // verify call. Re-sync once it exists so the account gets its address.
  const privyWallet = privyUser?.wallet?.address;
  const walletSyncedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!user || user.walletAddress || !privyWallet || syncInFlight.current) return;
    if (walletSyncedFor.current === privyWallet) return; // one retry per wallet
    walletSyncedFor.current = privyWallet;
    void refreshUser();
  }, [user, privyWallet, refreshUser]);

  const { login } = useLogin({
    onComplete: () => {
      void refreshUser();
    },
    onError: (code) => {
      const pretty =
        typeof code === "string"
          ? code
              .replace(/_/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase())
          : "Login failed";
      setError(pretty);
    },
  });

  const { logout: privyLogout } = useLogout({
    onSuccess: () => {
      setUser(null);
      setError(null);
    },
  });

  const logout = useCallback(async () => {
    await privyLogout();
  }, [privyLogout]);

  const updateProfile = useCallback(
    async (data: Partial<Pick<AppUser, "username" | "displayName" | "avatarUrl" | "bio" | "isPrivate">>) => {
      const updated = await patchMe(data);
      setUser((prev) => (prev ? { ...prev, ...updated } : { ...updated }));
      return updated;
    },
    []
  );

  const loginWithModal = useCallback(
    (options?: LoginModalOptions) => {
      setError(null);
      login(options);
    },
    [login]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      authenticated,
      user: authenticated ? user : null,
      privyUser,
      needsProfile: authenticated && !!user && !user.username,
      isSyncing: ready && authenticated && isSyncing && !user,
      error,
      login: loginWithModal,
      logout,
      refreshUser,
      updateProfile,
    }),
    [
      ready,
      authenticated,
      user,
      privyUser,
      isSyncing,
      error,
      loginWithModal,
      logout,
      refreshUser,
      updateProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
