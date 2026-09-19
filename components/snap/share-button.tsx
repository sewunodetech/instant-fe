"use client";

import { Icon } from "@/components/icon";

export function ShareButton({ title, className = "" }: { title: string; className?: string }) {
  async function share() {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title, url }).catch(() => {});
    else await navigator.clipboard?.writeText(url);
  }

  return (
    <button aria-label="Share" onClick={share} className={className}>
      <Icon name="ios_share" className="text-[20px]" />
    </button>
  );
}
