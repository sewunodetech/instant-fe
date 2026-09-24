// import { CampaignsSection } from "@/components/landing/campaigns-section";
import { CommunitySection } from "@/components/landing/community-section";
import { HowItWorksAltSection } from "@/components/landing/how-it-works-alt-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";
// import { LeaderboardSection } from "@/components/landing/leaderboard-section";
import { MomentsSection } from "@/components/landing/moments-section";
import { WhatIsSection } from "@/components/landing/what-is-section";

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <LandingHero />
        <WhatIsSection />
        <HowItWorksAltSection />
        <MomentsSection />
        {/* <CampaignsSection /> */}
        {/* <LeaderboardSection /> */}
        <CommunitySection />
      </main>
      <LandingFooter />
    </>
  );
}
