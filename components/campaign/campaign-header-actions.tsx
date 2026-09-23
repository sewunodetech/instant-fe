"use client";

import { useState } from "react";
import { Bookmark, Share2 } from "lucide-react";
import { HeaderIconButton } from "@/components/layout/page-header";

export function CampaignHeaderActions({ tag }: { tag: string }) {
  const [saved, setSaved] = useState(false);

  async function share() {
    const data = { title: `${tag} on instant.fun`, url: window.location.href };
    if (navigator.share) {
      await navigator.share(data).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(data.url);
    }
  }

  return (
    <>
      <HeaderIconButton label={saved ? "Remove bookmark" : "Bookmark campaign"} onClick={() => setSaved((s) => !s)}>
        <Bookmark size={24} fill={saved ? "currentColor" : "none"} className={saved ? "text-secondary" : ""} />
      </HeaderIconButton>
      <HeaderIconButton label="Share campaign" onClick={share}>
        <Share2 size={24} />
      </HeaderIconButton>
    </>
  );
}
