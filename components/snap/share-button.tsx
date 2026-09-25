"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

/** Native share sheet on mobile; copies the link elsewhere. */
export function ShareButton({ title, path, className = "" }: { title: string; path?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = path ? new URL(path, window.location.origin).toString() : window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <button type="button" aria-label={copied ? "Link copied" : "Share"} onClick={share} className={className}>
      {copied ? <Check size={20} /> : <Share2 size={20} />}
    </button>
  );
}
