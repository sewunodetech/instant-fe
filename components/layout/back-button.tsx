"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";

export function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  return (
    <button
      aria-label="Go back"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallbackHref))}
      className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface active:scale-95"
    >
      <Icon name="arrow_back" className="text-[24px]" />
    </button>
  );
}
