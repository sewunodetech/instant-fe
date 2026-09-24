"use client";

import { Share2 } from "lucide-react";

export function ShareButton({ title, className = "" }: { title: string; className?: string }) {
  async function share() {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title, url }).catch(() => {});
    else await navigator.clipboard?.writeText(url);
  }

  return (
    <button aria-label="Share" onClick={share} className={className}>
      <Share2 size={20} />
    </button>
  );
}
