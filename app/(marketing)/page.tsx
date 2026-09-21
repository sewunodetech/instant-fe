import { CampaignsSection } from "@/components/landing/campaigns-section";
import { CommunitySection } from "@/components/landing/community-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";
import { LeaderboardSection } from "@/components/landing/leaderboard-section";

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <LandingHero />
        <HowItWorksSection />
        <CampaignsSection />
        <LeaderboardSection />
        <CommunitySection />
      </main>
      <LandingFooter />
    </>
  );
}
