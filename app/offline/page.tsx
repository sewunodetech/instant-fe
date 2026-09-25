import Link from "next/link";

export const metadata = {
  title: "Offline · instant.fun",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-2xl">
        📷
      </div>
      <h1 className="text-headline-sm text-on-surface">You&apos;re offline</h1>
      <p className="max-w-xs text-body-md text-on-surface-variant">
        instant.fun needs a connection to load fresh snaps. Reconnect and try again.
      </p>
      <Link
        href="/home"
        className="rounded-full bg-primary-container px-5 py-2.5 text-label-lg text-on-primary-fixed transition hover:brightness-105"
      >
        Retry
      </Link>
    </main>
  );
}
