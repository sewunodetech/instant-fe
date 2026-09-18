"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
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
        <Icon name="bookmark" filled={saved} className={`text-[24px] ${saved ? "text-secondary" : ""}`} />
      </HeaderIconButton>
      <HeaderIconButton label="Share campaign" onClick={share}>
        <Icon name="share" className="text-[24px]" />
      </HeaderIconButton>
    </>
  );
}
