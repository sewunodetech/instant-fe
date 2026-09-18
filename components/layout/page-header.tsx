import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BackButton } from "@/components/layout/back-button";
import { currentUser } from "@/lib/mock-data";

type Props = {
  title: string;
  /** Extra icon buttons shown before the profile avatar. */
  actions?: ReactNode;
  backHref?: string;
};

export function PageHeader({ title, actions, backHref }: Props) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 mx-auto max-w-[430px] bg-surface/80 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-space-md">
        <div className="flex min-w-0 items-center gap-space-xs">
          <BackButton fallbackHref={backHref} />
          <h1 className="truncate pl-1 text-headline-sm tracking-tight">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-space-xs">
          {actions}
          <Link href="/profile" aria-label="Profile" className="ml-1">
            <Image
              src={currentUser.avatar}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function HeaderIconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
    >
      {children}
    </button>
  );
}
