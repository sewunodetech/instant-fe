"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Icon } from "@/components/icon";

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/home";
  const { ready, authenticated, user, needsProfile, isSyncing, error, login, updateProfile } =
    useAuth();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!ready || isSyncing) return;
    if (authenticated && !needsProfile) {
      router.replace(nextPath);
    }
  }, [ready, authenticated, needsProfile, isSyncing, router, nextPath]);

  const openLogin = (methods?: { loginMethods?: ("email" | "google" | "apple" | "discord" | "twitter" | "wallet")[] }) => {
    setFormError(null);
    login(methods);
  };

  async function completeProfile(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const normalized = username.trim().toLowerCase().replace(/^@/, "");
    if (!USERNAME_RE.test(normalized)) {
      setFormError("Username must be 3–30 chars: a–z, 0–9, underscore.");
      return;
    }

    setSaving(true);
    setSubmitted(true);
    try {
      await updateProfile({
        username: normalized,
        displayName: displayName.trim() || user?.displayName || undefined,
      });
      router.replace(nextPath);
    } catch (err) {
      setSubmitted(false);
      setFormError(err instanceof Error ? err.message : "Could not save username");
    } finally {
      setSaving(false);
    }
  }

  if (ready && authenticated && needsProfile) {
    return (
      <main className="flex flex-1 flex-col px-space-md pb-10">
        <div className="mt-6 flex flex-col items-center px-space-xs text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/40 text-primary">
            <Icon name="person_add" className="text-[26px]" />
          </div>
          <h1 className="text-headline-lg-mobile">Claim your handle</h1>
          <p className="mt-space-sm max-w-[280px] leading-relaxed text-on-surface-variant">
            Pick a unique username so the community can find and tag you.
          </p>
        </div>

        <form onSubmit={completeProfile} className="mt-8 flex flex-col gap-space-sm">
          <label className="flex flex-col gap-1.5 text-left">
            <span className="text-label-sm text-on-surface-variant">Username</span>
            <div className="flex h-12 items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20">
              <span className="text-body-md text-on-surface-variant">@</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="your_handle"
                className="h-full w-full bg-transparent text-body-md outline-none placeholder:text-on-surface-variant/50"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-left">
            <span className="text-label-sm text-on-surface-variant">Display name (optional)</span>
            <div className="flex h-12 items-center rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How you appear on snaps"
                className="h-full w-full bg-transparent text-body-md outline-none placeholder:text-on-surface-variant/50"
              />
            </div>
          </label>

          {(formError || error) && (
            <p className="text-body-sm text-error" role="alert">
              {formError || error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || submitted}
            className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary-container text-label-lg text-on-primary-container shadow-card transition-all hover:bg-primary-fixed active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Continue"}
            {!saving && <Icon name="arrow_forward" className="text-[20px]" />}
          </button>
        </form>
      </main>
    );
  }

  if (ready && authenticated && !needsProfile) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary-container border-t-transparent" />
        <p className="text-label-md text-on-surface-variant">Taking you in…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-space-md pb-10">
      <div className="mt-8 flex flex-col items-center px-space-xs text-center">
        <div className="relative mb-space-sm inline-flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/40 text-primary">
            <Icon name="bolt" filled className="text-[26px]" />
          </div>
        </div>
        <h1 className="max-w-[300px] text-headline-lg-mobile leading-tight">
          Snap. Join.{" "}
          <span className="-rotate-1 rounded-2xl bg-primary-container px-2.5 py-0.5 font-extrabold text-on-primary-container shadow-sm">
            Get Voted.
          </span>
        </h1>
        <p className="mt-space-sm max-w-[280px] leading-relaxed text-on-surface-variant">
          Sign in or create an account with email, social, or your wallet — one tap and you&apos;re in.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-space-sm">
        <button
          type="button"
          onClick={() => openLogin({ loginMethods: ["email"] })}
          disabled={!ready}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary-container text-label-lg text-on-primary-container shadow-card transition-all hover:bg-primary-fixed active:scale-[0.98] disabled:opacity-60"
        >
          <Icon name="mail" className="text-[20px]" />
          Continue with email
        </button>

        <button
          type="button"
          onClick={() => openLogin({ loginMethods: ["google"] })}
          disabled={!ready}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest text-label-lg text-on-surface shadow-sm transition-all hover:bg-surface-container active:scale-[0.98] disabled:opacity-60"
        >
          <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09A6.7 6.7 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => openLogin({ loginMethods: ["wallet"] })}
          disabled={!ready}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest text-label-lg text-on-surface shadow-sm transition-all hover:bg-surface-container active:scale-[0.98] disabled:opacity-60"
        >
          <Icon name="account_balance_wallet" className="text-[20px]" />
          Continue with wallet
        </button>

        <button
          type="button"
          onClick={() => openLogin()}
          disabled={!ready}
          className="flex h-11 w-full items-center justify-center text-label-md text-secondary hover:underline disabled:opacity-60"
        >
          More options
        </button>
      </div>

      {(error || formError) && (
        <p className="mt-4 text-center text-body-sm text-error" role="alert">
          {error || formError}
        </p>
      )}

      <p className="mt-auto pt-8 text-center text-body-sm leading-relaxed text-on-surface-variant">
        By continuing you agree to our{" "}
        <span className="text-on-surface underline decoration-outline-variant">Terms</span> &{" "}
        <span className="text-on-surface underline decoration-outline-variant">Privacy Policy</span>.
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-surface">
      <header className="flex h-16 items-center px-space-md pt-safe">
        <Link href="/" aria-label="instant.fun home">
          <Image src="/brand/logo.png" alt="instant.fun" width={120} height={32} priority className="h-8 w-auto" />
        </Link>
      </header>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary-container border-t-transparent" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
