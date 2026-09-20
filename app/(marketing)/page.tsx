import { ActiveCampaignsSection } from "@/components/landing/active-campaigns-section";
import { FairRewardsSection } from "@/components/landing/fair-rewards-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";
import { StatsSection } from "@/components/landing/stats-section";

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <LandingHero />
        <StatsSection />
        <HowItWorksSection />
        <ActiveCampaignsSection />
        <FairRewardsSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </>
  );
}
