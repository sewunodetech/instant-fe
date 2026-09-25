import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CampaignExplorer } from "@/components/discovery/campaign-explorer";
import { ScreenHeader } from "@/components/layout/screen-header";

export const metadata: Metadata = { title: "Explore" };

export default function CampaignsPage() {
  return (
    <>
      <ScreenHeader
        title="Explore"
        subtitle="Pick a challenge, snap, get voted."
        actions={
          <Link
            href="/create"
            className="flex h-11 items-center gap-1.5 rounded-full bg-secondary-container px-4 text-label-md font-bold text-on-secondary shadow-pop-blue transition-transform active:scale-95"
          >
            <Plus size={18} />
            Host
          </Link>
        }
      />
      <div className="flex flex-col gap-4 px-4 pt-2">
        <CampaignExplorer />
      </div>
    </>
  );
}
