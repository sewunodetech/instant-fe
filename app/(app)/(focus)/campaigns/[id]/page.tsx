import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { CampaignHeaderActions } from "@/components/campaign/campaign-header-actions";
import { CampaignFeed } from "@/components/campaign/campaign-feed";
import { HowItWorks } from "@/components/campaign/how-it-works";
import { LeaderboardTeaser } from "@/components/campaign/leaderboard-teaser";
import { PageHeader } from "@/components/layout/page-header";
import { compactNumber } from "@/lib/format";
import { getCampaign } from "@/lib/mock-data";
import { mapApiCampaign } from "@/lib/mappers";
import { CampaignService } from "@/lib/services/campaign.service";

export async function generateMetadata({ params }: PageProps<"/campaigns/[id]">) {
  const id = (await params).id;
  const mock = getCampaign(id);
  if (mock) return { title: `${mock.tag} · instant.fun` };
  try {
    const campaign = await CampaignService.findById(id);
    if (campaign) return { title: `${campaign.title} · instant.fun` };
  } catch {
    // ignore
  }
  return { title: "Campaign · instant.fun" };
}

export default async function CampaignDetailPage({ params }: PageProps<"/campaigns/[id]">) {
  const id = (await params).id;

  let campaign = getCampaign(id);
  if (!campaign) {
    try {
      const api = await CampaignService.findById(id);
      if (api) campaign = mapApiCampaign(api, 0);
    } catch {
      // fall through
    }
  }
  if (!campaign) notFound();

  const stats = [
    { icon: "group", value: compactNumber(campaign.creators), label: "Creators" },
    { icon: "hourglass_top", value: `${campaign.daysLeft} ${campaign.daysLeft === 1 ? "Day" : "Days"}`, label: "Remaining" },
    { icon: "how_to_vote", value: compactNumber(campaign.votesCast), label: "Votes Cast" },
  ];

  return (
    <>
      <PageHeader title="Campaign Detail" backHref="/home" actions={<CampaignHeaderActions tag={campaign.tag} />} />

      <main className="flex flex-1 flex-col gap-space-md px-space-md pt-20 pb-32 sm:px-0">
        <div className="relative aspect-[4/3] max-h-[min(62vh,560px)] w-full overflow-hidden rounded-3xl bg-surface-container-low shadow-md">
          <Image
            src={campaign.heroImage}
            alt={campaign.heroAlt}
            fill
            priority
            sizes="(max-width: 767px) 100vw, 720px"
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-primary-container px-3 py-1 text-label-md text-on-primary-fixed shadow-sm">
            <Icon name="tag" className="text-[14px]" />
            {campaign.tag.slice(1)}
          </span>
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full bg-tertiary-fixed px-3 py-1.5 text-label-md text-on-tertiary-fixed shadow-sm">
              <Icon name="emoji_events" className="text-[15px]" /> {campaign.poolUsdc} USDC Prize Pool
            </span>
            {campaign.live && (
              <span className="flex items-center gap-1 rounded-full bg-surface-container-lowest/90 px-2.5 py-1 text-label-sm backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-tertiary" />
                Live Now
              </span>
            )}
          </div>
        </div>

        <section className="rounded-3xl bg-surface-container-lowest p-space-md shadow-sm">
          <div className="mb-space-xs flex items-center justify-between gap-2">
            <h2 className="text-headline-lg-mobile">{campaign.tag}</h2>
            <span className="shrink-0 rounded-full bg-secondary-fixed px-2.5 py-0.5 text-label-sm text-on-secondary-fixed">
              {campaign.kind}
            </span>
          </div>
          <p className="mb-space-md leading-relaxed text-on-surface-variant">{campaign.description}</p>
          <dl className="grid grid-cols-3 gap-space-xs pt-space-xs">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center rounded-2xl bg-surface-container-low p-2.5 text-center">
                <Icon name={s.icon} className="mb-0.5 text-[20px] text-secondary" />
                <dt className="order-last text-label-sm text-on-surface-variant">{s.label}</dt>
                <dd className="text-headline-sm leading-tight tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <HowItWorks />
        <CampaignFeed campaignId={campaign.id} tag={campaign.tag} />
        <LeaderboardTeaser campaign={campaign} />
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-container/50 bg-surface/90 p-space-md pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] backdrop-blur-xl">
        <div className="app-shell mx-auto">
          <Link
            href={`/snap?campaign=${campaign.id}`}
            className="flex h-14 w-full items-center justify-center gap-space-sm rounded-full bg-primary-container text-headline-sm text-on-primary-fixed shadow-lg transition-all hover:brightness-105 active:scale-[0.98]"
          >
            <Icon name="photo_camera" className="text-[24px]" />
            Join Campaign &amp; Snap
          </Link>
        </div>
      </div>
    </>
  );
}
