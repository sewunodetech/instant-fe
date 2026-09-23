"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Icon } from "@/components/icon";
import { AppleIcon, DiscordIcon, GoogleIcon, XIcon } from "@/components/auth/provider-icons";

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

const socials = [
  { id: "google", label: "Google", Icon: GoogleIcon },
  { id: "apple", label: "Apple", Icon: AppleIcon },
  { id: "discord", label: "Discord", Icon: DiscordIcon },
  { id: "twitter", label: "X", Icon: XIcon },
] as const;

function Sparkles() {
  return (
    <svg
      aria-hidden
      className="absolute -top-3 -right-3 h-6 w-6 rotate-12 text-primary-fixed drop-shadow-sm"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}

function AccentUnderline() {
  return (
    <svg
      aria-hidden
      className="absolute -bottom-2 left-0 h-3 w-full text-secondary-container opacity-80"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 100 12"
    >
      <path d="M2 8.5C30 2 70 2 98 9.5" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
    </svg>
  );
}

function BrandChip({
  icon,
  label,
  className,
  filled,
}: {
  icon: string;
  label: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-2 shadow-sm ring-1 ring-surface-container">
      <Icon name={icon} filled={filled} className={`text-[18px] ${className ?? ""}`} />
      <span className="text-label-sm">{label}</span>
    </span>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-primary-container text-label-lg text-on-primary-container shadow-pop-yellow transition-all hover:bg-primary-fixed hover:shadow-glow-amber active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
    >
      {icon}
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full border border-outline-variant/60 bg-surface-container-lowest text-label-lg text-on-surface shadow-soft transition-all hover:bg-surface-container hover:shadow-card active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-primary-container border-t-on-primary-container/70" />
        <span className="absolute inset-0 flex items-center justify-center">
          <Icon name="bolt" filled className="text-[18px] text-on-primary-container" />
        </span>
      </div>
      <p className="text-label-md text-on-surface-variant">{label}</p>
    </div>
  );
}

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

  const openLogin = (methods?: {
    loginMethods?: ("email" | "google" | "apple" | "discord" | "twitter" | "wallet")[];
  }) => {
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
        <div className="mt-4 flex flex-col items-center px-space-xs text-center">
          <div className="relative mb-4 inline-flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-secondary-container text-on-secondary shadow-pop-blue">
              <Icon name="person_add" className="text-[28px]" />
            </div>
            <Sparkles />
          </div>
          <h1 className="text-headline-lg-mobile">
            Claim your{" "}
            <span className="relative -rotate-1 rounded-2xl bg-primary-container px-2.5 py-0.5 font-extrabold text-on-primary-container shadow-sm">
              handle
            </span>
          </h1>
          <p className="mt-space-sm max-w-[280px] leading-relaxed text-on-surface-variant">
            Pick a unique username so the community can find and tag you.
          </p>
        </div>

        <form onSubmit={completeProfile} className="mt-7 flex flex-col gap-space-sm" noValidate>
          <div className="mb-1 flex items-center justify-center gap-3 rounded-3xl border border-outline-variant/50 bg-surface-container-lowest/80 p-3 shadow-soft">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-container to-primary-fixed-dim text-headline-sm font-extrabold text-on-primary-fixed ring-[3px] ring-primary-container/40">
              {(username || displayName)
                ? (username || displayName)
                    .split(/[\s_]+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase())
                    .join("")
                : (
                  <span className="material-symbols-outlined text-[24px]">person</span>
                )}
            </span>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-label-lg">{displayName || username || "Your handle"}</p>
              <p className="truncate text-body-sm text-on-surface-variant">
                {username ? `@${username}` : "@username will appear here"}
              </p>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container">
              <Icon name="check" filled className="text-[16px]" />
            </span>
          </div>

          <label className="flex flex-col gap-1.5 text-left">
            <span className="text-label-sm text-on-surface-variant">Username</span>
            <div className="flex h-[52px] items-center gap-2 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-4 shadow-soft transition-all focus-within:border-secondary focus-within:ring-[3px] focus-within:ring-secondary/15">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container text-label-sm text-on-surface-variant">
                @
              </span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="your_handle"
                maxLength={30}
                className="h-full w-full bg-transparent text-body-md font-medium outline-none placeholder:text-on-surface-variant/45"
              />
              <span
                className={`text-label-sm tabular-nums transition-colors ${
                  username.length >= 30 ? "text-error" : "text-on-surface-variant/60"
                }`}
              >
                {username.length}/30
              </span>
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-left">
            <span className="text-label-sm text-on-surface-variant">Display name (optional)</span>
            <div className="flex h-[52px] items-center rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-4 shadow-soft transition-all focus-within:border-secondary focus-within:ring-[3px] focus-within:ring-secondary/15">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.slice(0, 100))}
                placeholder="How you appear on snaps"
                className="h-full w-full bg-transparent text-body-md font-medium outline-none placeholder:text-on-surface-variant/45"
              />
            </div>
          </label>

          {(formError || error) && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-2xl bg-error-container px-3.5 py-2.5 text-body-sm text-on-error-container"
            >
              <Icon name="error" className="mt-0.5 shrink-0 text-[18px]" />
              <span>{formError || error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || submitted}
            className="mt-1 flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-primary-container text-label-lg text-on-primary-container shadow-pop-yellow transition-all hover:bg-primary-fixed hover:shadow-glow-amber active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary-container/30 border-t-on-primary-container" />
            ) : (
              <Icon name="arrow_forward" className="text-[20px]" />
            )}
            {saving ? "Saving…" : "Continue"}
          </button>
        </form>
      </main>
    );
  }

  if (ready && authenticated && !needsProfile) {
    return <Spinner label="Taking you in…" />;
  }

  return (
    <main className="flex flex-1 flex-col px-space-md pb-8">
      <div className="mt-3 flex flex-col items-center px-space-xs text-center">
        <div className="relative mb-space-sm inline-flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary-container text-on-primary-container shadow-pop-yellow">
            <Icon name="bolt" filled className="text-[28px]" />
          </div>
          <Sparkles />
        </div>

        <h1 className="max-w-[320px] text-headline-xl-mobile leading-tight">
          Snap. Join.{" "}
          <span className="relative mt-1 inline-block">
            <span className="relative z-10 inline-block -rotate-1 rounded-2xl bg-primary-container px-3 py-0.5 font-extrabold text-on-primary-container shadow-sm">
              Get Voted.
            </span>
            <AccentUnderline />
          </span>
        </h1>

        <p className="mt-space-sm max-w-[290px] leading-relaxed text-on-surface-variant">
          Sign in or create an account with email, social, or your wallet — one tap and you&apos;re
          in.
        </p>
      </div>

      <ul className="no-scrollbar -mx-space-md mt-5 flex items-center justify-center gap-2 overflow-x-auto px-space-md">
        <BrandChip icon="bolt" label="Instant Camera" className="text-secondary-container" />
        <BrandChip icon="favorite" label="Community Votes" className="text-error" filled />
        <BrandChip icon="emoji_events" label="USDC Rewards" className="text-tertiary" filled />
      </ul>

      <div className="mt-7 flex flex-col gap-space-sm">
        <PrimaryButton
          onClick={() => openLogin({ loginMethods: ["email"] })}
          disabled={!ready}
          icon={<Icon name="mail" className="text-[20px]" />}
        >
          Continue with email
        </PrimaryButton>

        <div className="grid grid-cols-4 gap-2.5">
          {socials.map(({ id, label, Icon: Brand }) => (
            <button
              key={id}
              type="button"
              aria-label={`Continue with ${label}`}
              title={label}
              onClick={() => openLogin({ loginMethods: [id] })}
              disabled={!ready}
              className="flex h-[52px] w-full items-center justify-center rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-soft transition-all hover:bg-surface-container hover:shadow-card active:scale-95 disabled:pointer-events-none disabled:opacity-60"
            >
              <Brand className="h-5 w-5" />
            </button>
          ))}
        </div>

        <SecondaryButton
          onClick={() => openLogin({ loginMethods: ["wallet"] })}
          disabled={!ready}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-container/10 text-secondary">
            <Icon name="account_balance_wallet" className="text-[18px]" />
          </span>
          Continue with wallet
        </SecondaryButton>

        <button
          type="button"
          onClick={() => openLogin()}
          disabled={!ready}
          className="mx-auto mt-1 flex h-10 items-center gap-1.5 px-3 text-label-md text-secondary transition-colors hover:text-secondary-container disabled:opacity-60"
        >
          More options
          <Icon name="expand_more" className="text-[18px]" />
        </button>
      </div>

      {(error || formError) && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-2xl bg-error-container px-3.5 py-2.5 text-body-sm text-on-error-container"
        >
          <Icon name="error" className="mt-0.5 shrink-0 text-[18px]" />
          <span>{error || formError}</span>
        </div>
      )}

      <div className="mt-auto flex items-center justify-center gap-1.5 pt-8 text-body-sm text-on-surface-variant">
        <Icon name="shield" className="text-[16px] text-tertiary" />
        <span>
          Secured by{" "}
          <span className="font-bold text-on-surface">Privy</span> · Terms & Privacy
        </span>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-56 w-[120%] -translate-x-1/2 rounded-full bg-primary-container/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-10 h-40 w-40 rounded-full bg-secondary-container/15 blur-3xl"
      />

      <header className="relative z-10 flex h-16 items-center justify-between px-space-md pt-safe">
        <Link href="/" aria-label="instant.fun home" className="transition-opacity hover:opacity-80">
          <Image
            src="/brand/logo.png"
            alt="instant.fun"
            width={120}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <Link
          href="/"
          className="flex h-9 items-center gap-1 rounded-full bg-surface-container-lowest/80 px-3 text-label-sm text-on-surface-variant shadow-soft ring-1 ring-surface-container transition-colors hover:bg-surface-container"
        >
          <Icon name="arrow_back" className="text-[16px]" />
          Home
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 flex-col">
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
    </div>
  );
}
