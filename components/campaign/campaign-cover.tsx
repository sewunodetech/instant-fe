import { RemoteImage } from "@/components/ui/remote-image";
import { campaignTag } from "@/lib/format";
import type { ApiCampaign } from "@/lib/types";

const GRADIENTS = [
  "from-secondary-container via-secondary to-on-secondary-fixed-variant",
  "from-tertiary-container via-tertiary to-on-tertiary-fixed-variant",
  "from-primary-container via-primary-fixed-dim to-secondary-container",
  "from-error-container via-secondary-container to-secondary",
];

function gradientFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

/**
 * Host-uploaded cover, else the current top snap, else a branded gradient.
 * Must be placed in a positioned, sized container.
 */
export function CampaignCover({
  campaign,
  sizes,
  priority,
  showTag = true,
}: {
  campaign: Pick<ApiCampaign, "id" | "title" | "coverImageUrl" | "topImageUrl">;
  sizes: string;
  priority?: boolean;
  showTag?: boolean;
}) {
  const src = campaign.coverImageUrl || campaign.topImageUrl;
  if (src) {
    return <RemoteImage src={src} alt="" fill priority={priority} sizes={sizes} className="object-cover" />;
  }
  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradientFor(campaign.id)} p-3`}>
      {showTag && (
        <span className="line-clamp-2 text-center text-headline-sm font-extrabold break-all text-white/90 drop-shadow">
          {campaignTag(campaign.title)}
        </span>
      )}
    </div>
  );
}
