import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { getSnapsByCampaign } from "@/lib/mock-data";

export function CampaignFeed({ campaignId, tag }: { campaignId: string; tag: string }) {
  const snaps = getSnapsByCampaign(campaignId).slice(0, 6);

  return (
    <section className="rounded-3xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="mb-space-sm flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <h3 className="text-headline-sm">Campaign Feed</h3>
          <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm text-on-surface-variant">
            {snaps.length}
          </span>
        </div>
        <Link
          href={`/snap?campaign=${campaignId}`}
          className="flex items-center gap-1 text-label-md text-secondary hover:underline"
        >
          Post <Icon name="add_a_photo" className="text-[16px]" />
        </Link>
      </div>

      {snaps.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface-container-low p-6 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-highest">
            <Icon name="photo_camera" className="text-[22px] text-on-surface-variant" />
          </div>
          <p className="text-label-md">No snaps yet</p>
          <p className="text-body-sm text-on-surface-variant">Be the first to post in {tag}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {snaps.map((snap) => (
            <Link
              key={snap.id}
              href={["snap-1", "snap-2"].includes(snap.id) ? `/snaps/${snap.id}` : `/campaigns/${campaignId}`}
              className="group relative aspect-square overflow-hidden rounded-xl bg-surface-container"
            >
              <Image
                src={snap.image}
                alt={snap.imageAlt}
                fill
                sizes="(max-width: 767px) 33vw, (max-width: 1024px) 25vw, 20vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/55 to-transparent p-1.5 pt-4 text-[10px] font-bold text-white">
                <span className="flex min-w-0 items-center gap-0.5">
                  <Icon name="how_to_vote" className="text-[11px]" />
                  {snap.votes}
                </span>
                <span className="truncate">#{snap.creator.handle.slice(0, 8)}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
