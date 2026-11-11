import { BrowseSection } from "@/components/landing/browse-section";
import { CtaBanner } from "@/components/landing/cta-banner";
import { FeaturedMusicians } from "@/components/landing/featured-musicians";
import { GenreTicker } from "@/components/landing/genre-ticker";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { RecentlyJoined } from "@/components/landing/recently-joined";
import { SiteFooter } from "@/components/landing/site-footer";
import { TrendingBands } from "@/components/landing/trending-bands";
import { SiteHeader } from "@/components/layout/site-header";
import { routes } from "@/lib/routes";

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <SiteHeader activeHref={routes.home} />
      <main>
        <Hero />
        <GenreTicker />
        <BrowseSection />
        <FeaturedMusicians />
        <HowItWorks />
        <TrendingBands />
        <RecentlyJoined />
        <CtaBanner />
      </main>
      <SiteFooter />
    </>
  );
}
