"use client";

import { useEffect, useState } from "react";
import { CampaignDiscovery } from "@/components/discovery/campaign-discovery";
import { listCampaigns } from "@/lib/api-client";
import { mapApiCampaign } from "@/lib/mappers";
import { activeCampaigns, type Campaign } from "@/lib/mock-data";

export function CampaignExplorer() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(activeCampaigns);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listCampaigns({ status: "ACTIVE", limit: 40 })
      .then(({ data }) => {
        if (cancelled) return;
        if (data.length > 0) setCampaigns(data.map((c, i) => mapApiCampaign(c, i)));
      })
      .catch(() => {
        // keep mock fallback
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-6 text-label-md text-on-surface-variant shadow-soft">
        Loading campaigns...
      </div>
    );
  }

  return <CampaignDiscovery campaigns={campaigns} />;
}
