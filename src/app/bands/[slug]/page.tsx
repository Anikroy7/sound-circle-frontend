import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { BandProfileView } from "@/components/profile/band-profile";
import { bandProfile } from "@/demo-data/band-profile";
import { currentViewer } from "@/demo-data/session";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: bandProfile.name };

export function generateStaticParams(): { slug: string }[] {
  return [{ slug: bandProfile.slug }];
}

/** Demo: every band slug renders the one band in `demo-data` until the API exists. */
export default function BandPage(): React.JSX.Element {
  return (
    <>
      <SiteHeader activeHref={routes.band(bandProfile.slug)} viewer={currentViewer} />
      <BandProfileView band={bandProfile} />
    </>
  );
}
