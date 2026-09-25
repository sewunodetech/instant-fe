"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, AtSign, CircleAlert, Loader2, Mail, ShieldCheck, Wallet } from "lucide-react";
import { AuthScene } from "@/components/auth/auth-backdrop";
import { AppleIcon, DiscordIcon, GoogleIcon, XIcon } from "@/components/auth/provider-icons";
import { useAuth } from "@/components/providers/auth-provider";

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;
const ease = [0.16, 1, 0.3, 1] as const;

const socials = [
  { id: "google", label: "Google", Icon: GoogleIcon },
  { id: "apple", label: "Apple", Icon: AppleIcon },
  { id: "discord", label: "Discord", Icon: DiscordIcon },
  { id: "twitter", label: "X", Icon: XIcon },
] as const;

type Method = "email" | "google" | "apple" | "discord" | "twitter" | "wallet";

/** White sheet that rises over the scene; holds every auth step. */
function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ y: 48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.15, ease }}
      className="relative z-10 w-full rounded-t-[2rem] bg-surface-container-lowest/95 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] shadow-[0_-12px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl"
    >
      <span aria-hidden className="mx-auto mb-4 block h-1.5 w-10 rounded-full bg-on-surface/15" />
      {children}
    </motion.section>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-2xl bg-error-container px-3.5 py-2.5 text-body-sm text-on-error-container">
      <CircleAlert size={18} className="mt-0.5 shrink-0" />
      {message}
    </p>
  );
}

function LoginContent() {
  const router = useRouter();
  const nextPath = useSearchParams().get("next") || "/home";
  const { ready, authenticated, user, needsProfile, isSyncing, error, login, logout, refreshUser, updateProfile } =
    useAuth();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ready && !isSyncing && authenticated && !needsProfile && user) router.replace(nextPath);
  }, [ready, authenticated, needsProfile, isSyncing, user, router, nextPath]);

  const open = (method?: Method) => {
    setFormError(null);
    login(method ? { loginMethods: [method] } : undefined);
  };

  async function completeProfile(e: React.FormEvent) {
    e.preventDefault();
    const normalized = username.trim().toLowerCase().replace(/^@/, "");
    if (!USERNAME_RE.test(normalized)) {
      setFormError("3–30 characters: a–z, 0–9 or underscore.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await updateProfile({ username: normalized, displayName: displayName.trim() || undefined });
      router.replace(nextPath);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Couldn't save your username.");
      setSaving(false);
    }
  }

  const signedIn = ready && authenticated;
  const claiming = signedIn && needsProfile;
  const redirecting = signedIn && !needsProfile;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="relative z-10 px-6 pt-4 text-center"
      >
        <h1 className="text-[2.25rem] leading-[1.05] font-extrabold tracking-[-0.025em] text-balance text-on-surface">
          {claiming ? (
            <>
              One last thing. <span className="text-secondary">Pick your name.</span>
            </>
          ) : (
            <>
              Snap now. <span className="text-secondary">Win the moment.</span>
            </>
          )}
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-base leading-relaxed font-medium text-balance text-on-surface-variant">
          {claiming
            ? "This is how the community finds, tags and votes for you."
            : "Join photo challenges, get voted, win real USDC prizes."}
        </p>
      </motion.div>

      <AuthScene />

      <Sheet>
        {redirecting && error && !user ? (
          <div className="flex flex-col gap-3 py-2">
            <ErrorNote message={`We couldn't load your account: ${error}`} />
            <button
              type="button"
              onClick={() => void refreshUser()}
              className="flex h-14 w-full items-center justify-center rounded-full bg-secondary-container text-label-lg font-bold text-on-secondary"
            >
              Try again
            </button>
            <button type="button" onClick={() => void logout()} className="h-11 text-label-md text-on-surface-variant">
              Use a different account
            </button>
          </div>
        ) : redirecting ? (
          <div className="flex flex-col items-center gap-3 py-8" role="status">
            <Loader2 size={28} className="animate-spin text-secondary" />
            <p className="text-label-md text-on-surface-variant">Taking you in…</p>
          </div>
        ) : claiming ? (
          <form onSubmit={completeProfile} className="flex flex-col gap-3" noValidate>
            <label className="flex flex-col gap-1.5">
              <span className="text-label-sm text-on-surface-variant">Username</span>
              <span className="flex h-14 items-center gap-2 rounded-2xl bg-surface-container-low px-4 ring-2 ring-transparent transition focus-within:ring-secondary/40">
                <AtSign size={18} className="text-on-surface-variant" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase().slice(0, 30))}
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="username"
                  spellCheck={false}
                  autoFocus
                  placeholder="your_handle"
                  aria-invalid={Boolean(formError)}
                  className="h-full w-full bg-transparent text-base font-semibold outline-none placeholder:text-on-surface-variant/45"
                />
                <span className="text-label-sm text-on-surface-variant/60 tabular-nums">{username.length}/30</span>
              </span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label-sm text-on-surface-variant">Display name (optional)</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
                autoComplete="nickname"
                placeholder="How you appear on snaps"
                className="h-14 w-full rounded-2xl bg-surface-container-low px-4 text-base outline-none ring-2 ring-transparent transition placeholder:text-on-surface-variant/45 focus:ring-secondary/40"
              />
            </label>
            {(formError || error) && <ErrorNote message={formError || error!} />}
            <button
              type="submit"
              disabled={saving}
              className="mt-1 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-secondary-container text-label-lg font-bold text-on-secondary shadow-pop-blue transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
              {saving ? "Saving…" : "Let's go"}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => open("email")}
              disabled={!ready}
              className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-secondary-container text-label-lg font-bold text-on-secondary shadow-pop-blue transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {ready ? <Mail size={20} /> : <Loader2 size={20} className="animate-spin" />}
              Continue with email
            </button>

            <div className="flex items-center gap-3 py-1 text-label-sm text-on-surface-variant">
              <span className="h-px flex-1 bg-on-surface/10" />
              or continue with
              <span className="h-px flex-1 bg-on-surface/10" />
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {socials.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={`Continue with ${label}`}
                  onClick={() => open(id)}
                  disabled={!ready}
                  className="flex h-14 items-center justify-center rounded-2xl bg-surface-container-low transition-all active:scale-95 disabled:opacity-60"
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => open("wallet")}
              disabled={!ready}
              className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full border-2 border-on-surface/10 text-label-lg text-on-surface transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <Wallet size={20} className="text-bnb-dim" />
              I have a crypto wallet
            </button>

            {error && <ErrorNote message={error} />}

            <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-label-sm text-on-surface-variant">
              <ShieldCheck size={14} className="text-tertiary" />
              New here? An account and free wallet are created for you.
            </p>
          </div>
        )}
      </Sheet>
    </>
  );
}

export default function LoginPage() {
  return (
    // Same phone column as the app shell, so login → home feels like one app.
    <div className="min-h-dvh w-full bg-surface-dim">
      <div className="app-shell relative flex min-h-dvh flex-col overflow-hidden bg-surface sm:shadow-elevated">
        <header className="relative z-10 flex h-16 items-center justify-between px-5 pt-safe">
          <Link href="/" aria-label="instant.fun home">
            <Image src="/brand/logo.png" alt="instant.fun" width={120} height={32} priority className="h-8 w-auto" />
          </Link>
          <Link
            href="/"
            className="flex h-10 items-center gap-1 rounded-full bg-surface-container-lowest/80 px-3.5 text-label-sm text-on-surface-variant shadow-soft backdrop-blur-md"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
        </header>
        <Suspense fallback={<div className="flex-1" />}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
